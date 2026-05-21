/**
 * NSFW 后果系统 — 记忆锚点
 * 创建/衰减/强化/查询 NSFW 记忆锚点
 */

import type { 记忆锚点, 情感标签, 后果系统状态 } from './types';

let _seq = 0;
function 生成ID(): string {
  return `anchor_${Date.now()}_${++_seq}`;
}

export function 创建记忆锚点(
  状态: 后果系统状态,
  配置: {
    事件类型: string;
    事件描述: string;
    涉及NPC: string[];
    情感标签: 情感标签[];
    初始强度?: number;
    衰减速率?: number;
    是否核心记忆?: boolean;
    游戏时间: string;
  }
): 记忆锚点 {
  const 锚点: 记忆锚点 = {
    id: 生成ID(),
    事件类型: 配置.事件类型,
    事件描述: 配置.事件描述,
    涉及NPC: 配置.涉及NPC,
    情感标签: 配置.情感标签,
    当前强度: 配置.初始强度 ?? 80,
    衰减速率: 配置.衰减速率 ?? 2,
    创建时间: 配置.游戏时间,
    最后激活时间: 配置.游戏时间,
    是否核心记忆: 配置.是否核心记忆 ?? false,
  };

  状态.记忆锚点.push(锚点);
  状态.最后更新时间 = 配置.游戏时间;

  if (状态.记忆锚点.length > 30) {
    状态.记忆锚点.sort((a, b) => {
      if (a.是否核心记忆 && !b.是否核心记忆) return -1;
      if (!a.是否核心记忆 && b.是否核心记忆) return 1;
      return b.当前强度 - a.当前强度;
    });
    状态.记忆锚点 = 状态.记忆锚点.slice(0, 30);
  }

  return 锚点;
}

export function 应用记忆衰减(
  状态: 后果系统状态,
  游戏时间: string
): 记忆锚点[] {
  const 已淡化: 记忆锚点[] = [];

  for (const 锚点 of 状态.记忆锚点) {
    if (锚点.是否核心记忆) continue;
    锚点.当前强度 = Math.max(0, 锚点.当前强度 - 锚点.衰减速率);
    if (锚点.当前强度 <= 5) 已淡化.push(锚点);
  }

  状态.最后更新时间 = 游戏时间;
  return 已淡化;
}

export function 强化记忆(
  状态: 后果系统状态,
  锚点Id: string,
  增量: number = 20,
  游戏时间: string
): 记忆锚点 | null {
  const 锚点 = 状态.记忆锚点.find(a => a.id === 锚点Id);
  if (!锚点) return null;

  锚点.当前强度 = Math.min(100, 锚点.当前强度 + 增量);
  锚点.最后激活时间 = 游戏时间;
  return 锚点;
}

export function 获取相关记忆(
  状态: 后果系统状态,
  npc姓名: string,
  最低强度: number = 20
): 记忆锚点[] {
  return 状态.记忆锚点
    .filter(a => a.涉及NPC.includes(npc姓名) && a.当前强度 >= 最低强度)
    .sort((a, b) => b.当前强度 - a.当前强度)
    .slice(0, 10);
}

export function 获取情感记忆(
  状态: 后果系统状态,
  情感: 情感标签,
  最低强度: number = 30
): 记忆锚点[] {
  return 状态.记忆锚点
    .filter(a => a.情感标签.includes(情感) && a.当前强度 >= 最低强度)
    .sort((a, b) => b.当前强度 - a.当前强度);
}

export function 生成记忆摘要(
  状态: 后果系统状态,
  npc姓名?: string
): string | null {
  const 相关 = npc姓名
    ? 获取相关记忆(状态, npc姓名)
    : 状态.记忆锚点.filter(a => a.当前强度 >= 30).slice(0, 5);

  if (相关.length === 0) return null;

  const 文本 = 相关
    .map(a => `${a.事件描述}(${a.情感标签.join('+')}, 强度${a.当前强度})`)
    .join('；');

  return `记忆锚点：${文本}`;
}
