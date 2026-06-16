/**
 * NPC 主动行为引擎
 * NPC根据情绪、好感度、性癖、内在动机等主动发起互动
 */

import type { 情绪状态 } from '../../../models/npcNSFWEnhancement/emotionSystem';
import type { 社交网络状态 } from '../../../models/npcNSFWEnhancement/socialNetwork';
import type { 嫉妒状态 } from '../../../models/npcNSFWEnhancement/jealousySystem';
import type { 情感羁绊树 } from '../../../models/npcNSFWEnhancement/bondTree';
import type { NSFW记忆库 } from '../../../models/npcNSFWEnhancement/nsfwMemory';
import { 选择日常行为, 记录日常行为, 获取今日行为Ids, 创建初始日常状态 } from '../../../models/npcNSFWEnhancement/dailyPattern';
import type { 日常行为模板, 日常行为状态 } from '../../../models/npcNSFWEnhancement/dailyPattern';

// ==================== 内在动机系统 ====================

export type 欲望维度 =
  | '被认可'
  | '刺激感'
  | '安全感'
  | '归属感'
  | '支配感'
  | '自由感';

export interface 欲望状态 {
  维度: 欲望维度;
  当前满足度: number;    // 0-100
  衰减速率: number;      // 每回合衰减量
  优先级系数: number;    // 人格决定的权重
  最近满足时间?: string;
}

export interface NPC内在动机 {
  欲望状态: Record<欲望维度, 欲望状态>;
  当前主导欲望: 欲望维度;
  短期目标: 短期目标条目[];
  最后更新时间: string;
}

export interface 短期目标条目 {
  目标描述: string;
  驱动欲望: 欲望维度;
  优先级: number;
  时间窗口: string;
  行为倾向: 主动行为类型[];
}

function 获取人格欲望系数(人格标签?: string): Partial<Record<欲望维度, number>> {
  if (!人格标签) return {};
  const 系数: Partial<Record<欲望维度, number>> = {};
  if (人格标签.includes('傲娇') || 人格标签.includes('大小姐')) {
    系数.被认可 = 1.3; 系数.支配感 = 1.2;
  }
  if (人格标签.includes('温柔') || 人格标签.includes('贤妻')) {
    系数.归属感 = 1.3; 系数.安全感 = 1.2;
  }
  if (人格标签.includes('高冷') || 人格标签.includes('清冷')) {
    系数.自由感 = 1.3; 系数.被认可 = 0.8;
  }
  if (人格标签.includes('元气') || 人格标签.includes('活泼')) {
    系数.刺激感 = 1.3; 系数.归属感 = 1.2;
  }
  if (人格标签.includes('社恐')) {
    系数.安全感 = 1.3; 系数.刺激感 = 0.7;
  }
  return 系数;
}

/**
 * 初始化内在动机
 */
export function 初始化内在动机(npc: { 人格类型?: string; 好感度?: number }): NPC内在动机 {
  const 人格系数 = 获取人格欲望系数(npc.人格类型);
  const 基础满足度 = npc.好感度 ? npc.好感度 * 0.5 : 30;
  const 欲望列表: 欲望维度[] = ['被认可', '刺激感', '安全感', '归属感', '支配感', '自由感'];
  const 欲望状态 = {} as Record<欲望维度, 欲望状态>;

  for (const 维度 of 欲望列表) {
    欲望状态[维度] = {
      维度,
      当前满足度: 基础满足度 + (Math.random() * 20 - 10),
      衰减速率: 2 + Math.random() * 3,
      优先级系数: 人格系数[维度] ?? 1.0,
    };
  }

  const 主导欲望 = 欲望列表.reduce((a, b) =>
    (1 - 欲望状态[a].当前满足度) * 欲望状态[a].优先级系数
    > (1 - 欲望状态[b].当前满足度) * 欲望状态[b].优先级系数 ? a : b
  );

  return {
    欲望状态,
    当前主导欲望: 主导欲望 as 欲望维度,
    短期目标: [],
    最后更新时间: new Date().toISOString(),
  };
}

/**
 * 衰减欲望满足度
 */
export function 衰减欲望满足度(动机: NPC内在动机, 回合数: number = 1): NPC内在动机 {
  const 新欲望状态 = { ...动机.欲望状态 };
  for (const [维度, 状态] of Object.entries(新欲望状态)) {
    新欲望状态[维度 as 欲望维度] = {
      ...状态,
      当前满足度: Math.max(0, 状态.当前满足度 - 状态.衰减速率 * 回合数),
    };
  }

  const 主导欲望 = (Object.keys(新欲望状态) as 欲望维度[]).reduce((a, b) =>
    (1 - 新欲望状态[a].当前满足度) * 新欲望状态[a].优先级系数
    > (1 - 新欲望状态[b].当前满足度) * 新欲望状态[b].优先级系数 ? a : b
  );

  return {
    ...动机,
    欲望状态: 新欲望状态,
    当前主导欲望: 主导欲望,
    最后更新时间: new Date().toISOString(),
  };
}

/**
 * 基于未满足欲望生成短期目标
 */
export function 生成短期目标(动机: NPC内在动机, _情感?: { 心情值?: number; 羁绊值?: number }): 短期目标条目[] {
  const 目标列表: 短期目标条目[] = [];
  const 未满足欲望 = (Object.values(动机.欲望状态) as 欲望状态[])
    .filter(d => d.当前满足度 < 50)
    .sort((a, b) => (1 - b.当前满足度) * b.优先级系数 - (1 - a.当前满足度) * a.优先级系数);

  for (const 欲望 of 未满足欲望.slice(0, 3)) {
    const 紧迫度 = (1 - 欲望.当前满足度) * 欲望.优先级系数;
    let 目标描述 = '';
    let 行为倾向: 主动行为类型[] = [];

    switch (欲望.维度) {
      case '被认可':
        目标描述 = '渴望得到关注和赞赏';
        行为倾向 = ['主动邀约', '情绪表达', 'NSFW暗示'];
        break;
      case '刺激感':
        目标描述 = '想要新鲜体验';
        行为倾向 = ['试探行为', 'NSFW暗示', '日常互动'];
        break;
      case '安全感':
        目标描述 = '需要稳定和安心';
        行为倾向 = ['关心问候', '日常互动', '记忆触发'];
        break;
      case '归属感':
        目标描述 = '渴望陪伴和亲密';
        行为倾向 = ['主动邀约', '关心问候', '记忆触发'];
        break;
      case '支配感':
        目标描述 = '想要主导局面';
        行为倾向 = ['试探行为', '情绪表达', 'NSFW暗示'];
        break;
      case '自由感':
        目标描述 = '渴望无拘束';
        行为倾向 = ['日常互动', '情绪表达'];
        break;
    }

    目标列表.push({
      目标描述,
      驱动欲望: 欲望.维度,
      优先级: Math.round(紧迫度 * 50),
      时间窗口: new Date(Date.now() + 3600000).toISOString(),
      行为倾向,
    });
  }

  return 目标列表;
}

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
  // 新增：内在动机
  内在动机?: NPC内在动机;
  短期目标?: 短期目标条目[];
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

// ==================== 日常行为融合 ====================

/**
 * 选择并记录NPC日常行为（与自主行为融合）
 * 如果NPC没有发起自主行为，则尝试选择日常行为
 */
export function 选择并记录日常行为(
  npc: {
    npcId: string;
    姓名: string;
    核心性格特征?: string;
    心情值?: number;
    完整演化状态?: { 日常行为?: 日常行为状态 };
  },
  当前时间段: '清晨' | '上午' | '午后' | '黄昏' | '夜晚' | '深夜',
  地点?: string
): 日常行为模板 | null {
  if (!npc.完整演化状态) return null;
  if (!npc.完整演化状态.日常行为) {
    npc.完整演化状态.日常行为 = 创建初始日常状态();
  }

  const 日常状态 = npc.完整演化状态.日常行为;
  const 已执行Ids = 获取今日行为Ids(日常状态);
  const 性格标签 = npc.核心性格特征 ? [npc.核心性格特征] : [];
  const 心情 = npc.心情值 ?? 50;

  const 行为 = 选择日常行为(当前时间段, 性格标签, 心情, 日常状态, 已执行Ids);
  if (!行为) return null;

  npc.完整演化状态.日常行为 = 记录日常行为(
    日常状态,
    行为,
    地点 ?? '未知',
    80 + Math.floor(Math.random() * 20)
  );

  return 行为;
}

/**
 * 生成日常行为提示词注入
 */
export function 日常行为提示词注入(
  npc: {
    姓名: string;
    完整演化状态?: { 日常行为?: 日常行为状态 };
  },
  行为: 日常行为模板
): string {
  return `【${npc.姓名} — 日常活动】${行为.名称}（${行为.描述}）。请在叙事中体现该NPC正在进行这一日常活动。`;
}

// ==================== 主循环集成 ====================

/**
 * 回合预处理：计算在场NPC的自主行为，生成注入提示词
 */
export interface 自主行为回合结果 {
  npcId: string;
  姓名: string;
  行为: 主动行为;
  注入提示: string;
}

/**
 * 批量计算在场NPC自主行为，返回可注入AI提示词的结果
 */
export function 计算回合自主行为(
  在场NPC: NPC主动行为上下文[]
): 自主行为回合结果[] {
  const 行为结果 = 批量计算NPC主动行为(在场NPC);

  return 行为结果.map(({ npcId, 行为 }) => {
    const npc = 在场NPC.find(n => n.npcId === npcId);
    const 姓名 = npc?.姓名 ?? '未知';

    // 生成AI提示词注入
    let 注入提示 = `【${姓名} — 自主行为】${行为.描述}。`;
    switch (行为.类型) {
      case '主动邀约':
        注入提示 += '请在叙事中描写其主动邀请玩家的行为。';
        break;
      case '试探行为':
        注入提示 += '请在叙事中描写其试探性举动。';
        break;
      case '情绪表达':
        注入提示 += '请在叙事中体现其当前的情绪状态。';
        break;
      case '嫉妒表现':
        注入提示 += '请在叙事中描写其因嫉妒产生的态度变化。';
        break;
      case 'NSFW暗示':
        注入提示 += '请在叙事中描写其暗示性言行。';
        break;
      case '关心问候':
        注入提示 += '请在叙事中描写其主动关心玩家的情节。';
        break;
      case '记忆触发':
        注入提示 += '请在叙事中让其自然地提及或回忆相关事件。';
        break;
      default:
        注入提示 += '请在叙事中体现这一行为倾向。';
    }
    注入提示 += `（触发原因：${行为.触发原因}）`;

    return { npcId, 姓名, 行为, 注入提示 };
  });
}

/**
 * 将自主行为结果格式化为AI提示词注入
 */
export function 自主行为提示词注入(结果: 自主行为回合结果[]): string {
  if (结果.length === 0) return '';
  const 提示列表 = 结果.map(r => r.注入提示);
  return `\n【NPC自主行为指引】\n${提示列表.join('\n')}\n`;
}
