import { useCallback } from 'react';
import { 规范化接口设置 } from '../../utils/apiConfig';
import { 执行正文润色 as 执行正文润色工作流 } from './opening/bodyPolish';
import {
    规范化剧情规划状态 as 基础规范化剧情规划状态,
    规范化女主剧情规划状态 as 基础规范化女主剧情规划状态,
    规范化同人剧情规划状态 as 基础规范化同人剧情规划状态,
    规范化同人女主剧情规划状态 as 基础规范化同人女主剧情规划状态,
    创建空剧情规划,
    创建空记忆系统
} from './storyState';
import { 规范化社交列表 } from './stateTransforms';
import type {
    接口设置结构,
    游戏设置结构,
    提示词结构,
    环境信息结构,
    战斗状态结构,
    角色数据结构,
    剧情系统结构,
    剧情规划结构,
    女主剧情规划结构,
    同人剧情规划结构,
    同人女主剧情规划结构,
    记忆系统结构,
    GameResponse
} from '../../types';

interface FeatureFlagsDeps {
    apiConfig: 接口设置结构;
    gameConfig: 游戏设置结构;
    历史记录: any[];
    环境: 环境信息结构;
    剧情: 剧情系统结构;
    社交: any[];
    战斗: 战斗状态结构;
    角色: 角色数据结构;
    prompts: 提示词结构[];
    设置角色: (value: 角色数据结构) => void;
    设置环境: (value: 环境信息结构) => void;
    设置游戏初始时间: (value: string) => void;
    设置社交: (value: any[]) => void;
    设置世界: (value: any) => void;
    设置战斗: (value: 战斗状态结构) => void;
    设置玩家门派: (value: any) => void;
    设置任务列表: (value: any[]) => void;
    设置约定列表: (value: any[]) => void;
    设置剧情: (value: 剧情系统结构) => void;
    设置剧情规划: (value: 剧情规划结构) => void;
    设置女主剧情规划: (value: 女主剧情规划结构) => void;
    设置同人剧情规划: (value: 同人剧情规划结构 | undefined) => void;
    设置同人女主剧情规划: (value: 同人女主剧情规划结构 | undefined) => void;
    应用并同步记忆系统: (memory: 记忆系统结构, options?: { 静默总结提示?: boolean }) => void;
    设置历史记录: (value: any[] | ((prev: any[]) => any[])) => void;
    设置校规系统: (value: any) => void;
    设置催眠系统: (value: any) => void;
    清空变量生成上下文缓存: () => void;
    setWorldEvents: (value: any[]) => void;
    规范化剧情状态: (raw?: any, envLike?: any) => 剧情系统结构;
    规范化角色物品容器映射: (raw?: any) => 角色数据结构;
    规范化环境信息: (envLike?: any) => 环境信息结构;
    深拷贝: <T>(data: T) => T;
}

export function useFeatureFlags(deps: FeatureFlagsDeps) {
    const 世界演变功能已开启 = useCallback((): boolean => {
        const feature = 规范化接口设置(deps.apiConfig).功能模型占位;
        return Boolean(
            feature?.世界演变独立模型开关
            && typeof feature?.世界演变使用模型 === 'string'
            && feature.世界演变使用模型.trim().length > 0
        );
    }, [deps.apiConfig]);

    const 文章优化功能已开启 = useCallback((): boolean => {
        const feature = 规范化接口设置(deps.apiConfig).功能模型占位;
        return Boolean(
            feature?.文章优化独立模型开关
            && typeof feature?.文章优化使用模型 === 'string'
            && feature.文章优化使用模型.trim().length > 0
        );
    }, [deps.apiConfig]);

    const 已进入主剧情回合 = useCallback((): boolean => {
        return Array.isArray(deps.历史记录)
            && deps.历史记录.some(item => item?.role === 'user' && typeof item?.content === 'string' && item.content.trim().length > 0);
    }, [deps.历史记录]);

    const 执行正文润色 = async (
        baseResponse: GameResponse,
        rawText: string,
        options?: { manual?: boolean; playerInput?: string }
    ): Promise<{ response: GameResponse; applied: boolean; error?: string; rawText?: string }> => 执行正文润色工作流(
        baseResponse,
        rawText,
        {
            apiConfig: deps.apiConfig,
            gameConfig: deps.gameConfig,
            prompts: deps.prompts,
            环境: deps.环境,
            剧情: deps.剧情,
            社交: deps.社交,
            战斗: deps.战斗,
            角色: deps.角色,
            文章优化已开启: 文章优化功能已开启(),
            深拷贝: deps.深拷贝
        },
        options
    );

    const 规范化剧情规划状态 = useCallback((raw?: any): 剧情规划结构 => 基础规范化剧情规划状态(raw), []);
    const 规范化女主剧情规划状态 = useCallback((raw?: any): 女主剧情规划结构 | undefined => 基础规范化女主剧情规划状态(raw), []);
    const 规范化同人剧情规划状态 = useCallback((raw?: any): 同人剧情规划结构 | undefined => 基础规范化同人剧情规划状态(raw), []);
    const 规范化同人女主剧情规划状态 = useCallback((raw?: any): 同人女主剧情规划结构 | undefined => 基础规范化同人女主剧情规划状态(raw), []);

    const 规范化社交列表安全 = useCallback((raw?: any[], options?: { 合并同名?: boolean }) => {
        const list = Array.isArray(raw) ? raw : [];
        return 规范化社交列表(list, options);
    }, []);

    const 应用开场基态 = useCallback((openingBase: {
        角色: any;
        环境: any;
        游戏初始时间?: string;
        社交: any[];
        世界: any;
        战斗: any;
        玩家门派: any;
        任务列表?: any[];
        约定列表?: any[];
        剧情: any;
        剧情规划?: any;
        女主剧情规划?: any;
        同人剧情规划?: any;
        同人女主剧情规划?: any;
    }) => {
        deps.设置角色(deps.规范化角色物品容器映射(openingBase.角色));
        deps.设置环境(deps.规范化环境信息(openingBase.环境));
        deps.设置游戏初始时间(openingBase.游戏初始时间 || '');
        deps.设置社交(规范化社交列表(openingBase.社交));
        deps.设置世界(openingBase.世界);
        deps.设置战斗(openingBase.战斗);
        deps.设置玩家门派(openingBase.玩家门派);
        deps.设置任务列表(openingBase.任务列表 || []);
        deps.设置约定列表(openingBase.约定列表 || []);
        deps.设置剧情(deps.规范化剧情状态(openingBase.剧情));
        deps.设置剧情规划(规范化剧情规划状态(openingBase.剧情规划 || 创建空剧情规划()));
        deps.设置女主剧情规划(openingBase.女主剧情规划);
        deps.设置同人剧情规划(openingBase.同人剧情规划);
        deps.设置同人女主剧情规划(openingBase.同人女主剧情规划);
        deps.应用并同步记忆系统(创建空记忆系统(), { 静默总结提示: true });
        deps.设置历史记录([]);
        deps.设置校规系统({ 校规列表: [], 影响日志: [] });
        deps.设置催眠系统({ 催眠记录列表: [], app等级: { 当前等级: 1, 已使用次数: 0, 升级阈值: 5, 解锁能力: [] }, 累计使用次数: 0 });
        deps.清空变量生成上下文缓存();
        deps.setWorldEvents([]);
    }, [
        deps.设置角色,
        deps.规范化角色物品容器映射,
        deps.设置环境,
        deps.规范化环境信息,
        deps.设置游戏初始时间,
        deps.设置社交,
        deps.设置世界,
        deps.设置战斗,
        deps.设置玩家门派,
        deps.设置任务列表,
        deps.设置约定列表,
        deps.设置剧情,
        deps.规范化剧情状态,
        deps.设置剧情规划,
        deps.设置女主剧情规划,
        deps.设置同人剧情规划,
        deps.设置同人女主剧情规划,
        deps.应用并同步记忆系统,
        deps.设置历史记录,
        deps.设置校规系统,
        deps.设置催眠系统,
        deps.清空变量生成上下文缓存,
        deps.setWorldEvents
    ]);

    return {
        世界演变功能已开启,
        文章优化功能已开启,
        已进入主剧情回合,
        执行正文润色,
        规范化剧情规划状态,
        规范化女主剧情规划状态,
        规范化同人剧情规划状态,
        规范化同人女主剧情规划状态,
        规范化社交列表安全,
        应用开场基态,
    };
}
