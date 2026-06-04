/**
 * Phase 15 测试 — GameOrchestrator
 */

import { describe, test, expect } from 'vitest';
import { GameOrchestrator, createGameOrchestrator } from './gameOrchestrator';

// ==================== 初始化 ====================

describe('GameOrchestrator', () => {
  describe('初始化', () => {
    test('create', () => {
      expect(createGameOrchestrator()).toBeInstanceOf(GameOrchestrator);
    });

    test('default config initializes engines', () => {
      const orch = createGameOrchestrator();
      expect(orch.getEngineCount()).toBeGreaterThan(0);
    });

    test('getActiveEngines returns non-empty list', () => {
      const orch = createGameOrchestrator();
      const engines = orch.getActiveEngines();
      expect(engines.length).toBeGreaterThan(0);
      expect(engines).toContain('avgDialogue');
    });
  });

  describe('引擎开关', () => {
    test('isEngineEnabled for default engines', () => {
      const orch = createGameOrchestrator();
      expect(orch.isEngineEnabled('avgDialogue')).toBe(true);
    });

    test('isEngineEnabled for rpgBattle', () => {
      const orch = createGameOrchestrator();
      expect(orch.isEngineEnabled('rpgBattle')).toBe(true);
    });
  });

  describe('生命周期', () => {
    test('start sets running state', () => {
      const orch = createGameOrchestrator();
      orch.start();
      const state = orch.getState();
      expect(state.isRunning).toBe(true);
    });

    test('stop pauses all engines', () => {
      const orch = createGameOrchestrator();
      orch.start();
      orch.stop();
      const state = orch.getState();
      expect(state.isRunning).toBe(false);
    });

    test('advanceTurn when not running returns idle', () => {
      const orch = createGameOrchestrator();
      const result = orch.advanceTurn();
      expect(result.phase).toBe('idle');
    });

    test('advanceTurn when running delegates to turnManager', () => {
      const orch = createGameOrchestrator();
      orch.start();
      const result = orch.advanceTurn();
      expect(result.turnNumber).toBeGreaterThan(0);
    });
  });

  describe('引擎访问', () => {
    test('getEngine returns engine instance', () => {
      const orch = createGameOrchestrator();
      const engine = orch.getEngine('avgDialogue');
      expect(engine).toBeDefined();
      expect(engine?.getEngineType()).toBe('avgDialogue');
    });

    test('getEngine returns defined for avgBranch', () => {
      const orch = createGameOrchestrator();
      const engine = orch.getEngine('avgBranch');
      expect(engine).toBeDefined();
    });
  });

  describe('序列化', () => {
    test('serialize returns structured state', () => {
      const orch = createGameOrchestrator();
      orch.start();
      orch.advanceTurn();
      const data = orch.serialize();
      expect(data.currentTurn).toBe(1);
      expect(data.isRunning).toBe(true);
      expect(data.enabledEngines).toBeDefined();
      expect(data.engines).toBeDefined();
    });

    test('fromJSON restores state', () => {
      const orch = createGameOrchestrator();
      orch.start();
      orch.advanceTurn();
      const data = orch.serialize();
      const restored = GameOrchestrator.fromJSON(data);
      expect(restored.getCurrentTurn()).toBe(1);
    });
  });

  describe('getState', () => {
    test('returns current turn and active engines', () => {
      const orch = createGameOrchestrator();
      orch.start();
      orch.advanceTurn();
      const state = orch.getState();
      expect(state.currentTurn).toBe(1);
      expect(state.activeEngines.length).toBeGreaterThan(0);
      expect(state.isRunning).toBe(true);
    });
  });

  describe('executeAction', () => {
    test('delegates to turnManager', () => {
      const orch = createGameOrchestrator();
      orch.start();
      const result = orch.executeAction({
        id: 'test-action',
        engineType: 'avgDialogue',
        type: 'test',
        payload: {},
        timestamp: Date.now(),
      });
      expect(result).toBeDefined();
    });
  });
});
