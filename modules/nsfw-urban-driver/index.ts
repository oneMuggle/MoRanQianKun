import type { ModuleManifest } from '../../core/types/module';
import { 构建行程NSFW叙事约束 } from '../../prompts/runtime/urbanDriverNSFW';

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
    return 构建行程NSFW叙事约束({
      行程阶段: '未开始',
      内容强度: '微暗',
      乘客好感度: 0,
    } as any);
  },
};

export type { 网约车NSFW设置 } from '../../models/urbanDriverNSFW';
