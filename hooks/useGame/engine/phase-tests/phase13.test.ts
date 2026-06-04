/**
 * Phase 13 测试 — AVG 分支叙事追踪引擎
 *
 * 测试覆盖:
 * - BranchTracker: 分支点注册、选择记录、历史查询、路线管理、叙事张力
 * - ConsequenceResolver: 后果解析、延迟后果、到期检查
 * - AvgBranchEngine: SLGEngine 接口实现、选择处理、序列化
 */

import { describe, test, expect } from 'vitest';
import { BranchTracker, createBranchTracker } from '../avg/branch/branchTracker';
import { ConsequenceResolver, createConsequenceResolver, applyConsequence } from '../avg/branch/consequenceResolver';
import { AvgBranchEngine, createAvgBranchEngine } from '../engine/avgBranchEngine';
import type { BranchPoint, Consequence } from '../../../../models/avg/branchNarrative';

// ==================== 测试辅助函数 ====================

function makeBranchPoint(overrides: Partial<BranchPoint> = {}): BranchPoint {
  return {
    id: overrides.id ?? 'bp_test',
    type: 'dialogue_choice',
    title: overrides.title ?? '测试分支点',
    choices: [
      { id: 'choice_a', text: '选项 A', consequences: [], targetNodeId: 'node_a' },
      { id: 'choice_b', text: '选项 B', consequences: [], targetNodeId: 'node_b' },
    ],
    isCritical: false,
    ...overrides,
  };
}

function makeConsequence(overrides: Partial<Consequence> = {}): Consequence {
  return {
    type: 'stat_change',
    field: 'courage',
    value: 5,
    delayTurns: 0,
    ...overrides,
  };
}

function makeBranchPointWithConsequences(consequences: Consequence[], isCritical = false): BranchPoint {
  return makeBranchPoint({
    id: 'bp_consequences',
    isCritical,
    choices: [
      { id: 'choice_1', text: '选择 1', consequences, targetNodeId: 'node_1' },
      { id: 'choice_2', text: '选择 2', consequences: [], targetNodeId: 'node_2' },
    ],
  });
}

// ==================== BranchTracker 测试 ====================

describe('BranchTracker', () => {
  describe('分支点管理', () => {
    test('registerBranchPoint / getBranchPoint', () => {
      const tracker = createBranchTracker();
      const point = makeBranchPoint({ id: 'bp_001' });
      tracker.registerBranchPoint(point);
      const result = tracker.getBranchPoint('bp_001');
      expect(result).toBeDefined();
      expect(result?.id).toBe('bp_001');
    });

    test('getBranchPoint returns undefined for unknown id', () => {
      const tracker = createBranchTracker();
      expect(tracker.getBranchPoint('nonexistent')).toBeUndefined();
    });

    test('removeBranchPoint', () => {
      const tracker = createBranchTracker();
      tracker.registerBranchPoint(makeBranchPoint({ id: 'bp_001' }));
      tracker.removeBranchPoint('bp_001');
      expect(tracker.getBranchPoint('bp_001')).toBeUndefined();
    });

    test('getAllBranchPoints', () => {
      const tracker = createBranchTracker();
      tracker.registerBranchPoint(makeBranchPoint({ id: 'bp_001' }));
      tracker.registerBranchPoint(makeBranchPoint({ id: 'bp_002' }));
      const points = tracker.getAllBranchPoints();
      expect(points).toHaveLength(2);
    });

    test('getCriticalBranchPoints filters correctly', () => {
      const tracker = createBranchTracker();
      tracker.registerBranchPoint(makeBranchPoint({ id: 'bp_normal', isCritical: false }));
      tracker.registerBranchPoint(makeBranchPoint({ id: 'bp_critical', isCritical: true }));
      const critical = tracker.getCriticalBranchPoints();
      expect(critical).toHaveLength(1);
      expect(critical[0].id).toBe('bp_critical');
    });
  });

  describe('选择记录', () => {
    test('recordChoice creates history entry', () => {
      const tracker = createBranchTracker();
      tracker.registerBranchPoint(makeBranchPoint({ id: 'bp_001' }));
      const entry = tracker.recordChoice('bp_001', 'choice_a', 1);
      expect(entry).not.toBeNull();
      expect(entry?.branchPointId).toBe('bp_001');
      expect(entry?.choice.id).toBe('choice_a');
      expect(entry?.isCritical).toBe(false);
      expect(entry?.isReverted).toBe(false);
    });

    test('recordChoice returns null for unknown branch point', () => {
      const tracker = createBranchTracker();
      const entry = tracker.recordChoice('nonexistent', 'choice_a', 1);
      expect(entry).toBeNull();
    });

    test('recordChoice returns null for unknown choice', () => {
      const tracker = createBranchTracker();
      tracker.registerBranchPoint(makeBranchPoint({ id: 'bp_001' }));
      const entry = tracker.recordChoice('bp_001', 'nonexistent', 1);
      expect(entry).toBeNull();
    });

    test('critical choice increases tension more', () => {
      const tracker = createBranchTracker();
      tracker.registerBranchPoint(makeBranchPoint({ id: 'bp_critical', isCritical: true }));
      tracker.recordChoice('bp_critical', 'choice_a', 1);
      expect(tracker.getNarrativeTension()).toBe(15);
    });

    test('normal choice increases tension less', () => {
      const tracker = createBranchTracker();
      tracker.registerBranchPoint(makeBranchPoint({ id: 'bp_normal', isCritical: false }));
      tracker.recordChoice('bp_normal', 'choice_a', 1);
      expect(tracker.getNarrativeTension()).toBe(5);
    });
  });

  describe('历史查询', () => {
    test('getHistory returns all entries', () => {
      const tracker = createBranchTracker();
      tracker.registerBranchPoint(makeBranchPoint({ id: 'bp_001' }));
      tracker.recordChoice('bp_001', 'choice_a', 1);
      tracker.recordChoice('bp_001', 'choice_b', 2);
      expect(tracker.getHistory()).toHaveLength(2);
    });

    test('getHistoryForBranchPoint filters by branch point', () => {
      const tracker = createBranchTracker();
      tracker.registerBranchPoint(makeBranchPoint({ id: 'bp_001' }));
      tracker.registerBranchPoint(makeBranchPoint({ id: 'bp_002' }));
      tracker.recordChoice('bp_001', 'choice_a', 1);
      tracker.recordChoice('bp_002', 'choice_a', 2);
      const history = tracker.getHistoryForBranchPoint('bp_001');
      expect(history).toHaveLength(1);
      expect(history[0].branchPointId).toBe('bp_001');
    });

    test('getLastChoice returns most recent entry', () => {
      const tracker = createBranchTracker();
      tracker.registerBranchPoint(makeBranchPoint({ id: 'bp_001' }));
      tracker.recordChoice('bp_001', 'choice_a', 1);
      tracker.recordChoice('bp_001', 'choice_b', 2);
      const last = tracker.getLastChoice();
      expect(last?.choice.id).toBe('choice_b');
    });

    test('getLastChoice returns undefined for empty history', () => {
      const tracker = createBranchTracker();
      expect(tracker.getLastChoice()).toBeUndefined();
    });

    test('hasMadeChoice returns true after choice', () => {
      const tracker = createBranchTracker();
      tracker.registerBranchPoint(makeBranchPoint({ id: 'bp_001' }));
      tracker.recordChoice('bp_001', 'choice_a', 1);
      expect(tracker.hasMadeChoice('bp_001')).toBe(true);
    });

    test('hasMadeChoice returns false before choice', () => {
      const tracker = createBranchTracker();
      tracker.registerBranchPoint(makeBranchPoint({ id: 'bp_001' }));
      expect(tracker.hasMadeChoice('bp_001')).toBe(false);
    });

    test('getCriticalChoices returns only critical non-reverted entries', () => {
      const tracker = createBranchTracker();
      tracker.registerBranchPoint(makeBranchPoint({ id: 'bp_critical', isCritical: true }));
      tracker.registerBranchPoint(makeBranchPoint({ id: 'bp_normal', isCritical: false }));
      tracker.recordChoice('bp_critical', 'choice_a', 1);
      tracker.recordChoice('bp_normal', 'choice_a', 2);
      const critical = tracker.getCriticalChoices();
      expect(critical).toHaveLength(1);
      expect(critical[0].branchPointId).toBe('bp_critical');
    });
  });

  describe('路线管理', () => {
    test('setActiveRoute / getActiveRoute', () => {
      const tracker = createBranchTracker();
      expect(tracker.getActiveRoute()).toBeNull();
      tracker.setActiveRoute('route_heroine_a');
      expect(tracker.getActiveRoute()).toBe('route_heroine_a');
    });

    test('setActiveRoute to null clears route', () => {
      const tracker = createBranchTracker();
      tracker.setActiveRoute('route_heroine_a');
      tracker.setActiveRoute(null);
      expect(tracker.getActiveRoute()).toBeNull();
    });
  });

  describe('后果管理', () => {
    test('markConsequenceApplied tracks applied consequences', () => {
      const tracker = createBranchTracker();
      tracker.registerBranchPoint(makeBranchPoint({ id: 'bp_001' }));
      tracker.recordChoice('bp_001', 'choice_a', 1);
      tracker.markConsequenceApplied(0, 'bp_001_choice_a_0');
      const history = tracker.getHistory();
      expect(history[0].appliedConsequences).toContain('bp_001_choice_a_0');
    });

    test('getUnappliedConsequences returns pending ones', () => {
      const point = makeBranchPointWithConsequences([
        makeConsequence({ type: 'stat_change', field: 'courage', value: 5 }),
        makeConsequence({ type: 'stat_change', field: 'charm', value: 3 }),
      ]);
      const tracker = createBranchTracker();
      tracker.registerBranchPoint(point);
      tracker.recordChoice('bp_consequences', 'choice_1', 1);
      const unapplied = tracker.getUnappliedConsequences(0);
      expect(unapplied.length).toBeGreaterThan(0);
    });
  });

  describe('影响分析', () => {
    test('analyzeImpact returns correct analysis', () => {
      const tracker = createBranchTracker();
      tracker.registerBranchPoint(makeBranchPoint({ id: 'bp_001' }));
      tracker.recordChoice('bp_001', 'choice_a', 1);
      const analysis = tracker.analyzeImpact();
      expect(analysis.criticalChoicesCount).toBe(0);
      expect(analysis.routeLocked).toBe(false);
      expect(analysis.tensionLevel).toBe(5);
    });

    test('analyzeImpact counts critical choices', () => {
      const tracker = createBranchTracker();
      tracker.registerBranchPoint(makeBranchPoint({ id: 'bp_critical', isCritical: true }));
      tracker.recordChoice('bp_critical', 'choice_a', 1);
      const analysis = tracker.analyzeImpact();
      expect(analysis.criticalChoicesCount).toBe(1);
    });

    test('analyzeImpact detects route lock', () => {
      const tracker = createBranchTracker();
      tracker.setActiveRoute('route_heroine_a');
      const analysis = tracker.analyzeImpact();
      expect(analysis.routeLocked).toBe(true);
    });
  });

  describe('叙事张力', () => {
    test('tension caps at 100', () => {
      const tracker = createBranchTracker();
      for (let i = 0; i < 8; i++) {
        tracker.registerBranchPoint(makeBranchPoint({ id: `bp_${i}`, isCritical: true }));
        tracker.recordChoice(`bp_${i}`, 'choice_a', i + 1);
      }
      expect(tracker.getNarrativeTension()).toBeLessThanOrEqual(100);
    });

    test('reset clears tension', () => {
      const tracker = createBranchTracker();
      tracker.registerBranchPoint(makeBranchPoint({ id: 'bp_critical', isCritical: true }));
      tracker.recordChoice('bp_critical', 'choice_a', 1);
      expect(tracker.getNarrativeTension()).toBe(15);
      tracker.reset();
      expect(tracker.getNarrativeTension()).toBe(0);
    });
  });

  describe('序列化', () => {
    test('getState returns full state', () => {
      const tracker = createBranchTracker();
      tracker.registerBranchPoint(makeBranchPoint({ id: 'bp_001' }));
      tracker.recordChoice('bp_001', 'choice_a', 1);
      tracker.setActiveRoute('route_a');
      const state = tracker.getState();
      expect(state.history).toHaveLength(1);
      expect(state.activeRouteId).toBe('route_a');
      expect(state.narrativeTension).toBe(5);
    });

    test('fromJSON restores state', () => {
      const tracker = createBranchTracker();
      tracker.registerBranchPoint(makeBranchPoint({ id: 'bp_001' }));
      tracker.recordChoice('bp_001', 'choice_a', 1);
      tracker.setActiveRoute('route_a');
      const state = tracker.toJSON();
      const restored = BranchTracker.fromJSON(state);
      expect(restored.getHistory()).toHaveLength(1);
      expect(restored.getActiveRoute()).toBe('route_a');
    });

    test('reset clears history and route', () => {
      const tracker = createBranchTracker();
      tracker.registerBranchPoint(makeBranchPoint({ id: 'bp_001' }));
      tracker.recordChoice('bp_001', 'choice_a', 1);
      tracker.setActiveRoute('route_a');
      tracker.reset();
      expect(tracker.getHistory()).toHaveLength(0);
      expect(tracker.getActiveRoute()).toBeNull();
    });
  });
});

// ==================== ConsequenceResolver 测试 ====================

describe('ConsequenceResolver', () => {
  describe('后果解析', () => {
    test('resolve immediate consequences', () => {
      const resolver = createConsequenceResolver();
      const consequences = [
        makeConsequence({ type: 'stat_change', field: 'courage', value: 5, delayTurns: 0 }),
        makeConsequence({ type: 'intimacy_change', field: 'npc_001', value: 10, delayTurns: 0 }),
      ];
      const result = resolver.resolve(consequences, 1, 'bp_choice');
      expect(result.applied).toHaveLength(2);
      expect(result.pending).toHaveLength(0);
      expect(result.tensionDelta).toBeGreaterThan(0);
    });

    test('resolve delayed consequences', () => {
      const resolver = createConsequenceResolver();
      const consequences = [
        makeConsequence({ type: 'flag_set', field: 'met_heroine', value: true, delayTurns: 3 }),
      ];
      const result = resolver.resolve(consequences, 1, 'bp_choice');
      expect(result.applied).toHaveLength(0);
      expect(result.pending).toHaveLength(1);
      expect(result.tensionDelta).toBe(5);
    });

    test('resolve mixed immediate and delayed', () => {
      const resolver = createConsequenceResolver();
      const consequences = [
        makeConsequence({ type: 'stat_change', field: 'courage', value: 5, delayTurns: 0 }),
        makeConsequence({ type: 'route_change', field: 'route', value: 'heroine_a', delayTurns: 2 }),
      ];
      const result = resolver.resolve(consequences, 1, 'bp_choice');
      expect(result.applied).toHaveLength(1);
      expect(result.pending).toHaveLength(1);
    });
  });

  describe('延迟后果管理', () => {
    test('getDueConsequences returns expired items', () => {
      const resolver = createConsequenceResolver();
      const consequences = [
        makeConsequence({ type: 'flag_set', field: 'flag_1', value: true, delayTurns: 2 }),
      ];
      resolver.resolve(consequences, 1, 'bp_choice');
      const due = resolver.getDueConsequences(3);
      expect(due.length).toBeGreaterThan(0);
    });

    test('getDueConsequences returns nothing before due', () => {
      const resolver = createConsequenceResolver();
      const consequences = [
        makeConsequence({ type: 'flag_set', field: 'flag_1', value: true, delayTurns: 5 }),
      ];
      resolver.resolve(consequences, 1, 'bp_choice');
      const due = resolver.getDueConsequences(3);
      expect(due).toHaveLength(0);
    });

    test('markApplied removes applied items from pending', () => {
      const resolver = createConsequenceResolver();
      const consequences = [
        makeConsequence({ type: 'flag_set', field: 'flag_1', value: true, delayTurns: 2 }),
      ];
      resolver.resolve(consequences, 1, 'bp_choice');
      const due = resolver.getDueConsequences(3);
      resolver.markApplied('bp_choice', due[0].consequences);
      expect(resolver.getPendingCount()).toBe(0);
    });

    test('clearPending removes all pending', () => {
      const resolver = createConsequenceResolver();
      const consequences = [
        makeConsequence({ type: 'flag_set', field: 'flag_1', value: true, delayTurns: 5 }),
        makeConsequence({ type: 'flag_set', field: 'flag_2', value: true, delayTurns: 10 }),
      ];
      resolver.resolve(consequences, 1, 'bp_choice');
      expect(resolver.getPendingCount()).toBe(2);
      resolver.clearPending();
      expect(resolver.getPendingCount()).toBe(0);
    });
  });

  describe('序列化', () => {
    test('toJSON returns pending state', () => {
      const resolver = createConsequenceResolver();
      const consequences = [
        makeConsequence({ type: 'flag_set', field: 'flag_1', value: true, delayTurns: 5 }),
      ];
      resolver.resolve(consequences, 1, 'bp_choice');
      const json = resolver.toJSON();
      expect(Object.keys(json)).toHaveLength(1);
    });

    test('fromJSON restores pending state', () => {
      const resolver = createConsequenceResolver();
      const consequences = [
        makeConsequence({ type: 'flag_set', field: 'flag_1', value: true, delayTurns: 5 }),
      ];
      resolver.resolve(consequences, 1, 'bp_choice');
      const json = resolver.toJSON();
      const restored = ConsequenceResolver.fromJSON(json);
      expect(restored.getPendingCount()).toBe(1);
    });
  });
});

// ==================== applyConsequence 测试 ====================

describe('applyConsequence', () => {
  test('calls applyFn with correct parameters', () => {
    const calls: Array<{ type: string; field: string; value: unknown }> = [];
    const consequence = makeConsequence({ type: 'intimacy_change', field: 'npc_001', value: 10 });
    applyConsequence(consequence, (type, field, value) => {
      calls.push({ type, field, value });
    });
    expect(calls).toHaveLength(1);
    expect(calls[0].type).toBe('intimacy_change');
    expect(calls[0].field).toBe('npc_001');
    expect(calls[0].value).toBe(10);
  });

  test('returns correct description for intimacy_change', () => {
    const consequence = makeConsequence({ type: 'intimacy_change', field: 'npc_001', value: 10 });
    const desc = applyConsequence(consequence, () => {});
    expect(desc).toContain('好感度变更');
    expect(desc).toContain('+10');
  });

  test('returns correct description for route_change', () => {
    const consequence = makeConsequence({ type: 'route_change', field: 'route', value: 'heroine_a' });
    const desc = applyConsequence(consequence, () => {});
    expect(desc).toContain('路线变更');
    expect(desc).toContain('heroine_a');
  });
});

// ==================== AvgBranchEngine 测试 ====================

describe('AvgBranchEngine', () => {
  describe('初始化', () => {
    test('createAvgBranchEngine returns instance', () => {
      const engine = createAvgBranchEngine();
      expect(engine).toBeInstanceOf(AvgBranchEngine);
    });

    test('getEngineType returns avgBranch', () => {
      const engine = createAvgBranchEngine();
      expect(engine.getEngineType()).toBe('avgBranch');
    });

    test('isPaused is false initially', () => {
      const engine = createAvgBranchEngine();
      expect(engine.isPaused()).toBe(false);
    });
  });

  describe('advanceTurn', () => {
    test('advances turn number', () => {
      const engine = createAvgBranchEngine();
      const result = engine.advanceTurn();
      expect(result.turnNumber).toBe(1);
    });

    test('processes due delayed consequences', () => {
      const engine = createAvgBranchEngine();
      const point = makeBranchPointWithConsequences([
        makeConsequence({ type: 'flag_set', field: 'flag_1', value: true, delayTurns: 1 }),
      ]);
      engine.registerBranchPoint(point);
      engine.makeChoice('bp_consequences', 'choice_1');
      const result = engine.advanceTurn();
      expect(result.eventsTriggered.length).toBeGreaterThan(0);
    });
  });

  describe('分支点管理', () => {
    test('registerBranchPoint stores point', () => {
      const engine = createAvgBranchEngine();
      const point = makeBranchPoint({ id: 'bp_001' });
      engine.registerBranchPoint(point);
      expect(engine.getBranchPoint('bp_001')).toBeDefined();
    });

    test('getAllBranchPoints returns all', () => {
      const engine = createAvgBranchEngine();
      engine.registerBranchPoint(makeBranchPoint({ id: 'bp_001' }));
      engine.registerBranchPoint(makeBranchPoint({ id: 'bp_002' }));
      expect(engine.getAllBranchPoints()).toHaveLength(2);
    });

    test('unregisterBranchPoint removes point', () => {
      const engine = createAvgBranchEngine();
      engine.registerBranchPoint(makeBranchPoint({ id: 'bp_001' }));
      engine.unregisterBranchPoint('bp_001');
      expect(engine.getBranchPoint('bp_001')).toBeUndefined();
    });
  });

  describe('选择处理', () => {
    test('makeChoice records choice and applies consequences', () => {
      const engine = createAvgBranchEngine();
      const point = makeBranchPointWithConsequences([
        makeConsequence({ type: 'stat_change', field: 'courage', value: 5, delayTurns: 0 }),
      ]);
      engine.registerBranchPoint(point);
      const entry = engine.makeChoice('bp_consequences', 'choice_1');
      expect(entry).not.toBeNull();
      expect(entry?.branchPointId).toBe('bp_consequences');
    });

    test('makeChoice returns null when paused', () => {
      const engine = createAvgBranchEngine();
      engine.registerBranchPoint(makeBranchPoint({ id: 'bp_001' }));
      engine.pause('error');
      const entry = engine.makeChoice('bp_001', 'choice_a');
      expect(entry).toBeNull();
    });

    test('makeChoice returns null for invalid branch point', () => {
      const engine = createAvgBranchEngine();
      const entry = engine.makeChoice('nonexistent', 'choice_a');
      expect(entry).toBeNull();
    });
  });

  describe('路线管理', () => {
    test('setActiveRoute / getActiveRoute', () => {
      const engine = createAvgBranchEngine();
      expect(engine.getActiveRoute()).toBeNull();
      engine.setActiveRoute('route_heroine_a');
      expect(engine.getActiveRoute()).toBe('route_heroine_a');
    });
  });

  describe('查询接口', () => {
    test('getHistory returns choices', () => {
      const engine = createAvgBranchEngine();
      engine.registerBranchPoint(makeBranchPoint({ id: 'bp_001' }));
      engine.makeChoice('bp_001', 'choice_a');
      expect(engine.getHistory()).toHaveLength(1);
    });

    test('getNarrativeTension returns current tension', () => {
      const engine = createAvgBranchEngine();
      engine.registerBranchPoint(makeBranchPoint({ id: 'bp_critical', isCritical: true }));
      engine.makeChoice('bp_critical', 'choice_a');
      expect(engine.getNarrativeTension()).toBe(15);
    });

    test('analyzeImpact returns analysis', () => {
      const engine = createAvgBranchEngine();
      engine.registerBranchPoint(makeBranchPoint({ id: 'bp_critical', isCritical: true }));
      engine.makeChoice('bp_critical', 'choice_a');
      const analysis = engine.analyzeImpact();
      expect(analysis.criticalChoicesCount).toBe(1);
    });
  });

  describe('SLGEngine 接口', () => {
    test('executePlayerAction registerBranchPoint', () => {
      const engine = createAvgBranchEngine();
      const action = {
        id: 'action_001',
        engineType: 'avgBranch' as const,
        type: 'registerBranchPoint',
        payload: { point: makeBranchPoint({ id: 'bp_001' }) },
        timestamp: Date.now(),
      };
      const result = engine.executePlayerAction(action);
      expect(result.success).toBe(true);
    });

    test('executePlayerAction makeBranchChoice', () => {
      const engine = createAvgBranchEngine();
      engine.registerBranchPoint(makeBranchPoint({ id: 'bp_001' }));
      const action = {
        id: 'action_002',
        engineType: 'avgBranch' as const,
        type: 'makeBranchChoice',
        payload: { branchPointId: 'bp_001', choiceId: 'choice_a' },
        timestamp: Date.now(),
      };
      const result = engine.executePlayerAction(action);
      expect(result.success).toBe(true);
      expect(result.keyStep).toBe(false);
    });

    test('executePlayerAction makeBranchChoice with critical', () => {
      const engine = createAvgBranchEngine();
      engine.registerBranchPoint(makeBranchPoint({ id: 'bp_critical', isCritical: true }));
      const action = {
        id: 'action_003',
        engineType: 'avgBranch' as const,
        type: 'makeBranchChoice',
        payload: { branchPointId: 'bp_critical', choiceId: 'choice_a' },
        timestamp: Date.now(),
      };
      const result = engine.executePlayerAction(action);
      expect(result.success).toBe(true);
      expect(result.keyStep).toBe(true);
    });

    test('executePlayerAction setActiveRoute', () => {
      const engine = createAvgBranchEngine();
      const action = {
        id: 'action_004',
        engineType: 'avgBranch' as const,
        type: 'setActiveRoute',
        payload: { routeId: 'route_a' },
        timestamp: Date.now(),
      };
      const result = engine.executePlayerAction(action);
      expect(result.success).toBe(true);
    });

    test('executePlayerAction returns error for unknown action', () => {
      const engine = createAvgBranchEngine();
      const action = {
        id: 'action_005',
        engineType: 'avgBranch' as const,
        type: 'unknown_action',
        payload: {},
        timestamp: Date.now(),
      };
      const result = engine.executePlayerAction(action);
      expect(result.success).toBe(false);
    });

    test('canExecuteAction returns true for valid actions', () => {
      const engine = createAvgBranchEngine();
      expect(engine.canExecuteAction({ id: 'a1', engineType: 'avgBranch', type: 'registerBranchPoint', payload: {}, timestamp: 0 })).toBe(true);
      expect(engine.canExecuteAction({ id: 'a2', engineType: 'avgBranch', type: 'makeBranchChoice', payload: {}, timestamp: 0 })).toBe(true);
      expect(engine.canExecuteAction({ id: 'a3', engineType: 'avgBranch', type: 'setActiveRoute', payload: {}, timestamp: 0 })).toBe(true);
    });

    test('canExecuteAction returns false for invalid action', () => {
      const engine = createAvgBranchEngine();
      expect(engine.canExecuteAction({ id: 'a1', engineType: 'avgBranch', type: 'invalid', payload: {}, timestamp: 0 })).toBe(false);
    });

    test('getSnapshot returns state', () => {
      const engine = createAvgBranchEngine();
      const snapshot = engine.getSnapshot();
      expect(snapshot.turnNumber).toBe(0);
      expect(snapshot.engineStates.avgBranch).toBeDefined();
    });

    test('getNarrativeConstraints returns constraint', () => {
      const engine = createAvgBranchEngine();
      const constraint = engine.getNarrativeConstraints();
      expect(constraint.turn).toBe(0);
      expect(constraint.scene).toBe('free');
    });

    test('pause/resume', () => {
      const engine = createAvgBranchEngine();
      engine.pause('error');
      expect(engine.isPaused()).toBe(true);
      engine.resume();
      expect(engine.isPaused()).toBe(false);
    });
  });

  describe('序列化', () => {
    test('serialize returns full state', () => {
      const engine = createAvgBranchEngine();
      engine.registerBranchPoint(makeBranchPoint({ id: 'bp_001' }));
      engine.makeChoice('bp_001', 'choice_a');
      const serialized = engine.serialize();
      expect(serialized.turnNumber).toBe(0);
      expect(serialized.tracker).toBeDefined();
    });

    test('fromJSON restores state', () => {
      const engine = createAvgBranchEngine();
      engine.registerBranchPoint(makeBranchPoint({ id: 'bp_001' }));
      engine.makeChoice('bp_001', 'choice_a');
      const serialized = engine.serialize();
      const restored = AvgBranchEngine.fromJSON(serialized);
      expect(restored.getHistory()).toHaveLength(1);
      expect(restored.getNarrativeTension()).toBe(5);
    });
  });

  describe('pendingEvents', () => {
    test('pendingEvents contains events on branch point register', () => {
      const engine = createAvgBranchEngine();
      engine.registerBranchPoint(makeBranchPoint({ id: 'bp_001' }));
      const events = engine.pendingEvents;
      expect(events.length).toBeGreaterThan(0);
    });

    test('pendingEvents contains events on choice', () => {
      const engine = createAvgBranchEngine();
      engine.registerBranchPoint(makeBranchPoint({ id: 'bp_001' }));
      engine.makeChoice('bp_001', 'choice_a');
      const events = engine.pendingEvents;
      expect(events.length).toBeGreaterThan(0);
    });
  });
});
