/**
 * models/system/index.ts
 *
 * Barrel re-export 入口。集中暴露 models/system 子目录下的全部类型与配置。
 * 对外仍可从 `models/system`（即 `../system/index`）import 所有原本在 system.ts 内的成员。
 */

export * from './types';
export * from './api-config';
export * from './ui-settings';
export * from './game-config';
export * from './memory-config';
export * from './visual-config';

// 时代主题相关 helpers 与 const 由 game-config.ts 持有（紧耦合 全部时代配置）。
// 视觉主题相关 type alias 由 visual-config.ts 持有（保留扩展位）。
