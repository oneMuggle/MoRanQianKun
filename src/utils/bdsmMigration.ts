/**
 * BDSM 独立系统 — 存档迁移
 *
 * 将旧版 campusNSFW 中的 BDSM 设置映射到新的独立系统设置
 */

import type { BDSM系统设置 } from '../models/bdsmNSFW';
import { 默认BDSM系统设置 } from '../models/bdsmNSFW';

interface 旧校园NSFW设置 {
  启用SM系统?: boolean;
  SM内容强度?: string;
  启用契约系统?: boolean;
  启用公开服从?: boolean;
  权力天平初始倾向?: string;
  启用BDSM论坛?: boolean;
  BDSM内容强度?: string;
  启用BDSM_NPC影响?: boolean;
  启用BDSM_流言传播?: boolean;
  启用BDSM关系管线?: boolean;
  启用BDSM调教任务?: boolean;
  启用BDSM契约系统?: boolean;
  启用BDSM见面预约?: boolean;
}

/**
 * 从旧版校园 NSFW 设置迁移到新版 BDSM 独立系统设置
 */
export function 迁移BDSM设置(旧设置: 旧校园NSFW设置 | undefined): BDSM系统设置 | undefined {
  if (!旧设置) return undefined;

  const 有BDSM数据 =
    旧设置.启用SM系统 !== undefined ||
    旧设置.启用BDSM关系管线 !== undefined ||
    旧设置.启用BDSM调教任务 !== undefined;

  if (!有BDSM数据) return undefined;

  const 强度映射: Record<string, '关闭' | '轻度' | '中度' | '深度'> = {
    '关闭': '关闭',
    '轻度': '轻度',
    '中度': '中度',
    '深度': '深度',
  };

  const 基础开关 = 旧设置.启用SM系统 || false;

  return {
    ...默认BDSM系统设置,
    启用BDSM独立系统: 基础开关,
    BDSM内容强度: 强度映射[旧设置.SM内容强度 || 旧设置.BDSM内容强度 || '轻度'] || '轻度',
    启用BDSM论坛: 旧设置.启用BDSM论坛 ?? 基础开关,
    启用BDSM调教任务: 旧设置.启用BDSM调教任务 ?? 基础开关,
    启用BDSM契约系统: 旧设置.启用BDSM契约系统 ?? 旧设置.启用契约系统 ?? 基础开关,
    启用BDSM见面预约: 旧设置.启用BDSM见面预约 ?? 基础开关,
    启用BDSM关系管线: 旧设置.启用BDSM关系管线 ?? 基础开关,
  };
}
