/**
 * AVG 分支叙事 — 后果解析器
 *
 * 根据分支选择的后果定义，计算对各属性/NPC好感度/标记的影响。
 * 支持延迟后果（delayTurns > 0）和立即后果（delayTurns === 0）。
 */

import type {
  Consequence,
  ConsequenceType,
  ConsequenceResolution,
} from '../../../../models/avg/branchNarrative';

export class ConsequenceResolver {
  private _pendingConsequences: Map<string, { consequence: Consequence; applyTurn: number }[]>;

  constructor() {
    this._pendingConsequences = new Map();
  }

  // ==================== 后果解析 ====================

  /**
   * 解析一组后果，区分立即应用和延迟应用的。
   * @param consequences 后果列表
   * @param currentTurn 当前回合数
   * @param baseConsequenceKey 用于追踪的基础 key（通常是 branchPointId_choiceId）
   */
  resolve(
    consequences: Consequence[],
    currentTurn: number,
    baseConsequenceKey: string,
  ): ConsequenceResolution {
    const applied: Consequence[] = [];
    const pending: Consequence[] = [];
    let tensionDelta = 0;

    for (const consequence of consequences) {
      if (consequence.delayTurns === 0) {
        applied.push(consequence);
        tensionDelta += this._computeTension(consequence);
      } else {
        const applyTurn = currentTurn + consequence.delayTurns;
        this._enqueuePending(baseConsequenceKey, { consequence, applyTurn });
        pending.push(consequence);
        tensionDelta += this._computeTension(consequence) * 0.5; // 延迟后果张力减半
      }
    }

    return { applied, pending, tensionDelta };
  }

  // ==================== 延迟后果管理 ====================

  /**
   * 检查是否有到期需要应用的延迟后果。
   */
  getDueConsequences(currentTurn: number): { key: string; consequences: Consequence[] }[] {
    const due: { key: string; consequences: Consequence[] }[] = [];

    for (const [key, items] of this._pendingConsequences.entries()) {
      const dueItems = items.filter((item) => item.applyTurn <= currentTurn);
      if (dueItems.length > 0) {
        due.push({ key, consequences: dueItems.map((item) => item.consequence) });
      }
    }

    return due;
  }

  /**
   * 移除已应用的延迟后果。
   */
  markApplied(key: string, appliedConsequences: Consequence[]): void {
    const items = this._pendingConsequences.get(key);
    if (!items) return;

    const appliedIds = new Set(appliedConsequences.map((c) => this._consequenceId(c)));
    this._pendingConsequences.set(
      key,
      items.filter((item) => !appliedIds.has(this._consequenceId(item.consequence))),
    );
  }

  /**
   * 清除所有延迟后果。
   */
  clearPending(): void {
    this._pendingConsequences.clear();
  }

  getPendingCount(): number {
    let count = 0;
    for (const items of this._pendingConsequences.values()) {
      count += items.length;
    }
    return count;
  }

  // ==================== 内部方法 ====================

  private _enqueuePending(
    key: string,
    entry: { consequence: Consequence; applyTurn: number },
  ): void {
    const items = this._pendingConsequences.get(key) ?? [];
    items.push(entry);
    this._pendingConsequences.set(key, items);
  }

  private _computeTension(consequence: Consequence): number {
    // 根据后果类型计算叙事张力变化
    switch (consequence.type) {
      case 'flag_set':
        return 10; // 标记设置通常意味着重要剧情分支
      case 'route_change':
        return 20; // 路线变更是关键抉择
      case 'ending_modifier':
        return 15; // 结局影响是长线后果
      case 'intimacy_change':
        return 5; // 好感度变化是常规后果
      case 'stat_change':
        return 3; // 属性变化影响较小
      case 'item_change':
        return 2; // 物品变化影响较小
      case 'task_change':
        return 8; // 任务变化有一定影响
      default:
        return 5;
    }
  }

  private _consequenceId(consequence: Consequence): string {
    return `${consequence.type}:${consequence.field}:${consequence.value}`;
  }

  // ==================== 序列化 ====================

  toJSON(): Record<string, { consequence: Consequence; applyTurn: number }[]> {
    const obj: Record<string, { consequence: Consequence; applyTurn: number }[]> = {};
    for (const [key, items] of this._pendingConsequences.entries()) {
      obj[key] = items.map((item) => ({ ...item }));
    }
    return obj;
  }

  static fromJSON(
    state: Record<string, { consequence: Consequence; applyTurn: number }[]>,
  ): ConsequenceResolver {
    const resolver = new ConsequenceResolver();
    for (const [key, items] of Object.entries(state)) {
      resolver._pendingConsequences.set(key, items.map((item) => ({ ...item })));
    }
    return resolver;
  }
}

/**
 * 根据后果类型执行具体的状态变更。
 * 返回变更描述，供日志或UI反馈使用。
 */
export function applyConsequence(
  consequence: Consequence,
  applyFn: (type: ConsequenceType, field: string, value: number | string | boolean) => void,
): string {
  applyFn(consequence.type, consequence.field, consequence.value);

  const typeLabels: Record<ConsequenceType, string> = {
    stat_change: `属性变更: ${consequence.field} = ${consequence.value}`,
    intimacy_change: `好感度变更: ${consequence.field} ${typeof consequence.value === 'number' && consequence.value > 0 ? '+' : ''}${consequence.value}`,
    flag_set: `标记设置: ${consequence.field} = ${consequence.value}`,
    item_change: `物品变更: ${consequence.field} = ${consequence.value}`,
    task_change: `任务变更: ${consequence.field} = ${consequence.value}`,
    route_change: `路线变更: → ${consequence.value}`,
    ending_modifier: `结局影响: ${consequence.field} → ${consequence.value}`,
  };

  return typeLabels[consequence.type] ?? `未知后果: ${consequence.type}`;
}

export function createConsequenceResolver(): ConsequenceResolver {
  return new ConsequenceResolver();
}
