/**
 * BDSM 多角色关系网 — 网络操作引擎
 *
 * 处理跨 NPC 的关系冲突检测、连锁关系查找、边操作、以及多角色摘要生成。
 */

import type { 关系网络数据, BDSM关系边, BDSM关系边类型 } from '../../../models/bdsmNSFW/network';

// ==================== 冲突检测 ====================

export interface 冲突记录 {
  npcId: string;
  冲突类型: '矛盾链' | '强度失衡' | '三角张力';
  描述: string;
  相关边: { from: string; to: string; 类型: BDSM关系边类型 }[];
}

/**
 * 检测关系网络中的冲突
 *
 * 冲突类型：
 * - 矛盾链：同一 NPC 同时作为某关系的主导方和另一关系的从属方
 * - 强度失衡：同一 NPC 的多条边强度差异过大（>60）
 * - 三角张力：A→B, B→C, C→A 形成闭环
 */
export function 检测关系冲突(网络: 关系网络数据): 冲突记录[] {
  const 冲突列表: 冲突记录[] = [];
  const { 边 } = 网络;

  if (边.length < 2) return 冲突列表;

  // 按 NPC 分组边
  const 按NPC分组: Record<string, { 作为from: BDSM关系边[]; 作为to: BDSM关系边[] }> = {};
  for (const 当前边 of 边) {
    if (!按NPC分组[当前边.fromNPC]) 按NPC分组[当前边.fromNPC] = { 作为from: [], 作为to: [] };
    if (!按NPC分组[当前边.toNPC]) 按NPC分组[当前边.toNPC] = { 作为from: [], 作为to: [] };
    按NPC分组[当前边.fromNPC].作为from.push(当前边);
    按NPC分组[当前边.toNPC].作为to.push(当前边);
  }

  for (const [npcId, 分组] of Object.entries(按NPC分组)) {
    // 矛盾链：同时存在主导链（from）和从属链（to）
    const 主导边 = 分组.作为from.filter(e => e.边类型 === '主导链');
    const 从属边 = 分组.作为to.filter(e => e.边类型 === '从属链');
    if (主导边.length > 0 && 从属边.length > 0) {
      冲突列表.push({
        npcId,
        冲突类型: '矛盾链',
        描述: `${npcId} 同时是 ${主导边.map(e => e.toNPC).join('、')} 的支配方，又是 ${从属边.map(e => e.fromNPC).join('、')} 的从属方`,
        相关边: [
          ...主导边.map(e => ({ from: e.fromNPC, to: e.toNPC, 类型: e.边类型 })),
          ...从属边.map(e => ({ from: e.fromNPC, to: e.toNPC, 类型: e.边类型 })),
        ],
      });
    }

    // 强度失衡
    const 所有边 = [...分组.作为from, ...分组.作为to];
    if (所有边.length >= 2) {
      const 最大强度 = Math.max(...所有边.map(e => e.强度));
      const 最小强度 = Math.min(...所有边.map(e => e.强度));
      if (最大强度 - 最小强度 > 60) {
        冲突列表.push({
          npcId,
          冲突类型: '强度失衡',
          描述: `${npcId} 的关系强度差异过大（最强${最大强度} vs 最弱${最小强度}）`,
          相关边: 所有边.map(e => ({ from: e.fromNPC, to: e.toNPC, 类型: e.边类型 })),
        });
      }
    }
  }

  // 三角张力：A→B→C→A 闭环
  const 边映射 = new Map<string, string[]>();
  for (const 当前边 of 边) {
    if (!边映射.has(当前边.fromNPC)) 边映射.set(当前边.fromNPC, []);
    边映射.get(当前边.fromNPC)!.push(当前边.toNPC);
  }

  for (const [a, 目标列表A] of 边映射) {
    for (const b of 目标列表A) {
      const 目标列表B = 边映射.get(b) ?? [];
      for (const c of 目标列表B) {
        const 目标列表C = 边映射.get(c) ?? [];
        if (目标列表C.includes(a)) {
          冲突列表.push({
            npcId: a,
            冲突类型: '三角张力',
            描述: `${a} → ${b} → ${c} → ${a} 形成关系闭环`,
            相关边: [
              { from: a, to: b, 类型: '三角' },
              { from: b, to: c, 类型: '三角' },
              { from: c, to: a, 类型: '三角' },
            ],
          });
        }
      }
    }
  }

  return 冲突列表;
}

// ==================== 关系链查找 ====================

/**
 * 从指定起点查找连锁关系链（A→B→C→...）
 */
export function 查找关系链(网络: 关系网络数据, 起点NPC: string): string[][] {
  const { 边 } = 网络;
  const 所有链: string[][] = [];

  function 深度优先(当前: string, 已访问: Set<string>, 当前链: string[]) {
    const 新链 = [...当前链, 当前];
    const 新已访问 = new Set(已访问);
    新已访问.add(当前);

    const 邻居 = 边.filter(e => e.fromNPC === 当前 && !新已访问.has(e.toNPC));

    if (邻居.length === 0 && 当前链.length > 0) {
      所有链.push(新链);
      return;
    }

    for (const 邻 of 邻居) {
      深度优先(邻.toNPC, 新已访问, 新链);
    }
  }

  深度优先(起点NPC, new Set(), []);
  return 所有链;
}

// ==================== 边操作 ====================

/**
 * 添加关系边（不可变操作，返回新网络）
 */
export function 添加关系边(网络: 关系网络数据, 边: BDSM关系边): 关系网络数据 {
  const 已存在 = 网络.边.some(
    e => e.fromNPC === 边.fromNPC && e.toNPC === 边.toNPC && e.边类型 === 边.边类型
  );
  if (已存在) return 网络;

  const 新NPC集合 = new Set([...网络.活跃NPC, 边.fromNPC, 边.toNPC]);

  return {
    ...网络,
    边: [...网络.边, 边],
    活跃NPC: Array.from(新NPC集合),
    最后更新: new Date().toISOString(),
  };
}

/**
 * 更新关系强度（不可变操作，返回新网络）
 */
export function 更新关系强度(
  网络: 关系网络数据,
  fromNPC: string,
  toNPC: string,
  变化值: number
): 关系网络数据 {
  const 新边 = 网络.边.map(e => {
    if (e.fromNPC === fromNPC && e.toNPC === toNPC) {
      return { ...e, 强度: Math.max(0, Math.min(100, e.强度 + 变化值)) };
    }
    return e;
  });

  return {
    ...网络,
    边: 新边,
    最后更新: new Date().toISOString(),
  };
}

// ==================== 多角色摘要 ====================

/**
 * 构建多角色 BDSM 关系摘要
 */
export function 构建多角色摘要(参数: {
  NPC欲望档案: Record<string, any>;
  网络: 关系网络数据;
}): string {
  const { NPC欲望档案, 网络 } = 参数;
  const 组件: string[] = [];

  const 活跃关系数 = 网络.边.length;
  const 活跃NPC数 = 网络.活跃NPC.length;

  if (活跃关系数 === 0) return '当前无多角色 BDSM 关系网络';

  组件.push(`【BDSM 多角色关系网】`);
  组件.push(`活跃关系数：${活跃关系数}`);
  组件.push(`涉及 NPC：${活跃NPC数}人（${网络.活跃NPC.map(id => {
    const npc = NPC欲望档案[id];
    return npc?.姓名 ?? id;
  }).join('、')}）`);

  // 关系边摘要
  const 边摘要 = 网络.边.map(当前边 => {
    const fromName = NPC欲望档案[当前边.fromNPC]?.姓名 ?? 当前边.fromNPC;
    const toName = NPC欲望档案[当前边.toNPC]?.姓名 ?? 当前边.toNPC;
    return `${fromName} → ${toName}（${当前边.边类型}，强度${当前边.强度}）`;
  });
  组件.push(边摘要.join('\n'));

  // 冲突摘要
  const 冲突列表 = 检测关系冲突(网络);
  if (冲突列表.length > 0) {
    组件.push(`\n【关系冲突预警】`);
    for (const 冲突 of 冲突列表) {
      组件.push(`- ${冲突.描述}`);
    }
  }

  // 最长关系链
  if (网络.活跃NPC.length > 0) {
    let 最长链: string[] = [];
    for (const npc of 网络.活跃NPC) {
      const 链列表 = 查找关系链(网络, npc);
      for (const 链 of 链列表) {
        if (链.length > 最长链.length) 最长链 = 链;
      }
    }
    if (最长链.length > 2) {
      const 链名 = 最长链.map(id => NPC欲望档案[id]?.姓名 ?? id).join(' → ');
      组件.push(`\n最长关系链：${链名}（${最长链.length}人）`);
    }
  }

  return 组件.join('\n');
}

// ==================== 多角色叙事约束 ====================

/**
 * 根据关系网络生成叙事提示词
 */
export function 构建多角色BDSM叙事约束(参数: {
  活跃关系数: number;
  有冲突: boolean;
  最长链长度: number;
  网络摘要: string;
}): string {
  const { 活跃关系数, 有冲突, 最长链长度, 网络摘要 } = 参数;

  if (活跃关系数 === 0) return '';

  const 组件: string[] = [];

  组件.push(`【BDSM 多角色关系网 — 叙事约束】`);
  组件.push(`当前存在 ${活跃关系数} 条 BDSM 关系边，${有冲突 ? '存在' : '不存在'}关系冲突。`);

  if (最长链长度 >= 3) {
    组件.push(`存在长度为 ${最长链长度} 的关系链。叙事时应体现：`);
    组件.push(`- 链中上游 NPC 对下游 NPC 的间接影响力`);
    组件.push(`- 链中中间 NPC 的双重身份与心理压力`);
    组件.push(`- "连坐"效应：上游任务完成/失败影响下游 NPC 的态度`);
  }

  if (有冲突) {
    组件.push(`\n【关系冲突叙事指导】`);
    组件.push(`- 矛盾链：NPC 在不同关系中角色冲突，叙事中应体现内心矛盾和行为不一致`);
    组件.push(`- 三角张力：三角关系中嫉妒、竞争、占有欲是核心情感驱动`);
    组件.push(`- 强度失衡：NPC 对不同关系对象的投入差异导致情感失衡`);
  }

  组件.push(`\n【信息隔离】`);
  组件.push(`独立关系之间默认不共享信息。NPC 不应知道其他 BDSM 关系的细节，`);
  组件.push(`除非通过剧情事件（发现、泄露、告密）打破信息隔离。`);

  if (网络摘要) {
    组件.push(`\n${网络摘要}`);
  }

  return 组件.join('\n');
}
