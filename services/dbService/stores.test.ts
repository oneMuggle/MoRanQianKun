/**
 * services/dbService/stores.test.ts
 *
 * Day 49：设置 CRUD 测试
 * 覆盖：保存/读取/删除/批量删除/存档保护状态/设置管理清单
 */
import { describe, it, expect, beforeEach } from 'vitest';
import {
    保存设置,
    读取设置,
    读取存档保护状态,
    设置存档保护状态,
    获取设置管理清单,
    删除设置,
    批量删除设置,
} from './stores';
import { 初始化数据库 } from './initialization';
import { SETTINGS_STORE, IMAGE_ASSETS_STORE, STORE_NAME } from './schema';
import { 设置键 } from '../../utils/settingsSchema';

const 清空数据 = async () => {
    const db = await 初始化数据库();
    await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(
            [SETTINGS_STORE, IMAGE_ASSETS_STORE, STORE_NAME],
            'readwrite'
        );
        tx.objectStore(SETTINGS_STORE).clear();
        tx.objectStore(IMAGE_ASSETS_STORE).clear();
        tx.objectStore(STORE_NAME).clear();
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
    });
};

describe('保存设置 / 读取设置', () => {
    beforeEach(async () => {
        await 初始化数据库();
        await 清空数据();
    });

    it('保存后能读取', async () => {
        await 保存设置('custom-key-1', { value: 42 });
        const value = await 读取设置('custom-key-1');
        expect(value).toEqual({ value: 42 });
    });

    it('读取不存在的 key 返回 null', async () => {
        const value = await 读取设置('non-existent');
        expect(value).toBeNull();
    });

    it('保存后再次保存会覆盖', async () => {
        await 保存设置('custom-key-1', 'first');
        await 保存设置('custom-key-1', 'second');
        const value = await 读取设置('custom-key-1');
        expect(value).toBe('second');
    });

    it('保存基本类型值（字符串/数字/布尔）', async () => {
        await 保存设置('string-key', 'hello');
        await 保存设置('number-key', 123);
        await 保存设置('bool-key', true);

        expect(await 读取设置('string-key')).toBe('hello');
        expect(await 读取设置('number-key')).toBe(123);
        expect(await 读取设置('bool-key')).toBe(true);
    });

    it('保存数组值', async () => {
        await 保存设置('array-key', [1, 2, 3]);
        expect(await 读取设置('array-key')).toEqual([1, 2, 3]);
    });

    it('保存 null', async () => {
        await 保存设置('null-key', null);
        const value = await 读取设置('null-key');
        expect(value).toBeNull();
    });

    it('dataUrl 字符串值被外置化（自动迁移到 IMAGE_ASSETS_STORE）', async () => {
        const dataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
        await 保存设置(设置键.视觉设置, { 背景图片: dataUrl });
        const stored = await 读取设置(设置键.视觉设置);
        expect((stored as any).背景图片).toMatch(/^wuxia-asset:\/\//);
    });
});

describe('存档保护状态', () => {
    beforeEach(async () => {
        await 初始化数据库();
        await 清空数据();
    });

    it('默认状态为 false', async () => {
        const status = await 读取存档保护状态();
        expect(status).toBe(false);
    });

    it('设置后能读取', async () => {
        await 设置存档保护状态(true);
        expect(await 读取存档保护状态()).toBe(true);
    });

    it('关闭后能读取为 false', async () => {
        await 设置存档保护状态(true);
        await 设置存档保护状态(false);
        expect(await 读取存档保护状态()).toBe(false);
    });

    it('非布尔值不被识别为开启', async () => {
        await 保存设置(设置键.存档保护, 'string-not-bool');
        expect(await 读取存档保护状态()).toBe(false);
    });
});

describe('删除设置 / 批量删除设置', () => {
    beforeEach(async () => {
        await 初始化数据库();
        await 清空数据();
    });

    it('删除设置', async () => {
        await 保存设置('delete-me', 'value');
        await 删除设置('delete-me');
        expect(await 读取设置('delete-me')).toBeNull();
    });

    it('删除不存在的 key 不抛错', async () => {
        await expect(删除设置('never-existed')).resolves.not.toThrow();
    });

    it('批量删除设置', async () => {
        await 保存设置('key-a', 'a');
        await 保存设置('key-b', 'b');
        await 保存设置('key-c', 'c');
        await 批量删除设置(['key-a', 'key-c']);

        expect(await 读取设置('key-a')).toBeNull();
        expect(await 读取设置('key-b')).toBe('b');
        expect(await 读取设置('key-c')).toBeNull();
    });

    it('批量删除空数组 noop', async () => {
        await 保存设置('keep', 'value');
        await 批量删除设置([]);
        expect(await 读取设置('keep')).toBe('value');
    });

    it('批量删除非数组 noop', async () => {
        await 保存设置('keep', 'value');
        await 批量删除设置(null as any);
        expect(await 读取设置('keep')).toBe('value');
    });
});

describe('获取设置管理清单', () => {
    beforeEach(async () => {
        await 初始化数据库();
        await 清空数据();
    });

    it('空设置时返回空数组', async () => {
        const list = await 获取设置管理清单();
        expect(list).toEqual([]);
    });

    it('返回已登记 key 的元信息', async () => {
        await 保存设置(设置键.存档保护, true);
        const list = await 获取设置管理清单();
        expect(list).toHaveLength(1);
        const item = list[0];
        expect(item.key).toBe(设置键.存档保护);
        expect(item.known).toBe(true);
        expect(item.category).not.toBe('unknown');
    });

    it('未登记 key 标记为 unknown', async () => {
        await 保存设置('unregistered-key', 'value');
        const list = await 获取设置管理清单();
        const item = list.find((i) => i.key === 'unregistered-key');
        expect(item).toBeDefined();
        expect(item!.known).toBe(false);
        expect(item!.category).toBe('unknown');
        expect(item!.categoryLabel).toBe('未登记项');
    });

    it('summary 反映值的类型', async () => {
        await 保存设置('bool-summary', true);
        const list = await 获取设置管理清单();
        const item = list.find((i) => i.key === 'bool-summary');
        expect(item!.summary).toBe('已开启');
    });

    it('size 字段返回字节数', async () => {
        await 保存设置('sized-key', 'hello');
        const list = await 获取设置管理清单();
        const item = list.find((i) => i.key === 'sized-key');
        expect(item!.size).toBeGreaterThan(0);
    });

    it('updatedAt 字段为数字', async () => {
        await 保存设置('time-key', 'v');
        const list = await 获取设置管理清单();
        const item = list.find((i) => i.key === 'time-key');
        expect(typeof item!.updatedAt).toBe('number');
    });

    it('按分类 order + label 排序', async () => {
        await 保存设置(设置键.存档保护, true);
        await 保存设置(设置键.视觉设置, { foo: 1 });
        await 保存设置(设置键.提示词池, { x: 1 });
        const list = await 获取设置管理清单();
        expect(list.length).toBe(3);
    });
});
