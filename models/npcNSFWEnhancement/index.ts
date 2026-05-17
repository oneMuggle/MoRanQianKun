/**
 * NPC NSFW 增强模块 — 入口
 */

export type {
  性癖大类, 性癖强度, 性癖条目, 性癖档案,
  身体区域分类, 敏感点发现状态, 敏感点条目, 敏感点档案,
  人格激活条件, 表人格表现, 里人格表现, 表里人格档案,
  NPCNSFW画像, 性癖查询参数, 敏感点查询参数,
} from './types';

export { 全时代通用性癖, 时代专属性癖, 获取性癖推荐, 生成性癖摘要 } from './fetishTaxonomy';
export { 全时代通用敏感点, 时代敏感点名称映射, 获取敏感点推荐, 生成敏感点摘要 } from './sensitiveZones';
export { 全部人格档案, 里都市人格档案, 里乡土人格档案, 里谍战人格档案, 里校园人格档案, 匹配人格档案, 解锁隐藏偏好 } from './personalityProfiles';
export { 生成NSFW画像, 应启用增强档案, 自动填充NSFW档案 } from './linkage';
