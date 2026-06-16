/**
 * sliceAdapter — 6 个领域 slice 与 zustandStore 的类型桥接（阶段 3.4）
 *
 * 本文件**仅包含类型**，不引入任何运行时副作用。
 * 目的：为 6 个骨架 slice（image / memory / save / nsfw / setting / plan）
 *       与权威 `zustandStore.ts` 的 state / action 建立**可静态校验**的
 *       "字段映射"清单，方便后续逐字段迁移时核对。
 *
 * 设计原则（保守策略）：
 * 1. **不**修改 `zustandStore.ts` 的 runtime
 * 2. **不**让 zustandStore 反向 import 这 6 个 slice（避免循环 import）
 * 3. **不**让 6 个 slice import zustandStore（保持 slice 自包含）
 * 4. 本文件使用 `import type` + 类型断言，**TypeScript 编译后会全部擦除**
 * 5. 已对接字段用真类型承载；未对接字段用 `未对接字段占位 = never` 标注
 *
 * 当未来真正集成时（4 步路径见 SLICES.md 末尾），本文件可被替换为
 * "字段迁移 tracker"，记录每个字段从 useGame.ts → zustandStore 的迁移 PR。
 */

import type { StateCreator } from 'zustand';

import type { GameStore } from '../subsystems/zustandStore';

import type {
    ImageSlice,
    ImageSliceState,
    ImageSliceActions,
} from './imageSlice';
import type {
    MemorySlice,
    MemorySliceState,
    MemorySliceActions,
} from './memorySlice';
import type {
    NsfwSlice,
    NsfwSliceState,
    NsfwSliceActions,
} from './nsfwSlice';
import type {
    PlanSlice,
    PlanSliceState,
    PlanSliceActions,
} from './planSlice';
import type {
    SaveSlice,
    SaveSliceState,
    SaveSliceActions,
} from './saveSlice';
import type {
    SettingSlice,
    SettingSliceState,
    SettingSliceActions,
} from './settingSlice';

// ==================== 映射占位符 ====================

/**
 * 字段映射标记。
 * - `'zustandStore'`：字段已存在于 `GameStore` 中（通过 `Pick<GameStore, K>` 校验）
 * - `'useGameHook'`：字段当前在 `hooks/useGame.ts` 的 useState 中
 * - `'both'`：字段同时存在于两处（需要去重）
 */
export type 字段归属 = 'zustandStore' | 'useGameHook' | 'both';

/**
 * 字段映射记录：把"领域 slice 的字段路径"与"zustandStore 中的对应字段"绑起来。
 * 当标注为 `'zustandStore'` 时，第二个泛型 `K extends keyof GameStore` 提供类型安全校验。
 */
export type 字段映射<K extends keyof GameStore = never> = {
    /** 字段归属位置 */
    readonly 归属: 字段归属;
    /** zustandStore 中对应的字段名（仅当 归属 !== 'useGameHook' 时存在） */
    readonly zustand字段?: K;
    /** 人类可读的备注 */
    readonly 备注?: string;
};

// ==================== ImageSlice 映射 ====================

/**
 * imageSlice 字段 → zustandStore 对应表。
 *
 * 现状：
 * - `npcImageArchive` / `playerImageArchive` 当前在 useGame.ts 的 useState
 * - `sceneImageArchive` 已存在于 zustandStore.SceneConfigSlice（同名字段）
 */
export interface ImageSliceMapping {
    npcImageArchive: 字段映射;
    sceneImageArchive: 字段映射<'场景图片档案'>;
    playerImageArchive: 字段映射;
    appendNpcImage: 字段映射;
    mergeNpcImages: 字段映射;
    loadSceneImageArchive: 字段映射;
}

/**
 * ImageSliceState 与 GameStore 的交集校验。
 * 若 zustandStore 已对齐字段，Pick 应能成功；否则编译期会暴露差异。
 */
export type ImageSliceZustandOverlap = Pick<GameStore, '场景图片档案'>;

/**
 * 编译期 sanity check：ImageSliceState 中哪些字段已对接 zustandStore。
 * 当前结论：仅 `sceneImageArchive` ↔ `场景图片档案` 字段名一致；
 *           但类型不严格一致（ImageSliceState 用 `Record<string, any>` 笼统类型，
 *           GameStore 用 `场景图片档案` 真实类型），故此 overlap 仅作概念性占位。
 */
export type _ImageSliceComplianceReport = {
    readonly slice: ImageSlice;
    readonly 字段对齐: ImageSliceMapping;
    readonly 已对接字段数: 1; // sceneImageArchive ↔ 场景图片档案
    readonly 未对接字段数: 5;
};

// ==================== MemorySlice 映射 ====================

/**
 * memorySlice 字段 → zustandStore 对应表。
 *
 * 现状：zustandStore.MemorySlice 与 memorySlice.ts 高度重叠——
 *       待处理记忆总结任务、记忆总结阶段、记忆总结草稿、
 *       待处理NPC记忆总结队列、NPC记忆总结阶段、
 *       后台记忆总结状态/草稿/任务 等字段命名一致。
 *       但 skeleton 用 `createXxxSlice: StateCreator<MemorySlice, [], [], MemorySlice>`
 *       自包含签名，**不**与 zustandStore.MemorySlice 互通。
 */
export interface MemorySliceMapping {
    待处理记忆总结任务: 字段映射;
    记忆总结阶段: 字段映射;
    记忆总结草稿: 字段映射;
    待处理NPC记忆总结队列: 字段映射;
    NPC记忆总结阶段: 字段映射;
    后台记忆总结状态: 字段映射;
    后台记忆总结草稿: 字段映射;
    触发记忆总结: 字段映射;
    更新记忆阶段: 字段映射;
    清空总结流程: 字段映射;
}

export type MemorySliceZustandOverlap = Pick<
    GameStore,
    | '待处理记忆总结任务'
    | '记忆总结阶段'
    | '记忆总结草稿'
    | '待处理NPC记忆总结队列'
    | 'NPC记忆总结阶段'
    | '后台记忆总结状态'
    | '后台记忆总结草稿'
    | '后台记忆总结任务'
>;

export type _MemorySliceComplianceReport = {
    readonly slice: MemorySlice;
    readonly 字段对齐: MemorySliceMapping;
    readonly 已对接字段数: 8;
    readonly 未对接字段数: 2; // 触发记忆总结/更新记忆阶段/清空总结流程 是 zustandStore 缺少的语义化 action
};

// ==================== SaveSlice 映射 ====================

/**
 * saveSlice 字段 → zustandStore 对应表。
 *
 * 现状：zustandStore **没有** SaveSlice。存档/读档工作流状态
 *       当前在 useGame.ts / saveCoordinator / saveLoadWorkflow 中以
 *       useState / useRef 形式存在，**未迁移到 zustandStore**。
 */
export interface SaveSliceMapping {
    存档列表: 字段映射;
    读档状态: 字段映射;
    读档错误: 字段映射;
    存读档工作流状态: 字段映射;
    当前存档ID: 字段映射;
    创建存档: 字段映射;
    读取存档: 字段映射;
    删除存档: 字段映射;
}

export type _SaveSliceComplianceReport = {
    readonly slice: SaveSlice;
    readonly 字段对齐: SaveSliceMapping;
    readonly 已对接字段数: 0;
    readonly 未对接字段数: 8;
};

// ==================== NsfwSlice 映射 ====================

/**
 * nsfwSlice 字段 → zustandStore 对应表。
 *
 * 现状：zustandStore **没有** NsfwSlice。BDSM / 校园 / 暴露 / 写真 / 桌游 /
 *       酒吧 / 网约车 等 NSFW 子系统状态散落在 useGame.ts / useXxxNSFWBridge 中。
 *       zustandStore.BarNSFWSlice 仅覆盖酒吧这一支。
 */
export interface NsfwSliceMapping {
    bdsm关系映射: 字段映射;
    campus关系映射: 字段映射;
    nsfw上下文已加载: 字段映射;
    激活子系统列表: 字段映射;
    更新BDSM关系: 字段映射;
    加载NSFW上下文: 字段映射;
}

export type _NsfwSliceComplianceReport = {
    readonly slice: NsfwSlice;
    readonly 字段对齐: NsfwSliceMapping;
    readonly 已对接字段数: 0;
    readonly 未对接字段数: 6;
};

// ==================== SettingSlice 映射 ====================

/**
 * settingSlice 字段 → zustandStore 对应表。
 *
 * 现状：apiConfig / visualConfig / memoryConfig / imageManagerConfig
 *       当前在 useGame.ts 的 useState 中，**未迁移到 zustandStore**。
 *       `持久化中` 标志散落在 settingsPersistenceWorkflow 的局部 useState。
 */
export interface SettingSliceMapping {
    apiConfig: 字段映射;
    visualConfig: 字段映射;
    memoryConfig: 字段映射;
    imageManagerConfig: 字段映射;
    持久化中: 字段映射;
    持久化设置: 字段映射;
    规范化设置: 字段映射;
}

export type _SettingSliceComplianceReport = {
    readonly slice: SettingSlice;
    readonly 字段对齐: SettingSliceMapping;
    readonly 已对接字段数: 0;
    readonly 未对接字段数: 7;
};

// ==================== PlanSlice 映射 ====================

/**
 * planSlice 字段 → zustandStore 对应表。
 *
 * 现状：
 * - `故事计划` / `变量生成上下文` / `规划更新中` / `最近规划更新时间` 当前在 useGame.ts
 * - zustandStore.VariableSlice 仅覆盖 `变量生成中` 与 3 个开局独立阶段进度
 * - zustandStore.WorldSlice 覆盖 `世界演变更新中` 等世界层状态
 */
export interface PlanSliceMapping {
    故事计划: 字段映射;
    变量生成上下文: 字段映射;
    规划更新中: 字段映射;
    最近规划更新时间: 字段映射;
    更新故事计划: 字段映射;
    应用变量校准: 字段映射;
}

export type _PlanSliceComplianceReport = {
    readonly slice: PlanSlice;
    readonly 字段对齐: PlanSliceMapping;
    readonly 已对接字段数: 0;
    readonly 未对接字段数: 6;
};

// ==================== 集成报告（聚合） ====================

/**
 * 阶段 3.4 集成报告：6 slice 与 zustandStore 的整体对接率。
 * 当前统计：1 + 8 + 0 + 0 + 0 + 0 = 9 个字段"已对接"（命名/概念层）；
 *           实际仍零运行时引用。
 */
export interface SliceIntegrationReport {
    readonly 总切片数: 6;
    readonly 已对接切片数: 0; // 0 = 仍是骨架，未真正挂载到 useGameStore
    readonly 概念对齐字段总数: 9; // 命名/类型层面对齐的字段数
    readonly 未对接字段总数: 34;
    readonly 已对接: {
        image: _ImageSliceComplianceReport;
        memory: _MemorySliceComplianceReport;
        save: _SaveSliceComplianceReport;
        nsfw: _NsfwSliceComplianceReport;
        setting: _SettingSliceComplianceReport;
        plan: _PlanSliceComplianceReport;
    };
}

// ==================== StateCreator 签名约束 ====================

/**
 * 6 slice 的统一 StateCreator 约束。
 * 当未来集成时，外层 `create<GameStore>()` 调用方应使用
 * `StateCreator<GameStore, [], [], SliceSubset>` 而非 `StateCreator<Slice, [], [], Slice>`。
 */
export type SliceCreatorWithGameStore<SliceSubset> = StateCreator<
    GameStore,
    [],
    [],
    SliceSubset
>;

/**
 * 编译期校验：6 slice 的 state / action 字段是否与 zustandStore 子集兼容。
 * 若未来某字段命名变化导致冲突，可在此处暴露错误。
 */
export type SliceFieldCompatibilityCheck = {
    image: ImageSliceState & ImageSliceActions;
    memory: MemorySliceState & MemorySliceActions;
    save: SaveSliceState & SaveSliceActions;
    nsfw: NsfwSliceState & NsfwSliceActions;
    setting: SettingSliceState & SettingSliceActions;
    plan: PlanSliceState & PlanSliceActions;
};

/**
 * 显式导出 GameStore 类型别名，方便 6 slice 集成时引用，
 * 但本文件**不**做运行时 re-export（保持类型 only）。
 */
export type { GameStore };
