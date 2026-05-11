/**
 * BDSM 独立系统引擎 — 统一入口
 */

export {
  权力倾向分类,
  计算权力天平推进,
  计算服从度变化,
  判定SM场景解锁,
  检查契约条件,
  判定契约违约,
  计算SM后果,
} from './core';

export {
  获取BDSM场景For时代,
  获取BDSM场景修正值,
} from './eraAdapter';
