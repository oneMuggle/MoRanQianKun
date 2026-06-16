/**
 * nsfwSlice — NSFW 子系统领域状态聚合
 *
 * 涵盖：各 NSFW 子系统状态、BDSM 关系、校园关系等聚合到一处。
 * 本文件为骨架版本（阶段 3.2），后续 useGame.ts 缩身阶段会逐步迁移实际状态。
 */

import type { StateCreator } from 'zustand';

export interface BdSm关系状态 {
    权力倾向: 'dominant' | 'submissive' | 'switch' | null;
    契约状态: 'none' | 'signed' | 'active' | null;
}

export interface Campus关系状态 {
    关系轨道: 'friend' | 'rival' | 'lover' | 'mentor' | null;
    阶段: string;
}

export interface NsfwSliceState {
    /** BDSM 关系状态（按 NPC ID 索引） */
    bdsm关系映射: Record<string, BdSm关系状态>;
    /** 校园关系状态（按 NPC ID 索引） */
    campus关系映射: Record<string, Campus关系状态>;
    /** NSFW 上下文是否已加载 */
    nsfw上下文已加载: boolean;
    /** 当前激活的 NSFW 子系统列表 */
    激活子系统列表: string[];
}

export interface NsfwSliceActions {
    /** 更新 BDSM 关系 */
    更新BDSM关系: (npcId: string, 关系: Partial<BdSm关系状态>) => void;
    /** 加载 NSFW 上下文 */
    加载NSFW上下文: () => void;
}

export type NsfwSlice = NsfwSliceState & NsfwSliceActions;

export const createNsfwSlice: StateCreator<NsfwSlice, [], [], NsfwSlice> = (set) => ({
    bdsm关系映射: {},
    campus关系映射: {},
    nsfw上下文已加载: false,
    激活子系统列表: [],
    更新BDSM关系: (npcId, 关系) => set((s) => ({
        bdsm关系映射: {
            ...s.bdsm关系映射,
            [npcId]: { ...(s.bdsm关系映射[npcId] || { 权力倾向: null, 契约状态: null }), ...关系 },
        },
    })),
    加载NSFW上下文: () => set({ nsfw上下文已加载: true }),
});
