/**
 * NSFW 后果系统 — 入口
 */

export type {
  后果类型, 后果持续时间, 后果严重程度,
  后果条目, 记忆锚点, 情感标签,
  NSFW心理状态, 心理变化日志,
  蝴蝶效应, 后果系统状态,
} from './types';

export {
  初始化后果状态, 创建后果, 获取活跃后果,
  应用后果衰减, 生成后果摘要,
} from './consequenceEngine';

export {
  创建记忆锚点, 应用记忆衰减, 强化记忆,
  获取相关记忆, 获取情感记忆, 生成记忆摘要,
} from './memoryAnchors';

export {
  更新心理维度, 应用事件心理影响, 应用心理衰减,
  获取主导心理, 生成心理摘要,
} from './psychologyTracker';

export {
  检测蝴蝶效应, 检查蝴蝶效应触发, 蝴蝶效应转后果,
  获取活跃蝴蝶效应, 生成蝴蝶效应摘要,
} from './butterflyEffects';
