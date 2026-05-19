/**
 * 好感度统一映射层
 *
 * 打通两套好感度系统：
 * - 武侠系统：NPC结构.好感度 (0-100)，阈值 [0,20,40,60,80,100]，等级 0-5
 * - AVG系统：RelationEdge.intimacy (0-200+)，阈值 [0,20,50,80,120,160]，等级 0-5
 *
 * 统一策略：以 AVG 系统为权威数据源，武侠系统好感度作为视图层映射。
 */

import { INTIMACY_THRESHOLDS } from '../../../../models/avg/relationGraph';
import { 亲密度等级阈值 } from '../../../../models/intimacy';

// ==================== 常量 ====================

/** 武侠系统好感度上限 */
const WUXIA_MAX = 100;
/** AVG 系统好感度上限（等级 5 对应 160，留 200 为扩展上限） */
const AVG_MAX = 200;

// ==================== 映射函数 ====================

/**
 * 将武侠好感度 (0-100) 映射到 AVG 好感度 (0-200)
 *
 * 映射规则：按等级区间线性映射，保证等级一致性。
 * 武侠等级阈值 [0,20,40,60,80,100] → AVG 等级阈值 [0,20,50,80,120,160]
 */
export function wuxiaToAvgIntimacy(wuxiaIntimacy: number): number {
  const clamped = Math.max(0, Math.min(WUXIA_MAX, wuxiaIntimacy));
  const wuxiaLevel = wuxiaIntimacyLevel(clamped);

  // 边界情况
  if (clamped <= 0) return 0;
  if (clamped >= WUXIA_MAX) return AVG_MAX;

  // 在当前等级区间内做线性映射
  const wuxiaThreshold = 亲密度等级阈值[wuxiaLevel];
  const wuxiaNextThreshold = 亲密度等级阈值[Math.min(wuxiaLevel + 1, 5)];
  const avgThreshold = INTIMACY_THRESHOLDS[wuxiaLevel];
  const avgNextThreshold = INTIMACY_THRESHOLDS[Math.min(wuxiaLevel + 1, 5)];

  // 在武侠区间内的归一化进度 [0,1]
  const progress = (clamped - wuxiaThreshold) / (wuxiaNextThreshold - wuxiaThreshold);

  // 映射到 AVG 区间
  return Math.round(avgThreshold + progress * (avgNextThreshold - avgThreshold));
}

/**
 * 将 AVG 好感度 (0-200) 映射到武侠好感度 (0-100)
 *
 * 反向映射：按等级区间线性映射。
 */
export function avgToWuxiaIntimacy(avgIntimacy: number): number {
  const clamped = Math.max(0, Math.min(AVG_MAX, avgIntimacy));
  const avgLevel = avgIntimacyLevel(clamped);

  if (clamped <= 0) return 0;
  if (clamped >= AVG_MAX) return WUXIA_MAX;

  const avgThreshold = INTIMACY_THRESHOLDS[avgLevel];
  const avgNextThreshold = INTIMACY_THRESHOLDS[Math.min(avgLevel + 1, 5)];
  const wuxiaThreshold = 亲密度等级阈值[avgLevel];
  const wuxiaNextThreshold = 亲密度等级阈值[Math.min(avgLevel + 1, 5)];

  const progress = (clamped - avgThreshold) / (avgNextThreshold - avgThreshold);
  return Math.round(wuxiaThreshold + progress * (wuxiaNextThreshold - wuxiaThreshold));
}

/**
 * 计算武侠好感度对应的等级 (0-5)
 */
export function wuxiaIntimacyLevel(intimacy: number): 0 | 1 | 2 | 3 | 4 | 5 {
  const clamped = Math.max(0, Math.min(WUXIA_MAX, intimacy));
  if (clamped >= 亲密度等级阈值[5]) return 5;
  if (clamped >= 亲密度等级阈值[4]) return 4;
  if (clamped >= 亲密度等级阈值[3]) return 3;
  if (clamped >= 亲密度等级阈值[2]) return 2;
  if (clamped >= 亲密度等级阈值[1]) return 1;
  return 0;
}

/**
 * 计算 AVG 好感度对应的等级 (0-5)
 */
export function avgIntimacyLevel(intimacy: number): 0 | 1 | 2 | 3 | 4 | 5 {
  const clamped = Math.max(0, Math.min(AVG_MAX, intimacy));
  if (clamped >= INTIMACY_THRESHOLDS[5]) return 5;
  if (clamped >= INTIMACY_THRESHOLDS[4]) return 4;
  if (clamped >= INTIMACY_THRESHOLDS[3]) return 3;
  if (clamped >= INTIMACY_THRESHOLDS[2]) return 2;
  if (clamped >= INTIMACY_THRESHOLDS[1]) return 1;
  return 0;
}

/**
 * 同步武侠好感度到 AVG 系统
 *
 * @param wuxiaIntimacy 武侠系统好感度 (0-100)
 * @returns 对应的 AVG 好感度 (0-200)
 */
export function syncWuxiaToAvg(wuxiaIntimacy: number): number {
  return wuxiaToAvgIntimacy(wuxiaIntimacy);
}

/**
 * 同步 AVG 好感度到武侠系统
 *
 * @param avgIntimacy AVG 系统好感度 (0-200)
 * @returns 对应的武侠好感度 (0-100)
 */
export function syncAvgToWuxia(avgIntimacy: number): number {
  return avgToWuxiaIntimacy(avgIntimacy);
}

/**
 * 好感度映射描述，用于调试和日志
 */
export interface IntimacyMappingInfo {
  wuxiaIntimacy: number;
  avgIntimacy: number;
  wuxiaLevel: 0 | 1 | 2 | 3 | 4 | 5;
  avgLevel: 0 | 1 | 2 | 3 | 4 | 5;
  wuxiaLevelLabel: string;
  avgLevelLabel: string;
  consistent: boolean;
}

/** 武侠等级标签 */
const WUXIA_LEVEL_LABELS = ['陌生人', '认识', '熟悉', '好友', '挚友', '恋人'];
/** AVG 等级标签 */
const AVG_LEVEL_LABELS = ['陌生人', '认识', '熟悉', '好友', '挚友', '恋人'];

/**
 * 获取完整映射信息
 */
export function getIntimacyMappingInfo(wuxiaIntimacy: number): IntimacyMappingInfo {
  const wuxiaLevel = wuxiaIntimacyLevel(wuxiaIntimacy);
  const avgIntimacy = wuxiaToAvgIntimacy(wuxiaIntimacy);
  const avgLevel = avgIntimacyLevel(avgIntimacy);

  return {
    wuxiaIntimacy,
    avgIntimacy,
    wuxiaLevel,
    avgLevel,
    wuxiaLevelLabel: WUXIA_LEVEL_LABELS[wuxiaLevel],
    avgLevelLabel: AVG_LEVEL_LABELS[avgLevel],
    consistent: wuxiaLevel === avgLevel,
  };
}
