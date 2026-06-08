/**
 * services/dbService/save-archive.test.ts
 *
 * Day 49：存档 CRUD 测试
 * 覆盖：保存/读取/列表/删除/导入/导出/自动存档维护/存档保护
 */
import { describe, it, expect, beforeEach } from 'vitest';
import {
    保存存档,
    读取存档,
    读取存档列表,
    删除存档,
    清空存档数据,
    维护自动存档,
    删除最近自动存档,
    导出存档数据,
    导入存档数据,
} from './save-archive';
import { 设置存档保护状态, 删除设置 } from './stores';
import { 初始化数据库 } from './initialization';
import { STORE_NAME, SETTINGS_STORE } from './schema';
import type { 存档结构 } from '../../models/system/memory-config';

const 清空数据 = async () => {
    const db = await 初始化数据库();
    await new Promise<void>((resolve, reject) => {
        const tx = db.transaction([STORE_NAME, SETTINGS_STORE], 'readwrite');
        tx.objectStore(STORE_NAME).clear();
        tx.objectStore(SETTINGS_STORE).clear();
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
    });
    // 重置 存档保护 状态（清空后默认值是 false）
    await 删除设置('存档保护').catch(() => undefined);
};

const 基础存档 = (overrides: Partial<Omit<存档结构, 'id'>> = {}) => ({
    类型: 'manual' as const,
    时间戳: Date.now(),
    描述: '测试存档',
    角色数据: { 姓名: '弦月' },
    环境信息: { 时间: '1:1:1:1:1', 年: 1, 月: 1, 日: 1, 时: 1, 分: 1 },
    历史记录: [
        { role: 'user', content: 'hi', timestamp: 1 },
        { role: 'assistant', content: 'hello', timestamp: 2 },
    ],
    ...overrides,
}) as Omit<存档结构, 'id'>;

describe('save-archive 基础 CRUD', () => {
    beforeEach(async () => {
        await 初始化数据库();
        await 清空数据();
    });

    it('保存并读取存档', async () => {
        const id = await 保存存档(基础存档());
        expect(id).toBeGreaterThan(0);

        const loaded = await 读取存档(id);
        expect(loaded.角色数据.姓名).toBe('弦月');
        expect(loaded.历史记录).toHaveLength(2);
    });

    it('列表按时间戳降序', async () => {
        const id1 = await 保存存档(基础存档({ 时间戳: 1000 }));
        const id2 = await 保存存档(基础存档({ 时间戳: 2000 }));
        const id3 = await 保存存档(基础存档({ 时间戳: 3000 }));

        const list = await 读取存档列表();
        expect(list).toHaveLength(3);
        expect(list[0].id).toBe(id3);
        expect(list[1].id).toBe(id2);
        expect(list[2].id).toBe(id1);
    });

    it('空数据库列表为空数组', async () => {
        const list = await 读取存档列表();
        expect(list).toEqual([]);
    });

    it('删除存档', async () => {
        const id = await 保存存档(基础存档());
        await 删除存档(id);

        const list = await 读取存档列表();
        expect(list.find((s) => s.id === id)).toBeUndefined();
    });

    it('清空存档', async () => {
        await 保存存档(基础存档());
        await 保存存档(基础存档());
        await 清空存档数据();

        const list = await 读取存档列表();
        expect(list).toHaveLength(0);
    });

    it('保存缺少必填字段会抛错', async () => {
        await expect(保存存档({} as any)).rejects.toThrow();
    });
});

describe('save-archive 存档保护', () => {
    beforeEach(async () => {
        await 初始化数据库();
        await 清空数据();
    });

    it('保护开启时删除会抛错', async () => {
        const id = await 保存存档(基础存档());
        await 设置存档保护状态(true);
        await expect(删除存档(id)).rejects.toThrow(/存档保护/);
    });

    it('保护开启时清空会抛错', async () => {
        await 保存存档(基础存档());
        await 设置存档保护状态(true);
        await expect(清空存档数据()).rejects.toThrow(/存档保护/);
    });

    it('保护开启时删除最近自动存档会抛错', async () => {
        await 保存存档(基础存档({ 类型: 'auto', 时间戳: Date.now() }));
        await 设置存档保护状态(true);
        await expect(删除最近自动存档()).rejects.toThrow(/存档保护/);
    });

    it('保护关闭时可正常删除', async () => {
        const id = await 保存存档(基础存档());
        await 设置存档保护状态(false);
        await 删除存档(id);

        const list = await 读取存档列表();
        expect(list).toHaveLength(0);
    });
});

describe('save-archive 导入导出', () => {
    beforeEach(async () => {
        await 初始化数据库();
        await 清空数据();
    });

    it('导出空数据库仍返回有效结构', async () => {
        const exported = await 导出存档数据();
        expect(exported.version).toBe(1);
        expect(Array.isArray(exported.saves)).toBe(true);
        expect(exported.exportedAt).toBeTruthy();
    });

    it('导出后能导入并恢复', async () => {
        const _id = await 保存存档(基础存档({ 描述: '往返测试' }));
        const exported = await 导出存档数据();
        expect(exported.saves).toHaveLength(1);

        await 清空存档数据();
        const result = await 导入存档数据(exported);
        expect(result.imported).toBe(1);
        expect(result.skipped).toBe(0);

        const list = await 读取存档列表();
        expect(list).toHaveLength(1);
        expect(list[0].描述).toBe('往返测试');
    });

    it('导入空数组抛错', async () => {
        await expect(导入存档数据([])).rejects.toThrow();
    });

    it('导入非存档结构抛错', async () => {
        await expect(导入存档数据([{ foo: 'bar' }])).rejects.toThrow();
    });

    it('导入时按去重键跳过已存在', async () => {
        await 保存存档(基础存档({ 时间戳: 1000, 描述: '原存档' }));
        const result = await 导入存档数据([基础存档({ 时间戳: 1000, 描述: '重复存档' })]);
        expect(result.skipped).toBe(1);
        expect(result.imported).toBe(0);
    });

    it('覆盖导入时清空原存档', async () => {
        await 保存存档(基础存档({ 描述: '旧存档' }));
        const result = await 导入存档数据(
            [基础存档({ 时间戳: 9999, 描述: '新存档' })],
            { 覆盖现有: true }
        );
        expect(result.imported).toBe(1);
        const list = await 读取存档列表();
        expect(list).toHaveLength(1);
        expect(list[0].描述).toBe('新存档');
    });

    it('保护开启时覆盖导入抛错', async () => {
        await 设置存档保护状态(true);
        await expect(
            导入存档数据([基础存档()], { 覆盖现有: true })
        ).rejects.toThrow(/存档保护/);
    });
});

describe('save-archive 自动存档维护', () => {
    beforeEach(async () => {
        await 初始化数据库();
        await 清空数据();
    });

    it('auto 类型存档超过 maxKeep 数量时被清理', async () => {
        const db = await 初始化数据库();
        for (let i = 0; i < 10; i++) {
            await 保存存档(基础存档({ 类型: 'auto', 时间戳: 1000 + i }));
        }
        await 维护自动存档(db, 3);

        const list = await 读取存档列表();
        const autoSaves = list.filter((s) => s.类型 === 'auto');
        expect(autoSaves.length).toBe(3);
        const timestamps = autoSaves.map((s) => s.时间戳).sort((a, b) => a - b);
        expect(timestamps).toEqual([1007, 1008, 1009]);
    });

    it('auto 存档去重：相同自动存档签名仅保留一个', async () => {
        const signature = 'autosave-sig-1';
        await 保存存档(基础存档({
            类型: 'auto',
            时间戳: 1000,
            元数据: { 自动存档签名: signature },
        }));
        await 保存存档(基础存档({
            类型: 'auto',
            时间戳: 2000,
            元数据: { 自动存档签名: signature },
        }));

        const list = await 读取存档列表();
        const autoWithSig = list.filter(
            (s) => s.类型 === 'auto' && s.元数据?.自动存档签名 === signature
        );
        expect(autoWithSig.length).toBe(1);
    });

    it('maxKeep 为 0 时清理全部 auto 存档', async () => {
        const db = await 初始化数据库();
        await 保存存档(基础存档({ 类型: 'auto', 时间戳: 1 }));
        await 保存存档(基础存档({ 类型: 'auto', 时间戳: 2 }));
        await 维护自动存档(db, 0);

        const list = await 读取存档列表();
        const autoSaves = list.filter((s) => s.类型 === 'auto');
        expect(autoSaves.length).toBe(0);
    });

    it('manual 存档不受 maxKeep 影响', async () => {
        const db = await 初始化数据库();
        for (let i = 0; i < 10; i++) {
            await 保存存档(基础存档({ 类型: 'manual', 时间戳: 1000 + i }));
        }
        await 维护自动存档(db, 3);

        const list = await 读取存档列表();
        const manualSaves = list.filter((s) => s.类型 === 'manual');
        expect(manualSaves.length).toBe(10);
    });

    it('删除最近自动存档', async () => {
        await 保存存档(基础存档({ 类型: 'auto', 时间戳: 1000 }));
        await 保存存档(基础存档({ 类型: 'auto', 时间戳: 2000 }));
        await 保存存档(基础存档({ 类型: 'auto', 时间戳: 3000 }));
        await 删除最近自动存档();

        const list = await 读取存档列表();
        const autoSaves = list.filter((s) => s.类型 === 'auto');
        expect(autoSaves.length).toBe(2);
        const timestamps = autoSaves.map((s) => s.时间戳).sort((a, b) => a - b);
        expect(timestamps).toEqual([1000, 2000]);
    });

    it('无 auto 存档时删除最近自动存档安全 noop', async () => {
        await 保存存档(基础存档({ 类型: 'manual' }));
        await 删除最近自动存档();
        const list = await 读取存档列表();
        expect(list).toHaveLength(1);
    });
});
