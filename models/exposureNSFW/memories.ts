/**
 * 露出 NSFW 独立系统 — 记忆类型定义
 */

/** 记忆分类 */
export type 露出记忆分类 = '成功' | '失败' | '惊险' | '社交事件' | '名誉事件';

/** 露出记忆片段 */
export interface 露出记忆 {
  id: string;
  分类: 露出记忆分类;
  摘要: string;
  场景描述: string;
  参与者: string[];
  旁观者数量: number;
  最终紧张度: number;
  最终露出等级: number;
  是否留下证据: boolean;
  名誉影响: { 公开变化: number; 私密变化: number };
  时间: string;
  /** 回忆强度 1-5，越高越难忘 */
  回忆强度: number;
  /** 关联 NPC ID */
  关联NPCId?: string;
}

/** 记忆统计摘要 */
export interface 露出记忆统计 {
  总次数: number;
  成功次数: number;
  失败次数: number;
  最高紧张度: number;
  最高露出等级: number;
  最难忘记忆: 露出记忆 | null;
  首次露出时间: string | null;
}
