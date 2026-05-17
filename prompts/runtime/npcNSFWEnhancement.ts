/**
 * NPC NSFW 增强模块 — AI 叙事 prompt 注入
 * 将结构化 NSFW 画像转化为 AI 叙事指引
 */

import { NPC结构 } from '../../models/social';
import { 生成NSFW画像, 应启用增强档案 } from '../../models/npcNSFWEnhancement/linkage';
import { 生成触发事件列表 } from '../../models/npcNSFWEnhancement/eventMapping';
import type { LiModeIntensity } from './eraLiMode';

/**
 * 构建 NPC NSFW 增强注入提示词
 */
export function 构建NPCNSFW注入(
  npc: NPC结构,
  eraId: string | null | undefined,
  nsfwEnabled: boolean = true,
  _intensity?: LiModeIntensity
): string | null {
  if (!nsfwEnabled || !应启用增强档案(npc)) return null;

  const 画像 = 生成NSFW画像(npc, eraId);
  const 人格状态 = npc.当前人格状态 ?? '表';
  const 活跃人格 = 人格状态 === '里' && 画像.人格 ? 画像.人格.里 : 画像.人格?.表;

  const 组件: string[] = [];

  组件.push(`【${npc.姓名} — NSFW 画像】`);
  组件.push(`人格状态：${人格状态}${活跃人格 ? `（${活跃人格.性格描述.substring(0, 30)}…）` : ''}`);

  if (画像.性癖.核心偏好.length > 0) {
    组件.push(`性癖倾向：${画像.性癖.倾向摘要}`);
    组件.push(`具体偏好：${画像.性癖.核心偏好.map(p => `${p.子类型}(${p.强度}/5)`).join('、')}`);
  }

  if (画像.敏感点.主要敏感点.length > 0) {
    组件.push(`敏感区域：${画像.敏感点.主要敏感点.map(p => `${p.时代名称 || p.名称}(敏感度${p.敏感度})`).join('、')}`);
  }

  if (画像.推荐场景.length > 0) {
    组件.push(`适合场景：${画像.推荐场景.slice(0, 3).join('、')}`);
  }

  if (画像.性癖.绝对禁忌.length > 0) {
    组件.push(`绝对禁忌：${画像.性癖.绝对禁忌.join('、')}`);
  }

  if (画像.性癖.隐藏偏好.length > 0) {
    组件.push('注意：该角色还有尚未暴露的隐藏偏好，随着关系深入可能逐渐展现。');
  }

  组件.push('');
  组件.push('叙事指引：');

  if (画像.人格) {
    const 表描述 = 画像.人格.表.性格描述;
    const 里描述 = 画像.人格.里.性格描述;
    组件.push(`- 该角色表人格为"${表描述.substring(0, 20)}…"，里人格为"${里描述.substring(0, 20)}…"`);
    组件.push(`- 当前处于${人格状态}人格，行为对话应符合${人格状态}人格特质`);
    组件.push(`- 里人格触发条件：${画像.人格.激活条件.时间条件 ?? '无特定时间'}，${画像.人格.激活条件.地点条件 ?? '无特定地点'}`);
  }

  if (画像.性癖.核心偏好.length > 0) {
    const 最强 = 画像.性癖.核心偏好.reduce((a, b) => a.强度 > b.强度 ? a : b);
    组件.push(`- 亲密互动中应体现"${最强.子类型}"的倾向（${最强.描述.substring(0, 25)}…）`);
  }

  if (画像.敏感点.主要敏感点.length > 0) {
    const 最敏感 = 画像.敏感点.主要敏感点.reduce((a, b) => a.敏感度 > b.敏感度 ? a : b);
    const 名 = 最敏感.时代名称 || 最敏感.名称;
    组件.push(`- 触碰${名}时应描写"${最敏感.反应描述.substring(0, 20)}…"`);
  }

  组件.push('');
  组件.push('【性癖变化报告】');
  组件.push('当该NPC经历了可能影响其性癖的事件时，在响应末尾输出：');
  组件.push('<性癖变化>');
  组件.push(`{"npc姓名": "${npc.姓名}", "触发事件": "{事件类型}", "事件描述": "{简短描述}"}`);
  组件.push('</性癖变化>');
  组件.push(`可用触发事件：${生成触发事件列表()}`);
  组件.push('注意：仅在确实发生了显著影响性癖的事件时才输出，不要每回合都输出。');

  return 组件.join('\n');
}

/**
 * 构建精简版 NSFW 注入（用于 token 紧张时使用）
 */
export function 构建NPCNSFW精简注入(
  npc: NPC结构,
  eraId: string | null | undefined,
  nsfwEnabled: boolean = true
): string | null {
  if (!nsfwEnabled || !应启用增强档案(npc)) return null;

  const 画像 = 生成NSFW画像(npc, eraId);
  const parts = [`【${npc.姓名}】`];

  if (画像.人格) {
    const 状态 = npc.当前人格状态 ?? '表';
    const 人格 = 状态 === '里' ? 画像.人格.里 : 画像.人格.表;
    parts.push(`${状态}人格：${人格.性格描述.substring(0, 25)}…`);
  }

  if (画像.性癖.倾向摘要) {
    parts.push(画像.性癖.倾向摘要);
  }

  if (画像.敏感点.弱点摘要) {
    parts.push(画像.敏感点.弱点摘要);
  }

  return parts.join(' | ');
}
