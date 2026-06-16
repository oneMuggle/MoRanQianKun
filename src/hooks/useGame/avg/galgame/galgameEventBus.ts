/**
 * galgameEventBus.ts
 *
 * Galgame 专用事件分发层。
 * 在 GlobalEventBus 之上提供 Galgame 事件类型的便捷封装，
 * 并扩展缺失的 Galgame 事件类型。
 */

import { getEventBus } from '../../events/globalEventBus';
import { createGameEvent } from '../../events/eventTypes';
import type { GameEventType } from '../../events/eventTypes';
import type { EngineType, GameEvent } from '../../engine/types';

// ==================== Galgame 事件载荷类型 ====================

export interface RouteEnterPayload {
  routeId: string;
  npcId: string;
  routeName: string;
}

export interface RouteExitPayload {
  routeId: string;
  npcId: string;
}

export interface RouteLockPayload {
  routeId: string;
  routeName: string;
}

export interface CGUnlockPayload {
  cgIds: string[];
  routeId: string;
}

export interface FlagChangePayload {
  key: string;
  value: boolean;
  previousValue: boolean;
}

// ==================== 便捷事件工厂 ====================

const ENGINE_TYPE: EngineType = 'avgRelation';

/**
 * 创建路线进入事件
 */
export function createRouteEnterEvent(payload: RouteEnterPayload): GameEvent {
  return createGameEvent({
    engineType: ENGINE_TYPE,
    type: 'ROUTE_CHANGE' as GameEventType,
    description: `进入路线: ${payload.routeName}`,
    payload: { galgameType: 'ROUTE_ENTER', ...payload },
  });
}

/**
 * 创建路线退出事件
 */
export function createRouteExitEvent(payload: RouteExitPayload): GameEvent {
  return createGameEvent({
    engineType: ENGINE_TYPE,
    type: 'ROUTE_CHANGE' as GameEventType,
    description: `退出路线: ${payload.routeId}`,
    payload: { galgameType: 'ROUTE_EXIT', ...payload },
  });
}

/**
 * 创建路线锁定事件
 */
export function createRouteLockEvent(payload: RouteLockPayload): GameEvent {
  return createGameEvent({
    engineType: ENGINE_TYPE,
    type: 'ROUTE_CHANGE' as GameEventType,
    description: `路线锁定: ${payload.routeName}`,
    payload: { galgameType: 'ROUTE_LOCK', ...payload },
  });
}

/**
 * 创建 CG 解锁事件
 */
export function createCGUnlockEvent(payload: CGUnlockPayload): GameEvent {
  return createGameEvent({
    engineType: ENGINE_TYPE,
    type: 'ENDING_TRIGGER' as GameEventType,
    description: `CG 解锁: ${payload.cgIds.join(', ')}`,
    payload: { galgameType: 'CG_UNLOCK', ...payload },
  });
}

/**
 * 创建 Flag 变更事件
 */
export function createFlagChangeEvent(payload: FlagChangePayload): GameEvent {
  return createGameEvent({
    engineType: ENGINE_TYPE,
    type: 'RELATION_CHANGE' as GameEventType,
    description: `Flag 变更: ${payload.key} = ${payload.value}`,
    payload: { galgameType: 'FLAG_CHANGE', ...payload },
  });
}

// ==================== GalgameEventBus 类 ====================

/**
 * Galgame 事件总线。
 * 封装 GlobalEventBus，提供 Galgame 专属事件的发布方法。
 */
export class GalgameEventBus {
  private _bus = getEventBus();

  /** 发布路线进入事件 */
  publishRouteEnter(payload: RouteEnterPayload): void {
    this._bus.publish(createRouteEnterEvent(payload));
  }

  /** 发布路线退出事件 */
  publishRouteExit(payload: RouteExitPayload): void {
    this._bus.publish(createRouteExitEvent(payload));
  }

  /** 发布路线锁定事件 */
  publishRouteLock(payload: RouteLockPayload): void {
    this._bus.publish(createRouteLockEvent(payload));
  }

  /** 发布 CG 解锁事件 */
  publishCGUnlock(payload: CGUnlockPayload): void {
    this._bus.publish(createCGUnlockEvent(payload));
  }

  /** 发布 Flag 变更事件 */
  publishFlagChange(payload: FlagChangePayload): void {
    this._bus.publish(createFlagChangeEvent(payload));
  }

  /** 获取 Galgame 相关事件历史 */
  getHistory(): GameEvent[] {
    return this._bus.getHistoryByEngine('avgRelation');
  }

  /** 获取最近的路线变更事件 */
  getRecentRouteChanges(limit = 10): GameEvent[] {
    return this._bus
      .getHistoryByType('ROUTE_CHANGE' as GameEventType)
      .slice(-limit);
  }

  /** 获取最近的 CG 解锁事件 */
  getRecentCGUnlocks(limit = 10): GameEvent[] {
    return this._bus
      .getHistoryByType('ENDING_TRIGGER' as GameEventType)
      .filter((e: GameEvent) => (e.payload as any)?.galgameType === 'CG_UNLOCK')
      .slice(-limit);
  }
}

/** 单例实例 */
let _instance: GalgameEventBus | null = null;

export function getGalgameEventBus(): GalgameEventBus {
  if (!_instance) {
    _instance = new GalgameEventBus();
  }
  return _instance;
}

/** 重置实例（测试用） */
export function resetGalgameEventBus(): void {
  _instance = null;
}
