/**
 * AVG 分支叙事 — 主引擎
 *
 * 管理分支点注册、玩家选择记录、后果解析与应用、叙事张力追踪。
 */

import { BaseEngine } from './baseEngine';
import type {
  GameEvent,
  PlayerAction,
  ActionResult,
  GameStateSnapshot,
  NarrativeConstraint,
  TurnResult,
} from './types';
import type { BranchPoint, BranchHistoryEntry, Consequence } from '../../../models/avg/branchNarrative';
import { BranchTracker, createBranchTracker } from '../avg/branch/branchTracker';
import { ConsequenceResolver, createConsequenceResolver, applyConsequence } from '../avg/branch/consequenceResolver';

export class AvgBranchEngine extends BaseEngine {
  private _tracker: BranchTracker;
  private _resolver: ConsequenceResolver;
  private _turnNumber = 0;

  constructor() {
    super('avgBranch');
    this._tracker = createBranchTracker();
    this._resolver = createConsequenceResolver();
  }

  // ==================== SLGEngine 抽象方法 ====================

  advanceTurn(): TurnResult {
    this._turnNumber++;

    // 检查到期的延迟后果并应用
    const due = this._resolver.getDueConsequences(this._turnNumber);
    for (const { key, consequences } of due) {
      for (const consequence of consequences) {
        this._applyConsequence(consequence);
      }
      this._resolver.markApplied(key, consequences);
    }

    const events = this.resolvePendingEvents();
    return {
      turnNumber: this._turnNumber,
      phase: 'narrative',
      eventsTriggered: events.map((e) => e.event),
      stateChanges: [],
    };
  }

  executePlayerAction(action: PlayerAction): ActionResult {
    if (action.type === 'registerBranchPoint') {
      const payload = action.payload as { point: BranchPoint };
      if (!payload.point?.id) return this._failResult('缺少分支点数据');
      this.registerBranchPoint(payload.point);
      return { success: true, stateUpdates: {}, narrativeConstraint: '', keyStep: false, sideEffects: [] };
    }

    if (action.type === 'makeBranchChoice') {
      const payload = action.payload as { branchPointId: string; choiceId: string };
      if (!payload.branchPointId || !payload.choiceId) return this._failResult('缺少分支点或选项 ID');
      const entry = this.makeChoice(payload.branchPointId, payload.choiceId);
      if (!entry) return this._failResult('无效的分支点或选项');
      return {
        success: true,
        stateUpdates: { branchPointId: payload.branchPointId, choiceId: payload.choiceId },
        narrativeConstraint: `<叙事>你在 ${payload.branchPointId} 做出了选择</叙事>`,
        keyStep: entry.isCritical,
        sideEffects: [],
      };
    }

    if (action.type === 'setActiveRoute') {
      const payload = action.payload as { routeId: string | null };
      this.setActiveRoute(payload.routeId ?? null);
      return { success: true, stateUpdates: {}, narrativeConstraint: '', keyStep: false, sideEffects: [] };
    }

    return this._failResult(`不支持的操作: ${action.type}`);
  }

  canExecuteAction(action: PlayerAction): boolean {
    return ['registerBranchPoint', 'makeBranchChoice', 'setActiveRoute'].includes(action.type);
  }

  getSnapshot(): GameStateSnapshot {
    return {
      turnNumber: this._turnNumber,
      timestamp: Date.now(),
      engineStates: {
        avgBranch: {
          historyCount: this._tracker.getHistory().length,
          activeRouteId: this._tracker.getActiveRoute(),
          narrativeTension: this._tracker.getNarrativeTension(),
          pendingConsequences: this._resolver.getPendingCount(),
        },
      },
    };
  }

  getNarrativeConstraints(): NarrativeConstraint {
    const analysis = this._tracker.analyzeImpact();
    const activeRoute = this._tracker.getActiveRoute();
    const tension = this._tracker.getNarrativeTension();

    return {
      scene: activeRoute ?? 'free',
      turn: this._turnNumber,
      tension,
      playerAction: this._describeLastAction(),
      keyStep: analysis.criticalChoicesCount > 0,
      nsfwTriggered: false,
      participants: [],
      nextEvent: analysis.storyAdjustments.length > 0 ? analysis.storyAdjustments[0] : '无',
    };
  }

  // ==================== 分支点管理 ====================

  registerBranchPoint(point: BranchPoint): void {
    this._tracker.registerBranchPoint(point);
    this._pushEvent('分支点注册', `注册分支点: ${point.id}`, { branchPointId: point.id, type: point.type });
  }

  unregisterBranchPoint(branchPointId: string): void {
    this._tracker.removeBranchPoint(branchPointId);
  }

  getBranchPoint(branchPointId: string): BranchPoint | undefined {
    return this._tracker.getBranchPoint(branchPointId);
  }

  getAllBranchPoints(): BranchPoint[] {
    return this._tracker.getAllBranchPoints();
  }

  // ==================== 选择处理 ====================

  makeChoice(branchPointId: string, choiceId: string): BranchHistoryEntry | null {
    if (this.isPaused()) return null;

    const entry = this._tracker.recordChoice(branchPointId, choiceId, this._turnNumber);
    if (!entry) return null;

    const point = this._tracker.getBranchPoint(branchPointId);
    if (!point) return entry;

    const choice = point.choices.find((c) => c.id === choiceId);
    if (!choice || choice.consequences.length === 0) return entry;

    const resolution = this._resolver.resolve(
      choice.consequences,
      this._turnNumber,
      `${branchPointId}_${choiceId}`,
    );

    for (const consequence of resolution.applied) {
      this._applyConsequence(consequence);
      const historyIndex = this._tracker.getHistory().length - 1;
      this._tracker.markConsequenceApplied(
        historyIndex,
        this._buildConsequenceKey(branchPointId, choiceId, consequence),
      );
    }

    this._pushEvent('分支选择', `在 ${branchPointId} 选择了 ${choiceId}`, {
      branchPointId,
      choiceId,
      isCritical: entry.isCritical,
      appliedConsequences: resolution.applied.length,
      pendingConsequences: resolution.pending.length,
    });

    return entry;
  }

  // ==================== 路线管理 ====================

  setActiveRoute(routeId: string | null): void {
    this._tracker.setActiveRoute(routeId);
    this._pushEvent('路线变更', `设置路线: ${routeId ?? '自由'}`, { routeId });
  }

  getActiveRoute(): string | null {
    return this._tracker.getActiveRoute();
  }

  // ==================== 查询接口 ====================

  getHistory(): ReadonlyArray<BranchHistoryEntry> {
    return this._tracker.getHistory();
  }

  getNarrativeTension(): number {
    return this._tracker.getNarrativeTension();
  }

  analyzeImpact() {
    return this._tracker.analyzeImpact();
  }

  // ==================== 序列化 ====================

  serialize(): Record<string, unknown> {
    return {
      engineType: this.getEngineType(),
      turnNumber: this._turnNumber,
      tracker: this._tracker.toJSON(),
      resolver: this._resolver.toJSON(),
    };
  }

  static fromJSON(state: Record<string, unknown>): AvgBranchEngine {
    const engine = new AvgBranchEngine();
    if (state.tracker) {
      engine._tracker = BranchTracker.fromJSON(state.tracker as any);
    }
    if (state.resolver) {
      engine._resolver = ConsequenceResolver.fromJSON(state.resolver as any);
    }
    if (typeof state.turnNumber === 'number') {
      engine._turnNumber = state.turnNumber;
    }
    return engine;
  }

  // ==================== 内部方法 ====================

  private _applyConsequence(consequence: Consequence): void {
    applyConsequence(consequence, (_type, _field, _value) => {
      // 具体的状态变更由调用方通过 Zustand store 执行
      // 引擎只负责记录事件
    });
  }

  private _buildConsequenceKey(branchPointId: string, choiceId: string, consequence: Consequence): string {
    return `${branchPointId}_${choiceId}_${consequence.type}_${consequence.field}`;
  }

  private _describeLastAction(): string {
    const last = this._tracker.getLastChoice();
    if (!last) return '无操作';
    return `在 ${last.branchPointId} 做出了选择`;
  }

  private _failResult(message: string): ActionResult {
    return { success: false, stateUpdates: {}, narrativeConstraint: message, keyStep: false, sideEffects: [] };
  }

  private _pushEvent(type: string, description: string, payload: Record<string, unknown>): void {
    const event: GameEvent = {
      id: `evt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      engineType: this.getEngineType(),
      type,
      description,
      status: 'pending',
      payload,
      createdAt: Date.now(),
    };
    this.enqueueEvent(event);
  }
}

// ==================== 工厂函数 ====================

export function createAvgBranchEngine(): AvgBranchEngine {
  return new AvgBranchEngine();
}
