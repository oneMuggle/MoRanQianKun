/**
 * models/system/visual-config.ts
 *
 * Day 34: 视觉主题（ThemePreset / 时代主题映射 / 视觉设置 helpers）。
 * 注：视觉设置结构 等大型 interface 已在 ./ui-settings.ts 中声明，
 * 此文件仅承担"主题"相关的小型定义 + re-export。
 *
 * 当前实现：仅持有 ThemePreset 的 re-export。时代主题映射表 const 与 helpers
 * 位于 game-config.ts（紧耦合 全部时代配置 const，归入 game-config 更内聚）。
 */

// 占位：当前视觉主题相关类型已在 types.ts 中声明（ThemePreset 等），
// 时代主题映射表 const 与 获取时代推荐主题 / 获取时代信息 / 获取时代背景 helpers
// 位于 game-config.ts（这些 helpers 紧密耦合 全部时代配置 const，归入 game-config 更内聚）。
//
// 此文件保留以匹配 spec 文件结构，便于未来扩展（如自定义主题方案库 / 纪元主题切换器）。

export type { ThemePreset } from './types';
