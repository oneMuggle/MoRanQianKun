import type { NPC结构 } from '@/models/social';
import type { 亲密互动类型, 属性奖励结构, 亲密互动记录 } from '@/models/intimacy';
import { 计算亲密度等级, 是否可触发互动, 获取可触发互动选项, 获取互动等级要求, 生成亲密互动记录, 生成双修奖励, 计算双修收益 } from '@/models/intimacy';
import { 里象功法列表, getLixiangById, type 里象功法 } from '@/data/cultivation/lixiang';

export function updateIntimacy(npc: NPC结构, delta: number): NPC结构 {
  const newFavor = Math.max(0, Math.min(100, npc.好感度 + delta));
  return { ...npc, 好感度: newFavor };
}

export function getIntimacyLevel(npc: NPC结构): number {
  return 计算亲密度等级(npc.好感度);
}

export function canTriggerIntimacy(npc: NPC结构, intimacyType: 亲密互动类型): boolean {
  const level = getIntimacyLevel(npc);
  const required = 获取互动等级要求(intimacyType);
  return 是否可触发互动(level, required);
}

export function getAvailableOptions(npc: NPC结构) {
  const level = getIntimacyLevel(npc);
  return 获取可触发互动选项(level);
}

export function createIntimacyRecord(
  npcId: string,
  type: 亲密互动类型,
  desc: string,
  reward?: 属性奖励结构
): 亲密互动记录 {
  return 生成亲密互动记录(npcId, type, desc, reward);
}

/**
 * 触发里象修行（双修）
 * @param npc - NPC结构
 * @param 功法Id - 里象功法ID（可选，默认随机选择）
 * @returns 双修结果（奖励+风险）
 */
export function triggerLixiangCultivation(
  npc: NPC结构,
  功法Id?: string
): {
  success: boolean;
  功法?: 里象功法;
  奖励?: 属性奖励结构;
  风险触发?: boolean;
  风险描述?: string;
  message: string;
} {
  const level = 计算亲密度等级(npc.好感度);
  if (level < 5) {
    return {
      success: false,
      message: '亲密度不足，无法进行双修',
    };
  }

  let 功法: 里象功法 | undefined;
  if (功法Id) {
    功法 = getLixiangById(功法Id);
  } else {
    功法 = 里象功法列表[Math.floor(Math.random() * 里象功法列表.length)];
  }

  if (!功法) {
    return {
      success: false,
      message: '未找到可用功法',
    };
  }

  const result = 计算双修收益(功法, npc);
  
  return {
    success: true,
    功法,
    奖励: result.奖励,
    风险触发: result.风险触发,
    风险描述: result.风险描述,
    message: result.风险触发
      ? `双修成功！但触发风险：${result.风险描述}`
      : `双修成功！获得${result.奖励.属性类型}+${result.奖励.数值}`,
  };
}

export { 计算亲密度等级, 生成双修奖励, 计算双修收益, 获取互动等级要求 };
export type { 亲密互动类型, 属性奖励结构, 亲密互动记录, 里象功法 };