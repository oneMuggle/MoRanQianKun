/**
 * 桌游社交 NSFW 引擎 — 统一入口
 */

export {
  判定桌游触发,
  选择桌游类型,
  计算桌游紧张度,
  计算羁绊加成,
  判定桌游NSFW升级,
} from './core';

export {
  获取桌游场景For时代,
  获取桌游NSFW强度修正,
} from './eraAdapter';

export {
  生成桌游NSFW事件,
} from './eventSystem';

export type { 桌游NSFW事件 } from './eventSystem';
