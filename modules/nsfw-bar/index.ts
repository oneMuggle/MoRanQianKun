import type { ModuleManifest } from '../../core/types/module';
import { 生成酒吧叙事约束 } from '../../src/models/contemporary/barNSFW';

export const manifest: ModuleManifest = {
  id: 'nsfw-bar',
  name: '酒吧 NSFW',
  version: '1.0.0',
  category: 'nsfw',
  eraId: 'contemporary',
  description: '酒吧系统：NPC 排班、酒局、搭讪、醉酒事件',
  configKey: '启用酒吧NSFW系统',
  configValue: true,
  dependencies: [],
  promptBlock: () => {
    return 生成酒吧叙事约束({
      是否营业: false,
      当前时段: '未营业',
      在场NPC列表: [],
    } as any);
  },
};

export type { 酒吧NSFW设置 } from '../../src/models/contemporary/barNSFW';
