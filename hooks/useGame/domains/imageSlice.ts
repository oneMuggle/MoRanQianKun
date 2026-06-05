/**
 * imageSlice — 图片档案领域状态
 *
 * 涵盖：NPC 头像/秘档、场景图片、主角立绘的存档与读档。
 * 本文件为骨架版本（阶段 3.2），后续 useGame.ts 缩身阶段会逐步迁移实际状态。
 */

import type { StateCreator } from 'zustand';

export interface ImageSliceState {
    /** NPC 图片档案：npcId → 记录数组 */
    npcImageArchive: Record<string, any[]>;
    /** 场景图片档案：sceneId → 记录 */
    sceneImageArchive: Record<string, any>;
    /** 主角立绘档案 */
    playerImageArchive: any;
}

export interface ImageSliceActions {
    /** 追加单条 NPC 图片记录 */
    appendNpcImage: (npcId: string, record: any) => void;
    /** 批量合并 NPC 图片记录 */
    mergeNpcImages: (npcId: string, records: any[]) => void;
    /** 加载场景图片档案 */
    loadSceneImageArchive: (sceneId: string, archive: any) => void;
}

export type ImageSlice = ImageSliceState & ImageSliceActions;

export const createImageSlice: StateCreator<ImageSlice, [], [], ImageSlice> = (set) => ({
    npcImageArchive: {},
    sceneImageArchive: {},
    playerImageArchive: null,
    appendNpcImage: (npcId, record) => set((s) => ({
        npcImageArchive: {
            ...s.npcImageArchive,
            [npcId]: [...(s.npcImageArchive[npcId] || []), record],
        },
    })),
    mergeNpcImages: (npcId, records) => set((s) => ({
        npcImageArchive: {
            ...s.npcImageArchive,
            [npcId]: [...(s.npcImageArchive[npcId] || []), ...records],
        },
    })),
    loadSceneImageArchive: (sceneId, archive) => set((s) => ({
        sceneImageArchive: { ...s.sceneImageArchive, [sceneId]: archive },
    })),
});
