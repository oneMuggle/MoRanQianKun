/**
 * 房产经营模块入口
 *
 * 包含：房产引擎、设施工作流、租户工作流。
 */

import type { ModuleManifest } from '../../core/types/module';

export const manifest: ModuleManifest = {
  id: 'biz-property',
  name: '房产经营',
  version: '1.0.0',
  category: 'business',
  description: '房产SLG经营系统：房产管理、设施运营、租户管理',
  dependencies: [],
  promptBlock: () => {
    return '<房产经营系统>\n房产SLG经营系统已激活。玩家拥有可经营的房产，包含设施和租户管理。\n</房产经营系统>';
  },
};

export type { 房产类型 } from '../../src/models/property/types';
