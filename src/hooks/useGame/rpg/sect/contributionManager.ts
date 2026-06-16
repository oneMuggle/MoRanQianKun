/**
 * contributionManager.ts
 *
 * 门派贡献度管理 — 贡献获取、消耗、等级计算
 */

export interface ContributionResult {
  success: boolean;
  newContribution: number;
  reason?: string;
}

export function addContribution(
  currentContribution: number,
  amount: number,
): ContributionResult {
  if (amount <= 0) {
    return { success: false, newContribution: currentContribution, reason: '数量必须大于0' };
  }

  return {
    success: true,
    newContribution: currentContribution + amount,
  };
}

export function spendContribution(
  currentContribution: number,
  amount: number,
): ContributionResult {
  if (amount <= 0) {
    return { success: false, newContribution: currentContribution, reason: '数量必须大于0' };
  }

  if (currentContribution < amount) {
    return { success: false, newContribution: currentContribution, reason: '贡献不足' };
  }

  return { success: true, newContribution: currentContribution - amount };
}

const RANK_THRESHOLDS: Record<string, number> = {
  '杂役弟子': 0,
  '外门弟子': 100,
  '内门弟子': 500,
  '真传弟子': 2000,
  '执事': 5000,
  '长老': 15000,
  '副掌门': 50000,
  '掌门': 100000,
};

export function calculateRank(contribution: number): string {
  let currentRank = '杂役弟子';
  for (const [rank, threshold] of Object.entries(RANK_THRESHOLDS)) {
    if (contribution >= threshold) {
      currentRank = rank;
    }
  }
  return currentRank;
}

export function getNextRankInfo(contribution: number): {
  currentRank: string;
  nextRank: string | null;
  needed: number;
} {
  const ranks = Object.entries(RANK_THRESHOLDS).sort((a, b) => a[1] - b[1]);
  let currentRank = ranks[0][0];
  let nextRank: string | null = null;
  let needed = 0;

  for (let i = 0; i < ranks.length; i++) {
    const [rank, threshold] = ranks[i];
    if (contribution >= threshold) {
      currentRank = rank;
      if (i + 1 < ranks.length) {
        nextRank = ranks[i + 1][0];
        needed = ranks[i + 1][1] - contribution;
      } else {
        nextRank = null;
        needed = 0;
      }
    }
  }

  return { currentRank, nextRank, needed };
}
