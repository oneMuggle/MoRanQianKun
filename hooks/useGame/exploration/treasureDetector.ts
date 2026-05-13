/**
 * 地图探索 — 宝藏发现检定
 */

import type { TreasureResult } from '../../../models/exploration/mapNode';
import { TREASURE_QUALITY_WEIGHT } from '../../../models/exploration/mapNode';

export interface TreasureConfig {
  insight: number;
  luck: number;
  areaTreasureRate: number;
}

export function rollTreasure(config: TreasureConfig): TreasureResult {
  const insightModifier = config.insight / 100;
  const luckModifier = config.luck / 100;
  const findRate = (insightModifier * 0.6 + luckModifier * 0.4) * config.areaTreasureRate;

  if (Math.random() >= findRate) {
    return { found: false, quality: 'common' };
  }

  const quality = rollQuality();
  return { found: true, treasureId: `treasure_${Date.now()}`, quality };
}

function rollQuality(): TreasureResult['quality'] {
  const roll = Math.random();
  let cumulative = 0;

  for (const [quality, weight] of Object.entries(TREASURE_QUALITY_WEIGHT)) {
    cumulative += weight;
    if (roll < cumulative) {
      return quality as TreasureResult['quality'];
    }
  }

  return 'common';
}
