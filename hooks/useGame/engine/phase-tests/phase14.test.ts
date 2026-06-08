/**
 * Phase 14 测试 — 地图探索引擎
 */

import { describe, test, expect } from 'vitest';
import { MapGraph, createMapGraph } from '../../exploration/mapGraph';
import { rollEncounter, calculateEncounterRate } from '../../exploration/encounterCalculator';
import { rollTreasure } from '../../exploration/treasureDetector';
import { EventTriggerManager, createEventTriggerManager } from '../../exploration/eventTriggerPoint';
import { ExplorationEngine, createExplorationEngine } from '../explorationEngine';
import type { MapNode } from '../../../../models/exploration/mapNode';

function makeNode(overrides: Partial<MapNode> = {}): MapNode {
  return {
    id: overrides.id ?? 'node_test',
    type: overrides.type ?? 'town',
    name: overrides.name ?? '测试节点',
    description: overrides.description ?? '描述',
    dangerLevel: overrides.dangerLevel ?? 'safe',
    fowState: overrides.fowState ?? 'hidden',
    eventTriggered: false,
    ...overrides,
  };
}

function makeTestMap(): { nodes: MapNode[]; paths: Array<{ from: string; to: string; actionCost: number }> } {
  return {
    nodes: [
      makeNode({ id: 'town', type: 'town', name: '青石镇', dangerLevel: 'safe', fowState: 'revealed' }),
      makeNode({ id: 'forest', type: 'wilderness', name: '黑风林', dangerLevel: 'medium', fowState: 'hidden' }),
      makeNode({ id: 'cave', type: 'cave', name: '灵虚洞', dangerLevel: 'high', fowState: 'hidden' }),
      makeNode({ id: 'market', type: 'market', name: '万宝楼', dangerLevel: 'safe', fowState: 'hidden' }),
      makeNode({ id: 'sect', type: 'sect', name: '青云门', dangerLevel: 'low', fowState: 'hidden' }),
    ],
    paths: [
      { from: 'town', to: 'forest', actionCost: 2 },
      { from: 'town', to: 'market', actionCost: 1 },
      { from: 'forest', to: 'cave', actionCost: 3 },
      { from: 'forest', to: 'sect', actionCost: 2 },
      { from: 'market', to: 'sect', actionCost: 1 },
    ],
  };
}

// ==================== MapGraph ====================

describe('MapGraph', () => {
  describe('节点管理', () => {
    test('addNode / getNode', () => {
      const graph = createMapGraph();
      graph.addNode(makeNode({ id: 'node_001' }));
      expect(graph.getNode('node_001')).toBeDefined();
    });

    test('removeNode removes paths too', () => {
      const graph = createMapGraph();
      graph.addNode(makeNode({ id: 'a' }));
      graph.addNode(makeNode({ id: 'b' }));
      graph.addPath({ from: 'a', to: 'b', actionCost: 1 });
      graph.removeNode('a');
      expect(graph.getNode('a')).toBeUndefined();
      expect(graph.getPathsFrom('a')).toHaveLength(0);
    });

    test('getNodesByType', () => {
      const graph = createMapGraph();
      graph.addNode(makeNode({ id: 'a', type: 'town' }));
      graph.addNode(makeNode({ id: 'b', type: 'cave' }));
      graph.addNode(makeNode({ id: 'c', type: 'town' }));
      expect(graph.getNodesByType('town')).toHaveLength(2);
    });
  });

  describe('路径管理', () => {
    test('addPath / getPathsFrom', () => {
      const graph = createMapGraph();
      graph.addPath({ from: 'a', to: 'b', actionCost: 2 });
      graph.addPath({ from: 'a', to: 'c', actionCost: 3 });
      expect(graph.getPathsFrom('a')).toHaveLength(2);
    });

    test('getAdjacentNodes', () => {
      const graph = createMapGraph();
      graph.addNode(makeNode({ id: 'a' }));
      graph.addNode(makeNode({ id: 'b' }));
      graph.addPath({ from: 'a', to: 'b', actionCost: 1 });
      expect(graph.getAdjacentNodes('a')).toHaveLength(1);
    });

    test('hasPath', () => {
      const graph = createMapGraph();
      graph.addPath({ from: 'a', to: 'b', actionCost: 1 });
      expect(graph.hasPath('a', 'b')).toBe(true);
      expect(graph.hasPath('b', 'a')).toBe(false);
    });
  });

  describe('迷雾管理', () => {
    test('revealNode', () => {
      const graph = createMapGraph();
      graph.addNode(makeNode({ id: 'a', fowState: 'hidden' }));
      graph.revealNode('a');
      expect(graph.getNode('a')?.fowState).toBe('revealed');
    });

    test('getAdjacentHiddenNodes', () => {
      const graph = createMapGraph();
      graph.addNode(makeNode({ id: 'a', fowState: 'explored' }));
      graph.addNode(makeNode({ id: 'b', fowState: 'hidden' }));
      graph.addPath({ from: 'a', to: 'b', actionCost: 1 });
      expect(graph.getAdjacentHiddenNodes('a')).toHaveLength(1);
    });
  });

  describe('路径查询', () => {
    test('findPath shortest', () => {
      const graph = createMapGraph();
      graph.addNode(makeNode({ id: 'a' }));
      graph.addNode(makeNode({ id: 'b' }));
      graph.addNode(makeNode({ id: 'c' }));
      graph.addPath({ from: 'a', to: 'b', actionCost: 1 });
      graph.addPath({ from: 'b', to: 'c', actionCost: 1 });
      const path = graph.findPath('a', 'c');
      expect(path).toEqual(['a', 'b', 'c']);
    });

    test('findPath unreachable', () => {
      const graph = createMapGraph();
      graph.addNode(makeNode({ id: 'a' }));
      graph.addNode(makeNode({ id: 'b' }));
      expect(graph.findPath('a', 'b')).toBeNull();
    });
  });

  describe('序列化', () => {
    test('roundtrip', () => {
      const graph = createMapGraph();
      graph.addNode(makeNode({ id: 'a' }));
      graph.addPath({ from: 'a', to: 'b', actionCost: 2 });
      graph.addNode(makeNode({ id: 'b' }));
      const restored = MapGraph.fromJSON(graph.toJSON());
      expect(restored.getAllNodes()).toHaveLength(2);
    });
  });
});

// ==================== EncounterCalculator ====================

describe('EncounterCalculator', () => {
  test('safe area no encounter', () => {
    expect(rollEncounter({ luck: 50, dangerLevel: 'safe' }).triggered).toBe(false);
  });

  test('deadly area high rate', () => {
    expect(calculateEncounterRate({ luck: 0, dangerLevel: 'deadly' })).toBe(0.7);
  });

  test('luck reduces rate', () => {
    const noLuck = calculateEncounterRate({ luck: 0, dangerLevel: 'medium' });
    const fullLuck = calculateEncounterRate({ luck: 100, dangerLevel: 'medium' });
    expect(fullLuck).toBeLessThan(noLuck);
  });

  test('multiplier doubles rate', () => {
    const base = calculateEncounterRate({ luck: 50, dangerLevel: 'high', multiplier: 1 });
    const doubled = calculateEncounterRate({ luck: 50, dangerLevel: 'high', multiplier: 2 });
    expect(doubled).toBe(base * 2);
  });
});

// ==================== TreasureDetector ====================

describe('TreasureDetector', () => {
  test('zero stats no treasure', () => {
    expect(rollTreasure({ insight: 0, luck: 0, areaTreasureRate: 0.1 }).found).toBe(false);
  });

  test('high stats high find rate', () => {
    let found = 0;
    for (let i = 0; i < 100; i++) {
      if (rollTreasure({ insight: 100, luck: 100, areaTreasureRate: 1 }).found) found++;
    }
    expect(found).toBeGreaterThan(80);
  });
});

// ==================== EventTriggerManager ====================

describe('EventTriggerManager', () => {
  test('always trigger', () => {
    const mgr = createEventTriggerManager();
    mgr.addTrigger({ id: 't1', nodeId: 'a', conditionType: 'always', eventId: 'e1', oneTime: false });
    expect(mgr.checkTriggers(makeNode({ id: 'a' }), false, {}, {})).toHaveLength(1);
  });

  test('first_visit oneTime', () => {
    const mgr = createEventTriggerManager();
    mgr.addTrigger({ id: 't1', nodeId: 'a', conditionType: 'first_visit', eventId: 'e1', oneTime: true });
    expect(mgr.checkTriggers(makeNode({ id: 'a' }), true, {}, {})).toHaveLength(1);
    expect(mgr.checkTriggers(makeNode({ id: 'a' }), false, {}, {})).toHaveLength(0);
  });

  test('stat_check', () => {
    const mgr = createEventTriggerManager();
    mgr.addTrigger({ id: 't1', nodeId: 'a', conditionType: 'stat_check', statRequirement: { stat: 'insight', threshold: 50 }, eventId: 'e1', oneTime: false });
    expect(mgr.checkTriggers(makeNode({ id: 'a' }), false, { insight: 60 }, {})).toHaveLength(1);
    expect(mgr.checkTriggers(makeNode({ id: 'a' }), false, { insight: 30 }, {})).toHaveLength(0);
  });

  test('roundtrip', () => {
    const mgr = createEventTriggerManager();
    mgr.addTrigger({ id: 't1', nodeId: 'a', conditionType: 'always', eventId: 'e1', oneTime: false });
    const restored = EventTriggerManager.fromJSON(mgr.toJSON());
    expect(restored.getTriggersForNode('a')).toHaveLength(1);
  });
});

// ==================== ExplorationEngine ====================

describe('ExplorationEngine', () => {
  describe('初始化', () => {
    test('create', () => {
      expect(createExplorationEngine()).toBeInstanceOf(ExplorationEngine);
    });

    test('engineType', () => {
      expect(createExplorationEngine().getEngineType()).toBe('exploration');
    });
  });

  describe('地图初始化', () => {
    test('initMap', () => {
      const engine = createExplorationEngine();
      const { nodes, paths } = makeTestMap();
      engine.initMap(nodes, paths, 'town');
      expect(engine.getCurrentNode()?.id).toBe('town');
    });

    test('reveals start + adjacent', () => {
      const engine = createExplorationEngine();
      const { nodes, paths } = makeTestMap();
      engine.initMap(nodes, paths, 'town');
      expect(engine.getCurrentNode()?.fowState).toBe('explored');
      for (const { node } of engine.getAdjacentNodes()) {
        expect(node.fowState).toBe('revealed');
      }
    });
  });

  describe('移动', () => {
    test('adjacent succeeds', () => {
      const engine = createExplorationEngine({ maxAp: 10 });
      const { nodes, paths } = makeTestMap();
      engine.initMap(nodes, paths, 'town');
      expect(engine.moveTo('market').success).toBe(true);
    });

    test('does not consume AP (AP is managed separately)', () => {
      const engine = createExplorationEngine({ maxAp: 10 });
      const { nodes, paths } = makeTestMap();
      engine.initMap(nodes, paths, 'town');
      const before = engine.getState().currentAp;
      engine.moveTo('market');
      expect(engine.getState().currentAp).toBe(before);
    });

    test('non-adjacent fails', () => {
      const engine = createExplorationEngine();
      const { nodes, paths } = makeTestMap();
      engine.initMap(nodes, paths, 'town');
      expect(engine.moveTo('cave').success).toBe(false);
    });

    test('non-adjacent path with cost still succeeds (AP not enforced in moveTo)', () => {
      const engine = createExplorationEngine();
      const { nodes, paths } = makeTestMap();
      engine.initMap(nodes, paths, 'town');
      // forest has actionCost: 2, but moveTo doesn't check AP
      expect(engine.moveTo('forest').success).toBe(true);
    });
  });

  describe('SLGEngine 接口', () => {
    test('advanceTurn restores AP', () => {
      const engine = createExplorationEngine({ maxAp: 10 });
      const { nodes, paths } = makeTestMap();
      engine.initMap(nodes, paths, 'town');
      engine.moveTo('market');
      const before = engine.getState().currentAp;
      engine.advanceTurn();
      expect(engine.getState().currentAp).toBe(Math.min(10, before + 2));
    });

    test('executePlayerAction moveTo', () => {
      const engine = createExplorationEngine({ maxAp: 10 });
      const { nodes, paths } = makeTestMap();
      engine.initMap(nodes, paths, 'town');
      const r = engine.executePlayerAction({ id: 'a', engineType: 'exploration', type: 'moveTo', payload: { targetNodeId: 'market' }, timestamp: 0 });
      expect(r.success).toBe(true);
    });

    test('executePlayerAction rest', () => {
      const engine = createExplorationEngine({ maxAp: 10 });
      const r = engine.executePlayerAction({ id: 'a', engineType: 'exploration', type: 'rest', payload: {}, timestamp: 0 });
      expect(r.success).toBe(true);
    });

    test('getSnapshot', () => {
      const engine = createExplorationEngine();
      const { nodes, paths } = makeTestMap();
      engine.initMap(nodes, paths, 'town');
      const s = engine.getSnapshot();
      expect(s.engineStates.exploration).toBeDefined();
    });

    test('getNarrativeConstraints', () => {
      const engine = createExplorationEngine();
      const { nodes, paths } = makeTestMap();
      engine.initMap(nodes, paths, 'town');
      const c = engine.getNarrativeConstraints();
      expect(c.scene).toBe('青石镇');
    });

    test('pause/resume', () => {
      const engine = createExplorationEngine();
      engine.pause('error');
      expect(engine.isPaused()).toBe(true);
      engine.resume();
      expect(engine.isPaused()).toBe(false);
    });
  });

  describe('序列化', () => {
    test('roundtrip', () => {
      const engine = createExplorationEngine({ maxAp: 10 });
      const { nodes, paths } = makeTestMap();
      engine.initMap(nodes, paths, 'town');
      engine.moveTo('market');
      const restored = ExplorationEngine.fromJSON(engine.serialize());
      expect(restored.getState().currentNodeId).toBe('market');
    });
  });
});
