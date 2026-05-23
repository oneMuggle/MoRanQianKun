/**
 * 流言引擎 — Gossip System
 * NSFW 事件触发流言生成、通过社交网络传播、影响 NPC 态度
 */

import type { 流言, 社交网络状态 } from './socialNetwork';

// ==================== 流言类别 ====================

export type 流言类别 =
  | '亲密传闻'
  | '行为曝光'
  | '性格评价'
  | '地点关联'
  | '关系变化';

export interface NSFW事件 {
  事件类型: string;
  事件描述: string;
  地点: string;
  在场NPC: string[];
  时间: string;
  严重程度: number;
}

// ==================== 流言生成 ====================

export function 生成流言(
  事件: NSFW事件,
  社交网络: 社交网络状态,
  生成数量: number = 1
): 流言[] {
  const 流言列表: 流言[] = [];

  for (let i = 0; i < 生成数量; i++) {
    const 严重度映射: Record<number, 流言['严重度']> = {
      1: '轻微', 2: '轻微', 3: '中等', 4: '严重', 5: '毁灭性',
    };
    const 严重度 = 严重度映射[事件.严重程度] ?? '轻微';
    const 传播速度 = 0.1 + 事件.严重程度 * 0.1;

    流言列表.push({
      id: `gossip_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      内容: 生成流言内容(事件),
      创建时间: new Date().toISOString(),
      传播范围: [...事件.在场NPC],
      传播速度,
      严重度,
      影响值: -事件.严重程度 * 10,
      真实度: 0.7 + Math.random() * 0.3,
      来源NPC: 事件.在场NPC[1] ?? undefined,
      目标NPC: 事件.在场NPC[0] ?? '',
      已传播回合数: 0,
      最大传播回合: 5 + 事件.严重程度 * 3,
    });
  }

  return 流言列表;
}

function 生成流言内容(事件: NSFW事件): string {
  const 地点 = 事件.地点 || '某处';
  const 类别 = 推断流言类别(事件);
  const 模板库: Record<流言类别, string[]> = {
    '亲密传闻': [
      `听说${地点}有人看到当事者举止暧昧`,
      `${地点}附近，似乎和某人有特殊关系`,
    ],
    '行为曝光': [
      `${地点}发生了不雅事件，有人被卷入其中`,
      `有人在${地点}目睹了不当行为`,
    ],
    '性格评价': [
      `当事者在${地点}的表现令人意外`,
      `关于当事人的为人，有人有不同的看法`,
    ],
    '地点关联': [
      `当事者经常在${地点}出现`,
      `有人在${地点}多次看到当事者`,
    ],
    '关系变化': [
      `当事者的态度发生了明显变化`,
      `双方的关系似乎有了转折`,
    ],
  };
  const 模板 = (模板库[类别] ?? 模板库['关系变化'])[0];
  return 模板;
}

function 推断流言类别(事件: NSFW事件): 流言类别 {
  if (事件.事件类型.includes('暴露') || 事件.事件类型.includes('公共')) return '行为曝光';
  if (事件.事件类型.includes('亲密') || 事件.事件类型.includes('关系')) return '亲密传闻';
  return '关系变化';
}

// ==================== 流言传播 ====================

export function 传播流言(
  社交网络: 社交网络状态,
  回合数: number = 1
): 社交网络状态 {
  if (社交网络.流言列表.length === 0) return 社交网络;

  const 新流言列表: 流言[] = [];

  for (const 旧流言 of 社交网络.流言列表) {
    let 流言 = { ...旧流言 };

    for (let i = 0; i < 回合数; i++) {
      if (流言.已传播回合数 >= 流言.最大传播回合) break;

      // 通过社交关系传播
      const 知情人 = 流言.传播范围;
      const 新传播对象: string[] = [];

      for (const 知情人ID of 知情人) {
        const 关系 = 社交网络.关系列表.filter(r =>
          r.目标NPCID === 知情人ID && r.信任度 > 40
        );
        for (const rel of 关系) {
          if (!流言.传播范围.includes(rel.目标NPCID) && Math.random() < rel.信任度 / 200) {
            新传播对象.push(rel.目标NPCID);
          }
        }
      }

      // 通用传播概率
      for (const npcId of 新传播对象) {
        if (!流言.传播范围.includes(npcId) && Math.random() < 流言.传播速度) {
          流言 = {
            ...流言,
            传播范围: [...流言.传播范围, npcId],
          };
        }
      }

      流言 = { ...流言, 已传播回合数: 流言.已传播回合数 + 1 };
    }

    // 超过最大回合+3后自动消散
    if (流言.已传播回合数 < 流言.最大传播回合 + 3) {
      新流言列表.push(流言);
    }
  }

  return {
    ...社交网络,
    流言列表: 新流言列表,
    最后更新时间: new Date().toISOString(),
  };
}

// ==================== 态度影响 ====================

export interface 态度变化 {
  npcId: string;
  目标NPC: string;
  变化原因: string;
  好感度变化: number;
}

export function 应用流言影响(
  社交网络: 社交网络状态,
  目标NPCID: string
): 态度变化[] {
  const 变化列表: 态度变化[] = [];
  const 相关流言 = 社交网络.流言列表.filter(r =>
    r.目标NPC === 目标NPCID && r.传播范围.length > 0
  );

  for (const 流言 of 相关流言) {
    for (const 知情人 of 流言.传播范围) {
      if (知情人 === 目标NPCID) continue;
      const 影响值 = 流言.影响值 * 流言.真实度 * 0.1;
      if (Math.abs(影响值) > 1) {
        变化列表.push({
          npcId: 知情人,
          目标NPC: 目标NPCID,
          变化原因: `流言：${流言.内容.substring(0, 20)}…`,
          好感度变化: Math.round(影响值),
        });
      }
    }
  }

  return 变化列表;
}

// ==================== 流言衰减 ====================

export function 衰减流言(
  社交网络: 社交网络状态,
  回合数: number = 1
): 社交网络状态 {
  const 新流言列表 = 社交网络.流言列表
    .map(流言 => ({
      ...流言,
      真实度: Math.max(0.1, 流言.真实度 - 0.02 * 回合数),
      传播速度: Math.max(0.01, 流言.传播速度 - 0.01 * 回合数),
    }))
    .filter(r => r.真实度 > 0.05);

  return {
    ...社交网络,
    流言列表: 新流言列表,
    最后更新时间: new Date().toISOString(),
  };
}

// ==================== 工具函数 ====================

export function 生成流言摘要(
  社交网络: 社交网络状态,
  目标NPC?: string
): string {
  const 相关流言 = 目标NPC
    ? 社交网络.流言列表.filter(r => r.目标NPC === 目标NPC)
    : 社交网络.流言列表;

  if (相关流言.length === 0) return '';

  const 活跃流言 = 相关流言.filter(r => r.已传播回合数 < r.最大传播回合);
  if (活跃流言.length === 0) return '';

  const 摘要 = 活跃流言.slice(0, 3).map(r =>
    `${r.严重度}流言（${r.内容.substring(0, 30)}…，${r.传播范围.length}人知晓）`
  );

  return `【流言】${摘要.join('；')}`;
}
