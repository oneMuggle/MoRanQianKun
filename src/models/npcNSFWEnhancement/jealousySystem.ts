/**
 * NPC 嫉妒系统 — 模型
 * 多NPC互动时的嫉妒情绪和行为表现
 */

import type { NPC关系 } from './socialNetwork';

// ==================== 嫉妒状态 ====================

export type 嫉妒表现类型 =
  | '冷淡回应'     // 降低互动热情
  | '主动质问'     // 直接询问玩家
  | '暗中报复'     // 暗中破坏玩家计划
  | '自我伤害'     // 极端人格的反应
  | '加速推进'     // 加快关系进展以竞争
  | '拉拢结盟';    // 试图拉拢玩家疏远的NPC

export interface 嫉妒状态 {
  嫉妒强度: number;       // 0-100
  嫉妒对象?: string;      // 引起嫉妒的NPC ID
  嫉妒原因: string;       // 触发嫉妒的事件
  表现形式: 嫉妒表现类型;
  持续时间: number;       // 持续回合数
  已持续回合: number;
  触发时间: string;
  最后更新时间: string;
}

// ==================== 嫉妒计算 ====================

export interface 嫉妒计算输入 {
  当前NPC: {
    id: string;
    姓名: string;
    好感度: number;
    人格标签?: string;
  };
  玩家互动对象: {
    id: string;
    姓名: string;
  };
  与互动对象的关系?: NPC关系;
  互动类型: '对话' | 'NSFW' | '礼物' | '邀约' | '亲密行为';
  互动强度: number;  // 0-100，互动的亲密程度
}

/**
 * 计算嫉妒强度
 */
export function 计算嫉妒强度(输入: 嫉妒计算输入): number {
  const 基础嫉妒 = 输入.当前NPC.好感度 * 0.5;
  const 关系强度 = 输入.与互动对象的关系?.关系强度 ?? 0;
  const 关系加成 = 关系强度 * 0.3;
  const 人格系数 = 获取嫉妒人格系数(输入.当前NPC.人格标签);
  const 互动系数 = 输入.互动强度 / 100;
  const 类型权重 = 获取互动类型权重(输入.互动类型);

  const 嫉妒值 = (基础嫉妒 + 关系加成) * 人格系数 * 互动系数 * 类型权重;

  return clamp(Math.round(嫉妒值), 0, 100);
}

/**
 * 根据人格标签获取嫉妒系数
 */
export function 获取嫉妒人格系数(人格标签?: string): number {
  if (!人格标签) return 1.0;

  if (人格标签.includes('傲娇') || 人格标签.includes('大小姐')) {
    return 1.5;
  }
  if (人格标签.includes('病娇') || 人格标签.includes('占有')) {
    return 2.0;
  }
  if (人格标签.includes('邻家') || 人格标签.includes('清纯')) {
    return 1.2;
  }

  if (人格标签.includes('高冷') || 人格标签.includes('飒爽')) {
    return 0.6;
  }
  if (人格标签.includes('慵懒') || 人格标签.includes('佛系')) {
    return 0.5;
  }

  return 1.0;
}

/**
 * 获取互动类型的嫉妒权重
 */
function 获取互动类型权重(类型: string): number {
  switch (类型) {
    case 'NSFW': return 2.0;
    case '亲密行为': return 1.5;
    case '邀约': return 1.0;
    case '礼物': return 0.8;
    case '对话': return 0.5;
    default: return 1.0;
  }
}

/**
 * 判断嫉妒表现形式
 */
export function 判断嫉妒表现(
  嫉妒强度: number,
  人格标签?: string
): 嫉妒表现类型 {
  if (嫉妒强度 >= 80) {
    if (人格标签?.includes('病娇') || 人格标签?.includes('极端')) {
      return '自我伤害';
    }
    return '暗中报复';
  }

  if (嫉妒强度 >= 60) {
    if (人格标签?.includes('傲娇') || 人格标签?.includes('大小姐')) {
      return '主动质问';
    }
    return '加速推进';
  }

  if (嫉妒强度 >= 40) {
    return '冷淡回应';
  }

  if (嫉妒强度 >= 20) {
    if (人格标签?.includes('心机') || 人格标签?.includes('聪明')) {
      return '拉拢结盟';
    }
    return '冷淡回应';
  }

  return '冷淡回应';
}

/**
 * 嫉妒衰减计算
 */
export function 计算嫉妒衰减(当前状态: 嫉妒状态): 嫉妒状态 {
  const 衰减速率 = 5;
  const 新强度 = Math.max(0, 当前状态.嫉妒强度 - 衰减速率);
  const 新回合 = 当前状态.已持续回合 + 1;

  return {
    ...当前状态,
    嫉妒强度: 新强度,
    已持续回合: 新回合,
    表现形式: 判断嫉妒表现(新强度),
    最后更新时间: new Date().toISOString(),
  };
}

/**
 * 创建嫉妒状态
 */
export function 创建嫉妒状态(输入: 嫉妒计算输入): 嫉妒状态 | null {
  const 强度 = 计算嫉妒强度(输入);

  if (强度 < 10) return null;

  return {
    嫉妒强度: 强度,
    嫉妒对象: 输入.玩家互动对象.id,
    嫉妒原因: `玩家与${输入.玩家互动对象.姓名}进行了${输入.互动类型}互动`,
    表现形式: 判断嫉妒表现(强度, 输入.当前NPC.人格标签),
    持续时间: Math.ceil(强度 / 10),
    已持续回合: 0,
    触发时间: new Date().toISOString(),
    最后更新时间: new Date().toISOString(),
  };
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
