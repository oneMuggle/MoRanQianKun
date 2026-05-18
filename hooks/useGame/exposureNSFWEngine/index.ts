/**
 * 露出 NSFW 独立引擎 — 统一入口
 */

export {
  计算露出偏好推进,
  计算紧张度,
  判定旁观者察觉,
  模拟旁观者反应,
  模拟网络传播,
  计算回合衰减,
  计算露出衰减,
  获取紧张度阶段展示,
} from './core';

export {
  创建默认露出状态,
  创建默认紧张度状态,
} from './factoryFunctions';

export {
  推荐场景,
  验证场景可行性,
  选择当前场景,
  按场所获取场景,
  计算场景紧张度贡献,
  计算场景发现概率,
} from './scenarioManager';

export {
  判定露出后果,
  应用后果衰减,
  衰减所有活跃后果,
  创建默认名誉状态,
  更新名誉状态,
  名誉自然恢复,
} from './consequenceEngine';

export {
  获取所有成就,
  检查成就,
  获取分类成就,
  计算成就完成度,
} from './achievementEngine';

export {
  创建露出记忆,
  计算记忆统计,
  按回忆强度过滤,
  获取NPC记忆,
  应用记忆衰减,
  衰减所有记忆,
  清理遗忘记忆,
} from './memoryEngine';
