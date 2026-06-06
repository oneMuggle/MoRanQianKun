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
      权力倾向: undefined,
      服从度: 0,
      已解锁SM场景: [],
      活跃任务: [],
      日常指令: [],
      其他Npc欲望摘要: '',
    });
    const forum = 构建BDSM论坛叙事约束({
      活跃帖子数: 0,
      内容强度: '关闭' as '关闭' | '轻度' | '中度' | '深度',
      寻主召奴未联系帖数: 0,
    });
    return `${bdsm}\n\n${forum}`;
  },
};

export type { BDSM系统设置 } from '../../models/bdsmNSFW';
