/**
 * NSFW 后果系统 — 心理追踪
 * 追踪羞耻/麻木/依赖/冒险/后悔五维度变化
 */

import type { NSFW心理状态, 后果系统状态 } from './types';

export function 更新心理维度(
  状态: 后果系统状态,
  维度: '羞耻度' | '麻木度' | '依赖度' | '冒险倾向' | '后悔度',
  增量: number,
  游戏时间: string,
  原因: string
): number {
  const 心理 = 状态.心理状态;
  const 旧值 = 心理[维度];
  const 新值 = clamp(旧值 + 增量, 0, 100);

  if (新值 !== 旧值) {
    心理[维度] = 新值;
    心理.最后更新时间 = 游戏时间;
    状态.心理变化日志.push({
      时间: 游戏时间,
      变化维度: 维度,
      旧值,
      新值,
      触发原因: 原因,
    });
    if (状态.心理变化日志.length > 50) {
      状态.心理变化日志 = 状态.心理变化日志.slice(-50);
    }
  }

  return 新值;
}

export function 应用事件心理影响(
  状态: 后果系统状态,
  事件类型: string,
  严重程度: number = 1,
  游戏时间: string
): void {
  const 系数 = Math.max(0.1, Math.min(2, 严重程度));

  switch (事件类型) {
    case '首次体验':
      更新心理维度(状态, '羞耻度', Math.round(30 * 系数), 游戏时间, '首次NSFW体验');
      更新心理维度(状态, '后悔度', Math.round(15 * 系数), 游戏时间, '首次NSFW体验');
      break;
    case '公共暴露':
      更新心理维度(状态, '羞耻度', Math.round(25 * 系数), 游戏时间, '公共场所暴露');
      更新心理维度(状态, '冒险倾向', Math.round(10 * 系数), 游戏时间, '暴露后脱敏');
      break;
    case '亲密互动':
      更新心理维度(状态, '依赖度', Math.round(10 * 系数), 游戏时间, '亲密互动');
      更新心理维度(状态, '羞耻度', Math.round(-5 * 系数), 游戏时间, '亲密后释然');
      break;
    case '粗暴对待':
      更新心理维度(状态, '麻木度', Math.round(20 * 系数), 游戏时间, '粗暴对待');
      更新心理维度(状态, '羞耻度', Math.round(15 * 系数), 游戏时间, '粗暴对待');
      break;
    case '事后关怀':
      更新心理维度(状态, '依赖度', Math.round(15 * 系数), 游戏时间, '事后关怀');
      更新心理维度(状态, '后悔度', Math.round(-10 * 系数), 游戏时间, '被关怀后释然');
      break;
    case '事后无视':
      更新心理维度(状态, '后悔度', Math.round(20 * 系数), 游戏时间, '事后被无视');
      更新心理维度(状态, '麻木度', Math.round(10 * 系数), 游戏时间, '被无视后麻木');
      break;
    case '人格翻转':
      更新心理维度(状态, '冒险倾向', Math.round(20 * 系数), 游戏时间, '人格翻转');
      更新心理维度(状态, '羞耻度', Math.round(-15 * 系数), 游戏时间, '人格翻转后释放');
      break;
    default:
      更新心理维度(状态, '冒险倾向', Math.round(3 * 系数), 游戏时间, 事件类型);
  }
}

export function 应用心理衰减(
  状态: 后果系统状态,
  游戏时间: string
): void {
  const 衰减率 = 0.5;
  const 基准值: Record<string, number> = {
    羞耻度: 10, 麻木度: 0, 依赖度: 0, 冒险倾向: 5, 后悔度: 5,
  };

  for (const [key, 基准] of Object.entries(基准值)) {
    const 维度 = key as '羞耻度' | '麻木度' | '依赖度' | '冒险倾向' | '后悔度';
    const 当前 = 状态.心理状态[维度];
    const 差值 = 当前 - 基准;
    if (Math.abs(差值) > 衰减率) {
      状态.心理状态[维度] = Math.round((当前 - Math.sign(差值) * 衰减率) * 10) / 10;
    } else {
      状态.心理状态[维度] = 基准;
    }
  }

  状态.心理状态.最后更新时间 = 游戏时间;
}

export function 获取主导心理(状态: 后果系统状态): { 维度: string; 值: number } | null {
  const { 最后更新时间, ...维度 } = 状态.心理状态;
  const entries = Object.entries(维度) as [keyof Omit<NSFW心理状态, '最后更新时间'>, number][];
  if (entries.length === 0) return null;
  const [最强维度, 最强值] = entries.reduce((max, entry) => entry[1] > max[1] ? entry : max);
  return { 维度: 最强维度, 值: 最强值 };
}

export function 生成心理摘要(状态: 后果系统状态): string {
  const { 羞耻度, 麻木度, 依赖度, 冒险倾向, 后悔度 } = 状态.心理状态;
  const 主导: string[] = [];
  if (羞耻度 >= 50) 主导.push('强烈羞耻');
  else if (羞耻度 >= 30) 主导.push('轻微羞耻');
  if (麻木度 >= 50) 主导.push('情感麻木');
  else if (麻木度 >= 30) 主导.push('逐渐麻木');
  if (依赖度 >= 50) 主导.push('深度依赖');
  else if (依赖度 >= 30) 主导.push('产生依赖');
  if (冒险倾向 >= 50) 主导.push('渴望冒险');
  else if (冒险倾向 >= 30) 主导.push('倾向冒险');
  if (后悔度 >= 50) 主导.push('深深后悔');
  else if (后悔度 >= 30) 主导.push('略有后悔');
  return 主导.length > 0 ? `心理状态：${主导.join('、')}` : '心理状态：平静';
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
