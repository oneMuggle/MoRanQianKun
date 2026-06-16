/**
 * SLG + AI 混合架构 — 回合调度器
 *
 * 管理多引擎的回合推进，按优先级调度各子引擎。
 */

import type {
  SLGEngine,
  EngineType,
  TurnResult,
  GameEvent,
} from './types';

const PRIORITY_ORDER: EngineType[] = ['boardGame', 'urbanDriver', 'global', 'phoneSim', 'campusNSFW', 'bdsm'];

export class TurnManager {
  private _engines = new Map<EngineType, SLGEngine>();
  private _currentTurn = 0;
  private _activeEngines = new Set<EngineType>();
  private _paused = false;
  private _globalEvents: GameEvent[] = [];

  /**
   * 注册引擎到调度器。
   */
  register(engine: SLGEngine): void {
    const type = engine.getEngineType();
    this._engines.set(type, engine);
    this._activeEngines.add(type);
  }

  /**
   * 注销引擎。
   */
  unregister(type: EngineType): void {
    this._engines.delete(type);
    this._activeEngines.delete(type);
  }

  /**
   * 获取已注册的引擎。
   */
  getEngine(type: EngineType): SLGEngine | undefined {
    return this._engines.get(type);
  }

  /**
   * 获取所有已注册引擎类型。
   */
  get registeredEngines(): EngineType[] {
    return Array.from(this._engines.keys());
  }

  /**
   * 推进全局回合，按优先级调度各子引擎。
   */
  advanceTurn(): TurnResult {
    this._currentTurn++;
    const eventsTriggered: GameEvent[] = [];
    const stateChanges = [];

    // 按优先级顺序推进各引擎
    for (const type of PRIORITY_ORDER) {
      if (!this._activeEngines.has(type)) continue;
      const engine = this._engines.get(type);
      if (!engine || engine.isPaused()) continue;

      const result = engine.advanceTurn();
      eventsTriggered.push(...result.eventsTriggered);
      stateChanges.push(...result.stateChanges);
    }

    // 处理全局事件
    eventsTriggered.push(...this._drainGlobalEvents());

    return {
      turnNumber: this._currentTurn,
      phase: 'transition',
      eventsTriggered,
      stateChanges,
    };
  }

  /**
   * 暂停所有引擎。
   */
  pauseAll(reason: 'chat-sent' | 'phase-change' | 'error'): void {
    this._paused = true;
    for (const engine of this._engines.values()) {
      if (!engine.isPaused()) {
        engine.pause(reason);
      }
    }
  }

  /**
   * 恢复所有引擎。
   */
  resumeAll(): void {
    this._paused = false;
    for (const engine of this._engines.values()) {
      engine.resume();
    }
  }

  /**
   * 激活/停用特定引擎。
   */
  setActive(type: EngineType, active: boolean): void {
    if (active) {
      this._activeEngines.add(type);
    } else {
      this._activeEngines.delete(type);
    }
  }

  /**
   * 添加全局事件。
   */
  addGlobalEvent(event: GameEvent): void {
    this._globalEvents.push(event);
  }

  /**
   * 获取当前回合数。
   */
  get currentTurn(): number {
    return this._currentTurn;
  }

  /**
   * 是否全部暂停。
   */
  get isPaused(): boolean {
    return this._paused;
  }

  private _drainGlobalEvents(): GameEvent[] {
    const events = [...this._globalEvents];
    this._globalEvents = [];
    return events;
  }
}
