/**
 * NSFW 视觉状态 Hook
 * 从 NPC 数据、场景修饰、心理状态计算 UI 展示所需的聚合状态
 */

import { useMemo } from 'react';
import type { NPC结构 } from '../models/social';
import type {
  服装层次结构,
  事后护理状态,
  孕产演化状态,
} from '../models/npcNSFWEnhancement/types';
import type { 场景修饰系数 } from '../models/npcNSFWEnhancement/sceneModifiers';
import type { NSFW心理状态 } from '../models/npcNSFWEnhancement/consequences/types';

export type 亲密度阶段 = '陌生人' | '初识' | ' acquaintance' | '朋友' | '暧昧' | '恋人' | '亲密' | '挚爱' | '灵魂伴侣' | '血脉相连' | '极致羁绊';

export interface NSFW情绪指标 {
  主导情绪: string;
  情绪强度: number;
  情绪颜色: string;
}

export interface NSFWBarState {
  label: string;
  value: number;
  max: number;
  color: string;
  tooltip?: string;
}

export interface NSFWVisualState {
  bars: NSFWBarState[];
  情绪: NSFW情绪指标 | null;
  亲密度阶段: 亲密度阶段;
  风险等级: { level: number; text: string; color: string };
  服装状态文本: string | null;
  心理状态摘要: string | null;
  事后情绪摘要: string | null;
  孕产阶段文本: string | null;
}

const 亲密度阶段映射: 亲密度阶段[] = [
  '陌生人', '初识', ' acquaintance', '朋友', '暧昧',
  '恋人', '亲密', '挚爱', '灵魂伴侣', '血脉相连', '极致羁绊',
];

function 计算亲密度阶段(亲密度等级?: number): 亲密度阶段 {
  if (亲密度等级 == null) return '陌生人';
  const idx = Math.min(Math.floor(亲密度等级 / 10), 亲密度阶段映射.length - 1);
  return 亲密度阶段映射[Math.max(0, idx)];
}

function 计算风险等级(修饰?: 场景修饰系数 | null): { level: number; text: string; color: string } {
  if (!修饰) return { level: 1, text: '安全', color: 'text-green-400' };
  const 风险 = 修饰.暴露风险;
  if (风险 >= 80) return { level: 5, text: '极度危险', color: 'text-red-500' };
  if (风险 >= 60) return { level: 4, text: '高风险', color: 'text-orange-400' };
  if (风险 >= 40) return { level: 3, text: '中等风险', color: 'text-yellow-400' };
  if (风险 >= 20) return { level: 2, text: '低风险', color: 'text-blue-400' };
  return { level: 1, text: '安全', color: 'text-green-400' };
}

function 获取服装文本(服装层次?: 服装层次结构, 当前服装?: NPC结构['当前服装状态']): string | null {
  if (服装层次?.层次.length) {
    const 损坏 = 服装层次.层次.filter(l => l.损坏程度 !== '完好');
    if (损坏.length) return `服装异常：${损坏.map(d => `${d.名称}(${d.损坏程度})`).join('、')}`;
    const 污渍数 = 服装层次.层次.filter(l => l.污渍).length;
    if (污渍数) return `${污渍数}件衣物有污渍`;
  }
  if (当前服装) {
    const 异常: string[] = [];
    if (当前服装.上衣状态 === '半敞') 异常.push('上衣半敞');
    if (当前服装.下装状态 === '半敞') 异常.push('下装半敞');
    if (当前服装.内衣状态 !== '穿着') 异常.push('内衣异常');
    if (当前服装.内裤状态 !== '穿着') 异常.push('内裤异常');
    return 异常.length ? 异常.join('、') : null;
  }
  return null;
}

function 获取心理摘要(心理?: NSFW心理状态): string | null {
  if (!心理) return null;
  const items: string[] = [];
  if (心理.羞耻度 > 30) items.push(`羞耻${Math.round(心理.羞耻度)}`);
  if (心理.麻木度 > 30) items.push(`麻木${Math.round(心理.麻木度)}`);
  if (心理.依赖度 > 30) items.push(`依赖${Math.round(心理.依赖度)}`);
  if (心理.冒险倾向 > 30) items.push(`冒险${Math.round(心理.冒险倾向)}`);
  if (心理.后悔度 > 30) items.push(`后悔${Math.round(心理.后悔度)}`);
  return items.length ? items.join(' | ') : null;
}

function 获取事后摘要(护理?: 事后护理状态): string | null {
  if (!护理?.当前情绪.length) return null;
  const 主导 = 护理.当前情绪.sort((a, b) => b.强度 - a.强度)[0];
  const 质量 = 护理.护理质量 ?? '无视';
  return `${主导.情绪类型}(${Math.round(主导.强度)}) · 护理:${质量}`;
}

function 获取孕产文本(孕产?: 孕产演化状态): string | null {
  if (!孕产 || 孕产.当前阶段 === '未受孕') return null;
  return 孕产.当前阶段;
}

export function useNSFWVisualState(
  npc: NPC结构 | null,
  场景修饰?: 场景修饰系数 | null,
  心理状态?: NSFW心理状态 | null,
): NSFWVisualState {
  return useMemo(() => {
    if (!npc) {
      return {
        bars: [],
        情绪: null,
        亲密度阶段: '陌生人',
        风险等级: { level: 1, text: '安全', color: 'text-green-400' },
        服装状态文本: null,
        心理状态摘要: null,
        事后情绪摘要: null,
        孕产阶段文本: null,
      };
    }

    const 演化 = npc.完整演化状态;
    const 防线 = 演化?.心理防线;
    const 护理 = 演化?.事后护理;
    const 孕产 = 演化?.孕产演化;
    const 服装层次 = 演化?.服装层次;

    const bars: NSFWBarState[] = [];

    // 亲密度条
    bars.push({
      label: '亲密度',
      value: npc.亲密度等级 ?? 0,
      max: 100,
      color: 'from-pink-500 to-rose-500',
      tooltip: 计算亲密度阶段(npc.亲密度等级),
    });

    // 防线条
    if (防线) {
      bars.push({
        label: '心理防线',
        value: 防线.防线值,
        max: 100,
        color: 防线.防线值 < 25 ? 'from-red-500 to-orange-500' : 防线.防线值 < 50 ? 'from-yellow-500 to-amber-500' : 'from-blue-500 to-cyan-500',
        tooltip: `等级: ${防线.当前等级}`,
      });
    }

    const 风险等级 = 计算风险等级(场景修饰);
    const 服装状态文本 = 获取服装文本(服装层次, npc.当前服装状态);
    const 心理状态摘要 = 获取心理摘要(心理状态 ?? undefined);
    const 事后情绪摘要 = 获取事后摘要(护理);
    const 孕产阶段文本 = 获取孕产文本(孕产);

    return {
      bars,
      情绪: null,
      亲密度阶段: 计算亲密度阶段(npc.亲密度等级),
      风险等级,
      服装状态文本,
      心理状态摘要,
      事后情绪摘要,
      孕产阶段文本,
    };
  }, [npc, 场景修饰, 心理状态]);
}
