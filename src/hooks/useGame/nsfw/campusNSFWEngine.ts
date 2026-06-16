// 校园纪元 NSFW 引擎 — 向后兼容入口
// v1.0-v1.6 所有子系统已拆分为 campusNSFW/ 子目录
// 原有 import 路径保持不变，此处统一 re-export

export {
  计算欲望阶段推进,
  检查欲望阶段升级,
  计算互动冷却,
  计算暴露风险,
  判定后果,
  判定关系轨道,
  模拟流言传播,
  生成里程碑,
} from '../campusNSFW/desireStateMachine';

export {
  计算露出偏好推进,
  计算紧张度,
  判定旁观者察觉,
  模拟旁观者反应,
  模拟网络传播,
  计算回合衰减,
  计算露出衰减,
} from '../campusNSFW/exposureSystem';

export {
  权力倾向分类,
  计算权力天平推进,
  计算服从度变化,
  判定SM场景解锁,
  检查契约条件,
  判定契约违约,
  计算SM后果,
} from '../campusNSFW/bdsmSystem';

export {
  判定桌游触发,
  选择桌游类型,
  计算桌游紧张度,
  计算羁绊加成,
  判定桌游NSFW升级,
} from '../campusNSFW/boardGameSystem';

export {
  判定校园祭触发,
  选择校园祭主题,
  选择摊位类型,
  推进校园祭阶段,
  判定告白条件,
  处理告白结果,
  判定多角冲突,
  生成摊位NSFW场景,
  生成后夜祭场景,
  生成筹备期场景,
  计算校园祭总NSFW,
} from '../campusNSFW/festivalSystem';

export {
  创建默认欲望档案,
  从NPC创建欲望档案,
  创建默认露出状态,
  创建默认紧张度状态,
  创建默认权力天平,
  创建默认服从度,
  创建默认校园祭状态,
  创建默认桌游状态,
} from '../campusNSFW/factoryFunctions';

export { 处理NSFW互动 } from '../campusNSFW/convenienceFunctions';
export { 处理BDSM论坛影响 } from '../campusNSFW/forumIntegration';
export { 处理BDSM任务影响, 判定BDSM关系阶段推进 } from '../campusNSFW/bdsmTaskEngine';

export {
  欲望阶段推进基础值,
  互动基础冷却,
  地点暴露风险基础值,
  时间段修正,
  选择系数,
  欲望阶段冷却修正,
  欲望阶段列表,
} from '../campusNSFW/constants';
