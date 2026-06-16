/**
 * services/dbService/initialization.ts
 *
 * 数据库初始化（2026-06-03 从 dbService.ts 提取）
 */

import {
    DB_NAME,
    VERSION,
    STORE_NAME,
    SETTINGS_STORE,
    IMAGE_ASSETS_STORE,
    DEVICE_MESSAGES_STORE,
} from './schema';

export const 初始化数据库 = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, VERSION);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);

        request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
            }
            if (!db.objectStoreNames.contains(SETTINGS_STORE)) {
                db.createObjectStore(SETTINGS_STORE, { keyPath: 'key' });
            }
            if (!db.objectStoreNames.contains(IMAGE_ASSETS_STORE)) {
                db.createObjectStore(IMAGE_ASSETS_STORE, { keyPath: 'id' });
            }
            if (!db.objectStoreNames.contains(DEVICE_MESSAGES_STORE)) {
                const msgStore = db.createObjectStore(DEVICE_MESSAGES_STORE, { keyPath: 'id' });
                msgStore.createIndex('by_type', 'type', { unique: false });
                msgStore.createIndex('by_timestamp', 'timestamp', { unique: false });
            }
        };
    });
};

/** 安全数值解析 helper */
export const safeNumber = (value: unknown, fallback: number): number => {
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    if (typeof value === 'string' && value.trim()) {
        const parsed = Number(value);
        if (Number.isFinite(parsed)) return parsed;
    }
    return fallback;
};
