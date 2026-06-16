import type { ModuleManifest } from '../../core/types/module';
import { 构建露出叙事约束 } from '../../src/prompts/runtime/exposureNSFW';

export const manifest: ModuleManifest = {
  id: 'nsfw-exposure',
  name: '露出 NSFW',
  version: '1.0.0',
  category: 'nsfw',
  eraId: 'contemporary',
  description: '露出系统：场景、紧张度、旁观者反应、网络传播、后果',
  configKey: '启用露出NSFW系统',
  configValue: true,
  dependencies: ['nsfw-campus'],
  promptBlock: () => {
    return 构建露出叙事约束(0 as 0, 'contemporary');
  },
};

export type { 露出偏好等级, ExposureNSFW设置 } from '../../src/models/exposureNSFW';
