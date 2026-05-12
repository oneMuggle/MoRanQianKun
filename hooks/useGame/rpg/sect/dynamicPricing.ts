/**
 * dynamicPricing.ts
 *
 * 门派商店动态定价 — 根据供需关系调整商品价格
 */

export interface PriceConfig {
  basePrice: number;
  minPrice: number;
  maxPrice: number;
  volatility: number;
}

export interface SupplyDemand {
  supply: number;
  demand: number;
}

export function calculatePriceMultiplier(
  config: PriceConfig,
  supplyDemand: SupplyDemand,
): number {
  if (supplyDemand.demand === 0) {
    return 1.0;
  }

  const ratio = supplyDemand.supply / supplyDemand.demand;

  let multiplier: number;
  if (ratio >= 1) {
    multiplier = 0.5 + 0.5 / (1 + (ratio - 1) * config.volatility);
  } else {
    multiplier = 1.0 + (1 - ratio) * config.volatility;
  }

  return Math.max(0.5, Math.min(2.0, multiplier));
}

export function calculateFinalPrice(
  config: PriceConfig,
  supplyDemand: SupplyDemand,
): number {
  const multiplier = calculatePriceMultiplier(config, supplyDemand);
  const price = Math.round(config.basePrice * multiplier);
  return Math.max(config.minPrice, Math.min(config.maxPrice, price));
}

export function calculateBatchPrices(
  configs: PriceConfig[],
  supplyDemands: SupplyDemand[],
): number[] {
  return configs.map((config, i) =>
    calculateFinalPrice(config, supplyDemands[i]),
  );
}
