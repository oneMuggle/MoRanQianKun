/**
 * 露出 NSFW 独立引擎 — 记忆系统
 * 记录每次露出事件，生成记忆片段和统计摘要
 */

import type { 露出记忆, 露出记忆分类, 露出记忆统计 } from '../../../models/exposureNSFW/memories';

/** 创建新的露出记忆 */
export function 创建露出记忆(参数: {
  分类: 露出记忆分类;
  摘要: string;
  场景描述: string;
  参与者: string[];
  旁观者数量: number;
  最终紧张度: number;
  最终露出等级: number;
  是否留下证据: boolean;
  公开名誉变化: number;
  私密名誉变化: number;
  关联NPCId?: string;
}): 露出记忆 {
  // 回忆强度根据紧张度和事件严重性计算
  let 回忆强度 = 1;
  if (参数.最终紧张度 >= 80) 回忆强度 = 5;
  else if (参数.最终紧张度 >= 60) 回忆强度 = 4;
  else if (参数.最终紧张度 >= 40) 回忆强度 = 3;
  else if (参数.最终紧张度 >= 20) 回忆强度 = 2;

  // 如果是失败或名誉事件，强度额外+1
  if (参数.分类 === '失败' || 参数.分类 === '名誉事件') {
    回忆强度 = Math.min(5, 回忆强度 + 1);
  }

  return {
    id: `memory_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    分类: 参数.分类,
    摘要: 参数.摘要,
    场景描述: 参数.场景描述,
    参与者: 参数.参与者,
    旁观者数量: 参数.旁观者数量,
    最终紧张度: 参数.最终紧张度,
    最终露出等级: 参数.最终露出等级,
    是否留下证据: 参数.是否留下证据,
    名誉影响: {
      公开变化: 参数.公开名誉变化,
      私密变化: 参数.私密名誉变化,
    },
    时间: new Date().toISOString(),
    回忆强度,
    关联NPCId: 参数.关联NPCId,
  };
}

/** 计算记忆统计 */
export function 计算记忆统计(记忆列表: 露出记忆[]): 露出记忆统计 {
  if (记忆列表.length === 0) {
    return {
      总次数: 0,
      成功次数: 0,
      失败次数: 0,
      最高紧张度: 0,
      最高露出等级: 0,
      最难忘记忆: null,
      首次露出时间: null,
    };
  }

  const 成功次数 = 记忆列表.filter(m => m.分类 === '成功').length;
  const 失败次数 = 记忆列表.filter(m => m.分类 === '失败').length;
  const 最高紧张度 = Math.max(...记忆列表.map(m => m.最终紧张度));
  const 最高露出等级 = Math.max(...记忆列表.map(m => m.最终露出等级));
  const 最难忘 = 记忆列表.reduce((best, cur) => cur.回忆强度 > (best?.回忆强度 ?? 0) ? cur : best, 记忆列表[0]);

  const 排序记忆 = [...记忆列表].sort((a, b) => a.时间.localeCompare(b.时间));
  const 首次时间 = 排序记忆[0]?.时间 ?? null;

  return {
    总次数: 记忆列表.length,
    成功次数,
    失败次数,
    最高紧张度,
    最高露出等级,
    最难忘记忆: 最难忘,
    首次露出时间: 首次时间,
  };
}

/** 根据回忆强度过滤记忆 */
export function 按回忆强度过滤(记忆列表: 露出记忆[], 最低强度: number = 3): 露出记忆[] {
  return 记忆列表.filter(m => m.回忆强度 >= 最低强度);
}

/** 获取特定 NPC 的记忆 */
export function 获取NPC记忆(记忆列表: 露出记忆[], npcId: string): 露出记忆[] {
  return 记忆列表.filter(m => m.关联NPCId === npcId);
}

/** 记忆衰减：回忆强度随时间自然降低 */
export function 应用记忆衰减(记忆: 露出记忆, 经过天数: number): 露出记忆 {
  const 衰减量 = Math.floor(经过天数 / 7);
  const 新强度 = Math.max(1, 记忆.回忆强度 - 衰减量);
  return { ...记忆, 回忆强度: 新强度 };
}

/** 批量衰减所有记忆 */
export function 衰减所有记忆(记忆列表: 露出记忆[], 经过天数: number): 露出记忆[] {
  return 记忆列表.map(m => 应用记忆衰减(m, 经过天数));
}

/** 清理遗忘的记忆（强度降为 1 且超过 30 天） */
export function 清理遗忘记忆(记忆列表: 露出记忆[]): 露出记忆[] {
  const 现在 = Date.now();
  return 记忆列表.filter(m => {
    if (m.回忆强度 > 1) return true;
    const 距今天数 = (现在 - new Date(m.时间).getTime()) / (1000 * 60 * 60 * 24);
    return 距今天数 < 30;
  });
}
