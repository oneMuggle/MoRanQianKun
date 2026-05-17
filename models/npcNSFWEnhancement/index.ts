/**
 * NPC NSFW 增强模块 — 入口
 */

export type {
  性癖大类, 性癖强度, 性癖条目, 性癖档案,
  身体区域分类, 敏感点发现状态, 敏感点条目, 敏感点档案,
  人格激活条件, 表人格表现, 里人格表现, 表里人格档案,
  NPCNSFW画像, 性癖查询参数, 敏感点查询参数,
  解锁条件类型, 解锁条件, 性癖条目来源, 性癖觉醒记录,
  性癖变化类型, 性癖变化日志, 性癖演化状态,
} from './types';

export { 全时代通用性癖, 时代专属性癖, 获取性癖推荐, 生成性癖摘要 } from './fetishTaxonomy';
export { 全时代通用敏感点, 时代敏感点名称映射, 获取敏感点推荐, 生成敏感点摘要 } from './sensitiveZones';
export { 全部人格档案, 里都市人格档案, 里乡土人格档案, 里谍战人格档案, 里校园人格档案, 匹配人格档案, 解锁隐藏偏好 } from './personalityProfiles';
export { 生成NSFW画像, 应启用增强档案, 自动填充NSFW档案 } from './linkage';
export { 事件性癖映射, 获取事件映射, 获取所有触发事件, 生成触发事件列表 } from './eventMapping';
export type { 性癖触发事件, 事件映射配置 } from './eventMapping';
export {
  初始化演化状态,
  记录性癖触发事件,
  应用性癖衰减,
  批量应用性癖衰减,
  计算回合差,
} from './evolutionEngine';
