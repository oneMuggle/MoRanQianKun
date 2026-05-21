// 酒吧 NSFW 模块注册

import type { StoryModule, 游戏状态快照 } from '../../../utils/storyModule/types';
import { 故事模块注册表 } from '../../../utils/storyModule/registry';
import type { 酒吧NSFW设置, 酒吧NSFW状态 } from '../../../models/contemporary/barNSFW/types';
import { 生成酒吧叙事约束 } from '../../../models/contemporary/barNSFW/prompts/酒吧叙事约束';
import { MODERN_ERA_IDS } from '../../../models/eraTheme/assembly';

interface 酒吧运行时参数 {
  当前酒吧: string;
  酒吧类型: string;
  场所档次: string;
  醉酒值: number;
  醉酒程度: string;
  兴奋程度: number;
  冲动程度: number;
  在场NPC数量: number;
  在场NPC摘要: string;
  当前事件: string | null;
  当前暧昧场景: string | null;
  内容强度: '微暗' | '暧昧' | '露骨';
  尺度上限: '无' | '点到为止' | '适度展开' | '完全展开';
  启用醉酒系统: boolean;
  启用危机事件: boolean;
  启用陪酒服务: boolean;
}

function 提取酒吧参数(
  gameState: 游戏状态快照,
  settings: 酒吧NSFW设置
): 酒吧运行时参数 | null {
  const barState = (gameState as any).barNSFWState as 酒吧NSFW状态 | null;
  if (!barState || !barState.已激活) return null;

  const 场所 = barState.当前场所;
  if (!场所) return null;

  const 消费者 = barState.消费者状态;
  if (!消费者) return null;

  const 社交数据 = gameState.社交 as Record<string, unknown> | undefined;
  const npc摘要 = barState.在场NPC
    .map((id: string) => {
      const npc = (社交数据 as any)?.[id];
      return npc?.姓名 || id;
    })
    .join('、');

  return {
    当前酒吧: 场所.场所名称,
    酒吧类型: 场所.类型,
    场所档次: 场所.档次,
    醉酒值: 消费者.醉酒值,
    醉酒程度: 消费者.醉酒程度,
    兴奋程度: 消费者.兴奋程度,
    冲动程度: 消费者.冲动程度,
    在场NPC数量: barState.在场NPC.length,
    在场NPC摘要: npc摘要 || '无',
    当前事件: barState.当前事件,
    当前暧昧场景: barState.当前暧昧场景,
    内容强度: settings.内容强度,
    尺度上限: settings.尺度上限,
    启用醉酒系统: settings.启用醉酒系统,
    启用危机事件: settings.启用危机事件,
    启用陪酒服务: settings.启用陪酒服务,
  };
}

const 酒吧NSFW模块: StoryModule<酒吧NSFW设置, 酒吧运行时参数> = {
  id: 'barNSFW',
  name: '酒吧NSFW',
  eraId: 'contemporary',
  parentEraIds: [...MODERN_ERA_IDS],
  version: '1.0.0',
  priority: 80,
  category: 'nsfw',
  description: '现代纪元酒吧 NSFW 系统：醉酒、暧昧、危机、陪酒服务等多类型酒吧场景体验',
  masterToggleKey: '启用酒吧NSFW系统',
  dependencies: [],
  defaultSettings: {
    启用: false,
    内容强度: '暧昧',
    启用醉酒系统: true,
    启用危机事件: true,
    启用陪酒服务: false,
    尺度上限: '点到为止',
  },
  normalizeSettings: (raw) => ({
    启用: Boolean(raw.启用) ?? false,
    内容强度: (raw.内容强度 as any) || '暧昧',
    启用醉酒系统: Boolean(raw.启用醉酒系统) ?? true,
    启用危机事件: Boolean(raw.启用危机事件) ?? true,
    启用陪酒服务: Boolean(raw.启用陪酒服务) ?? false,
    尺度上限: (raw.尺度上限 as any) || '点到为止',
  }),
  extractPromptParams: 提取酒吧参数,
  buildPromptFragment: (params) => {
    return 生成酒吧叙事约束({
      酒吧类型: params.酒吧类型 as any,
      醉酒程度: params.醉酒程度 as any,
      内容强度: params.内容强度,
      场所档次: params.场所档次 as any,
      在场NPC: params.在场NPC摘要 ? params.在场NPC摘要.split('、') : [],
      当前事件: params.当前事件 as any,
    });
  },
  responseTag: '酒吧NSFW状态',
};

故事模块注册表.注册模块(酒吧NSFW模块);
