# 领域 Zustand 切片骨架（阶段 3.2）

> 本目录的 6 个 slice 文件为**骨架版本**，不立即与 `useGame.ts` 集成。
> 它们为阶段 3.3（`useGame.ts` 缩身为门面）建立可逐步迁移的基础设施。

## 设计目标

- **隔离性**：每个 slice 只关心自身领域的 state + actions
- **可订阅性**：使用 Zustand `StateCreator` 标准签名，支持 `useGameStore(s => s.image.xxx)` 选择性订阅
- **类型安全**：每个 slice 暴露独立的 `*State` 和 `*Actions` 接口，便于增量迁移
- **零破坏**：当前所有 slice 仅被类型导入，**没有运行时引用**，对 `useGame.ts` 完全无侵入

## 6 个 Slice 职责一览

| Slice | 文件 | 核心状态 | 关键 Action | 迁移来源（useGame.ts 中） |
|-------|------|---------|------------|---------------------------|
| `imageSlice` | `imageSlice.ts` | `npcImageArchive`、`sceneImageArchive`、`playerImageArchive` | `appendNpcImage`、`mergeNpcImages`、`loadSceneImageArchive` | NPC/场景/主角图片生成工作流的中间状态 |
| `memorySlice` | `memorySlice.ts` | `待处理记忆总结任务`、`记忆总结阶段/草稿`、`后台记忆总结状态/草稿`、`待处理NPC记忆总结队列`、`NPC记忆总结阶段` | `触发记忆总结`、`更新记忆阶段`、`清空总结流程` | `memoryRecall`、`memorySummaryHandlers` 持有的 React state |
| `saveSlice` | `saveSlice.ts` | `存档列表`、`读档状态`、`读档错误`、`存读档工作流状态`、`当前存档ID` | `创建存档`、`读取存档`、`删除存档` | `saveLoadWorkflow`、`saveCoordinator` 中的过渡状态 |
| `nsfwSlice` | `nsfwSlice.ts` | `bdsm关系映射`、`campus关系映射`、`nsfw上下文已加载`、`激活子系统列表` | `更新BDSM关系`、`加载NSFW上下文` | 各 NSFW 子引擎的 `useState` 持有状态聚合 |
| `settingSlice` | `settingSlice.ts` | `apiConfig`、`visualConfig`、`memoryConfig`、`imageManagerConfig`、`持久化中` | `持久化设置`、`规范化设置` | `useSettingsActions`、`settingsPersistenceWorkflow` 中的中间状态 |
| `planSlice` | `planSlice.ts` | `故事计划`、`变量生成上下文`、`规划更新中`、`最近规划更新时间` | `更新故事计划`、`应用变量校准` | `useWorldAndPlanning`、`storyPlanUpdater`、`runtimeVariableWorkflow` |

## 模式约定

### 1. StateCreator 签名

```ts
export const createXxxSlice: StateCreator<XxxSlice, [], [], XxxSlice> = (set, get) => ({...});
```

- 使用 Zustand 5 官方 `StateCreator` 类型
- **自包含类型**：slice 的 `StateCreator` 第一个泛型参数是 `XxxSlice` 自身，**不引用 `GameStore`**
- 这样切片可独立编译、独立单元测试；阶段 3.3 集成时只需在外层把 `XxxSlice` 合并到 `GameStore`
- `set` 支持函数式更新以访问前序 state
- 暂不使用中间件（无 `persist` / `devtools`），保持骨架轻量

### 2. 不可变更新

所有 set 都返回**新对象**而非 mutation：

```ts
appendNpcImage: (npcId, record) => set((s) => ({
    npcImageArchive: {
        ...s.npcImageArchive,
        [npcId]: [...(s.npcImageArchive[npcId] || []), record],
    },
})),
```

### 3. State + Actions 分离

```ts
export interface XxxSliceState { /* ... */ }
export interface XxxSliceActions { /* ... */ }
export type XxxSlice = XxxSliceState & XxxSliceActions;
```

便于后续做"读 state 用 `useGameStore(s => s.xxx)`，调用 action 用 `useGameStore.getState().xxx`"的拆分。

## 命名规范

- 文件名：`xxxSlice.ts`（小写驼峰，与 PascalCase 接口名 `XxxSlice` 对应）
- 文件内部接口：`XxxSliceState`（数据）、`XxxSliceActions`（方法）、`XxxSlice`（合并）
- 创建函数：`createXxxSlice`
- 与现有 `zustandStore.ts` 中的内联 PascalCase 切片（如 `ImageSlice`、`MemorySlice`）不冲突——本目录使用小写驼峰名，是面向未来 3.3 的"v2 slice"命名空间

## 不在骨架中的事项

- ❌ 不与 `zustandStore.ts` 集成（不修改该文件，避免破坏现有 18 个已上线 slice）
- ❌ 不在 `domains/index.ts` 添加导出（保持无副作用）
- ❌ 不写运行时测试（骨架不进入运行时）
- ❌ 不迁移 `useGame.ts` 的实际状态（阶段 3.3 任务）

## 阶段 3.3 接入计划

```ts
// zustandStore.ts（未来）
import { createImageSlice, type ImageSlice } from './domains/imageSlice';
import { createMemorySlice, type MemorySlice } from './domains/memorySlice';
// ... 6 个导入

export interface GameStore extends ExistingSlices, ImageSlice, MemorySlice, SaveSlice, NsfwSlice, SettingSlice, PlanSlice {}

export const useGameStore = create<GameStore>()((...a) => ({
    ...createUISlice(...a),
    ...createImageSlice(...a),  // 新
    ...createMemorySlice(...a), // 新
    // ...
}));
```

随后 `useGame.ts` 中的 `useState` 逐步替换为：

```ts
// 替换前
const [npcImageArchive, setNpcImageArchive] = useState({});

// 替换后
const npcImageArchive = useGameStore(s => s.npcImageArchive);
const appendNpcImage = useGameStore(s => s.appendNpcImage);
```

## 文件清单

- `imageSlice.ts`（~50 行）
- `memorySlice.ts`（~55 行）
- `saveSlice.ts`（~50 行）
- `nsfwSlice.ts`（~48 行）
- `settingSlice.ts`（~37 行）
- `planSlice.ts`（~40 行）

## 验证状态

- ✅ 6 个 slice 文件全部创建
- ✅ 通过 `npx tsc --noEmit` 类型检查（不增加错误数，592 → 592）
- ✅ 通过 `npm run build` 生产构建
- ✅ 阶段 3.2 目标达成

---

## 集成路径（阶段 3.4，types-only bridge）

> 阶段 3.4 目标：**不改 runtime**，仅建立"6 slice ↔ zustandStore.GameStore" 的类型桥接。
> 本节描述当前对接状态、字段归属清单，以及未来真正集成时的 4 步路径。

### 现状（3.4 完成后）

| 项目 | 状态 |
|------|------|
| 6 slice 文件 | ✅ 仍为骨架（自包含 `StateCreator<SelfSlice, [], [], SelfSlice>`） |
| 运行时引用 | ❌ 0 处（zustandStore.ts 不 import 任何 `domains/*Slice.ts`） |
| 类型桥接 | ✅ 新增 `domains/sliceAdapter.ts`（types-only） |
| `domains/index.ts` | ✅ 新增 6 slice 的 `export type` re-export + sliceAdapter 类型导出 |
| 文档化字段映射 | ✅ 见下方"已对接 / 未对接字段清单" |
| `useGame.ts` runtime | ❌ 完全未动 |
| `zustandStore.ts` runtime | ❌ 完全未动 |

### 字段归属原则

- `zustandStore`：字段已存在于 `GameStore` 中（即 `zustandStore.ts` 的 18 个内联 slice 之一）
- `useGameHook`：字段当前在 `hooks/useGame.ts` 的 `useState` / `useRef` 中
- `both`：字段同时存在于两处（迁移时需去重）

### 已对接 / 未对接字段清单（命名/概念层）

#### imageSlice

| 字段 | 归属 | zustand 字段 | 备注 |
|------|------|-------------|------|
| `npcImageArchive` | `useGameHook` | — | useGame.ts 的 useState；zustandStore 无对应字段 |
| `sceneImageArchive` | `zustandStore` | `场景图片档案`（SceneConfigSlice） | 同名字段，但类型不严格一致（`Record<string, any>` vs 真实 `场景图片档案`） |
| `playerImageArchive` | `useGameHook` | — | useGame.ts 局部 useState |
| `appendNpcImage` / `mergeNpcImages` / `loadSceneImageArchive` | — | — | 语义化 action，zustandStore 缺 |

**已对接字段数：1 / 未对接：5**

#### memorySlice

| 字段 | 归属 | zustand 字段 | 备注 |
|------|------|-------------|------|
| `待处理记忆总结任务` | `zustandStore` | `待处理记忆总结任务`（MemorySlice） | 类型一致 |
| `记忆总结阶段` | `zustandStore` | `记忆总结阶段` | 类型一致 |
| `记忆总结草稿` | `zustandStore` | `记忆总结草稿` | 类型一致 |
| `待处理NPC记忆总结队列` | `zustandStore` | `待处理NPC记忆总结队列` | 类型一致 |
| `NPC记忆总结阶段` | `zustandStore` | `NPC记忆总结阶段` | 类型一致 |
| `后台记忆总结状态` | `zustandStore` | `后台记忆总结状态` | 类型一致 |
| `后台记忆总结草稿` | `zustandStore` | `后台记忆总结草稿` | 类型一致 |
| `后台记忆总结任务` | `zustandStore` | `后台记忆总结任务` | 类型一致 |
| `触发记忆总结` / `更新记忆阶段` / `清空总结流程` | — | — | 语义化 action，zustandStore 缺 |

**已对接字段数：8 / 未对接：3**

#### saveSlice / nsfwSlice / settingSlice / planSlice

**全部字段当前归属 `useGameHook`，zustandStore 无对应字段。**

| Slice | 已对接 | 未对接 |
|-------|--------|--------|
| saveSlice | 0 | 8（存档列表、读档状态、读档错误、存读档工作流状态、当前存档ID + 3 个 action） |
| nsfwSlice | 0 | 6（bdsm关系映射、campus关系映射、nsfw上下文已加载、激活子系统列表 + 2 个 action） |
| settingSlice | 0 | 7（apiConfig、visualConfig、memoryConfig、imageManagerConfig、持久化中 + 2 个 action） |
| planSlice | 0 | 6（故事计划、变量生成上下文、规划更新中、最近规划更新时间 + 2 个 action） |

### 聚合统计

```
总切片数: 6
已对接切片数: 0   ← 仍为骨架，零运行时挂载
概念对齐字段总数: 9  (image: 1 + memory: 8)
未对接字段总数: 35
```

> 上述数字以 `domains/sliceAdapter.ts` 中 `SliceIntegrationReport` 接口为唯一定义源。
> 任何字段归属变更需先改 `sliceAdapter.ts`，再改本表。

### 未来真正集成的 4 步路径

> 警告：以下 4 步**不在阶段 3.4 范围内**，留待后续阶段（3.5+）。
> 任何执行者必须先更新 `sliceAdapter.ts` 的字段映射，再做 runtime 改动。

#### 步骤 1：类型对齐

```ts
// 1.1 用真实类型替换 slice 中的 any/Record<string, any>
export interface ImageSliceState {
    npcImageArchive: Record<string, NpcImageRecord[]>; // 而非 any[]
    sceneImageArchive: 场景图片档案;                  // 而非 Record<string, any>
    playerImageArchive: PlayerImageRecord;            // 而非 any
}
```

#### 步骤 2：state 字段迁移（按 slice 顺序：image → memory → setting → plan → save → nsfw）

```ts
// 2.1 在 zustandStore.ts 中追加 6 个内联 slice（与现有 18 个内联 slice 同款写法）
//    ⚠️ 必须**就地**扩展 GameStore（不能 import domains/*Slice.ts）
const createImageSlice: ZustandSlice<ImageSlice> = (set) => ({ ... });
// 2.2 在 GameStore extends 列表追加：..., V2ImageSlice, V2MemorySlice, V2SaveSlice, ...
// 2.3 useGameStore create 函数内追加：...createV2ImageSlice(...a), ...
```

#### 步骤 3：action 迁移

```ts
// 3.1 把 useGame.ts 中的 useState setter 替换为 useGameStore 调用
//     替换前
const [npcImageArchive, setNpcImageArchive] = useState<Record<string, any[]>>({});
//     替换后
const npcImageArchive = useGameStore(s => s.npcImageArchive);
const appendNpcImage = useGameStore(s => s.appendNpcImage);
// 3.2 删除 useGame.ts 中对应的 useState + useEffect/useCallback
```

#### 步骤 4：清理 6 slice 骨架

```ts
// 4.1 domains/*Slice.ts 的 StateCreator 第一个泛型从 XxxSlice 改为 GameStore
export const createImageSlice: StateCreator<GameStore, [], [], ImageSlice> = (set) => ({ ... });
// 4.2 升级 domains/index.ts 的 export type → export { createImageSlice, type ImageSlice }
// 4.3 zustandStore.ts 删除对应的内联 createXxxSlice 块（v2 取代）
// 4.4 更新 sliceAdapter.ts 中对应字段的 `字段归属` 为 'zustandStore'，并删除其备注
```

### 阶段 3.4 验收

- ✅ 不改 `zustandStore.ts`、不改 `useGame.ts` runtime
- ✅ `npx tsc --noEmit` 错误数不增加（仅新增 types-only 接口，零运行时影响）
- ✅ `npm run build` 成功
- ✅ 文档化清晰（本节 + `sliceAdapter.ts` 内的 `SliceIntegrationReport`）
- ✅ Commit: `refactor(state): 阶段 3.4 集成 slice 类型对接（保守策略：types-only bridge）`
