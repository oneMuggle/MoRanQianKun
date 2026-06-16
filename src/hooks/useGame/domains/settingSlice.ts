/**
 * settingSlice — 设置与配置领域状态
 *
 * 涵盖：API 配置、视觉设置、记忆配置、图像管理设置等。
 * 本文件为骨架版本（阶段 3.2），后续 useGame.ts 缩身阶段会逐步迁移实际状态。
 */

import type { StateCreator } from 'zustand';

export interface SettingSliceState {
    /** API 配置（接口供应商、密钥、模型名等） */
    apiConfig: any;
    /** 视觉设置（主题、字体、布局） */
    visualConfig: any;
    /** 记忆系统配置 */
    memoryConfig: any;
    /** 图像管理设置 */
    imageManagerConfig: any;
    /** 是否正在持久化设置 */
    持久化中: boolean;
}

export interface SettingSliceActions {
    /** 持久化设置（写入 IndexedDB） */
    持久化设置: () => void;
    /** 规范化设置（去重/补全默认值） */
    规范化设置: () => void;
}

export type SettingSlice = SettingSliceState & SettingSliceActions;

export const createSettingSlice: StateCreator<SettingSlice, [], [], SettingSlice> = (set) => ({
    apiConfig: null,
    visualConfig: null,
    memoryConfig: null,
    imageManagerConfig: null,
    持久化中: false,
    持久化设置: () => set({ 持久化中: true }),
    规范化设置: () => set({ 持久化中: false }),
});
