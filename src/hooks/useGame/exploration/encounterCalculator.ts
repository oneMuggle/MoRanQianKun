/**
 * 地图探索 — 遇敌概率计算
 *
 * 公式: 基础概率 × 区域危险等级修正 × (1 - 福源修正)
 */

import type { DangerLevel, EncounterResult } from '../../../models/exploration/mapNode';
import { ENCOUNTER_BASE_RATE } from '../../../models/exploration/mapNode';

export interface EncounterConfig {
  luck: number;
  dangerLevel: DangerLevel;
  multiplier?: number;
}

export function rollEncounter(config: EncounterConfig): EncounterResult {
  const baseRate = ENCOUNTER_BASE_RATE[config.dangerLevel];
  if (baseRate === 0) return { triggered: false, encounterType: 'none', dangerLevel: config.dangerLevel };

  const luckModifier = Math.max(0, Math.min(1, config.luck / 100));
  const multiplier = config.multiplier ?? 1;

  const finalRate = baseRate * (1 - luckModifier * 0.5) * multiplier;
  const triggered = Math.random() < finalRate;

  if (!triggered) {
    return { triggered: false, encounterType: 'none', dangerLevel: config.dangerLevel };
  }

  const roll = Math.random();
  let encounterType: EncounterResult['encounterType'];
  if (roll < 0.6) {
    encounterType = 'monster';
  } else if (roll < 0.8) {
    encounterType = 'npc';
  } else if (roll < 0.95) {
    encounterType = 'event';
  } else {
    encounterType = 'treasure';
  }

  return {
    triggered: true,
    encounterType,
    entityId: generateEntityId(encounterType),
    dangerLevel: config.dangerLevel,
  };
}

function generateEntityId(type: EncounterResult['encounterType']): string | undefined {
  switch (type) {
    case 'monster': return `monster_${Math.floor(Math.random() * 1000)}`;
    case 'npc': return `npc_${Math.floor(Math.random() * 1000)}`;
    case 'event': return `event_${Math.floor(Math.random() * 1000)}`;
    case 'treasure': return `treasure_${Math.floor(Math.random() * 1000)}`;
    default: return undefined;
  }
}

export function calculateEncounterRate(config: EncounterConfig): number {
  const baseRate = ENCOUNTER_BASE_RATE[config.dangerLevel];
  const luckModifier = Math.max(0, Math.min(1, config.luck / 100));
  const multiplier = config.multiplier ?? 1;
  return baseRate * (1 - luckModifier * 0.5) * multiplier;
}
