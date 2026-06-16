/**
 * memorySlice — 记忆系统领域状态
 *
 * 涵盖：待处理记忆总结任务、记忆总结阶段/草稿、后台记忆总结状态。
 * 本文件为骨架版本（阶段 3.2），后续 useGame.ts 缩身阶段会逐步迁移实际状态。
 */

import type { StateCreator } from 'zustand';
import type { 记忆压缩任务结构 } from '../memory/memoryUtils';
import type { 记忆总结阶段类型, NPC记忆总结任务结构 } from '../memory/memorySummaryHandlers';

export type 后台记忆总结状态类型 = 'idle' | 'running' | 'done' | 'error';

export interface MemorySliceState {
    /** 待处理的主线记忆总结任务 */
    待处理记忆总结任务: 记忆压缩任务结构 | null;
    /** 主线记忆总结阶段 */
    记忆总结阶段: 记忆总结阶段类型;
    /** 主线记忆总结草稿 */
    记忆总结草稿: string;
    /** 待处理的 NPC 记忆总结任务队列 */
    待处理NPC记忆总结队列: NPC记忆总结任务结构[];
    /** NPC 记忆总结阶段 */
    NPC记忆总结阶段: 记忆总结阶段类型;
    /** 后台记忆总结状态 */
    后台记忆总结状态: 后台记忆总结状态类型;
    /** 后台记忆总结草稿 */
    后台记忆总结草稿: string;
}

export interface MemorySliceActions {
    /** 触发一次记忆总结流程 */
    触发记忆总结: (task: 记忆压缩任务结构) => void;
    /** 更新记忆总结阶段 */
    更新记忆阶段: (stage: 记忆总结阶段类型) => void;
    /** 清空总结流程（任务/草稿/阶段） */
    清空总结流程: () => void;
}

export type MemorySlice = MemorySliceState & MemorySliceActions;

export const createMemorySlice: StateCreator<MemorySlice, [], [], MemorySlice> = (set) => ({
    待处理记忆总结任务: null,
    记忆总结阶段: 'idle',
    记忆总结草稿: '',
    待处理NPC记忆总结队列: [],
    NPC记忆总结阶段: 'idle',
    后台记忆总结状态: 'idle',
    后台记忆总结草稿: '',
    触发记忆总结: (task) => set({ 待处理记忆总结任务: task, 记忆总结阶段: 'remind' }),
    更新记忆阶段: (stage) => set({ 记忆总结阶段: stage }),
    清空总结流程: () => set({
        待处理记忆总结任务: null,
        记忆总结阶段: 'idle',
        记忆总结草稿: '',
    }),
});
