/**
 * 写真 NSFW 模块入口
 */

import type { ModuleManifest } from '../../core/types/module';
import { 构建写真NSFW完整叙事约束 } from '../../prompts/runtime/photographyNSFW';

export const manifest: ModuleManifest = {
  id: 'nsfw-photography',
  name: '写真 NSFW',
  version: '1.0.0',
  category: 'nsfw',
  eraId: 'contemporary',
  description: '写真拍摄系统：拍摄流程、照片交付、泄露事件、尺度递进',
  configKey: '启用写真NSFW系统',
  configValue: true,
  dependencies: ['nsfw-campus'],
  promptBlock: () => {
    return 构建写真NSFW完整叙事约束({
      拍摄阶段: '未开始',
      内容强度: '微暗',
      启用泄露事件: false,
    } as any);
  },
};

export type { 写真NSFW设置, 写真拍摄阶段, 泄露事件状态 } from '../../models/photographyNSFW';
