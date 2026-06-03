// 时代配置、时代数据、主题映射定义
// 从 models/system.ts 拆分而来

import type { ThemePreset } from './theme-visual';
import type {
    能力类型,
    武力等级,
    WorldGenConfig,
    OpeningConfig,
    NSFW场景类型,
    时代信息结构,
} from './game-settings';

import { 获取时代主题方案, 时代主题方案列表, allEraNodes } from './eraTheme';
export { 获取时代主题方案, 时代主题方案列表 } from './eraTheme';
export type { 时代主题方案 } from './eraTheme';

export type 时代背景 = '古代' | '近代' | '现代' | '近未来' | '未来' | '自定义';

export interface 货币模板 {
    单位列表: string[];
    默认初始值: Record<string, number>;
}

export type 体系类型 = '武侠' | '志怪' | '双修';


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

// 2026-06-03：内置/全部时代配置（834 行）已提取到 ./era-config/presets.ts
import { 内置时代配置, 全部时代配置, LEGACY_TO_NEW } from './era-config/presets';
export { 内置时代配置, 全部时代配置 } from './era-config/presets';



export interface 时代主题映射 {
    [eraId: string]: {
        推荐主题: ThemePreset;
        主题描述: string;
    };
}

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

