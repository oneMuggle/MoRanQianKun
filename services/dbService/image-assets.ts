/**
 * services/dbService/image-assets.ts
 *
 * 图片资产存取（Day 38 提取）
 *
 * 拆分原则：
 * - 本模块承载 IMAGE_ASSETS_STORE 的所有 CRUD + 运行时缓存
 * - `保存设置` / `读取设置` 仍由 index.ts 提供（通过 ESM 循环引用可解析）
 * - `清理未引用图片资源` 移除 Day 37 的 globalThis 桥接，由本模块直接导出
 * - 函数实现**与拆分前完全一致**；仅重组 import 边界
 */

import { 初始化数据库 } from './initialization';
import { IMAGE_ASSETS_STORE, STORE_NAME, SETTINGS_STORE } from './schema';
import {
    创建图片资源引用,
    解析图片资源引用ID,
    是否图片资源引用,
    注册图片资源缓存,
    批量注册图片资源缓存,
    清空图片资源缓存,
    确保CDN清单已加载,
    从CDN解析资源,
} from '../../utils/imageAssets';

// ────────────────────────────────────────────────────────────────
// 运行时缓存（模块级单例）
// ────────────────────────────────────────────────────────────────

/** dataUrl 签名 → 已生成的 image asset ref（避免重复写 IndexedDB） */
const 图片资源签名缓存 = new Map<string, string>();

const 生成图片资源ID = (): string => `img_asset_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

const 生成图片资源签名 = (dataUrl: string): string => {
    const text = typeof dataUrl === 'string' ? dataUrl.trim() : '';
    if (!text) return '';
    return `${text.length}:${text.slice(0, 96)}:${text.slice(-96)}`;
};

// ────────────────────────────────────────────────────────────────
// 对外 API
// ────────────────────────────────────────────────────────────────

/**
 * 保存图片资源到 IMAGE_ASSETS_STORE。
 * 返回 `img_asset://<id>` 形式的引用（写入存档 / settings 时使用）。
 */
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

/**
 * 读取图片资源：先 IndexedDB，再 CDN 降级。
 */
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

/** 预热 IMAGE_ASSETS_STORE 全表到运行时缓存（启动时调用） */
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

/** 清理未被存档 / settings 引用的图片资源 */
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

/** 清理运行时图片缓存（不删 IndexedDB） */
export const 清理运行时图片缓存 = (): void => {
    清空图片资源缓存();
    图片资源签名缓存.clear();
};

// ────────────────────────────────────────────────────────────────
// 内部 helper（不导出；供本模块 + migrations.ts 使用）
// ────────────────────────────────────────────────────────────────

/** 递归外置化 dataUrl 字段为 image asset 引用 */
export const 外置化图片字段 = async (value: unknown, seen: WeakSet<object> = new WeakSet()): Promise<unknown> => {
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

/** 递归收集 value 中所有 image asset 引用 ID */
export const 收集图片资源引用ID = (
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

/** 读取 IMAGE_ASSETS_STORE 全部记录（id + dataUrl，仅本地缓存用） */
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

/** 收集 saves + settings 中所有被引用的 image asset ID */
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
