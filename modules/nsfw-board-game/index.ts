import type { ModuleManifest } from '../../core/types/module';
import { 构建桌游NSFW完整叙事约束 } from '../../prompts/runtime/boardGameNSFW';

export const manifest: ModuleManifest = {
  id: 'nsfw-board-game',
  name: '桌游 NSFW',
  version: '1.0.0',
  category: 'nsfw',
  eraId: 'contemporary',
  description: '桌游系统：真心话大冒险、国王游戏、密室逃脱等',
  configKey: '启用桌游NSFW系统',
  configValue: true,
  dependencies: [],
  promptBlock: () => {
    return 构建桌游NSFW完整叙事约束({
      桌游类型: '真心话大冒险' as '真心话大冒险',
      密室主题: '古宅惊魂',
      紧张度: 0,
      参与NPC摘要: '',
    });
  },
};

export type { 桌游类型, 桌游社交NSFW设置 } from '../../models/boardGameNSFW';
