/**
 * 桌游社交 NSFW 引擎 — 时代适配层
 */

import type { 桌游时代场景 } from '../../../models/boardGameNSFW';
import { 获取桌游时代场景, 通用桌游场景 } from '../../../models/boardGameNSFW';

export function 获取桌游场景For时代(时代: string): 桌游时代场景[] {
  const 特定场景 = 获取桌游时代场景(时代);
  if (特定场景.length > 0) return 特定场景;
  return 通用桌游场景;
}

export function 获取桌游NSFW强度修正(时代: string, 场景类型: string): number {
  const 场景列表 = 获取桌游场景For时代(时代);
  const 匹配场景 = 场景列表.find(s => s.场景类型 === 场景类型);
  return 匹配场景 ? 匹配场景.NSFW强度修正 : 0;
}
