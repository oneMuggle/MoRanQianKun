import { 标准化单个NPC, 合并同名NPC列表 } from './npcNormalization';
import { 迁移服饰档案 } from './clothingMigration';

export function 规范化社交列表(list: any[], options?: { 合并同名?: boolean }): any[] {
  if (!Array.isArray(list)) return [];
  const normalized = list.map((npc, index) => {
    const npcData = 标准化单个NPC(npc, index);
    return 迁移服饰档案(npcData);
  });
  if (options?.合并同名 === false) return normalized;
  return 合并同名NPC列表(normalized);
}
