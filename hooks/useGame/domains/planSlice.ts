/**
 * planSlice — 故事计划与变量生成领域状态
 *
 * 涵盖：故事计划、变量生成上下文、规划更新。
 * 本文件为骨架版本（阶段 3.2），后续 useGame.ts 缩身阶段会逐步迁移实际状态。
 */

import type { StateCreator } from 'zustand';

export interface PlanSliceState {
    /** 当前故事计划 */
    故事计划: any;
    /** 变量生成上下文（最近一次生成的快照） */
    变量生成上下文: any;
    /** 规划是否正在更新 */
    规划更新中: boolean;
    /** 最近一次规划更新时间戳 */
    最近规划更新时间: number | null;
}

export interface PlanSliceActions {
    /** 更新故事计划 */
    更新故事计划: (plan: any) => void;
    /** 应用变量校准 */
    应用变量校准: (calibration: any) => void;
}

export type PlanSlice = PlanSliceState & PlanSliceActions;

export const createPlanSlice: StateCreator<PlanSlice, [], [], PlanSlice> = (set) => ({
    故事计划: null,
    变量生成上下文: null,
    规划更新中: false,
    最近规划更新时间: null,
    更新故事计划: (plan) => set({
        故事计划: plan,
        最近规划更新时间: Date.now(),
    }),
    应用变量校准: (calibration) => set((s) => ({
        变量生成上下文: { ...(s.变量生成上下文 || {}), ...calibration },
    })),
});
