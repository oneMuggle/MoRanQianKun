
import { 存档结构 } from '../../types';
import { 创建图片资源引用, 解析图片资源引用ID, 是否图片资源引用, 注册图片资源缓存, 批量注册图片资源缓存, 清空图片资源缓存, 确保CDN清单已加载, 从CDN解析资源 } from '../../utils/imageAssets';
import { 获取设置项定义, 设置分类定义表, 设置键, type 设置分类类型 } from '../../utils/settingsSchema';
import { 默认功能模型占位, 规范化接口设置 } from '../../utils/apiConfig';

// Day 36：纯类型/接口抽到 types.ts（行为零修改）
export type { 存档导出结构, 存档导入结果, 研发设置模板结构, 研发设置模板导入结果, 设置存储记录, 设置管理项, StorageBreakdown } from './types';
import type { 存档导出结构, 存档导入结果, 研发设置模板结构, 研发设置模板导入结果, 设置存储记录, 设置管理项, StorageBreakdown } from './types';

// 2026-06-03 拆分：设备消息、初始化、常量已移到独立子模块
// 这里 re-export 以保持 23 个引用方的 API 兼容
export * from './deviceMessages';
import { 初始化数据库, safeNumber } from './initialization';
import { 深拷贝, 估算字符串字节数, 估算对象字节数, 估算设置摘要, 读取环境时间文本, 构建存档去重键, 清洗导入存档 } from './_helpers';
export { 初始化数据库, safeNumber } from './initialization';

// Day 37：stores 子模块承载通用 settings CRUD（保存设置 等依赖外置化图片字段的留到 Day 38 迁移）
export * from './stores';
import { 批量删除设置 } from './stores';
export {
    DB_NAME as _DB_NAME,
    STORE_NAME as _STORE_NAME,
    SETTINGS_STORE as _SETTINGS_STORE,
    IMAGE_ASSETS_STORE as _IMAGE_ASSETS_STORE,
    DEVICE_MESSAGES_STORE as _DEVICE_MESSAGES_STORE,
    VERSION as _VERSION,
} from './schema';

import {
    DB_NAME,
    STORE_NAME,
    SETTINGS_STORE,
    IMAGE_ASSETS_STORE,
    DEVICE_MESSAGES_STORE,
    VERSION,
} from './schema';

const 自动存档最大保留数 = 5;
const 存档导出版本 = 1;
const 存档保护设置键 = 设置键.存档保护;
const 图片资源迁移版本键 = 设置键.图片资源迁移版本;
const 设置记录版本 = 2;

// 2026-06-03：图片资源签名相关 helper 移到 _helpers（深拷贝/估算/读取/构建键/清洗已合并）
// 仍需图片资源签名缓存 + 生成图片资源ID + 生成图片资源签名
const 图片资源签名缓存 = new Map<string, string>();
const 生成图片资源ID = (): string => `img_asset_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
const 生成图片资源签名 = (dataUrl: string): string => {
    const text = typeof dataUrl === 'string' ? dataUrl.trim() : '';
    if (!text) return '';
    return `${text.length}:${text.slice(0, 96)}:${text.slice(-96)}`;
};

// 2026-06-03：初始化数据库 已移到 ./initialization.ts（避免与上方 import 冲突）

export const 保存图片资源 = async (dataUrl: string, preferredId?: string): Promise<string> => {
    const normalized = typeof dataUrl === 'string' ? dataUrl.trim() : '';
    if (!normalized) {
        throw new Error('保存图片资源失败：图片内容为空');
    }
    const signature = 生成图片资源签名(normalized);
    const cachedRef = signature ? 图片资源签名缓存.get(signature) : '';
    if (cachedRef) return cachedRef;
    const id = (typeof preferredId === 'string' ? preferredId.trim() : '') || 生成图片资源ID();
    const db = await 初始化数据库();
    await new Promise<void>((resolve, reject) => {
        const transaction = db.transaction([IMAGE_ASSETS_STORE], 'readwrite');
        const store = transaction.objectStore(IMAGE_ASSETS_STORE);
        const request = store.put({
            id,
            dataUrl: normalized,
            createdAt: Date.now()
        });
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
    注册图片资源缓存(id, normalized);
    const ref = 创建图片资源引用(id);
    if (signature) {
        图片资源签名缓存.set(signature, ref);
    }
    return ref;
};

export const 读取图片资源 = async (refOrId: string): Promise<string> => {
    const id = 解析图片资源引用ID(refOrId) || (typeof refOrId === 'string' ? refOrId.trim() : '');
    if (!id) return '';

    // 1. 尝试 IndexedDB
    const db = await 初始化数据库();
    try {
        const dataUrl = await new Promise<string>((resolve, reject) => {
            const transaction = db.transaction([IMAGE_ASSETS_STORE], 'readonly');
            const store = transaction.objectStore(IMAGE_ASSETS_STORE);
            const request = store.get(id);
            request.onsuccess = () => {
                const dataUrl = typeof request.result?.dataUrl === 'string' ? request.result.dataUrl.trim() : '';
                if (dataUrl) {
                    注册图片资源缓存(id, dataUrl);
                    const signature = 生成图片资源签名(dataUrl);
                    if (signature) {
                        图片资源签名缓存.set(signature, 创建图片资源引用(id));
                    }
                }
                resolve(dataUrl);
            };
            request.onerror = () => reject(request.error);
        });
        if (dataUrl) return dataUrl;
    } catch {
        // IndexedDB 读取失败，继续尝试 CDN
    }

    // 2. 尝试从 CDN 加载
    确保CDN清单已加载();
    const cdnUrl = 从CDN解析资源(id);
    if (cdnUrl) {
        try {
            const response = await fetch(cdnUrl);
            if (response.ok) {
                const blob = await response.blob();
                const dataUrl = await new Promise<string>((res, rej) => {
                    const reader = new FileReader();
                    reader.onload = () => res(reader.result as string);
                    reader.onerror = rej;
                    reader.readAsDataURL(blob);
                });
                注册图片资源缓存(id, dataUrl);
                // 写入 IndexedDB 作为本地缓存
                try {
                    await 保存图片资源(dataUrl, id);
                } catch {
                    // 写入失败不影响使用
                }
                return dataUrl;
            }
        } catch {
            // CDN 加载失败，优雅降级
        }
    }

    return '';
};

export const 预热图片资源缓存 = async (): Promise<number> => {
    const db = await 初始化数据库();
    const entries = await new Promise<Array<{ id: string; dataUrl: string }>>((resolve, reject) => {
        const transaction = db.transaction([IMAGE_ASSETS_STORE], 'readonly');
        const store = transaction.objectStore(IMAGE_ASSETS_STORE);
        const request = store.getAll();
        request.onsuccess = () => resolve(
            (Array.isArray(request.result) ? request.result : [])
                .map((item: any) => ({
                    id: typeof item?.id === 'string' ? item.id.trim() : '',
                    dataUrl: typeof item?.dataUrl === 'string' ? item.dataUrl.trim() : ''
                }))
                .filter((item) => item.id && item.dataUrl)
        );
        request.onerror = () => reject(request.error);
    });
    清空图片资源缓存();
    图片资源签名缓存.clear();
    批量注册图片资源缓存(entries);
    entries.forEach((item) => {
        const signature = 生成图片资源签名(item.dataUrl);
        if (signature) {
            图片资源签名缓存.set(signature, 创建图片资源引用(item.id));
        }
    });
    return entries.length;
};

const 外置化图片字段 = async (value: unknown, seen: WeakSet<object> = new WeakSet()): Promise<unknown> => {
    if (!value || typeof value !== 'object') {
        if (typeof value === 'string') {
            const text = value.trim();
            if (/^data:image\//i.test(text)) {
                return await 保存图片资源(text);
            }
        }
        return value;
    }
    if (seen.has(value as object)) return value;
    seen.add(value as object);

    if (Array.isArray(value)) {
        const nextList = [];
        for (const item of value) {
            nextList.push(await 外置化图片字段(item, seen));
        }
        return nextList;
    }

    const source = value as Record<string, unknown>;
    const next: Record<string, unknown> = { ...source };
    for (const [key, child] of Object.entries(source)) {
        if (typeof child === 'string') {
            const text = child.trim();
            if (text) {
                if ((key === '本地路径' || key === '图片URL' || key === '背景图片' || key === '头像图片URL' || key.endsWith('图片URL') || key.endsWith('音频URL')) && /^data:(image|audio)\//i.test(text)) {
                    next[key] = await 保存图片资源(text);
                    continue;
                }
                if ((key === '本地路径' || key === '图片URL' || key === '背景图片' || key === '头像图片URL' || key.endsWith('图片URL') || key.endsWith('音频URL')) && 是否图片资源引用(text)) {
                    next[key] = 创建图片资源引用(解析图片资源引用ID(text));
                    continue;
                }
            }
        }
        if (child && typeof child === 'object') {
            next[key] = await 外置化图片字段(child, seen);
        }
    }
    return next;
};

const 收集图片资源引用ID = (
    value: unknown,
    refs: Set<string>,
    seen: WeakSet<object> = new WeakSet()
): void => {
    if (typeof value === 'string') {
        const refId = 解析图片资源引用ID(value);
        if (refId) refs.add(refId);
        return;
    }
    if (!value || typeof value !== 'object') return;
    if (seen.has(value as object)) return;
    seen.add(value as object);

    if (Array.isArray(value)) {
        value.forEach((item) => 收集图片资源引用ID(item, refs, seen));
        return;
    }

    Object.values(value as Record<string, unknown>).forEach((child) => {
        收集图片资源引用ID(child, refs, seen);
    });
};

const 读取全部图片资源记录 = async (): Promise<Array<{ id: string; dataUrl?: string }>> => {
    const db = await 初始化数据库();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([IMAGE_ASSETS_STORE], 'readonly');
        const store = transaction.objectStore(IMAGE_ASSETS_STORE);
        const request = store.getAll();
        request.onsuccess = () => resolve(
            (Array.isArray(request.result) ? request.result : [])
                .filter((item: any) => typeof item?.id === 'string')
                .map((item: any) => ({
                    id: item.id.trim(),
                    dataUrl: typeof item?.dataUrl === 'string' ? item.dataUrl.trim() : undefined
                }))
                .filter((item) => item.id)
        );
        request.onerror = () => reject(request.error);
    });
};

const 读取已引用图片资源ID集合 = async (): Promise<Set<string>> => {
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

    const refs = new Set<string>();
    saves.forEach((save) => 收集图片资源引用ID(save, refs));
    settings.forEach((item) => 收集图片资源引用ID(item?.value, refs));
    return refs;
};

export const 清理未引用图片资源 = async (): Promise<number> => {
    const [referencedIds, assetEntries] = await Promise.all([
        读取已引用图片资源ID集合(),
        读取全部图片资源记录()
    ]);
    const unusedIds = assetEntries
        .map((item) => item.id)
        .filter((id) => !referencedIds.has(id));
    if (unusedIds.length <= 0) return 0;

    const db = await 初始化数据库();
    await new Promise<void>((resolve, reject) => {
        const transaction = db.transaction([IMAGE_ASSETS_STORE], 'readwrite');
        const store = transaction.objectStore(IMAGE_ASSETS_STORE);
        unusedIds.forEach((id) => store.delete(id));
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
    });

    图片资源签名缓存.clear();
    await 预热图片资源缓存();
    return unusedIds.length;
};

// Day 37：注册到 globalThis，供 ./stores（删除设置 / 批量删除设置）通过 getter 桥接调用
// Day 38 image-assets.ts 完成后可移除此桥接
(globalThis as any).__dbService_清理未引用图片资源 = 清理未引用图片资源;

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

// 类型已抽到 ./types（re-export 见顶部）
const 研发设置模板版本 = 1;

export const 导出存档数据 = async (): Promise<存档导出结构> => {
    const saves = await 读取存档列表();
    return {
        version: 存档导出版本,
        exportedAt: new Date().toISOString(),
        saves
    };
};

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
        throw new Error('存档保护已开启，请先在“设置-数据存储”中关闭后再执行覆盖导入。');
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

export const 删除存档 = async (id: number): Promise<void> => {
    if (await 读取存档保护状态()) {
        throw new Error('存档保护已开启，请先在“设置-数据存储”中关闭后再删除存档。');
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

export const 清空存档数据 = async (): Promise<void> => {
    if (await 读取存档保护状态()) {
        throw new Error('存档保护已开启，请先在“设置-数据存储”中关闭后再清空存档。');
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

export const 删除最近自动存档 = async (): Promise<void> => {
    if (await 读取存档保护状态()) {
        throw new Error('存档保护已开启，请先在“设置-数据存储”中关闭后再删除存档。');
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

// 类型已抽到 ./types（re-export 见顶部）

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

export const 保存设置 = async (key: string, value: any): Promise<void> => {
    const db = await 初始化数据库();
    const persistedValue = await 外置化图片字段(value);
    const def = 获取设置项定义(key);
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([SETTINGS_STORE], 'readwrite');
        const store = transaction.objectStore(SETTINGS_STORE);
        const request = store.put({
            key,
            value: persistedValue,
            version: 设置记录版本,
            updatedAt: Date.now(),
            category: def?.category || 'unknown'
        });
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
};

export const 读取设置 = async (key: string): Promise<any> => {
    const db = await 初始化数据库();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([SETTINGS_STORE], 'readonly');
        const store = transaction.objectStore(SETTINGS_STORE);
        const request = store.get(key);
        request.onsuccess = () => resolve(request.result ? request.result.value : null);
        request.onerror = () => reject(request.error);
    });
};

// `获取设置管理清单` 已迁移到 ./stores（export * from './stores' 见顶部）

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

export const 读取存档保护状态 = async (): Promise<boolean> => {
    const value = await 读取设置(存档保护设置键);
    return value === true;
};

export const 设置存档保护状态 = async (enabled: boolean): Promise<void> => {
    await 保存设置(存档保护设置键, enabled === true);
};

// `删除设置` / `批量删除设置` 已迁移到 ./stores（export * from './stores' 见顶部）

const 自定义背景天赋保护键 = [
    设置键.视觉设置,
    设置键.自定义天赋,
    设置键.自定义背景,
    设置键.自定义开局预设
] as const;

const 提取可保留接口配置 = (raw: unknown): unknown => {
    const normalized = 规范化接口设置(raw);
    const feature = normalized.功能模型占位;
    return {
        activeConfigId: normalized.activeConfigId,
        configs: 深拷贝(normalized.configs),
        // 这里直接保留完整的归一化功能配置，避免新增字段时因白名单遗漏导致“能改不能存”。
        功能模型占位: 深拷贝({
            ...默认功能模型占位,
            ...feature
        })
    };
};

const 读取设置保护快照 = async (keys: string[]): Promise<Array<{ key: string; value: any }>> => {
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

const 回写设置保护快照 = async (snapshots: Array<{ key: string; value: any }>): Promise<void> => {
    for (const item of snapshots) {
        await 保存设置(item.key, item.value);
    }
};

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

const 清理运行时图片缓存 = (): void => {
    清空图片资源缓存();
    图片资源签名缓存.clear();
};

const 清除浏览器侧缓存 = async (options?: { includeLocalStorage?: boolean }): Promise<void> => {
    const tasks: Promise<unknown>[] = [];

    if (typeof window !== 'undefined' && 'caches' in window) {
        tasks.push((async () => {
            const keys = await window.caches.keys();
            await Promise.allSettled(keys.map((key) => window.caches.delete(key)));
        })());
    }

    if (typeof sessionStorage !== 'undefined') {
        sessionStorage.clear();
    }

    if (options?.includeLocalStorage && typeof localStorage !== 'undefined') {
        localStorage.clear();
    }

    await Promise.allSettled(tasks);
};

const 清除NPC图库字段 = (npc: any): any => {
    if (!npc || typeof npc !== 'object' || Array.isArray(npc)) return npc;
    const nextNpc = { ...npc };
    delete nextNpc.最近生图结果;
    delete nextNpc.图片档案;
    return nextNpc;
};

const 清除存档图库字段 = (save: 存档结构): 存档结构 => {
    const nextSave = { ...save } as 存档结构 & Record<string, unknown>;
    delete nextSave.场景图片档案;
    if (Array.isArray(save?.社交)) {
        nextSave.社交 = save.社交.map((npc: any) => 清除NPC图库字段(npc));
    }
    return nextSave as 存档结构;
};

export const 清空全部设置 = async (options?: { 保留APIKey?: boolean; 保留自定义背景天赋?: boolean }): Promise<void> => {
    const keepKeys = new Set<string>();
    if (options?.保留APIKey) keepKeys.add(设置键.API配置);
    if (options?.保留自定义背景天赋) {
        自定义背景天赋保护键.forEach((key) => keepKeys.add(key));
    }
    if (await 读取存档保护状态()) {
        keepKeys.add(存档保护设置键);
    }

    const snapshots = await 读取设置保护快照(Array.from(keepKeys));
    const db = await 初始化数据库();
    const transaction = db.transaction([SETTINGS_STORE], 'readwrite');
    transaction.objectStore(SETTINGS_STORE).clear();

    await new Promise<void>((resolve, reject) => {
        transaction.oncomplete = async () => {
            try {
                await 回写设置保护快照(snapshots);
                resolve();
            } catch (error) {
                reject(error);
            }
        };
        transaction.onerror = () => reject(transaction.error);
    });
    await 清理未引用图片资源();
    清理运行时图片缓存();
    await 清除浏览器侧缓存();
};

export const 清除自定义背景与天赋 = async (): Promise<void> => {
    const visualSettings = await 读取设置(设置键.视觉设置);
    if (visualSettings && typeof visualSettings === 'object') {
        const nextVisual = { ...visualSettings };
        if ('背景图片' in nextVisual) {
            (nextVisual as any).背景图片 = '';
            await 保存设置(设置键.视觉设置, nextVisual);
        }
    }
    await 批量删除设置([设置键.自定义天赋, 设置键.自定义背景, 设置键.自定义开局预设]);
    await 清理未引用图片资源();
};

export const 清除图库相关内容 = async (): Promise<void> => {
    const db = await 初始化数据库();

    const saves = await new Promise<存档结构[]>((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.getAll();
        request.onsuccess = () => resolve(Array.isArray(request.result) ? request.result : []);
        request.onerror = () => reject(request.error);
    });

    await new Promise<void>((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME, SETTINGS_STORE], 'readwrite');
        const saveStore = transaction.objectStore(STORE_NAME);
        const settingsStore = transaction.objectStore(SETTINGS_STORE);

        saves.forEach((save) => {
            if (!save || typeof save !== 'object') return;
            saveStore.put(清除存档图库字段(save));
        });

        settingsStore.delete(设置键.场景图片档案);

        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
    });

    await 清理未引用图片资源();
};

export const 清除图片相关提示词与预设 = async (): Promise<void> => {
    const currentSettings = await 读取设置(设置键.API配置);
    const normalizedSettings = 规范化接口设置(currentSettings);
    const currentFeature = normalizedSettings.功能模型占位;
    const defaultFeature = 默认功能模型占位;

    const nextSettings = {
        ...normalizedSettings,
        功能模型占位: {
            ...currentFeature,
            画师串预设列表: defaultFeature.画师串预设列表,
            当前NPC画师串预设ID: defaultFeature.当前NPC画师串预设ID,
            当前场景画师串预设ID: defaultFeature.当前场景画师串预设ID,
            词组转化器提示词: defaultFeature.词组转化器提示词,
            模型词组转化器预设列表: defaultFeature.模型词组转化器预设列表,
            词组转化器提示词预设列表: defaultFeature.词组转化器提示词预设列表,
            当前NAI词组转化器提示词预设ID: defaultFeature.当前NAI词组转化器提示词预设ID,
            当前NPC词组转化器提示词预设ID: defaultFeature.当前NPC词组转化器提示词预设ID,
            当前场景词组转化器提示词预设ID: defaultFeature.当前场景词组转化器提示词预设ID,
            当前场景判定提示词预设ID: defaultFeature.当前场景判定提示词预设ID,
            角色锚点列表: defaultFeature.角色锚点列表,
            当前角色锚点ID: defaultFeature.当前角色锚点ID,
            PNG画风预设列表: defaultFeature.PNG画风预设列表,
            当前PNG画风预设ID: defaultFeature.当前PNG画风预设ID,
            NovelAI负面提示词: defaultFeature.NovelAI负面提示词
        }
    };

    await 保存设置(设置键.API配置, nextSettings);
    await 清理未引用图片资源();
};

export const 清除系统缓存 = async (): Promise<void> => {
    清理运行时图片缓存();
    await 清除浏览器侧缓存();
};

// StorageBreakdown 已抽到 ./types（re-export 见顶部）

export const 获取详细存储信息 = async (): Promise<StorageBreakdown> => {
    const db = await 初始化数据库();

    // 1. Calculate Saves Size
    const savesTx = db.transaction([STORE_NAME], 'readonly');
    const savesStore = savesTx.objectStore(STORE_NAME);
    const saves = await new Promise<any[]>((resolve) => {
        savesStore.getAll().onsuccess = (e) => resolve((e.target as any).result || []);
    });
    const savesSize = 估算对象字节数(saves);

    // 2. Calculate Settings, API, and Prompts Size
    const settingsTx = db.transaction([SETTINGS_STORE], 'readonly');
    const settingsStore = settingsTx.objectStore(SETTINGS_STORE);
    const settings = await new Promise<any[]>((resolve) => {
        settingsStore.getAll().onsuccess = (e) => resolve((e.target as any).result || []);
    });
    
    let apiSize = 0;
    let promptsSize = 0;
    let otherSettingsSize = 0;

    settings.forEach(s => {
        const size = 估算对象字节数(s);
        if (s.key === 设置键.API配置) {
            apiSize += size;
        } else if (s.key === 设置键.提示词池) {
            promptsSize += size;
        } else {
            otherSettingsSize += size;
        }
    });

    // 3. Calculate Image Assets Size
    const imageAssetsTx = db.transaction([IMAGE_ASSETS_STORE], 'readonly');
    const imageAssetsStore = imageAssetsTx.objectStore(IMAGE_ASSETS_STORE);
    const imageAssets = await new Promise<any[]>((resolve) => {
        imageAssetsStore.getAll().onsuccess = (e) => resolve((e.target as any).result || []);
    });
    const imageAssetsSize = 估算对象字节数(imageAssets);

    // 4. Get Total Usage
    let usage = 0;
    let quota = 0;
    if (navigator.storage && navigator.storage.estimate) {
        const estimate = await navigator.storage.estimate();
        usage = estimate.usage || 0;
        quota = estimate.quota || 0;
    }

    // 5. Calculate overhead/cache
    const knownUsage = savesSize + apiSize + promptsSize + otherSettingsSize + imageAssetsSize;
    const systemCache = Math.max(0, usage - knownUsage);

    return {
        usage,
        quota,
        details: {
            saves: savesSize,
            settings: otherSettingsSize,
            prompts: promptsSize,
            api: apiSize,
            imageAssets: imageAssetsSize,
            cache: systemCache
        }
    };
};

export const 清空全部数据 = async (options?: { 保留APIKey?: boolean; 保留自定义背景天赋?: boolean }): Promise<void> => {
    const db = await 初始化数据库();
    const 存档保护开启 = await 读取存档保护状态();
    const keepKeys = new Set<string>();
    if (options?.保留APIKey) keepKeys.add(设置键.API配置);
    if (options?.保留自定义背景天赋) {
        自定义背景天赋保护键.forEach((key) => keepKeys.add(key));
    }
    if (存档保护开启) {
        keepKeys.add(存档保护设置键);
    }
    const snapshots = await 读取设置保护快照(Array.from(keepKeys));

    const transaction = db.transaction([STORE_NAME, SETTINGS_STORE], 'readwrite');
    if (!存档保护开启) {
        transaction.objectStore(STORE_NAME).clear();
    }
    transaction.objectStore(SETTINGS_STORE).clear();

    await new Promise<void>((resolve, reject) => {
        transaction.oncomplete = async () => {
            try {
                await 回写设置保护快照(snapshots);
                resolve();
            } catch (error) {
                reject(error);
            }
        };
        transaction.onerror = () => reject(transaction.error);
    });
    await 清理未引用图片资源();
    清理运行时图片缓存();
    await 清除浏览器侧缓存({ includeLocalStorage: true });
};

export const 强制彻底清空全部数据 = async (): Promise<void> => {
    const db = await 初始化数据库();
    const transaction = db.transaction([STORE_NAME, SETTINGS_STORE, IMAGE_ASSETS_STORE, DEVICE_MESSAGES_STORE], 'readwrite');
    transaction.objectStore(STORE_NAME).clear();
    transaction.objectStore(SETTINGS_STORE).clear();
    transaction.objectStore(IMAGE_ASSETS_STORE).clear();
    transaction.objectStore(DEVICE_MESSAGES_STORE).clear();

    await new Promise<void>((resolve, reject) => {
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
    });

    清理运行时图片缓存();
    await 清除浏览器侧缓存({ includeLocalStorage: true });
};

export const 清空数据库 = async (保留APIKey: boolean): Promise<void> => {
    await 清空全部数据({ 保留APIKey });
};
