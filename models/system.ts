/**
 * models/system.ts — Re-export shim (Day 31-34 Phase 3 拆分完成)
 *
 * 本文件已拆分为 `models/system/` 子目录下的 6 个职责文件：
 *   - types.ts        跨子模块共用的小型类型
 *   - api-config.ts   API/图片生成/角色锚点（re-export ../api-config）
 *   - ui-settings.ts  UI 文字样式/字体/视觉设置结构/性能监控
 *   - game-config.ts  时代/世界/能力/难度/同人/酒馆/Open/WorldGen/游戏设置
 *   - memory-config.ts 记忆系统/存档结构/聊天记录/提示词/节日
 *   - visual-config.ts 视觉主题（ThemePreset re-export）
 *
 * 100% 兼容：原本 `import { X } from 'models/system'` 的 71 个调用点无需修改。
 *
 * 维护规则：
 *   - 任何 system 相关类型/常量/函数变更请进入 `models/system/` 子目录对应文件
 *   - 本文件不要新增任何业务实现，仅作为 re-export 入口
 */

export * from './system/index';

// eraTheme 相关转发（保留原有对外契约）
export { 获取时代主题方案, 时代主题方案列表 } from './eraTheme';
export type { 时代主题方案 } from './eraTheme';

// 时代配置数据转发（保留原有对外契约）
export { 内置时代配置, 新增时代配置 } from './system/eraPresets';
