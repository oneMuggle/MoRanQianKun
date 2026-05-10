# 架构分析与改进方案

> 生成日期: 2026-05-09
> 状态: 计划中
> 分析范围: 全项目架构现状、优势、痛点与改进路径

---

## 一、项目概览

**墨色江湖：无尽武林** 是基于 React 19 + TypeScript + Vite 6 的浏览器互动小说/文字 RPG 应用。核心技术栈包括 Zustand 状态管理、IndexedDB 本地持久化、多 AI 供应商后端抽象。

---

## 二、当前架构优势

### 1. 领域驱动重构正在进行中

`hooks/useGame/domains/` 下已拆分出 7 个领域对象，每个有明确的职责和输入接口：

| 领域 | 文件 | 职责 |
|------|------|------|
| utilityDomain | `domains/utilityDomain.ts` | 通用工具函数与状态操作 |
| imageDomain | `domains/imageDomain.ts` | 图片生成队列与管理 |
| workflowDomain | `domains/workflowDomain.ts` | 工作流编排 |
| sendDomain | `domains/sendDomain.ts` | 核心发送逻辑封装 |
| sessionDomain | `domains/sessionDomain.ts` | 存读档与会话生命周期 |
| memoryRuntimeDomain | `domains/memoryRuntimeDomain.ts` | 记忆系统运行时 |

### 2. Zustand Store 基础设施已就绪

`hooks/useGame/subsystems/zustandStore.ts`（460 行）提供 10 个状态切片：
- UI、Device、Image、Settings、World、Memory、Variable、Opening、SceneConfig、Travel

### 3. 状态访问层设计良好

- `hooks/useGame/state/gameStateAccess.ts`（436 行）— 将 Hook 状态与 Zustand Store 合并为统一接口
- `hooks/useGame/state/refRegistry.ts`（149 行）— 集中管理 ~20 个 ref

### 4. App.tsx 已足够精简

~290 行，职责清晰，委托给：
- `GameView.tsx` — 主游戏布局
- `ModalLayer.tsx` — 所有弹窗
- `NSFWModals.tsx` / `MemoryModals.tsx` — 特定弹窗组
- `useAppModalState.ts` — 弹窗可见性逻辑
- `useAppEffects.tsx` — 计算派生状态

### 5. 子目录组织有序

`hooks/useGame/` 下 14+ 子目录按领域分组：`memory/`、`world/`、`planning/`、`image/`、`npc/`、`response/`、`time/`、`state/`、`ui/`、`quality/`、`campusNSFW/`、`eventTrigger/`、`narrativeGrammar/`

---

## 三、核心问题与痛点

### P0: 领域输入接口大量使用 `any`（最关键）

**现状**: 所有领域输入接口（`SendDomainInput`、`WorkflowDomainInput`、`UtilityDomainInput` 等）几乎每个属性都使用 `any`。

**具体表现**:
- `sendDomain.ts` 有 40+ 个 `any` 属性
- 领域边界无编译期类型保护
- 重命名属性或变更类型时，TypeScript 无法捕获错误

**影响**: 类型安全在领域边界完全失效，IDE 自动补全和跳转不可用。

**改进方案**:

1. 从最小的领域开始（`UtilityDomainInput` ~30 属性）
2. 为常见模式创建共享类型（如 `StateUpdater<T>`、`AsyncAction<T>`）
3. 使用 `Pick<GameStateAccess, ...>` 从已类型化的接口派生领域输入
4. 渐进式替换，每次一个领域

**预期收益**: 编译期捕获数十个潜在 bug，IDE 导航恢复可用。

---

### P1: `useGame.ts` 仍是上帝协调器

**现状**:
- 导入 ~118 个符号，来自 40+ 个模块
- 顺序创建 7 个领域对象
- 向每个领域构造函数传递 50-100+ 个参数
- 文件 800+ 行

**影响**: 每次领域变更都会波及协调器，难以推理、测试或进一步拆分。

**改进方案**:

1. **阶段一**: 将领域构造函数从顺序调用改为并行工厂，减少协调器中的依赖传递
2. **阶段二**: 引入领域注册表模式，协调器只需遍历注册表而非硬编码每个领域
3. **阶段三**: 将协调器拆分为"创建阶段"和"运行阶段"两个模块

**预期收益**: 协调器行数降至 200-300 行，新增领域不再需要修改协调器。

---

### P2: 双重状态管理（useState + Zustand）

**现状**:
- `useGameState()` 返回 ~60+ 个 useState hook 管理核心游戏实体
- `useGameStore()` 返回 Zustand 切片管理 UI/设备/图片等
- `createGameStateAccess()` 将两者合并

**问题**:
- 消费者需知道状态归属哪个 store
- 部分状态（如 `设备状态`）在两个 store 中同时存在
- Zustand 切片未做选择性订阅

**改进方案**:

1. 将 `useGameState.ts` 中的 15+ 核心实体迁移为 Zustand 切片
2. 基础设施已存在，只需按现有切片模式扩展
3. 利用 `useStore(selector)` 实现选择性订阅，减少不必要重渲染

**预期收益**: 移除 ~200 行 useState 模板代码，启用 DevTools 时间旅行调试，简化测试。

---

### P3: 返回值是"上帝对象"（200+ 属性）

**现状**: `构建useGame返回值` mapper 返回：

| 分组 | 属性数 | 内容 |
|------|--------|------|
| state | ~40+ | 完整游戏状态 |
| meta | ~30+ | 派生/计算值 |
| setters | ~25 | 状态设置函数 |
| actions | ~130+ | 业务逻辑函数 |

**影响**: 任何消费 `useGame()` 的组件可访问 200+ 属性，产生隐式耦合。

**改进方案**:

```
方案 A: 拆分为专注 Hook
- useGameState()    -> { state, setters }    读写状态
- useGameMeta()     -> { meta }              派生值
- useGameActions()  -> { actions }           业务逻辑

方案 B: React Context 分片提供
- GameStateContext  -> 状态读写
- GameMetaContext   -> 派生值
- GameActionsContext -> 业务逻辑
- 各组件按需订阅
```

**预期收益**: 组件只订阅所需切片，降低隐式耦合，提升渲染性能。

---

### P4: `GameView.tsx` 接收 48+ props 且类型不安全

**现状**:
- 接收 48+ props
- `state: Record<string, unknown>`
- `meta: Record<string, unknown>`
- `actions: Record<string, unknown>`

**影响**: 组件内无类型安全，难以发现实际使用了哪些属性，重构需要全文搜索。

**改进方案**:

1. 用具体类型替换 `Record<string, unknown>`
2. 将相关 props 分组为子对象（如 `chatProps`、`panelProps`、`mobileProps`）
3. 将派生值移入 GameView 内部的自定义 Hook，而非从 App 传递

**预期收益**: Props 数量减半，类型安全恢复，重构友好。

---

### P5: AI 响应边界无 Schema 验证

**现状**: 依赖 AI 返回格式正确的 JSON，通过 `utils/jsonRepair.ts` 尝试修复畸形响应。

**风险**:
- 损坏的 AI 响应可静默污染游戏状态
- 无早期失败和用户友好提示
- 测试需要模拟复杂的 AI 响应

**改进方案**:

1. 为 `GameResponse` 等核心响应结构引入 Zod schema
2. 使用 `.safeParse()` 解析 AI 响应
3. 失败时优雅降级并提示用户

**预期收益**: 防止损坏状态传播，错误信息更友好。

---

### P6: `models/contemporary/` 存在 25+ 空目录

**现状**: `models/contemporary/` 下 25+ 行业垂直子目录，大多数仅含 `.gitkeep` 占位文件。

**影响**: 噪音干扰，混淆已实现与计划中功能。

**改进方案**:

- 选项 A: 完成实现
- 选项 B: 移除脚手架，减少噪音
- 选项 C: 移至独立的 experimental 分支

---

## 四、快速见效改进清单

| # | 改进项 | 工作量 | 影响 |
|---|--------|--------|------|
| 1 | 创建 `models/index.ts` 集中导出 | 低 | 中 |
| 2 | 消除 `App.tsx` 中的 `as any` 强转 | 低 | 低 |
| 3 | 子目录添加 barrel export (`hooks/useGame/*/index.ts`) | 低 | 低 |
| 4 | 提取 Zustand 切片通用 updater 模式 | 低 | 中 |
| 5 | 为 `UseGameRefs` 接口添加 `readonly` 标记 | 极低 | 低 |
| 6 | 统一文件命名风格（camelCase vs PascalCase） | 低 | 低 |

---

## 五、长期架构演进方向

### A. CQRS 模式（Command Query Responsibility Segregation）

当前架构在同一个领域对象中混合了读取（状态查询）和写入（状态变更）。分离后可以：
- 状态变更可追溯
- 更易实现撤销/重做
- 简化测试（查询处理器是纯函数）

### B. 事件总线解耦跨领域通信

当前领域间通过直接传递函数和状态通信。引入事件总线后：
- 领域 A 发布 "NPCAdded" 事件
- 领域 B（图片）订阅并触发自动生图
- A 与 B 之间无直接依赖

### C. 游戏流程状态机

游戏有明确阶段：`home` -> `new_game` -> `opening` -> `main_story`。可用 XState 或简单状态机替代临时的 `view` 状态和各种 loading/progress 标志。

### D. useGame 测试支架

当前 `useGame.ts` 因内联创建一切而不可测试。测试支架可以：
- Mock Zustand store
- Mock 领域构造函数
- 断言特定领域方法被正确参数调用

---

## 六、实施优先级总览

| 优先级 | 改进项 | 工作量 | 影响 | 状态 |
|--------|--------|--------|------|------|
| **P0** | 给领域输入接口加具体类型 | 中 | 高 | [ ] 待开始 |
| **P1** | 拆分 `useGame.ts` 上帝协调器 | 高 | 高 | [ ] 待开始 |
| **P2** | 核心实体迁移至 Zustand | 高 | 高 | [ ] 待开始 |
| **P3** | 拆分上帝返回值对象 | 中 | 高 | [ ] 待开始 |
| **P4** | 减少 GameView prop 数量 | 中 | 中 | [ ] 待开始 |
| **P5** | AI 响应 Zod 验证 | 中 | 高 | [ ] 待开始 |
| **P6** | 清理占位目录 | 低 | 低 | [ ] 待开始 |

---

## 七、推荐实施路径

### 第一阶段：类型安全基础（1-2 周）

1. 创建 `models/index.ts`（快速）
2. 给 `UtilityDomainInput` 加类型（最小领域入手）
3. 逐步为其余领域输入接口加类型
4. 子目录添加 barrel export

### 第二阶段：状态管理统一（2-3 周）

1. 将 `useGameState.ts` 中的核心实体迁移为 Zustand 切片
2. 消除双重状态管理
3. 拆分上帝返回值对象
4. 减少 GameView prop 数量

### 第三阶段：架构升级（持续）

1. AI 响应 Zod 验证
2. 事件总线引入
3. 游戏流程状态机
4. 测试支架搭建

---

## 八、风险提示

| 风险 | 影响 | 缓解策略 |
|------|------|----------|
| 类型迁移可能触及大量文件 | 合并冲突风险 | 渐进式推进，每次一个领域 |
| Zustand 迁移期间可能引入重渲染 | 性能回退 | 使用选择性订阅，监控性能 |
| 上帝对象拆分可能破坏现有消费方 | 运行时错误 | 保持向后兼容的过渡期 |
| 协调器重构可能引入回归 | 功能异常 | 先建立测试支架再重构 |
