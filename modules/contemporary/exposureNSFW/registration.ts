// 露出 NSFW 独立模块注册

import type { StoryModule, 游戏状态快照 } from '../../../utils/storyModule/types';
import { 故事模块注册表 } from '../../../utils/storyModule/registry';
import type { ExposureNSFW设置 } from '../../../models/exposureNSFW';
import { 默认ExposureNSFW设置 } from '../../../models/exposureNSFW';
import { 构建Exposure完整叙事约束 } from '../../../prompts/runtime/exposureNSFW';

// ==================== 运行时参数 ====================

interface Exposure运行时参数 {
  露出偏好等级: number;
  紧张度: number;
  有旁观者: boolean;
  网络流言等级: number;
  有无证据: boolean;
}

// ==================== 参数提取 ====================

function 提取Exposure参数(
  gameState: 游戏状态快照,
  _settings: ExposureNSFW设置
): Exposure运行时参数 | null {
  const 校园系统 = gameState.校园系统 as Record<string, unknown> | undefined;
  if (!校园系统) return null;

  // 优先从独立 Exposure 系统读取
  const Exposure系统 = 校园系统.Exposure系统 as Record<string, unknown> | undefined;
  const 露出档案 = Exposure系统?.露出档案 as Record<string, any> | undefined;

  // 兼容：也从旧路径读取
  const 欲望系统 = 校园系统.欲望系统 as Record<string, unknown> | undefined;
  const NPC欲望档案 = 欲望系统?.NPC欲望档案 as Record<string, any> | undefined;

  let 最高露出等级 = 0;
  let 最高紧张度 = 0;
  let 有旁观者 = false;
  let 最高网络流言等级 = 0;
  let 有无证据 = false;

  if (露出档案) {
    for (const [, profile] of Object.entries(露出档案)) {
      const p = profile as any;
      if (p.露出状态?.当前等级 > 最高露出等级) 最高露出等级 = p.露出状态.当前等级;
      if (p.紧张度状态?.当前值 > 最高紧张度) 最高紧张度 = p.紧张度状态.当前值;
      if (p.网络流言?.当前等级 > 最高网络流言等级) 最高网络流言等级 = p.网络流言.当前等级;
      if (p.网络流言?.有无证据) 有无证据 = true;
    }
  }

  if (NPC欲望档案) {
    for (const [, npc] of Object.entries(NPC欲望档案)) {
      const n = npc as any;
      if (n.露出状态?.当前等级 > 最高露出等级) 最高露出等级 = n.露出状态.当前等级;
      if (n.紧张度状态?.当前值 > 最高紧张度) 最高紧张度 = n.紧张度状态.当前值;
      if (n.网络流言?.当前等级 > 最高网络流言等级) 最高网络流言等级 = n.网络流言.当前等级;
      if (n.网络流言?.有无证据) 有无证据 = true;
    }
  }

  const 旁观者记录 = (Exposure系统?.旁观者记录 as any[]) ?? (欲望系统?.旁观者记录 as any[]) ?? [];
  if (旁观者记录.length > 0) {
    有旁观者 = 旁观者记录.some((b: any) => b.已察觉);
  }

  if (最高露出等级 === 0 && 最高紧张度 === 0 && 最高网络流言等级 === 0) return null;

  return {
    露出偏好等级: 最高露出等级,
    紧张度: 最高紧张度,
    有旁观者,
    网络流言等级: 最高网络流言等级,
    有无证据,
  };
}

// ==================== 提示词构建 ====================

function 构建Exposure叙事约束(params: Exposure运行时参数): string {
  return 构建Exposure完整叙事约束({
    露出偏好等级: params.露出偏好等级 as any,
    紧张度: params.紧张度,
    有旁观者: params.有旁观者,
    网络流言等级: params.网络流言等级,
    有无证据: params.有无证据,
  });
}

// ==================== 模块注册 ====================

const exposureNSFW模块: StoryModule<ExposureNSFW设置, Exposure运行时参数> = {
  id: 'exposureNSFW',
  name: '露出NSFW',
  eraId: 'contemporary',
  version: '1.0.0',
  priority: 70,
  category: 'nsfw',
  description: '露出 NSFW 独立系统：紧张度、旁观者、网络传播',
  masterToggleKey: '启用露出系统',
  dependencies: [],
  defaultSettings: 默认ExposureNSFW设置,
  normalizeSettings: (raw: Partial<ExposureNSFW设置>) => ({
    ...默认ExposureNSFW设置,
    ...raw,
  }),
  extractPromptParams: 提取Exposure参数,
  buildPromptFragment: (params) => 构建Exposure叙事约束(params),
  responseTag: 'Exposure状态更新',
};

故事模块注册表.注册模块(exposureNSFW模块);
