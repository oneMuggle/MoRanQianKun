import type { NPC结构 } from '../../models/social';
import type { NSFW场景类型 } from '../../models/system';
import { 获取最亲密动作, 构建亲密度动作约束 } from './intimacy';
import { 计算亲密度等级 } from '../../models/intimacy';
import { 自动选择叙事约束 } from './nsfw';

/**
 * 构建单个 NPC 的 NSFW 角色卡片文本
 * @param npc - NPC 数据结构
 * @param nsfw场景类型 - NSFW 场景档位
 * @returns 角色卡片提示词字符串
 */
export const 构建NPC_NSWF卡片 = (
  npc: NPC结构,
  nsfw场景类型: NSFW场景类型,
  options?: { 时代配置ID?: string }
): string => {
  if (nsfw场景类型 === '无') return '';

  const lines: string[] = [];
  lines.push(`【${npc.姓名}】`);

  // 亲密度等级（优先使用存储值，缺失时从好感度派生）
  const 亲密度等级 = typeof npc.亲密度等级 === 'number'
    ? npc.亲密度等级
    : 计算亲密度等级(typeof npc.好感度 === 'number' ? npc.好感度 : 0);
  lines.push(`亲密度等级: ${亲密度等级}（${获取最亲密动作(亲密度等级)}）`);

  // 动作约束
  const 动作约束 = 构建亲密度动作约束(亲密度等级, nsfw场景类型, { 时代配置ID: options?.时代配置ID });
  if (动作约束) {
    lines.push(`动作约束: ${动作约束}`);
  }

  // 里象心法
  if (npc.里象心法) {
    const 心法 = npc.里象心法;
    const 已解锁 = 亲密度等级 >= 心法.亲密度解锁等级;
    lines.push(`里象心法【${心法.名称}】(${已解锁 ? '已解锁' : `未解锁(需等级${心法.亲密度解锁等级})`})`);
    if (已解锁) {
      lines.push(`表: ${心法.表描述}`);
      lines.push(`里: ${心法.里描述}`);
      lines.push(`描写风格: ${心法.描写风格}`);
    } else {
      lines.push(`(此心法尚未解锁，AI 不应描写相关内容)`);
    }
  }

  // 服装状态 + 服饰名称（基于服装层次）
  if (npc.服饰档案) {
    const 档案 = npc.服饰档案;
    const 层次 = npc.完整演化状态?.服装层次;
    const 服装摘要: string[] = [];
    const 部位映射 = [
      { 部位: '上衣' as const, 标签: '上衣' },
      { 部位: '下着' as const, 标签: '下装' },
      { 部位: '内衣' as const, 标签: '内衣' },
      { 部位: '内裤' as const, 标签: '内裤' },
      { 部位: '袜子' as const, 标签: '袜饰' },
    ] as const;
    for (const m of 部位映射) {
      const 档案值 = 档案?.[m.部位];
      const 层次条目 = 层次?.层次?.find(e => e.部位 === m.部位 && e.损坏程度 !== '移除');
      if (档案值 && 层次条目) {
        const 状态 = 层次条目.损坏程度 !== '完好' ? 层次条目.损坏程度 : undefined;
        const 污渍 = 层次条目.污渍 ? '污渍' : undefined;
        const 修饰 = [状态, 污渍].filter(Boolean).join(',');
        服装摘要.push(修饰 ? `${m.标签}[${档案值.名称}](${修饰})` : `${m.标签}[${档案值.名称}]`);
      } else if (档案值) {
        服装摘要.push(`${m.标签}[${档案值.名称}]`);
      }
    }
    if (服装摘要.length > 0) {
      lines.push(`服装: ${服装摘要.join(', ')}`);
    }
  }

  // 道具档案
  if (npc.道具档案) {
    const 道具 = npc.道具档案;
    const 道具摘要: string[] = [];
    const 道具映射 = [
      { 键: '束缚器具' as const, 标签: '束缚' },
      { 键: '刺激器具' as const, 标签: '刺激' },
      { 键: '穿戴器具' as const, 标签: '穿戴' },
      { 键: '消耗品' as const, 标签: '消耗' },
      { 键: '遥控设备' as const, 标签: '遥控' },
      { 键: '特殊' as const, 标签: '特殊' },
    ] as const;
    for (const m of 道具映射) {
      const 条目 = 道具[m.键];
      if (条目) {
        const 状态后缀 = 条目.状态 ? `(${条目.状态})` : '';
        道具摘要.push(`${m.标签}[${条目.名称}]${状态后缀}`);
      }
    }
    if (道具摘要.length > 0) {
      lines.push(`道具: ${道具摘要.join(', ')}`);
    }
  }

  // NSFW 行为特征
  if (npc.NSFW行为特征) {
    const 特征 = npc.NSFW行为特征;
    lines.push(`主动程度: ${特征.主动程度}`);
    if (特征.反差偏好) lines.push(`反差: ${特征.反差偏好}`);
    if (特征.特殊癖好) lines.push(`癖好: ${特征.特殊癖好}`);
    const 截断 = (text: string, max: number) => text.length > max ? text.slice(0, max) + '...' : text;
    lines.push(`叙事锚点: ${截断(特征.叙事锚点, 200)}`);
  }

  // 里象修行叙事约束（Level 5 时注入）
  if (亲密度等级 >= 5) {
    const 叙事约束 = 自动选择叙事约束(options?.时代配置ID, nsfw场景类型);
    if (叙事约束) {
      lines.push(叙事约束);
    }
  }

  return lines.join('\n');
};

/**
 * 批量构建在场 NPC 的 NSFW 角色卡片组
 * @param npcs - NPC 数组
 * @param nsfw场景类型 - NSFW 场景档位
 * @returns 完整的角色卡片块
 */
export const 构建在场NPC_NSWF卡片组 = (
  npcs: NPC结构[],
  nsfw场景类型: NSFW场景类型,
  options?: { 时代配置ID?: string }
): string => {
  if (nsfw场景类型 === '无') return '';

  const 在场NPC = npcs.filter(npc => npc.是否在场 !== false && npc.性别 === '女');
  if (在场NPC.length === 0) return '';

  const cards = 在场NPC
    .map(npc => 构建NPC_NSWF卡片(npc, nsfw场景类型, options))
    .filter(Boolean);

  if (cards.length === 0) return '';

  return `【在场角色 NSFW 角色卡片】\n${cards.join('\n\n')}`;
};
