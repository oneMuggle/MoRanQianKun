/**
 * services/dbService/migrations.ts
 *
 * 版本升级迁移函数（Day 38 提取）
 *
 * 拆分原则：
 * - 本模块承载 IndexedDB schema 升级、设置模板导入导出等"非 CRUD"业务
 * - 跨 store 读取（saves + settings 全表）由本模块自行发起
 * - 函数实现**与拆分前完全一致**；仅重组 import 边界
 *
 * ⚠️ 循环依赖说明：本模块 `import { 保存设置, 读取设置 } from './index'` 构成 ESM 循环。
 * 解决方法：被引用的函数在 index.ts 中位于模块顶层（`export const`），
 * ESM live binding 在函数体内调用时可正确解析。
 */

import { 初始化数据库 } from './initialization';
import { STORE_NAME, SETTINGS_STORE } from './schema';
import { 设置键 } from '../../utils/settingsSchema';
import { 默认功能模型占位, 规范化接口设置 } from '../../utils/apiConfig';
import { 深拷贝 } from './_helpers';
import { 外置化图片字段 } from './image-assets';
import type { 存档结构 } from '../../types';
import type { 研发设置模板结构, 研发设置模板导入结果 } from './types';
// 循环引用：保存设置 / 读取设置 / 读取存档保护状态 仍定义在 index.ts
import { 保存设置, 读取设置, 读取存档保护状态, 设置存档保护状态 } from './index';

// ────────────────────────────────────────────────────────────────
// 常量
// ────────────────────────────────────────────────────────────────

/** 研发设置模板版本号 */
const 研发设置模板版本 = 1;

/** 图片资源迁移状态在 settings 中的 key */
const 图片资源迁移版本键 = 设置键.图片资源迁移版本;

/** 存档保护设置 key（迁移时检查） */
const 存档保护设置键 = 设置键.存档保护;

/** 自定义背景/天赋 保护键（清空设置时保留） */
export const 自定义背景天赋保护键 = [
    设置键.视觉设置,
    设置键.自定义天赋,
    设置键.自定义背景,
    设置键.自定义开局预设
] as const;

// ────────────────────────────────────────────────────────────────
// 内部 helper（不导出；供本模块 + 清空设置流程使用）
// ────────────────────────────────────────────────────────────────

const 提取可保留接口配置 = (raw: unknown): unknown => {
    const normalized = 规范化接口设置(raw);
    const feature = normalized.功能模型占位;
    return {
        activeConfigId: normalized.activeConfigId,
        configs: 深拷贝(normalized.configs),
        // 这里直接保留完整的归一化功能配置，避免新增字段时因白名单遗漏导致"能改不能存"。
        功能模型占位: 深拷贝({
            ...默认功能模型占位,
            ...feature
        })
    };
};

/** 读取受保护的设置项快照（用于清空后回写） */
export const 读取设置保护快照 = async (keys: string[]): Promise<Array<{ key: string; value: any }>> => {
    const snapshots: Array<{ key: string; value: any }> = [];
    for (const key of keys) {
        const value = await 读取设置(key);
        if (value !== null && value !== undefined) {
            snapshots.push({
                key,
                value: key === 设置键.API配置 ? 提取可保留接口配置(value) : value
            });
        }
    }
    return snapshots;
};

/** 回写设置保护快照 */
export const 回写设置保护快照 = async (snapshots: Array<{ key: string; value: any }>): Promise<void> => {
    for (const item of snapshots) {
        await 保存设置(item.key, item.value);
    }
};

// ────────────────────────────────────────────────────────────────
// 对外 API：版本升级迁移
// ────────────────────────────────────────────────────────────────

/**
 * 一次性迁移：把存档 / settings 内联的 dataUrl 外置到 IMAGE_ASSETS_STORE。
 * 通过 `图片资源迁移版本键` 幂等。
 */
export const 迁移图片资源到独立存储 = async (): Promise<{ saves: number; settings: number }> => {
    const migrated = await 读取设置(图片资源迁移版本键);
    if (migrated === true) {
        return { saves: 0, settings: 0 };
    }

    const db = await 初始化数据库();
    const [saves, settings] = await Promise.all([
        new Promise<any[]>((resolve, reject) => {
            const transaction = db.transaction([STORE_NAME], 'readonly');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.getAll();
            request.onsuccess = () => resolve(Array.isArray(request.result) ? request.result : []);
            request.onerror = () => reject(request.error);
        }),
        new Promise<Array<{ key: string; value: any }>>((resolve, reject) => {
            const transaction = db.transaction([SETTINGS_STORE], 'readonly');
            const store = transaction.objectStore(SETTINGS_STORE);
            const request = store.getAll();
            request.onsuccess = () => resolve(
                (Array.isArray(request.result) ? request.result : [])
                    .filter((item: any) => typeof item?.key === 'string')
                    .map((item: any) => ({ key: item.key, value: item.value }))
            );
            request.onerror = () => reject(request.error);
        })
    ]);

    let migratedSaves = 0;
    for (const save of saves) {
        const nextSave = await 外置化图片字段(save) as 存档结构;
        await new Promise<void>((resolve, reject) => {
            const transaction = db.transaction([STORE_NAME], 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.put(nextSave);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
        migratedSaves += 1;
    }

    let migratedSettings = 0;
    for (const item of settings) {
        const nextValue = await 外置化图片字段(item.value);
        await new Promise<void>((resolve, reject) => {
            const transaction = db.transaction([SETTINGS_STORE], 'readwrite');
            const store = transaction.objectStore(SETTINGS_STORE);
            const request = store.put({ key: item.key, value: nextValue });
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
        migratedSettings += 1;
    }

    await 保存设置(图片资源迁移版本键, true);
    return { saves: migratedSaves, settings: migratedSettings };
};

/** 导出研发设置模板（仅 API 配置） */
export const 导出研发设置模板 = async (): Promise<研发设置模板结构> => {
    const rawApiSettings = await 读取设置(设置键.API配置);
    return {
        version: 研发设置模板版本,
        exportedAt: new Date().toISOString(),
        payload: {
            apiSettings: 提取可保留接口配置(rawApiSettings)
        }
    };
};

/** 导入研发设置模板（仅 API 配置） */
export const 导入研发设置模板 = async (payload: unknown): Promise<研发设置模板导入结果> => {
    if (!payload || typeof payload !== 'object') {
        throw new Error('导入失败：设置模板内容为空或格式不正确。');
    }

    const root = payload as Record<string, unknown>;
    const rawContainer = (root.payload && typeof root.payload === 'object')
        ? root.payload as Record<string, unknown>
        : root;
    const candidateApiSettings = rawContainer.apiSettings ?? rawContainer.api ?? root[设置键.API配置];

    if (candidateApiSettings === undefined || candidateApiSettings === null) {
        throw new Error('导入失败：未找到 apiSettings 字段。');
    }

    const sanitizedApiSettings = 提取可保留接口配置(candidateApiSettings);
    await 保存设置(设置键.API配置, sanitizedApiSettings);

    return {
        appliedKeys: [设置键.API配置]
    };
};
