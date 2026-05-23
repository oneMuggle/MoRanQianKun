/**
 * NPC 主动行为引擎
 * NPC根据情绪、好感度、性癖等主动发起互动
 */

import type { 情绪状态 } from '../../../models/npcNSFWEnhancement/emotionSystem';
import type { 社交网络状态 } from '../../../models/npcNSFWEnhancement/socialNetwork';
import type { 嫉妒状态 } from '../../../models/npcNSFWEnhancement/jealousySystem';
import type { 情感羁绊树 } from '../../../models/npcNSFWEnhancement/bondTree';
import type { NSFW记忆库 } from '../../../models/npcNSFWEnhancement/nsfwMemory';

// ==================== 主动行为类型 ====================

export type 主动行为类型 =
  | '主动邀约'
  | '拒绝反抗'
  | '试探行为'
  | '情绪表达'
  | '社交互动'
  | '嫉妒表现'
  | 'NSFW暗示'
  | '关心问候'
  | '记忆触发'
  | '日常互动';

export interface 主动行为 {
  类型: 主动行为类型;
  优先级: number;  // 0-100
  描述: string;
  触发原因: string;
  目标?: string;
  数据?: Record<string, any>;
}

// ==================== NPC上下文 ====================

export interface NPC主动行为上下文 {
  npcId: string;
  姓名: string;
  好感度: number;
  亲密度等级: number;
  心情值: number;
  心理防线: number;
  人格标签?: string;
  当前情绪?: 情绪状态;
  社交网络?: 社交网络状态;
  嫉妒状态?: 嫉妒状态;
  羁绊树?: 情感羁绊树;
  记忆库?: NSFW记忆库;
  性癖档案?: any;
  在场NPC列表?: string[];
  当前时间?: string;
  当前地点?: string;
}

// ==================== 行为判定 ====================

function 判定主动邀约(上下文: NPC主动行为上下文): 主动行为 | null {
  if (上下文.好感度 < 40 || 上下文.心情值 < 50) return null;

  const 概率 = (上下文.好感度 / 100) * (上下文.心情值 / 100) * 0.4;

  if (Math.random() < 概率) {
    return {
      类型: '主动邀约',
      优先级: Math.round(上下文.好感度 * 0.6 + 上下文.心情值 * 0.4),
      描述: `${上下文.姓名}主动邀请你${上下文.亲密度等级 >= 3 ? '独处' : '一起活动'}`,
      触发原因: '好感度和心情达到阈值',
    };
  }

  return null;
}

function 判定试探行为(上下文: NPC主动行为上下文): 主动行为 | null {
  if (上下文.好感度 < 30 || 上下文.好感度 > 60) return null;

  const 概率 = 0.2 + (上下文.好感度 - 30) / 300;

  if (Math.random() < 概率) {
    return {
      类型: '试探行为',
      优先级: Math.round(上下文.好感度 * 0.5),
      描述: `${上下文.姓名}试探性地${上下文.亲密度等级 >= 2 ? '靠近你' : '询问你的想法'}`,
      触发原因: '好感度处于上升期，试探玩家态度',
    };
  }

  return null;
}

function 判定情绪表达(上下文: NPC主动行为上下文): 主动行为 | null {
  if (!上下文.当前情绪) return null;

  const { 心情阶段 } = 上下文.当前情绪;

  if (心情阶段 === '开心' && Math.random() < 0.15) {
    return {
      类型: '情绪表达',
      优先级: 30,
      描述: `${上下文.姓名}心情愉悦，主动与你分享快乐`,
      触发原因: '心情处于开心状态',
    };
  }

  if ((心情阶段 === '低落' || 心情阶段 === '愤怒') && Math.random() < 0.25) {
    return {
      类型: '情绪表达',
      优先级: 50,
      描述: `${上下文.姓名}情绪${心情阶段}，表现出${心情阶段 === '愤怒' ? '不满' : '消沉'}`,
      触发原因: `心情处于${心情阶段}状态`,
    };
  }

  return null;
}

function 判定嫉妒表现(上下文: NPC主动行为上下文): 主动行为 | null {
  if (!上下文.嫉妒状态 || 上下文.嫉妒状态.嫉妒强度 < 20) return null;

  const { 嫉妒强度, 表现形式 } = 上下文.嫉妒状态;

  return {
    类型: '嫉妒表现',
    优先级: Math.round(嫉妒强度 * 0.8),
    描述: `${上下文.姓名}因嫉妒表现出「${表现形式}」的态度`,
    触发原因: `嫉妒强度${嫉妒强度}，表现为${表现形式}`,
    数据: { 嫉妒对象: 上下文.嫉妒状态.嫉妒对象, 表现形式 },
  };
}

function 判定NSFW暗示(上下文: NPC主动行为上下文): 主动行为 | null {
  if (上下文.亲密度等级 < 3 || 上下文.好感度 < 60) return null;
  if (上下文.心理防线 > 70) return null;

  const 概率 = 0.05 + (上下文.亲密度等级 - 3) * 0.05 + (上下文.好感度 - 60) / 400;

  if (Math.random() < 概率) {
    return {
      类型: 'NSFW暗示',
      优先级: Math.round(上下文.亲密度等级 * 15 + 上下文.好感度 * 0.2),
      描述: `${上下文.姓名}暗示性地${上下文.心理防线 < 50 ? '挑逗你' : '向你靠近'}`,
      触发原因: '亲密度和好感度足够，心理防线可接受',
    };
  }

  return null;
}

function 判定关心问候(上下文: NPC主动行为上下文): 主动行为 | null {
  const 羁绊值 = 上下文.羁绊树?.羁绊值 ?? 0;
  if (羁绊值 < 30) return null;

  const 概率 = 0.1 + 羁绊值 / 500;

  if (Math.random() < 概率) {
    return {
      类型: '关心问候',
      优先级: Math.round(羁绊值 * 0.5),
      描述: `${上下文.姓名}关心地询问你的近况`,
      触发原因: `羁绊值${羁绊值}，NPC主动关心玩家`,
    };
  }

  return null;
}

function 判定记忆触发(上下文: NPC主动行为上下文): 主动行为 | null {
  if (!上下文.记忆库 || 上下文.记忆库.记忆列表.length === 0) return null;

  const 强记忆 = 上下文.记忆库.记忆列表
    .filter(m => m.当前强度 > 50 && m.关联NPC.includes(上下文.npcId))
    .sort((a, b) => b.当前强度 - a.当前强度);

  if (强记忆.length === 0) return null;

  const 最强记忆 = 强记忆[0];
  const 概率 = 最强记忆.当前强度 / 500;

  if (Math.random() < 概率) {
    return {
      类型: '记忆触发',
      优先级: Math.round(最强记忆.当前强度 * 0.6),
      描述: `${上下文.姓名}回忆起了「${最强记忆.标题}」`,
      触发原因: `记忆强度${Math.round(最强记忆.当前强度)}%`,
      数据: { 记忆: 最强记忆 },
    };
  }

  return null;
}

// ==================== 主函数 ====================

/**
 * 计算NPC的主动行为
 */
export function 计算NPC主动行为(上下文: NPC主动行为上下文): 主动行为 | null {
  const 行为列表: 主动行为[] = [];

  const 判定函数 = [
    判定主动邀约,
    判定试探行为,
    判定情绪表达,
    判定嫉妒表现,
    判定NSFW暗示,
    判定关心问候,
    判定记忆触发,
  ];

  for (const 判定 of 判定函数) {
    const 行为 = 判定(上下文);
    if (行为) {
      行为列表.push(行为);
    }
  }

  if (行为列表.length === 0) return null;

  return 行为列表.sort((a, b) => b.优先级 - a.优先级)[0];
}

/**
 * 批量计算所有NPC的主动行为
 */
export function 批量计算NPC主动行为(
  NPC列表: NPC主动行为上下文[]
): { npcId: string; 行为: 主动行为 }[] {
  const 结果: { npcId: string; 行为: 主动行为 }[] = [];

  for (const npc of NPC列表) {
    const 行为 = 计算NPC主动行为(npc);
    if (行为) {
      结果.push({ npcId: npc.npcId, 行为 });
    }
  }

  return 结果.sort((a, b) => b.行为.优先级 - a.行为.优先级);
}
