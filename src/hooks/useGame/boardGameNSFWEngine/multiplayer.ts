/**
 * 桌游社交 NSFW 引擎 — 多人局管理
 *
 * 处理 3-8 人桌游的 NPC 选择、阵营分配、事件编排和回合推进
 */

import type {
  桌游类型,
  多人局配置,
  多人局参与者,
  多人局事件,
  多人局状态,
  NSFW编排模式,
} from '../../../models/boardGameNSFW/core';

// ==================== NPC 选择 ====================

export interface 候选NPC {
  id: string;
  姓名: string;
  欲望阶段: string;
  桌游偏好: number;
}

/**
 * 根据场景和设置选择参与多人局的 NPC
 */
export function 选择参与NPC(参数: {
  候选NPC: 候选NPC[];
  最小人数: number;
  最大人数: number;
  桌游类型: 桌游类型;
}): 多人局参与者[] {
  const { 候选NPC, 最小人数, 最大人数 } = 参数;
  if (候选NPC.length < 最小人数) return [];

  const 排序列表 = [...候选NPC].sort((a, b) => b.桌游偏好 - a.桌游偏好);
  const 实际上限 = Math.min(最大人数, 候选NPC.length);
  const 实际人数 = 最小人数 + Math.floor(Math.random() * (实际上限 - 最小人数 + 1));
  const 选中 = 排序列表.slice(0, 实际人数);

  return 选中.map(npc => ({
    id: npc.id,
    姓名: npc.姓名,
    欲望阶段: npc.欲望阶段,
    出局: false,
  }));
}

// ==================== 触发判定 ====================

/**
 * 判定是否触发多人局
 */
export function 判定多人局触发(参数: {
  当前桌游类型: 桌游类型;
  可用NPC数量: number;
  是否启用多人局: boolean;
  最小人数阈值: number;
}): boolean {
  const { 当前桌游类型, 可用NPC数量, 是否启用多人局, 最小人数阈值 } = 参数;

  if (!是否启用多人局) return false;
  if (可用NPC数量 < 最小人数阈值) return false;

  const 多人友好型: 桌游类型[] = ['狼人杀', '剧本杀', '真心话大冒险', '国王游戏', '棋牌游戏'];
  if (多人友好型.includes(当前桌游类型)) {
    return true;
  }

  return Math.random() < 0.3;
}

// ==================== 阵营分配 ====================

/**
 * 为多人局分配阵营（狼人杀/剧本杀专用）
 */
export function 分配阵营(参数: {
  参与NPC: string[];
  桌游类型: 桌游类型;
}): Record<string, string> {
  const { 参与NPC, 桌游类型 } = 参数;
  const 阵营: Record<string, string> = {};

  switch (桌游类型) {
    case '狼人杀': {
      const 狼人数量 = Math.max(1, Math.floor(参与NPC.length / 3));
      const 打乱 = [...参与NPC].sort(() => Math.random() - 0.5);
      for (let i = 0; i < 狼人数量; i++) 阵营[打乱[i]] = '狼人';
      for (let i = 狼人数量; i < 打乱.length; i++) 阵营[打乱[i]] = '好人';
      break;
    }

    case '剧本杀': {
      const 阵营数 = Math.min(3, Math.max(2, Math.ceil(参与NPC.length / 2)));
      const 阵营名列表 = Array.from({ length: 阵营数 }, (_, i) => `阵营${i + 1}`);
      参与NPC.forEach((id, idx) => { 阵营[id] = 阵营名列表[idx % 阵营数]; });
      break;
    }

    default:
      参与NPC.forEach(id => { 阵营[id] = '独立'; });
      break;
  }

  return 阵营;
}

// ==================== 事件编排 ====================

let _eventIdCounter = 0;
function 生成事件ID(): string { return `mp_event_${Date.now()}_${++_eventIdCounter}`; }

/**
 * 编排多人局 NSFW 事件
 */
export function 编排多人局NSFW事件(参数: {
  桌游类型: 桌游类型;
  参与NPC: 多人局参与者[];
  编排模式: NSFW编排模式;
  当前回合: number;
  紧张度: number;
  阵营分配?: Record<string, string>;
}): 多人局事件[] {
  const { 桌游类型, 参与NPC, 编排模式, 当前回合, 紧张度, 阵营分配 } = 参数;
  const 在场NPC = 参与NPC.filter(n => !n.出局);
  if (在场NPC.length < 2) return [];

  const 事件列表: 多人局事件[] = [];

  switch (编排模式) {
    case '轮流':
      事件列表.push(...编排轮流事件(在场NPC, 当前回合, 紧张度, 桌游类型));
      break;
    case '随机':
      事件列表.push(...编排随机事件(在场NPC, 当前回合, 紧张度, 桌游类型));
      break;
    case '阵营':
      if (阵营分配) {
        事件列表.push(...编排阵营事件(在场NPC, 阵营分配, 当前回合, 紧张度, 桌游类型));
      } else {
        事件列表.push(...编排轮流事件(在场NPC, 当前回合, 紧张度, 桌游类型));
      }
      break;
  }

  // 高紧张度时额外生成公开曝光事件
  if (紧张度 >= 70 && Math.random() < 0.4) {
    const 发起者 = 在场NPC[Math.floor(Math.random() * 在场NPC.length)];
    事件列表.push({
      id: 生成事件ID(),
      事件类型: '公开曝光',
      发起者: 发起者.id,
      目标: 在场NPC.filter(n => n.id !== 发起者.id).map(n => n.id),
      事件描述: '紧张氛围升级，在场所有人注意到异常',
      紧张度: Math.min(100, 紧张度 + 10),
      当前回合,
      已执行: false,
    });
  }

  return 事件列表;
}

function 编排轮流事件(
  在场NPC: 多人局参与者[],
  当前回合: number,
  紧张度: number,
  桌游类型: 桌游类型
): 多人局事件[] {
  const 事件: 多人局事件[] = [];
  const 每回合事件数 = Math.min(2, Math.max(1, Math.floor(在场NPC.length / 3)));

  for (let i = 0; i < 每回合事件数; i++) {
    const 发起者索引 = (当前回合 + i) % 在场NPC.length;
    const 目标索引 = (发起者索引 + 1 + Math.floor(Math.random() * (在场NPC.length - 1))) % 在场NPC.length;
    const 发起者 = 在场NPC[发起者索引];
    const 目标 = 在场NPC[目标索引];

    事件.push({
      id: 生成事件ID(),
      事件类型: '指令执行',
      发起者: 发起者.id,
      目标: [目标.id],
      事件描述: `${发起者.姓名} 对 ${目标.姓名} 执行${桌游类型}指令`,
      紧张度,
      当前回合,
      已执行: false,
    });
  }

  return 事件;
}

function 编排随机事件(
  在场NPC: 多人局参与者[],
  当前回合: number,
  紧张度: number,
  桌游类型: 桌游类型
): 多人局事件[] {
  const 事件: 多人局事件[] = [];
  const 事件数 = Math.min(2, Math.max(1, Math.floor(Math.random() * 2) + 1));
  const 已使用 = new Set<string>();

  for (let i = 0; i < 事件数; i++) {
    const 可用 = 在场NPC.filter(n => !已使用.has(n.id));
    if (可用.length < 2) break;

    const 发起者 = 可用[Math.floor(Math.random() * 可用.length)];
    已使用.add(发起者.id);
    const 候选目标 = 可用.filter(n => n.id !== 发起者.id);
    const 目标 = 候选目标[Math.floor(Math.random() * 候选目标.length)];
    已使用.add(目标.id);

    const 类型: ('指令执行' | '私下结盟') = Math.random() < 0.5 ? '指令执行' : '私下结盟';

    事件.push({
      id: 生成事件ID(),
      事件类型: 类型,
      发起者: 发起者.id,
      目标: [目标.id],
      事件描述: `${发起者.姓名} 与 ${目标.姓名} 在${桌游类型}中${类型 === '私下结盟' ? '私下交流' : '互动'}`,
      紧张度,
      当前回合,
      已执行: false,
    });
  }

  return 事件;
}

function 编排阵营事件(
  在场NPC: 多人局参与者[],
  阵营分配: Record<string, string>,
  当前回合: number,
  紧张度: number,
  桌游类型: 桌游类型
): 多人局事件[] {
  const 事件: 多人局事件[] = [];
  const 阵营组: Record<string, 多人局参与者[]> = {};

  在场NPC.forEach(npc => {
    const 阵营 = 阵营分配[npc.id] || '独立';
    if (!阵营组[阵营]) 阵营组[阵营] = [];
    阵营组[阵营].push(npc);
  });

  const 阵营键列表 = Object.keys(阵营组);

  if (阵营键列表.length >= 2) {
    const 阵营A = 阵营键列表[当前回合 % 阵营键列表.length];
    const 阵营B = 阵营键列表[(当前回合 + 1) % 阵营键列表.length];
    事件.push({
      id: 生成事件ID(),
      事件类型: '阵营对抗',
      发起者: 阵营组[阵营A][0].id,
      目标: 阵营组[阵营B].map(n => n.id),
      事件描述: `${阵营A} 与 ${阵营B} 在${桌游类型}中展开对抗`,
      紧张度: Math.min(100, 紧张度 + 5),
      当前回合,
      已执行: false,
      阵营: `${阵营A} vs ${阵营B}`,
    });
  }

  for (const [阵营名, 成员] of Object.entries(阵营组)) {
    if (成员.length >= 2 && 阵营名 !== '独立') {
      事件.push({
        id: 生成事件ID(),
        事件类型: '私下结盟',
        发起者: 成员[0].id,
        目标: 成员.slice(1).map(n => n.id),
        事件描述: `${阵营名} 内部秘密结盟`,
        紧张度,
        当前回合,
        已执行: false,
        阵营: 阵营名,
      });
    }
  }

  return 事件;
}

// ==================== 回合推进 ====================

/**
 * 推进多人局回合，处理待执行事件
 */
export function 推进多人局回合(参数: {
  当前状态: 多人局状态;
  桌游类型: 桌游类型;
}): { 新状态: 多人局状态; 新事件: 多人局事件[] } {
  const { 当前状态, 桌游类型 } = 参数;

  const 本轮执行事件 = 当前状态.待处理事件.filter(e => !e.已执行);
  const 已执行 = 本轮执行事件.map(e => ({ ...e, 已执行: true }));
  const 未执行 = 当前状态.待处理事件.filter(e => e.已执行);

  // 淘汰机制
  let 新参与NPC = [...当前状态.参与NPC];
  if (当前状态.配置.启用淘汰机制 && 新参与NPC.filter(n => !n.出局).length > 当前状态.配置.最小人数) {
    const 在场索引 = 新参与NPC.map((n, i) => ({ idx: i, 出局: n.出局 }));
    const 可选 = 在场索引.filter(n => !n.出局);
    if (可选.length > 0) {
      const 淘汰 = 可选[Math.floor(Math.random() * 可选.length)];
      新参与NPC[淘汰.idx] = { ...新参与NPC[淘汰.idx], 出局: true };
    }
  }

  const 新回合 = 当前状态.当前回合 + 1;
  const 在场NPC = 新参与NPC.filter(n => !n.出局);
  const 新紧张度 = Math.min(100, 当前状态.待处理事件.length > 0
    ? Math.max(...当前状态.待处理事件.map(e => e.紧张度)) + 5
    : 当前状态.当前回合 * 3);

  const 新编排事件 = 编排多人局NSFW事件({
    桌游类型,
    参与NPC: 在场NPC,
    编排模式: 当前状态.配置.NSFW编排模式,
    当前回合: 新回合,
    紧张度: 新紧张度,
    阵营分配: 当前状态.阵营分配,
  });

  const 新状态: 多人局状态 = {
    ...当前状态,
    参与NPC: 新参与NPC,
    当前回合: 新回合,
    待处理事件: [...未执行, ...新编排事件],
    已执行事件: [...当前状态.已执行事件, ...已执行],
    NSFW已触发: 当前状态.NSFW已触发 || 本轮执行事件.some(e => e.紧张度 >= 60),
  };

  return { 新状态, 新事件: 新编排事件 };
}

// ==================== 多人局初始化 ====================

/**
 * 初始化一个新的多人局状态
 */
export function 初始化多人局(参数: {
  参与NPC: 多人局参与者[];
  桌游类型: 桌游类型;
  配置: Partial<多人局配置>;
}): 多人局状态 {
  const { 参与NPC, 桌游类型, 配置 } = 参数;

  const 完整配置: 多人局配置 = {
    最小人数: 配置.最小人数 ?? 3,
    最大人数: 配置.最大人数 ?? 8,
    启用阵营: 配置.启用阵营 ?? (桌游类型 === '狼人杀' || 桌游类型 === '剧本杀'),
    启用淘汰机制: 配置.启用淘汰机制 ?? false,
    NSFW编排模式: 配置.NSFW编排模式 ?? '轮流',
  };

  const 阵营分配 = 完整配置.启用阵营
    ? 分配阵营({ 参与NPC: 参与NPC.map(n => n.id), 桌游类型 })
    : {};

  return {
    配置: 完整配置,
    参与NPC,
    当前回合: 0,
    总回合数: 12,
    待处理事件: [],
    已执行事件: [],
    阵营分配,
    NSFW已触发: false,
  };
}
