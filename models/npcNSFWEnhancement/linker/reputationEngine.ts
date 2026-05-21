/**
 * NSFW 跨模块联动 — 全局声誉引擎
 */

import type { NPC声誉状态, 声誉条目, 声誉影响方向, 流言等级, 跨模块联动状态 } from './types';

let _seq = 0;
function 生成ID(): string {
  return `rep_${Date.now()}_${++_seq}`;
}

export function 初始化声誉状态(时间戳: string = ''): NPC声誉状态 {
  return { 当前评分: 0, 流言等级: 0, 声誉历史: [], 最后更新时间: 时间戳 };
}

export function 更新声誉(
  状态: 跨模块联动状态,
  npc姓名: string,
  配置: {
    来源事件: string;
    描述: string;
    影响方向: 声誉影响方向;
    影响值: number;
    时间戳: string;
    过期回合?: number;
  }
): 声誉条目 {
  if (!状态.npc声誉[npc姓名]) 状态.npc声誉[npc姓名] = 初始化声誉状态(配置.时间戳);

  const 条目: 声誉条目 = {
    id: 生成ID(),
    来源事件: 配置.来源事件,
    描述: 配置.描述,
    影响方向: 配置.影响方向,
    影响值: 配置.影响值,
    时间戳: 配置.时间戳,
    过期回合: 配置.过期回合,
    剩余回合: 配置.过期回合,
  };

  const 声誉 = 状态.npc声誉[npc姓名];
  声誉.声誉历史.push(条目);

  const 活跃 = 声誉.声誉历史.filter(e => e.剩余回合 === undefined || e.剩余回合 > 0);
  声誉.当前评分 = clamp(活跃.reduce((s, e) => s + (e.影响方向 === '负面' ? -e.影响值 : e.影响值), 0), -100, 100);
  声誉.流言等级 = 计算流言等级(声誉.当前评分, 活跃.length);

  if (声誉.声誉历史.length > 30) 声誉.声誉历史 = 声誉.声誉历史.slice(-30);
  声誉.最后更新时间 = 配置.时间戳;
  状态.最后更新时间 = 配置.时间戳;
  return 条目;
}

function 计算流言等级(评分: number, 事件数: number): 流言等级 {
  const 绝对分 = Math.abs(评分);
  if (绝对分 >= 80 || 事件数 >= 15) return 5;
  if (绝对分 >= 60 || 事件数 >= 10) return 4;
  if (绝对分 >= 40 || 事件数 >= 7) return 3;
  if (绝对分 >= 20 || 事件数 >= 4) return 2;
  if (绝对分 >= 5 || 事件数 >= 1) return 1;
  return 0;
}

export function 应用声誉衰减(状态: 跨模块联动状态, 游戏时间: string): void {
  for (const [, 声誉] of Object.entries(状态.npc声誉)) {
    for (const 条目 of 声誉.声誉历史) {
      if (条目.剩余回合 !== undefined && 条目.剩余回合 > 0) 条目.剩余回合--;
    }
    const 活跃 = 声誉.声誉历史.filter(e => e.剩余回合 === undefined || e.剩余回合 > 0);
    声誉.当前评分 = clamp(活跃.reduce((s, e) => s + (e.影响方向 === '负面' ? -e.影响值 : e.影响值), 0), -100, 100);
    声誉.流言等级 = 计算流言等级(声誉.当前评分, 活跃.length);
    声誉.最后更新时间 = 游戏时间;
  }
  状态.最后更新时间 = 游戏时间;
}

export function 获取声誉状态(状态: 跨模块联动状态, npc姓名: string): NPC声誉状态 | null {
  return 状态.npc声誉[npc姓名] ?? null;
}

export function 获取高流言NPC(
  状态: 跨模块联动状态,
  最低等级: 流言等级 = 3
): Array<{ npc姓名: string; 声誉: NPC声誉状态 }> {
  return Object.entries(状态.npc声誉)
    .filter(([, r]) => r.流言等级 >= 最低等级)
    .map(([n, r]) => ({ npc姓名: n, 声誉: r }));
}

export function 生成声誉摘要(状态: 跨模块联动状态, npc姓名: string): string | null {
  const 声誉 = 状态.npc声誉[npc姓名];
  if (!声誉) return null;
  const parts: string[] = [`声誉评分${声誉.当前评分}`];
  if (声誉.流言等级 > 0) parts.push(`流言等级${声誉.流言等级}`);
  const 负面 = 声誉.声誉历史.filter(e => e.影响方向 === '负面' && (e.剩余回合 === undefined || e.剩余回合 > 0));
  if (负面.length) parts.push(`负面事件${负面.length}条`);
  return `声誉状态：${parts.join('，')}`;
}

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}
