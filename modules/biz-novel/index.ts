/**
 * 小说系统模块入口
 *
 * 包含：小说写作、小说拆分、章节管理。
 */

import type { ModuleManifest } from '../../core/types/module';

export const manifest: ModuleManifest = {
  id: 'biz-novel',
  name: '小说系统',
  version: '1.0.0',
  category: 'business',
  description: '小说写作助手：章节规划、写作辅助、小说拆分',
  dependencies: [],
  promptBlock: () => {
    return '<小说系统>\n小说写作系统已激活。支持章节规划、AI 辅助写作和小说拆分导出。\n</小说系统>';
  },
};

export type { 小说写作任务状态类型, 小说写作大纲结构 } from '../../src/models/novelWriting';
export type { 小说拆分任务状态类型 } from '../../src/models/novelDecomposition';
