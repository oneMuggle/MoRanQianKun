/**
 * models/battle.ts 测试
 *
 * TDD 来源：docs/plans/2026-06-15_yishijie-ui-gameplay-borrow-plan.md U4
 * 目标：5 个新战斗字段（暴击率/闪避率/最大连击/物理抗性/内力抗性），
 *       全部 optional + default 0，兼容旧存档。
 */
import { describe, it, expect } from 'vitest';
import {
    规范化战斗敌方信息,
    type 战斗敌方信息,
} from './battle';

const 最小战斗信息: 战斗敌方信息 = {
    名字: '黑衣刺客',
    境界: '后天中期',
    简介: '出手狠辣。',
    技能: ['暗影刺'],
    战斗力: 120,
    防御力: 60,
    当前血量: 100,
    最大血量: 100,
    当前精力: 80,
    最大精力: 80,
    当前内力: 50,
    最大内力: 50,
};

describe('规范化战斗敌方信息 — 旧存档兼容', () => {
    it('不包含任何新字段时，5 个新字段都默认 0', () => {
        const result = 规范化战斗敌方信息(最小战斗信息);
        expect(result.暴击率).toBe(0);
        expect(result.闪避率).toBe(0);
        expect(result.最大连击).toBe(0);
        expect(result.物理抗性).toBe(0);
        expect(result.内力抗性).toBe(0);
    });

    it('保留所有原有字段不变', () => {
        const result = 规范化战斗敌方信息(最小战斗信息);
        expect(result.名字).toBe('黑衣刺客');
        expect(result.境界).toBe('后天中期');
        expect(result.战斗力).toBe(120);
        expect(result.当前血量).toBe(100);
        expect(result.技能).toEqual(['暗影刺']);
    });

    it('保留已设置的新字段（不被覆盖）', () => {
        const result = 规范化战斗敌方信息({
            ...最小战斗信息,
            暴击率: 25,
            闪避率: 15,
            最大连击: 3,
            物理抗性: 10,
            内力抗性: 20,
        });
        expect(result.暴击率).toBe(25);
        expect(result.闪避率).toBe(15);
        expect(result.最大连击).toBe(3);
        expect(result.物理抗性).toBe(10);
        expect(result.内力抗性).toBe(20);
    });

    it('部分新字段设置 + 部分缺失：缺失部分默认 0', () => {
        const result = 规范化战斗敌方信息({
            ...最小战斗信息,
            暴击率: 30,
        });
        expect(result.暴击率).toBe(30);
        expect(result.闪避率).toBe(0);
        expect(result.最大连击).toBe(0);
        expect(result.物理抗性).toBe(0);
        expect(result.内力抗性).toBe(0);
    });
});

describe('规范化战斗敌方信息 — 边界处理', () => {
    it('不修改原对象（不可变）', () => {
        const original = { ...最小战斗信息 };
        规范化战斗敌方信息(original);
        expect(original.暴击率).toBeUndefined();
    });

    it('返回的对象与原对象是独立引用', () => {
        const result = 规范化战斗敌方信息(最小战斗信息);
        expect(result).not.toBe(最小战斗信息);
        expect(result.技能).not.toBe(最小战斗信息.技能);
    });

    it('显式 undefined 视为 0', () => {
        const result = 规范化战斗敌方信息({
            ...最小战斗信息,
            暴击率: undefined,
        });
        expect(result.暴击率).toBe(0);
    });
});
