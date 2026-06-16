/**
 * models/era-config/themeMapping.ts
 *
 * 时代主题映射 + 三个获取函数（2026-06-03 从 models/era-config.ts 提取，约 70 行）
 */

import type { ThemePreset } from '../theme-visual';
import type { 时代背景 } from '../era-config';
import { allEraNodes } from '../eraTheme';
import { LEGACY_TO_NEW, 全部时代配置 } from './presets';

export interface 时代信息结构 {
    配置ID: string;
    名称: string;
    时代背景: 时代背景;
}

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

