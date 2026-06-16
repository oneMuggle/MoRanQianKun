/**
 * NSFW 记忆库 — 数据结构
 * 记录重要NSFW事件、记忆检索、记忆触发
 */

// ==================== NSFW记忆类型 ====================

export type NSFW记忆类别 =
  | '首次体验'
  | '突破事件'
  | '情感高潮'
  | '特殊场景'
  | '道具使用'
  | '角色扮演'
  | '多人互动'
  | '事后温馨';

export interface NSFW记忆条目 {
  id: string;
  类别: NSFW记忆类别;
  标题: string;
  描述: string;
  发生时间: string;
  关联NPC: string[];
  地点?: string;
  重要度: number;  // 1-5
  情感色彩: '正面' | '负面' | '中性' | '复杂';
  解锁内容?: string[];
  回忆触发词: string[];
  衰减系数: number;
  当前强度: number;  // 0-100
  最后回忆时间?: string;
}

export interface NSFW记忆库 {
  记忆列表: NSFW记忆条目[];
  总记忆数: number;
  最后更新时间: string;
}

// ==================== 纯函数 ====================

/**
 * 添加NSFW记忆
 */
export function 添加NSFW记忆(
  记忆库: NSFW记忆库,
  新记忆: Omit<NSFW记忆条目, 'id' | '当前强度' | '衰减系数' | '最后回忆时间'>
): NSFW记忆库 {
  const 记忆条目: NSFW记忆条目 = {
    ...新记忆,
    id: `nsfw_memory_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    当前强度: 100,
    衰减系数: 0.95,
    最后回忆时间: undefined,
  };

  return {
    ...记忆库,
    记忆列表: [...记忆库.记忆列表, 记忆条目],
    总记忆数: 记忆库.总记忆数 + 1,
    最后更新时间: new Date().toISOString(),
  };
}

/**
 * 记忆自然衰减
 */
export function 计算记忆衰减(记忆库: NSFW记忆库): NSFW记忆库 {
  const 新记忆列表 = 记忆库.记忆列表
    .map(记忆 => ({
      ...记忆,
      当前强度: Math.max(0, 记忆.当前强度 * 记忆.衰减系数),
    }))
    .filter(记忆 => 记忆.当前强度 > 5);

  return {
    ...记忆库,
    记忆列表: 新记忆列表,
    最后更新时间: new Date().toISOString(),
  };
}

/**
 * 检索相关记忆
 */
export function 检索相关记忆(
  记忆库: NSFW记忆库,
  触发词: string[]
): NSFW记忆条目[] {
  return 记忆库.记忆列表
    .filter(记忆 =>
      记忆.回忆触发词.some(词 =>
        触发词.some(触发 => 词.includes(触发) || 触发.includes(词))
      )
    )
    .sort((a, b) => b.当前强度 - a.当前强度)
    .slice(0, 5);
}

/**
 * 回忆记忆（增强强度）
 */
export function 回忆记忆(
  记忆库: NSFW记忆库,
  记忆Id: string
): NSFW记忆库 {
  const 新记忆列表 = 记忆库.记忆列表.map(记忆 => {
    if (记忆.id === 记忆Id) {
      return {
        ...记忆,
        当前强度: Math.min(100, 记忆.当前强度 + 20),
        最后回忆时间: new Date().toISOString(),
      };
    }
    return 记忆;
  });

  return {
    ...记忆库,
    记忆列表: 新记忆列表,
    最后更新时间: new Date().toISOString(),
  };
}

/**
 * 获取记忆摘要（用于AI提示词注入）
 */
export function 获取记忆摘要(记忆库: NSFW记忆库, 关联NPC: string): string {
  const 相关记忆 = 记忆库.记忆列表
    .filter(m => m.关联NPC.includes(关联NPC) && m.当前强度 > 30)
    .sort((a, b) => b.当前强度 - a.当前强度)
    .slice(0, 3);

  if (相关记忆.length === 0) return '';

  return 相关记忆
    .map(m => `[记忆] ${m.标题}（强度:${Math.round(m.当前强度)}%）-${m.描述}`)
    .join('\n');
}

export function 创建初始记忆库(): NSFW记忆库 {
  return {
    记忆列表: [],
    总记忆数: 0,
    最后更新时间: new Date().toISOString(),
  };
}
