/**
 * 游戏编排器 — GameOrchestrator
 *
 * 协调所有引擎的生命周期、初始化、调度和序列化。
 * 作为 useGame.ts 与引擎层之间的统一入口。
 */

import { GlobalTurnManager, createGlobalTurnManager } from './globalTurnManager';
import type { GlobalTurnManagerConfig } from './globalTurnManager';
import type { SLGEngine, EngineType, TurnResult, PlayerAction, ActionResult } from './types';
import { createAvgBranchEngine } from './avgBranchEngine';
import { createAvgDialogueEngine } from './avgDialogueEngine';
import { createAvgRelationEngine } from './avgRelationEngine';
import { createAvgEventEngine } from './avgEventEngine';
import { createExplorationEngine, type ExplorationEngineConfig } from './explorationEngine';
import { createDailyTownEngine } from './dailyTownEngine';
import { createRpgBattleEngine } from './rpgBattleEngine';
import { createRpgEquipEngine } from './rpgEquipEngine';
import { createRpgItemEngine } from './rpgItemEngine';
import { createRpgKungfuEngine } from './rpgKungfuEngine';
import { createRpgTaskEngine } from './rpgTaskEngine';
import { createRpgSectEngine } from './rpgSectEngine';

export interface EngineToggleConfig {
  enabled: boolean;
  config?: Record<string, unknown>;
}

export interface OrchestratorConfig {
  turnManager?: Partial<GlobalTurnManagerConfig>;
  engines?: Partial<Record<EngineType, EngineToggleConfig>>;
  exploration?: ExplorationEngineConfig;
}

export interface OrchestratorState {
  currentTurn: number;
  activeEngines: EngineType[];
  isRunning: boolean;
  engineStates: Record<string, unknown>;
}

interface EngineFactory {
  type: EngineType;
  factory: () => SLGEngine;
}

export class GameOrchestrator {
  private _turnManager: GlobalTurnManager;
  private _engines: Map<EngineType, SLGEngine>;
  private _isRunning: boolean;
  private _enabledEngines: Set<EngineType>;

  constructor(config?: OrchestratorConfig) {
    this._turnManager = createGlobalTurnManager(config?.turnManager);
    this._engines = new Map();
    this._enabledEngines = new Set();
    this._isRunning = false;

    this._initEngines(config);
  }

  // ==================== 初始化 ====================

  private _initEngines(config?: OrchestratorConfig): void {
    const factories: EngineFactory[] = [
      { type: 'avgBranch', factory: createAvgBranchEngine },
      { type: 'avgDialogue', factory: createAvgDialogueEngine },
      { type: 'avgRelation', factory: createAvgRelationEngine },
      { type: 'avgEvent', factory: createAvgEventEngine },
      { type: 'exploration', factory: () => createExplorationEngine(config?.exploration) },
      { type: 'dailyTown', factory: createDailyTownEngine },
      { type: 'rpgBattle', factory: createRpgBattleEngine },
      { type: 'rpgEquip', factory: createRpgEquipEngine },
      { type: 'rpgItem', factory: createRpgItemEngine },
      { type: 'rpgKungfu', factory: createRpgKungfuEngine },
      { type: 'rpgTask', factory: createRpgTaskEngine },
      { type: 'rpgSect', factory: createRpgSectEngine },
    ];

    for (const { type, factory } of factories) {
      const toggleConfig = config?.engines?.[type];
      if (toggleConfig?.enabled === false) continue;

      try {
        const engine = factory();
        this._engines.set(type, engine);
        this._enabledEngines.add(type);
        this._turnManager.registerEngine(engine);
      } catch {
        // 引擎初始化失败，静默跳过
      }
    }
  }

  // ==================== 生命周期 ====================

  start(): void {
    if (this._isRunning) return;
    this._isRunning = true;
  }

  pauseAll(reason: string): void {
    for (const engine of this._engines.values()) {
      engine.pause(reason as any);
    }
  }

  resumeAll(): void {
    for (const engine of this._engines.values()) {
      engine.resume();
    }
  }

  stop(): void {
    this._isRunning = false;
    for (const engine of this._engines.values()) {
      engine.pause('error');
    }
  }

  // ==================== 回合推进 ====================

  advanceTurn(): TurnResult {
    if (!this._isRunning) {
      return {
        turnNumber: this._turnManager.getCurrentTurn(),
        phase: 'idle',
        eventsTriggered: [],
        stateChanges: [],
      };
    }
    return this._turnManager.advanceTurn();
  }

  executeAction(action: PlayerAction): ActionResult {
    return this._turnManager.executeAction(action);
  }

  // ==================== 引擎访问 ====================

  getEngine<T extends SLGEngine>(type: EngineType): T | undefined {
    return this._engines.get(type) as T | undefined;
  }

  isEngineEnabled(type: EngineType): boolean {
    return this._enabledEngines.has(type);
  }

  getActiveEngines(): EngineType[] {
    return Array.from(this._enabledEngines);
  }

  getEngineCount(): number {
    return this._engines.size;
  }

  // ==================== 引擎动态管理 ====================

  enableEngine(type: EngineType, factory: () => SLGEngine): boolean {
    if (this._enabledEngines.has(type)) return false;
    try {
      const engine = factory();
      this._engines.set(type, engine);
      this._enabledEngines.add(type);
      this._turnManager.registerEngine(engine);
      return true;
    } catch {
      return false;
    }
  }

  disableEngine(type: EngineType): boolean {
    if (!this._enabledEngines.has(type)) return false;
    const ok = this._turnManager.unregisterEngine(type);
    if (ok) {
      this._enabledEngines.delete(type);
    }
    return ok;
  }

  // ==================== 状态查询 ====================

  getCurrentTurn(): number {
    return this._turnManager.getCurrentTurn();
  }

  getState(): OrchestratorState {
    const engineStates: Record<string, unknown> = {};
    for (const [type, engine] of this._engines.entries()) {
      try {
        engineStates[type] = engine.getSnapshot();
      } catch {
        engineStates[type] = null;
      }
    }

    return {
      currentTurn: this._turnManager.getCurrentTurn(),
      activeEngines: this.getActiveEngines(),
      isRunning: this._isRunning,
      engineStates,
    };
  }

  // ==================== 序列化 ====================

  serialize(): Record<string, unknown> {
    const engineData: Record<string, unknown> = {};
    for (const [type, engine] of this._engines.entries()) {
      try {
        const eng = engine as any;
        engineData[type] = typeof eng.serialize === 'function'
          ? eng.serialize()
          : typeof eng.toJSON === 'function'
            ? eng.toJSON()
            : engine.getSnapshot();
      } catch {
        engineData[type] = null;
      }
    }

    return {
      currentTurn: this._turnManager.getCurrentTurn(),
      isRunning: this._isRunning,
      enabledEngines: Array.from(this._enabledEngines),
      engines: engineData,
    };
  }

  static fromJSON(state: Record<string, unknown>, config?: OrchestratorConfig): GameOrchestrator {
    const orchestrator = new GameOrchestrator(config);

    if (typeof state.currentTurn === 'number' && state.currentTurn > 0) {
      const targetTurn = state.currentTurn as number;
      // 推进到保存的回合数
      while (orchestrator._turnManager.getCurrentTurn() < targetTurn) {
        orchestrator._turnManager.advanceTurn();
      }
    }

    if (typeof state.isRunning === 'boolean') {
      orchestrator._isRunning = state.isRunning;
    }

    if (state.engines && typeof state.engines === 'object') {
      const engineData = state.engines as Record<string, unknown>;
      for (const [typeStr, data] of Object.entries(engineData)) {
        if (!data) continue;
        const type = typeStr as EngineType;
        const engine = orchestrator._engines.get(type);
        if (!engine) continue;

        const eng = engine as any;
        if (typeof eng.constructor?.fromJSON === 'function') {
          try {
            const restored = eng.constructor.fromJSON(data);
            if (restored) {
              orchestrator._engines.set(type, restored);
            }
          } catch {
            // 恢复失败，保留原实例
          }
        }
      }
    }

    return orchestrator;
  }
}

export function createGameOrchestrator(config?: OrchestratorConfig): GameOrchestrator {
  return new GameOrchestrator(config);
}
