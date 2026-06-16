/**
 * services/dbService/types.ts
 *
 * dbService 子模块的纯类型/接口定义（Day 36 提取）
 *
 * 约束：
 * - 不包含运行时代码（仅 type / interface）
 * - 命名/形状与拆分前一致（无行为级修改）
 * - 供 save-archive / stores / image-assets / migrations / settings 子模块共享
 */

import type { 存档结构 } from './types';
import type { 设置分类类型 } from '../../utils/settingsSchema';

// ────────────────────────────────────────────────────────────────
// 存档导出/导入
// ────────────────────────────────────────────────────────────────

export interface 存档导出结构 {
    version: number;
    exportedAt: string;
    saves: 存档结构[];
}

export interface 存档导入结果 {
    total: number;
    imported: number;
    skipped: number;
}

// ────────────────────────────────────────────────────────────────
// 研发设置模板
// ────────────────────────────────────────────────────────────────

export interface 研发设置模板结构 {
    version: number;
    exportedAt: string;
    payload: {
        apiSettings: unknown;
    };
}

export interface 研发设置模板导入结果 {
    appliedKeys: string[];
}

// ────────────────────────────────────────────────────────────────
// 设置存储记录与管理
// ────────────────────────────────────────────────────────────────

export type 设置存储记录 = {
    key: string;
    value: any;
    version?: number;
    updatedAt?: number;
    category?: 设置分类类型 | string;
};

export interface 设置管理项 {
    key: string;
    label: string;
    category: 设置分类类型 | 'unknown';
    categoryLabel: string;
    description: string;
    size: number;
    summary: string;
    updatedAt: number | null;
    internal: boolean;
    known: boolean;
}

// ────────────────────────────────────────────────────────────────
// 存储信息
// ────────────────────────────────────────────────────────────────

export interface StorageBreakdown {
    usage: number;
    quota: number;
    details: {
        saves: number;
        settings: number;
        prompts: number;
        api: number;
        imageAssets: number;
        cache: number;
    }
}
