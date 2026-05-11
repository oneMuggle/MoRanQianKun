import type { NPC结构, 服装部位 } from '../../../models/social';

/**
 * 将旧存档中的 衣着风格 迁移到 服饰档案
 */
export const 迁移服饰档案 = (npc: NPC结构): NPC结构 => {
    if (npc.服饰档案) return npc;

    if (npc.衣着风格 && npc.衣着风格.trim()) {
        const 部位: 服装部位 = {
            名称: npc.衣着风格.trim(),
            描述: npc.衣着风格.trim()
        };
        return {
            ...npc,
            服饰档案: {
                上衣: 部位
            }
        };
    }

    return npc;
};

/**
 * 对社交列表中的所有 NPC 执行服饰迁移
 */
export const 批量迁移服饰档案 = (npc列表: NPC结构[]): NPC结构[] => {
    return npc列表.map(迁移服饰档案);
};
