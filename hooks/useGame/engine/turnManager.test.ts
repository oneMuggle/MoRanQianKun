/**
 * TurnManager 回合调度器测试
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { TurnManager } from './turnManager';
import type { SLGEngine, EngineType, TurnResult, PlayerAction, ActionResult, GameStateSnapshot, NarrativeConstraint, GameEvent, ScheduledEvent, ResolvedEvent, PauseReason } from './types';

class MockEngine implements SLGEngine {
  private _type: EngineType;
  private _paused = false;
  private _turnCount = 0;
  advanceCount = 0;

  constructor(type: EngineType) { this._type = type; }

  advanceTurn(): TurnResult {
    this.advanceCount++;
    this._turnCount++;
    return { turnNumber: this._turnCount, phase: 'transition', eventsTriggered: [], stateChanges: [] };
  }

  pause(_reason: PauseReason): void { this._paused = true; }
  resume(): void { this._paused = false; }
  isPaused(): boolean { return this._paused; }
  getPauseReason(): PauseReason | null { return null; }
  enqueueEvent(_e: GameEvent): void {}
  resolvePendingEvents(): ResolvedEvent[] { return []; }
  scheduleEvent(_e: ScheduledEvent): void {}
  executePlayerAction(_a: PlayerAction): ActionResult {
    return { success: true, stateUpdates: {}, narrativeConstraint: '', keyStep: false, sideEffects: [] };
  }
  canExecuteAction(_a: PlayerAction): boolean { return true; }
  getSnapshot(): GameStateSnapshot { return { turnNumber: this._turnCount, timestamp: Date.now(), engineStates: {} }; }
  getNarrativeConstraints(): NarrativeConstraint {
    return { scene: 'test', turn: this._turnCount, tension: 0, playerAction: '', keyStep: false, nsfwTriggered: false, participants: [], nextEvent: '' };
  }
  getEngineType(): EngineType { return this._type; }
}

describe('TurnManager', () => {
  let manager: TurnManager;

  beforeEach(() => { manager = new TurnManager(); });

  it('应初始化空状态', () => {
    expect(manager.currentTurn).toBe(0);
    expect(manager.isPaused).toBe(false);
    expect(manager.registeredEngines).toEqual([]);
  });

  it('注册引擎后应可查询', () => {
    const engine = new MockEngine('boardGame');
    manager.register(engine);
    expect(manager.registeredEngines).toContain('boardGame');
    expect(manager.getEngine('boardGame')).toBe(engine);
  });

  it('advanceTurn 应推进回合并调用引擎', () => {
    const engine = new MockEngine('boardGame');
    manager.register(engine);
    manager.advanceTurn();
    expect(manager.currentTurn).toBe(1);
    expect(engine.advanceCount).toBe(1);
  });

  it('暂停的引擎不应被推进', () => {
    const engine = new MockEngine('boardGame');
    manager.register(engine);
    engine.pause('chat-sent');
    manager.advanceTurn();
    expect(engine.advanceCount).toBe(0);
  });

  it('多引擎应按优先级全部推进', () => {
    const bg = new MockEngine('boardGame');
    const ud = new MockEngine('urbanDriver');
    manager.register(bg);
    manager.register(ud);
    manager.advanceTurn();
    expect(bg.advanceCount).toBe(1);
    expect(ud.advanceCount).toBe(1);
  });

  it('pauseAll/resumeAll 应批量暂停/恢复', () => {
    const e1 = new MockEngine('boardGame');
    const e2 = new MockEngine('phoneSim');
    manager.register(e1);
    manager.register(e2);
    manager.pauseAll('chat-sent');
    expect(e1.isPaused()).toBe(true);
    expect(e2.isPaused()).toBe(true);
    manager.resumeAll();
    expect(e1.isPaused()).toBe(false);
    expect(e2.isPaused()).toBe(false);
  });

  it('注销引擎后不再调度', () => {
    const engine = new MockEngine('boardGame');
    manager.register(engine);
    manager.unregister('boardGame');
    manager.advanceTurn();
    expect(engine.advanceCount).toBe(0);
  });
});
