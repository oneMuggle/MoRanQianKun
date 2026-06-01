/**
 * 模块注册中心
 *
 * 所有可插拔模块的入口。按需动态 import 加载。
 */

import type { ModuleManifest } from '../core/types/module';

// ==================== 时代模块 ====================

export const eraModules: Record<string, () => Promise<{ manifest: ModuleManifest; epoch: any }>> = {
  'primordial': () => import('./era-primordial'),
  'ancient': () => import('./era-ancient'),
  'modern': () => import('./era-modern'),
  'contemporary': () => import('./era-contemporary'),
  'near-future': () => import('./era-near-future'),
  'far-future': () => import('./era-far-future'),
  'post-human': () => import('./era-post-human'),
};

// ==================== NSFW 模块 ====================

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
