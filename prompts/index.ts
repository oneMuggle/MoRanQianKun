/**
 * 提示词系统入口
 *
 * Phase 5: 从静态数组改为核心 + 动态注册混合模式
 * - 核心提示词始终加载（从 core-prompts.ts）
 * - 时代、NSFW、业务域提示词通过模块 promptBlock 动态注册
 * - 保持向后兼容：仍然导出 默认提示词 数组
 */

import { 提示词结构 } from '../types';
import { 核心提示词 } from './core-prompts';

// Re-export 共享COT片段（useGame 直接使用）
export { 共享COT片段库, 共享_判定逻辑, 共享_资源校验, 共享_NPC行为, 共享_时间推进, 共享_变量落点, 共享_世界观一致性, 共享_战斗判定, 共享_记忆管理 } from './shared/cotFragments';

// Re-export 时代现实函数
export { 获取时代现实提示词 } from './core/eraRealism';

/**
 * 默认提示词（向后兼容）
 *
 * 注意：这是核心提示词的别名。
 * 时代、NSFW、业务域的额外提示词通过 systemPromptBuilder 动态注入。
 */
export const 默认提示词: 提示词结构[] = [...核心提示词];

/**
 * 获取核心提示词
 */
export const 获取核心提示词 = (): 提示词结构[] => {
    return [...核心提示词];
};
