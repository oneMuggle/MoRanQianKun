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
// 原始提示词函数导入（用 _raw 前缀避免与导出名 TDZ 冲突）
// ============================================================================

import { 构建时代主题注入 as _rawEraTheme, 构建时代文风注入 as _rawEraStyle } from '../../../prompts/runtime/eraTheme';
import { 获取时代现实提示词ByEraId as _rawEraRealism } from '../../../prompts/core/eraRealism';
import {
  构建子纪元里模式注入 as _rawLiModeInject,
  子纪元里模式是否已注入 as _rawLiModeCheck,
  构建里模式NPC原型注入 as _rawLiModeNpc,
  构建里模式阶段注入 as _rawLiModeStage,
} from '../../../prompts/runtime/eraLiMode';
import { 构建行动选项运行时指令 as _rawActionOpts } from '../../../prompts/runtime/actionOptionsRuntime';
import { 构建校规注入提示词 as _rawCampusRules, 构建催眠注入提示词 as _rawCampusHypnosis } from '../nsfw/campusPromptInjector';
import { 构建设备通讯摘要 as _rawDeviceSummary } from '../device/triggerDeviceMessageWorkflow';
import { 构建BDSM论坛叙事约束 as _rawBdsmForum } from '../../../prompts/runtime/bdsmForum';
import { 构建桌游NSFW完整叙事约束 as _rawBoardGame } from '../../../prompts/runtime/boardGameNSFW';
import { 构建里武侠世界提示词 as _rawLiWuxia } from '../../../prompts/runtime/liWuxiaWorld';
import { 构建里志怪世界提示词 as _rawLiZhiguai } from '../../../prompts/runtime/liZhiguaiWorld';
import { 构建志怪世界提示词 as _rawZhiguai } from '../../../prompts/runtime/zhiguaiWorld';

// ============================================================================
// 注册参数化提示词到 PromptRegistry
// ============================================================================

PromptRegistry.registerBuilder('era-theme', 'era-theme-inject', _rawEraTheme);
PromptRegistry.registerBuilder('era-theme', 'era-style-inject', _rawEraStyle);
PromptRegistry.registerBuilder('era-theme', 'era-realism', _rawEraRealism);
PromptRegistry.registerBuilder('era-theme', 'liMode-inject', _rawLiModeInject);
PromptRegistry.registerBuilder('era-theme', 'liMode-npc', _rawLiModeNpc);
PromptRegistry.registerBuilder('era-theme', 'liMode-stage', _rawLiModeStage);
PromptRegistry.registerBuilder('era-theme', 'liMode-check', _rawLiModeCheck);
PromptRegistry.registerBuilder('nsfw-campus', 'action-options', _rawActionOpts);
PromptRegistry.registerBuilder('nsfw-campus', 'campus-rules', _rawCampusRules);
PromptRegistry.registerBuilder('nsfw-campus', 'campus-hypnosis', _rawCampusHypnosis);
PromptRegistry.registerBuilder('biz-device', 'device-summary', _rawDeviceSummary);
PromptRegistry.registerBuilder('nsfw-bdsm', 'bdsm-forum', _rawBdsmForum);
PromptRegistry.registerBuilder('nsfw-board-game', 'boardgame-nsfw', _rawBoardGame);
PromptRegistry.registerBuilder('era-theme', 'li-wuxia', _rawLiWuxia);
PromptRegistry.registerBuilder('era-theme', 'li-zhiguai', _rawLiZhiguai);
PromptRegistry.registerBuilder('era-theme', 'zhiguai', _rawZhiguai);

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

export const 构建时代主题注入 = adapt('era-theme-inject', _rawEraTheme);
export const 构建时代文风注入 = adapt('era-style-inject', _rawEraStyle);
export const 获取时代现实提示词ByEraId = adapt('era-realism', _rawEraRealism);
export const 构建子纪元里模式注入 = adapt('liMode-inject', _rawLiModeInject);
export const 构建里模式NPC原型注入 = adapt('liMode-npc', _rawLiModeNpc);
export const 构建里模式阶段注入 = adapt('liMode-stage', _rawLiModeStage);
export const 子纪元里模式是否已注入 = adapt('liMode-check', _rawLiModeCheck);
export const 构建行动选项运行时指令 = adapt('action-options', _rawActionOpts);
export const 构建校规注入提示词 = adapt('campus-rules', _rawCampusRules);
export const 构建催眠注入提示词 = adapt('campus-hypnosis', _rawCampusHypnosis);
export const 构建设备通讯摘要 = adapt('device-summary', _rawDeviceSummary);
export const 构建BDSM论坛叙事约束 = adapt('bdsm-forum', _rawBdsmForum);
export const 构建桌游NSFW完整叙事约束 = adapt('boardgame-nsfw', _rawBoardGame);
export const 构建里武侠世界提示词 = adapt('li-wuxia', _rawLiWuxia);
export const 构建里志怪世界提示词 = adapt('li-zhiguai', _rawLiZhiguai);
export const 构建志怪世界提示词 = adapt('zhiguai', _rawZhiguai);
