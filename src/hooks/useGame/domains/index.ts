/**
 * 域分组导出
 *
 * 所有功能域的入口文件。
 */

export { createImageDomain, type ImageDomainInput } from './imageDomain';
export { createMemoryDomain, type MemoryDomainInput } from './memoryDomain';
export { createSessionDomain, type SessionDomainInput } from './sessionDomain';
export { createSendDomain, type SendDomainInput } from './sendDomain';
export { createUtilityDomain, type UtilityDomainInput } from './utilityDomain';
export { createWorkflowDomain, type WorkflowDomainInput } from './workflowDomain';
export { createMemoryRuntimeDomain, type MemoryRuntimeDomainInput } from './memoryRuntimeDomain';

// ==================== 领域 Zustand Slice（阶段 3.2+，types-only re-export，阶段 3.4） ====================
//
// 6 个领域 slice 仍为骨架（零运行时引用）。本块仅做 **types** re-export，
// 方便 useGame.ts 通过 `import type` 引用，不引入任何运行时副作用。
//
// 何时会升级为运行时导出？
// → 见 ./SLICES.md 末尾"集成路径（3.4）"章节
//   当未来把 `createImageSlice` 等真正挂载到 `useGameStore` 时，本文件会
//   把 `export type` 升级为 `export { createXxxSlice, type XxxSlice }`。
//
// ⚠️ 不要在本块添加任何 runtime export，否则会触发循环 import 风险：
//    slice 文件 `import type { GameStore } from '../subsystems/zustandStore'`，
//    zustandStore.ts **不能**反向 import 6 个 domains/*Slice.ts。

export type {
    ImageSlice,
    ImageSliceState,
    ImageSliceActions,
} from './imageSlice';
export type {
    MemorySlice,
    MemorySliceState,
    MemorySliceActions,
    后台记忆总结状态类型,
} from './memorySlice';
export type {
    NsfwSlice,
    NsfwSliceState,
    NsfwSliceActions,
    BdSm关系状态,
    Campus关系状态,
} from './nsfwSlice';
export type {
    PlanSlice,
    PlanSliceState,
    PlanSliceActions,
} from './planSlice';
export type {
    SaveSlice,
    SaveSliceState,
    SaveSliceActions,
    读档状态类型,
    存档工作流状态类型,
} from './saveSlice';
export type {
    SettingSlice,
    SettingSliceState,
    SettingSliceActions,
} from './settingSlice';

// ==================== 阶段 3.4 类型桥接 ====================
//
// `sliceAdapter.ts` 提供 6 slice ↔ zustandStore.GameStore 的字段映射类型，
// 用于静态校验和未来集成追踪。本块也是 types-only。

export type {
    字段归属,
    字段映射,
    ImageSliceMapping,
    ImageSliceZustandOverlap,
    MemorySliceMapping,
    MemorySliceZustandOverlap,
    SaveSliceMapping,
    NsfwSliceMapping,
    SettingSliceMapping,
    PlanSliceMapping,
    SliceIntegrationReport,
    SliceCreatorWithGameStore,
    SliceFieldCompatibilityCheck,
} from './sliceAdapter';
