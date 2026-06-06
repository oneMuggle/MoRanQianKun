/**
 * models/system/memory-config.ts
 *
 * Day 33: 记忆系统 + 存档 / 聊天 / 提示词 / 节日。
 * 含 记忆配置结构 / 记忆系统结构 / 存档结构 等 interface。
 */

import type {
    回忆条目结构,
    聊天记录结构,
    存档元数据结构,
    核心提示词快照结构,
    节日结构,
    提示词结构,
} from './types';

// ============================== 记忆系统 interface ==============================

export interface 记忆配置结构 {
    短期记忆阈值: number; // 默认 30（短期 -> 中期）
    中期记忆阈值: number; // 默认 50（中期 -> 长期）
    重要角色关键记忆条数N: number; // 默认 20
    NPC记忆总结阈值: number; // 默认 20（NPC 记忆总结分段阈值）
    即时消息上传条数N: number; // 默认 10（按回合计数，用于即时 -> 短期滑动与 Script 上下文窗口）
    短期转中期提示词: string;
    中期转长期提示词: string;
    NPC记忆总结提示词: string;
    启用后台自动总结?: boolean;
}

export interface 记忆系统结构 {
    回忆档案: 回忆条目结构[]; // 结构化回忆索引（用于互动历史存档）
    即时记忆: string[]; // 近期回合逐条记忆（第0回合开场也写入）
    短期记忆: string[]; // 短期摘要记忆条目
    中期记忆: string[];
    长期记忆: string[];
}

// ============================== 存档结构（大型 interface） ==============================

export interface 存档结构 {
    id: number;
    类型: 'manual' | 'auto'; // Added Save Type
    时间戳: number;
    描述?: string; // Legacy field, no longer required by UI
    元数据?: 存档元数据结构;
    游戏初始时间?: string;
    角色数据: import('./../character').角色数据结构;
    环境信息: import('./../environment').环境信息结构;
    历史记录: 聊天记录结构[];

    // Extended fields
    社交?: import('./../social').NPC结构[];
    世界?: import('./../world').世界数据结构;
    战斗?: import('./../battle').战斗状态结构;
    玩家门派?: import('./../sect').详细门派结构;
    任务列表?: import('./../task').任务结构[];
    约定列表?: import('./../task').约定结构[];
    剧情?: import('./../story').剧情系统结构;
    剧情规划?: import('./../storyPlan').剧情规划结构;
    女主剧情规划?: import('./../heroinePlan').女主剧情规划结构;
    同人剧情规划?: import('./../fandomPlanning/story').同人剧情规划结构;
    同人女主剧情规划?: import('./../fandomPlanning/heroinePlan').同人女主剧情规划结构;

    // New Settings in Save
    记忆系统?: 记忆系统结构;
    openingConfig?: import('./game-config').OpeningConfig;
    游戏设置?: import('./game-config').游戏设置结构;
    记忆配置?: 记忆配置结构;
    视觉设置?: import('./ui-settings').视觉设置结构 extends infer T ? T extends object ? Partial<T> : never : never;
    场景图片档案?: import('./../imageGeneration').场景图片档案;
    核心提示词快照?: 核心提示词快照结构;
    角色锚点列表?: import('./api-config').角色锚点结构[];
    当前角色锚点ID?: string;
    时代信息?: import('./types').时代信息结构;
    // Campus Systems (校园纪元)
    校规系统?: { 校规列表: import('./../campusPhone').校规条目[]; 影响日志: import('./../campusPhone').校规影响日志[] };
    催眠系统?: { 催眠记录列表: import('./../campusPhone').催眠记录[]; app等级: import('./../campusPhone').催眠App等级; 累计使用次数: number };
    校园系统?: import('./../campusPhone').校园系统数据;
    写真系统?: import('./../photographyNSFW').写真系统扩展; // 写真约拍系统（现代纪元NSFW模块）
    都市网约车系统?: Record<string, unknown>; // 都市网约车NSFW系统
    关系谱?: import('./../relationship').关系网络数据; // 人物关系谱系统
    最近开局配置?: import('./game-config').最近开局配置结构; // 快速重开配置（读档后保留重开能力）
    // Galgame 引擎状态
    galgameSaveData?: { version: number; engineData: Record<string, unknown>; relationGraphSnapshot?: { npcIds: string[] } };
    // 探索引擎状态
    explorationNodes?: Array<{ id: string; type: string; name: string; description: string; dangerLevel: string; fowState: string; eventTriggered: boolean }>;
    explorationPaths?: Array<{ from: string; to: string; actionCost: number; description?: string }>;
    explorationCurrentAp?: number;
    explorationMaxAp?: number;
    explorationCurrentNodeId?: string | null;
    房产系统?: import('./../property/types').房产系统状态;
    当前房产存档?: import('./../property/types').房产数据结构;
}

// 重新导出 types 中的小类型
export type {
    回忆条目结构,
    聊天记录结构,
    存档元数据结构,
    核心提示词快照结构,
    节日结构,
    提示词结构,
} from './types';
