/**
 * avgEventEngine.ts
 *
 * AVG 事件引擎 — 管理场景事件的触发、执行和连锁反应。
 * 支持好感度阈值、时间/地点、关系网络、事件链等多种触发方式。
 */

import { BaseEngine } from './baseEngine';
import type {
  GameEvent,
  GameStateSnapshot,
  NarrativeConstraint,
  TurnResult,
  PlayerAction,
  ActionResult,
  EngineType,
} from './types';
import type {
  SceneEvent,
  EventExecutionResult,
  EventFilterResult,
  EventSchedulerState,
} from '../../../models/avg/eventSystem';
import type { IntimacyLevel } from '../../../models/avg/relationGraph';

export interface AvgEventState {
  allEvents: Map<string, SceneEvent>;
  triggeredEventIds: string[];
  pendingEventIds: string[];
  currentTurn: number;
  activeSceneEvent: SceneEvent | null;
}

export class AvgEventEngine extends BaseEngine {
  private _events: Map<string, SceneEvent>;
  private _turnNumber = 0;
  private _activeSceneEvent: SceneEvent | null = null;
  private _currentContext: {
    intimacyLevels: Map<string, IntimacyLevel>;
    timePeriod: string;
    location: string;
    flags: Map<string, boolean>;
  } = {
    intimacyLevels: new Map(),
    timePeriod: '上午',
    location: '',
    flags: new Map(),
  };

  constructor(events?: SceneEvent[]) {
    super('avgEvent' as EngineType);
    this._events = new Map();
    if (events) {
      for (const event of events) {
        this._events.set(event.id, { ...event });
      }
    }
  }

  // ==================== 事件管理 ====================

  registerEvent(event: SceneEvent): void {
    this._events.set(event.id, { ...event });
  }

  registerEvents(events: SceneEvent[]): void {
    for (const event of events) {
      this.registerEvent(event);
    }
  }

  getEvent(eventId: string): SceneEvent | null {
    return this._events.get(eventId) ?? null;
  }

  getAllEvents(): SceneEvent[] {
    return Array.from(this._events.values());
  }

  getEventsForNpc(npcId: string): SceneEvent[] {
    return this.getAllEvents().filter((e) => e.npcId === npcId);
  }

  getEventsForRoute(routeId: string): SceneEvent[] {
    return this.getAllEvents().filter((e) => e.routeId === routeId);
  }

  // ==================== 上下文更新 ====================

  updateNpcIntimacyLevel(npcId: string, level: IntimacyLevel): void {
    this._currentContext.intimacyLevels.set(npcId, level);
  }

  setTimePeriod(period: string): void {
    this._currentContext.timePeriod = period;
  }

  setLocation(location: string): void {
    this._currentContext.location = location;
  }

  setFlag(key: string, value: boolean): void {
    this._currentContext.flags.set(key, value);
  }

  // ==================== 触发判定 ====================

  checkTriggerableEvents(): EventFilterResult {
    const result: EventFilterResult = { triggerable: [], blocked: [] };

    for (const event of this._events.values()) {
      if (event.triggered && event.triggerCount >= event.maxTriggers && event.maxTriggers > 0) {
        continue;
      }

      const canTrigger = this._canTriggerEvent(event);
      if (canTrigger) {
        result.triggerable.push(event);
      } else {
        result.blocked.push({ event, reason: this._getTriggerBlockReason(event) });
      }
    }

    return result;
  }

  private _canTriggerEvent(event: SceneEvent): boolean {
    const { trigger } = event;

    switch (trigger.type) {
      case 'intimacy_threshold': {
        if (trigger.intimacyLevel == null) return false;
        const currentLevel = this._currentContext.intimacyLevels.get(event.npcId);
        return currentLevel != null && currentLevel >= trigger.intimacyLevel;
      }
      case 'time_location': {
        const timeMatch = !trigger.timePeriod || this._currentContext.timePeriod === trigger.timePeriod;
        const locationMatch = !trigger.location || this._currentContext.location === trigger.location;
        return timeMatch && locationMatch;
      }
      case 'flag_set': {
        if (!trigger.flagKey) return false;
        return this._currentContext.flags.get(trigger.flagKey) === true;
      }
      case 'turn_count': {
        if (trigger.turnThreshold == null) return false;
        return this._turnNumber >= trigger.turnThreshold;
      }
      case 'event_chain': {
        if (!trigger.prerequisiteEventId) return false;
        const prereq = this._events.get(trigger.prerequisiteEventId);
        return prereq != null && prereq.triggered;
      }
      default:
        return false;
    }
  }

  private _getTriggerBlockReason(event: SceneEvent): string {
    const { trigger } = event;
    switch (trigger.type) {
      case 'intimacy_threshold':
        return `好感度等级未达到 ${trigger.intimacyLevel}`;
      case 'time_location':
        return `时间/地点不匹配（当前: ${this._currentContext.timePeriod}@${this._currentContext.location}）`;
      case 'flag_set':
        return `Flag "${trigger.flagKey}" 未设置`;
      case 'turn_count':
        return `回合数未达 ${trigger.turnThreshold}（当前: ${this._turnNumber}）`;
      case 'event_chain':
        return `前置事件 "${trigger.prerequisiteEventId}" 未触发`;
      default:
        return '触发条件不满足';
    }
  }

  // ==================== 事件执行 ====================

  triggerEvent(eventId: string): EventExecutionResult | null {
    const event = this._events.get(eventId);
    if (!event) return null;

    if (event.triggered && event.triggerCount >= event.maxTriggers && event.maxTriggers > 0) {
      return { eventId, success: false, narrativeText: '', intimacyDelta: 0, sideEffects: [], chainEventsTriggered: [] };
    }

    event.triggered = true;
    event.triggerCount++;
    this._activeSceneEvent = event;

    const chainTriggered: string[] = [];
    for (const chainId of event.chainEventIds) {
      const chainEvent = this._events.get(chainId);
      if (chainEvent && !chainEvent.triggered) {
        chainTriggered.push(chainId);
      }
    }

    return {
      eventId,
      success: true,
      narrativeText: event.dialogueText || event.description,
      intimacyDelta: event.intimacyDelta,
      sideEffects: chainTriggered.map((id) => `chain:${id}`),
      chainEventsTriggered: chainTriggered,
    };
  }

  autoTriggerAll(): EventExecutionResult[] {
    return this.checkTriggerableEvents().triggerable
      .map((event) => this.triggerEvent(event.id))
      .filter((r): r is EventExecutionResult => r !== null);
  }

  // ==================== 查询 ====================

  getTriggeredEvents(): SceneEvent[] {
    return this.getAllEvents().filter((e) => e.triggered);
  }

  getPendingEvents(): SceneEvent[] {
    return this.getAllEvents().filter((e) => !e.triggered && this._canTriggerEvent(e));
  }

  getActiveSceneEvent(): SceneEvent | null {
    return this._activeSceneEvent;
  }

  clearActiveSceneEvent(): void {
    this._activeSceneEvent = null;
  }

  // ==================== SLGEngine 接口 ====================

  advanceTurn(): TurnResult {
    this._turnNumber++;
    const triggerable = this.checkTriggerableEvents();
    const events: GameEvent[] = triggerable.triggerable.map((event) => ({
      id: `avgEvent-${event.id}-${this._turnNumber}`,
      engineType: 'avgEvent' as EngineType,
      type: 'scene_event_trigger',
      description: `事件触发: ${event.name}`,
      status: 'pending',
      payload: { eventId: event.id, intimacyDelta: event.intimacyDelta },
      createdAt: Date.now(),
    }));

    return {
      turnNumber: this._turnNumber,
      phase: 'narrative',
      eventsTriggered: events,
      stateChanges: [],
    };
  }

  executePlayerAction(action: PlayerAction): ActionResult {
    if (action.type === 'trigger_event') {
      const { eventId } = action.payload as { eventId: string };
      const result = this.triggerEvent(eventId);
      if (!result) return this._failResult(`事件不存在: ${eventId}`);
      if (!result.success) return this._failResult(`事件无法触发: ${eventId}`);
      return {
        success: true,
        stateUpdates: { eventId, intimacyDelta: result.intimacyDelta },
        narrativeConstraint: `<叙事>${result.narrativeText}</叙事>`,
        keyStep: result.chainEventsTriggered.length > 0,
        sideEffects: result.chainEventsTriggered.map((id) => ({ type: 'chain_event', payload: { eventId: id } })),
      };
    }
    if (action.type === 'clear_active_event') {
      this.clearActiveSceneEvent();
      return { success: true, stateUpdates: {}, narrativeConstraint: '', keyStep: false, sideEffects: [] };
    }
    return this._failResult(`不支持的操作: ${action.type}`);
  }

  canExecuteAction(action: PlayerAction): boolean {
    return action.type === 'trigger_event' || action.type === 'clear_active_event';
  }

  getSnapshot(): GameStateSnapshot {
    return {
      turnNumber: this._turnNumber,
      timestamp: Date.now(),
      engineStates: { avgEvent: this.getState() as unknown as Record<string, unknown> },
    };
  }

  getNarrativeConstraints(): NarrativeConstraint {
    const activeEvent = this._activeSceneEvent;
    return {
      scene: activeEvent ? `活跃事件: ${activeEvent.name}` : '当前无活跃事件',
      turn: this._turnNumber,
      tension: activeEvent?.isCritical ? 0.8 : 0,
      playerAction: activeEvent ? `触发事件: ${activeEvent.name}` : '等待事件触发',
      keyStep: activeEvent?.isCritical ?? false,
      nsfwTriggered: false,
      participants: activeEvent ? [{ id: activeEvent.npcId, name: activeEvent.name, status: 'active' }] : [],
      nextEvent: this.getPendingEvents()[0]?.name ?? '无待触发事件',
    };
  }

  getState(): EventSchedulerState {
    const all = this.getAllEvents();
    return {
      pendingEvents: all.filter((e) => !e.triggered).map((e) => e.id),
      triggeredEvents: all.filter((e) => e.triggered).map((e) => e.id),
      expiredEvents: [],
      currentTurn: this._turnNumber,
    };
  }

  reset(): void {
    for (const event of this._events.values()) {
      event.triggered = false;
      event.triggerCount = 0;
    }
    this._turnNumber = 0;
    this._activeSceneEvent = null;
    this._currentContext = { intimacyLevels: new Map(), timePeriod: '上午', location: '', flags: new Map() };
  }

  serialize(): Record<string, unknown> {
    return { engineType: this.getEngineType(), turnNumber: this._turnNumber, eventCount: this._events.size, triggeredCount: this.getTriggeredEvents().length };
  }

  static fromJSON(state: Record<string, unknown>): AvgEventEngine {
    const engine = new AvgEventEngine();
    if (typeof state.turnNumber === 'number') engine._turnNumber = state.turnNumber;
    return engine;
  }

  private _failResult(reason: string): ActionResult {
    return { success: false, stateUpdates: {}, narrativeConstraint: `<错误>${reason}</错误>`, keyStep: false, sideEffects: [] };
  }
}

export function createAvgEventEngine(events?: SceneEvent[]): AvgEventEngine {
  return new AvgEventEngine(events);
}
