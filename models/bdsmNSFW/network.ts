/**
 * BDSM 多角色关系网 — 类型定义
 *
 * 补充现有星形拓扑（每 NPC 独立 BDSM关系状态）为图结构，
 * 支持 NPC 间的权力链、竞争、三角关系等多对多关系。
 */

export type BDSM关系边类型 = '主导链' | '从属链' | '竞争' | '三角' | '独立';

export interface BDSM关系边 {
  fromNPC: string;
  toNPC: string;
  边类型: BDSM关系边类型;
  强度: number;  // 0-100
  建立时间: string;
}

export interface 关系网络数据 {
  边: BDSM关系边[];
  活跃NPC: string[];
  最后更新: string;
}

/**
 * 创建一个空的关系网络
 */
export function 创建空关系网络(): 关系网络数据 {
  return {
    边: [],
    活跃NPC: [],
    最后更新: new Date().toISOString(),
  };
}
