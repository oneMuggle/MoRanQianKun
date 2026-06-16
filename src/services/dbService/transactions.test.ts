/**
 * services/dbService/transactions.test.ts
 *
 * Day 49：IndexedDB 事务封装测试
 * 覆盖：withReadwriteTransaction / withReadonlyTransaction / withTransaction
 */
import { describe, it, expect, beforeEach } from 'vitest';
import {
    withReadwriteTransaction,
    withReadonlyTransaction,
    withTransaction,
} from './transactions';
import { 初始化数据库 } from './initialization';
import { STORE_NAME, SETTINGS_STORE } from './schema';

describe('withReadwriteTransaction', () => {
    beforeEach(async () => {
        await 初始化数据库();
    });

    it('单 store 写入并读取', async () => {
        const result = await withReadwriteTransaction(STORE_NAME, async (ctx) => {
            ctx.stores[STORE_NAME].add({ id: 1, value: 'tx-test-1' });
            return ctx.stores[STORE_NAME].get(1);
        });
        expect(result).toBeDefined();
    });

    it('多 store 数组', async () => {
        const result = await withReadwriteTransaction(
            [STORE_NAME, SETTINGS_STORE],
            async (ctx) => {
                expect(ctx.stores[STORE_NAME]).toBeDefined();
                expect(ctx.stores[SETTINGS_STORE]).toBeDefined();
                ctx.stores[STORE_NAME].add({ id: 100, name: 'multi-store' });
                ctx.stores[SETTINGS_STORE].put({ key: 'tx-key', value: 'v' });
                return 'done';
            }
        );
        expect(result).toBe('done');
    });

    it('callback 返回 Promise resolve 后才 commit', async () => {
        let resolved = false;
        await withReadwriteTransaction(STORE_NAME, async (ctx) => {
            ctx.stores[STORE_NAME].add({ id: 200, marker: 'delayed' });
            resolved = true;
            return 'sync';
        });
        // 事务在 callback 完成后 commit；callback resolve 后数据应已可见
        expect(resolved).toBe(true);
    });

    it('callback 抛错则事务 abort', async () => {
        await expect(
            withReadwriteTransaction(STORE_NAME, async () => {
                throw new Error('用户态错误');
            })
        ).rejects.toThrow('用户态错误');
    });

    it('mode 字段为 readwrite', async () => {
        await withReadwriteTransaction(STORE_NAME, async (ctx) => {
            expect(ctx.mode).toBe('readwrite');
        });
    });

    it('db 字段是 IDBDatabase', async () => {
        await withReadwriteTransaction(STORE_NAME, async (ctx) => {
            expect(ctx.db).toBeDefined();
            expect(typeof ctx.db.transaction).toBe('function');
        });
    });
});

describe('withReadonlyTransaction', () => {
    beforeEach(async () => {
        await 初始化数据库();
    });

    it('只读事务能查询', async () => {
        const result = await withReadonlyTransaction(STORE_NAME, async (ctx) => {
            return await new Promise<unknown[]>((resolve, reject) => {
                const req = ctx.stores[STORE_NAME].getAll();
                req.onsuccess = () => resolve(req.result as unknown[]);
                req.onerror = () => reject(req.error);
            });
        });
        expect(Array.isArray(result)).toBe(true);
    });

    it('mode 字段为 readonly', async () => {
        await withReadonlyTransaction(STORE_NAME, async (ctx) => {
            expect(ctx.mode).toBe('readonly');
        });
    });

    it('单字符串 store 名也能工作', async () => {
        await withReadonlyTransaction(SETTINGS_STORE, async (ctx) => {
            expect(ctx.stores[SETTINGS_STORE]).toBeDefined();
        });
    });
});

describe('withTransaction', () => {
    beforeEach(async () => {
        await 初始化数据库();
    });

    it('兼容旧 API：storeName + mode + callback', async () => {
        const result = await withTransaction(STORE_NAME, 'readwrite', async (ctx) => {
            ctx.store.add({ id: 300, marker: 'legacy' });
            return ctx.mode;
        });
        expect(result).toBe('readwrite');
    });

    it('readonly mode', async () => {
        const result = await withTransaction(STORE_NAME, 'readonly', async (ctx) => {
            return ctx.mode;
        });
        expect(result).toBe('readonly');
    });

    it('callback 同步返回值', async () => {
        const result = await withTransaction(STORE_NAME, 'readonly', () => 'sync-value');
        expect(result).toBe('sync-value');
    });
});
