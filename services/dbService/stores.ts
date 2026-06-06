/**
 * services/dbService/stores.ts
 *
 * 各 store 的 CRUD 通用方法（Day 37 提取）
 *
 * 拆分原则：
 * - 本模块承载**通用 CRUD**（settings store 的查询/列表/元信息）
 * - `保存设置` 因依赖 `外置化图片字段`（在 image-assets.ts 中），**Day 38 之前不迁移**；
 *   避免引入跨模块循环依赖
 * - `删除设置` / `批量删除设置` 通过 `globalThis` 桥接 `清理未引用图片资源`，
 *   index.ts 在模块顶层注册同名 export 到 globalThis
 * - 函数实现**与拆分前完全一致**；仅重组 import 边界
 */

import { 初始化数据库 } from './initialization';
import { SETTINGS_STORE } from './schema';
import { 获取设置项定义, 设置分类定义表 } from '../../utils/settingsSchema';
import { 估算对象字节数, 估算设置摘要 } from './_helpers';
import type { 设置存储记录, 设置管理项 } from './types';

// ────────────────────────────────────────────────────────────────
// 跨模块依赖（globalThis 桥接，由 index.ts 在顶层注册）
// ────────────────────────────────────────────────────────────────

/**
 * `清理未引用图片资源` 仍在 index.ts 中（Day 38 拆分到 image-assets.ts）
 * index.ts 模块加载后会把真实函数挂到 globalThis 的同名属性上
 * 这里通过 getter 取值，避免循环 import 在模块初始化时报错
 */
const get清理未引用图片资源 = (): (() => Promise<number>) => {
    const fn = (globalThis as any).__dbService_清理未引用图片资源;
    return typeof fn === 'function' ? fn : async () => 0;
};

// ────────────────────────────────────────────────────────────────
// 内部 helper（不导出；仅为本模块服务）
// ────────────────────────────────────────────────────────────────

/** 读取全部 settings 记录（供 获取设置管理清单 使用） */
const 读取全部设置记录 = async (): Promise<设置存储记录[]> => {
    const db = await 初始化数据库();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([SETTINGS_STORE], 'readonly');
        const store = transaction.objectStore(SETTINGS_STORE);
        const request = store.getAll();
        request.onsuccess = () => resolve(
            (Array.isArray(request.result) ? request.result : [])
                .filter((item: any) => typeof item?.key === 'string')
                .map((item: any) => ({
                    key: item.key.trim(),
                    value: item.value,
                    version: Number.isFinite(item?.version) ? Number(item.version) : undefined,
                    updatedAt: Number.isFinite(item?.updatedAt) ? Number(item.updatedAt) : undefined,
                    category: typeof item?.category === 'string' ? item.category : undefined
                }))
                .filter((item) => item.key)
        );
        request.onerror = () => reject(request.error);
    });
};

// ────────────────────────────────────────────────────────────────
// 对外 API（CRUD 通用方法）
// ────────────────────────────────────────────────────────────────

/** 获取设置管理清单（带元信息） */
export const 获取设置管理清单 = async (): Promise<设置管理项[]> => {
    const records = await 读取全部设置记录();
    return records
        .map((item) => {
            const def = 获取设置项定义(item.key);
            const category: 设置管理项['category'] = def?.category || 'unknown';
            return {
                key: item.key,
                label: def?.label || item.key,
                category,
                categoryLabel: category === 'unknown' ? '未登记项' : 设置分类定义表[category].label,
                description: def?.description || '该设置项尚未登记到设置 schema。',
                size: 估算对象字节数(item.value),
                summary: 估算设置摘要(item.key, item.value),
                updatedAt: Number.isFinite(item.updatedAt) ? Number(item.updatedAt) : null,
                internal: def?.internal === true,
                known: Boolean(def)
            };
        })
        .sort((a, b) => {
            const aDef = 获取设置项定义(a.key);
            const bDef = 获取设置项定义(b.key);
            const aCategoryOrder = a.category === 'unknown' ? 999 : 设置分类定义表[a.category].order;
            const bCategoryOrder = b.category === 'unknown' ? 999 : 设置分类定义表[b.category].order;
            if (aCategoryOrder !== bCategoryOrder) return aCategoryOrder - bCategoryOrder;
            const aOrder = aDef?.order ?? 9999;
            const bOrder = bDef?.order ?? 9999;
            if (aOrder !== bOrder) return aOrder - bOrder;
            return a.label.localeCompare(b.label, 'zh-Hans-CN');
        });
};

/** 删除设置项（依赖清理未引用图片资源，跨模块通过 globalThis 桥接） */
export const 删除设置 = async (key: string): Promise<void> => {
    const db = await 初始化数据库();
    await new Promise<void>((resolve, reject) => {
        const transaction = db.transaction([SETTINGS_STORE], 'readwrite');
        const store = transaction.objectStore(SETTINGS_STORE);
        const request = store.delete(key);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
    await get清理未引用图片资源()();
};

/** 批量删除设置项 */
export const 批量删除设置 = async (keys: string[]): Promise<void> => {
    if (!Array.isArray(keys) || keys.length === 0) return;
    const db = await 初始化数据库();
    await new Promise<void>((resolve, reject) => {
        const transaction = db.transaction([SETTINGS_STORE], 'readwrite');
        const store = transaction.objectStore(SETTINGS_STORE);
        keys.forEach((key) => store.delete(key));
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
    });
    await get清理未引用图片资源()();
};
