/**
 * 条件使用的提示词模块预加载层
 *
 * 这些模块仅在特定游戏配置下使用。
 * 通过独立文件组织，减少 systemPromptBuilder.ts 的 import 数量，
 * 便于后续按需拆分和 Vite chunk 优化。
 */

// 里模式
export { 构建里武侠世界提示词 } from '../../../prompts/runtime/liWuxiaWorld';
export { 构建里志怪世界提示词 } from '../../../prompts/runtime/liZhiguaiWorld';
export { 构建志怪世界提示词 } from '../../../prompts/runtime/zhiguaiWorld';

// 行动选项
export { 构建行动选项运行时指令 } from '../../../prompts/runtime/actionOptionsRuntime';

// 校园系统
export { 构建校规注入提示词, 构建催眠注入提示词 } from '../campusPromptInjector';

// 设备
export { 构建设备通讯摘要 } from '../device/triggerDeviceMessageWorkflow';

// NSFW 条件提示词
export { 构建BDSM论坛叙事约束 } from '../../../prompts/runtime/bdsmForum';
export { 构建桌游NSFW完整叙事约束 } from '../../../prompts/runtime/boardGameNSFW';
