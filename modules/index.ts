/**
 * 模块注册中心
 *
 * 所有可插拔模块的入口。按需动态 import 加载。
 *
 * 2026-06-03 状态：
 * - eraModules 已清空（modules/era-* 目录已删除，避免 tsc 报错）
 * - nsfwModules / businessModules 保留但 0 引用方（与 era 同样性质）
 * - 整体文件本身 0 引用方，ModuleLoader 实际未使用
 */

import type { ModuleManifest } from '../core/types/module';

// ==================== 时代模块 ====================
// 2026-06-03：eraModules 目录已删除
export const eraModules: Record<string, () => Promise<{ manifest: ModuleManifest; epoch: any }>> = {};

// ==================== NSFW 模块 ====================
// 2026-06-03：nsfw-* 仍存在但 0 引用方，配置暂时保留
export const nsfwModules: Record<string, () => Promise<{ manifest: ModuleManifest }>> = {
  'nsfw-campus': () => import('./nsfw-campus'),
  'nsfw-photography': () => import('./nsfw-photography'),
  'nsfw-urban-driver': () => import('./nsfw-urban-driver'),
  'nsfw-exposure': () => import('./nsfw-exposure'),
  'nsfw-bdsm': () => import('./nsfw-bdsm'),
  'nsfw-board-game': () => import('./nsfw-board-game'),
  'nsfw-bar': () => import('./nsfw-bar'),
};

// ==================== 业务域模块 ====================
// 2026-06-03：biz-* 仍存在但 0 引用方，配置暂时保留
export const businessModules: Record<string, () => Promise<{ manifest: ModuleManifest }>> = {
  'biz-property': () => import('./biz-property'),
  'biz-rpg-battle': () => import('./biz-rpg-battle'),
  'biz-galgame': () => import('./biz-galgame'),
  'biz-novel': () => import('./biz-novel'),
  'biz-device': () => import('./biz-device'),
};

/** 所有时代 ID 列表 */
export const ERA_IDS = Object.keys(eraModules) as (keyof typeof eraModules)[];

/** 所有 NSFW 模块 ID 列表 */
export const NSFW_MODULE_IDS = Object.keys(nsfwModules) as (keyof typeof nsfwModules)[];

/** 所有业务域模块 ID 列表 */
export const BUSINESS_MODULE_IDS = Object.keys(businessModules) as (keyof typeof businessModules)[];
