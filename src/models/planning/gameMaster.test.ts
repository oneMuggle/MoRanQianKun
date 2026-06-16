/**
 * models/planning/gameMaster.test.ts
 *
 * 多智能体游戏大师配置：默认配置 / 智能体优先级 / 超时 / 描述 / 并行检查。
 */

import { describe, it, expect } from 'vitest';
import type { 游戏大师智能体类型 } from '../../services/ai/gameMaster/types';
import {
    默认游戏大师配置,
    智能体优先级,
    智能体超时配置,
    智能体描述,
    智能体可并行执行,
    type 游戏大师配置结构,
} from './gameMaster';

describe('默认游戏大师配置', () => {
    it('默认启用', () => {
        expect(默认游戏大师配置.enabled).toBe(true);
    });

    it('默认智能体列表 4 个', () => {
        expect(默认游戏大师配置.defaultAgents).toEqual(['story', 'world', 'variable', 'planning']);
    });

    it('默认超时 2 分钟', () => {
        expect(默认游戏大师配置.timeout).toBe(120000);
    });

    it('默认 debug 关闭', () => {
        expect(默认游戏大师配置.debug).toBe(false);
    });

    it('并行组至少 2 个', () => {
        expect(默认游戏大师配置.parallelGroups.length).toBeGreaterThanOrEqual(2);
    });

    it('第一并行组含 world + variable', () => {
        const first = 默认游戏大师配置.parallelGroups[0];
        const types = first.agents.map(a => a.类型);
        expect(types).toContain('world');
        expect(types).toContain('variable');
    });
});

describe('智能体优先级', () => {
    it('6 种智能体都有优先级', () => {
        const types: 游戏大师智能体类型[] = ['story', 'world', 'variable', 'planning', 'memory', 'polish'];
        for (const t of types) {
            expect(typeof 智能体优先级[t]).toBe('number');
        }
    });

    it('优先级值从 1-6 递增', () => {
        expect(智能体优先级.story).toBe(1);
        expect(智能体优先级.world).toBe(2);
        expect(智能体优先级.variable).toBe(3);
        expect(智能体优先级.planning).toBe(4);
        expect(智能体优先级.memory).toBe(5);
        expect(智能体优先级.polish).toBe(6);
    });

    it('所有优先级为正整数', () => {
        for (const v of Object.values(智能体优先级)) {
            expect(v).toBeGreaterThan(0);
            expect(Number.isInteger(v)).toBe(true);
        }
    });
});

describe('智能体超时配置', () => {
    it('6 种智能体都有超时（毫秒）', () => {
        const types: 游戏大师智能体类型[] = ['story', 'world', 'variable', 'planning', 'memory', 'polish'];
        for (const t of types) {
            expect(智能体超时配置[t]).toBeGreaterThan(0);
        }
    });

    it('story 主剧情 90 秒', () => {
        expect(智能体超时配置.story).toBe(90000);
    });

    it('world 60 秒', () => {
        expect(智能体超时配置.world).toBe(60000);
    });

    it('variable/planning 45 秒', () => {
        expect(智能体超时配置.variable).toBe(45000);
        expect(智能体超时配置.planning).toBe(45000);
    });

    it('memory/polish 30 秒（最快）', () => {
        expect(智能体超时配置.memory).toBe(30000);
        expect(智能体超时配置.polish).toBe(30000);
    });

    it('所有超时 ≤ 90000', () => {
        for (const v of Object.values(智能体超时配置)) {
            expect(v).toBeLessThanOrEqual(90000);
        }
    });
});

describe('智能体描述', () => {
    it('6 种智能体都有中文描述', () => {
        const types: 游戏大师智能体类型[] = ['story', 'world', 'variable', 'planning', 'memory', 'polish'];
        for (const t of types) {
            expect(typeof 智能体描述[t]).toBe('string');
            expect(智能体描述[t].length).toBeGreaterThan(0);
        }
    });

    it('story = 主剧情生成', () => {
        expect(智能体描述.story).toBe('主剧情生成');
    });

    it('polish = 正文润色', () => {
        expect(智能体描述.polish).toBe('正文润色');
    });
});

describe('智能体可并行执行', () => {
    it('world + variable 可并行', () => {
        expect(智能体可并行执行('world', 'variable')).toBe(true);
    });

    it('world + planning 可并行', () => {
        expect(智能体可并行执行('world', 'planning')).toBe(true);
    });

    it('variable + planning 可并行', () => {
        expect(智能体可并行执行('variable', 'planning')).toBe(true);
    });

    it('顺序参数也可并行（对称）', () => {
        expect(智能体可并行执行('variable', 'world')).toBe(true);
        expect(智能体可并行执行('planning', 'world')).toBe(true);
    });

    it('story 不在并行列表中', () => {
        expect(智能体可并行执行('story', 'world')).toBe(false);
        expect(智能体可并行执行('story', 'variable')).toBe(false);
    });

    it('memory/polish 不参与并行', () => {
        expect(智能体可并行执行('memory', 'polish')).toBe(false);
        expect(智能体可并行执行('polish', 'world')).toBe(false);
    });

    it('同一智能体不可"并行"', () => {
        expect(智能体可并行执行('world', 'world')).toBe(false);
    });
});

describe('游戏大师配置结构类型契约', () => {
    it('完整结构可构造', () => {
        const cfg: 游戏大师配置结构 = {
            enabled: true,
            defaultAgents: ['story'],
            parallelGroups: [
                { agents: [{ 类型: 'story', priority: 1 }], 等待完成: true },
            ],
            timeout: 60000,
            debug: true,
        };
        expect(cfg.enabled).toBe(true);
        expect(cfg.timeout).toBe(60000);
    });
});
