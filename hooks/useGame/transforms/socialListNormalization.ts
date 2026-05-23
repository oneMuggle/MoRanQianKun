import { 标准化单个NPC, 合并同名NPC列表 } from './npcNormalization';
import { 迁移服饰档案 } from './clothingMigration';
import { 自动填充NSFW档案, 应启用增强档案 } from '../../../models/npcNSFWEnhancement/linkage';
import { 初始化演化状态 } from '../../../models/npcNSFWEnhancement/evolutionEngine';

export interface 规范化社交列表选项 {
  合并同名?: boolean;
  eraId?: string | null;
}

export function 规范化社交列表(list: any[], options?: 规范化社交列表选项): any[] {
  if (!Array.isArray(list)) return [];
  const eraId = options?.eraId ?? '';
  const normalized = list.map((npc, index) => {
    let npcData = 标准化单个NPC(npc, index);
    npcData = 迁移服饰档案(npcData);

    // 确保演化状态已初始化
    初始化演化状态(npcData);

    // 自动填充空白的 NSFW 档案
    if (应启用增强档案(npcData)) {
      const 需要填充性癖 = !npcData.性癖档案 || (Array.isArray(npcData.性癖档案.核心偏好) && npcData.性癖档案.核心偏好.length === 0);
      const 需要填充敏感点 = !npcData.敏感点档案 || (Array.isArray(npcData.敏感点档案.主要敏感点) && npcData.敏感点档案.主要敏感点.length === 0);
      const 需要填充人格 = !npcData.人格档案;

      if (需要填充性癖 || 需要填充敏感点 || 需要填充人格) {
        const 填充结果 = 自动填充NSFW档案(npcData, eraId || undefined);
        if (需要填充性癖 && 填充结果.性癖档案) {
          npcData = { ...npcData, 性癖档案: 填充结果.性癖档案 };
        }
        if (需要填充敏感点 && 填充结果.敏感点档案) {
          npcData = { ...npcData, 敏感点档案: 填充结果.敏感点档案 };
        }
        if (需要填充人格 && 填充结果.人格档案) {
          npcData = { ...npcData, 人格档案: 填充结果.人格档案 };
        }
      }
    }

    return npcData;
  });
  if (options?.合并同名 === false) return normalized;
  return 合并同名NPC列表(normalized);
}
