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
  // --- 新增类型 ---
  心理防线等级, 心理防线状态, 防线变化日志,
  性癖潜能值,
  偏好漂移状态,
  人格翻转类型, 人格演化状态, 人格翻转日志,
  敏感点演化状态, 敏感点开发日志, 敏感点发现日志,
  完整演化状态,
  // 孕产系统
  妊娠阶段, 孕产变化类型, 孕产变化日志, 孕产演化状态,
  // 事后护理系统
  事后情绪类型, 事后情绪条目, 事后护理状态, 情感余波日志,
} from './types';

export { 全时代通用性癖, 时代专属性癖, 获取性癖推荐, 生成性癖摘要 } from './fetishTaxonomy';
export { 全时代通用敏感点, 时代敏感点名称映射, 获取敏感点推荐, 生成敏感点摘要 } from './sensitiveZones';
export { 全部人格档案, 里都市人格档案, 里乡土人格档案, 里谍战人格档案, 里校园人格档案, 匹配人格档案, 解锁隐藏偏好 } from './personalityProfiles';
export { 生成NSFW画像, 应启用增强档案, 自动填充NSFW档案, 计算露出倾向 } from './linkage';
export type { 露出个性系数 } from './linkage';
export { 事件性癖映射, 获取事件映射, 获取所有触发事件, 生成触发事件列表 } from './eventMapping';
export type { 性癖触发事件, 事件映射配置 } from './eventMapping';
export {
  初始化演化状态,
  记录性癖触发事件,
  应用性癖衰减,
  批量应用性癖衰减,
  计算回合差,
} from './evolutionEngine';

// --- 新增子系统导出 ---
export {
  初始化心理防线, 更新心理防线, 应用防线恢复,
  检查人格翻转, 执行人格翻转, 防线值到等级, 等级到防线值范围,
} from './personalityEvolution';

export {
  初始化偏好漂移, 记录漂移事件, 计算偏好漂移,
  应用偏好漂移,
} from './preferenceDrift';

export {
  初始化潜能池, 更新潜能累积, 觉醒潜能,
} from './fetishPotential';

export {
  初始化敏感点演化, 更新敏感点开发, 事件敏感点映射,
} from './sensitivePointEvolution';

export {
  初始化孕产状态, 记录内射, 检查受孕判定, 推进妊娠进程, 应用产后恢复,
} from './pregnancyEngine';

export {
  初始化事后状态, 记录事后情绪, 评估护理质量, 应用事后恢复,
  获取主导情绪, 生成事后状态摘要,
} from './aftercareSystem';

export {
  计算场景修饰系数, 生成场景修饰摘要,
  评估时间修饰器, 评估地点修饰器, 评估天气修饰器,
} from './sceneModifiers';
export type { 场景修饰系数 } from './sceneModifiers';

export {
  初始化服装层次, 移除服装层, 记录服装损坏,
  添加污渍, 重新穿着, 生成服装状态文本,
  获取剩余穿着数量, 是否暴露,
} from './clothingLayers';
export type { 服装损坏程度, 服装层次条目, 服装层次结构, 服装变更日志 } from './types';

export {
  初始化玩家偏好档案, 记录玩家偏好,
  计算NPC契合度, 更新NPC契合度,
  获取玩家偏好排行, 获取高契合度NPC,
  生成玩家偏好摘要,
} from './playerProfile';
export type {
  偏好强度等级, 玩家NSFW偏好条目, NPC契合度条目,
  玩家NSFW偏好档案, 玩家偏好变化日志,
} from './types';

export {
  全部里程碑定义, 初始化里程碑状态, 检查里程碑,
  更新里程碑进度, 获取已解锁里程碑, 获取未解锁里程碑,
  按类别分组里程碑, 生成里程碑摘要,
} from './milestoneTracker';
export type {
  里程碑类别, 里程碑稀有度, 里程碑定义,
  里程碑触发上下文, 已解锁里程碑, 里程碑追踪状态,
} from './types';
