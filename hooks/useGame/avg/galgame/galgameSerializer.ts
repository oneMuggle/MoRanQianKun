/**
 * galgameSerializer.ts
 *
 * GalgameState 的序列化与反序列化。
 * 在 AvgRelationEngine 的 serialize/fromJSON 之上提供版本化的存档格式，
 * 确保存档兼容性可扩展。
 */

import { AvgRelationEngine } from '../../engine/avgRelationEngine';

// ==================== 存档格式版本 ====================

export const GALGAME_SAVE_VERSION = 1;

/** 版本 1 存档数据 */
export interface GalgameSaveDataV1 {
  version: 1;
  /** 引擎序列化数据（含 galgameState、turnNumber 等） */
  engineData: Record<string, unknown>;
  /** 关系图快照（NPC ID 列表，用于恢复时验证路线有效性） */
  relationGraphSnapshot?: { npcIds: string[] };
}

/** 当前版本的存档数据类型 */
export type GalgameSaveData = GalgameSaveDataV1;

// ==================== 序列化 ====================

/**
 * 将 Galgame 引擎状态序列化为可存档的数据。
 */
export function serializeGalgameState(
  engine: AvgRelationEngine,
  options?: { relationGraphSnapshot?: { npcIds: string[] } }
): GalgameSaveData {
  return {
    version: GALGAME_SAVE_VERSION,
    engineData: engine.serialize(),
    relationGraphSnapshot: options?.relationGraphSnapshot,
  };
}

// ==================== 反序列化 ====================

/**
 * 从存档数据恢复 Galgame 引擎状态。
 * @returns 恢复后的引擎实例
 */
export function deserializeGalgameState(
  data: GalgameSaveData
): AvgRelationEngine {
  return AvgRelationEngine.fromJSON(data.engineData);
}

// ==================== 存档校验 ====================

/**
 * 判断一段存档数据是否包含 Galgame 信息。
 */
export function hasGalgameSaveData(
  gameSave: Record<string, unknown>
): boolean {
  return (
    'galgameSaveData' in gameSave &&
    gameSave.galgameSaveData !== null &&
    typeof gameSave.galgameSaveData === 'object'
  );
}

/**
 * 校验 Galgame 存档数据格式是否有效。
 */
export function isValidGalgameSaveData(
  data: unknown
): data is GalgameSaveData {
  if (!data || typeof data !== 'object') return false;
  const obj = data as Record<string, unknown>;
  return (
    obj.version === GALGAME_SAVE_VERSION &&
    typeof obj.engineData === 'object' &&
    obj.engineData !== null
  );
}

/**
 * 获取 Galgame 存档数据的版本号。
 */
export function getGalgameSaveVersion(data: unknown): number | null {
  if (!data || typeof data !== 'object') return null;
  const version = (data as Record<string, unknown>).version;
  return typeof version === 'number' ? version : null;
}

// ==================== 空数据工厂 ====================

/**
 * 创建空的 Galgame 存档数据（新游戏用）。
 */
export function createEmptyGalgameSaveData(): GalgameSaveData {
  const emptyEngine = new AvgRelationEngine();
  return {
    version: GALGAME_SAVE_VERSION,
    engineData: emptyEngine.serialize(),
  };
}
