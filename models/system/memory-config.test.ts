/**
 * models/system/memory-config.test.ts
 *
 * 记忆系统配置：结构契约（仅类型层面校验，无运行时逻辑）。
 */

import { describe, it, expect } from 'vitest';
import type {
    记忆配置结构,
    记忆系统结构,
    存档结构,
} from './memory-config';

describe('记忆配置结构契约', () => {
    it('完整配置可正确构造', () => {
        const cfg: 记忆配置结构 = {
            短期记忆阈值: 30,
            中期记忆阈值: 50,
            重要角色关键记忆条数N: 20,
            NPC记忆总结阈值: 20,
            即时消息上传条数N: 10,
            短期转中期提示词: '短期 → 中期 提示词',
            中期转长期提示词: '中期 → 长期 提示词',
            NPC记忆总结提示词: 'NPC 总结 提示词',
            启用后台自动总结: true,
        };
        expect(cfg.短期记忆阈值).toBe(30);
        expect(cfg.中期记忆阈值).toBe(50);
        expect(cfg.启用后台自动总结).toBe(true);
    });

    it('可选字段 启用后台自动总结 允许 undefined', () => {
        const cfg: 记忆配置结构 = {
            短期记忆阈值: 30,
            中期记忆阈值: 50,
            重要角色关键记忆条数N: 20,
            NPC记忆总结阈值: 20,
            即时消息上传条数N: 10,
            短期转中期提示词: 'p1',
            中期转长期提示词: 'p2',
            NPC记忆总结提示词: 'p3',
        };
        expect(cfg.启用后台自动总结).toBeUndefined();
    });

    it('阈值字段应为正整数', () => {
        const cfg: 记忆配置结构 = {
            短期记忆阈值: 30,
            中期记忆阈值: 50,
            重要角色关键记忆条数N: 20,
            NPC记忆总结阈值: 20,
            即时消息上传条数N: 10,
            短期转中期提示词: 'p1',
            中期转长期提示词: 'p2',
            NPC记忆总结提示词: 'p3',
        };
        expect(cfg.短期记忆阈值).toBeGreaterThan(0);
        expect(cfg.中期记忆阈值).toBeGreaterThan(0);
        expect(cfg.重要角色关键记忆条数N).toBeGreaterThan(0);
        expect(cfg.即时消息上传条数N).toBeGreaterThan(0);
    });
});

describe('记忆系统结构契约', () => {
    it('5 个数组字段可正确构造', () => {
        const sys: 记忆系统结构 = {
            回忆档案: [{ id: '1', 内容: '某回忆' }],
            即时记忆: ['i1', 'i2'],
            短期记忆: ['s1'],
            中期记忆: ['m1'],
            长期记忆: ['l1'],
        };
        expect(sys.回忆档案).toHaveLength(1);
        expect(sys.即时记忆).toHaveLength(2);
        expect(sys.长期记忆).toHaveLength(1);
    });

    it('空状态可正确构造', () => {
        const sys: 记忆系统结构 = {
            回忆档案: [],
            即时记忆: [],
            短期记忆: [],
            中期记忆: [],
            长期记忆: [],
        };
        expect(sys.回忆档案).toEqual([]);
    });
});

describe('存档结构契约', () => {
    it('最小必填字段可构造', () => {
        const save: 存档结构 = {
            id: 1,
            类型: 'manual',
            时间戳: 1700000000,
            角色数据: { 姓名: '主角' } as 存档结构['角色数据'],
            环境信息: {} as 存档结构['环境信息'],
            历史记录: [],
        };
        expect(save.id).toBe(1);
        expect(save.类型).toBe('manual');
    });

    it('auto 类型也可', () => {
        const save: 存档结构 = {
            id: 2,
            类型: 'auto',
            时间戳: 1700000000,
            角色数据: { 姓名: '主角' } as 存档结构['角色数据'],
            环境信息: {} as 存档结构['环境信息'],
            历史记录: [],
        };
        expect(save.类型).toBe('auto');
    });
});
