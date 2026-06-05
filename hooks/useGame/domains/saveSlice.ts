/**
 * saveSlice — 存档与读档领域状态
 *
 * 涵盖：存档列表、读档状态、存读档工作流状态。
 * 本文件为骨架版本（阶段 3.2），后续 useGame.ts 缩身阶段会逐步迁移实际状态。
 */

import type { StateCreator } from 'zustand';

export type 读档状态类型 = 'idle' | 'loading' | 'success' | 'error';
export type 存档工作流状态类型 = 'idle' | 'saving' | 'done' | 'error';

export interface SaveSliceState {
    /** 存档列表元数据 */
    存档列表: any[];
    /** 读档状态机 */
    读档状态: 读档状态类型;
    /** 读档错误信息 */
    读档错误: string;
    /** 存读档工作流状态 */
    存读档工作流状态: 存档工作流状态类型;
    /** 当前正在操作的存档 ID */
    当前存档ID: string | null;
}

export interface SaveSliceActions {
    /** 创建存档 */
    创建存档: (存档元数据: any) => void;
    /** 读取存档 */
    读取存档: (存档ID: string) => void;
    /** 删除存档 */
    删除存档: (存档ID: string) => void;
}

export type SaveSlice = SaveSliceState & SaveSliceActions;

export const createSaveSlice: StateCreator<SaveSlice, [], [], SaveSlice> = (set) => ({
    存档列表: [],
    读档状态: 'idle',
    读档错误: '',
    存读档工作流状态: 'idle',
    当前存档ID: null,
    创建存档: (存档元数据) => set((s) => ({
        存档列表: [...s.存档列表, 存档元数据],
        存读档工作流状态: 'saving',
    })),
    读取存档: (存档ID) => set({
        读档状态: 'loading',
        当前存档ID: 存档ID,
    }),
    删除存档: (存档ID) => set((s) => ({
        存档列表: s.存档列表.filter((item: any) => item.id !== 存档ID),
    })),
});
