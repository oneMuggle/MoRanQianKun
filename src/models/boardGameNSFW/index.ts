/**
 * 桌游社交 NSFW 系统数据模型 — 统一入口
 *
 * 从 campusNSFW 提取，支持全时代
 */

export type {
  桌游类型,
  密室主题,
  密室逃脱状态,
  狼人杀状态,
  剧本杀状态,
  派对游戏状态,
  大富翁状态,
  棋牌游戏状态,
  骰子游戏状态,
  大富翁地产,
  棋牌游戏子类型,
  骰子面类型,
  桌游状态,
  NSFW编排模式,
  多人局事件类型,
  多人局配置,
  多人局参与者,
  多人局事件,
  多人局状态,
} from './core';

export type { 桌游时代场景类型, 桌游时代场景 } from './scenarios';

export { 获取桌游时代场景, 通用桌游场景, 桌游时代场景库 } from './scenarios';

// === 系统设置 ===
// 2026-06-03：避免与 normalization.ts 循环依赖，桌游社交NSFW设置 与 默认桌游社交NSFW设置 移入 normalization.ts
// 这里仅 re-export 以保持向后兼容
export type { 桌游社交NSFW设置 } from './normalization';
export { 默认桌游社交NSFW设置 } from './normalization';

export { 规范化桌游社交NSFW设置 } from './normalization';
