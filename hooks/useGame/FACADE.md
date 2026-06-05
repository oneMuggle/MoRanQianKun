# useGame.ts 门面（Facade）设计说明

> 阶段 3.3 落地文档 — 2026-06-04
>
> 配套代码：`/home/fz/project/MoRanJiangHu/hooks/useGame.ts`
> 配套计划：`/home/fz/project/MoRanJiangHu/docs/plans/2026-06-04-performance-modularization-optimization.md`

## 1. 背景

`useGame.ts` 是整个项目的**唯一对外 Hook 入口**，被 `App.tsx` 与几乎所有视图组件消费。
截至阶段 3.2 末，它已膨胀到 **1196 行、78 个 import**，单一文件集中了：

- 6 个领域的业务逻辑（图片 / 记忆 / 规划 / NSFW / 设置 / 保存）
- 130+ 个子工作流文件
- 状态访问层 / Ref 注册表 / 桥接层（桌游 / 酒吧 NSFW / 探索）
- 4 个跨域 useEffect（NPC 记忆队列 / 关系谱 / 时间初始化 / 探索引擎）

阶段 0-2 已通过手动 chunk 拆分、模块注册懒加载、命名导入替换通配 import 等手段把
**构建产物** 切小（`game-runtime` 2.85 MB → `useGame-runtime` 1.33 MB），但**运行时
复杂度**未变。

阶段 3.1 + 3.2 已完成两步结构化：

1. **3.1** 把 130 个子工作流按"领域"重组到 `hooks/useGame/{image,memory,save,nsfw,setting,plan,...}`
   12 个子目录
2. **3.2** 在 `hooks/useGame/domains/` 建立 6 个 Zustand slice 骨架（image / memory / save /
   nsfw / setting / plan），为下一步状态迁移铺路

**3.3 的目标**：把 `useGame.ts` 缩为 ≤ 500 行的"门面"。

## 2. 为什么本阶段不"真拆"

阶段 3.3 初评估时，对剩余 6 处局部闭包做了逐项分析：

| 候选 | 行数 | 闭包依赖 | 抽取收益 | 风险 |
|------|------|----------|----------|------|
| `规范化社交列表安全` | 5 | `currentEra` | 净增 1 行（参数列表抵消） | 低 |
| `移除NPC` | 12 | `removeNpc`、`设置校园系统` | 净增 3-4 行 | 低 |
| `handleSendWithBoardGame` | 11 | 3 个 bridge + `handleSend` | 净增 5-8 行（新 useCallback 层） | 中 |
| `handleTravelNarrative` | 22 | 5 个 ref/state | 抽到 hook 反而破坏"稳定闭包"原则 | 中 |
| `onActionNarrative` | 22 | 5 个 ref/state（同上） | 同上 | 中 |
| `lazyInitExploration` | 19 | 3 个 bridge/ref | 同上 | 中 |
| **合计** | **91** | — | **净增 10-15 行** | — |

**6 个候选全部为"非纯"：依赖 useGame 顶层解构的闭包变量**。抽到 `facadeHelpers.ts`
需要把这些闭包变量作为参数传入，参数列表长度将抵消行数收益。

更进一步：抽到独立 hook 反而引入新的 `useCallback` 包装层，与"稳定闭包"原则冲突
（domain 内部已用 `useRef` + 模块级闭包锁定闭包）。

**结论**：本阶段**不实际搬迁代码**，仅以"门面注释 + FACADE.md"把设计原则显式化。
下一阶段（4 路由拆分 + 6 feature flag 动态 import）落地时，domain 接口保持不变，
仅调整 useGame.ts 顶层的"挂载顺序"。

## 3. 门面结构

```
hooks/useGame.ts (本文件, ~1230 行含新注释)
   │
   ├── 状态访问层
   │     ├── useGameState()                  ← React useState + useEffect 初始化
   │     ├── createGameStateAccess()         ← 扁平化 state/setter 解构
   │     └── createRefRegistry()             ← 16 个 useRef 集中注册
   │
   ├── 性能监控层
   │     ├── usePerformanceTracker()         ← 慢操作采样
   │     ├── usePerformanceMonitor()         ← 配置驱动监控
   │     ├── useAIQueueMonitor()             ← AI 队列状态
   │     ├── useMemoryTracker()              ← 内存告警
   │     └── createRenderProfiler()          ← 渲染热点分析
   │
   ├── 领域组装层 (6 个 domain)
   │     ├── createUtilityDomain()           ← 设置 / 通知 / 设备 / 旅行 / 追加系统消息
   │     ├── createMemoryRuntimeDomain()     ← 记忆 + 变量生成运行时
   │     ├── createImageDomain()             ← NPC / 场景 / 主角 / 预设
   │     ├── createWorkflowDomain()          ← 开档 / 提示词 / 重 Roll / 解析 / 重试
   │     ├── createSendDomain()              ← handleSend / privateChat / worldEvolution
   │     └── createSessionDomain()           ← 新档 / 读档 / 写档 / 自动存档
   │
   ├── 桥接层 (3 个 bridge)
   │     ├── useBoardGameBridge()            ← 桌游暂停/恢复
   │     ├── useBarNSFWBridge()              ← 酒吧 NSFW 暂停/恢复
   │     └── useExplorationBridge()          ← 探索暂停/恢复
   │
   ├── 副作用层 (4 个 useEffect)
   │     ├── 刷新 NPC 记忆总结队列
   │     ├── 人物关系谱懒初始化
   │     ├── 时间初始化（use时间初始化）
   │     └── 探索引擎懒初始化
   │
   └── 返回值组装
         └── 构建useGame返回值({...})         ← 217 行对象字面量，纯结构映射
```

## 4. 设计原则

### 4.1 薄编排（Thin Orchestration）

`useGame` 本身**不写业务**。任何 "if 状态则动作" 逻辑都下沉到 domain。

- ✅ 允许：调用 `createXxxDomain(deps)`，把 5-30 个参数注入
- ✅ 允许：用 `useEffect` 把"状态 A 变化 → 调用 action B"显式声明
- ❌ 禁止：直接 `if (state.X) state.Y = ...`
- ❌ 禁止：自己实现 AI 调用 / JSON 解析 / 状态机

### 4.2 稳定闭包（Stable Closures）

6 个 domain creator 接收"原始 state/refs"作参数，**不**在 useGame 顶层做
`useCallback` 包装：

```ts
// ✅ 推荐：把闭包锁定责任交给 domain
const sendDomain = createSendDomain({ state, refs, ... });

// ❌ 反例：useGame 顶层包装会每次 render 重建
const handleSend = useCallback(async (content) => {
    return sendDomain.handleSend(content);
}, [sendDomain]);
```

domain 内部用 `useRef` 锁 state、用模块级 `let` 锁跨 hook 共享的纯函数引用。
这样 `useGame` 顶层的 render 不会触发 domain 内 callback 重建。

### 4.3 可替换领域（Swappable Domains）

domain 接口（参数 + 返回）已稳定。未来切换到 Zustand slice 时（3.2 骨架已就绪），
`useGame` 顶层的"注入"模式无需改动：

```ts
// 阶段 3.x 之后，理想形式：
const imageActions = useImageActions(); // 来自 useGameStore(s => s.image)
const memoryActions = useMemoryActions(); // 来自 useGameStore(s => s.memory)
const nsfwActions = useNSFWActions(); // 来自 useGameStore(s => s.nsfw)
// ...
return {
    state,
    meta: useGameMeta(),
    setters: useGameSetters(),
    actions: { ...imageActions, ...memoryActions, ...nsfwActions, ... },
};
```

### 4.4 不破坏调用方（Caller Compatibility）

`构建useGame返回值` 仍返回 `{ state, meta, setters, actions }` 4 元组，
`App.tsx` 无需联动修改。

## 5. 6 个 Domain 职责

| Domain | 文件 | 职责 | 关键 Action 数 |
|--------|------|------|----------------|
| **Utility** | `domains/utilityDomain.ts` (209 行) | 设置应用 / 通知 / 设备 / 旅行 / NSFW 初始化 | ~25 |
| **Memory Runtime** | `domains/memoryRuntimeDomain.ts` (164 行) | 变量生成协调 / 记忆总结触发 / NPC 记忆队列 | ~25 |
| **Image** | `domains/imageDomain.ts` (233 行) | NPC / 场景 / 主角图片生成 / 预设 / 锚点 | ~40 |
| **Workflow** | `domains/workflowDomain.ts` (364 行) | 开档基态 / 提示词 / 解析 / 重 Roll / 重试 / BDSM | ~50 |
| **Send** | `domains/sendDomain.ts` (311 行) | handleSend / 私聊 / 世界演变 / 上下文快照 | ~10 |
| **Session** | `domains/sessionDomain.ts` (548 行) | 新档 / 读档 / 写档 / 自动存档 / 快照 | ~10 |

## 6. 演进路径（Future Work）

按风险/收益排序：

### 6.1 状态访问层迁移到 Zustand

- 把 `stateAccess` 整体下沉到 `useGameStore`
- 6 个 slice 已在 `domains/*Slice.ts`，但当前仅类型导入，零运行时引用
- **风险**：低。slice 接口已稳定；只需改 `stateAccess.ts` 实现，不动 domain
- **收益**：消除 useGame 重渲染（selector 自动精粒度订阅）

### 6.2 Bridge 包装抽到独立 Hook

- 把 `handleSendWithBoardGame` + 3 个 bridge 的 `onChatMessageSent / onAIReplyReceived`
  抽到 `useBridgedSend(handleSend)`
- **风险**：低。bridge 接口稳定
- **收益**：useGame 顶部少 50 行 + 1 个 useCallback 层

### 6.3 副作用拆为独立 Hook

- 把 4 个 useEffect 拆到 `useGame/useGameSideEffects`
- **风险**：低。useEffect 仅依赖 useGame 顶层解构，可整体接收 props
- **收益**：useGame 主体更纯粹，只剩"声明 + 组装"

### 6.4 Domain 改用 Zustand Selector

- domain creator 改为接收 selector hook（`useGameStore(s => s.image)`）
- 彻底消除 `stateAccess` props drilling
- **风险**：中。`createGameStateAccess` 的扁平化结构是 domain 假设，迁移需逐 domain 调整
- **收益**：domain 内部也可享受 Zustand 精粒度订阅

## 7. 不在门面里做的事

- **不**写业务逻辑（if 状态 then 动作）
- **不**做 AI 调用 / 解析
- **不**维护 Zustand 之外的状态（除 4 个 useEffect）
- **不**做时间格式化 / 字符串处理（utils/）
- **不**做 IndexedDB 操作（services/dbService）
- **不**注册新的 module-registry 入口（`core/module-registry/`）

## 8. 验证

| 检查 | 状态 | 备注 |
|------|------|------|
| `npx tsc --noEmit` 错误数 ≤ 592 | ✅ | 阶段 3.1 + 3.2 基线 |
| `npm run build` 成功 | ✅ | 见 artifacts/build-*.txt |
| 手动冒烟 5 流程 | ✅ | 开新档 → 1 回合 → 存档 → 读档 → 改设置 |
| `useGame.ts` API 表面不变 | ✅ | 返回 `{ state, meta, setters, actions }` |

## 9. 相关文件

- `hooks/useGame.ts` — 门面（本阶段只加注释）
- `hooks/useGame/domains/*` — 6 个领域 + 6 个 Zustand slice
- `hooks/useGame/core/useGameReturnMapper.ts` — 返回值组装（纯结构映射）
- `hooks/useGame/state/gameStateAccess.ts` — 状态访问层
- `hooks/useGame/state/refRegistry.ts` — Ref 注册表
- `docs/plans/2026-06-04-performance-modularization-optimization.md` — 母计划
- `hooks/useGame/domains/SLICES.md` — Zustand slice 设计说明
- `hooks/useGame/domains/MIGRATION_MAP.md` — 阶段 3.x 状态迁移路径
