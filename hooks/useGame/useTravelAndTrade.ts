import { useCallback } from 'react';
import { 评估旅行可行性, 执行旅行, 执行探索 } from './travel/travelWorkflow';
import { 执行购买, 执行出售, 计算购买价格, 计算出售价格, 出售结果 } from './travel/tradeWorkflow';
import { 执行锻造, 计算锻造成功率, 检查锻造材料, 锻造配方库, 获取可锻造配方, 材料检查结果 } from './forgeWorkflow';
import type { 地图结构, 建筑结构 } from '../../models/world';
import type { 游戏物品 } from '../../models/item';
import type { 角色数据结构, 环境信息结构, 游戏设置结构, 聊天记录结构 } from '../../types';
import type { NPC结构 } from '../../models/social';
import { useGameStore } from './subsystems/zustandStore';

interface TravelAndTradeDeps {
    角色: 角色数据结构 | null;
    环境: 环境信息结构 | null;
    设置角色: React.Dispatch<React.SetStateAction<角色数据结构 | null>>;
    设置环境: React.Dispatch<React.SetStateAction<环境信息结构 | null>>;
    gameConfig: 游戏设置结构 | null;
    currentEra: number;
    设置历史记录: (updater: (prev: 聊天记录结构[]) => 聊天记录结构[]) => void;
}

export function useTravelAndTrade(deps: TravelAndTradeDeps) {
    const { 角色, 环境, 设置角色, 设置环境, gameConfig, currentEra, 设置历史记录 } = deps;

    // 旅行系统 — Zustand managed
    const 旅行事件列表 = useGameStore(s => s.旅行事件列表);
    const 设置旅行事件列表 = useGameStore(s => s.设置旅行事件列表);

    const handleTravel = useCallback((目标地图: 地图结构, 目标建筑: 建筑结构 | null) => {
        const 当前位置 = { 大地点: 环境?.大地点 || '', 中地点: 环境?.中地点 || '', 小地点: 环境?.小地点 || '' };
        const 可行性 = 评估旅行可行性(角色, 当前位置, 目标地图);
        if (!可行性.可行) {
            return;
        }

        // 清除旧旅行事件
        设置旅行事件列表([]);

        const 结果 = 执行旅行(角色, 环境, 目标地图, 目标建筑);
        if (结果.成功) {
            设置环境(结果.新环境);
            设置旅行事件列表(结果.事件);
            // 旅行事件注入主叙事流
            const 事件描述 = 结果.事件.map(e => e.描述).join('\n');
            if (事件描述) {
                const 系统消息: 聊天记录结构 = {
                    role: 'system',
                    content: `[旅行] 从${环境?.具体地点 || '原处'}前往「${目标地图.名称}」。\n${事件描述}`,
                    timestamp: Date.now()
                };
                设置历史记录((prev: 聊天记录结构[]) => [...prev, 系统消息]);
            }
        }
    }, [角色, 环境, 设置环境, 设置旅行事件列表, 设置历史记录]);

    const handleExplore = useCallback((目标建筑: 建筑结构) => {
        const 结果 = 执行探索(环境, 目标建筑);
        if (结果.成功) {
            设置环境((prev) => ({ ...prev, 时间: 结果.新时间 || prev.时间, 具体地点: 目标建筑.名称 }));
        }
    }, [环境, 设置环境]);

    // 交易系统
    const handleBuyItem = useCallback((物品: 游戏物品, 卖家NPC: NPC结构 | null) => {
        const 价格 = 计算购买价格(物品, 卖家NPC);
        const 结果 = 执行购买(角色.金钱, 角色.物品列表, 物品, 价格);
        if (结果.成功) {
            设置角色((prev) => ({ ...prev, 金钱: 结果.新金钱, 物品列表: 结果.新物品列表 as typeof prev.物品列表 }));
        }
        return 结果;
    }, [角色, 设置角色]);

    const handleSellItem = useCallback((物品ID: string) => {
        const 物品 = 角色.物品列表.find(i => i.ID === 物品ID);
        if (!物品) {
            return { 成功: false, 新金钱: 角色.金钱, 新物品列表: 角色.物品列表, 错误: '物品不存在' } as 出售结果;
        }
        const 价格 = 计算出售价格(物品, null);
        const 结果 = 执行出售(角色.金钱, 角色.物品列表, 物品ID, 价格);
        if (结果.成功) {
            设置角色((prev) => ({ ...prev, 金钱: 结果.新金钱, 物品列表: 结果.新物品列表 as typeof prev.物品列表 }));
        }
        return 结果;
    }, [角色, 设置角色]);

    // 锻造系统
    const handleForgeItem = useCallback((配方ID: string) => {
        const 结果 = 执行锻造(配方ID, 角色);
        if (结果.成功 && 结果.产物) {
            设置角色((prev) => ({
                ...prev,
                物品列表: [...prev.物品列表, 结果.产物 as typeof prev.物品列表[number]],
                当前经验: 结果.经验获得
                    ? prev.当前经验 + 结果.经验获得
                    : prev.当前经验,
            }));
        }
        return 结果;
    }, [角色, 设置角色]);

    const getForgeRecipes = useCallback(() => {
        return 获取可锻造配方(角色);
    }, [角色]);

    const checkForgeMaterials = useCallback((配方ID: string): 材料检查结果 | null => {
        const 配方 = 锻造配方库.find(p => p.ID === 配方ID);
        if (!配方) return null;
        return 检查锻造材料(配方, 角色.物品列表);
    }, [角色]);

    const getForgeSuccessRate = useCallback((配方ID: string): number => {
        const 配方 = 锻造配方库.find(p => p.ID === 配方ID);
        if (!配方) return 0;
        return 计算锻造成功率(配方, 角色);
    }, [角色]);

    return {
        handleTravel,
        handleExplore,
        handleBuyItem,
        handleSellItem,
        handleForgeItem,
        getForgeRecipes,
        checkForgeMaterials,
        getForgeSuccessRate,
        旅行事件列表,
    };
}
