/**
 * models/era-config/themeMapping.test.ts
 *
 * 时代主题映射：3 个获取函数 + 时代主题映射表完整性。
 */

import { describe, it, expect } from 'vitest';
import {
    时代主题映射表,
    获取时代推荐主题,
    获取时代信息,
    获取时代背景,
    type 时代主题映射,
} from './themeMapping';
import type { ThemePreset } from './../theme-visual';
import { 全部时代配置 } from './presets';

describe('时代主题映射表', () => {
    it('至少覆盖一个时代', () => {
        expect(Object.keys(时代主题映射表).length).toBeGreaterThan(0);
    });

    it('每个映射都有 推荐主题 和 主题描述', () => {
        for (const [eraId, mapping] of Object.entries(时代主题映射表)) {
            expect(mapping.推荐主题, `时代 ${eraId} 缺推荐主题`).toBeTruthy();
            expect(typeof mapping.主题描述).toBe('string');
        }
    });

    it('所有 推荐主题 都是合法的 ThemePreset', () => {
        const valid: ThemePreset[] = ['ink', 'azure', 'ember', 'jade', 'violet', 'moon', 'crimson', 'sand'];
        for (const mapping of Object.values(时代主题映射表)) {
            expect(valid).toContain(mapping.推荐主题);
        }
    });

    it('结构类型契约：时代主题映射', () => {
        const map: 时代主题映射 = {
            'test_era': { 推荐主题: 'ink', 主题描述: 'test' },
        };
        expect(map.test_era.推荐主题).toBe('ink');
    });
});

describe('获取时代推荐主题', () => {
    it('已知时代返回非 null', () => {
        // 从映射表取一个真实存在的 key
        const knownKey = Object.keys(时代主题映射表)[0];
        expect(knownKey).toBeTruthy();
        const theme = 获取时代推荐主题(knownKey);
        expect(theme).not.toBeNull();
    });

    it('未知时代返回 null', () => {
        expect(获取时代推荐主题('nonexistent_era_xxx')).toBeNull();
    });

    it('空字符串返回 null', () => {
        expect(获取时代推荐主题('')).toBeNull();
    });
});

describe('获取时代信息', () => {
    it('能在 全部时代配置 中找到的 ID 返回完整信息', () => {
        const firstEra = 全部时代配置[0];
        const info = 获取时代信息(firstEra.id);
        expect(info).not.toBeNull();
        expect(info?.配置ID).toBe(firstEra.id);
        expect(info?.名称).toBe(firstEra.名称);
        expect(info?.时代背景).toBe(firstEra.时代);
    });

    it('未知时代 ID 返回 null', () => {
        expect(获取时代信息('nonexistent_era_xxx')).toBeNull();
    });

    it('全部时代配置 中所有 ID 都能查到', () => {
        for (const era of 全部时代配置) {
            const info = 获取时代信息(era.id);
            expect(info).not.toBeNull();
        }
    });
});

describe('获取时代背景', () => {
    it('已存在时代返回其 时代背景 字段', () => {
        const firstEra = 全部时代配置[0];
        const bg = 获取时代背景(firstEra.id);
        expect(bg).toBe(firstEra.时代);
    });

    it('未知时代返回 null', () => {
        expect(获取时代背景('nonexistent_xxx')).toBeNull();
    });

    it('合法时代背景：6 种之一', () => {
        const validBgs = ['古代', '近代', '现代', '近未来', '未来', '自定义'];
        for (const era of 全部时代配置) {
            const bg = 获取时代背景(era.id);
            expect(validBgs).toContain(bg);
        }
    });
});
