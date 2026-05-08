// Types
export type 运行时提示词状态 = {
    当前启用: boolean;
    原始启用: boolean;
    受运行时接管: boolean;
    运行时注入: boolean;
};

export type 系统提示词上下文片段 = {
    AI角色声明: string;
    worldPrompt: string;
    地图建筑状态: string;
    同人设定摘要: string;
    境界体系提示词: string;
    otherPrompts: string;
    难度设置提示词: string;
    叙事人称提示词: string;
    字数设置提示词: string;
    COT提示词: string;
    格式提示词: string;
    输出协议提示词: string;
    字数要求提示词: string;
    免责声明输出提示词: string;
    离场NPC档案: string;
    长期记忆: string;
    中期记忆: string;
    在场NPC档案: string;
    剧情安排: string;
    女主剧情规划状态: string;
    世界状态: string;
    环境状态: string;
    角色状态: string;
    战斗状态: string;
    门派状态: string;
    任务状态: string;
    约定状态: string;
    NSFW角色卡片: string;
};

export type 系统提示词构建结果 = {
    systemPrompt: string;
    shortMemoryContext: string;
    runtimePromptStates: Record<string, 运行时提示词状态>;
    contextPieces: 系统提示词上下文片段;
};

type 系统提示词构建参数 = {
    promptPool: 提示词结构[];
    memoryData: 记忆系统结构;
    socialData: any[];
    statePayload: any;
    gameConfig: 游戏设置结构;
    memoryConfig: 记忆配置结构;
    fallbackPlayerName?: string;
    builtinPromptEntries?: 内置提示词条目结构[];
    worldbooks?: 世界书结构[];
    worldEvolutionEnabled: boolean;
    deviceMessages?: Array<{ app: string; title: string; content: string; timestamp: number; read: boolean }>;
    options?: {
        禁用中期长期记忆?: boolean;
        禁用短期记忆?: boolean;
        禁用世界演变分流?: boolean;
        禁用行动选项提示词?: boolean;
        注入剧情推动协议?: boolean;
        注入女主剧情规划协议?: boolean;
        世界书作用域?: 世界书作用域[];
        世界书附加文本?: string[];
        openingConfig?: OpeningConfig;
        强制剧情COT提示词ID?: string;
        eraId?: string | null;
    };
};

// Re-exports from submodules
export { 构建系统提示词 } from './promptFragments';
export type { 系统提示词构建参数 };
