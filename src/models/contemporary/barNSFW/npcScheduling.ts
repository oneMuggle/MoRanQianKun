/**
 * 酒吧 NPC 调度规则配置
 *
 * 根据酒吧类型、档次、时间段动态调度 NPC 入场。
 * 与 dailyTown/npcSchedule.ts 的日程表模式互补：
 *   - npcSchedule 定义 NPC 什么时段在哪个区域
 *   - 本模块定义玩家进入酒吧时哪些 NPC 应该被调度进来
 */

import type { 夜场类型, 场所档次, 服务人员类型 } from '../../contemporary/nightlife/types';
import type { 酒吧场景模板 } from './types';
import type { NPC结构 } from '../../../models/social';

// ==================== 调度规则 ====================

export interface NPC调度规则 {
  /** 适用的酒吧类型，'*' 表示所有类型 */
  酒吧类型: 夜场类型 | '*';
  /** 适用的档次，'*' 表示所有档次 */
  适用档次: 场所档次 | '*';
  /** 需要调度的 NPC 身份标签（匹配 NPC.身份 字段） */
  身份标签: string[];
  /** 最小在场数量 */
  最小数量: number;
  /** 最大在场数量 */
  最大数量: number;
  /** 是否必须至少有一个 */
  必须存在: boolean;
  /** 权重（多选时随机概率权重） */
  权重: number;
  /** 额外筛选条件 */
  筛选条件?: {
    /** 最低好感度 */
    最低好感?: number;
    /** 最低亲密度 */
    最低亲密度?: number;
    /** 特定性格标签（如 '外向', '爱喝酒', '社交达人'） */
    性格标签?: string[];
    /** 排除的性格标签 */
    排除性格?: string[];
  };
}

// ==================== 酒吧类型与服务人员映射 ====================

/** 每种酒吧类型默认配置的服务人员 */
export const 酒吧服务人员配置: Record<string, { 类型: 服务人员类型; 最小: number; 最大: number }[]> = {
  '蹦迪酒吧': [
    { 类型: 'DJ', 最小: 1, 最大: 2 },
    { 类型: '气氛组', 最小: 2, 最大: 6 },
    { 类型: '公主', 最小: 1, 最大: 3 },
  ],
  '静吧': [
    { 类型: '公主', 最小: 1, 最大: 2 },
  ],
  '商务会所': [
    { 类型: '佳丽', 最小: 2, 最大: 5 },
    { 类型: '少爷', 最小: 1, 最大: 2 },
  ],
};

// ==================== 默认调度规则 ====================

export const 默认NPC调度规则: NPC调度规则[] = [
  // --- 蹦迪酒吧 ---
  {
    酒吧类型: '蹦迪酒吧',
    适用档次: '*',
    身份标签: ['舞者', 'DJ', '音乐人', '年轻人'],
    最小数量: 2,
    最大数量: 5,
    必须存在: true,
    权重: 100,
    筛选条件: {
      性格标签: ['外向', '爱热闹'],
      排除性格: ['内向', '安静'],
    },
  },
  {
    酒吧类型: '蹦迪酒吧',
    适用档次: '*',
    身份标签: ['酒友', '常客'],
    最小数量: 1,
    最大数量: 3,
    必须存在: false,
    权重: 60,
  },
  // --- 静吧 ---
  {
    酒吧类型: '静吧',
    适用档次: '*',
    身份标签: ['常客', '独行客', '文艺青年'],
    最小数量: 1,
    最大数量: 3,
    必须存在: true,
    权重: 100,
    筛选条件: {
      性格标签: ['安静', '善于倾听'],
    },
  },
  {
    酒吧类型: '静吧',
    适用档次: '*',
    身份标签: ['调酒师'],
    最小数量: 1,
    最大数量: 1,
    必须存在: true,
    权重: 100,
  },
  // --- 商务会所 ---
  {
    酒吧类型: '商务会所',
    适用档次: '*',
    身份标签: ['商务人士', '大客户', '老板'],
    最小数量: 1,
    最大数量: 3,
    必须存在: true,
    权重: 100,
    筛选条件: {
      最低好感: 20,
    },
  },
  {
    酒吧类型: '商务会所',
    适用档次: '*',
    身份标签: ['佳丽', '公关'],
    最小数量: 2,
    最大数量: 5,
    必须存在: true,
    权重: 100,
  },
  // --- 通用规则（所有酒吧类型） ---
  {
    酒吧类型: '*',
    适用档次: '*',
    身份标签: ['酒鬼'],
    最小数量: 0,
    最大数量: 2,
    必须存在: false,
    权重: 30,
  },
];

// ==================== NPC 资格检查 ====================

/**
 * 检查某个 NPC 是否符合调度规则
 */
export function 检查NPC资格(
  npc: NPC结构,
  rule: NPC调度规则,
): boolean {
  const npc身份 = npc.身份 || '';
  const hasMatchingTag = rule.身份标签.some(tag => npc身份.includes(tag));
  if (!hasMatchingTag) return false;

  const cond = rule.筛选条件;
  if (cond) {
    if (cond.最低好感 !== undefined && (npc.好感度 || 0) < cond.最低好感) {
      return false;
    }
    if (cond.最低亲密度 !== undefined && (npc.亲密度等级 || 0) < cond.最低亲密度) {
      return false;
    }
    if (cond.性格标签 && cond.性格标签.length > 0) {
      const npc性格 = npc.核心性格特征 || '';
      const hasPersonality = cond.性格标签.some(p => npc性格.includes(p));
      if (!hasPersonality) return false;
    }
    if (cond.排除性格 && cond.排除性格.length > 0) {
      const npc性格 = npc.核心性格特征 || '';
      const hasExcluded = cond.排除性格.some(p => npc性格.includes(p));
      if (hasExcluded) return false;
    }
  }

  return true;
}

// ==================== NPC 调度引擎 ====================

/**
 * 根据酒吧场景模板和可用 NPC 列表，计算应该在场 NPC
 */
export function 调度NPC到酒吧(
  sceneTemplate: 酒吧场景模板,
  availableNPCs: NPC结构[],
  customRules?: NPC调度规则[],
): NPC结构[] {
  const rules = customRules || 默认NPC调度规则;
  const 在场NPC: NPC结构[] = [];
  const 已调度IDs = new Set<string>();

  const applicableRules = rules.filter(rule => {
    const typeMatch = rule.酒吧类型 === '*' || rule.酒吧类型 === sceneTemplate.类型;
    const tierMatch = rule.适用档次 === '*' || rule.适用档次 === sceneTemplate.档次;
    return typeMatch && tierMatch;
  });

  const 必须规则 = applicableRules.filter(r => r.必须存在);
  const 可选规则 = applicableRules.filter(r => !r.必须存在);

  for (const rule of 必须规则) {
    const 合格NPC = availableNPCs.filter(
      npc => !已调度IDs.has(npc.id) && 检查NPC资格(npc, rule),
    );
    const 需要数量 = Math.min(rule.最小数量, 合格NPC.length);
    const 选中NPC = 随机选取(合格NPC, 需要数量);
    for (const npc of 选中NPC) {
      在场NPC.push(npc);
      已调度IDs.add(npc.id);
    }
  }

  for (const rule of 可选规则) {
    const 合格NPC = availableNPCs.filter(
      npc => !已调度IDs.has(npc.id) && 检查NPC资格(npc, rule),
    );
    const 随机数量 = Math.floor(Math.random() * (rule.最大数量 - rule.最小数量 + 1)) + rule.最小数量;
    const 需要数量 = Math.min(随机数量, 合格NPC.length);
    if (需要数量 > 0) {
      const 选中NPC = 随机选取(合格NPC, 需要数量);
      for (const npc of 选中NPC) {
        在场NPC.push(npc);
        已调度IDs.add(npc.id);
      }
    }
  }

  return 在场NPC;
}

function 随机选取<T>(candidates: T[], count: number): T[] {
  const shuffled = [...candidates].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
