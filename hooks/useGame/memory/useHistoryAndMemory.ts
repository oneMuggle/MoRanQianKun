/** 历史与记忆子系统 Hook */

import { useCallback, useEffect, useRef, useState } from 'react';
import type {
    GameResponse,
    聊天记录结构,
    记忆系统结构,
    NPC结构,
    接口设置结构,
    视觉设置结构
} from '../../../types';
import type { 场景图片档案 } from '../../../models/image';
import { 创建记忆总结处理器, type NPC记忆总结任务结构, type 记忆总结阶段类型 } from '../memory/memorySummaryHandlers';
import type { 记忆压缩任务结构 } from '../memory/memoryUtils';
import { 创建历史回合工作流 } from '../time/historyTurnWorkflow';

type 回合快照结构 = {
    玩家输入: string;
    游戏时间: string;
    回档前状态: {
        角色: any;
        环境: any;
        社交: any[];
        世界: any;
        战斗: any;
        玩家门派: any;
        任务列表: any[];
        约定列表: any[];
        剧情: any;
        女主剧情规划?: any;
        记忆系统: 记忆系统结构;
    };
    回档前历史: 聊天记录结构[];
};

type UseHistoryAndMemoryOptions = {
    // Core state
    社交: NPC结构[];
    设置社交: (v: NPC结构[]) => void;
    记忆系统: 记忆系统结构;
    设置记忆系统: (v: 记忆系统结构) => void;
    历史记录: 聊天记录结构[];
    设置历史记录: (v: 聊天记录结构[]) => void;
    memoryConfig: any;
    apiConfig: 接口设置结构;
    loading: boolean;
    变量生成中: boolean;

    // Snapshot & rollback
    回合快照栈Ref: React.MutableRefObject<回合快照结构[]>;
    回档到快照: (snapshot: 回合快照结构, options?: { 保留图片状态?: boolean }) => void;
    弹出重Roll快照: () => 回合快照结构 | null;
    删除最近自动存档并重置状态: () => Promise<void>;

    // Utilities
    深拷贝: <T>(value: T) => T;
    环境时间转标准串: (env: any) => string;
    规范化记忆配置: (raw?: any) => any;
    规范化记忆系统: (raw?: any) => 记忆系统结构;
    规范化社交列表: (list: any[], options?: { 合并同名?: boolean; eraId?: string | null }) => any[];
    规范化视觉设置: (raw?: any) => any;
    规范化场景图片档案: (raw?: any) => 场景图片档案;
    normalizeCanonicalGameTime: (input?: string) => string;
    构建即时记忆条目: (gameTime: string, playerInput: string, aiData: any, options?: { 省略玩家输入?: boolean }) => any;
    构建短期记忆条目: (gameTime: string, aiData: any) => any;
    写入四段记忆: (memory: 记忆系统结构, immediateEntry: any, shortEntry: any, options: any) => 记忆系统结构;
    估算AI输出Token: (rawText: string) => number;
    提取解析失败原始信息: (error: any) => string;
    提取原始报错详情: (error: any) => string;
    构建标签解析选项: (config: any) => any;
    parseStoryRawText: (rawText: string, options: any) => GameResponse;
    执行正文润色: (response: GameResponse, rawSource: string, options?: { manual?: boolean; playerInput?: string }) => Promise<{ applied: boolean; response: GameResponse; error?: string }>;
    规范化游戏设置: (raw?: any) => any;
    processResponseCommands: (response: GameResponse, baseState?: any, options?: { applyState?: boolean }) => any;
    按世界演变分流净化响应: (response: GameResponse, enabled: boolean) => { response: GameResponse };
    世界演变功能已开启: () => boolean;
    应用并同步记忆系统: (memory: 记忆系统结构, options?: { 静默总结提示?: boolean }) => void;
    performAutoSave: (snapshot?: any) => Promise<void>;
    设置剧情: (v: any) => void;
    设置玩家门派: (v: any) => void;
    设置任务列表: (v: any[]) => void;
    设置约定列表: (v: any[]) => void;
    记录变量生成上下文: (params: { playerInput: string; response: any }) => void;
    set聊天区自动滚动抑制令牌: (v: React.SetStateAction<number>) => void;
    获取NPC唯一标识: (npc: any, index?: number) => string;
    合并NPC图片档案: (baseNpc: any, latestNpc: any) => any;
    获取开局配置: () => any;

    // Refs
    visualConfig: 视觉设置结构;
    visualConfigRef: React.MutableRefObject<视觉设置结构>;
    场景图片档案Ref: React.MutableRefObject<场景图片档案>;
    scrollRef: React.MutableRefObject<any>;
    gameConfig: any;
    prompts: any[];
    内置提示词列表: any[];
    世界书列表: any[];

    // Variable generation cross-reference
    获取变量生成状态?: () => { running: boolean; pending: number; runningCount: number };
};

export const useHistoryAndMemory = (options: UseHistoryAndMemoryOptions) => {
    const {
        社交, 设置社交,
        记忆系统, 设置记忆系统,
        历史记录, 设置历史记录,
        memoryConfig, apiConfig,
        loading, 变量生成中,
        回合快照栈Ref,
        回档到快照, 弹出重Roll快照, 删除最近自动存档并重置状态,
        深拷贝, 环境时间转标准串,
        规范化记忆配置, 规范化记忆系统, 规范化社交列表,
        规范化视觉设置, 规范化场景图片档案,
        normalizeCanonicalGameTime,
        构建即时记忆条目, 构建短期记忆条目, 写入四段记忆,
        估算AI输出Token, 提取解析失败原始信息, 提取原始报错详情,
        构建标签解析选项, parseStoryRawText, 执行正文润色,
        规范化游戏设置, processResponseCommands,
        按世界演变分流净化响应, 世界演变功能已开启,
        应用并同步记忆系统, performAutoSave,
        设置剧情, 设置玩家门派, 设置任务列表, 设置约定列表,
        记录变量生成上下文, set聊天区自动滚动抑制令牌,
        获取NPC唯一标识, 合并NPC图片档案, 获取开局配置,
        visualConfig, visualConfigRef, 场景图片档案Ref, scrollRef,
        gameConfig, prompts, 内置提示词列表, 世界书列表,
        获取变量生成状态,
    } = options;

    // === Memory Summary State ===
    const [待处理记忆总结任务, set待处理记忆总结任务] = useState<记忆压缩任务结构 | null>(null);
    const [记忆总结阶段, set记忆总结阶段] = useState<记忆总结阶段类型>('idle');
    const [记忆总结草稿, set记忆总结草稿] = useState('');
    const [记忆总结错误, set记忆总结错误] = useState('');
    const [待处理NPC记忆总结队列, set待处理NPC记忆总结队列] = useState<NPC记忆总结任务结构[]>([]);
    const [NPC记忆总结阶段, setNPC记忆总结阶段] = useState<记忆总结阶段类型>('idle');
    const [NPC记忆总结草稿, setNPC记忆总结草稿] = useState('');
    const [NPC记忆总结错误, setNPC记忆总结错误] = useState('');

    // === Memory Summary Processor ===
    const 记忆总结处理器 = 创建记忆总结处理器({
        待处理记忆总结任务,
        set待处理记忆总结任务,
        记忆总结阶段,
        set记忆总结阶段,
        记忆总结草稿,
        set记忆总结草稿,
        记忆总结错误,
        set记忆总结错误,
        待处理NPC记忆总结队列,
        set待处理NPC记忆总结队列,
        NPC记忆总结阶段,
        setNPC记忆总结阶段,
        NPC记忆总结草稿,
        setNPC记忆总结草稿,
        NPC记忆总结错误,
        setNPC记忆总结错误,
        社交,
        设置社交,
        记忆系统,
        设置记忆系统,
        memoryConfig,
        apiConfig,
        历史记录,
        performAutoSave: (...args) => performAutoSave(...args),
        规范化社交列表
    });
    const {
        构建记忆总结用户提示词,
        清理记忆总结输出,
        handleStartMemorySummary,
        handleCancelMemorySummary,
        handleBackToMemorySummaryRemind,
        handleUpdateMemorySummaryDraft,
        handleStartManualMemorySummary,
        handleApplyMemorySummary,
        构建NPC记忆总结任务,
        构建NPC记忆总结用户提示词,
        清空NPC记忆总结流程,
        刷新NPC记忆总结队列,
        应用并同步社交列表,
        清空记忆总结流程,
        清空后台记忆总结流程,
        刷新记忆总结任务,
        应用并同步记忆系统: 记忆处理器_应用并同步记忆系统,
        handleStartNpcMemorySummary,
        handleCancelNpcMemorySummary,
        handleBackToNpcMemorySummaryRemind,
        handleUpdateNpcMemorySummaryDraft,
        handleQueueManualNpcMemorySummary,
        handleApplyNpcMemorySummary
    } = 记忆总结处理器;

    // === NPC Memory Summary Queue Refresh ===
    useEffect(() => {
        刷新NPC记忆总结队列(Array.isArray(社交) ? 社交 : [], { 静默: NPC记忆总结阶段 === 'processing' || NPC记忆总结阶段 === 'review' });
    }, [社交, memoryConfig]);

    // === History Turn Workflow ===
    let 执行重解析变量生成委托 = async (params: {
        snapshot: 回合快照结构;
        playerInput: string;
        parsedResponse: GameResponse;
    }): Promise<GameResponse> => params.parsedResponse;

    const {
        使用快照重建解析回合,
        updateHistoryItem,
        handleRegenerate,
        handleRecoverFromParseErrorRaw,
        handlePolishTurn
    } = 创建历史回合工作流({
        历史记录,
        记忆系统,
        memoryConfig,
        gameConfig,
        prompts,
        内置提示词列表,
        世界书列表,
        loading,
        变量生成中,
        记忆总结阶段,
        社交,
        visualConfig,
        visualConfigRef,
        场景图片档案Ref,
        scrollRef,
        获取最新快照: () => 回合快照栈Ref.current[回合快照栈Ref.current.length - 1] || null,
        回档到快照,
        弹出重Roll快照,
        删除最近自动存档并重置状态,
        深拷贝,
        环境时间转标准串,
        获取开局配置,
        规范化记忆配置,
        规范化记忆系统,
        规范化社交列表,
        规范化视觉设置,
        规范化场景图片档案,
        normalizeCanonicalGameTime,
        构建即时记忆条目,
        构建短期记忆条目,
        写入四段记忆,
        估算AI输出Token,
        提取解析失败原始信息,
        提取原始报错详情,
        构建标签解析选项,
        parseStoryRawText,
        执行正文润色,
        规范化游戏设置,
        processResponseCommands,
        按世界演变分流净化响应,
        世界演变功能已开启,
        执行重解析变量生成: (params) => 执行重解析变量生成委托(params),
        应用并同步记忆系统,
        清空后台记忆总结流程,
        performAutoSave: (...args) => performAutoSave(...args),
        设置剧情,
        设置历史记录,
        设置玩家门派,
        设置任务列表,
        设置约定列表,
        设置社交,
        记录变量生成上下文,
        set聊天区自动滚动抑制令牌,
        获取NPC唯一标识,
        合并NPC图片档案
    });

    return {
        // State
        待处理记忆总结任务,
        记忆总结阶段,
        记忆总结草稿,
        记忆总结错误,
        待处理NPC记忆总结队列,
        NPC记忆总结阶段,
        NPC记忆总结草稿,
        NPC记忆总结错误,

        // Memory summary functions
        构建记忆总结用户提示词,
        清理记忆总结输出,
        handleStartMemorySummary,
        handleCancelMemorySummary,
        handleBackToMemorySummaryRemind,
        handleUpdateMemorySummaryDraft,
        handleStartManualMemorySummary,
        handleApplyMemorySummary,
        构建NPC记忆总结任务,
        构建NPC记忆总结用户提示词,
        清空NPC记忆总结流程,
        刷新NPC记忆总结队列,
        应用并同步社交列表,
        清空记忆总结流程,
        刷新记忆总结任务,
        handleStartNpcMemorySummary,
        handleCancelNpcMemorySummary,
        handleBackToNpcMemorySummaryRemind,
        handleUpdateNpcMemorySummaryDraft,
        handleQueueManualNpcMemorySummary,
        handleApplyNpcMemorySummary,

        // History turn functions
        使用快照重建解析回合,
        updateHistoryItem,
        handleRegenerate,
        handleRecoverFromParseErrorRaw,
        handlePolishTurn,

        // Delegate setter for variable generation re-parse
        set执行重解析变量生成委托: (fn: typeof 执行重解析变量生成委托) => {
            执行重解析变量生成委托 = fn;
        }
    };
};
