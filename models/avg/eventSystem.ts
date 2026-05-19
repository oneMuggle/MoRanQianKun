/**
 * AVG 事件系统 — 数据模型
 *
 * 定义可触发事件、触发条件、事件执行结果。
 */

import type { IntimacyLevel } from './relationGraph';

/** 触发条件类型 */
export type EventTriggerType =
  | 'intimacy_threshold'  // 好感度达到阈值
  | 'time_location'       // 特定时间+地点
  | 'relation_change'     // 关系网络变化
  | 'flag_set'            // 全局 flag 被设置
  | 'turn_count'          // 回合数达到
  | 'event_chain';        // 事件链（前置事件完成后触发）

/** 触发条件 */
export interface EventTrigger {
  type: EventTriggerType;
  /** 好感度阈值（intimacy_threshold） */
  intimacyLevel?: IntimacyLevel;
  /** 时间段（time_location） */
  timePeriod?: TimePeriod;
  /** 地点（time_location） */
  location?: string;
  /** 关系类型变化（relation_change） */
  relationType?: string;
  /** Flag 键名（flag_set） */
  flagKey?: string;
  /** 回合数阈值（turn_count） */
  turnThreshold?: number;
  /** 前置事件 ID（event_chain） */
  prerequisiteEventId?: string;
}

/** 时间段 */
export type TimePeriod = '清晨' | '上午' | '下午' | '黄昏' | '夜晚' | '深夜';

/** 事件类型 */
export type SceneEventType =
  | 'dialogue'      // 对话事件
  | 'activity'      // 活动事件
  | 'conflict'      // 冲突事件
  | 'romance'       // 浪漫事件
  | 'discovery'     // 发现事件
  | 'transition';   // 过渡事件

/** 场景事件定义 */
export interface SceneEvent {
  id: string;
  /** 关联 NPC ID */
  npcId: string;
  /** 关联路线 ID */
  routeId?: string;
  /** 事件名称 */
  name: string;
  /** 事件描述 */
  description: string;
  /** 事件类型 */
  eventType: SceneEventType;
  /** 触发条件 */
  trigger: EventTrigger;
  /** 是否已触发 */
  triggered: boolean;
  /** 触发次数（0 = 无限次） */
  maxTriggers: number;
  /** 当前触发次数 */
  triggerCount: number;
  /** 事件对话文本 */
  dialogueText?: string;
  /** 好感度变化 */
  intimacyDelta: number;
  /** 后续事件 ID（事件链） */
  chainEventIds: string[];
  /** 是否是关键事件（影响结局） */
  isCritical: boolean;
}

/** 事件执行结果 */
export interface EventExecutionResult {
  eventId: string;
  success: boolean;
  narrativeText: string;
  intimacyDelta: number;
  sideEffects: string[];
  chainEventsTriggered: string[];
}

/** 事件调度器状态 */
export interface EventSchedulerState {
  pendingEvents: string[];
  triggeredEvents: string[];
  expiredEvents: string[];
  currentTurn: number;
}

/** 事件过滤器结果 */
export interface EventFilterResult {
  triggerable: SceneEvent[];
  blocked: { event: SceneEvent; reason: string }[];
}
