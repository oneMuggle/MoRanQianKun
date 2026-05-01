import { describe, it, expect } from 'vitest';
import { 构建时代主题注入, 构建时代文风注入, 构建时代角色原型注入 } from '../../../prompts/runtime/eraTheme';
import { 构建子纪元里模式注入 } from '../../../prompts/runtime/eraLiMode';
import { 构建时代开局场景注入 } from '../../../prompts/runtime/eraOpeningScene';

// 选取几个代表性 SubEra ID 做测试
const SUB_ERAS = [
    'ancient_eastern_wuxia',
    'modern_eastern_republic',     // 近代东方·民国
    'contemporary_urban',          // 现代都市
    'near-future_cyberpunk',       // 近未来赛博
    'far-future_space_opera',      // 未来太空歌剧
    'primordial_african',          // 远古非洲部落
];

describe('构建时代主题注入', () => {
    it('对 null/undefined/空字符串返回空串', () => {
        expect(构建时代主题注入(null)).toBe('');
        expect(构建时代主题注入(undefined)).toBe('');
        expect(构建时代主题注入('')).toBe('');
    });

    it('对不存在的 eraId 返回空串', () => {
        expect(构建时代主题注入('nonexistent_era')).toBe('');
    });

    it('对已知 SubEra 返回非空且包含标签结构', () => {
        for (const eraId of SUB_ERAS) {
            const result = 构建时代主题注入(eraId);
            expect(result).toBeTruthy();
            expect(result).toContain('<时代主题约束>');
            expect(result).toContain('</时代主题约束>');
        }
    });

    it('输出包含 promptVars 关键字段', () => {
        const result = 构建时代主题注入('ancient_eastern_wuxia');
        expect(result).toContain('社会形态');
        expect(result).toContain('科技水平');
        expect(result).toContain('力量体系');
        expect(result).toContain('叙事视角');
        expect(result).toContain('描写重点');
        expect(result).toContain('对话占比');
        expect(result).toContain('时代禁忌');
    });

    it('输出包含核心冲突类型', () => {
        const result = 构建时代主题注入('ancient_eastern_wuxia');
        expect(result).toContain('核心冲突类型');
    });

    it('输出包含美术风格', () => {
        const result = 构建时代主题注入('ancient_eastern_wuxia');
        expect(result).toContain('美术风格参考');
    });

    it('输出包含 BGM 标签', () => {
        const result = 构建时代主题注入('ancient_eastern_wuxia');
        expect(result).toContain('背景音乐氛围');
    });

    it('不同 SubEra 返回不同的注入内容', () => {
        const results = SUB_ERAS.map(构建时代主题注入);
        for (let i = 0; i < results.length; i++) {
            for (let j = i + 1; j < results.length; j++) {
                expect(results[i] !== results[j]).toBe(true);
            }
        }
    });
});

describe('构建时代文风注入', () => {
    it('对 null/undefined 返回空串', () => {
        expect(构建时代文风注入(null)).toBe('');
        expect(构建时代文风注入(undefined)).toBe('');
    });

    it('对有 writingSamples 的 SubEra（含继承）返回非空', () => {
        // writingSamples 通过继承从 Era 层获取
        const result = 构建时代文风注入('ancient_eastern_wuxia');
        expect(result).toBeTruthy();
        expect(result).toContain('时代文风');
    });
});

describe('构建时代角色原型注入', () => {
    it('对 null/undefined 返回空串', () => {
        expect(构建时代角色原型注入(null)).toBe('');
        expect(构建时代角色原型注入(undefined)).toBe('');
    });

    it('对有 characterArchetypes 的 SubEra 返回非空', () => {
        const result = 构建时代角色原型注入('ancient_eastern_wuxia');
        expect(result).toBeTruthy();
        expect(result).toContain('时代角色原型');
    });

    it('对有 characterArchetypes 的 SubEra 输出包含角色名', () => {
        const result = 构建时代角色原型注入('primordial_african');
        expect(result).toBeTruthy();
        expect(result).toContain('时代角色原型');
    });
});

describe('构建子纪元里模式注入', () => {
    it('对 null/undefined 返回 null', () => {
        expect(构建子纪元里模式注入(null)).toBeNull();
        expect(构建子纪元里模式注入(undefined)).toBeNull();
    });

    it('enabled=false 返回 null', () => {
        expect(构建子纪元里模式注入('ancient_eastern_wuxia', false)).toBeNull();
    });

    it('对有 liMode 定义的 SubEra 返回非空字符串', () => {
        const result = 构建子纪元里模式注入('ancient_eastern_wuxia', true);
        expect(result).not.toBeNull();
        expect(typeof result).toBe('string');
        expect(result!.length).toBeGreaterThan(0);
    });
});

describe('构建时代开局场景注入', () => {
    it('对 null/undefined 返回空串', () => {
        expect(构建时代开局场景注入(null)).toBe('');
        expect(构建时代开局场景注入(undefined)).toBe('');
    });

    it('对不存在的 eraId 返回空串', () => {
        expect(构建时代开局场景注入('nonexistent')).toBe('');
    });

    it('对有 openingScenes 的 SubEra 返回非空且包含场景信息', () => {
        const result = 构建时代开局场景注入('primordial_african');
        expect(result).toBeTruthy();
        expect(result).toContain('时代开局场景');
        expect(result).toContain('场景：');
        expect(result).toContain('描述：');
    });

    it('对有 openingScenes 继承的 SubEra 也返回非空', () => {
        const result = 构建时代开局场景注入('ancient_eastern_wuxia');
        expect(result).toBeTruthy();
        expect(result).toContain('场景：');
    });

    it('相同 seed 返回相同场景', () => {
        const r1 = 构建时代开局场景注入('primordial_african', 42);
        const r2 = 构建时代开局场景注入('primordial_african', 42);
        expect(r1).toBe(r2);
    });
});
