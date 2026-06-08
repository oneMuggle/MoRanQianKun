/**
 * models/property/facilityPresets.test.ts
 *
 * 设施预设：按时代查找 / 按 ID 查找 / 数据完整性校验。
 */

import { describe, it, expect } from 'vitest';
import {
    古代设施预设,
    现代设施预设,
    未来设施预设,
    按时代获取设施预设,
    按ID查找设施预设,
    所有设施预设,
    type 设施类别,
} from './facilityPresets';
import type { 设施预设结构 } from './types';

describe('设施预设：导出与基本结构', () => {
    it('三个时代预设数组都非空', () => {
        expect(古代设施预设.length).toBeGreaterThan(0);
        expect(现代设施预设.length).toBeGreaterThan(0);
        expect(未来设施预设.length).toBeGreaterThan(0);
    });

    it('所有设施预设等于三个时代拼接', () => {
        expect(所有设施预设.length).toBe(
            古代设施预设.length + 现代设施预设.length + 未来设施预设.length
        );
    });

    it('所有设施的 设施ID 唯一', () => {
        const ids = 所有设施预设.map(f => f.设施ID);
        const set = new Set(ids);
        expect(set.size).toBe(ids.length);
    });

    it('所有设施的 时代 数组非空', () => {
        for (const f of 所有设施预设) {
            expect(f.时代.length).toBeGreaterThan(0);
        }
    });

    it('8 种设施类别都被覆盖', () => {
        const categories: 设施类别[] = ['寝具', '卫浴', '餐饮', '休闲', '修炼', '安全', '装饰', '功能'];
        for (const c of categories) {
            const found = 所有设施预设.some(f => f.类别 === c);
            expect(found).toBe(true);
        }
    });

    it('价格字段均为正数', () => {
        for (const f of 所有设施预设) {
            expect(f.基础价格).toBeGreaterThan(0);
            expect(f.维护费用).toBeGreaterThanOrEqual(0);
        }
    });

    it('加成都为非负数', () => {
        for (const f of 所有设施预设) {
            expect(f.吸引力加成).toBeGreaterThanOrEqual(0);
            expect(f.舒适度加成).toBeGreaterThanOrEqual(0);
            expect(f.租金加成).toBeGreaterThanOrEqual(0);
        }
    });

    it('建造时间格式为 DD:HH:MM', () => {
        for (const f of 所有设施预设) {
            expect(f.建造时间).toMatch(/^\d{2}:\d{2}:\d{2}$/);
        }
    });
});

describe('按时代获取设施预设', () => {
    it('"古代" → 古代设施预设', () => {
        expect(按时代获取设施预设('古代')).toBe(古代设施预设);
    });

    it('"近代" → 古代设施预设（近代未单独定义）', () => {
        expect(按时代获取设施预设('近代')).toBe(古代设施预设);
    });

    it('"现代" → 现代设施预设', () => {
        expect(按时代获取设施预设('现代')).toBe(现代设施预设);
    });

    it('"近未来" → 未来设施预设', () => {
        expect(按时代获取设施预设('近未来')).toBe(未来设施预设);
    });

    it('"未来" → 未来设施预设', () => {
        expect(按时代获取设施预设('未来')).toBe(未来设施预设);
    });

    it('未知时代默认回退到古代', () => {
        expect(按时代获取设施预设('xxx_unknown')).toBe(古代设施预设);
    });
});

describe('按ID查找设施预设', () => {
    it('能找到已存在的设施', () => {
        const f = 按ID查找设施预设('bed_wood_simple', '古代');
        expect(f).toBeDefined();
        expect(f?.名称).toBe('简易木床');
    });

    it('现代设施用现代时代查找', () => {
        const f = 按ID查找设施预设('bed_spring_single', '现代');
        expect(f).toBeDefined();
        expect(f?.类别).toBe('寝具');
    });

    it('未来设施用未来时代查找', () => {
        const f = 按ID查找设施预设('vr_lounge', '未来');
        expect(f).toBeDefined();
        expect(f?.类别).toBe('休闲');
    });

    it('不存在的 ID 返回 undefined', () => {
        expect(按ID查找设施预设('nonexistent_id_xxx', '古代')).toBeUndefined();
    });

    it('默认时代为"古代"', () => {
        const f = 按ID查找设施预设('bed_wood_simple');
        expect(f).toBeDefined();
    });
});

describe('具体设施字段合理性', () => {
    it('金丝凤榻 (豪华) 基础价格 > 简易木床', () => {
        const woodBed = 按ID查找设施预设('bed_wood_simple', '古代')!;
        const phoenixBed = 按ID查找设施预设('bed_golden_phoenix', '古代')!;
        expect(phoenixBed.基础价格).toBeGreaterThan(woodBed.基础价格);
    });

    it('升级链：升级目标ID 指向已存在的设施', () => {
        const 所有ID = new Set(所有设施预设.map(f => f.设施ID));
        for (const f of 所有设施预设) {
            if (f.升级目标ID) {
                expect(所有ID.has(f.升级目标ID), `设施 ${f.设施ID} 升级目标 ${f.升级目标ID} 缺失`).toBe(true);
            }
        }
    });
});

describe('类型契约', () => {
    it('设施预设结构可正确构造', () => {
        const f: 设施预设结构 = {
            设施ID: 'test_fac',
            名称: '测试设施',
            类别: '休闲',
            描述: 'test',
            基础价格: 100,
            建造时间: '00:01:00',
            吸引力加成: 5,
            舒适度加成: 5,
            租金加成: 5,
            维护费用: 1,
            耐久损耗: 1,
            可升级: false,
            时代: ['现代'],
        };
        expect(f.设施ID).toBe('test_fac');
    });
});
