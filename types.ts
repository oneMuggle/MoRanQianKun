// 2026-06-03 P4-6: character 不再 export * 防止循环，改用显式 type re-export
export type { 角色装备, 角色金钱, 玩家BUFF结构, 突破条件结构, 角色数据结构, 天赋结构, 背景结构, 气运结构, NSFW等级, 气运属性类型, 气运效果类型 } from './models/character';
export * from './models/environment';
export * from './models/system';
export * from './models/imageGeneration';
export * from './models/world';
export * from './models/item';
export * from './models/social';
export * from './models/kungfu';
export * from './models/sect';
export * from './models/task';
export * from './models/story';
export * from './models/storyPlan';
export * from './models/heroinePlan';
export * from './models/fandomPlanning/story';
export * from './models/fandomPlanning/heroinePlan';
export * from './models/battle';
export * from './models/worldbook';
export * from './models/novelDecomposition';
export * from './models/campusPhone';
export * from './models/campusNSFW';
export * from './models/relationship';

// Re-export 最近开局配置结构 from game-settings (type conflicts prevent full re-export)
export type { 最近开局配置结构 } from './models/game-settings';

// New types for the advanced chat system

export interface TavernCommand {
    action: 'add' | 'set' | 'push' | 'delete';
    key: string;
    value: any;
}

export interface GameLog {
    sender: string;
    text: string;
}

export interface JudgmentThoughtBlock {
    raw: string;
    text: string;
    attachedTo?: string;
    isNsfw?: boolean;
}

export interface GameResponse {
    logs: GameLog[];
    thinking_pre?: string;
    thinking_native?: string;
    t_input?: string;
    t_plan?: string;
    t_var_plan?: string;
    t_state?: string;
    t_branch?: string;
    t_precheck?: string;
    t_logcheck?: string;
    t_var?: string;
    t_npc?: string;
    t_cmd?: string;
    t_audit?: string;
    t_fix?: string;
    thinking_post?: string;
    t_mem?: string;
    t_opts?: string;
    tavern_commands?: TavernCommand[];
    shortTerm?: string;
    action_options?: string[]; // Quick actions for the user
    dynamic_world?: string[]; // Hints for world-evolution model
    judge_blocks?: JudgmentThoughtBlock[];
    body_optimized?: boolean;
    body_optimized_manual?: boolean;
    body_optimized_at?: number;
    body_optimized_model?: string;
    body_original_logs?: GameLog[];
    variable_calibration_report?: string[];
    variable_calibration_commands?: TavernCommand[];
    variable_calibration_model?: string;
}

// Extend/Override the old history structure
export interface 聊天记录结构 {
    role: 'user' | 'assistant' | 'system';
    content: string; // Keep for backward compat or user input
    structuredResponse?: GameResponse; // The parsed object for assistant
    timestamp: number;
    rawJson?: string; // Raw model text for source view/edit
    gameTime?: string; // Added gameTime
    inputTokens?: number; // Estimated uploaded/input tokens
    responseDurationSec?: number; // Request start -> final reply duration (seconds)
    outputTokens?: number; // Estimated AI output tokens
    autoScrollToTurnIcon?: boolean;
}


// ─── 调试模式类型 ───

export interface DebugPromptState {
    promptId: string;
    status: 'enabled' | 'disabled' | 'injected';
}

export interface DebugPromptTrace {
    promptStates: Array<{
        promptId: string;
        sentStatus: 'sent' | 'not_sent';
        detectedInResponse: boolean;
        matchKeywords: string[];
    }>;
    protocolTags: {
        tag: string;
        present: boolean;
    }[];
}

export interface DebugResponseAnalysis {
    rawLength: number;
    logCount: number;
    tagsPresent: string[];
    tagsMissing: string[];
    hasActionOptions: boolean;
    hasCommands: boolean;
    hasVariableCalibration: boolean;
    hasDynamicWorld: boolean;
}

export interface DebugTurnLog {
    turnIndex: number;
    timestamp: number;
    // 请求侧
    systemPrompt: string;
    systemPromptPieces: Array<{ section: string; content: string; charCount: number }>;
    promptStates: DebugPromptState[];
    userMessages: Array<{ role: string; content: string; charCount: number }>;
    totalInputChars: number;
    // 响应侧
    rawResponse: string;
    parsedResponse?: GameResponse;
    // 分析
    promptTrace?: DebugPromptTrace;
    responseAnalysis?: DebugResponseAnalysis;
    // 元信息
    apiConfig?: { provider: string; model: string };
    durationMs?: number;
    error?: string;
}
