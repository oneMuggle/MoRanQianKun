/**
 * NSFW 后果系统 — 后果引擎
 * 创建/应用/衰减/清除后果条目
 */

import type {
  后果条目,
  后果类型,
  后果持续时间,
  后果严重程度,
  后果系统状态,
} from './types';

const 持续回合映射: Record<后果持续时间, number> = {
  '短期': 5,
  '中期': 20,
  '长期': 50,
  '永久': Infinity,
};

let _seq = 0;
function 生成ID(): string {
  return `conseq_${Date.now()}_${++_seq}`;
}

// ==================== 初始化 ====================

export function 初始化后果状态(): 后果系统状态 {
  return {
    后果列表: [],
    记忆锚点: [],
    心理状态: {
      羞耻度: 10,
      麻木度: 0,
      依赖度: 0,
      冒险倾向: 5,
      后悔度: 5,
      最后更新时间: '',
    },
    心理变化日志: [],
    蝴蝶效应: [],
    最后更新时间: '',
  };
}

// ==================== 后果管理 ====================

export function 创建后果(
  状态: 后果系统状态,
  配置: {
    类型: 后果类型;
    描述: string;
    严重程度: 后果严重程度;
    持续时间: 后果持续时间;
    涉及NPC: string[];
    来源事件: string;
    游戏时间: string;
  }
): 后果条目 {
  const 回合上限 = 持续回合映射[配置.持续时间];
  const 后果: 后果条目 = {
    id: 生成ID(),
    类型: 配置.类型,
    描述: 配置.描述,
    严重程度: 配置.严重程度,
    持续时间: 配置.持续时间,
    生效时间: 配置.游戏时间,
    剩余回合: 回合上限 === Infinity ? undefined : 回合上限,
    涉及NPC: 配置.涉及NPC,
    来源事件: 配置.来源事件,
  };

  if (配置.持续时间 !== '永久') {
    后果.过期时间 = 计算过期时间(配置.游戏时间, 回合上限);
  }

  状态.后果列表.push(后果);
  状态.最后更新时间 = 配置.游戏时间;

  if (状态.后果列表.length > 20) {
    状态.后果列表 = 状态.后果列表.filter(c =>
      c.持续时间 === '永久' || c.剩余回合 === undefined || c.剩余回合 > 0
    ).slice(-20);
  }

  return 后果;
}

export function 获取活跃后果(
  状态: 后果系统状态,
  npc姓名?: string,
  类型过滤?: 后果类型
): 后果条目[] {
  return 状态.后果列表.filter(c => {
    if (c.剩余回合 !== undefined && c.剩余回合 <= 0) return false;
    if (类型过滤 && c.类型 !== 类型过滤) return false;
    if (npc姓名 && !c.涉及NPC.includes(npc姓名)) return false;
    return true;
  });
}

export function 应用后果衰减(
  状态: 后果系统状态,
  游戏时间: string
): 后果条目[] {
  const 过期: 后果条目[] = [];

  for (const 后果 of 状态.后果列表) {
    if (后果.持续时间 === '永久') continue;
    if (后果.剩余回合 === undefined) continue;
    后果.剩余回合--;
    if (后果.剩余回合 <= 0) 过期.push(后果);
  }

  状态.最后更新时间 = 游戏时间;
  return 过期;
}

// ==================== 辅助函数 ====================

function 计算过期时间(游戏时间: string, 回合数: number): string {
  const parts = 游戏时间.split(':');
  if (parts.length < 5) return 游戏时间;

  const 数字 = parts.map(Number);
  if (数字.some(n => isNaN(n))) return 游戏时间;

  const [年, 月, 日, 时, 分] = 数字;
  let 总分 = 年 * 12 * 30 * 24 * 60 + 月 * 30 * 24 * 60 + 日 * 24 * 60 + 时 * 60 + 分;
  总分 += 回合数 * 30;

  const 新分 = 总分 % 60;
  const 总时 = Math.floor(总分 / 60);
  const 新时 = 总时 % 24;
  const 总日 = Math.floor(总时 / 24);
  const 新日 = (总日 % 30) + 1;
  const 总月 = Math.floor(总日 / 30);
  const 新月 = (总月 % 12) + 1;
  const 新年 = Math.floor(总月 / 12);

  return `${新年}:${新月}:${新日}:${新时}:${新分}`;
}

export function 生成后果摘要(
  状态: 后果系统状态,
  npc姓名?: string
): string | null {
  const 活跃 = 获取活跃后果(状态, npc姓名);
  if (活跃.length === 0) return null;

  const 文本 = 活跃
    .map(c => {
      const 剩余 = c.剩余回合 !== undefined ? `(剩余${c.剩余回合}回合)` : '(永久)';
      return `[${c.类型}]${c.描述}${剩余}`;
    })
    .join('；');

  return `活跃后果：${文本}`;
}
