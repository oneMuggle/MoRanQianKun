/**
 * taskStateMachine.ts
 *
 * 任务状态机 — 管理任务生命周期流转
 *
 * 状态流转:
 *   可接取 → 进行中 → 可提交 → 已完成
 *                ↓
 *             已失败 (超时/条件不满足)
 */

import type { 任务结构, 任务状态 } from '../../../../models/task';

export interface TaskTransition {
  from: 任务状态;
  to: 任务状态;
  action: string;
}

const VALID_TRANSITIONS: TaskTransition[] = [
  { from: '进行中', to: '可提交', action: 'objectives_complete' },
  { from: '进行中', to: '已失败', action: 'fail' },
  { from: '可提交', to: '已完成', action: 'submit' },
  { from: '进行中', to: '进行中', action: 'progress_update' },
];

export interface StateCheckResult {
  canTransition: boolean;
  nextState: 任务状态;
  reason?: string;
}

export function checkTaskTransition(
  task: 任务结构,
  action: string,
): StateCheckResult {
  if (task.当前状态 === '已完成') {
    return { canTransition: false, nextState: task.当前状态, reason: '任务已完成' };
  }
  if (task.当前状态 === '已失败') {
    return { canTransition: false, nextState: task.当前状态, reason: '任务已失败' };
  }

  if (task.截止时间 && isExpired(task.截止时间) && task.当前状态 === '进行中') {
    return { canTransition: true, nextState: '已失败', reason: '任务已超时' };
  }

  const match = VALID_TRANSITIONS.find(
    (t) => t.from === task.当前状态 && t.action === action,
  );

  if (!match) {
    return {
      canTransition: false,
      nextState: task.当前状态,
      reason: `不允许从 ${task.当前状态} 执行 ${action}`,
    };
  }

  return { canTransition: true, nextState: match.to };
}

export function areAllObjectivesComplete(task: 任务结构): boolean {
  if (task.目标列表.length === 0) return false;
  return task.目标列表.every((obj) => obj.完成状态);
}

export function canAcceptTask(
  task: 任务结构,
  playerRealm: string,
  currentTasks: 任务结构[],
): { canAccept: boolean; reason?: string } {
  const existing = currentTasks.find((t) => t.标题 === task.标题);
  if (existing && (existing.当前状态 === '进行中' || existing.当前状态 === '已完成')) {
    return { canAccept: false, reason: '任务已在进行中或已完成' };
  }

  if (task.推荐境界) {
    const realmOrder = ['初学', '入门', '小成', '大成', '圆满', '宗师', '大宗师'];
    const playerIndex = realmOrder.indexOf(playerRealm);
    const requiredIndex = realmOrder.indexOf(task.推荐境界);
    if (requiredIndex >= 0 && playerIndex < requiredIndex) {
      return { canAccept: false, reason: `推荐境界${task.推荐境界}` };
    }
  }

  return { canAccept: true };
}

function isExpired(deadline: string): boolean {
  const parts = deadline.split(':').map(Number);
  if (parts.length < 5) return false;
  const [year, month, day, hour, minute] = parts;
  const deadlineDate = new Date(year, month - 1, day, hour, minute);
  return Date.now() > deadlineDate.getTime();
}
