import { useState, useRef } from 'react';
import { 执行世界演变更新工作流 } from '../world/worldEvolutionWorkflow';
import { 创建规划更新工作流 } from '../planning/planningUpdateWorkflow';
import { useWorldEvolutionControl } from '../world/worldEvolutionControl';
import { 创建运行时变量工作流 } from '../planning/runtimeVariableWorkflow';
import { 创建变量校准协调器 as 创建变量生成协调器 } from '../planning/variableCalibrationCoordinator';
import { 创建变量生成进度系统 } from '../planning/variableGenerationProgress';
import { 创建变量生成队列调度器 } from '../planning/variableGenerationQueue';
import { 合并变量校准结果到响应 as 合并变量生成结果到响应 } from '../planning/variableCalibrationMerge';
import { 变量校准功能已启用 as 变量生成功能已启用, 获取变量计算接口配置, 接口配置是否可用, 获取变量生成并发配置 } from '../../../utils/apiConfig';

// ==================== 世界演变与规划自定义 Hook ====================

/** 从 useGame.ts 提取的世界演变、规划、变量生成、运行时变量相关逻辑 */
export const useWorldAndPlanning = (deps: {
    // Core state
    view: string;
    loading: boolean;
    apiConfig: any;
    gameConfig: any;
    角色: any;
    环境: any;
    社交: any[] | null;
    世界: any;
    世界演变更新中: boolean;
    战斗: any;
    玩家门派: any;
    任务列表: any[];
    约定列表: any[];
    剧情: any;
    剧情规划: any;
    女主剧情规划: any;
    同人剧情规划: any;
    同人女主剧情规划: any;
    开局配置: any;
    prompts: any[];
    记忆系统: any;
    历史记录: any[];
    内置提示词列表: any[];
    worldbooks: any[];

    // Parent state setters
    设置角色: (fn: any) => void;
    设置环境: (fn: any) => void;
    设置社交: (fn: any) => void;
    设置世界: (fn: any) => void;
    设置战斗: (fn: any) => void;
    设置剧情: (fn: any) => void;
    设置剧情规划: (fn: any) => void;
    设置女主剧情规划: (fn: any) => void;
    设置同人剧情规划: (fn: any) => void;
    设置同人女主剧情规划: (fn: any) => void;
    设置玩家门派: (fn: any) => void;
    设置任务列表: (fn: any) => void;
    设置约定列表: (fn: any) => void;
    setWorldEvents: (fn: any) => void;
    set世界演变更新中: (v: boolean) => void;
    set世界演变状态文本: (v: string) => void;
    set世界演变最近更新时间: (v: string | null) => void;
    set世界演变最近摘要: (v: string[]) => void;
    set世界演变最近原始消息: (v: string) => void;
    追加系统消息: (content: string, options?: { position?: 'tail' | 'after_last_turn' }) => void;
    应用并同步记忆系统: (memory: any, options?: any) => void;
    performAutoSave: (...args: any[]) => void;

    // Variable generation state (from parent)
    变量生成中: boolean;
    set变量生成中: (v: boolean) => void;
    开局变量生成进度: any;
    set开局变量生成进度: (v: any) => void;

    // Refs (from parent)
    世界演变进行中Ref: React.MutableRefObject<boolean>;
    世界演变去重签名Ref: React.MutableRefObject<string>;
    variableGenerationAbortControllerRef: React.MutableRefObject<AbortController | null>;
    最近变量生成上下文Ref: React.MutableRefObject<any[]>;

    // Utilities (from parent)
    深拷贝: <T>(data: T) => T;
    世界演变功能已开启: () => boolean;
    已进入主剧情回合: () => boolean;
    按回合窗口裁剪历史: (history: any[], window?: number) => any[];
    规范化环境信息: (raw?: any) => any;
    规范化社交列表: (raw?: any[], options?: { 合并同名?: boolean; eraId?: string | null }) => any[];
    规范化世界状态: (raw?: any) => any;
    规范化战斗状态: (raw?: any) => any;
    规范化门派状态: (raw?: any) => any;
    规范化剧情状态: (raw?: any) => any;
    规范化剧情规划状态: (raw?: any) => any;
    规范化女主剧情规划状态: (raw?: any) => any;
    规范化同人剧情规划状态: (raw?: any) => any;
    规范化同人女主剧情规划状态: (raw?: any) => any;
    规范化角色物品容器映射: (raw?: any) => any;
    规范化记忆系统: (raw?: any) => any;
    环境时间转标准串: (env?: any) => string;
    收集最近完整正文回合: (params: { history: any[]; currentPlayerInput?: string; currentGameTime?: string; currentResponse?: any; maxTurns?: number; }) => any[];
    构建最近完整正文上下文: (turns: any[]) => string;
    去重文本数组: (arr: string[]) => string[];
    收集女主规划时间触发原因: (...args: any[]) => string[];
    收集女主正文命中原因: (...args: any[]) => string[];
    收集剧情规划时间触发原因: (...args: any[]) => string[];
    收集剧情正文命中原因: (...args: any[]) => string[];
    提取响应完整正文文本: (response: any) => string;
    processResponseCommands: (...args: any[]) => any;
    执行变量模型校准工作流: (params: any) => Promise<any>;
    使用快照重建解析回合: (params: any) => Promise<any>;
}) => {
    const {
        view,
        loading,
        apiConfig,
        gameConfig,
        角色,
        环境,
        社交,
        世界,
        世界演变更新中,
        战斗,
        玩家门派,
        任务列表,
        约定列表,
        剧情,
        剧情规划,
        女主剧情规划,
        同人剧情规划,
        同人女主剧情规划,
        开局配置,
        prompts,
        记忆系统,
        历史记录,
        内置提示词列表,
        worldbooks,

        设置角色,
        设置环境,
        设置社交,
        设置世界,
        设置战斗,
        设置剧情,
        设置剧情规划,
        设置女主剧情规划,
        设置同人剧情规划,
        设置同人女主剧情规划,
        设置玩家门派,
        设置任务列表,
        设置约定列表,
        setWorldEvents,
        set世界演变更新中,
        set世界演变状态文本,
        set世界演变最近更新时间,
        set世界演变最近摘要,
        set世界演变最近原始消息,
        追加系统消息,
        应用并同步记忆系统,
        performAutoSave,

        变量生成中,
        set变量生成中,
        开局变量生成进度,
        set开局变量生成进度,

        世界演变进行中Ref,
        世界演变去重签名Ref,
        variableGenerationAbortControllerRef,
        最近变量生成上下文Ref,

        深拷贝,
        世界演变功能已开启,
        已进入主剧情回合,
        按回合窗口裁剪历史,
        规范化环境信息,
        规范化社交列表,
        规范化世界状态,
        规范化战斗状态,
        规范化门派状态,
        规范化剧情状态,
        规范化剧情规划状态,
        规范化女主剧情规划状态,
        规范化同人剧情规划状态,
        规范化同人女主剧情规划状态,
        规范化角色物品容器映射,
        规范化记忆系统,
        环境时间转标准串,
        收集最近完整正文回合,
        构建最近完整正文上下文,
        去重文本数组,
        收集女主规划时间触发原因,
        收集女主正文命中原因,
        收集剧情规划时间触发原因,
        收集剧情正文命中原因,
        提取响应完整正文文本,
        processResponseCommands,
        执行变量模型校准工作流,
        使用快照重建解析回合,
    } = deps;

    // ==================== 世界演变本地状态 ====================

    const [世界演变状态文本, set世界演变状态文本State] = useState('世界演变待命');
    const [世界演变最近更新时间, set世界演变最近更新时间State] = useState<string | null>(null);
    const 世界演变最近现实更新时间戳Ref = useRef<number>(0);
    const [世界演变最近摘要, set世界演变最近摘要State] = useState<string[]>([]);
    const [世界演变最近原始消息, set世界演变最近原始消息State] = useState('');

    const set世界演变最近更新时间Internal = (value: string | null) => {
        set世界演变最近更新时间State(value);
        世界演变最近现实更新时间戳Ref.current = Date.now();
    };

    // 包装 setter 以同时更新本地和父级状态
    const wrapSet世界演变状态文本 = (v: string) => {
        set世界演变状态文本State(v);
        set世界演变状态文本(v);
    };
    const wrapSet世界演变最近更新时间 = (v: string | null) => {
        set世界演变最近更新时间Internal(v);
        set世界演变最近更新时间(v);
    };
    const wrapSet世界演变最近摘要 = (v: string[]) => {
        set世界演变最近摘要State(v);
        set世界演变最近摘要(v);
    };
    const wrapSet世界演变最近原始消息 = (v: string) => {
        set世界演变最近原始消息State(v);
        set世界演变最近原始消息(v);
    };

    // ==================== 变量生成队列调度器 ====================

    const 变量生成队列调度器 = 创建变量生成队列调度器({
        执行变量模型校准工作流,
        apiConfig,
        gameConfig
    });

    // ==================== 变量生成进度系统 ====================

    const 变量生成进度系统 = 创建变量生成进度系统({
        最近变量生成上下文Ref,
        变量生成中,
        set变量生成中,
        开局变量生成进度,
        set开局变量生成进度,
        世界演变进行中Ref,
        variableGenerationAbortControllerRef,
        深拷贝,
        队列调度器: 变量生成队列调度器
    });

    const {
        序列化变量校准命令,
        清空变量生成上下文缓存,
        记录变量生成上下文,
        收集最近变量生成上下文,
        等待世界演变空闲,
        handleCancelVariableGeneration,
        获取变量生成状态,
        获取任务详情,
        监听任务完成
    } = 变量生成进度系统;

    // ==================== 执行世界演变更新 ====================

    const 执行世界演变更新 = async (params?: {
        来源?: 'manual' | 'auto_due' | 'story_dynamic' | 'story_dynamic_and_due';
        动态世界线索?: string[];
        到期摘要?: string[];
        force?: boolean;
        currentResponse?: any;
        stateBase?: {
            角色: any;
            环境: any;
            社交: any;
            世界: any;
            战斗: any;
            剧情: any;
            剧情规划: any;
            女主剧情规划?: any;
            同人剧情规划?: any;
            同人女主剧情规划?: any;
        };
    }) => 执行世界演变更新工作流(
        params,
        {
            apiSettings: apiConfig,
            gameConfig,
            角色,
            环境,
            世界,
            剧情,
            记忆系统,
            历史记录,
            prompts,
            开局配置,
            worldbooks,
            世界演变进行中Ref,
            世界演变去重签名Ref,
            已进入主剧情回合,
            按回合窗口裁剪历史,
            规范化环境信息,
            规范化世界状态,
            规范化剧情状态,
            processResponseCommands,
            setWorldEvents,
            set世界演变更新中,
            set世界演变状态文本: wrapSet世界演变状态文本,
            set世界演变最近更新时间: wrapSet世界演变最近更新时间,
            set世界演变最近摘要: wrapSet世界演变最近摘要,
            set世界演变最近原始消息: wrapSet世界演变最近原始消息,
            追加系统消息
        }
    );

    // ==================== 规划更新工作流 ====================

    const {
        后台执行统一规划分析
    } = 创建规划更新工作流({
        apiConfig,
        gameConfig,
        角色,
        环境,
        世界,
        战斗,
        玩家门派,
        任务列表,
        约定列表,
        历史记录,
        开局配置,
        prompts,
        worldbooks,
        规范化环境信息,
        规范化社交列表,
        规范化世界状态,
        规范化战斗状态,
        规范化门派状态,
        规范化剧情状态,
        规范化剧情规划状态,
        规范化女主剧情规划状态,
        规范化同人剧情规划状态,
        规范化同人女主剧情规划状态,
        深拷贝,
        收集最近完整正文回合,
        构建最近完整正文上下文,
        去重文本数组,
        收集女主规划时间触发原因,
        收集女主正文命中原因,
        收集剧情规划时间触发原因,
        收集剧情正文命中原因,
        提取响应完整正文文本,
        设置剧情,
        设置剧情规划,
        设置女主剧情规划,
        设置同人剧情规划,
        设置同人女主剧情规划,
        performAutoSave: (...args) => Promise.resolve(performAutoSave(...args))
    });

    // ==================== 强制世界演变更新 ====================

    const { handleForceWorldEvolutionUpdate } = useWorldEvolutionControl({
        view,
        loading,
        apiConfig,
        环境,
        世界,
        世界演变更新中,
        变量生成中: 变量生成中,
        世界演变状态文本: 世界演变状态文本,
        世界演变最近更新时间: 世界演变最近更新时间,
        世界演变最近现实更新时间戳Ref,
        世界演变去重签名Ref,
        世界演变功能已开启,
        已进入主剧情回合,
        set世界演变状态文本: wrapSet世界演变状态文本,
        规范化世界状态,
        执行世界演变更新
    });

    // ==================== 变量生成协调器 ====================

    const {
        后台执行变量校准: 后台执行变量生成,
        执行变量校准并合并响应: 执行变量生成并合并响应,
        执行重解析变量校准: 执行重解析变量生成
    } = 创建变量生成协调器({
        apiConfig,
        gameConfig,
        prompts,
        开局配置,
        内置提示词列表,
        世界书列表: worldbooks,
        世界演变进行中Ref,
        variableGenerationAbortControllerRef,
        set变量生成中: set变量生成中,
        深拷贝,
        世界演变功能已开启,
        等待世界演变空闲,
        收集最近变量生成上下文,
        执行变量模型校准工作流,
        合并变量生成结果到响应,
        变量生成功能已启用,
        获取变量计算接口配置,
        接口配置是否可用,
        序列化变量生成命令: 序列化变量校准命令,
        使用快照重建解析回合
    }, 获取变量生成并发配置(gameConfig));

    // ==================== 运行时变量工作流 ====================

    const {
        updateRuntimeVariableSection,
        applyRuntimeVariableCommand,
        removeTask,
        removeAgreement
    } = 创建运行时变量工作流({
        获取历史记录: () => 历史记录,
        深拷贝,
        获取当前状态: () => ({
            角色,
            环境,
            社交,
            世界,
            战斗,
            剧情,
            剧情规划,
            女主剧情规划,
            同人剧情规划,
            同人女主剧情规划,
            玩家门派,
            任务列表,
            约定列表,
            记忆系统
        }),
        规范化角色物品容器映射,
        规范化环境信息,
        规范化社交列表,
        规范化世界状态,
        规范化战斗状态,
        规范化剧情状态,
        规范化剧情规划状态,
        规范化女主剧情规划状态,
        规范化同人剧情规划状态,
        规范化同人女主剧情规划状态,
        规范化门派状态,
        规范化记忆系统,
        环境时间转标准串,
        获取开局配置: () => 开局配置,
        设置角色,
        设置环境,
        设置社交,
        设置世界,
        设置战斗,
        设置剧情,
        设置剧情规划,
        设置女主剧情规划,
        设置同人剧情规划,
        设置同人女主剧情规划,
        设置玩家门派,
        设置任务列表,
        设置约定列表,
        应用并同步记忆系统,
        performAutoSave
    });

    // ==================== 返回值 ====================

    return {
        // 世界演变状态
        世界演变状态文本,
        世界演变最近更新时间,
        世界演变最近摘要,
        世界演变最近原始消息,
        世界演变最近现实更新时间戳Ref,

        // 世界演变函数
        执行世界演变更新,
        handleForceWorldEvolutionUpdate,

        // 规划函数
        后台执行统一规划分析,

        // 变量生成函数
        后台执行变量生成,
        执行变量生成并合并响应,
        执行重解析变量生成,
        handleCancelVariableGeneration,
        获取变量生成状态,
        获取任务详情,
        监听任务完成,
        序列化变量校准命令,
        清空变量生成上下文缓存,
        记录变量生成上下文,
        收集最近变量生成上下文,
        等待世界演变空闲,

        // 运行时变量函数
        updateRuntimeVariableSection,
        applyRuntimeVariableCommand,
        removeTask,
        removeAgreement,
    };
};
