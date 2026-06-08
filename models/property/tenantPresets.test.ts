/**
 * models/property/tenantPresets.test.ts
 *
 * 房客类型预设：按类型查找 / 随机选择 / 字段完整性校验。
 */

import { describe, it, expect } from 'vitest';
import {
    房客类型预设列表,
    按类型查找房客预设,
    随机选择房客类型,
} from './tenantPresets';
import type { 房客类型, 房客类型预设 } from './types';

const 所有房客类型: 房客类型[] = [
    '江湖客', '商人', '文人', '侠客', '隐士', '官差', '游医', '艺伎'
];

describe('房客预设：基本结构', () => {
    it('预设列表非空', () => {
        expect(房客类型预设列表.length).toBeGreaterThan(0);
    });

    it('所有 8 种房客类型都被定义', () => {
        const definedTypes = 房客类型预设列表.map(p => p.类型);
        for (const t of 所有房客类型) {
            expect(definedTypes).toContain(t);
        }
    });

    it('房客类型无重复', () => {
        const types = 房客类型预设列表.map(p => p.类型);
        expect(new Set(types).size).toBe(types.length);
    });

    it('所有预设的 偏好设施 和 厌恶设施 不重叠', () => {
        for (const p of 房客类型预设列表) {
            const overlap = p.偏好设施.filter(f => p.厌恶设施.includes(f));
            expect(overlap, `类型 ${p.类型} 偏好与厌恶重叠: ${overlap}`).toEqual([]);
        }
    });

    it('所有预设的 性格标签池 和 特殊需求池 非空', () => {
        for (const p of 房客类型预设列表) {
            expect(p.性格标签池.length).toBeGreaterThan(0);
            expect(p.特殊需求池.length).toBeGreaterThan(0);
        }
    });

    it('基础租金倍率为正数', () => {
        for (const p of 房客类型预设列表) {
            expect(p.基础租金倍率).toBeGreaterThan(0);
        }
    });

    it('退租阈值在 0-100 之间', () => {
        for (const p of 房客类型预设列表) {
            expect(p.退租阈值).toBeGreaterThanOrEqual(0);
            expect(p.退租阈值).toBeLessThanOrEqual(100);
        }
    });

    it('满意度衰减率为非负整数', () => {
        for (const p of 房客类型预设列表) {
            expect(p.满意度衰减率).toBeGreaterThanOrEqual(0);
            expect(Number.isInteger(p.满意度衰减率)).toBe(true);
        }
    });
});

describe('按类型查找房客预设', () => {
    it('能找到已存在类型', () => {
        const p = 按类型查找房客预设('商人');
        expect(p).toBeDefined();
        expect(p?.基础租金倍率).toBe(1.5);
    });

    it('每种类型都能找到', () => {
        for (const t of 所有房客类型) {
            const p = 按类型查找房客预设(t);
            expect(p).toBeDefined();
            expect(p?.类型).toBe(t);
        }
    });

    it('不存在类型返回 undefined', () => {
        expect(按类型查找房客预设('nonexistent_tenant_xxx')).toBeUndefined();
    });
});

describe('随机选择房客类型', () => {
    it('吸引力 >= 80：从全部类型中选', () => {
        for (let i = 0; i < 30; i++) {
            const picked = 随机选择房客类型(100, '古代');
            expect(所有房客类型).toContain(picked);
        }
    });

    it('吸引力 50-79：只从基础租金倍率 ≤ 1.3 的池中选', () => {
        const 限定池 = 房客类型预设列表
            .filter(p => p.基础租金倍率 <= 1.3)
            .map(p => p.类型);
        for (let i = 0; i < 30; i++) {
            const picked = 随机选择房客类型(60, '古代');
            expect(限定池).toContain(picked);
        }
    });

    it('吸引力 < 50：只从基础租金倍率 ≤ 1.0 的池中选', () => {
        const 限定池 = 房客类型预设列表
            .filter(p => p.基础租金倍率 <= 1.0)
            .map(p => p.类型);
        for (let i = 0; i < 30; i++) {
            const picked = 随机选择房客类型(20, '古代');
            expect(限定池).toContain(picked);
        }
    });

    it('时代参数当前不影响结果（保留扩展位）', () => {
        const a = 随机选择房客类型(100, '古代');
        const b = 随机选择房客类型(100, '未来');
        expect(所有房客类型).toContain(a);
        expect(所有房客类型).toContain(b);
    });

    it('默认时代为"古代"（不传时代参数）', () => {
        const picked = 随机选择房客类型(100);
        expect(所有房客类型).toContain(picked);
    });
});

describe('类型契约', () => {
    it('房客类型预设可正确构造', () => {
        const p: 房客类型预设 = {
            类型: '商人',
            基础租金倍率: 1.0,
            偏好设施: ['fac1'],
            厌恶设施: ['fac2'],
            性格标签池: ['tag1'],
            特殊需求池: ['need1'],
            满意度衰减率: 1,
            退租阈值: 20,
        };
        expect(p.类型).toBe('商人');
    });
});
