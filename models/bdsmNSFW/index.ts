/**
 * BDSM 独立系统数据模型 — 统一入口
 *
 * 从 campusNSFW 提取，支持全时代
 */

export type {
  权力倾向,
  权力天平状态,
  服从度状态,
  契约类型,
  契约状态,
  契约记录,
  SM场景类型,
  SM场景记录,
  BDSM任务类型,
  BDSM任务难度,
  BDSM任务状态,
  BDSM评价等级,
  关系阶段,
  BDSM调教任务,
  BDSM日常指令,
  BDSM里程碑,
  BDSM关系状态,
} from './core';

export type {
  BDSM帖子分类,
  招募方角色,
  联系状态,
  影响等级,
  寻主召奴信息,
  BDSM论坛帖子,
  BDSM影响记录,
  联系对话,
  寻主召奴联系会话,
  BDSM论坛设置,
} from './forum';

export { 默认BDSM论坛设置, BDSM子分类列表 } from './forum';

export { BDSM阶段要求, BDSM默认最大活跃任务数, BDSM连续拒绝阈值 } from './constants';

export type { BDSM时代场景类型, BDSM时代场景 } from './scenarios';

export { 获取BDSM时代场景, 通用BDSM场景, BDSM时代场景库 } from './scenarios';

// === 系统设置 ===

export interface BDSM系统设置 {
  启用BDSM独立系统: boolean;
  BDSM内容强度: '关闭' | '轻度' | '中度' | '深度';
  启用BDSM论坛: boolean;
  启用BDSM调教任务: boolean;
  启用BDSM契约系统: boolean;
  启用BDSM见面预约: boolean;
  启用BDSM关系管线: boolean;
  启用BDSM多角色关系: boolean;
  启用BDSM时代场景包: boolean;
  启用BDSM信誉系统: boolean;
  启用BDSM安全词历史: boolean;
  启用BDSM契约模板库: boolean;
}

export const 默认BDSM系统设置: BDSM系统设置 = {
  启用BDSM独立系统: false,
  BDSM内容强度: '轻度',
  启用BDSM论坛: true,
  启用BDSM调教任务: true,
  启用BDSM契约系统: true,
  启用BDSM见面预约: true,
  启用BDSM关系管线: true,
  启用BDSM多角色关系: false,
  启用BDSM时代场景包: true,
  启用BDSM信誉系统: false,
  启用BDSM安全词历史: false,
  启用BDSM契约模板库: false,
};

export { 规范化BDSM系统设置 } from './normalization';

// === 多角色关系网 ===

export type {
  BDSM关系边类型,
  BDSM关系边,
  关系网络数据,
} from './network';

export { 创建空关系网络 } from './network';
