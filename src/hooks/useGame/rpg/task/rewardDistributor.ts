/**
 * rewardDistributor.ts
 *
 * 奖励分发 — 任务完成后发放奖励到角色状态
 */

import type { 角色数据结构 } from '../../../../models/character';

export interface RewardPayload {
  silver?: number;
  experience?: number;
  sectContribution?: number;
  wisdom?: number;
  luck?: number;
}

export interface RewardResult {
  success: boolean;
  rewards: RewardPayload;
  narrative: string;
}

export function distributeRewards(
  character: 角色数据结构,
  rewards: RewardPayload,
): RewardResult {
  const parts: string[] = [];

  if (rewards.silver && rewards.silver > 0) {
    parts.push(`银两+${rewards.silver}`);
  }
  if (rewards.experience && rewards.experience > 0) {
    parts.push(`经验+${rewards.experience}`);
  }
  if (rewards.sectContribution && rewards.sectContribution > 0) {
    parts.push(`贡献+${rewards.sectContribution}`);
  }
  if (rewards.wisdom && rewards.wisdom > 0) {
    parts.push(`悟性+${rewards.wisdom}`);
  }
  if (rewards.luck && rewards.luck > 0) {
    parts.push(`福源+${rewards.luck}`);
  }

  return {
    success: true,
    rewards,
    narrative: parts.length > 0
      ? `获得奖励: ${parts.join(', ')}`
      : '完成任务（无实质奖励）',
  };
}

/**
 * 从任务奖励描述中解析奖励数值
 */
export function parseRewardDescription(rewardDesc: string[]): RewardPayload {
  const result: RewardPayload = {};

  for (const desc of rewardDesc) {
    const silverMatch = desc.match(/(\d+)\s*银两/);
    if (silverMatch) result.silver = parseInt(silverMatch[1], 10);

    const expMatch = desc.match(/(\d+)\s*经验/);
    if (expMatch) result.experience = parseInt(expMatch[1], 10);

    const contribMatch = desc.match(/(\d+)\s*贡献/);
    if (contribMatch) result.sectContribution = parseInt(contribMatch[1], 10);

    const wisdomMatch = desc.match(/(\d+)\s*悟性/);
    if (wisdomMatch) result.wisdom = parseInt(wisdomMatch[1], 10);

    const luckMatch = desc.match(/(\d+)\s*福源/);
    if (luckMatch) result.luck = parseInt(luckMatch[1], 10);
  }

  return result;
}
