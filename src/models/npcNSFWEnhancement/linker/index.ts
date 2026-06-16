/**
 * NSFW 跨模块联动 — 入口
 */

export type {
  引擎类型, 态度类型, 流言等级, 声誉影响方向, 联动效果类型,
  跨模块事件, 事件监听器, NPC跨模块记忆,
  声誉条目, NPC声誉状态, 联动规则, 已激活联动,
  跨模块联动状态,
} from './types';

export {
  发布事件, 订阅事件, 分发事件,
  获取NPC相关事件, 获取引擎事件, 获取标签事件,
  生成事件摘要,
} from './eventBus';

export {
  记录跨模块记忆, 应用跨模块记忆衰减, 获取主导态度,
  生成跨模块记忆摘要,
} from './npcMemoryTracker';

export {
  初始化声誉状态, 更新声誉, 应用声誉衰减,
  获取声誉状态, 获取高流言NPC, 生成声誉摘要,
} from './reputationEngine';

export {
  全部联动规则, 初始化跨模块状态, 处理联动事件,
  执行到期联动, 获取待执行联动, 生成联动摘要,
} from './crossModuleLinker';
