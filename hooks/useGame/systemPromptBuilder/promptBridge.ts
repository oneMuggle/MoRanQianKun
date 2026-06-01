/**
 * Prompt 桥接层 — 将原始提示词函数注册到 PromptRegistry
 *
 * systemPromptBuilder.ts 通过此层调用提示词函数，
 * 模块可以通过 PromptRegistry.registerBuilder 覆盖默认实现。
 *
 * 调用优先级：
 * 1. PromptRegistry 中注册的构建函数（模块覆盖）
 * 2. 此文件中的默认实现（fallback）
 */

import { PromptRegistry } from '../../../core/engine/PromptRegistry';

// ============================================================================
// 原始提示词函数导入（fallback 默认实现）
// ============================================================================

import { 构建时代主题注入, 构建时代文风注入 } from '../../prompts/runtime/eraTheme';
import { 获取时代现实提示词ByEraId } from '../../prompts/core/eraRealism';
import {
  构建子纪元里模式注入,
  子纪元里模式是否已注入,
  构建里模式NPC原型注入,
  构建里模式阶段注入,
} from '../../prompts/runtime/eraLiMode';
import { 构建行动选项运行时指令 } from '../../prompts/runtime/actionOptionsRuntime';
import { 构建校规注入提示词, 构建催眠注入提示词 } from '../campusPromptInjector';
import { 构建设备通讯摘要 } from '../device/triggerDeviceMessageWorkflow';
import { 构建BDSM论坛叙事约束 } from '../../prompts/runtime/bdsmForum';
import { 构建桌游NSFW完整叙事约束 } from '../../prompts/runtime/boardGameNSFW';
import { 构建里武侠世界提示词 } from '../../prompts/runtime/liWuxiaWorld';
import { 构建里志怪世界提示词 } from '../../prompts/runtime/liZhiguaiWorld';
import { 构建志怪世界提示词 } from '../../prompts/runtime/zhiguaiWorld';

// ============================================================================
// 注册参数化提示词到 PromptRegistry
// ============================================================================

PromptRegistry.registerBuilder('era-theme', 'era-theme-inject', 构建时代主题注入);
PromptRegistry.registerBuilder('era-theme', 'era-style-inject', 构建时代文风注入);
PromptRegistry.registerBuilder('era-theme', 'era-realism', 获取时代现实提示词ByEraId);
PromptRegistry.registerBuilder('era-theme', 'liMode-inject', 构建子纪元里模式注入);
PromptRegistry.registerBuilder('era-theme', 'liMode-npc', 构建里模式NPC原型注入);
PromptRegistry.registerBuilder('era-theme', 'liMode-stage', 构建里模式阶段注入);
PromptRegistry.registerBuilder('era-theme', 'liMode-check', 子纪元里模式是否已注入);
PromptRegistry.registerBuilder('nsfw-campus', 'action-options', 构建行动选项运行时指令);
PromptRegistry.registerBuilder('nsfw-campus', 'campus-rules', 构建校规注入提示词);
PromptRegistry.registerBuilder('nsfw-campus', 'campus-hypnosis', 构建催眠注入提示词);
PromptRegistry.registerBuilder('biz-device', 'device-summary', 构建设备通讯摘要);
PromptRegistry.registerBuilder('nsfw-bdsm', 'bdsm-forum', 构建BDSM论坛叙事约束);
PromptRegistry.registerBuilder('nsfw-board-game', 'boardgame-nsfw', 构建桌游NSFW完整叙事约束);
PromptRegistry.registerBuilder('era-theme', 'li-wuxia', 构建里武侠世界提示词);
PromptRegistry.registerBuilder('era-theme', 'li-zhiguai', 构建里志怪世界提示词);
PromptRegistry.registerBuilder('era-theme', 'zhiguai', 构建志怪世界提示词);

// ============================================================================
// 导出适配器 — 优先从 PromptRegistry 调用，fallback 到原始函数
// ============================================================================

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function adapt(name: string, fn: (...args: any[]) => string): (...args: any[]) => string {
  return (...args: any[]) => {
    const builder = PromptRegistry.getBuilder(name);
    return builder ? builder(...args) : fn(...args);
  };
}

export const 构建时代主题注入 = adapt('era-theme-inject', 构建时代主题注入);
export const 构建时代文风注入 = adapt('era-style-inject', 构建时代文风注入);
export const 获取时代现实提示词ByEraId = adapt('era-realism', 获取时代现实提示词ByEraId);
export const 构建子纪元里模式注入 = adapt('liMode-inject', 构建子纪元里模式注入);
export const 构建里模式NPC原型注入 = adapt('liMode-npc', 构建里模式NPC原型注入);
export const 构建里模式阶段注入 = adapt('liMode-stage', 构建里模式阶段注入);
export const 子纪元里模式是否已注入 = adapt('liMode-check', 子纪元里模式是否已注入);
export const 构建行动选项运行时指令 = adapt('action-options', 构建行动选项运行时指令);
export const 构建校规注入提示词 = adapt('campus-rules', 构建校规注入提示词);
export const 构建催眠注入提示词 = adapt('campus-hypnosis', 构建催眠注入提示词);
export const 构建设备通讯摘要 = adapt('device-summary', 构建设备通讯摘要);
export const 构建BDSM论坛叙事约束 = adapt('bdsm-forum', 构建BDSM论坛叙事约束);
export const 构建桌游NSFW完整叙事约束 = adapt('boardgame-nsfw', 构建桌游NSFW完整叙事约束);
export const 构建里武侠世界提示词 = adapt('li-wuxia', 构建里武侠世界提示词);
export const 构建里志怪世界提示词 = adapt('li-zhiguai', 构建里志怪世界提示词);
export const 构建志怪世界提示词 = adapt('zhiguai', 构建志怪世界提示词);
