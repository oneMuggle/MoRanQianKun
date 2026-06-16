/**
 * services/dbService/image-assets.test.ts
 *
 * Day 49：图片资产存储测试
 * 覆盖：保存/读取/预热/外置化/收集引用/清理
 */
import { describe, it, expect, beforeEach } from 'vitest';
import {
    保存图片资源,
    读取图片资源,
    预热图片资源缓存,
    清理未引用图片资源,
    清理运行时图片缓存,
    外置化图片字段,
    收集图片资源引用ID,
} from './image-assets';
import { 初始化数据库 } from './initialization';
import { IMAGE_ASSETS_STORE, STORE_NAME, SETTINGS_STORE } from './schema';

const 清空数据 = async () => {
    const db = await 初始化数据库();
    await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(
            [IMAGE_ASSETS_STORE, STORE_NAME, SETTINGS_STORE],
            'readwrite'
        );
        tx.objectStore(IMAGE_ASSETS_STORE).clear();
        tx.objectStore(STORE_NAME).clear();
        tx.objectStore(SETTINGS_STORE).clear();
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
    });
};

const 一个小dataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

describe('保存图片资源', () => {
    beforeEach(async () => {
        await 初始化数据库();
        await 清空数据();
        清理运行时图片缓存();
    });

    it('保存并返回 img_asset:// 引用', async () => {
        const ref = await 保存图片资源(一个小dataUrl);
        expect(ref).toMatch(/^wuxia-asset:\/\//);
    });

    it('相同 dataUrl 通过签名缓存返回同一引用', async () => {
        const ref1 = await 保存图片资源(一个小dataUrl);
        const ref2 = await 保存图片资源(一个小dataUrl);
        expect(ref1).toBe(ref2);
    });

    it('preferredId 被使用', async () => {
        const ref = await 保存图片资源('data:image/png;base64,QQ==', 'custom-id-1');
        expect(ref).toContain('custom-id-1');
    });

    it('空字符串抛错', async () => {
        await expect(保存图片资源('')).rejects.toThrow(/图片内容为空/);
    });

    it('空白字符串抛错', async () => {
        await expect(保存图片资源('   ')).rejects.toThrow(/图片内容为空/);
    });
});

describe('读取图片资源', () => {
    beforeEach(async () => {
        await 初始化数据库();
        await 清空数据();
        清理运行时图片缓存();
    });

    it('保存后能读取', async () => {
        const ref = await 保存图片资源(一个小dataUrl);
        const id = ref.replace(/^wuxia-asset:\/\//, '');
        const dataUrl = await 读取图片资源(id);
        expect(dataUrl).toBe(一个小dataUrl);
    });

    it('通过引用读取', async () => {
        const ref = await 保存图片资源(一个小dataUrl);
        const dataUrl = await 读取图片资源(ref);
        expect(dataUrl).toBe(一个小dataUrl);
    });

    it('空 id 返回空字符串', async () => {
        const result = await 读取图片资源('');
        expect(result).toBe('');
    });

    it('不存在的 id 返回空字符串', async () => {
        const result = await 读取图片资源('non-existent-id');
        expect(result).toBe('');
    });
});

describe('预热图片资源缓存', () => {
    beforeEach(async () => {
        await 初始化数据库();
        await 清空数据();
        清理运行时图片缓存();
    });

    it('预热返回表中条目数', async () => {
        await 保存图片资源(一个小dataUrl);
        await 保存图片资源('data:image/png;base64,QQ==');
        const count = await 预热图片资源缓存();
        expect(count).toBe(2);
    });

    it('空表预热返回 0', async () => {
        const count = await 预热图片资源缓存();
        expect(count).toBe(0);
    });
});

describe('清理运行时图片缓存', () => {
    it('安全 noop', () => {
        expect(() => 清理运行时图片缓存()).not.toThrow();
    });
});

describe('清理未引用图片资源', () => {
    beforeEach(async () => {
        await 初始化数据库();
        await 清空数据();
        清理运行时图片缓存();
    });

    it('无引用时所有图片资源被视为未引用', async () => {
        await 保存图片资源(一个小dataUrl);
        await 保存图片资源('data:image/png;base64,yy');
        const removed = await 清理未引用图片资源();
        expect(removed).toBe(2);
    });

    it('被存档引用的图片资源不被清理', async () => {
        const ref = await 保存图片资源(一个小dataUrl);
        const id = ref.replace(/^wuxia-asset:\/\//, '');
        const db = await 初始化数据库();
        await new Promise<void>((resolve, reject) => {
            const tx = db.transaction([STORE_NAME], 'readwrite');
            tx.objectStore(STORE_NAME).put({
                类型: 'manual',
                时间戳: Date.now(),
                角色数据: { 姓名: 'x' },
                环境信息: {},
                历史记录: [],
                本地路径: ref,
            });
            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
        });
        const removed = await 清理未引用图片资源();
        expect(removed).toBe(0);
        const exists = await 读取图片资源(id);
        expect(exists).toBe(一个小dataUrl);
    });

    it('返回清理数量为 0 当无未引用', async () => {
        const ref = await 保存图片资源(一个小dataUrl);
        const db = await 初始化数据库();
        await new Promise<void>((resolve, reject) => {
            const tx = db.transaction([STORE_NAME], 'readwrite');
            tx.objectStore(STORE_NAME).put({
                类型: 'manual',
                时间戳: Date.now(),
                角色数据: { 姓名: 'x' },
                环境信息: {},
                历史记录: [],
                本地路径: ref,
            });
            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
        });
        const removed = await 清理未引用图片资源();
        expect(removed).toBe(0);
    });
});

describe('外置化图片字段', () => {
    beforeEach(async () => {
        await 初始化数据库();
        await 清空数据();
        清理运行时图片缓存();
    });

    it('字符串 dataUrl 字段被外置化', async () => {
        const result = await 外置化图片字段({ 本地路径: 一个小dataUrl });
        expect((result as any).本地路径).toMatch(/^wuxia-asset:\/\//);
    });

    it('非 dataUrl 字符串保持原样', async () => {
        const result = await 外置化图片字段({ 本地路径: 'https://example.com/img.png' });
        expect((result as any).本地路径).toBe('https://example.com/img.png');
    });

    it('嵌套对象中的图片字段被外置化', async () => {
        const result = await 外置化图片字段({
            角色: { 头像图片URL: 一个小dataUrl }
        });
        expect((result as any).角色.头像图片URL).toMatch(/^wuxia-asset:\/\//);
    });

    it('数组中的图片字段被外置化', async () => {
        const result = await 外置化图片字段({ 列表: [一个小dataUrl, 一个小dataUrl] });
        expect((result as any).列表[0]).toMatch(/^wuxia-asset:\/\//);
        expect((result as any).列表[1]).toMatch(/^wuxia-asset:\/\//);
    });

    it('null/undefined 返回原值', async () => {
        expect(await 外置化图片字段(null)).toBeNull();
        expect(await 外置化图片字段(undefined)).toBeUndefined();
    });

    it('原始对象不被修改（不可变）', async () => {
        const original = { 本地路径: 一个小dataUrl };
        const result = await 外置化图片字段(original);
        expect(original.本地路径).toBe(一个小dataUrl);
        expect((result as any).本地路径).not.toBe(一个小dataUrl);
    });

    it('循环引用不抛错', async () => {
        const obj: any = { a: 1 };
        obj.self = obj;
        expect(() => 外置化图片字段(obj)).not.toThrow();
    });

    it('音频 dataUrl 也被外置化（音频URL 字段）', async () => {
        const audioDataUrl = 'data:audio/mpeg;base64,SUQzBAAAAA==';
        const result = await 外置化图片字段({ 音频URL: audioDataUrl });
        expect((result as any).音频URL).toMatch(/^wuxia-asset:\/\//);
    });
});

describe('收集图片资源引用ID', () => {
    it('从字符串引用中收集 ID', () => {
        const refs = new Set<string>();
        收集图片资源引用ID('wuxia-asset://abc-123', refs);
        expect(refs.has('abc-123')).toBe(true);
    });

    it('非引用字符串不收集', () => {
        const refs = new Set<string>();
        收集图片资源引用ID('not a ref', refs);
        expect(refs.size).toBe(0);
    });

    it('从嵌套对象收集', () => {
        const refs = new Set<string>();
        收集图片资源引用ID({
            a: { 本地路径: 'wuxia-asset://nested-1' },
            b: { 列表: ['wuxia-asset://nested-2'] },
        }, refs);
        expect(refs.has('nested-1')).toBe(true);
        expect(refs.has('nested-2')).toBe(true);
    });

    it('null/非对象不抛错', () => {
        const refs = new Set<string>();
        收集图片资源引用ID(null, refs);
        收集图片资源引用ID(undefined, refs);
        收集图片资源引用ID(42, refs);
        expect(refs.size).toBe(0);
    });

    it('循环引用不抛错', () => {
        const refs = new Set<string>();
        const obj: any = { a: 'wuxia-asset://loop-1' };
        obj.self = obj;
        expect(() => 收集图片资源引用ID(obj, refs)).not.toThrow();
        expect(refs.has('loop-1')).toBe(true);
    });
});
