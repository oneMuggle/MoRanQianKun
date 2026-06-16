/**
 * NSFW 跨模块联动 — 全局事件总线
 * 发布/订阅模式的事件分发
 */

import type { 跨模块事件, 事件监听器, 跨模块联动状态, 引擎类型 } from './types';

let _seq = 0;
function 生成ID(): string {
  return `event_${Date.now()}_${++_seq}`;
}

const 全局监听器: 事件监听器[] = [];

export function 发布事件(
  状态: 跨模块联动状态,
  配置: {
    源引擎: 引擎类型;
    事件类型: string;
    事件描述: string;
    涉及NPC: string[];
    严重程度: number;
    时间戳: string;
    标签?: string[];
  }
): 跨模块事件 {
  const 事件: 跨模块事件 = {
    id: 生成ID(),
    源引擎: 配置.源引擎,
    事件类型: 配置.事件类型,
    事件描述: 配置.事件描述,
    涉及NPC: 配置.涉及NPC,
    严重程度: Math.max(1, Math.min(5, 配置.严重程度)),
    时间戳: 配置.时间戳,
    标签: 配置.标签 ?? [],
    已传播: false,
  };

  状态.事件历史.push(事件);
  if (状态.事件历史.length > 50) {
    状态.事件历史 = 状态.事件历史.slice(-50);
  }
  状态.最后更新时间 = 配置.时间戳;
  return 事件;
}

export function 订阅事件(回调: 事件监听器): () => void {
  全局监听器.push(回调);
  return () => {
    const idx = 全局监听器.indexOf(回调);
    if (idx >= 0) 全局监听器.splice(idx, 1);
  };
}

export function 分发事件(事件: 跨模块事件): void {
  for (const 监听 of 全局监听器) {
    try { 监听(事件); } catch { /* ignore */ }
  }
}

export function 获取NPC相关事件(
  状态: 跨模块联动状态,
  npc姓名: string,
  数量: number = 10,
  引擎过滤?: 引擎类型
): 跨模块事件[] {
  return 状态.事件历史
    .filter(e => {
      if (!e.涉及NPC.includes(npc姓名)) return false;
      if (引擎过滤 && e.源引擎 !== 引擎过滤) return false;
      return true;
    })
    .sort((a, b) => b.时间戳.localeCompare(a.时间戳))
    .slice(0, 数量);
}

export function 获取引擎事件(
  状态: 跨模块联动状态,
  引擎: 引擎类型,
  数量: number = 20
): 跨模块事件[] {
  return 状态.事件历史
    .filter(e => e.源引擎 === 引擎)
    .sort((a, b) => b.时间戳.localeCompare(a.时间戳))
    .slice(0, 数量);
}

export function 获取标签事件(
  状态: 跨模块联动状态,
  标签: string,
  数量: number = 10
): 跨模块事件[] {
  return 状态.事件历史
    .filter(e => e.标签.includes(标签))
    .sort((a, b) => b.时间戳.localeCompare(a.时间戳))
    .slice(0, 数量);
}

export function 生成事件摘要(
  状态: 跨模块联动状态,
  npc姓名?: string
): string | null {
  const 事件 = npc姓名
    ? 获取NPC相关事件(状态, npc姓名, 3)
    : 状态.事件历史.slice(-3);

  if (事件.length === 0) return null;

  const 文本 = 事件
    .map(e => `[${e.源引擎}]${e.事件描述}(严重度${e.严重程度})`)
    .join('；');

  return `跨模块事件：${文本}`;
}
