/**
 * SLG + AI 混合架构 — 抽象基类
 *
 * 所有子引擎继承此基类，自动获得暂停/恢复、事件队列、状态快照等通用能力。
 */

import type {
  SLGEngine,
  EngineType,
  PauseReason,
  GameEvent,
  ScheduledEvent,
  ResolvedEvent,
  GameStateSnapshot,
  NarrativeConstraint,
  TurnResult,
  PlayerAction,
  ActionResult,
} from './types';

export abstract class BaseEngine implements SLGEngine {
  protected _engineType: EngineType;
  protected _paused = false;
  protected _pauseReason: PauseReason | null = null;
  protected _pendingEvents: GameEvent[] = [];
  protected _scheduledEvents: ScheduledEvent[] = [];

  constructor(engineType: EngineType) {
    this._engineType = engineType;
  }

  // ==================== 必须被子类实现的抽象方法 ====================

  abstract advanceTurn(): TurnResult;
  abstract executePlayerAction(action: PlayerAction): ActionResult;
  abstract canExecuteAction(action: PlayerAction): boolean;
  abstract getSnapshot(): GameStateSnapshot;
  abstract getNarrativeConstraints(): NarrativeConstraint;

  // ==================== 暂停/恢复 ====================

  pause(reason: PauseReason): void {
    this._paused = true;
    this._pauseReason = reason;
  }

  resume(): void {
    this._paused = false;
    this._pauseReason = null;
  }

  isPaused(): boolean {
    return this._paused;
  }

  getPauseReason(): PauseReason | null {
    return this._pauseReason;
  }

  // ==================== 事件管理 ====================

  enqueueEvent(event: GameEvent): void {
    this._pendingEvents.push(event);
  }

  resolvePendingEvents(): ResolvedEvent[] {
    const resolved: ResolvedEvent[] = [];
    const remaining: GameEvent[] = [];

    for (const event of this._pendingEvents) {
      if (event.status === 'pending') {
        const result = this.processEvent(event);
        const resolvedEvent: GameEvent = {
          ...event,
          status: result.success ? 'resolved' : event.status,
          resolvedAt: result.success ? Date.now() : undefined,
        };
        if (result.success) {
          resolved.push({ event: resolvedEvent, result });
        } else {
          remaining.push(event);
        }
      } else {
        remaining.push(event);
      }
    }

    this._pendingEvents = remaining;
    return resolved;
  }

  scheduleEvent(event: ScheduledEvent): void {
    this._scheduledEvents.push(event);
  }

  /**
   * 处理单个事件，返回结算结果。
   * 子类可覆写以提供自定义事件处理逻辑。
   */
  protected processEvent(event: GameEvent): ActionResult {
    return {
      success: true,
      stateUpdates: { eventId: event.id },
      narrativeConstraint: `<事件结算>类型: ${event.type} | ${event.description}</事件结算>`,
      keyStep: false,
      sideEffects: [],
    };
  }

  // ==================== 序列化 ====================

  serialize(): Record<string, unknown> {
    return {
      engineType: this._engineType,
      paused: this._paused,
      pauseReason: this._pauseReason,
      pendingEvents: this._pendingEvents,
      scheduledEvents: this._scheduledEvents,
    };
  }

  protected fromJSON(json: Record<string, unknown>): void {
    this._engineType = json.engineType as EngineType;
    this._paused = !!json.paused;
    this._pauseReason = (json.pauseReason as PauseReason) || null;
    this._pendingEvents = (json.pendingEvents as GameEvent[]) || [];
    this._scheduledEvents = (json.scheduledEvents as ScheduledEvent[]) || [];
  }

  // ==================== 引擎信息 ====================

  getEngineType(): EngineType {
    return this._engineType;
  }

  get pendingEvents(): ReadonlyArray<GameEvent> {
    return this._pendingEvents;
  }

  get scheduledEvents(): ReadonlyArray<ScheduledEvent> {
    return this._scheduledEvents;
  }
}
