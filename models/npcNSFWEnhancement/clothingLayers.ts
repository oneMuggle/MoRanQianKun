/**
 * NPC NSFW 增强模块 — 服装层次系统
 * 追踪服装层次移除顺序、损坏程度、污渍
 */

import { NPC结构, 服饰部位分类 } from '../social';
import type { 服装层次结构, 服装层次条目, 服装变更日志, 服装损坏程度 } from './types';

export type { 服装损坏程度, 服装层次条目, 服装层次结构, 服装变更日志 } from './types';

// ==================== 初始化 ====================

const 部位移除顺序: Record<服饰部位分类, number> = {
  '外套': 1, '鞋子': 2, '配饰': 2, '头饰': 2, '特殊': 3,
  '上衣': 3, '下着': 4, '袜子': 5, '内衣': 6, '内裤': 7,
};

export function 初始化服装层次(npc: NPC结构): 服装层次结构 | null {
  if (npc.性别 !== '女') return null;
  if (!npc.服饰档案) return null;
  if (!npc.完整演化状态) return null;

  if (!npc.完整演化状态.服装层次) {
    npc.完整演化状态.服装层次 = {
      层次: 构建初始层次(npc),
      变更日志: [],
      最后变更时间: '',
    };
  }
  return npc.完整演化状态.服装层次;
}

function 构建初始层次(npc: NPC结构): 服装层次条目[] {
  const 层次: 服装层次条目[] = [];
  if (!npc.服饰档案) return 层次;

  for (const [部位Key, 部位值] of Object.entries(npc.服饰档案)) {
    if (!部位值) continue;
    const 部位 = 部位Key as 服饰部位分类;
    层次.push({
      部位,
      名称: 部位值.名称,
      损坏程度: '完好',
      污渍: false,
      移除顺序: 部位移除顺序[部位] ?? 99,
    });
  }

  return 层次.sort((a, b) => a.移除顺序 - b.移除顺序);
}

// ==================== 核心操作 ====================

export function 移除服装层(
  npc: NPC结构,
  部位: 服饰部位分类,
  游戏时间: string,
  触发原因: string = '自然移除'
): boolean {
  const 层次结构 = 初始化服装层次(npc);
  if (!层次结构) return false;

  const 条目 = 层次结构.层次.find(e => e.部位 === 部位 && e.损坏程度 !== '移除');
  if (!条目) return false;

  const 旧状态 = `${条目.名称}(${条目.损坏程度})`;
  条目.损坏程度 = '移除';

  记录变更(层次结构, 部位, '移除', 旧状态, '移除', 游戏时间, 触发原因);
  return true;
}

export function 记录服装损坏(
  npc: NPC结构,
  部位: 服饰部位分类,
  损坏程度: 服装损坏程度,
  游戏时间: string,
  触发原因: string = '自然损坏'
): boolean {
  const 层次结构 = 初始化服装层次(npc);
  if (!层次结构) return false;

  const 条目 = 层次结构.层次.find(e => e.部位 === 部位 && e.损坏程度 !== '移除');
  if (!条目) return false;

  const 损坏等级: Record<import('./types').服装损坏程度, number> = {
    '完好': 0, '褶皱': 1, '凌乱': 2, '破损': 3, '撕裂': 4, '移除': 5,
  };
  if (损坏等级[损坏程度] <= 损坏等级[条目.损坏程度]) return false;

  const 旧状态 = `${条目.名称}(${条目.损坏程度})`;
  条目.损坏程度 = 损坏程度;

  记录变更(层次结构, 部位, '损坏', 旧状态, `${条目.名称}(${损坏程度})`, 游戏时间, 触发原因);
  return true;
}

export function 添加污渍(
  npc: NPC结构,
  部位: 服饰部位分类,
  游戏时间: string,
  触发原因: string = '自然污渍'
): boolean {
  const 层次结构 = 初始化服装层次(npc);
  if (!层次结构) return false;

  const 条目 = 层次结构.层次.find(e => e.部位 === 部位 && !e.污渍 && e.损坏程度 !== '移除');
  if (!条目) return false;

  条目.污渍 = true;
  记录变更(层次结构, 部位, '污渍', `${条目.名称}(干净)`, `${条目.名称}(污渍)`, 游戏时间, 触发原因);
  return true;
}

export function 重新穿着(
  npc: NPC结构,
  部位: 服饰部位分类,
  名称: string,
  游戏时间: string,
  触发原因: string = '重新穿着'
): boolean {
  const 层次结构 = 初始化服装层次(npc);
  if (!层次结构) return false;

  let 条目 = 层次结构.层次.find(e => e.部位 === 部位);
  if (条目) {
    const 旧状态 = `${条目.名称}(${条目.损坏程度})`;
    条目.名称 = 名称;
    条目.损坏程度 = '完好';
    条目.污渍 = false;
    记录变更(层次结构, 部位, '重新穿着', 旧状态, `${名称}(完好)`, 游戏时间, 触发原因);
  } else {
    层次结构.层次.push({
      部位, 名称, 损坏程度: '完好', 污渍: false,
      移除顺序: 部位移除顺序[部位] ?? 99,
    });
    记录变更(层次结构, 部位, '重新穿着', '无', `${名称}(完好)`, 游戏时间, 触发原因);
  }

  return true;
}

// ==================== 查询 ====================

export function 生成服装状态文本(npc: NPC结构): string | null {
  const 层次结构 = 初始化服装层次(npc);
  if (!层次结构 || 层次结构.层次.length === 0) return null;

  const 穿着中 = 层次结构.层次.filter(e => e.损坏程度 !== '移除');
  if (穿着中.length === 0) return '全身赤裸';

  const 文本 = 穿着中.map(e => {
    let 描述 = e.名称;
    if (e.污渍) 描述 += '(污渍)';
    if (e.损坏程度 !== '完好') 描述 += `(${e.损坏程度})`;
    return 描述;
  }).join('、');

  const 已移除 = 层次结构.层次.filter(e => e.损坏程度 === '移除');
  if (已移除.length > 0) {
    return `穿着：${文本} | 已褪去：${已移除.map(e => e.名称).join('、')}`;
  }

  return `穿着：${文本}`;
}

export function 获取剩余穿着数量(npc: NPC结构): number {
  const 层次结构 = 初始化服装层次(npc);
  if (!层次结构) return 0;
  return 层次结构.层次.filter(e => e.损坏程度 !== '移除').length;
}

export function 是否暴露(npc: NPC结构): boolean {
  const 层次结构 = 初始化服装层次(npc);
  if (!层次结构) return false;
  const 核心衣物 = 层次结构.层次.filter(e => ['内衣', '内裤'].includes(e.部位));
  return 核心衣物.every(e => e.损坏程度 === '移除' || e.损坏程度 === '撕裂');
}

// ==================== 初始化与同步 ====================

/**
 * 确保 NPC 的服装层次已初始化。
 * 如果 NPC 有服饰档案但服装层次不存在，自动创建。
 */
export function 确保服装层次已初始化(npc: NPC结构): boolean {
  if (npc.性别 !== '女') return false;
  if (!npc.服饰档案) return false;
  if (!npc.完整演化状态) return false;

  // 已存在则跳过
  if (npc.完整演化状态.服装层次) return true;

  初始化服装层次(npc);
  return !!npc.完整演化状态.服装层次;
}

/**
 * 将服饰档案与服装层次进行同步。
 * - 服饰档案中有但服装层次中缺失的部位 → 重新穿着
 * - 服装层次中有但服饰档案中已删除的部位 → 移除
 * - 名称不一致的部位 → 更新名称
 *
 * @param npc NPC 结构
 * @param 游戏时间 当前游戏时间字符串
 * @returns 是否发生了变更
 */
export function 同步服饰档案到层次(npc: NPC结构, 游戏时间: string): boolean {
  if (!确保服装层次已初始化(npc)) return false;

  const 层次结构 = npc.完整演化状态!.服装层次!;
  const 服饰档案 = npc.服饰档案!;
  let 有变更 = false;

  // 1. 遍历服饰档案，补齐服装层次中缺失的部位
  for (const [部位Key, 部位值] of Object.entries(服饰档案)) {
    if (!部位值) continue;
    const 部位 = 部位Key as 服饰部位分类;
    const 现有条目 = 层次结构.层次.find(e => e.部位 === 部位);

    if (!现有条目) {
      // 服装层次中不存在，添加
      层次结构.层次.push({
        部位,
        名称: 部位值.名称,
        损坏程度: '完好',
        污渍: false,
        移除顺序: 部位移除顺序[部位] ?? 99,
      });
      有变更 = true;
    } else if (现有条目.损坏程度 === '移除') {
      // 之前被移除了，但现在服饰档案中又有这个部位（重新穿着）
      现有条目.名称 = 部位值.名称;
      现有条目.损坏程度 = '完好';
      现有条目.污渍 = false;
      记录变更(层次结构, 部位, '重新穿着', '已移除', `${部位值.名称}(完好)`, 游戏时间, '服饰档案同步');
      有变更 = true;
    } else if (现有条目.名称 !== 部位值.名称) {
      // 名称变了（换装了）
      const 旧名称 = 现有条目.名称;
      现有条目.名称 = 部位值.名称;
      记录变更(层次结构, 部位, '重新穿着', `${旧名称}(完好)`, `${部位值.名称}(完好)`, 游戏时间, '服饰档案同步');
      有变更 = true;
    }
  }

  // 2. 遍历服装层次，移除服饰档案中已删除的部位
  for (const 条目 of 层次结构.层次) {
    if (条目.损坏程度 === '移除') continue; // 已移除的不管
    const 档案部位 = 服饰档案[条目.部位];
    if (!档案部位) {
      // 服饰档案中已无此部位，标记为移除
      const 旧状态 = `${条目.名称}(${条目.损坏程度})`;
      条目.损坏程度 = '移除';
      记录变更(层次结构, 条目.部位, '移除', 旧状态, '移除', 游戏时间, '服饰档案同步');
      有变更 = true;
    }
  }

  return 有变更;
}

// ==================== 辅助函数 ====================

function 记录变更(
  层次结构: 服装层次结构,
  部位: 服饰部位分类,
  变更类型: 服装变更日志['变更类型'],
  旧状态: string,
  新状态: string,
  游戏时间: string,
  触发原因: string
): void {
  层次结构.变更日志.push({
    时间: 游戏时间, 部位, 变更类型, 旧状态, 新状态, 触发原因,
  });
  层次结构.最后变更时间 = 游戏时间;
  if (层次结构.变更日志.length > 20) {
    层次结构.变更日志 = 层次结构.变更日志.slice(-20);
  }
}
