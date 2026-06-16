/**
 * NSFW 共享核心 — 统一入口
 */

export type { 欲望阶段, 关系轨道, 权力倾向, 后果类型, 后果记录 } from './types';
export { 权力倾向阈值, 欲望阶段列表 } from './constants';

// ==================== Phase 5: 资源经济层 ====================

export type {
  NSFW资源状态,
  精力消耗配置,
  风险预算配置,
} from './resources';

export {
  初始化NSFW资源,
  消耗精力,
  恢复精力,
  消耗风险预算,
  恢复风险预算,
  获得亲密度代币,
  消费亲密度代币,
  修改声誉,
  精力不足惩罚,
  获取资源摘要,
  默认精力消耗配置,
  默认风险预算配置,
} from './resources';

export type {
  道具类型,
  商店道具,
  购买结果,
  玩家库存,
} from './shopSystem';

export {
  商店道具列表,
  初始化库存,
  获取可购买商品,
  购买道具,
  使用道具,
} from './shopSystem';

// ==================== Phase 6: 跨系统协同 ====================

export type {
  子系统类型,
  事件链阶段,
  事件链节点,
  事件链定义,
  事件链进度,
  事件链结果,
} from './crossSystemChains';

export {
  事件链库,
  检查事件链触发,
  检查节点可执行,
  推进事件链,
  创建事件链进度,
  获取可触发事件链,
  获取活跃事件链,
} from './crossSystemChains';

export type {
  角色关系节点,
  多角关系网,
  嫉妒冲突结果,
  平衡策略结果,
  平衡策略,
} from './multiCharacterNSFW';

export {
  初始化多角关系网,
  添加角色关系,
  更新角色关系,
  计算嫉妒变化,
  嫉妒冲突判定,
  执行平衡策略,
  多角关系成就判定,
} from './multiCharacterNSFW';

export type {
  场景来源,
  场景定义,
  场景组合,
  组合执行结果,
  推荐组合,
} from './sceneCombination';

export {
  场景组合库,
  检查组合可用,
  计算组合风险收益,
  执行场景组合,
  获取推荐组合,
  获取可用组合,
} from './sceneCombination';

// ==================== Phase 7: 后果解决玩法 ====================

export type {
  应对策略类型,
  应对策略,
  应对结果,
  策略推荐,
} from './consequenceResolution';

export {
  应对策略库,
  计算应对成功率,
  检查策略可用,
  执行应对策略,
  获取可用策略,
} from './consequenceResolution';

export type {
  法律风险等级,
  道德评判,
  法律记录,
  道德记录,
  应对法律结果,
  法律应对方式,
} from './legalEthicalSystem';

export {
  计算法律风险值,
  计算道德评判值,
  获取道德评判,
  添加法律风险,
  更新道德记录,
  执行法律应对,
  道德修复,
  初始化道德记录,
} from './legalEthicalSystem';

// ==================== Phase 9: 成就与元游戏 ====================

export type {
  成就分类,
  成就解锁条件,
  成就奖励,
  成就节点,
  成就进度,
} from './achievementTree';

export {
  成就树,
  初始化成就进度,
  检查成就解锁,
  获取成就分类统计,
  获取推荐成就,
  计算成就奖励,
} from './achievementTree';

export type {
  继承项目,
  周目配置,
} from './newGamePlus';

export {
  可继承项目,
  创建新周目,
  选择继承项目,
  获取可继承列表,
  计算新周目初始值,
} from './newGamePlus';

export type {
  挑战类型,
  挑战规则,
  挑战进度,
  挑战记录,
} from './challengeModes';

export {
  挑战规则库,
  创建挑战,
  检查挑战违规,
  检查挑战完成,
  计算挑战奖励,
  获取挑战排行榜,
} from './challengeModes';

// ==================== Phase 10: 文化/时代变体 ====================

export type {
  文化背景,
  文化规则,
  文化适应结果,
  文化配置,
} from './culturalVariants';

export {
  文化规则库,
  初始化文化配置,
  计算文化适应,
  切换文化,
  解锁文化,
  积累文化适应度,
  获取可用场景,
  应用文化风险修正,
  应用文化性癖调整,
} from './culturalVariants';
