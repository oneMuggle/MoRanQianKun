/**
 * services/dbService/transactions.ts
 *
 * IndexedDB 事务封装（Day 37 提取）
 *
 * 拆分原则：
 * - 提供"瘦封装"withTransaction / withReadonlyTransaction / withReadwriteTransaction
 * - **不替换**现有 30+ 处内联 `db.transaction([...], 'readwrite')` 调用点
 *   避免对外部 23+ 引用方引入"行为级"修改（spec R2 高风险：事务边界）
 * - 新增代码可选用本模块的封装；后续在独立 commit 中渐进替换
 */

import { 初始化数据库 } from './initialization';

// ────────────────────────────────────────────────────────────────
// 类型
// ────────────────────────────────────────────────────────────────

/** 事务模式 */
export type 事务模式 = 'readonly' | 'readwrite';

/** 单 store 包装 */
export interface 单事务上下文 {
    db: IDBDatabase;
    transaction: IDBTransaction;
    store: IDBObjectStore;
    mode: 事务模式;
}

/** 多 store 包装（按 store 名索引） */
export interface 多事务上下文 {
    db: IDBDatabase;
    transaction: IDBTransaction;
    stores: Record<string, IDBObjectStore>;
    mode: 事务模式;
}

// ────────────────────────────────────────────────────────────────
// 核心封装（薄封装，行为等价于现有内联模式）
// ────────────────────────────────────────────────────────────────

/**
 * 打开一个读写事务并执行回调。
 * 回调返回的 Promise resolve 后才 commit（保持与现有 `transaction.oncomplete` 语义一致）。
 */
export const withReadwriteTransaction = async <T>(
    storeNames: string | string[],
    callback: (ctx: 多事务上下文) => Promise<T>
): Promise<T> => {
    const names = Array.isArray(storeNames) ? storeNames : [storeNames];
    const db = await 初始化数据库();
    const transaction = db.transaction(names, 'readwrite');
    const stores: Record<string, IDBObjectStore> = {};
    for (const name of names) {
        stores[name] = transaction.objectStore(name);
    }

    try {
        const result = await callback({ db, transaction, stores, mode: 'readwrite' });
        await new Promise<void>((resolve, reject) => {
            transaction.oncomplete = () => resolve();
            transaction.onerror = () => reject(transaction.error);
            transaction.onabort = () => reject(transaction.error);
        });
        return result;
    } catch (err) {
        try { transaction.abort(); } catch { /* ignore */ }
        throw err;
    }
};

/**
 * 打开一个只读事务并执行回调。
 */
export const withReadonlyTransaction = async <T>(
    storeNames: string | string[],
    callback: (ctx: 多事务上下文) => Promise<T>
): Promise<T> => {
    const names = Array.isArray(storeNames) ? storeNames : [storeNames];
    const db = await 初始化数据库();
    const transaction = db.transaction(names, 'readonly');
    const stores: Record<string, IDBObjectStore> = {};
    for (const name of names) {
        stores[name] = transaction.objectStore(name);
    }
    return callback({ db, transaction, stores, mode: 'readonly' });
};

/** 兼容旧调用约定：`withTransaction(storeName, mode, callback)` 形式 */
export const withTransaction = async <T>(
    storeName: string,
    mode: 事务模式,
    callback: (ctx: 单事务上下文) => Promise<T> | T
): Promise<T> => {
    const db = await 初始化数据库();
    const transaction = db.transaction([storeName], mode);
    const store = transaction.objectStore(storeName);
    const ctx: 单事务上下文 = { db, transaction, store, mode };
    return callback(ctx);
};
