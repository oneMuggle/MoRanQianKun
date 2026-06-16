/**
 * services/dbService/save-archive.ts
 *
 * 存档管理（Day 39 提取）
 *
 * 拆分原则：
 * - 本模块承载 STORE_NAME (saves) 的所有 CRUD + 导入导出
 * - `读取存档保护状态` / `设置存档保护状态` 仍定义在 index.ts 中（migrations.ts 也依赖）
 *   形成 ESM 循环：save-archive → index → save-archive（函数体内调用可解析）
 * - 函数实现**与拆分前完全一致**；仅重组 import 边界
 */

import { 存档结构 } from './types';
import { 初始化数据库, safeNumber } from './initialization';
import { STORE_NAME } from './schema';
import { 清洗导入存档, 构建存档去重键 } from './_helpers';
import { 外置化图片字段, 清理未引用图片资源 } from './image-assets';
import { 读取存档保护状态 } from './stores';
import type { 存档导出结构, 存档导入结果 } from './types';

// ────────────────────────────────────────────────────────────────
// 常量
// ────────────────────────────────────────────────────────────────

/** 自动存档最大保留数（不含 1 个待写入的） */
const 自动存档最大保留数 = 5;

/** 存档导出格式版本号 */
const 存档导出版本 = 1;

// ────────────────────────────────────────────────────────────────
// 内部 helper（不导出；仅为本模块服务）
// ────────────────────────────────────────────────────────────────

const 删除重复自动存档签名 = async (db: IDBDatabase, signature: string): Promise<void> => {
    const target = (signature || '').trim();
    if (!target) return;
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.getAll();
        request.onsuccess = () => {
            const allSaves: 存档结构[] = request.result;
            allSaves
                .filter((s) => s.类型 === 'auto' && (s.元数据?.自动存档签名 || '').trim() === target)
                .forEach((s) => {
                    store.delete(s.id);
                });
            resolve();
        };
        request.onerror = () => reject(request.error);
    });
};

// ────────────────────────────────────────────────────────────────
// 对外 API
// ────────────────────────────────────────────────────────────────

/** 维护自动存档数量：超过 `maxKeep` 时删除最早的 */
export const 维护自动存档 = async (db: IDBDatabase, maxKeep: number = 自动存档最大保留数): Promise<void> => {
    const keepCount = Math.max(0, Math.floor(maxKeep));
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.getAll();

        request.onsuccess = () => {
            const allSaves: 存档结构[] = request.result;
            const autoSaves = allSaves.filter(s => s.类型 === 'auto');

            // Sort by timestamp asc (oldest first)
            autoSaves.sort((a, b) => a.时间戳 - b.时间戳);

            if (autoSaves.length > keepCount) {
                const toDelete = autoSaves.slice(0, autoSaves.length - keepCount);
                toDelete.forEach(s => {
                    store.delete(s.id);
                });
            }
            resolve();
        };
        request.onerror = () => reject(request.error);
    });
};

/** 保存存档：自动外置化图片、自动去重、自动维护 */
export const 保存存档 = async (存档: Omit<存档结构, 'id'>): Promise<number> => {
    const db = await 初始化数据库();
    const normalized = 清洗导入存档(存档, safeNumber);
    if (!normalized) {
        throw new Error('保存存档失败：存档数据结构不完整');
    }
    const persistedSave = await 外置化图片字段(normalized) as Omit<存档结构, 'id'>;

    if (persistedSave.类型 === 'auto') {
        const signature = (persistedSave.元数据?.自动存档签名 || '').trim();
        if (signature) {
            await 删除重复自动存档签名(db, signature);
        }
        await 维护自动存档(db, 自动存档最大保留数 - 1);
    }

    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.add(persistedSave);

        request.onsuccess = () => resolve(request.result as number);
        request.onerror = () => reject(request.error);
    });
};

/** 导出全部存档为可序列化的 JSON */
export const 导出存档数据 = async (): Promise<存档导出结构> => {
    const saves = await 读取存档列表();
    return {
        version: 存档导出版本,
        exportedAt: new Date().toISOString(),
        saves
    };
};

/** 导入存档数组（去重 + 外置化图片） */
export const 导入存档数据 = async (
    payload: unknown,
    options?: { 覆盖现有?: boolean }
): Promise<存档导入结果> => {
    const rawList = Array.isArray(payload)
        ? payload
        : Array.isArray((payload as any)?.saves)
            ? (payload as any).saves
            : [];

    if (!Array.isArray(rawList) || rawList.length === 0) {
        throw new Error('导入失败：未找到可导入的存档数组');
    }

    const normalizedCandidates = rawList
        .map((item) => 清洗导入存档(item, safeNumber))
        .filter((item): item is Omit<存档结构, 'id'> => Boolean(item));
    if (normalizedCandidates.length === 0) {
        throw new Error('导入失败：存档内容无有效条目');
    }

    const db = await 初始化数据库();
    if (options?.覆盖现有 && await 读取存档保护状态()) {
        throw new Error('存档保护已开启，请先在"设置-数据存储"中关闭后再执行覆盖导入。');
    }
    const existingSaves = options?.覆盖现有 ? [] : await 读取存档列表();
    const dedupeKeySet = new Set(existingSaves.map((item) => 构建存档去重键(item, safeNumber)));

    let imported = 0;
    let skipped = 0;

    const persistedCandidates: Array<Omit<存档结构, 'id'>> = [];
    for (const item of normalizedCandidates) {
        persistedCandidates.push(await 外置化图片字段(item) as Omit<存档结构, 'id'>);
    }

    await new Promise<void>((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        if (options?.覆盖现有) {
            store.clear();
            dedupeKeySet.clear();
        }

        persistedCandidates.forEach((item) => {
            const key = 构建存档去重键(item, safeNumber);
            if (dedupeKeySet.has(key)) {
                skipped += 1;
                return;
            }
            dedupeKeySet.add(key);
            store.add(item);
            imported += 1;
        });

        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
    });

    await 维护自动存档(db, 自动存档最大保留数);

    return {
        total: normalizedCandidates.length,
        imported,
        skipped
    };
};

/** 读取全部存档（按时间戳降序） */
export const 读取存档列表 = async (): Promise<存档结构[]> => {
    const db = await 初始化数据库();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.getAll();

        request.onsuccess = () => {
            const list = request.result as 存档结构[];
            // Sort by timestamp desc
            list.sort((a, b) => b.时间戳 - a.时间戳);
            resolve(list);
        };
        request.onerror = () => reject(request.error);
    });
};

/** 按 id 读取单个存档 */
export const 读取存档 = async (id: number): Promise<存档结构> => {
    const db = await 初始化数据库();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(id);

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
};

/** 按 id 删除存档（保护检查 + 清理未引用图片） */
export const 删除存档 = async (id: number): Promise<void> => {
    if (await 读取存档保护状态()) {
        throw new Error('存档保护已开启，请先在"设置-数据存储"中关闭后再删除存档。');
    }
    const db = await 初始化数据库();
    await new Promise<void>((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.delete(id);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
    await 清理未引用图片资源();
};

/** 清空全部存档（保护检查 + 清理未引用图片） */
export const 清空存档数据 = async (): Promise<void> => {
    if (await 读取存档保护状态()) {
        throw new Error('存档保护已开启，请先在"设置-数据存储"中关闭后再清空存档。');
    }
    const db = await 初始化数据库();
    await new Promise<void>((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.clear();
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
    await 清理未引用图片资源();
};

/** 删除最近一次自动存档（保护检查 + 清理未引用图片） */
export const 删除最近自动存档 = async (): Promise<void> => {
    if (await 读取存档保护状态()) {
        throw new Error('存档保护已开启，请先在"设置-数据存储"中关闭后再删除存档。');
    }
    const db = await 初始化数据库();
    await new Promise<void>((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.getAll();

        request.onsuccess = () => {
            const allSaves: 存档结构[] = request.result;
            const latestAuto = allSaves
                .filter((s) => s.类型 === 'auto')
                .sort((a, b) => b.时间戳 - a.时间戳)[0];
            if (!latestAuto) {
                resolve();
                return;
            }
            const delReq = store.delete(latestAuto.id);
            delReq.onsuccess = () => resolve();
            delReq.onerror = () => reject(delReq.error);
        };
        request.onerror = () => reject(request.error);
    });
    await 清理未引用图片资源();
};
