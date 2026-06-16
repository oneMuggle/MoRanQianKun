/**
 * services/dbService/deviceMessages.ts
 *
 * 设备消息持久化（2026-06-03 从 dbService.ts 提取）
 * 独立模块，无外部依赖（仅依赖本目录的 initialization）
 */

import { 初始化数据库 } from './initialization';
import { DEVICE_MESSAGES_STORE } from './schema';

export interface 设备消息结构 {
    id: string;
    type: string;
    title: string;
    content: string;
    sender?: string;
    timestamp: number;
    location?: { x: number; y: number };
    tags?: string[];
}

export const 保存设备消息 = async (message: 设备消息结构): Promise<void> => {
    const db = await 初始化数据库();
    const transaction = db.transaction([DEVICE_MESSAGES_STORE], 'readwrite');
    const store = transaction.objectStore(DEVICE_MESSAGES_STORE);
    store.put(message);
    return new Promise((resolve, reject) => {
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
    });
};

export const 读取设备消息列表 = async (limit = 100, type?: string): Promise<设备消息结构[]> => {
    const db = await 初始化数据库();
    const transaction = db.transaction([DEVICE_MESSAGES_STORE], 'readonly');
    const store = transaction.objectStore(DEVICE_MESSAGES_STORE);
    const index = store.index('by_timestamp');
    const request = index.openCursor(null, 'prev');
    const results: 设备消息结构[] = [];
    return new Promise((resolve, reject) => {
        request.onsuccess = (event) => {
            const cursor = (event.target as IDBRequest<IDBCursorWithValue | null>).result;
            if (!cursor || results.length >= limit) {
                resolve(results);
                return;
            }
            const msg = cursor.value;
            if (!type || msg.type === type) {
                results.push(msg);
            }
            cursor.continue();
        };
        request.onerror = () => reject(request.error);
    });
};

export const 读取设备消息 = async (id: string): Promise<设备消息结构 | null> => {
    const db = await 初始化数据库();
    const transaction = db.transaction([DEVICE_MESSAGES_STORE], 'readonly');
    const store = transaction.objectStore(DEVICE_MESSAGES_STORE);
    const request = store.get(id);
    return new Promise((resolve, reject) => {
        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => reject(request.error);
    });
};

export const 删除设备消息 = async (id: string): Promise<void> => {
    const db = await 初始化数据库();
    const transaction = db.transaction([DEVICE_MESSAGES_STORE], 'readwrite');
    const store = transaction.objectStore(DEVICE_MESSAGES_STORE);
    store.delete(id);
    return new Promise((resolve, reject) => {
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
    });
};

export const 清空设备消息 = async (): Promise<void> => {
    const db = await 初始化数据库();
    const transaction = db.transaction([DEVICE_MESSAGES_STORE], 'readwrite');
    const store = transaction.objectStore(DEVICE_MESSAGES_STORE);
    store.clear();
    return new Promise((resolve, reject) => {
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
    });
};

export const 导出全部设备消息 = async (): Promise<设备消息结构[]> => {
    const db = await 初始化数据库();
    const transaction = db.transaction([DEVICE_MESSAGES_STORE], 'readonly');
    const store = transaction.objectStore(DEVICE_MESSAGES_STORE);
    const request = store.getAll();
    return new Promise((resolve, reject) => {
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
};

export const 导入设备消息 = async (messages: 设备消息结构[]): Promise<void> => {
    const db = await 初始化数据库();
    const transaction = db.transaction([DEVICE_MESSAGES_STORE], 'readwrite');
    const store = transaction.objectStore(DEVICE_MESSAGES_STORE);
    for (const msg of messages) {
        store.put(msg);
    }
    return new Promise((resolve, reject) => {
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
    });
};
