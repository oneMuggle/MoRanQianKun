/**
 * NSFW 跨模块联动 — NPC 跨场景记忆追踪
 */

import type { NPC跨模块记忆, 态度类型, 跨模块联动状态, 引擎类型 } from './types';

let _seq = 0;
function 生成ID(): string {
  return `mem_${Date.now()}_${++_seq}`;
}

export function 记录跨模块记忆(
  状态: 跨模块联动状态,
  配置: {
    npc姓名: string;
    源引擎: 引擎类型;
    事件: string;
    事件描述: string;
    严重程度: number;
    态度: 态度类型;
    影响行为?: string[];
    时间戳: string;
  }
): NPC跨模块记忆 {
  if (!状态.npc记忆[配置.npc姓名]) 状态.npc记忆[配置.npc姓名] = [];

  const 记忆: NPC跨模块记忆 = {
    id: 生成ID(),
    源引擎: 配置.源引擎,
    事件: 配置.事件,
    事件描述: 配置.事件描述,
    时间戳: 配置.时间戳,
    严重程度: 配置.严重程度,
    态度: 配置.态度,
    记忆强度: Math.min(100, 配置.严重程度 * 20),
    衰减速率: 计算衰减速率(配置.态度),
    影响行为: 配置.影响行为 ?? [],
  };

  状态.npc记忆[配置.npc姓名].push(记忆);
  if (状态.npc记忆[配置.npc姓名].length > 20) {
    状态.npc记忆[配置.npc姓名].sort((a, b) => b.记忆强度 - a.记忆强度);
    状态.npc记忆[配置.npc姓名] = 状态.npc记忆[配置.npc姓名].slice(0, 20);
  }
  状态.最后更新时间 = 配置.时间戳;
  return 记忆;
}

function 计算衰减速率(态度: 态度类型): number {
  switch (态度) {
    case '厌恶': return 1;
    case '威胁': return 0.5;
    case '亲近': return 3;
    case '好奇': return 2;
    case '疏离': return 1.5;
    default: return 2;
  }
}

export function 应用跨模块记忆衰减(状态: 跨模块联动状态, 游戏时间: string): void {
  for (const [npc姓名, 列表] of Object.entries(状态.npc记忆)) {
    for (const m of 列表) {
      if (m.记忆强度 > 5) m.记忆强度 = Math.max(0, m.记忆强度 - m.衰减速率);
    }
    状态.npc记忆[npc姓名] = 列表.filter(m => m.记忆强度 > 5);
  }
  状态.最后更新时间 = 游戏时间;
}

export function 获取主导态度(
  状态: 跨模块联动状态,
  npc姓名: string,
  引擎过滤?: 引擎类型
): { 态度: 态度类型; 强度: number } | null {
  const 记忆 = 状态.npc记忆[npc姓名];
  if (!记忆?.length) return null;

  const 过滤后 = 引擎过滤 ? 记忆.filter(m => m.源引擎 === 引擎过滤) : 记忆;
  if (!过滤后.length) return null;

  const 权重: Record<态度类型, number> = { '亲近': 0, '疏离': 0, '厌恶': 0, '好奇': 0, '威胁': 0, '中立': 0 };
  for (const m of 过滤后) 权重[m.态度] += m.记忆强度;
  const [主导, 强度] = Object.entries(权重).reduce<[string, number]>((max, [k, v]) => v > max[1] ? [k, v] : max, ['中立', 0]);
  return { 态度: 主导 as 态度类型, 强度 };
}

export function 生成跨模块记忆摘要(状态: 跨模块联动状态, npc姓名: string): string | null {
  const 记忆 = 状态.npc记忆[npc姓名];
  if (!记忆?.length) return null;
  const 强记忆 = 记忆.filter(m => m.记忆强度 >= 30).slice(0, 3);
  if (!强记忆.length) return null;
  return `跨模块记忆：${强记忆.map(m => `[${m.源引擎}]${m.事件描述}(${m.态度}, 强度${Math.round(m.记忆强度)})`).join('；')}`;
}
