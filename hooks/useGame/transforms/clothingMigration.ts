import type { NPC结构, 服装部位 } from '../../../models/social';
import { 确保服装层次已初始化 } from '../../../models/npcNSFWEnhancement/clothingLayers';

/**
 * 将旧存档中的 衣着风格 迁移到 服饰档案，并初始化服装层次
 */
export const 迁移服饰档案 = (npc: NPC结构, _游戏时间?: string): NPC结构 => {
    if (npc.服饰档案 && npc.完整演化状态?.服装层次) return npc;

    let updated = npc;

    if (!npc.服饰档案 && npc.衣着风格 && npc.衣着风格.trim()) {
        const 部位: 服装部位 = {
            名称: npc.衣着风格.trim(),
            描述: npc.衣着风格.trim()
        };
        updated = {
            ...npc,
            服饰档案: {
                上衣: 部位
            }
        };
    }

    // 迁移后初始化服装层次
    if (updated.服饰档案) {
        确保服装层次已初始化(updated);
    }

    return updated;
};

/**
 * 对社交列表中的所有 NPC 执行服饰迁移
 */
export const 批量迁移服饰档案 = (npc列表: NPC结构[], _游戏时间?: string): NPC结构[] => {
    return npc列表.map(npc => 迁移服饰档案(npc, _游戏时间));
};
