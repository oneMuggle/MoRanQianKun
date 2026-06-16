/**
 * SLG + AI 混合架构 — 操作日志（事件溯源）
 *
 * 记录每次玩家操作的完整前后快照，支持回档和调试。
 */

import type {
  ActionLogEntry,
  PlayerAction,
  ActionResult,
  GameStateSnapshot,
  EngineType,
} from './types';

const MAX_LOG_SIZE = 500;

export class ActionLogger {
  private _logs: ActionLogEntry[] = [];
  private _turnNumber = 0;

  log(
    engineType: EngineType,
    action: PlayerAction,
    result: ActionResult,
    snapshotBefore: GameStateSnapshot,
    snapshotAfter: GameStateSnapshot,
  ): ActionLogEntry {
    this._turnNumber++;

    const entry: ActionLogEntry = {
      id: `log_${this._turnNumber}_${Date.now()}`,
      timestamp: Date.now(),
      turnNumber: this._turnNumber,
      engineType,
      action,
      result,
      snapshotBefore,
      snapshotAfter,
    };

    this._logs.push(entry);

    if (this._logs.length > MAX_LOG_SIZE) {
      this._logs = this._logs.slice(-MAX_LOG_SIZE);
    }

    return entry;
  }

  getLogs(fromTurn?: number, toTurn?: number): ReadonlyArray<ActionLogEntry> {
    if (fromTurn === undefined && toTurn === undefined) {
      return this._logs;
    }
    return this._logs.filter((log) => {
      if (fromTurn !== undefined && log.turnNumber < fromTurn) return false;
      if (toTurn !== undefined && log.turnNumber > toTurn) return false;
      return true;
    });
  }

  getLogsByEngine(engineType: EngineType): ReadonlyArray<ActionLogEntry> {
    return this._logs.filter((log) => log.engineType === engineType);
  }

  getKeyStepLogs(): ReadonlyArray<ActionLogEntry> {
    return this._logs.filter((log) => log.result.keyStep);
  }

  getNSFWTriggerLogs(): ReadonlyArray<ActionLogEntry> {
    return this._logs.filter((log) =>
      log.result.sideEffects.some((e) => e.type === 'nsfw-triggered'),
    );
  }

  rollbackToTurn(turnNumber: number): GameStateSnapshot | null {
    for (let i = this._logs.length - 1; i >= 0; i--) {
      if (this._logs[i].turnNumber <= turnNumber) {
        return this._logs[i].snapshotAfter;
      }
    }
    return null;
  }

  clear(): void {
    this._logs = [];
    this._turnNumber = 0;
  }

  get currentTurn(): number {
    return this._turnNumber;
  }

  get logCount(): number {
    return this._logs.length;
  }
}
