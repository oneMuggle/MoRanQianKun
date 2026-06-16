/**
 * models/planning/storySlots.test.ts
 *
 * 剧情槽位：ID 生成 / 工厂函数 / 预算常量 / 类型标签。
 */

import { describe, it, expect } from 'vitest';
import {
    生成剧情槽位ID,
    创建剧情槽位,
    剧情槽位预算,
    剧情槽位类型标签,
    type 剧情槽位结构,
    type 剧情槽位类型,
} from './storySlots';

describe('生成剧情槽位ID', () => {
    it('默认 prefix 为 story_slot', () => {
        const id = 生成剧情槽位ID();
        expect(id.startsWith('story_slot_')).toBe(true);
    });

    it('接受自定义 prefix', () => {
        const id = 生成剧情槽位ID('custom_prefix');
        expect(id.startsWith('custom_prefix_')).toBe(true);
    });

    it('两次调用 ID 不同（包含随机片段）', () => {
        const id1 = 生成剧情槽位ID();
        const id2 = 生成剧情槽位ID();
        expect(id1).not.toBe(id2);
    });

    it('ID 格式为 prefix_timestamp_random', () => {
        const id = 生成剧情槽位ID('p');
        const parts = id.split('_');
        expect(parts.length).toBe(3);
        expect(parts[0]).toBe('p');
        // timestamp 部分应为数字
        expect(Number.isNaN(Number(parts[1]))).toBe(false);
    });
});

describe('创建剧情槽位', () => {
    it('必填字段生成完整对象', () => {
        const slot = 创建剧情槽位({
            名称: '主线·闯荡江湖',
            类型: '主线任务',
            内容: '玩家需前往洛阳',
        });
        expect(slot.名称).toBe('主线·闯荡江湖');
        expect(slot.类型).toBe('主线任务');
        expect(slot.内容).toBe('玩家需前往洛阳');
    });

    it('生成唯一 id', () => {
        const a = 创建剧情槽位({ 名称: 'A', 类型: '主线任务', 内容: 'a' });
        const b = 创建剧情槽位({ 名称: 'B', 类型: '支线任务', 内容: 'b' });
        expect(a.id).not.toBe(b.id);
    });

    it('默认值：作用域 main、优先级 50、默认启用 true', () => {
        const slot = 创建剧情槽位({ 名称: 'x', 类型: '支线任务', 内容: 'y' });
        expect(slot.作用域).toEqual(['main']);
        expect(slot.优先级).toBe(50);
        expect(slot.默认启用).toBe(true);
    });

    it('partial 中的字段覆盖默认值', () => {
        const slot = 创建剧情槽位({
            名称: 'override',
            类型: '日常任务',
            内容: 'content',
            作用域: ['tavern', 'main'],
            优先级: 99,
            默认启用: false,
        });
        expect(slot.作用域).toEqual(['tavern', 'main']);
        expect(slot.优先级).toBe(99);
        expect(slot.默认启用).toBe(false);
    });

    it('支持启用/失效条件与关联字段', () => {
        const slot = 创建剧情槽位({
            名称: 'cond',
            类型: '事件触发',
            内容: 'c',
            启用条件: ['hasItem:sword'],
            失效条件: ['quest_done'],
            关联任务: ['q1', 'q2'],
            关联人物: ['npcA'],
            关联地点: ['location1'],
        });
        expect(slot.启用条件).toEqual(['hasItem:sword']);
        expect(slot.失效条件).toEqual(['quest_done']);
        expect(slot.关联任务).toEqual(['q1', 'q2']);
        expect(slot.关联人物).toEqual(['npcA']);
        expect(slot.关联地点).toEqual(['location1']);
    });
});

describe('剧情槽位预算', () => {
    it('所有 9 个作用域都有预算值', () => {
        const scopes: (keyof typeof 剧情槽位预算)[] = [
            'main', 'opening', 'world_evolution', 'variable_calibration',
            'story_plan', 'heroine_plan', 'tavern', 'recall', 'all',
        ];
        for (const s of scopes) {
            expect(typeof 剧情槽位预算[s]).toBe('number');
            expect(剧情槽位预算[s]).toBeGreaterThanOrEqual(0);
        }
    });

    it('main 作用域预算 3000', () => {
        expect(剧情槽位预算.main).toBe(3000);
    });

    it('recall 作用域预算为 0（不注入）', () => {
        expect(剧情槽位预算.recall).toBe(0);
    });

    it('all 作用域预算最大（4000）', () => {
        const vals = Object.values(剧情槽位预算);
        expect(剧情槽位预算.all).toBe(Math.max(...vals));
    });
});

describe('剧情槽位类型标签', () => {
    it('8 种槽位类型都有中文标签', () => {
        const types: 剧情槽位类型[] = [
            '主线任务', '支线任务', '日常任务', '镜头序列',
            '事件触发', '过渡场景', '角色互动', '背景描写',
        ];
        for (const t of types) {
            expect(剧情槽位类型标签[t]).toBe(t);
        }
    });

    it('标签数量与类型数量一致', () => {
        const typeList: 剧情槽位类型[] = [
            '主线任务', '支线任务', '日常任务', '镜头序列',
            '事件触发', '过渡场景', '角色互动', '背景描写',
        ];
        expect(Object.keys(剧情槽位类型标签)).toHaveLength(typeList.length);
    });
});

describe('类型契约', () => {
    it('剧情槽位结构符合最小必填字段', () => {
        const slot: 剧情槽位结构 = {
            id: 's1',
            名称: 'n',
            类型: '主线任务',
            内容: 'c',
            作用域: ['main'],
            优先级: 10,
        };
        expect(slot.id).toBe('s1');
    });
});
