// hooks/useGame/subsystems/useTravelSlice.ts
// 旅行与交易 slice — Zustand 就绪 { state, actions } 模式

import { useCallback, useState } from 'react';
import type { 地图结构, 建筑结构 } from '../../../models/world';
import type { 游戏物品 } from '../../../models/item';
import type { NPC结构 } from '../../../types';
import { 评估旅行可行性, 执行旅行, 执行探索 } from '../travel/travelWorkflow';
import { 执行购买, 执行出售, 计算购买价格, 计算出售价格, 出售结果 } from '../travel/tradeWorkflow';

export interface TravelSliceState {
    旅行事件列表: any[];
}

export interface TravelSliceActions {
    handleTravel: (目标地图: 地图结构, 目标建筑: 建筑结构 | null) => void;
    handleExplore: (目标建筑: 建筑结构) => void;
    handleBuyItem: (物品: 游戏物品, 卖家NPC: NPC结构 | null) => any;
    handleSellItem: (物品ID: string) => 出售结果;
}

type TravelSliceContext = {
    角色: any;
    环境: any;
    设置角色: React.Dispatch<React.SetStateAction<any>>;
    设置环境: React.Dispatch<React.SetStateAction<any>>;
};

export function useTravelSlice(ctx: TravelSliceContext): { state: TravelSliceState; actions: TravelSliceActions } {
    const [旅行事件列表, set旅行事件列表] = useState<any[]>([]);

    const handleTravel = useCallback((目标地图: 地图结构, 目标建筑: 建筑结构 | null) => {
        const 当前位置 = { 大地点: ctx.环境?.大地点 || '', 中地点: ctx.环境?.中地点 || '', 小地点: ctx.环境?.小地点 || '' };
        const 可行性 = 评估旅行可行性(ctx.角色, 当前位置, 目标地图);
        if (!可行性.可行) return;
        const 结果 = 执行旅行(ctx.角色, ctx.环境, 目标地图, 目标建筑);
        if (结果.成功) {
            ctx.设置环境(结果.新环境);
            set旅行事件列表(结果.事件);
        }
    }, [ctx.角色, ctx.环境, ctx.设置环境]);

    const handleExplore = useCallback((目标建筑: 建筑结构) => {
        const 结果 = 执行探索(ctx.环境, 目标建筑);
        if (结果.成功) {
            ctx.设置环境((prev) => ({ ...prev, 时间: 结果.新时间 || prev.时间, 具体地点: 目标建筑.名称 }));
        }
    }, [ctx.环境, ctx.设置环境]);

    const handleBuyItem = useCallback((物品: 游戏物品, 卖家NPC: NPC结构 | null) => {
        const 价格 = 计算购买价格(物品, 卖家NPC);
        const 结果 = 执行购买(ctx.角色.金钱, ctx.角色.物品列表, 物品, 价格);
        if (结果.成功) {
            ctx.设置角色((prev) => ({ ...prev, 金钱: 结果.新金钱, 物品列表: 结果.新物品列表 as typeof prev.物品列表 }));
        }
        return 结果;
    }, [ctx.角色, ctx.设置角色]);

    const handleSellItem = useCallback((物品ID: string): 出售结果 => {
        const 物品 = ctx.角色.物品列表.find((i: any) => i.ID === 物品ID);
        if (!物品) {
            return { 成功: false, 新金钱: ctx.角色.金钱, 新物品列表: ctx.角色.物品列表, 错误: '物品不存在' } as 出售结果;
        }
        const 价格 = 计算出售价格(物品, null);
        const 结果 = 执行出售(ctx.角色.金钱, ctx.角色.物品列表, 物品ID, 价格);
        if (结果.成功) {
            ctx.设置角色((prev) => ({ ...prev, 金钱: 结果.新金钱, 物品列表: 结果.新物品列表 as typeof prev.物品列表 }));
        }
        return 结果;
    }, [ctx.角色, ctx.设置角色]);

    return {
        state: { 旅行事件列表 },
        actions: { handleTravel, handleExplore, handleBuyItem, handleSellItem },
    };
}
