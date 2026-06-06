
import { 存档结构 } from '../../types';
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

// Day 37：stores 子模块承载通用 settings CRUD
export * from './stores';
import { 批量删除设置 } from './stores';

// Day 38：image-assets 子模块承载 IMAGE_ASSETS_STORE CRUD + 运行时缓存
export * from './image-assets';
import { 外置化图片字段, 清理未引用图片资源, 清理运行时图片缓存 } from './image-assets';

// Day 38：migrations 子模块承载版本升级 / 模板导入导出
export * from './migrations';
import {
    读取设置保护快照,
    回写设置保护快照,
    自定义背景天赋保护键,
} from './migrations';

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

// Day 38：图片资源签名缓存 / 生成 ID / 生成签名 / 保存图片资源 / 读取图片资源 /
// 预热图片资源缓存 / 外置化图片字段 / 收集图片资源引用ID / 读取全部图片资源记录 /
// 读取已引用图片资源ID集合 / 清理未引用图片资源 / 清理运行时图片缓存 已迁移到 ./image-assets
// Day 37 globalThis 桥接随之移除

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
// `研发设置模板版本` / `导出研发设置模板` / `导入研发设置模板` 已迁移到 ./migrations

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
// `迁移图片资源到独立存储` / `导出研发设置模板` / `导入研发设置模板` 已迁移到 ./migrations
// `清理运行时图片缓存` 已迁移到 ./image-assets

export const 读取存档保护状态 = async (): Promise<boolean> => {
    const value = await 读取设置(存档保护设置键);
    return value === true;
};

export const 设置存档保护状态 = async (enabled: boolean): Promise<void> => {
    await 保存设置(存档保护设置键, enabled === true);
};

// `删除设置` / `批量删除设置` 已迁移到 ./stores（export * from './stores' 见顶部）
// `自定义背景天赋保护键` / `读取设置保护快照` / `回写设置保护快照` 已迁移到 ./migrations

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
