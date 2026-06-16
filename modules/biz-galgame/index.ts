/**
 * Galgame/AVG 模块入口
 *
 * 包含：AVG 对话引擎、视觉演出、分支叙事等。
 */

import type { ModuleManifest } from '../../core/types/module';

export const manifest: ModuleManifest = {
  id: 'biz-galgame',
  name: 'Galgame/AVG',
  version: '1.0.0',
  category: 'business',
  description: 'Galgame AVG 模式：对话引擎、分支叙事、结局系统',
  dependencies: [],
  promptBlock: () => {
    return '<Galgame系统>\nGalgame/AVG 模式已激活。支持对话树、分支叙事和结局系统。\n</Galgame系统>';
  },
};

export type { GalgameRoute, GalgameEnding } from '../../src/models/avg/galgame';
