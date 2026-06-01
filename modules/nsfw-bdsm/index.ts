import type { ModuleManifest } from '../../core/types/module';
import { 构建BDSM完整叙事约束 } from '../../prompts/runtime/bdsmNSFW';
import { 构建BDSM论坛叙事约束 } from '../../prompts/runtime/bdsmForum';

export const manifest: ModuleManifest = {
  id: 'nsfw-bdsm',
  name: 'BDSM NSFW',
  version: '1.0.0',
  category: 'nsfw',
  eraId: 'contemporary',
  description: 'BDSM 系统：SM 场景、调教任务、多角色 BDSM、论坛',
  configKey: '启用BDSM系统',
  configValue: true,
  dependencies: ['nsfw-campus'],
  promptBlock: () => {
    const bdsm = 构建BDSM完整叙事约束({
      内容强度: '关闭' as any,
      SM场景类型: [],
      调教任务列表: [],
      多角色BDSM: false,
    });
    const forum = 构建BDSM论坛叙事约束({
      启用BDSM论坛: false,
      BDSM内容强度: '关闭' as any,
      论坛活跃帖子数: 0,
    });
    return `${bdsm}\n\n${forum}`;
  },
};

export type { BDSM设置, BDSM内容强度 } from '../../models/bdsmNSFW';
