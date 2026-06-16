/**
 * models/domain/deviceVariables.test.ts
 *
 * 设备变量绑定（精力消耗 / 好感度修正 / 情报提取 / 通讯延迟）。
 * 纯计算函数，零依赖。
 */

import { describe, it, expect } from 'vitest';
import type { DeviceMessage } from '../mobileDevice';
import type { 角色数据结构 } from '../character';
import {
    获取查看消息精力消耗,
    获取通讯频率好感修正,
    是情报类消息,
    提取情报内容,
    计算设备使用影响,
    是紧急通讯场景,
    获取消息延迟,
    type 特殊通讯场景,
} from './deviceVariables';

const 构造消息 = (overrides: Partial<DeviceMessage> = {}): DeviceMessage => ({
    id: 'msg-1',
    type: 'chat',
    title: '普通问候',
    content: '你好',
    sender: 'npcA',
    timestamp: 1700000000,
    ...overrides,
});

const 构造角色 = (overrides: Partial<角色数据结构> = {}): 角色数据结构 => ({
    姓名: '主角',
    性别: '男',
    ...overrides,
} as 角色数据结构);

describe('获取查看消息精力消耗', () => {
    it('ancient 返回 1（飞鸽传书）', () => {
        expect(获取查看消息精力消耗('ancient')).toBe(1);
    });

    it('modern 返回 2（智能手机）', () => {
        expect(获取查看消息精力消耗('modern')).toBe(2);
    });

    it('near_future 返回 3（数据终端）', () => {
        expect(获取查看消息精力消耗('near_future')).toBe(3);
    });

    it('tech 返回 4（未来科技）', () => {
        expect(获取查看消息精力消耗('tech')).toBe(4);
    });

    it('holographic 返回 5（全息投影）', () => {
        expect(获取查看消息精力消耗('holographic')).toBe(5);
    });

    it('consciousness 返回 3（意识终端）', () => {
        expect(获取查看消息精力消耗('consciousness')).toBe(3);
    });

    it('未知时代类别默认返回 2', () => {
        expect(获取查看消息精力消耗('unknown_era')).toBe(2);
    });

    it('空字符串也默认返回 2', () => {
        expect(获取查看消息精力消耗('')).toBe(2);
    });
});

describe('获取通讯频率好感修正', () => {
    it('消息 >= 10 返回 +5', () => {
        expect(获取通讯频率好感修正(10)).toBe(5);
        expect(获取通讯频率好感修正(50)).toBe(5);
    });

    it('消息 5-9 返回 +2', () => {
        expect(获取通讯频率好感修正(5)).toBe(2);
        expect(获取通讯频率好感修正(9)).toBe(2);
    });

    it('消息 1-4 返回 +1', () => {
        expect(获取通讯频率好感修正(1)).toBe(1);
        expect(获取通讯频率好感修正(4)).toBe(1);
    });

    it('消息 0 返回 0', () => {
        expect(获取通讯频率好感修正(0)).toBe(0);
    });

    it('负数也返回 0（边界）', () => {
        expect(获取通讯频率好感修正(-5)).toBe(0);
    });
});

describe('是情报类消息', () => {
    it('包含"情报"关键词 → true', () => {
        expect(是情报类消息(构造消息({ title: '情报速递', content: '魔教动向' }))).toBe(true);
    });

    it('包含"秘密"关键词 → true', () => {
        expect(是情报类消息(构造消息({ content: '此事有秘密' }))).toBe(true);
    });

    it('包含"阴谋"关键词 → true', () => {
        expect(是情报类消息(构造消息({ title: '阴谋浮现' }))).toBe(true);
    });

    it('包含"线索"关键词 → true', () => {
        expect(是情报类消息(构造消息({ content: '有一条线索' }))).toBe(true);
    });

    it('包含"密报"关键词 → true', () => {
        expect(是情报类消息(构造消息({ title: '密报' }))).toBe(true);
    });

    it('包含"探子"关键词 → true', () => {
        expect(是情报类消息(构造消息({ content: '探子回报' }))).toBe(true);
    });

    it('包含"线人"关键词 → true', () => {
        expect(是情报类消息(构造消息({ content: '线人透露' }))).toBe(true);
    });

    it('包含"机密"关键词 → true', () => {
        expect(是情报类消息(构造消息({ content: '此事机密' }))).toBe(true);
    });

    it('普通消息 → false', () => {
        expect(是情报类消息(构造消息({ title: '你好', content: '今天天气不错' }))).toBe(false);
    });

    it('空内容 → false', () => {
        expect(是情报类消息(构造消息({ title: '', content: '' }))).toBe(false);
    });
});

describe('提取情报内容', () => {
    it('从多条消息中筛选出情报', () => {
        const msgs = [
            构造消息({ id: '1', title: '问候', content: '你好' }),
            构造消息({ id: '2', title: '情报', content: '魔教动向', sender: '探子' }),
            构造消息({ id: '3', title: '线索', content: '密道入口', sender: '线人' }),
        ];
        const result = 提取情报内容(msgs);
        expect(result).toHaveLength(2);
        expect(result[0]).toEqual({ 标题: '情报', 内容: '魔教动向', 来源: '探子' });
        expect(result[1]).toEqual({ 标题: '线索', 内容: '密道入口', 来源: '线人' });
    });

    it('无情报消息时返回空数组', () => {
        const msgs = [
            构造消息({ id: '1', title: '你好', content: '今天' }),
            构造消息({ id: '2', title: '再见', content: '明天见' }),
        ];
        expect(提取情报内容(msgs)).toEqual([]);
    });

    it('无 sender 时来源为"未知来源"', () => {
        const msgs = [构造消息({ title: '情报', content: '某事', sender: undefined })];
        const result = 提取情报内容(msgs);
        expect(result[0].来源).toBe('未知来源');
    });

    it('空数组返回空数组', () => {
        expect(提取情报内容([])).toEqual([]);
    });
});

describe('计算设备使用影响', () => {
    it('现代时代 5 条消息：精力 = 2*5=10，好感 = +2', () => {
        const r = 计算设备使用影响('modern', 5, 构造角色());
        expect(r.精力消耗).toBe(10);
        expect(r.好感修正).toBe(2);
    });

    it('古代时代 10 条消息：精力 = 1*5=5（cap 5），好感 = +5', () => {
        const r = 计算设备使用影响('ancient', 10, 构造角色());
        expect(r.精力消耗).toBe(5);
        expect(r.好感修正).toBe(5);
    });

    it('消息数超 5 时精力消耗封顶到 5 倍', () => {
        const r = 计算设备使用影响('modern', 100, 构造角色());
        expect(r.精力消耗).toBe(2 * 5);
    });

    it('0 条消息：精力 0，好感 0', () => {
        const r = 计算设备使用影响('modern', 0, 构造角色());
        expect(r.精力消耗).toBe(0);
        expect(r.好感修正).toBe(0);
    });

    it('角色为 null 仍能计算', () => {
        const r = 计算设备使用影响('modern', 3, null);
        expect(r.精力消耗).toBe(6);
        expect(r.好感修正).toBe(1);
    });

    it('返回结构包含获得情报字段（当前固定空数组）', () => {
        const r = 计算设备使用影响('modern', 3, 构造角色());
        expect(r.获得情报).toEqual([]);
    });
});

describe('是紧急通讯场景', () => {
    it('包含"求援" → true', () => {
        expect(是紧急通讯场景(构造消息({ content: '快来求援' }))).toBe(true);
    });

    it('包含"紧急" → true', () => {
        expect(是紧急通讯场景(构造消息({ title: '紧急通知' }))).toBe(true);
    });

    it('包含"危急" → true', () => {
        expect(是紧急通讯场景(构造消息({ content: '情况危急' }))).toBe(true);
    });

    it('包含"速来" → true', () => {
        expect(是紧急通讯场景(构造消息({ content: '速来支援' }))).toBe(true);
    });

    it('包含"求教" → true', () => {
        expect(是紧急通讯场景(构造消息({ content: '有事求教' }))).toBe(true);
    });

    it('包含"SOS" → true', () => {
        expect(是紧急通讯场景(构造消息({ content: 'SOS' }))).toBe(true);
    });

    it('包含"求救" → true', () => {
        expect(是紧急通讯场景(构造消息({ content: '快来救人求救' }))).toBe(true);
    });

    it('普通消息 → false', () => {
        expect(是紧急通讯场景(构造消息({ title: '日常', content: '有空吗' }))).toBe(false);
    });

    it('空消息 → false', () => {
        expect(是紧急通讯场景(构造消息({ title: '', content: '' }))).toBe(false);
    });
});

describe('获取消息延迟', () => {
    it('ancient 时代返回 1 小时（3,600,000 ms）', () => {
        expect(获取消息延迟('ancient')).toBe(3600000);
    });

    it('modern 时代即时', () => {
        expect(获取消息延迟('modern')).toBe(0);
    });

    it('near_future 即时', () => {
        expect(获取消息延迟('near_future')).toBe(0);
    });

    it('tech 即时', () => {
        expect(获取消息延迟('tech')).toBe(0);
    });

    it('holographic 即时', () => {
        expect(获取消息延迟('holographic')).toBe(0);
    });

    it('consciousness 即时', () => {
        expect(获取消息延迟('consciousness')).toBe(0);
    });

    it('未知时代返回 0（默认）', () => {
        expect(获取消息延迟('xxx')).toBe(0);
    });
});

describe('特殊通讯场景类型', () => {
    it('是字符串字面量联合类型', () => {
        // 类型断言 - 若类型定义变化会编译失败
        const scenes: 特殊通讯场景[] = ['战斗求援', '深夜推送', '跨时代延迟'];
        expect(scenes).toHaveLength(3);
    });
});
