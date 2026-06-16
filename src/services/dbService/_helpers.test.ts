/**
 * services/dbService/_helpers.test.ts
 *
 * Day 49：纯函数 helper 测试
 * 覆盖：深拷贝、估算字节数、构建存档去重键、清洗导入存档、读取环境时间、估算设置摘要
 */
import { describe, it, expect } from 'vitest';
import {
    深拷贝,
    pad2,
    估算字符串字节数,
    估算对象字节数,
    估算设置摘要,
    读取环境时间文本,
    构建存档去重键,
    清洗导入存档,
} from './_helpers';

describe('深拷贝', () => {
    it('深拷贝简单对象', () => {
        const src = { a: 1, b: 'x', c: true };
        const copy = 深拷贝(src);
        expect(copy).toEqual(src);
        expect(copy).not.toBe(src);
    });

    it('深拷贝嵌套对象', () => {
        const src = { a: { b: { c: 1 } } };
        const copy = 深拷贝(src);
        expect(copy).toEqual(src);
        expect(copy.a).not.toBe(src.a);
        expect(copy.a.b).not.toBe(src.a.b);
    });

    it('深拷贝数组', () => {
        const src = [1, [2, 3], { x: 4 }];
        const copy = 深拷贝(src);
        expect(copy).toEqual(src);
        expect(copy).not.toBe(src);
        expect((copy as number[])[1]).not.toBe(src[1]);
    });

    it('深拷贝保留 null（JSON 实现）', () => {
        expect(深拷贝(null)).toBeNull();
    });
});

describe('pad2', () => {
    it('个位数补零', () => {
        expect(pad2(3)).toBe('03');
        expect(pad2(0)).toBe('00');
    });

    it('两位数及以上原样返回', () => {
        expect(pad2(10)).toBe('10');
        expect(pad2(99)).toBe('99');
    });

    it('截断小数', () => {
        expect(pad2(3.7)).toBe('03');
    });
});

describe('估算字符串字节数', () => {
    it('空字符串返回 0', () => {
        expect(估算字符串字节数('')).toBe(0);
    });

    it('ASCII 字符串按 byte 长度', () => {
        const result = 估算字符串字节数('hello');
        expect(result).toBeGreaterThan(0);
        expect(result).toBeLessThanOrEqual(10);
    });

    it('中文按 UTF-8 字节（>= 6 bytes for 2 字）', () => {
        const cn = '你好';
        const result = 估算字符串字节数(cn);
        // jsdom + Node 18+ 下 TextEncoder 存在，UTF-8 中文通常 3 字节/字符
        expect(result).toBeGreaterThanOrEqual(6);
    });
});

describe('估算对象字节数', () => {
    it('null/undefined 返回 0', () => {
        expect(估算对象字节数(null)).toBe(0);
        expect(估算对象字节数(undefined)).toBe(0);
    });

    it('数字返回 8', () => {
        expect(估算对象字节数(42)).toBe(8);
    });

    it('布尔返回 4', () => {
        expect(估算对象字节数(true)).toBe(4);
        expect(估算对象字节数(false)).toBe(4);
    });

    it('字符串按 UTF-8 估算', () => {
        expect(估算对象字节数('hi')).toBe(2);
    });

    it('对象递归累加字段', () => {
        const result = 估算对象字节数({ a: 1, b: 'x' });
        expect(result).toBeGreaterThan(0);
    });

    it('数组按元素累加', () => {
        const result = 估算对象字节数([1, 2, 3]);
        expect(result).toBeGreaterThan(0);
    });

    it('循环引用不抛错', () => {
        const obj: any = { a: 1 };
        obj.self = obj;
        expect(() => 估算对象字节数(obj)).not.toThrow();
        const result = 估算对象字节数(obj);
        expect(result).toBeGreaterThan(0);
    });

    it('Uint8Array 按 byteLength', () => {
        const bytes = new Uint8Array(100);
        expect(估算对象字节数(bytes)).toBe(100);
    });

    it('ArrayBuffer 按 byteLength', () => {
        const buf = new ArrayBuffer(50);
        expect(估算对象字节数(buf)).toBe(50);
    });

    it('bigint 按字符串长度', () => {
        expect(估算对象字节数(BigInt(123))).toBe(3);
    });
});

describe('估算设置摘要', () => {
    it('null/undefined 返回 空值', () => {
        expect(估算设置摘要('any', null)).toBe('空值');
        expect(估算设置摘要('any', undefined)).toBe('空值');
    });

    it('boolean 返回 已开启/已关闭', () => {
        expect(估算设置摘要('any', true)).toBe('已开启');
        expect(估算设置摘要('any', false)).toBe('已关闭');
    });

    it('非空字符串截取 24 字符', () => {
        expect(估算设置摘要('any', 'hello world')).toBe('hello world');
        expect(估算设置摘要('any', 'a'.repeat(30))).toBe('a'.repeat(24) + '...');
    });

    it('空字符串返回 空字符串', () => {
        expect(估算设置摘要('any', '')).toBe('空字符串');
        expect(估算设置摘要('any', '   ')).toBe('空字符串');
    });

    it('数组按长度', () => {
        expect(估算设置摘要('any', [1, 2, 3])).toBe('3 项');
    });

    it('对象按字段数', () => {
        expect(估算设置摘要('any', { a: 1, b: 2, c: 3, d: 4 })).toBe('4 个字段');
    });
});

describe('读取环境时间文本', () => {
    it('优先返回 env.时间 字段', () => {
        expect(读取环境时间文本({ 时间: '年:月:日:时:分' })).toBe('年:月:日:时:分');
    });

    it('env.时间 空白时回退到结构化字段', () => {
        expect(读取环境时间文本({ 时间: '   ', 年: 1, 月: 2, 日: 3, 时: 4, 分: 5 }))
            .toBe('1:02:03:04:05');
    });

    it('结构化字段单独存在时仍工作', () => {
        expect(读取环境时间文本({ 年: 2024, 月: 12, 日: 31, 时: 23, 分: 59 }))
            .toBe('2024:12:31:23:59');
    });

    it('无字段时返回空字符串', () => {
        expect(读取环境时间文本({})).toBe('');
        expect(读取环境时间文本(null)).toBe('');
    });

    it('部分字段缺失时返回空字符串', () => {
        expect(读取环境时间文本({ 年: 1, 月: 1 })).toBe('');
    });

    it('月日时分位数 < 10 时补零', () => {
        expect(读取环境时间文本({ 年: 1, 月: 1, 日: 1, 时: 1, 分: 1 }))
            .toBe('1:01:01:01:01');
    });
});

describe('构建存档去重键', () => {
    const safe = (v: unknown, fb: number) => (typeof v === 'number' && Number.isFinite(v) ? v : fb);

    it('manual 存档基础 key', () => {
        const key = 构建存档去重键({
            类型: 'manual',
            时间戳: 1000,
            角色数据: { 姓名: '弦月' },
            环境信息: { 时间: 'a' },
            历史记录: [1, 2, 3],
        }, safe);
        expect(key).toBe('manual|1000|弦月|a|3');
    });

    it('auto 存档类型为 auto', () => {
        const key = 构建存档去重键({
            类型: 'auto',
            时间戳: 2000,
            角色数据: { 姓名: '夜' },
            环境信息: {},
            历史记录: [],
        }, safe);
        expect(key).toBe('auto|2000|夜||0');
    });

    it('未知类型回退到 manual', () => {
        const key = 构建存档去重键({
            类型: 'unknown',
            时间戳: 1,
            角色数据: { 姓名: 'x' },
            环境信息: {},
            历史记录: [],
        }, safe);
        expect(key.startsWith('manual|')).toBe(true);
    });

    it('非数组历史记录按 0 计算', () => {
        const key = 构建存档去重键({
            类型: 'manual',
            时间戳: 1,
            角色数据: { 姓名: 'x' },
            环境信息: {},
            历史记录: 'not array' as any,
        }, safe);
        expect(key.endsWith('|0')).toBe(true);
    });

    it('负时间戳被夹紧为 0', () => {
        const key = 构建存档去重键({
            类型: 'manual',
            时间戳: -100,
            角色数据: { 姓名: 'x' },
            环境信息: {},
            历史记录: [],
        }, safe);
        expect(key).toContain('|0|');
    });
});

describe('清洗导入存档', () => {
    const safe = (v: unknown, fb: number) => (typeof v === 'number' && Number.isFinite(v) ? v : fb);

    it('null 返回 null', () => {
        expect(清洗导入存档(null, safe)).toBeNull();
    });

    it('非对象返回 null', () => {
        expect(清洗导入存档('string', safe)).toBeNull();
    });

    it('缺少 角色数据 返回 null', () => {
        expect(清洗导入存档({ 环境信息: {} }, safe)).toBeNull();
    });

    it('缺少 环境信息 返回 null', () => {
        expect(清洗导入存档({ 角色数据: {} }, safe)).toBeNull();
    });

    it('基础字段标准化', () => {
        const result = 清洗导入存档({
            角色数据: { 姓名: '弦月' },
            环境信息: { 时间: 'now' },
            历史记录: [],
        }, safe);
        expect(result).not.toBeNull();
        expect(result?.角色数据).toEqual({ 姓名: '弦月' });
        expect(result?.环境信息).toEqual({ 时间: 'now' });
        expect(result?.历史记录).toEqual([]);
        expect(result?.类型).toBe('manual');
        expect(result?.时间戳).toBeGreaterThan(0);
    });

    it('auto 类型保留', () => {
        const result = 清洗导入存档({
            类型: 'auto',
            角色数据: { 姓名: 'x' },
            环境信息: {},
            历史记录: [],
        }, safe);
        expect(result?.类型).toBe('auto');
    });

    it('非 auto 类型回退为 manual', () => {
        const result = 清洗导入存档({
            类型: 'unknown',
            角色数据: { 姓名: 'x' },
            环境信息: {},
            历史记录: [],
        }, safe);
        expect(result?.类型).toBe('manual');
    });

    it('元数据深拷贝（与原对象隔离）', () => {
        const meta = { key: 'value' };
        const result = 清洗导入存档({
            角色数据: { 姓名: 'x' },
            环境信息: {},
            历史记录: [],
            元数据: meta,
        }, safe);
        expect(result?.元数据).toEqual(meta);
        expect(result?.元数据).not.toBe(meta);
    });

    it('字符串描述保留', () => {
        const result = 清洗导入存档({
            描述: '存档描述',
            角色数据: { 姓名: 'x' },
            环境信息: {},
            历史记录: [],
        }, safe);
        expect(result?.描述).toBe('存档描述');
    });

    it('非字符串描述被忽略', () => {
        const result = 清洗导入存档({
            描述: 123 as any,
            角色数据: { 姓名: 'x' },
            环境信息: {},
            历史记录: [],
        }, safe);
        expect(result?.描述).toBeUndefined();
    });

    it('社交数组字段被深拷贝', () => {
        const social = [{ id: 'npc1' }];
        const result = 清洗导入存档({
            角色数据: { 姓名: 'x' },
            环境信息: {},
            历史记录: [],
            社交: social,
        }, safe);
        expect(result?.社交).toEqual(social);
        expect(result?.社交).not.toBe(social);
    });

    it('无效数组字段被忽略', () => {
        const result = 清洗导入存档({
            角色数据: { 姓名: 'x' },
            环境信息: {},
            历史记录: [],
            任务列表: 'not array' as any,
        }, safe);
        expect(result?.任务列表).toBeUndefined();
    });

    it('时间戳缺失时使用 Date.now() 回退', () => {
        const before = Date.now();
        const result = 清洗导入存档({
            角色数据: { 姓名: 'x' },
            环境信息: {},
            历史记录: [],
        }, safe);
        const after = Date.now();
        expect(result?.时间戳).toBeGreaterThanOrEqual(before);
        expect(result?.时间戳).toBeLessThanOrEqual(after);
    });

    it('时间戳为 0 时被夹紧为 1', () => {
        const result = 清洗导入存档({
            角色数据: { 姓名: 'x' },
            环境信息: {},
            历史记录: [],
            时间戳: 0,
        }, safe);
        expect(result?.时间戳).toBe(1);
    });

    it('非数组 历史记录 回退为空数组', () => {
        const result = 清洗导入存档({
            角色数据: { 姓名: 'x' },
            环境信息: {},
            历史记录: 'invalid' as any,
        }, safe);
        expect(result?.历史记录).toEqual([]);
    });
});
