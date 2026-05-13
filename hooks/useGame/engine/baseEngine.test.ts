import { describe, it, expect } from 'vitest';
import { BaseEngine } from './baseEngine';
import type {
  EngineType,
  PauseReason,
  GameEvent,
  ScheduledEvent,
  PlayerAction,
  TurnResult,
  ActionResult,
  GameStateSnapshot,
  NarrativeConstraint,
} from './types';

class TestEngine extends BaseEngine {
  constructor(type: EngineType = 'global') {
    super(type);
  }

  advanceTurn(): TurnResult {
    return { turnNumber: 1, phase: 'idle', eventsTriggered: [], stateChanges: [] };
  }

  executePlayerAction(_action: PlayerAction): ActionResult {
    return { success: true, stateUpdates: {}, narrativeConstraint: '', keyStep: false, sideEffects: [] };
  }

  canExecuteAction(_action: PlayerAction): boolean {
    return true;
  }

  getSnapshot(): GameStateSnapshot {
    return { turnNumber: 0, timestamp: Date.now(), engineStates: {} };
  }

  getNarrativeConstraints(): NarrativeConstraint {
    return { scene: '', turn: 0, tension: 0, playerAction: '', keyStep: false, nsfwTriggered: false, participants: [], nextEvent: '' };
  }

  // Expose protected method for testing
  public callProcessEvent(event: GameEvent): ActionResult {
    return this.processEvent(event);
  }

  public static fromJSONForTest(json: Record<string, unknown>): TestEngine {
    const engine = new TestEngine(json.engineType as EngineType);
    engine.fromJSON(json);
    return engine;
  }
}

describe('BaseEngine', () => {
  describe('pause / resume', () => {
    it('should not be paused by default', () => {
      const engine = new TestEngine();
      expect(engine.isPaused()).toBe(false);
      expect(engine.getPauseReason()).toBeNull();
    });

    it('should pause with a reason', () => {
      const engine = new TestEngine();
      engine.pause('player-pause');
      expect(engine.isPaused()).toBe(true);
      expect(engine.getPauseReason()).toBe('player-pause');
    });

    it('should resume and clear reason', () => {
      const engine = new TestEngine();
      engine.pause('error');
      engine.resume();
      expect(engine.isPaused()).toBe(false);
      expect(engine.getPauseReason()).toBeNull();
    });
  });

  describe('getEngineType', () => {
    it('should return the engine type passed to constructor', () => {
      const engine = new TestEngine('rpgBattle');
      expect(engine.getEngineType()).toBe('rpgBattle');
    });
  });

  describe('enqueueEvent / resolvePendingEvents', () => {
    it('should resolve pending events with success', () => {
      const engine = new TestEngine();
      const event: GameEvent = {
        id: 'evt-1',
        engineType: 'global',
        type: 'TEST_EVENT',
        description: 'test',
        status: 'pending',
        payload: {},
        createdAt: Date.now(),
      };
      engine.enqueueEvent(event);
      expect(engine.pendingEvents).toHaveLength(1);

      const resolved = engine.resolvePendingEvents();
      expect(resolved).toHaveLength(1);
      expect(resolved[0].event.id).toBe('evt-1');
      expect(resolved[0].event.status).toBe('resolved');
      expect(resolved[0].result.success).toBe(true);
      expect(engine.pendingEvents).toHaveLength(0);
    });

    it('should keep non-pending events in the queue', () => {
      const engine = new TestEngine();
      const event: GameEvent = {
        id: 'evt-2',
        engineType: 'global',
        type: 'TEST',
        description: 'test',
        status: 'resolved',
        payload: {},
        createdAt: Date.now(),
      };
      engine.enqueueEvent(event);
      const resolved = engine.resolvePendingEvents();
      expect(resolved).toHaveLength(0);
      expect(engine.pendingEvents).toHaveLength(1);
    });
  });

  describe('scheduleEvent', () => {
    it('should add scheduled events to the queue', () => {
      const engine = new TestEngine();
      const scheduled: ScheduledEvent = {
        id: 'sched-1',
        engineType: 'global',
        triggerTurn: 5,
        payload: { key: 'value' },
      };
      engine.scheduleEvent(scheduled);
      expect(engine.scheduledEvents).toHaveLength(1);
      expect(engine.scheduledEvents[0].id).toBe('sched-1');
    });
  });

  describe('processEvent', () => {
    it('should return success for normal events', () => {
      const engine = new TestEngine();
      const event: GameEvent = {
        id: 'evt-3',
        engineType: 'global',
        type: 'NORMAL',
        description: 'normal event',
        status: 'pending',
        payload: {},
        createdAt: Date.now(),
      };
      const result = engine.callProcessEvent(event);
      expect(result.success).toBe(true);
      expect(result.narrativeConstraint).toContain('NORMAL');
    });
  });

  describe('serialize / fromJSON', () => {
    it('should serialize engine state', () => {
      const engine = new TestEngine('rpgBattle');
      engine.pause('phase-change');
      const evt: GameEvent = {
        id: 'evt-4',
        engineType: 'rpgBattle',
        type: 'TEST',
        description: 'test',
        status: 'pending',
        payload: { a: 1 },
        createdAt: 1000,
      };
      engine.enqueueEvent(evt);

      const json = engine.serialize();
      expect(json.engineType).toBe('rpgBattle');
      expect(json.paused).toBe(true);
      expect(json.pauseReason).toBe('phase-change');
      expect(json.pendingEvents).toHaveLength(1);
    });

    it('should restore engine state from JSON', () => {
      const json = {
        engineType: 'global' as EngineType,
        paused: true,
        pauseReason: 'error' as PauseReason,
        pendingEvents: [{
          id: 'evt-5',
          engineType: 'global',
          type: 'RESTORE_TEST',
          description: 'restore test',
          status: 'pending' as const,
          payload: {},
          createdAt: 2000,
        }],
        scheduledEvents: [{
          id: 'sched-2',
          engineType: 'global',
          triggerTurn: 10,
          payload: {},
        }],
      };

      const restored = TestEngine.fromJSONForTest(json);
      expect(restored.isPaused()).toBe(true);
      expect(restored.getPauseReason()).toBe('error');
      expect(restored.pendingEvents).toHaveLength(1);
      expect(restored.pendingEvents[0].id).toBe('evt-5');
      expect(restored.scheduledEvents).toHaveLength(1);
    });
  });
});
