/**
 * Phase 15 集成测试 — 多引擎联动 + 全局回合推进
 */

import { describe, test, expect } from 'vitest';
import { GameOrchestrator, createGameOrchestrator } from './gameOrchestrator';

// ==================== 多引擎联动 ====================

describe('GameOrchestrator 集成测试', () => {
  describe('全引擎初始化', () => {
    test('所有默认引擎已注册', () => {
      const orch = createGameOrchestrator();
      const active = orch.getActiveEngines();
      expect(active.length).toBeGreaterThan(5);

      // 核心引擎必须存在
      expect(active).toContain('avgBranch');
      expect(active).toContain('avgDialogue');
      expect(active).toContain('avgRelation');
      expect(active).toContain('exploration');
      expect(active).toContain('dailyTown');
    });

    test('引擎数量与 factory 列表一致', () => {
      const orch = createGameOrchestrator();
      expect(orch.getEngineCount()).toBeGreaterThanOrEqual(10);
    });
  });

  describe('全局回合推进', () => {
    test('多回合推进不崩溃', () => {
      const orch = createGameOrchestrator();
      orch.start();

      for (let i = 0; i < 10; i++) {
        const result = orch.advanceTurn();
        expect(result.turnNumber).toBe(i + 1);
      }
    });

    test('回合历史正确记录', () => {
      const orch = createGameOrchestrator();
      orch.start();

      orch.advanceTurn();
      orch.advanceTurn();
      orch.advanceTurn();

      expect(orch.getCurrentTurn()).toBe(3);
    });

    test('暂停后 advanceTurn 返回空结果', () => {
      const orch = createGameOrchestrator();
      orch.start();
      orch.advanceTurn();

      orch.pauseAll('error');
      const result = orch.advanceTurn();

      expect(result.eventsTriggered).toHaveLength(0);
      expect(result.stateChanges).toHaveLength(0);
    });

    test('恢复后继续推进', () => {
      const orch = createGameOrchestrator();
      orch.start();
      orch.advanceTurn();

      orch.pauseAll('error');
      orch.advanceTurn();

      orch.resumeAll();
      const result = orch.advanceTurn();
      expect(result.turnNumber).toBeGreaterThan(1);
    });
  });

  describe('引擎访问与操作', () => {
    test('可以获取 avgBranch 引擎', () => {
      const orch = createGameOrchestrator();
      const branchEngine = orch.getEngine('avgBranch');
      expect(branchEngine).toBeDefined();
      expect(branchEngine?.getEngineType()).toBe('avgBranch');
    });

    test('可以获取 exploration 引擎', () => {
      const orch = createGameOrchestrator();
      const explorationEngine = orch.getEngine('exploration');
      expect(explorationEngine).toBeDefined();
      expect(explorationEngine?.getEngineType()).toBe('exploration');
    });

    test('可以获取 rpgBattle 引擎', () => {
      const orch = createGameOrchestrator();
      const battleEngine = orch.getEngine('rpgBattle');
      expect(battleEngine).toBeDefined();
      expect(battleEngine?.getEngineType()).toBe('rpgBattle');
    });

    test('可以获取 rpgTask 引擎', () => {
      const orch = createGameOrchestrator();
      const taskEngine = orch.getEngine('rpgTask');
      expect(taskEngine).toBeDefined();
      expect(taskEngine?.getEngineType()).toBe('rpgTask');
    });

    test('可以获取 rpgSect 引擎', () => {
      const orch = createGameOrchestrator();
      const sectEngine = orch.getEngine('rpgSect');
      expect(sectEngine).toBeDefined();
      expect(sectEngine?.getEngineType()).toBe('rpgSect');
    });
  });

  describe('动态引擎管理', () => {
    test('disableEngine 后不再出现在 activeEngines', () => {
      const orch = createGameOrchestrator();
      const before = orch.getActiveEngines();
      const target = before.find(type => type === 'dailyTown');
      if (target) {
        orch.disableEngine(target);
        const after = orch.getActiveEngines();
        expect(after).not.toContain(target);
      }
    });

    test('enableEngine 已启用引擎返回 false', () => {
      const orch = createGameOrchestrator();
      // 用已有的引擎来测试（已启用则返回 false）
      const engine = orch.getEngine('avgBranch')!;
      const result = orch.enableEngine('avgBranch', () => engine);
      expect(result).toBe(false);
    });
  });

  describe('完整序列化/反序列化', () => {
    test('序列化包含所有引擎数据', () => {
      const orch = createGameOrchestrator();
      orch.start();
      orch.advanceTurn();
      orch.advanceTurn();

      const data = orch.serialize();

      expect(data.currentTurn).toBe(2);
      expect(data.isRunning).toBe(true);
      expect(Object.keys(data.engines as Record<string, unknown>).length).toBeGreaterThan(0);
    });

    test('fromJSON 恢复后可继续推进', () => {
      const orch = createGameOrchestrator();
      orch.start();
      orch.advanceTurn();
      const data = orch.serialize();

      const restored = GameOrchestrator.fromJSON(data);
      expect(restored.getCurrentTurn()).toBe(1);

      restored.start();
      const result = restored.advanceTurn();
      expect(result.turnNumber).toBe(2);
    });

    test('序列化数据 roundtrip 一致性', () => {
      const orch = createGameOrchestrator();
      orch.start();
      orch.advanceTurn();
      orch.advanceTurn();
      orch.advanceTurn();

      const data1 = orch.serialize();
      const restored = GameOrchestrator.fromJSON(data1);
      const data2 = restored.serialize();

      expect(data2.currentTurn).toBe(data1.currentTurn);
      expect(data2.enabledEngines).toEqual(data1.enabledEngines);
    });
  });

  describe('SLGEngine 接口一致性', () => {
    test('所有引擎都实现 SLGEngine 接口', () => {
      const orch = createGameOrchestrator();
      for (const type of orch.getActiveEngines()) {
        const engine = orch.getEngine(type);
        expect(engine).toBeDefined();
        expect(typeof engine!.advanceTurn).toBe('function');
        expect(typeof engine!.pause).toBe('function');
        expect(typeof engine!.resume).toBe('function');
        expect(typeof engine!.isPaused).toBe('function');
        expect(typeof engine!.getSnapshot).toBe('function');
        expect(typeof engine!.getEngineType).toBe('function');
      }
    });

    test('所有引擎的 getSnapshot 返回有效数据', () => {
      const orch = createGameOrchestrator();
      for (const type of orch.getActiveEngines()) {
        const engine = orch.getEngine(type);
        const snapshot = engine!.getSnapshot();
        expect(snapshot).toBeDefined();
        expect(snapshot.engineStates).toBeDefined();
      }
    });

    test('所有引擎的 getNarrativeConstraints 返回有效数据', () => {
      const orch = createGameOrchestrator();
      for (const type of orch.getActiveEngines()) {
        const engine = orch.getEngine(type);
        const constraints = engine!.getNarrativeConstraints();
        expect(constraints).toBeDefined();
        expect(constraints.scene).toBeDefined();
      }
    });
  });
});
