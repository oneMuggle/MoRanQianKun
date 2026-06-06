/**
 * RPG 战斗模块入口
 *
 * 包含：战斗引擎、装备、背包、武功、门派、任务等 RPG 核心系统。
 */

import type { ModuleManifest } from '../../core/types/module';

export const manifest: ModuleManifest = {
  id: 'biz-rpg-battle',
  name: 'RPG 战斗',
  version: '1.0.0',
  category: 'business',
  description: 'RPG 核心系统：战斗、装备、背包、武功、门派、任务',
  dependencies: [],
  promptBlock: () => {
    return '<RPG战斗系统>\nRPG 战斗系统已激活。支持回合制战斗、武功系统、装备系统和门派系统。\n</RPG战斗系统>';
  },
};

export type { 角色数据结构 } from '../../models/character';
export type { 战斗状态结构, 战斗敌方信息 } from '../../models/battle';
