/**
 * NSFW 后果系统 — 类型定义
 * 社会后果、关系变化、心理演化、蝴蝶效应
 */

export type 后果类型 = '社会' | '关系' | '法律' | '心理' | '经济';
export type 后果持续时间 = '短期' | '中期' | '长期' | '永久';
export type 后果严重程度 = '轻微' | '中等' | '严重' | '极端';
export type 情感标签 = '羞耻' | '兴奋' | '后悔' | '依恋' | '恐惧' | '安心' | '麻木' | '空虚';

export interface 后果条目 {
  id: string;
  类型: 后果类型;
  描述: string;
  严重程度: 后果严重程度;
  持续时间: 后果持续时间;
  生效时间: string;
  过期时间?: string;
  剩余回合?: number;
  涉及NPC: string[];
  来源事件: string;
}

export interface 记忆锚点 {
  id: string;
  事件类型: string;
  事件描述: string;
  涉及NPC: string[];
  情感标签: 情感标签[];
  当前强度: number;
  衰减速率: number;
  创建时间: string;
  最后激活时间: string;
  是否核心记忆: boolean;
}

export interface NSFW心理状态 {
  羞耻度: number;
  麻木度: number;
  依赖度: number;
  冒险倾向: number;
  后悔度: number;
  最后更新时间: string;
}

export interface 心理变化日志 {
  时间: string;
  变化维度: '羞耻度' | '麻木度' | '依赖度' | '冒险倾向' | '后悔度';
  旧值: number;
  新值: number;
  触发原因: string;
}

export interface 蝴蝶效应 {
  id: string;
  原始事件: string;
  描述: string;
  影响范围: '个人' | '关系' | '社交圈' | '全局';
  激活条件: string;
  已触发: boolean;
  触发时间?: string;
  创建时间: string;
  关联后果: string[];
}

export interface 后果系统状态 {
  后果列表: 后果条目[];
  记忆锚点: 记忆锚点[];
  心理状态: NSFW心理状态;
  心理变化日志: 心理变化日志[];
  蝴蝶效应: 蝴蝶效应[];
  最后更新时间: string;
}
