/**
 * AVG 分支叙事 — 分支追踪器
 *
 * 记录玩家在每个关键节点的选择，维护分支历史。
 */

import type {
  BranchPoint,
  BranchHistoryEntry,
  BranchNarrativeState,
  BranchImpactAnalysis,
  Consequence,
} from '../../../../models/avg/branchNarrative';

export class BranchTracker {
  private _branchPoints: Map<string, BranchPoint>;
  private _history: BranchHistoryEntry[];
  private _activeRouteId: string | null;
  private _narrativeTension: number;

  constructor() {
    this._branchPoints = new Map();
    this._history = [];
    this._activeRouteId = null;
    this._narrativeTension = 0;
  }

  // ==================== 分支点管理 ====================

  registerBranchPoint(point: BranchPoint): void {
    this._branchPoints.set(point.id, { ...point });
  }

  removeBranchPoint(branchPointId: string): void {
    this._branchPoints.delete(branchPointId);
  }

  getBranchPoint(branchPointId: string): BranchPoint | undefined {
    return this._branchPoints.get(branchPointId);
  }

  getAllBranchPoints(): BranchPoint[] {
    return Array.from(this._branchPoints.values());
  }

  getCriticalBranchPoints(): BranchPoint[] {
    return this.getAllBranchPoints().filter((p) => p.isCritical);
  }

  // ==================== 选择记录 ====================

  recordChoice(branchPointId: string, choiceId: string, turnNumber: number): BranchHistoryEntry | null {
    const point = this._branchPoints.get(branchPointId);
    if (!point) return null;

    const choice = point.choices.find((c) => c.id === choiceId);
    if (!choice) return null;

    const entry: BranchHistoryEntry = {
      branchPointId,
      choice: {
        id: choiceId,
        branchPointId,
        choiceText: choice.text,
        targetNodeId: choice.targetNodeId ?? '',
        timestamp: Date.now(),
        turnNumber,
      },
      appliedConsequences: [],
      isCritical: point.isCritical,
      isReverted: false,
    };

    this._history.push(entry);

    if (point.isCritical) {
      this._narrativeTension = Math.min(100, this._narrativeTension + 15);
    } else {
      this._narrativeTension = Math.min(100, this._narrativeTension + 5);
    }

    return entry;
  }

  // ==================== 历史查询 ====================

  getHistory(): ReadonlyArray<BranchHistoryEntry> {
    return this._history;
  }

  getHistoryForBranchPoint(branchPointId: string): BranchHistoryEntry[] {
    return this._history.filter((e) => e.branchPointId === branchPointId);
  }

  getCriticalChoices(): BranchHistoryEntry[] {
    return this._history.filter((e) => e.isCritical && !e.isReverted);
  }

  getLastChoice(): BranchHistoryEntry | undefined {
    return this._history[this._history.length - 1];
  }

  hasMadeChoice(branchPointId: string): boolean {
    return this._history.some((e) => e.branchPointId === branchPointId && !e.isReverted);
  }

  // ==================== 路线管理 ====================

  setActiveRoute(routeId: string | null): void {
    this._activeRouteId = routeId;
  }

  getActiveRoute(): string | null {
    return this._activeRouteId;
  }

  // ==================== 后果管理 ====================

  markConsequenceApplied(historyIndex: number, consequenceId: string): void {
    if (historyIndex >= 0 && historyIndex < this._history.length) {
      if (!this._history[historyIndex].appliedConsequences.includes(consequenceId)) {
        this._history[historyIndex] = {
          ...this._history[historyIndex],
          appliedConsequences: [...this._history[historyIndex].appliedConsequences, consequenceId],
        };
      }
    }
  }

  getUnappliedConsequences(historyIndex: number): Consequence[] {
    if (historyIndex < 0 || historyIndex >= this._history.length) return [];
    const entry = this._history[historyIndex];
    const point = this._branchPoints.get(entry.branchPointId);
    if (!point) return [];

    const choice = point.choices.find((c) => c.id === entry.choice.id);
    if (!choice) return [];

    return choice.consequences.filter((_, i) => !entry.appliedConsequences.includes(`${entry.branchPointId}_${choice.id}_${i}`));
  }

  // ==================== 影响分析 ====================

  analyzeImpact(): BranchImpactAnalysis {
    const criticalChoices = this.getCriticalChoices();
    const affectedNpcs = new Set<string>();
    const storyAdjustments: string[] = [];

    for (const entry of this._history) {
      if (entry.isReverted) continue;
      const point = this._branchPoints.get(entry.branchPointId);
      if (!point) continue;

      const choice = point.choices.find((c) => c.id === entry.choice.id);
      if (!choice) continue;

      for (const consequence of choice.consequences) {
        if (consequence.type === 'intimacy_change') {
          affectedNpcs.add(consequence.field);
        }
        if (consequence.type === 'route_change') {
          storyAdjustments.push(`路线变更为: ${consequence.value}`);
        }
        if (consequence.type === 'ending_modifier') {
          storyAdjustments.push(`结局影响: ${consequence.field} → ${consequence.value}`);
        }
      }
    }

    return {
      criticalChoicesCount: criticalChoices.length,
      routeLocked: !!this._activeRouteId,
      tensionLevel: this._narrativeTension,
      affectedNpcs: Array.from(affectedNpcs),
      storyAdjustments,
    };
  }

  // ==================== 状态 ====================

  getState(): BranchNarrativeState {
    return {
      history: this._history.map((e) => ({ ...e })),
      activeRouteId: this._activeRouteId,
      criticalBranchIds: this.getCriticalBranchPoints().map((p) => p.id),
      triggeredConsequenceIds: this._history.flatMap((e) => e.appliedConsequences),
      narrativeTension: this._narrativeTension,
    };
  }

  getNarrativeTension(): number {
    return this._narrativeTension;
  }

  // ==================== 序列化 ====================

  toJSON(): BranchNarrativeState {
    return this.getState();
  }

  static fromJSON(state: BranchNarrativeState): BranchTracker {
    const tracker = new BranchTracker();
    tracker._history = state.history.map((e) => ({ ...e }));
    tracker._activeRouteId = state.activeRouteId;
    tracker._narrativeTension = state.narrativeTension;
    return tracker;
  }

  reset(): void {
    this._history = [];
    this._activeRouteId = null;
    this._narrativeTension = 0;
  }
}

export function createBranchTracker(): BranchTracker {
  return new BranchTracker();
}
