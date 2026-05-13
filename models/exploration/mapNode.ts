/**
 * 地图探索 — 数据模型
 */

/** 地图节点类型 */
export type MapNodeType =
  | 'sect'        // 门派
  | 'inn'         // 客栈
  | 'market'      // 市集
  | 'secret'      // 秘境
  | 'cave'        // 山洞
  | 'village'     // 村庄
  | 'town'        // 城镇
  | 'wilderness'; // 荒野

/** 节点危险等级 */
export type DangerLevel = 'safe' | 'low' | 'medium' | 'high' | 'deadly';

/** 战争迷雾状态 */
export type FogOfWarState = 'hidden' | 'revealed' | 'explored';

/** 地图节点 */
export interface MapNode {
  id: string;
  type: MapNodeType;
  name: string;
  description: string;
  /** 危险等级（影响遇敌概率） */
  dangerLevel: DangerLevel;
  /** 迷雾状态 */
  fowState: FogOfWarState;
  /** 是否已触发该节点的隐藏事件 */
  eventTriggered: boolean;
  /** 节点附加数据（如 NPC 位置、宝藏信息等） */
  metadata?: Record<string, unknown>;
}

/** 地图路径 */
export interface MapPath {
  from: string;
  to: string;
  /** 移动消耗的行动力 */
  actionCost: number;
  /** 路径描述 */
  description?: string;
  /** 是否需要前置条件（如任务完成、好感度等） */
  prerequisite?: string;
}

/** 遇敌结果 */
export interface EncounterResult {
  triggered: boolean;
  /** 遇敌类型 */
  encounterType: 'none' | 'monster' | 'npc' | 'event' | 'treasure';
  /** 敌人/事件 ID */
  entityId?: string;
  /** 危险等级 */
  dangerLevel: DangerLevel;
}

/** 宝藏发现结果 */
export interface TreasureResult {
  found: boolean;
  /** 宝藏 ID */
  treasureId?: string;
  /** 发现品质 */
  quality: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
}

/** 移动结果 */
export interface MoveResult {
  success: boolean;
  /** 新位置 */
  newNodeId: string;
  /** 剩余行动力 */
  remainingAp: number;
  /** 是否触发遇敌 */
  encounter?: EncounterResult;
  /** 是否发现宝藏 */
  treasure?: TreasureResult;
  /** 是否触发隐藏事件 */
  hiddenEvent: boolean;
}

/** 地图图数据 */
export interface MapGraphData {
  nodes: MapNode[];
  paths: MapPath[];
  /** 玩家当前所在节点 ID */
  currentNodeId: string | null;
  /** 玩家剩余行动力 */
  currentAp: number;
  /** 最大行动力 */
  maxAp: number;
}

/** 危险等级对应的遇敌基础概率 */
export const ENCOUNTER_BASE_RATE: Record<DangerLevel, number> = {
  safe: 0.0,
  low: 0.1,
  medium: 0.25,
  high: 0.45,
  deadly: 0.7,
};

/** 宝藏品质权重（用于发现检定） */
export const TREASURE_QUALITY_WEIGHT: Record<TreasureResult['quality'], number> = {
  common: 0.5,
  uncommon: 0.3,
  rare: 0.15,
  epic: 0.04,
  legendary: 0.01,
};
