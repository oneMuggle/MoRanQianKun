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
