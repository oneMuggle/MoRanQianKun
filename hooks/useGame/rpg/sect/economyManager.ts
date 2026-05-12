/**
 * economyManager.ts
 *
 * 门派经济管理 — 资金/物资/建设度计算与维护
 */

export interface EconomyState {
  门派资金: number;
  门派物资: number;
  建设度: number;
}

export interface EconomyResult {
  success: boolean;
  newState: EconomyState;
  reason?: string;
}

export function addFunds(state: EconomyState, amount: number): EconomyResult {
  if (amount <= 0) {
    return { success: false, newState: state, reason: '数量必须大于0' };
  }
  return {
    success: true,
    newState: { ...state, 门派资金: state.门派资金 + amount },
  };
}

export function spendFunds(state: EconomyState, amount: number): EconomyResult {
  if (amount <= 0) {
    return { success: false, newState: state, reason: '数量必须大于0' };
  }
  if (state.门派资金 < amount) {
    return { success: false, newState: state, reason: '资金不足' };
  }
  return {
    success: true,
    newState: { ...state, 门派资金: state.门派资金 - amount },
  };
}

export function addSupplies(state: EconomyState, amount: number): EconomyResult {
  if (amount <= 0) {
    return { success: false, newState: state, reason: '数量必须大于0' };
  }
  return {
    success: true,
    newState: { ...state, 门派物资: state.门派物资 + amount },
  };
}

export function spendSupplies(state: EconomyState, amount: number): EconomyResult {
  if (amount <= 0) {
    return { success: false, newState: state, reason: '数量必须大于0' };
  }
  if (state.门派物资 < amount) {
    return { success: false, newState: state, reason: '物资不足' };
  }
  return {
    success: true,
    newState: { ...state, 门派物资: state.门派物资 - amount },
  };
}

/**
 * 根据资金投入计算建设度增长
 * 每100资金 = 1建设度（可配置）
 */
export function investConstruction(
  state: EconomyState,
  fundsToSpend: number,
  ratio = 100,
): EconomyResult {
  const fundsResult = spendFunds(state, fundsToSpend);
  if (!fundsResult.success) {
    return fundsResult;
  }

  const constructionGain = Math.floor(fundsToSpend / ratio);
  if (constructionGain <= 0) {
    return {
      success: false,
      newState: fundsResult.newState,
      reason: `投入资金不足以增加建设度（需要至少${ratio}资金）`,
    };
  }

  return {
    success: true,
    newState: {
      ...fundsResult.newState,
      建设度: state.建设度 + constructionGain,
    },
  };
}

/**
 * 门派每日经济维护 — 根据建设度计算日常收支
 */
export function calculateDailyMaintenance(
  constructionLevel: number,
): { income: number; expense: number; net: number } {
  const baseIncome = Math.floor(constructionLevel * 0.5);
  const baseExpense = Math.floor(constructionLevel * 0.3);
  return {
    income: baseIncome,
    expense: baseExpense,
    net: baseIncome - baseExpense,
  };
}
