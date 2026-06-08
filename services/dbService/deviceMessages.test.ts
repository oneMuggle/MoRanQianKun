/**
 * services/dbService/deviceMessages.test.ts
 *
 * Day 49：设备消息持久化测试
 * 覆盖：保存/读取/列表/删除/清空/导入导出
 */
import { describe, it, expect, beforeEach } from 'vitest';
import {
    保存设备消息,
    读取设备消息列表,
    读取设备消息,
    删除设备消息,
    清空设备消息,
    导出全部设备消息,
    导入设备消息,
    type 设备消息结构,
} from './deviceMessages';
import { 初始化数据库 } from './initialization';
import { DEVICE_MESSAGES_STORE } from './schema';

const 清空数据 = async () => {
    const db = await 初始化数据库();
    await new Promise<void>((resolve, reject) => {
        const tx = db.transaction([DEVICE_MESSAGES_STORE], 'readwrite');
        tx.objectStore(DEVICE_MESSAGES_STORE).clear();
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
    });
};

const 基础消息 = (overrides: Partial<设备消息结构> = {}): 设备消息结构 => ({
    id: 'msg-1',
    type: 'notification',
    title: '测试通知',
    content: '这是测试内容',
    timestamp: Date.now(),
    ...overrides,
});

describe('保存设备消息 / 读取设备消息', () => {
    beforeEach(async () => {
        await 初始化数据库();
        await 清空数据();
    });

    it('保存后能读取', async () => {
        const msg = 基础消息();
        await 保存设备消息(msg);
        const loaded = await 读取设备消息(msg.id);
        expect(loaded).toEqual(msg);
    });

    it('读取不存在的 id 返回 null', async () => {
        const result = await 读取设备消息('not-exist');
        expect(result).toBeNull();
    });

    it('保存带 location 和 tags', async () => {
        const msg = 基础消息({
            id: 'msg-loc',
            location: { x: 10, y: 20 },
            tags: ['urgent', 'system'],
        });
        await 保存设备消息(msg);
        const loaded = await 读取设备消息('msg-loc');
        expect(loaded?.location).toEqual({ x: 10, y: 20 });
        expect(loaded?.tags).toEqual(['urgent', 'system']);
    });

    it('保存后修改并再保存会覆盖', async () => {
        await 保存设备消息(基础消息());
        await 保存设备消息(基础消息({ content: '更新内容' }));
        const loaded = await 读取设备消息('msg-1');
        expect(loaded?.content).toBe('更新内容');
    });
});

describe('读取设备消息列表', () => {
    beforeEach(async () => {
        await 初始化数据库();
        await 清空数据();
    });

    it('空数据库返回空数组', async () => {
        const list = await 读取设备消息列表();
        expect(list).toEqual([]);
    });

    it('按时间戳倒序返回', async () => {
        await 保存设备消息(基础消息({ id: 'm1', timestamp: 1000 }));
        await 保存设备消息(基础消息({ id: 'm2', timestamp: 3000 }));
        await 保存设备消息(基础消息({ id: 'm3', timestamp: 2000 }));
        const list = await 读取设备消息列表();
        expect(list.map((m) => m.id)).toEqual(['m2', 'm3', 'm1']);
    });

    it('按 type 过滤', async () => {
        await 保存设备消息(基础消息({ id: 'a', type: 'notification' }));
        await 保存设备消息(基础消息({ id: 'b', type: 'alert' }));
        await 保存设备消息(基础消息({ id: 'c', type: 'notification' }));
        const list = await 读取设备消息列表(100, 'notification');
        expect(list).toHaveLength(2);
        expect(list.every((m) => m.type === 'notification')).toBe(true);
    });

    it('limit 限制返回数量', async () => {
        for (let i = 0; i < 10; i++) {
            await 保存设备消息(基础消息({ id: `m${i}`, timestamp: i }));
        }
        const list = await 读取设备消息列表(3);
        expect(list).toHaveLength(3);
    });

    it('默认 limit 为 100', async () => {
        for (let i = 0; i < 5; i++) {
            await 保存设备消息(基础消息({ id: `m${i}`, timestamp: i }));
        }
        const list = await 读取设备消息列表();
        expect(list).toHaveLength(5);
    });
});

describe('删除设备消息 / 清空设备消息', () => {
    beforeEach(async () => {
        await 初始化数据库();
        await 清空数据();
    });

    it('删除指定消息', async () => {
        await 保存设备消息(基础消息());
        await 删除设备消息('msg-1');
        const loaded = await 读取设备消息('msg-1');
        expect(loaded).toBeNull();
    });

    it('删除不存在的 id 不抛错', async () => {
        await expect(删除设备消息('never-existed')).resolves.not.toThrow();
    });

    it('清空全部消息', async () => {
        await 保存设备消息(基础消息({ id: 'm1' }));
        await 保存设备消息(基础消息({ id: 'm2' }));
        await 清空设备消息();
        const list = await 读取设备消息列表();
        expect(list).toEqual([]);
    });
});

describe('导出全部设备消息 / 导入设备消息', () => {
    beforeEach(async () => {
        await 初始化数据库();
        await 清空数据();
    });

    it('导出空数据库返回空数组', async () => {
        const exported = await 导出全部设备消息();
        expect(exported).toEqual([]);
    });

    it('导出全部消息', async () => {
        await 保存设备消息(基础消息({ id: 'a' }));
        await 保存设备消息(基础消息({ id: 'b' }));
        const exported = await 导出全部设备消息();
        expect(exported).toHaveLength(2);
    });

    it('导入消息数组', async () => {
        const messages = [
            基础消息({ id: 'imp1', content: 'one' }),
            基础消息({ id: 'imp2', content: 'two' }),
        ];
        await 导入设备消息(messages);
        const list = await 读取设备消息列表();
        expect(list).toHaveLength(2);
    });

    it('导入空数组 noop', async () => {
        await 保存设备消息(基础消息({ id: 'keep' }));
        await 导入设备消息([]);
        const list = await 读取设备消息列表();
        expect(list).toHaveLength(1);
    });

    it('导出再导入能往返', async () => {
        await 保存设备消息(基础消息({ id: 'rt1' }));
        await 保存设备消息(基础消息({ id: 'rt2' }));
        const exported = await 导出全部设备消息();

        await 清空设备消息();
        await 导入设备消息(exported);

        const list = await 读取设备消息列表();
        expect(list).toHaveLength(2);
    });
});
