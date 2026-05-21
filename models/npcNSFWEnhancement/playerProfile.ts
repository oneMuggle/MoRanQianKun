/**
 * NPC NSFW 增强模块 — 玩家偏好档案
 * 追踪玩家NSFW偏好、NPC契合度评分
 */

import { NPC结构 } from '../social';
import type {
  玩家NSFW偏好档案,
  玩家NSFW偏好条目,
  NPC契合度条目,
} from './types';

// ==================== 初始化 ====================

export function 初始化玩家偏好档案(): 玩家NSFW偏好档案 {
  return {
    偏好列表: [],
    npc契合度: [],
    总NSFW互动次数: 0,
    偏好最后更新时间: '',
    变化日志: [],
  };
}

// ==================== 偏好追踪 ====================

/**
 * 记录玩家对某NSFW偏好的选择/触发
 */
export function 记录玩家偏好(
  档案: 玩家NSFW偏好档案,
  偏好类型: string,
  游戏时间: string,
  描述: string = ''
): void {
  档案.总NSFW互动次数++;

  const 已有 = 档案.偏好列表.find(p => p.偏好类型 === 偏好类型);
  if (已有) {
    已有.累积次数++;
    已有.强度等级 = 计算偏好强度(已有.累积次数);
  } else {
    const 新条目: 玩家NSFW偏好条目 = {
      偏好类型,
      强度等级: '中立',
      解锁时间: 游戏时间,
      累积次数: 1,
    };
    档案.偏好列表.push(新条目);
  }

  档案.偏好最后更新时间 = 游戏时间;
  档案.变化日志.push({
    时间: 游戏时间,
    变化类型: '新增偏好',
    描述: 描述 || `新增偏好"${偏好类型}"`,
  });

  if (档案.变化日志.length > 30) {
    档案.变化日志 = 档案.变化日志.slice(-30);
  }
}

function 计算偏好强度(次数: number): import('./types').偏好强度等级 {
  if (次数 >= 20) return '痴迷';
  if (次数 >= 10) return '喜欢';
  if (次数 >= 3) return '中立';
  return '反感';
}

// ==================== NPC 契合度 ====================

/**
 * 计算玩家与某NPC的NSFW契合度评分
 */
export function 计算NPC契合度(
  玩家档案: 玩家NSFW偏好档案,
  npc: NPC结构,
  _游戏时间: string
): number {
  if (!npc.性癖档案 && !npc.敏感点档案) return 30;

  let 评分 = 50;
  const 原因: string[] = [];

  if (npc.性癖档案) {
    const 性癖匹配分 = 计算性癖匹配度(玩家档案, npc.性癖档案);
    评分 += 性癖匹配分 * 0.4;
    if (性癖匹配分 > 60) 原因.push('性癖高度匹配');
    else if (性癖匹配分 > 30) 原因.push('性癖部分匹配');
  }

  if (npc.敏感点档案) {
    const 数量 = npc.敏感点档案.主要敏感点.length;
    if (数量 >= 5) { 评分 += 15; 原因.push('敏感点丰富'); }
    else if (数量 >= 3) 评分 += 10;
  }

  if (npc.人格档案?.里.欲望驱动.length) {
    评分 += 10;
    原因.push('人格反差吸引力');
  }

  const 已有 = 玩家档案.npc契合度.find(n => n.npcId === npc.id || n.npc姓名 === npc.姓名);
  if (已有 && 已有.互动次数 >= 10) {
    评分 += 5;
    原因.push('互动频繁');
  }

  return Math.min(100, Math.max(0, Math.round(评分)));
}

function 计算性癖匹配度(
  玩家档案: 玩家NSFW偏好档案,
  npc性癖: NonNullable<NPC结构['性癖档案']>
): number {
  if (玩家档案.偏好列表.length === 0) return 30;
  if (npc性癖.核心偏好.length === 0) return 20;

  const 玩家类型 = new Set(玩家档案.偏好列表.map(p => p.偏好类型));
  let 匹配数 = 0;
  let 权重总和 = 0;

  for (const 偏好 of npc性癖.核心偏好) {
    权重总和 += 偏好.强度;
    if (玩家类型.has(偏好.类别) || 玩家类型.has(偏好.子类型)) {
      匹配数 += 偏好.强度;
    }
  }

  return 权重总和 > 0 ? Math.round((匹配数 / 权重总和) * 100) : 30;
}

/**
 * 更新或创建NPC契合度记录
 */
export function 更新NPC契合度(
  玩家档案: 玩家NSFW偏好档案,
  npc: NPC结构,
  游戏时间: string
): NPC契合度条目 {
  const 已有 = 玩家档案.npc契合度.find(n => n.npcId === npc.id || n.npc姓名 === npc.姓名);
  const 评分 = 计算NPC契合度(玩家档案, npc, 游戏时间);

  if (已有) {
    已有.契合度评分 = 评分;
    已有.互动次数++;
    已有.最近互动时间 = 游戏时间;
    return 已有;
  }

  const 原因: string[] = [];
  if (npc.性癖档案?.核心偏好.length) 原因.push(`性癖${npc.性癖档案.倾向摘要 || '丰富'}`);
  if (npc.人格档案) 原因.push(`${npc.人格档案.身份标签.join('/')}`);

  const 新条目: NPC契合度条目 = {
    npcId: npc.id ?? '',
    npc姓名: npc.姓名,
    契合度评分: 评分,
    互动次数: 1,
    最近互动时间: 游戏时间,
    契合原因: 原因.length > 0 ? 原因 : ['初次互动'],
  };

  玩家档案.npc契合度.push(新条目);
  玩家档案.npc契合度.sort((a, b) => b.契合度评分 - a.契合度评分);
  if (玩家档案.npc契合度.length > 20) {
    玩家档案.npc契合度 = 玩家档案.npc契合度.slice(0, 20);
  }

  return 新条目;
}

// ==================== 查询 ====================

export function 获取玩家偏好排行(
  档案: 玩家NSFW偏好档案,
  数量: number = 5
): 玩家NSFW偏好条目[] {
  return [...档案.偏好列表]
    .sort((a, b) => b.累积次数 - a.累积次数)
    .slice(0, 数量);
}

export function 获取高契合度NPC(
  档案: 玩家NSFW偏好档案,
  最低分: number = 60
): NPC契合度条目[] {
  return 档案.npc契合度.filter(n => n.契合度评分 >= 最低分);
}

export function 生成玩家偏好摘要(档案: 玩家NSFW偏好档案): string | null {
  if (档案.偏好列表.length === 0) return null;

  const 排行 = 获取玩家偏好排行(档案, 3);
  const 文本 = 排行
    .map(p => `${p.偏好类型}(${p.强度等级},${p.累积次数}次)`)
    .join('、');

  return `玩家偏好：${文本}`;
}
