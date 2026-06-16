/**
 * 露出 NSFW 独立引擎 — 场景管理器
 * 根据时代、露出等级、NPC 个性选择合适场景
 */

import type { 露出状态, 露出偏好等级, 露出场景模板 } from '../../../models/exposureNSFW';
import { 获取时代场景, 获取场景ById } from '../../../models/exposureNSFW/scenarios';

/**
 * 根据露出等级和时代选择推荐场景
 */
export function 推荐场景(
  时代Id: string,
  露出等级: 露出偏好等级
): 露出场景模板[] {
  const 场景列表 = 获取时代场景(时代Id);
  if (场景列表.length === 0) return [];

  return 场景列表
    .filter(s => s.所需最低露出等级 !== undefined ? s.所需最低露出等级 <= 露出等级 : true)
    .sort((a, b) => {
      const aDiff = Math.abs(a.紧张度基础值 - 露出等级 * 15);
      const bDiff = Math.abs(b.紧张度基础值 - 露出等级 * 15);
      return aDiff - bDiff;
    });
}

/**
 * 验证场景在当前露出等级下是否可行
 */
export function 验证场景可行性(
  场景: 露出场景模板,
  露出等级: 露出偏好等级
): boolean {
  return 场景.所需最低露出等级 <= 露出等级;
}

/**
 * 根据当前游戏状态选择最合适的场景
 */
export function 选择当前场景(
  档案: 露出状态,
  时代Id: string,
  偏好场所?: '半私密' | '半公开' | '公开'
): 露出场景模板 | null {
  if (档案.当前场景Id) {
    const 缓存场景 = 获取场景ById(档案.当前场景Id);
    if (缓存场景 && 验证场景可行性(缓存场景, 档案.当前等级)) {
      return 缓存场景;
    }
  }

  const 候选 = 推荐场景(时代Id, 档案.当前等级);
  if (候选.length === 0) return null;

  if (偏好场所) {
    const 匹配 = 候选.find(s => s.场所类型 === 偏好场所);
    if (匹配) return 匹配;
  }

  return 候选[0];
}

/**
 * 根据场所类型过滤当前时代的可用场景
 */
export function 按场所获取场景(
  时代Id: string,
  露出等级: 露出偏好等级,
  场所类型: '半私密' | '半公开' | '公开'
): 露出场景模板[] {
  return 推荐场景(时代Id, 露出等级).filter(s => s.场所类型 === 场所类型);
}

/**
 * 计算场景对紧张度的贡献
 */
export function 计算场景紧张度贡献(场景: 露出场景模板, 当前周围人数: number): number {
  const 人数 = Math.min(当前周围人数, 场景.周围人数范围[1]);
  const 人数比例 = 场景.周围人数范围[1] > 0
    ? (人数 - 场景.周围人数范围[0]) / (场景.周围人数范围[1] - 场景.周围人数范围[0])
    : 0;

  return Math.round(
    场景.紧张度基础值 * (1 + 人数比例 * 0.5) * (场景.隐秘度 / 3)
  );
}

/**
 * 计算场景对发现概率的贡献
 */
export function 计算场景发现概率(场景: 露出场景模板, 当前周围人数: number): number {
  const 人数 = Math.min(当前周围人数, 场景.周围人数范围[1]);
  const 人数比例 = 场景.周围人数范围[1] > 0
    ? (人数 - 场景.周围人数范围[0]) / (场景.周围人数范围[1] - 场景.周围人数范围[0])
    : 0;

  return Math.round(
    场景.基础发现概率 * (1 + 人数比例 * 0.8)
  );
}
