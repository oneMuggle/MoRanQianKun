/**
 * 露出 NSFW 独立引擎 — 工厂函数
 */

import type { 露出状态, 紧张度状态 } from '../../../models/exposureNSFW';

export function 创建默认露出状态(): 露出状态 {
  return { 当前等级: 0, 等级进度: 0, 最后一次露出尝试: new Date().toISOString(), 成功露出次数: 0, 暴露失败次数: 0, 最大紧张度记录: 0 };
}

export function 创建默认紧张度状态(): 紧张度状态 {
  return { 当前值: 0, 周围人数: 0, 互动强度系数: 1.0, 周围人状态: '专注事务', NPC公开行为: '无' };
}
