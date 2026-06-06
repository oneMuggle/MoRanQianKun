/**
 * models/system/game-config.ts
 *
 * Day 33: 游戏核心配置 — 时代 / 世界 / 能力 / 难度 / 统计 / 同人 / 酒馆预设 / 游戏设置。
 * 含 OpeningConfig / WorldGenConfig / 游戏设置结构 等大型 interface，
 * 以及 全部时代配置 / 描述映射 / 时代主题映射 const 与 helpers。
 */

import {
    内置时代配置,
    新增时代配置,
} from './eraPresets';
import { allEraNodes } from './../eraTheme';
import type { LiModeStage } from './../eraTheme/types';
import type {
    角色锚点结构,
    角色锚点特征结构,
} from './types';

import type {
    // 类型别名
    剧情风格类型,
    NTL后宫档位,
    武力等级,
    NSFW场景类型,
    时代背景,
    体系类型,
    剧情推进速度,
    行动选项增强档位,
    能力类型,
    超能力分类,
    觉醒程度,
    游戏难度,
    初始关系模板类型,
    关系侧重类型,
    开局切入偏好类型,
    同人来源类型,
    同人融合强度类型,
    酒馆预设消息角色类型,
    行动选项输入模式类型,
    货币模板,
    难度调整记录,
    时代信息结构,
    时代主题映射,
    ThemePreset,
    同人角色替换规则结构,
    酒馆预设提示词结构,
    酒馆预设顺序项结构,
    酒馆预设顺序结构,
    酒馆预设结构,
    酒馆预设条目结构,
} from './types';

// ============================== 时代配置（大型 interface） ==============================

export interface 时代配置 {
    id: string;
    名称: string;
    时代: 时代背景;
    科技水平描述: string;
    社会结构描述: string;
    货币模板: 货币模板;
    品质等级名称: string[];
    默认开局场景: string[];
    文风参考描述: string;
    核心Prompt变体: string;
    默认世界版图?: '弹丸之地' | '九州宏大' | '无尽位面';
    默认组织密度?: '稀少' | '适中' | '林立';
    默认能力类型?: 能力类型;
    默认武力等级?: 武力等级;
    默认王朝占位符?: string;
    默认天骄占位符?: string;
    组织密度标签?: string;
    可用能力类型?: 能力类型[];
    支持体系?: 体系类型[];
    世界观预设卡片?: Array<{ name: string; overrides: Partial<WorldGenConfig> }>;
}

// ============================== 全部时代配置 const ==============================

/** 旧ID到新ID的映射 */
const LEGACY_TO_NEW: Record<string, string> = {
    era_ancient_wuxia: 'ancient_eastern_wuxia',
    era_republic_modern: 'modern_eastern_republic',
    era_modern_urban: 'contemporary_urban',
    era_cyberpunk_nearfuture: 'near-future_cyberpunk',
    era_scifi_future: 'far-future_space_opera',
};

/** 完整的时代配置：5个旧ID手写 + 32个新SubEra = 42项（覆盖37个唯一SubEra） */
export const 全部时代配置: 时代配置[] = [
    ...内置时代配置,
    ...新增时代配置,
    // 新ID版本（对应上方旧ID的手写配置，使新ID也可通过全部时代配置找到）
    (() => {
        const wuxia = 内置时代配置[0];
        return { ...wuxia, id: 'ancient_eastern_wuxia', 名称: '武侠' };
    })(),
    (() => {
        const republic = 内置时代配置[1];
        return { ...republic, id: 'modern_eastern_republic', 名称: '民国风云' };
    })(),
    (() => {
        const urban = 内置时代配置[2];
        return { ...urban, id: 'contemporary_urban', 名称: '都市' };
    })(),
    (() => {
        const cyber = 内置时代配置[3];
        return { ...cyber, id: 'near-future_cyberpunk', 名称: '赛博朋克' };
    })(),
    (() => {
        const scifi = 内置时代配置[4];
        return { ...scifi, id: 'far-future_space_opera', 名称: '星际科幻' };
    })(),
];

/**
 * 动态生成时代主题映射：从 eraTree 的所有 SubEra 节点提取
 * 根据 uiStyle.style 推断推荐的视觉主题
 */
const styleToTheme: Record<string, ThemePreset> = {
    classical: 'ink',
    retro: 'sand',
    modern: 'moon',
    tech: 'violet',
    scifi: 'azure',
};

export const 时代主题映射表: 时代主题映射 = Object.fromEntries(
    allEraNodes
        .filter((n) => n.depth === 2)
        .map((node) => {
            const style = node.uiStyle?.style ?? 'classical';
            const theme = styleToTheme[style] ?? 'ink';
            return [node.id, {
                推荐主题: theme,
                主题描述: node.description ?? '',
            }];
        })
);

// 为旧ID生成映射（通过 legacy→new 查找）
for (const [oldId, newId] of Object.entries(LEGACY_TO_NEW)) {
    const newMapping = 时代主题映射表[newId];
    if (newMapping) {
        时代主题映射表[oldId] = newMapping;
    }
}

export const 获取时代推荐主题 = (eraId: string): ThemePreset | null => {
    const mapping = 时代主题映射表[eraId];
    return mapping?.推荐主题 ?? null;
};

export const 获取时代信息 = (eraId: string): 时代信息结构 | null => {
    const era = 全部时代配置.find((e) => e.id === eraId);
    if (!era) return null;
    return {
        配置ID: era.id,
        名称: era.名称,
        时代背景: era.时代
    };
};

/** 将 SubEra ID 映射到时代背景大类，用于天赋/背景/气运筛选 */
export const 获取时代背景 = (eraId: string): 时代背景 | null => {
    const info = 获取时代信息(eraId);
    return info?.时代背景 ?? null;
};

// ============================== 描述映射 const ==============================

export const 武力等级描述映射: Record<武力等级, string> = {
    '低武': '武侠初期，拳脚功夫为主，刀剑为辅。高手亦不过力大招猛、身法矫健，止步于人体极限。江湖以招式精妙、经验丰富者为强，内力可有但浅薄。无轻功飞纵，无隔空伤人，无真气外放。',
    '中武': '武侠中期，内力显著，可登堂入室。高手能以一敌十，轻功可腾跃数丈，暗器可及远。江湖以门派传承、功法境界为尊。或有真传秘籍之争，或有宗师独步一方。',
    '高武': '武侠巅峰/后期化境，宗师辈出，可开宗立派。高手段已臻化境，飞花摘叶皆可伤人，真气外放亦有之。秘籍、名器、传承皆为稀缺资源。高境界者凤毛麟角，百年难遇。',
    '修仙': '超越武侠范畴，涉及灵气、真元、阵法、炼丹、灵兽等元素。修行者可御器飞行、夺天地造化。门派以修仙宗门为主，凡人江湖缩小为世俗一隅。秘境、灵脉、仙缘为修行关键。'
};

export const NSFW场景描述映射: Record<NSFW场景类型, string> = {
    '无': '完全不会出现性相关描写。',
    '点到为止': '只描写氛围和情感递进，身体接触限于拥抱、牵手、眼神交流，使用"春宵一度"、"巫山云雨"等委婉表达。',
    '适度展开': '可描写亲吻、抚摸、衣着褪去，使用委婉词汇替代敏感词，不出现敏感词。',
    '完全展开': '可进行完全展开的性描写，使用敏感词：肉棒、龟头、阴茎、小穴、阴蒂、乳头、蜜液、精液等。'
};

export const 剧情推进速度描述映射: Record<剧情推进速度, string> = {
    '缓慢': '每个回合聚焦极小范围的细节互动，节奏舒缓，重情感递进与氛围营造。',
    '正常': '按默认节奏推进剧情，平衡叙事与互动的比重。',
    '快速': '跳过不必要的过场和寒暄，选项直奔核心行动，减少冗余叙事。',
    '跳过至关键节点': '大幅跳跃到下一个重要事件或转折点，选项可包含明确的时间跨度。'
};

export const 超能力分类描述: Record<超能力分类, string> = {
    '心灵感应': '脑波能力，可读取他人思维、传递意识、感知情绪。高阶可进行远距离传心或思维干扰。',
    '念力': '精神力外显形成的物质化力量，可隔空移物、压缩物体、形成念力护盾。高阶可撼山搬海。',
    '预知': '时间感知能力，可预见短期未来、占卜吉凶、预判危机。高阶可看到多条时间线。',
    '治愈': '生命力操控能力，可加速自愈、治愈他人、操控血液。高阶可起死回生但有代价。',
    '元素操控': '自然元素亲和，可操控火、水、风、土、雷等自然之力。高阶可引动天灾。',
    '时空': '时空规则能力，可短距离瞬移、时间减缓、空间扭曲。高阶可短暂停滞时间。',
    '变身': '形态变化能力，可变化外貌、拟态他物、兽化。高阶可完全变身或化为能量态。',
    '灵能': '灵魂层面能力，可灵魂出窍、灵体攻击、开启灵觉。高阶可干预他人魂魄。',
    '高科技': '科技侧能力，机械改造、基因药剂、义体强化。高阶可成为半机械或半生物。',
    '综合': '多重能力混合，多种超能力并存，能力间可能有协同或冲突。',
    '未觉醒': '能力潜力存在但尚未激发，可能在危机时刻或特定条件下觉醒。'
};

export const 觉醒程度描述: Record<觉醒程度, string> = {
    '未觉醒': '体内有潜能但尚未激发，可能在危机时刻或特定条件下觉醒。',
    '初觉': '能力刚开始显现，表现为微弱、不稳定、难以控制。',
    '小成': '能力已可主动使用，但威力有限，需要专注才能发动。',
    '大成': '能力运用自如，威力可观，可作为主要对敌手段。',
    '巅峰': '能力已臻化境炉火纯青，可越级挑战甚至改变局势。'
};

export const 能力类型描述映射: Record<能力类型, string> = {
    '传统武侠': '纯内力体系，无超自然能力，江湖以招式精妙、经验丰富者为强。',
    '修仙体系': '灵气为基，修仙功法为主，可御剑飞行、炼丹炼器、追求长生。',
    '超能力线': '特异功能为主，现代/科幻风格，包括心灵感应、念力、元素操控等。',
    '混合世界': '武侠、修仙、超能力并存，多体系交汇，兼容并蓄。'
};

// ============================== 游戏统计 ==============================

export interface 游戏统计 {
    总回合数: number;
    战斗次数: number;
    胜利次数: number;
    失败次数: number;
    死亡次数: number;
    任务完成次数: number;
    任务失败次数: number;
    跨境挑战次数: number;
    跨境成功次数: number;
    濒死次数: number;
    连续失败次数: number;
    连续胜利次数: number;
    难度调整历史: 难度调整记录[];
    上次调整后回合数: number;
}

export const 默认游戏统计 = (): 游戏统计 => ({
    总回合数: 0,
    战斗次数: 0,
    胜利次数: 0,
    失败次数: 0,
    死亡次数: 0,
    任务完成次数: 0,
    任务失败次数: 0,
    跨境挑战次数: 0,
    跨境成功次数: 0,
    濒死次数: 0,
    连续失败次数: 0,
    连续胜利次数: 0,
    难度调整历史: [],
    上次调整后回合数: 0
});

// ============================== 同人 / 开局 / 世界生成 ==============================

export interface 同人融合配置结构 {
    enabled: boolean;
    作品名: string;
    来源类型: 同人来源类型;
    融合强度: 同人融合强度类型;
    保留原著角色: boolean;
    启用角色替换: boolean;
    替换目标角色名: string;
    附加替换角色名列表: string[];
    附加角色替换规则列表: 同人角色替换规则结构[];
    启用附加小说: boolean;
    附加小说数据集ID: string;
}

export interface OpeningConfig {
    初始关系模板: 初始关系模板类型;
    关系侧重: 关系侧重类型[];
    开局切入偏好: 开局切入偏好类型;
    同人融合: 同人融合配置结构;
    /** 选中的开局场景 ID（来自当前子纪元的 openingScenes） */
    selectedSceneId?: string;
    /** 选中的角色原型 ID 列表（来自当前子纪元的 characterArchetypes） */
    selectedArchetypeIds?: string[];
    /** 选中的写作示例 ID 列表（来自当前子纪元的 writingSamples） */
    selectedWritingSampleIds?: string[];
}

export interface WorldGenConfig {
    worldName: string;
    worldSize: '弹丸之地' | '九州宏大' | '无尽位面';
    dynastySetting: string;
    sectDensity: '稀少' | '适中' | '林立';
    tianjiaoSetting: string;
    武力等级: 武力等级;
    nsfw场景类型: NSFW场景类型;
    能力类型: 能力类型;
    超能力分类?: 超能力分类;
    觉醒程度?: 觉醒程度;
    worldExtraRequirement: string;
    manualWorldPrompt: string;
    manualRealmPrompt: string;
    difficulty: 游戏难度;
    时代配置ID?: string;
    古代体系选择?: '武侠' | '志怪' | '双修';
}

/** 快速重开所需的开局配置快照 */
export interface 最近开局配置结构 {
    worldConfig: WorldGenConfig;
    charData: import('./../character').角色数据结构;
    openingConfig?: OpeningConfig;
    openingStreaming: boolean;
    openingExtraPrompt: string;
}

// ============================== 游戏设置结构（大型 interface） ==============================

export interface 游戏设置结构 {
    字数要求: number; // Minimum logs body length
    叙事人称: '第一人称' | '第二人称' | '第三人称';
    启用行动选项: boolean; // Whether to require action_options output
    行动选项输入模式: 行动选项输入模式类型; // Whether clicking an option appends or replaces input text
    启用行动选项增强: boolean; // Generate action options at multiple pacing levels
    启用NSFW推进选项: boolean; // Include intimacy-promoting options in ambiguous scenes
    剧情推进速度: 剧情推进速度; // Legacy pacing, kept for backward compatibility
    启用COT伪装注入: boolean; // Inject pseudo historical COT message before latest user input
    启用GPT模式: boolean; // Main-story normal mode: send current user input directly as the user trigger message
    启用女主剧情规划: boolean; // Inject heroine planning prompts as optional addon
    启用防止说话: boolean; // Inject NoControl prompt to avoid speaking for player
    启用真实世界模式: boolean; // Inject realism guardrails so the world can reject, punish, or kill the protagonist
    启用免责声明输出: boolean; // Require a separate disclaimer block at the end
    启用标签检测完整性: boolean; // Validate required label protocol completeness before accepting response
    启用标签修复: boolean; // Auto repair malformed labels before parsing
    启用自动重试: boolean; // Auto retry failed generation/parsing up to the built-in max attempts
    启用NSFW模式: boolean; // Gate NSFW prompt and heroine privacy UI
    nsfw场景类型: NSFW场景类型; // NSFW scene description level (mirrored from OpeningConfig for runtime use)
    成人内容?: boolean; // Unlock nsfw等级 2 qiyun entries; default false
    校园NSFW设置?: import('./../campusNSFW').校园NSFW设置; // Campus NSFW subsystem toggles (contemporary_campus only)
    都市网约车NSFW设置?: import('./../urbanDriverNSFW').都市网约车NSFW设置; // Urban ride-hailing driver NSFW subsystem toggles (contemporary_urban only)
    写真NSFW设置?: import('./../photographyNSFW').写真NSFW设置; // Photography NSFW subsystem toggles (contemporary_* only)
    BDSM系统设置?: import('./../bdsmNSFW').BDSM系统设置; // BDSM independent subsystem toggles (all eras)
    BDSMNSFW设置?: import('./../bdsmNSFW').BDSM系统设置; // Alias of 系统设置 used by some runtime code paths
    ExposureNSFW设置?: import('./../exposureNSFW').ExposureNSFW设置; // 露出独立 NSFW 子系统
    桌游社交NSFW设置?: import('./../boardGameNSFW').桌游社交NSFW设置; // Board game social NSFW subsystem toggles (all eras)
    酒吧NSFW设置?: import('./../contemporary/barNSFW').酒吧NSFW设置; // Bar NSFW subsystem toggles (contemporary_urban only)
    启用NSFW增强系统?: boolean; // Toggle NSFW enhancement subsystem (pregnancy, aftercare, clothing layers, scene modifiers, consequences, cross-module linker)
    启用孕产系统?: boolean; // Toggle pregnancy/childbirth engine (default: false, requires 启用NSFW增强系统 === true)
    启用饱腹口渴系统: boolean; // Toggle hunger/thirst prompt injection and UI visibility
    启用修炼体系: boolean; // Toggle cultivation/realm/kungfu prompt injection and related UI visibility
    启用里武侠模式: boolean; // Toggle inner martial arts (里武侠) world: dual-cultivation personality, revealing clothing, 武根 system
    启用里志怪模式: boolean; // Toggle inner zhiguai (里志怪) world: supernatural folklore, yin-yang mechanics, talisman/法器 systems
    启用子纪元里模式?: Record<string, boolean>; // Per-sub-era liMode toggle (时代暗面规则开关, keyed by era ID, defaults to true)
    子纪元里模式强度?: Record<string, '微暗' | '暧昧' | '露骨'>; // Per-sub-era liMode intensity (三级强度, keyed by era ID, defaults to '露骨')
    子纪元里模式阶段?: Record<string, LiModeStage>; // Per-sub-era liMode stage (NPC心理/行为阶段, keyed by era ID, defaults to '羞耻')
    古代体系选择?: '武侠' | '志怪' | '双修'; // Selected system type for ancient era: martial arts, zhiguai, or both
    剧情风格: 剧情风格类型; // Story style injected as assistant context before COT
    NTL后宫档位: NTL后宫档位; // NTL-only tier selector
    启用酒馆预设模式: boolean; // Use SillyTavern preset prompt/order pipeline
    酒馆预设列表?: 酒馆预设条目结构[];
    当前酒馆预设ID?: string | null;
    酒馆提示词后处理?: import('./types').酒馆提示词后处理类型;
    酒馆角色卡描述?: string;
    酒馆预设?: 酒馆预设结构 | null;
    酒馆预设角色ID?: number | null;
    酒馆预设名称?: string;
    独立APIGPT模式?: {
        剧情回忆: boolean;
        记忆总结: boolean;
        文章优化: boolean;
        世界演变: boolean;
        变量生成: boolean;
        规划分析: boolean;
        小说拆分: boolean;
    };
    变量生成并发数?: number; // 变量生成队列并发数，默认 3，范围 1-5
    变量生成最大重试次数?: number; // 变量生成失败重试次数，默认 2，范围 0-5
    额外提示词: string; // Custom prompt injected at the end
    启用动态难度?: boolean; // Toggle dynamic difficulty adjustment based on player performance
    启用调试模式?: boolean; // Enable LLM debug mode: capture prompts, responses, and injection traces
    调试日志保留条数?: number; // Max debug turn logs to keep in ring buffer (default 20)
}

// 避免 TS6133 警告：角色锚点类型在 system 内被引用但本文件未直接使用
// 实际引用方在 types.ts，此处保持 re-export 防止部分导入路径失效
export type { 角色锚点结构, 角色锚点特征结构 };
