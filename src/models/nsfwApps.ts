// NSFW App 定义、内容分级、解锁条件

import { NsfwLevel, AppDefinition, isNsfwApp } from './appRegistry';

/** NSFW 解锁条件 */
export interface NsfwUnlockCondition {
  minNsfwLevel: number;          // 最低 NSFW 等级
  minIntimacy?: number;          // 最低亲密度
  requiredRelationship?: string; // 特定关系（如"恋人"、"暧昧对象"）
  background?: string;           // 特定背景
  appInstalled?: boolean;        // 是否已安装
}

/** App 内容分级配置 */
export interface AppContentGrade {
  level: NsfwLevel;
  label: string;      // UI 显示标签
  color: string;      // 标签颜色
  requiresConfirm: boolean; // 进入时是否需要确认
}

/** 各分级的 UI 配置 */
export const NSFW_GRADE_CONFIG: Record<NsfwLevel, AppContentGrade> = {
  [NsfwLevel.Clean]: {
    level: NsfwLevel.Clean,
    label: '',
    color: 'transparent',
    requiresConfirm: false,
  },
  [NsfwLevel.Suggestive]: {
    level: NsfwLevel.Suggestive,
    label: '敏感内容',
    color: '#FF9500',
    requiresConfirm: false,
  },
  [NsfwLevel.Mature]: {
    level: NsfwLevel.Mature,
    label: '成人内容',
    color: '#FF2D55',
    requiresConfirm: true,
  },
  [NsfwLevel.Explicit]: {
    level: NsfwLevel.Explicit,
    label: '限制内容',
    color: '#FF0000',
    requiresConfirm: true,
  },
};

/** 判断 App 是否对当前用户可见 */
export function isAppVisible(
  app: AppDefinition,
  nsfwEnabled: boolean,
  maxAllowedLevel: NsfwLevel = NsfwLevel.Clean
): boolean {
  if (app.category !== 'nsfw' && !isNsfwApp(app)) return true;
  if (!nsfwEnabled) return false;
  const appLevel = app.nsfwLevel ?? NsfwLevel.Clean;
  return appLevel <= maxAllowedLevel;
}

/** 判断 App 是否可下载（在应用市场中可见） */
export function isAppDownloadable(
  app: AppDefinition,
  nsfwEnabled: boolean
): boolean {
  if (app.category === 'universal') return false;
  if (app.category === 'nsfw') return nsfwEnabled;
  return true;
}

/** 根据亲密度计算当前 NSFW 等级 */
export function calculateNsfwLevelFromIntimacy(
  intimacy: number
): NsfwLevel {
  if (intimacy >= 80) return NsfwLevel.Explicit;
  if (intimacy >= 50) return NsfwLevel.Mature;
  if (intimacy >= 20) return NsfwLevel.Suggestive;
  return NsfwLevel.Clean;
}

/** 根据关系类型计算当前 NSFW 等级 */
export function calculateNsfwLevelFromRelationship(
  relationship: string
): NsfwLevel {
  const nsfwRelationships: Record<string, NsfwLevel> = {
    '恋人': NsfwLevel.Mature,
    '暧昧对象': NsfwLevel.Suggestive,
    '秘密关系': NsfwLevel.Explicit,
    '伴侣': NsfwLevel.Explicit,
  };
  return nsfwRelationships[relationship] ?? NsfwLevel.Clean;
}

/** 获取 NSFW 通知预览文本（模糊处理） */
export function getNsfwNotificationPreview(
  _app: AppDefinition,
  nsfwLevel: NsfwLevel,
  userMaxLevel: NsfwLevel
): string {
  if (nsfwLevel > userMaxLevel) {
    return '你有新的消息';
  }
  return ''; // 返回空表示使用原始内容
}

/** NSFW App 快捷分类 */
export const NSFW_APP_CATEGORIES = [
  { id: 'dating', label: '交友', icon: '💕' },
  { id: 'adult_forum', label: '社区', icon: '🌙' },
  { id: 'nsfw_gallery', label: '订阅', icon: '🔒' },
  { id: 'live_stream', label: '直播', icon: '📺' },
] as const;
