// Shared types for openingStoryWorkflow subdirectory
import type { GameResponse, 提示词结构, 记忆系统结构, 聊天记录结构, 剧情系统结构, 剧情规划结构, 女主剧情规划结构, 同人剧情规划结构, 同人女主剧情规划结构, 环境信息结构, 角色数据结构, 世界数据结构, 战斗状态结构, 详细门派结构, 内置提示词条目结构, 世界书结构 } from '../../../../types';
import type { 酒馆上下文结构 } from '../../promptRuntime';

export type 开场命令基态 = {
    角色: 角色数据结构;
    环境: 环境信息结构;
    社交: any[];
    世界: 世界数据结构;
    战斗: 战斗状态结构;
    玩家门派: 详细门派结构;
    任务列表: any[];
    约定列表: any[];
    剧情: 剧情系统结构;
    剧情规划: 剧情规划结构;
    女主剧情规划?: 女主剧情规划结构;
    同人剧情规划?: 同人剧情规划结构;
    同人女主剧情规划?: 同人女主剧情规划结构;
};

export type 自动存档快照结构 = {
    history?: 聊天记录结构[];
    role?: 角色数据结构;
    env?: 环境信息结构;
    social?: any[];
    world?: 世界数据结构;
    battle?: 战斗状态结构;
    sect?: 详细门派结构;
    tasks?: any[];
    agreements?: any[];
    story?: 剧情系统结构;
    storyPlan?: 剧情规划结构;
    heroinePlan?: 女主剧情规划结构;
    fandomStoryPlan?: 同人剧情规划结构;
    fandomHeroinePlan?: 同人女主剧情规划结构;
    memory?: 记忆系统结构;
    openingConfig?: any;
    force?: boolean;
};

export type 开场剧情生成依赖 = {
    apiConfig: any;
    环境: 环境信息结构;
    角色: 角色数据结构;
    世界: 世界数据结构;
    战斗: 战斗状态结构;
    玩家门派: 详细门派结构;
    任务列表: any[];
    约定列表: any[];
    剧情: 剧情系统结构;
    剧情规划: 剧情规划结构;
    女主剧情规划?: 女主剧情规划结构;
    同人剧情规划?: 同人剧情规划结构;
    同人女主剧情规划?: 同人女主剧情规划结构;
    gameConfig: any;
    memoryConfig: any;
    builtinPromptEntries: 内置提示词条目结构[];
    worldbooks: 世界书结构[];
    abortControllerRef: { current: AbortController | null };
    setPrompts: (value: 提示词结构[]) => void;
    设置历史记录: (value: 聊天记录结构[] | ((prev: 聊天记录结构[]) => 聊天记录结构[])) => void;
    设置角色: (value: 角色数据结构) => void;
    设置环境: (value: 环境信息结构) => void;
    设置社交: (value: any[]) => void;
    设置世界: (value: 世界数据结构) => void;
    设置战斗: (value: 战斗状态结构) => void;
    设置剧情: (value: 剧情系统结构) => void;
    设置剧情规划: (value: 剧情规划结构) => void;
    设置女主剧情规划: (value: 女主剧情规划结构) => void;
    设置同人剧情规划: (value: 同人剧情规划结构 | undefined) => void;
    设置同人女主剧情规划: (value: 同人女主剧情规划结构 | undefined) => void;
    设置玩家门派: (value: 详细门派结构) => void;
    设置任务列表: (value: any[]) => void;
    设置约定列表: (value: any[]) => void;
    设置开局变量生成进度: (value: any) => void;
    设置开局世界演变进度: (value: any) => void;
    设置开局规划进度: (value: any) => void;
    设置游戏初始时间: (value: string) => void;
    记录变量生成上下文: (params: {
        playerInput: string;
        response: GameResponse;
    }) => void;
    setWorldEvents: (value: string[]) => void;
    应用并同步记忆系统: (memory: 记忆系统结构) => void;
    performAutoSave: (snapshot?: 自动存档快照结构) => Promise<void>;
    构建系统提示词: (promptPool: 提示词结构[], memoryData: 记忆系统结构, socialData: any[], statePayload: any, options?: any) => 酒馆上下文结构 & {
        contextPieces: 酒馆上下文结构['contextPieces'] & {
            AI角色声明?: string;
            输出协议提示词?: string;
            字数要求提示词?: string;
            免责声明输出提示词?: string;
        };
    };
    processResponseCommands: (response: GameResponse, baseState?: 开场命令基态, options?: { applyState?: boolean; rawContent?: string }) => 开场命令基态;
    规范化环境信息: (envLike?: any) => 环境信息结构;
    规范化剧情状态: (raw?: any, envLike?: any) => 剧情系统结构;
    规范化剧情规划状态: (raw?: any) => 剧情规划结构;
    规范化女主剧情规划状态: (raw?: any) => 女主剧情规划结构;
    规范化同人剧情规划状态: (raw?: any) => 同人剧情规划结构 | undefined;
    规范化同人女主剧情规划状态: (raw?: any) => 同人女主剧情规划结构 | undefined;
    规范化角色物品容器映射: (raw?: any) => 角色数据结构;
    规范化社交列表: (raw?: any[], options?: { 合并同名?: boolean }) => any[];
    规范化世界状态: (raw?: any) => 世界数据结构;
    规范化战斗状态: (raw?: any) => 战斗状态结构;
    规范化门派状态: (raw?: any) => 详细门派结构;
    游戏设置启用自动重试: (config: any) => boolean;
    执行带自动重试的生成请求: <T>(params: {
        enabled: boolean;
        onRetry?: (attempt: number, maxAttempts: number, reason: string) => void;
        action: () => Promise<T>;
    }) => Promise<T>;
    更新流式草稿为自动重试提示: (history: 聊天记录结构[], attempt: number, maxAttempts: number, reason: string) => 聊天记录结构[];
    替换流式草稿为失败提示: (history: 聊天记录结构[], errorMessage: string) => 聊天记录结构[];
    提取解析失败原始信息: (error: any) => string;
    获取原始AI消息: (raw: string) => string;
    估算消息Token: (messages: Array<{ role?: string; content?: string; name?: string }>, model?: string) => number;
    估算AI输出Token: (text: string, model?: string) => number;
    计算回复耗时秒: (startedAt: number, finishedAt?: number) => number;
    触发新增NPC自动生图: (npcs: any[]) => void;
    触发场景自动生图: (params: {
        response: GameResponse;
        bodyText?: string;
        env?: any;
        turnNumber?: number;
        playerInput?: string;
        source?: 'auto' | 'manual';
        autoApply?: boolean;
    }) => void;
    提取新增NPC列表: (beforeList: any[], afterList: any[]) => any[];
};

export type 开局工作流选项 = {
    命令基态?: 开场命令基态;
    开局额外要求?: string;
    开局配置?: any;
    eraId?: string | null;
};
