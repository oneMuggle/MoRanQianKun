/**
 * NSFW 跨模块联动 — 类型定义
 */

export type 引擎类型 = 'barNSFW' | 'campus' | 'exposure' | 'urbanDriver' | 'photography' | 'bdsm' | 'nightlife' | 'privateChat';
export type 态度类型 = '亲近' | '疏离' | '厌恶' | '好奇' | '威胁' | '中立';
export type 流言等级 = 0 | 1 | 2 | 3 | 4 | 5;
export type 声誉影响方向 = '正面' | '负面' | '中性';
export type 联动效果类型 = '态度变化' | '场景解锁' | '流言传播' | '风险调整' | '概率修正' | '行为改变';

export interface 跨模块事件 {
  id: string;
  源引擎: 引擎类型;
  事件类型: string;
  事件描述: string;
  涉及NPC: string[];
  严重程度: number;
  时间戳: string;
  标签: string[];
  已传播: boolean;
}

export type 事件监听器 = (事件: 跨模块事件) => void;

export interface NPC跨模块记忆 {
  id: string;
  源引擎: 引擎类型;
  事件: string;
  事件描述: string;
  时间戳: string;
  严重程度: number;
  态度: 态度类型;
  记忆强度: number;
  衰减速率: number;
  影响行为: string[];
}

export interface 声誉条目 {
  id: string;
  来源事件: string;
  描述: string;
  影响方向: 声誉影响方向;
  影响值: number;
  时间戳: string;
  过期回合?: number;
  剩余回合?: number;
}

export interface NPC声誉状态 {
  当前评分: number;
  流言等级: 流言等级;
  声誉历史: 声誉条目[];
  最后更新时间: string;
}

export interface 联动规则 {
  id: string;
  源事件: string;
  源引擎: 引擎类型;
  目标引擎: 引擎类型;
  效果类型: 联动效果类型;
  效果描述: string;
  效果值: number;
  延迟回合: number;
  触发条件?: string;
}

export interface 已激活联动 {
  规则Id: string;
  源事件Id: string;
  目标引擎: 引擎类型;
  激活时间: string;
  剩余延迟: number;
  已执行: boolean;
}

export interface 跨模块联动状态 {
  事件历史: 跨模块事件[];
  npc记忆: Record<string, NPC跨模块记忆[]>;
  npc声誉: Record<string, NPC声誉状态>;
  已激活联动: 已激活联动[];
  最后更新时间: string;
}
