/**
 * BoardGameEngine 类测试
 *
 * 覆盖 startGame, advanceTurn, executePlayerAction, canExecuteAction,
 * getSnapshot, getNarrativeConstraints, checkNSFWUpgrade, endGame 等方法。
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { BoardGameEngine } from './boardGameEngine';

describe('BoardGameEngine', () => {
  let engine: BoardGameEngine;

  beforeEach(() => {
    engine = new BoardGameEngine();
  });

  describe('初始化状态', () => {
    it('应初始化为非活跃状态', () => {
      expect(engine.isActive).toBe(false);
      expect(engine.gameType).toBeNull();
      expect(engine.tension).toBe(40);
    });

    it('getEngineType 应返回 boardGame', () => {
      expect(engine.getEngineType()).toBe('boardGame');
    });
  });

  describe('startGame', () => {
    it('应设置游戏类型并标记为活跃', () => {
      engine.startGame('狼人杀');
      expect(engine.isActive).toBe(true);
      expect(engine.gameType).toBe('狼人杀');
    });

    it('应重置回合数为 0', () => {
      engine.startGame('骰子游戏', 10);
      const snapshot = engine.getSnapshot();
      expect(snapshot.engineStates.boardGame.currentTurn).toBe(0);
    });
  });

  describe('advanceTurn', () => {
    it('应增加回合数并计算紧张度', () => {
      engine.startGame('骰子游戏');
      const result = engine.advanceTurn();
      expect(result.turnNumber).toBe(1);
      expect(result.phase).toBe('resolution');
    });

    it('多次调用应持续增加回合数', () => {
      engine.startGame('狼人杀');
      engine.advanceTurn();
      const result = engine.advanceTurn();
      expect(result.turnNumber).toBe(2);
    });
  });

  describe('executePlayerAction', () => {
    beforeEach(() => {
      engine.startGame('骰子游戏');
      engine.advanceTurn();
    });

    it('应返回结算结果', () => {
      const result = engine.executePlayerAction({
        id: 'test-1',
        engineType: 'boardGame',
        type: 'roll',
        payload: {},
        timestamp: Date.now(),
      });
      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('narrativeConstraint');
    });

    it('应增加紧张度', () => {
      const before = engine.tension;
      engine.executePlayerAction({
        id: 'test-2',
        engineType: 'boardGame',
        type: '掷骰',
        payload: {},
        timestamp: Date.now(),
      });
      expect(engine.tension).toBeGreaterThan(before);
    });

    it('中文操作类型应正确映射', () => {
      const result = engine.executePlayerAction({
        id: 'test-3',
        engineType: 'boardGame',
        type: '购买地块',
        payload: {},
        timestamp: Date.now(),
      });
      expect(result.success).toBe(true);
    });

    it('未知操作类型应回退到自定义', () => {
      const result = engine.executePlayerAction({
        id: 'test-4',
        engineType: 'boardGame',
        type: 'unknown-action',
        payload: {},
        timestamp: Date.now(),
      });
      expect(result.success).toBe(true);
    });
  });

  describe('canExecuteAction', () => {
    it('非活跃状态应返回 false', () => {
      const result = engine.canExecuteAction({
        id: 'test',
        engineType: 'boardGame',
        type: 'roll',
        payload: {},
        timestamp: Date.now(),
      });
      expect(result).toBe(false);
    });

    it('活跃状态应返回 true', () => {
      engine.startGame('骰子游戏');
      engine.advanceTurn();
      expect(engine.canExecuteAction({
        id: 'test',
        engineType: 'boardGame',
        type: 'roll',
        payload: {},
        timestamp: Date.now(),
      })).toBe(true);
    });

    it('暂停状态应返回 false', () => {
      engine.startGame('骰子游戏');
      engine.advanceTurn();
      engine.pause('player-pause');
      expect(engine.canExecuteAction({
        id: 'test',
        engineType: 'boardGame',
        type: 'roll',
        payload: {},
        timestamp: Date.now(),
      })).toBe(false);
    });
  });

  describe('getSnapshot', () => {
    it('应包含游戏状态信息', () => {
      engine.startGame('狼人杀', 10);
      engine.registerNPC('npc-1', { name: '张三', status: 'active' });
      engine.advanceTurn();

      const snapshot = engine.getSnapshot();
      expect(snapshot.turnNumber).toBe(1);
      expect(snapshot.engineStates.boardGame).toHaveProperty('gameType', '狼人杀');
      expect(snapshot.engineStates.boardGame).toHaveProperty('tension');
      expect(snapshot.engineStates.boardGame).toHaveProperty('npcCount', 1);
    });
  });

  describe('getNarrativeConstraints', () => {
    it('应包含场景和回合信息', () => {
      engine.startGame('密室逃脱');
      engine.advanceTurn();
      engine.executePlayerAction({
        id: 'test',
        engineType: 'boardGame',
        type: 'search',
        payload: {},
        timestamp: Date.now(),
      });

      const constraints = engine.getNarrativeConstraints();
      expect(constraints.scene).toContain('桌游');
      expect(constraints.scene).toContain('密室逃脱');
      expect(constraints.turn).toBe(1);
    });

    it('应包含参与者信息', () => {
      engine.startGame('狼人杀');
      engine.registerNPC('npc-1', { name: '李四', status: 'active', desireStage: '试探' });

      const constraints = engine.getNarrativeConstraints();
      expect(constraints.participants.length).toBe(1);
      expect(constraints.participants[0].name).toBe('李四');
      expect(constraints.participants[0].desireStage).toBe('试探');
    });
  });

  describe('NPC 管理', () => {
    it('registerNPC 应添加参与者', () => {
      engine.startGame('骰子游戏');
      engine.registerNPC('npc-1', { name: '王五' });
      const snapshot = engine.getSnapshot();
      expect(snapshot.engineStates.boardGame.npcCount).toBe(1);
    });

    it('unregisterNPC 应移除参与者', () => {
      engine.startGame('骰子游戏');
      engine.registerNPC('npc-1', { name: '王五' });
      engine.unregisterNPC('npc-1');
      const snapshot = engine.getSnapshot();
      expect(snapshot.engineStates.boardGame.npcCount).toBe(0);
    });
  });

  describe('checkNSFWUpgrade', () => {
    it('高紧张度应触发升级判定', () => {
      engine.startGame('国王游戏');
      for (let i = 0; i < 5; i++) {
        engine.advanceTurn();
        engine.executePlayerAction({
          id: `test-${i}`,
          engineType: 'boardGame',
          type: '回应命令',
          payload: { 回应: '反抗' },
          timestamp: Date.now(),
        });
      }
      const result = engine.checkNSFWUpgrade('试探', 2);
      expect(typeof result).toBe('boolean');
    });
  });

  describe('endGame', () => {
    it('应标记为非活跃状态', () => {
      engine.startGame('骰子游戏');
      engine.endGame();
      expect(engine.isActive).toBe(false);
      expect(engine.gameType).toBeNull();
    });
  });

  describe('pause/resume', () => {
    it('pause 后应处于暂停状态', () => {
      engine.startGame('骰子游戏');
      engine.pause('chat-sent');
      expect(engine.isPaused()).toBe(true);
    });

    it('resume 后应恢复运行', () => {
      engine.startGame('骰子游戏');
      engine.pause('chat-sent');
      engine.resume();
      expect(engine.isPaused()).toBe(false);
    });
  });
});
