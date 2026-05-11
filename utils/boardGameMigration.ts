/**
 * 桌游社交 NSFW 系统 — 存档迁移
 *
 * 将旧版 campusNSFW 中的桌游设置映射到新的独立系统设置
 */

import type { 桌游社交NSFW设置 } from '../models/boardGameNSFW';
import { 默认桌游社交NSFW设置 } from '../models/boardGameNSFW';

interface 旧校园NSFW设置 {
  启用桌游NSFW?: boolean;
  桌游NSFW强度?: string;
  启用密室逃脱NSFW?: boolean;
  启用狼人杀NSFW?: boolean;
  启用剧本杀NSFW?: boolean;
  启用派对游戏NSFW?: boolean;
  桌游触发频率?: string;
}

/**
 * 从旧版校园 NSFW 设置迁移到新版桌游社交 NSFW 系统设置
 */
export function 迁移桌游设置(旧设置: 旧校园NSFW设置 | undefined): 桌游社交NSFW设置 | undefined {
  if (!旧设置) return undefined;

  const 有桌游数据 =
    旧设置.启用桌游NSFW !== undefined ||
    旧设置.启用密室逃脱NSFW !== undefined;

  if (!有桌游数据) return undefined;

  const 强度映射: Record<string, '关闭' | '轻度' | '中度' | '深度'> = {
    '关闭': '关闭',
    '轻度': '轻度',
    '中度': '中度',
    '深度': '深度',
  };

  const 基础开关 = 旧设置.启用桌游NSFW || false;

  return {
    ...默认桌游社交NSFW设置,
    启用桌游社交NSFW系统: 基础开关,
    桌游社交NSFW强度: 强度映射[旧设置.桌游NSFW强度 || '中度'] || '中度',
    启用密室逃脱NSFW: 旧设置.启用密室逃脱NSFW ?? 基础开关,
    启用狼人杀NSFW: 旧设置.启用狼人杀NSFW ?? 基础开关,
    启用剧本杀NSFW: 旧设置.启用剧本杀NSFW ?? 基础开关,
    启用派对游戏NSFW: 旧设置.启用派对游戏NSFW ?? 基础开关,
    桌游触发频率: (旧设置.桌游触发频率 as '低' | '中' | '高') || '中',
  };
}
