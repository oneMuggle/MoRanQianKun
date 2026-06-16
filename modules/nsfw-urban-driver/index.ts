import type { ModuleManifest } from '../../core/types/module';
import { 构建行程NSFW叙事约束 } from '../../src/prompts/runtime/urbanDriverNSFW';

export const manifest: ModuleManifest = {
  id: 'nsfw-urban-driver',
  name: '网约车 NSFW',
  version: '1.0.0',
  category: 'nsfw',
  eraId: 'contemporary',
  description: '网约车系统：行程事件、乘客互动、尺度递进',
  configKey: '启用网约车NSFW系统',
  configValue: true,
  dependencies: [],
  promptBlock: () => {
    return 构建行程NSFW叙事约束('未开始' as any, '微暗');
  },
};

export type { 都市网约车NSFW设置 } from '../../src/models/urbanDriverNSFW';
