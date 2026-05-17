/**
 * NPC NSFW 增强模块 — 联动逻辑
 * 人格 → 性癖 → 敏感点 → 场景推荐的完整链路
 */

import { NPC结构 } from '../social';
import { 计算亲密度等级 } from '../intimacy';
import type { NPCNSFW画像, 性癖档案, 敏感点档案 } from './types';
import { 获取性癖推荐, 生成性癖摘要 } from './fetishTaxonomy';
import { 获取敏感点推荐, 生成敏感点摘要 } from './sensitiveZones';
import { 匹配人格档案, 解锁隐藏偏好 } from './personalityProfiles';

export function 生成NSFW画像(npc: NPC结构, eraId: string | null | undefined): NPCNSFW画像 {
  const 亲密度等级 = 计算亲密度等级(npc.好感度 ?? 0);

  const 人格 = 匹配人格档案(npc.核心性格特征, npc.身份, eraId);

  const 性癖 = 构建性癖档案(npc, 人格, eraId ?? '', 亲密度等级);

  const 敏感点 = 构建敏感点档案(npc, 人格, eraId ?? '');

  const 推荐场景 = 人格?.推荐场景 ?? 获取性癖推荐({ eraId, 最大条目数: 3 }).map(f => f.子类型);

  return { 人格, 性癖, 敏感点, 推荐场景 };
}

function 构建性癖档案(
  npc: NPC结构,
  人格: ReturnType<typeof 匹配人格档案>,
  eraId: string,
  亲密度等级: number
): 性癖档案 {
  if (npc.性癖档案) return npc.性癖档案;

  const 解锁的偏好 = 人格 ? 解锁隐藏偏好(人格, 亲密度等级) : [];
  const 推荐偏好 = 获取性癖推荐({
    eraId,
    人格标签: 人格?.身份标签,
    最大条目数: 3,
  });

  const 已有ID = new Set(解锁的偏好.map(p => p.子类型));
  const 补充 = 推荐偏好.filter(p => !已有ID.has(p.子类型));
  const 核心偏好 = [...解锁的偏好, ...补充].slice(0, 3);

  const 隐藏偏好 = 人格
    ? 人格.关联偏好.filter(p =>
        p.解锁条件 &&
        (p.解锁条件.类型 !== '亲密度阈值' || Number(p.解锁条件.值) > 亲密度等级)
      )
    : [];

  const 绝对禁忌: string[] = [];

  return {
    核心偏好,
    隐藏偏好,
    绝对禁忌,
    可协商: [],
    倾向摘要: 生成性癖摘要(核心偏好),
  };
}

function 构建敏感点档案(
  npc: NPC结构,
  人格: ReturnType<typeof 匹配人格档案>,
  eraId: string
): 敏感点档案 {
  if (npc.敏感点档案) return npc.敏感点档案;

  const 人格敏感点 = 人格?.关联敏感点 ?? [];
  const 推荐敏感点 = 获取敏感点推荐({ eraId, 最大条目数: 3 });

  const 主要敏感点 = [...人格敏感点];
  const 已有名称 = new Set(主要敏感点.map(p => p.名称));
  const 补充 = 推荐敏感点.filter(p => !已有名称.has(p.名称));
  主要敏感点.push(...补充.slice(0, Math.max(0, 4 - 主要敏感点.length)));

  return {
    主要敏感点: 主要敏感点.slice(0, 4),
    隐藏敏感点: [],
    弱点摘要: 生成敏感点摘要(主要敏感点.slice(0, 2)),
  };
}

export function 应启用增强档案(npc: NPC结构): boolean {
  return !!(npc.核心性格特征 || npc.身份 || npc.NSFW行为特征);
}

export function 自动填充NSFW档案(npc: NPC结构, eraId: string): Partial<NPC结构> {
  const 画像 = 生成NSFW画像(npc, eraId);

  return {
    性癖档案: 画像.性癖,
    敏感点档案: 画像.敏感点,
    人格档案: 画像.人格 ?? undefined,
    NSFW行为特征: npc.NSFW行为特征 ?? {
      主动程度: 画像.人格?.里.欲望驱动.some(d => d.includes('服从')) ? '被动承受' : '配合回应',
      反差偏好: 画像.人格?.里.性格描述,
      叙事锚点: 画像.人格?.里.反差触发器 ?? '',
    },
  };
}
