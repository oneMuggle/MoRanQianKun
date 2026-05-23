/**
 * NSFW 策略性玩法 — 模型
 * 氛围评分、节奏控制、成功率判定
 */

// ==================== 氛围系统 ====================

export interface 氛围状态 {
  地点系数: number;
  时间系数: number;
  前戏系数: number;
  道具系数: number;
  情绪系数: number;
  综合评分: number;
}

export interface 氛围评估输入 {
  地点类型: '卧室' | '浴室' | '客厅' | '户外' | '办公室' | '教室' | '车内' | '酒店' | '其他';
  时间段: '清晨' | '上午' | '下午' | '傍晚' | '夜晚' | '深夜';
  前戏回合数: number;
  道具匹配度: number;
  NPC心情值: number;
  NPC好感度: number;
  亲密度等级: number;
}

function 评估地点系数(地点: string, 亲密度等级: number): number {
  const 基础评分: Record<string, number> = {
    '卧室': 90,
    '酒店': 85,
    '浴室': 80,
    '车内': 70,
    '客厅': 60,
    '办公室': 40,
    '教室': 30,
    '户外': 20,
  };

  const 基础 = 基础评分[地点] ?? 50;

  if (亲密度等级 < 2) {
    return 地点 === '卧室' || 地点 === '酒店' ? 基础 + 10 : 基础 - 10;
  }

  if (亲密度等级 >= 4) {
    return Math.min(100, 基础 + 15);
  }

  return 基础;
}

function 评估时间系数(时间段: string): number {
  const 评分: Record<string, number> = {
    '深夜': 95,
    '夜晚': 90,
    '傍晚': 70,
    '清晨': 60,
    '下午': 50,
    '上午': 40,
  };
  return 评分[时间段] ?? 50;
}

function 评估前戏系数(前戏回合数: number, 亲密度等级: number): number {
  const 需要回合数 = Math.max(1, 5 - 亲密度等级);
  if (前戏回合数 >= 需要回合数) return 100;

  const 充足率 = 前戏回合数 / 需要回合数;
  return Math.round(充足率 * 80);
}

export function 计算氛围评分(输入: 氛围评估输入): 氛围状态 {
  const 地点系数 = 评估地点系数(输入.地点类型, 输入.亲密度等级);
  const 时间系数 = 评估时间系数(输入.时间段);
  const 前戏系数 = 评估前戏系数(输入.前戏回合数, 输入.亲密度等级);
  const 道具系数 = 输入.道具匹配度;
  const 情绪系数 = 输入.NPC心情值;

  const 综合评分 = Math.round(
    地点系数 * 0.25 +
    时间系数 * 0.20 +
    前戏系数 * 0.20 +
    情绪系数 * 0.20 +
    道具系数 * 0.15
  );

  return {
    地点系数,
    时间系数,
    前戏系数,
    道具系数,
    情绪系数,
    综合评分: clamp(综合评分, 0, 100),
  };
}

// ==================== 节奏系统 ====================

export type 节奏评价 = '过快' | '适中' | '过慢' | '完美';

export interface 节奏评估输入 {
  当前回合类型: '对话' | '前戏' | '推进' | 'NSFW' | '事后';
  历史回合序列: 节奏评估输入['当前回合类型'][];
  亲密度等级: number;
  心理防线: number;
  NPC心情值: number;
}

export function 评估节奏(输入: 节奏评估输入): { 评价: 节奏评价; 成功率修正: number } {
  const 最近5回合 = 输入.历史回合序列.slice(-5);
  const 推进次数 = 最近5回合.filter(t => t === '推进' || t === 'NSFW').length;
  const 前戏次数 = 最近5回合.filter(t => t === '前戏').length;
  const 对话次数 = 最近5回合.filter(t => t === '对话').length;

  if (推进次数 >= 3 && 前戏次数 <= 1) {
    return { 评价: '过快', 成功率修正: -30 };
  }

  if (对话次数 >= 4 && 推进次数 === 0 && 输入.亲密度等级 >= 2) {
    return { 评价: '过慢', 成功率修正: -10 };
  }

  if (前戏次数 >= 2 && 推进次数 >= 1 && 对话次数 >= 1) {
    return { 评价: '完美', 成功率修正: 20 };
  }

  return { 评价: '适中', 成功率修正: 0 };
}

// ==================== 成功率判定 ====================

export interface 成功率计算输入 {
  氛围评分: number;
  节奏修正: number;
  亲密度等级: number;
  好感度: number;
  心理防线: number;
  性癖匹配度: number;
  道具加成: number;
}

export function 计算NSFW成功率(输入: 成功率计算输入): number {
  const 基础率 = (输入.亲密度等级 * 10 + 输入.好感度) * 0.5;
  const 氛围影响 = (输入.氛围评分 - 50) * 0.4;
  const 防线影响 = -输入.心理防线 * 0.3;
  const 性癖影响 = 输入.性癖匹配度 * 0.2;
  const 道具影响 = 输入.道具加成 * 0.5;
  const 节奏影响 = 输入.节奏修正;

  return clamp(
    Math.round(基础率 + 氛围影响 + 防线影响 + 性癖影响 + 道具影响 + 节奏影响),
    5,
    95
  );
}

export function 执行成功率判定(输入: 成功率计算输入): { 成功: boolean; 成功率: number } {
  const 成功率 = 计算NSFW成功率(输入);
  return { 成功: Math.random() * 100 < 成功率, 成功率 };
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
