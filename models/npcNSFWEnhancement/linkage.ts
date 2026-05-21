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
import { 计算偏好漂移 } from './preferenceDrift';
import { 获取活跃后果 } from './consequences/consequenceEngine';
import { 初始化跨模块状态, 获取待执行联动 } from './linker/crossModuleLinker';

// ==================== 露出个性系数 ====================

/** 露出个性系数：由人格/性癖推导的露出倾向参数 */
export interface 露出个性系数 {
  冒险倾向: number;      // 0-100
  羞耻敏感度: number;    // 0-100
  刺激渴望: number;      // 0-100
  从众压力: number;      // 0-100
  关系信赖: number;      // 0-100
}

/**
 * 根据 NPC 的人格和性癖计算露出倾向系数
 */
export function 计算露出倾向(npc: NPC结构): 露出个性系数 {
  const 系数: 露出个性系数 = {
    冒险倾向: 30,
    羞耻敏感度: 50,
    刺激渴望: 20,
    从众压力: 40,
    关系信赖: 30,
  };

  const 人格 = 匹配人格档案(npc.核心性格特征, npc.身份, undefined);
  const 性癖 = npc.性癖档案;

  // 人格修正
  if (人格) {
    if (人格.里.反差触发器.includes('暴露')) {
      系数.冒险倾向 += 20;
      系数.刺激渴望 += 15;
    }
    if (npc.核心性格特征 && (npc.核心性格特征.includes('谨慎') || npc.核心性格特征.includes('保守'))) {
      系数.羞耻敏感度 += 20;
    }
    if (npc.身份 && (npc.身份.includes('侠') || npc.身份.includes('浪') || npc.身份.includes('游'))) {
      系数.刺激渴望 += 15;
      系数.从众压力 -= 10;
    }
  }

  // 性癖修正
  if (性癖) {
    for (const 偏好 of 性癖.核心偏好) {
      if (偏好.类别 === '暴露窥视') {
        系数.冒险倾向 += 偏好.强度 * 5;
        系数.刺激渴望 += 偏好.强度 * 3;
      }
      if (偏好.类别 === '公共冒险') {
        系数.冒险倾向 += 偏好.强度 * 4;
        系数.羞耻敏感度 -= 偏好.强度 * 3;
      }
    }
  }

  系数.冒险倾向 = clamp(系数.冒险倾向, 0, 100);
  系数.羞耻敏感度 = clamp(系数.羞耻敏感度, 0, 100);
  系数.刺激渴望 = clamp(系数.刺激渴望, 0, 100);
  系数.从众压力 = clamp(系数.从众压力, 0, 100);
  系数.关系信赖 = clamp(系数.关系信赖, 0, 100);

  return 系数;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function 生成NSFW画像(npc: NPC结构, eraId: string | null | undefined): NPCNSFW画像 {
  const 亲密度等级 = 计算亲密度等级(npc.好感度 ?? 0);

  const 人格 = 匹配人格档案(npc.核心性格特征, npc.身份, eraId);

  const 性癖 = 构建性癖档案(npc, 人格, eraId ?? '', 亲密度等级);

  const 敏感点 = 构建敏感点档案(npc, 人格, eraId ?? '');

  const 推荐场景 = 人格?.推荐场景 ?? 获取性癖推荐({ eraId, 最大条目数: 3 }).map(f => f.子类型);

  const 画像: NPCNSFW画像 = { 人格, 性癖, 敏感点, 推荐场景 };

  // --- 新增：注入演化数据 ---
  if (npc.完整演化状态?.心理防线) {
    画像.心理防线 = npc.完整演化状态.心理防线;
  }

  const 漂移结果 = 计算偏好漂移(npc);
  if (漂移结果.漂移方向) {
    画像.偏好漂移 = npc.完整演化状态?.偏好漂移 ?? null as any;
    // Ensure the drift data is up to date
    if (画像.偏好漂移) {
      画像.偏好漂移.漂移方向 = 漂移结果.漂移方向;
      画像.偏好漂移.漂移强度 = 漂移结果.漂移强度;
    }
  }

  if (npc.完整演化状态?.人格演化?.人格翻转历史?.length) {
    画像.人格翻转历史 = npc.完整演化状态.人格演化.人格翻转历史;
  }

  // --- 新增：注入孕产状态 ---
  if (npc.完整演化状态?.孕产演化 && npc.完整演化状态.孕产演化.当前阶段 !== '未受孕') {
    画像.孕产状态 = npc.完整演化状态.孕产演化;
  }

  // --- 新增：注入事后护理状态 ---
  if (npc.完整演化状态?.事后护理 && npc.完整演化状态.事后护理.当前情绪.length > 0) {
    画像.事后护理 = npc.完整演化状态.事后护理;
  }

  // --- 新增：注入后果数据 ---
  if (npc.完整演化状态?.后果系统) {
    const 活跃后果 = 获取活跃后果(npc.完整演化状态.后果系统, npc.姓名);
    if (活跃后果.length > 0) {
      画像.后果 = 活跃后果;
    }
  }

  // --- 新增：注入跨模块联动数据 ---
  const 跨模块状态 = npc.完整演化状态?.跨模块联动 ?? 初始化跨模块状态();
  const 待执行 = 获取待执行联动(跨模块状态);
  if (待执行.length > 0) {
    画像.待执行联动 = 待执行;
  }

  return 画像;
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
