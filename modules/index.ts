/**
 * 模块注册中心
 *
 * 所有可插拔模块的入口。按需动态 import 加载。
 *
 * 使用方式：
 * ```ts
 * import { eraModules } from './modules';
 * const module = await eraModules['ancient']();
 * module.initialize(context);
 * ```
 */

import type { ModuleManifest } from '../core/types/module';

/** 时代模块动态加载映射 */
export const eraModules: Record<string, () => Promise<{ manifest: ModuleManifest; epoch: any }>> = {
  'primordial': () => import('./era-primordial'),
  'ancient': () => import('./era-ancient'),
  'modern': () => import('./era-modern'),
  'contemporary': () => import('./era-contemporary'),
  'near-future': () => import('./era-near-future'),
  'far-future': () => import('./era-far-future'),
  'post-human': () => import('./era-post-human'),
};

/** 所有时代 ID 列表 */
export const ERA_IDS = Object.keys(eraModules) as (keyof typeof eraModules)[];
