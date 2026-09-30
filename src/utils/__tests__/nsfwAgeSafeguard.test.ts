import { describe, it, expect } from 'vitest';
import {
    NSFW最低年龄,
    角色可参与NSFW,
    过滤可参与NSFW角色,
    检测未成年性化内容,
    解析角色年龄,
    NSFW全局成年约束提示词,
    校园成年设定提示词,
    读取成年确认状态,
    写入成年确认状态,
} from '../nsfwAgeSafeguard';

describe('nsfwAgeSafeguard', () => {
    it('最低年龄为 18', () => {
        expect(NSFW最低年龄).toBe(18);
        expect(NSFW全局成年约束提示词).toContain('18');
    });

    it('解析年龄', () => {
        expect(解析角色年龄(20)).toBe(20);
        expect(解析角色年龄('17岁')).toBe(17);
        expect(解析角色年龄('未知')).toBeNull();
        expect(解析角色年龄(undefined)).toBeNull();
    });

    it('按年龄判断能否参与 NSFW', () => {
        expect(角色可参与NSFW({ 年龄: 18 })).toBe(true);
        expect(角色可参与NSFW({ 年龄: 25 })).toBe(true);
        expect(角色可参与NSFW({ 年龄: 17 })).toBe(false);
        expect(角色可参与NSFW({ 年龄: '16岁' })).toBe(false);
        expect(角色可参与NSFW({})).toBe(false);
        expect(角色可参与NSFW({ 年龄: 0 })).toBe(false);
        expect(角色可参与NSFW({ 年龄: '未知' })).toBe(false);
        expect(角色可参与NSFW(null)).toBe(false);
        expect(过滤可参与NSFW角色([{ 年龄: 16 }, { 年龄: 22 }])).toEqual([{ 年龄: 22 }]);
    });

    it('绝对禁止词直接命中', () => {
        expect(检测未成年性化内容('1girl, loli, smile').命中).toBe(true);
        expect(检测未成年性化内容('萝莉少女立绘').命中).toBe(true);
    });

    it('未成年指征 + 露骨内容命中', () => {
        expect(检测未成年性化内容('schoolgirl, nude').命中).toBe(true);
        expect(检测未成年性化内容('16 years old, naked').命中).toBe(true);
        expect(检测未成年性化内容('十六岁 裸体').命中).toBe(true);
        expect(检测未成年性化内容('child', { 视为NSFW场景: true }).命中).toBe(true);
    });

    it('校园设定限定为大学', () => {
        expect(校园成年设定提示词).toContain('大学');
        expect(校园成年设定提示词).toContain('18');
    });

    it('成年确认可持久化与撤销', () => {
        写入成年确认状态(false);
        expect(读取成年确认状态()).toBe(false);
        写入成年确认状态(true);
        expect(读取成年确认状态()).toBe(true);
        写入成年确认状态(false);
        expect(读取成年确认状态()).toBe(false);
    });

    it('正常提示词不误伤', () => {
        expect(检测未成年性化内容('1girl, adult woman, 25 years old, nude').命中).toBe(false);
        expect(检测未成年性化内容('a child playing in the village square').命中).toBe(false);
        expect(检测未成年性化内容('二十岁的女侠，裸体').命中).toBe(false);
        expect(检测未成年性化内容('二十六岁，全裸').命中).toBe(false);
        expect(检测未成年性化内容('').命中).toBe(false);
    });
});
