# RPG 门派系统融合方案

> 目标：将 RPG 门派系统融入主游戏，使其成为原生游戏机制而非独立的"切换模式"。

## 1. 现状分析

### 两套独立系统

```
正常模式 (AI 驱动)              RPG 模式 (引擎驱动)
───────────────────              ──────────────────
state.玩家门派                    RpgSectEngine._sectData (引擎内部)
  ↓                                ↓
responseCommandProcessor         RpgActionDispatcher
  ↓                                ↓
applyStateCommand()              syncSectState() → Zustand
  ↓                                ↓
React setState                   薄投影: rpgSectId, rpgSectContribution
```

**核心问题：**
- RPG 引擎维护独立的 `_sectData` 内部状态，与 `state.玩家门派` 完全隔离
- Zustand RpgSlice 仅存储薄投影（ID + 贡献值），缺少完整门派数据
- UI 分两套：`SectModal`（正常模式）vs `RpgSectIntegration`（RPG 模式）
- 需要手动点击 toggle 才能进入 RPG 模式，体验割裂
- 仅正常模式的 `state.玩家门派` 被持久化到 IndexedDB，RPG 引擎内部状态不保存

### 数据流对比

| 维度 | 正常模式 | RPG 模式 |
|------|---------|---------|
| 数据源 | `state.玩家门派` (React) | `RpgSectEngine._sectData` (引擎内部) |
| 更新方式 | AI `tavern_commands` → `applyStateCommand` | UI 按钮 → `RpgActionDispatcher` → engine |
| 持久化 | IndexedDB (通过 dbService) | 未持久化（`serialize()` 存在但未接入） |
| UI | 4 tab 展示（宗门大殿/任务/藏经阁/同门） | 简化面板（仅 rank 进度 + 按钮） |
| 功能 | 只读展示 | 有经济/贡献/派遣逻辑但 UI 不暴露 |

## 2. 融合目标

```
融合后 (单一系统)
─────────────────
state.玩家门派 (Zustand 唯一数据源)
  ↓
RpgSectEngine 读取 + 计算 → 返回 stateUpdates → 写入 Zustand
  ↓
统一 UI (保留正常模式的 4 tab + 接入 RPG 交互按钮)
  ↓
IndexedDB 持久化 (完整门派数据 + 岗位派遣状态)
  ↓
AI Prompt 注入 (保留现有 promptRuntime.ts 逻辑)
```

**核心原则：RPG 引擎 = 计算器，不再 = 数据源**

## 3. 实施方案

- [x] **Phase 1: 统一数据存储（已完成）**
  - Zustand store 新增 `rpgSectData: 详细门派结构 | null` 和 `rpgPostAssignments: PostAssignment[]`
  - 新增 `setRpgSectData` / `setRpgPostAssignments` action
  - 保留 `rpgSectId` / `rpgSectContribution` 作为兼容字段
  - 修改文件: `hooks/useGame/subsystems/zustandStore.ts`

- [x] **Phase 2: 引擎重构为纯计算层（已完成）**
  - `memberDispatcher.ts`: 修复 `assignToPost` 空壳实现，修复 `removeFromPost` 的 splice 可变操作
  - `rpgSectEngine.ts`: 保留 class 接口但改为从外部注入 state（`setState` 方法）
  - 新增 `add_funds` action 类型
  - 序列化新增 `hasSect` 标志
  - 测试更新: `phase9.test.ts`

- [x] **Phase 3: 桥接层重定向（已完成）**
  - `useRpgStateBridge.ts`: `syncSectState` 同步完整 `rpgSectData` + `rpgPostAssignments`
  - `rpgActionDispatcher.ts`: 新增 `injectSectState` 方法
  - `SectModal.tsx` / `MobileSect.tsx`: RPG action 前调用 `injectSectState` 注入 Zustand 状态

### ~~Phase 1: 统一数据存储~~（已完成）

**目标：** Zustand store 存储完整门派数据，取代薄投影。

**文件变更：**

1. **`hooks/useGame/subsystems/zustandStore.ts`** (第 775-861 行)
   - 在 RpgSlice 中替换 `rpgSectId` + `rpgSectContribution` 为：
     ```typescript
     rpgSectData: 详细门派结构 | null;
     rpgPostAssignments: PostAssignment[];
     ```
   - 新增 action：
     ```typescript
     setRpgSectData: (sect: 详细门派结构 | null) => void;
     updateRpgSectField: (field: keyof 详细门派结构, value: unknown) => void;
     ```
   - 更新 `resetRpgState` 包含新字段

**复杂度：** 低 | **风险：** 低

---

### Phase 2: 重构 RPG 引擎为纯计算层（核心层）

**目标：** RpgSectEngine 不再持有 `_sectData`，改为接收当前 state 作为输入，返回 `ActionResult` 描述状态变更。

**文件变更：**

1. **`hooks/useGame/engine/rpgSectEngine.ts`**
   - 移除 `private _sectData: 详细门派结构 | null`（第 47 行）
   - 移除 `private _postAssignments: PostAssignment[]`（第 48 行）
   - 所有方法签名改为接收当前 state：
     ```typescript
     gainContribution(currentSect: 详细门派结构, amount: number): ActionResult
     useContribution(currentSect: 详细门派结构, amount: number): ActionResult
     investConstruction(currentSect: 详细门派结构, funds: number): ActionResult
     dispatchMember(currentSect: 详细门派结构, assignments: PostAssignment[], memberId: string, postId: string): ActionResult
     ```
   - 返回值中的 `stateUpdates` 改为包含完整的新门派对象：
     ```typescript
     stateUpdates: { newSect: 详细门派结构, newAssignments?: PostAssignment[] }
     ```
   - 移除 `initialize()` 方法（不再需要初始化内部状态）

2. **`hooks/useGame/rpg/sect/memberDispatcher.ts`**
   - 修复 `removeFromPost` 的 `splice()` 可变操作（第 77 行），改为 `filter()` 返回新数组
   - 修复 `assignToPost` 空壳实现，使其返回包含新成员列表的新状态

3. **`hooks/useGame/rpg/sect/contributionManager.ts`** — 审计不可变性（已部分满足）

4. **`hooks/useGame/rpg/sect/economyManager.ts`** — 审计不可变性（已部分满足）

**复杂度：** 高 | **风险：** 中

---

### Phase 3: 桥接层重定向（数据流层）

**目标：** `useRpgStateBridge` 不再同步引擎内部状态，改为应用 `ActionResult.stateUpdates` 到 Zustand。

**文件变更：**

1. **`hooks/useRpgStateBridge.ts`**
   - 修改 RPG action 执行流程：
     ```
     1. 从 Zustand 读取当前 rpgSectData
     2. 调用 engine.gainContribution(currentSect, amount)
     3. 从 ActionResult.stateUpdates.newSect 获取新状态
     4. Zustand.setRpgSectData(newSect)
     ```
   - 移除 `syncSectState()` 中从引擎读取内部状态的逻辑
   - 修复 `RpgSectIntegration.tsx` 直接调用 `setRpgSect()` 绕过引擎的问题（第 181/189 行）

2. **`hooks/useGame/rpg/rpgActionDispatcher.ts`**
   - 更新 sect 相关 action 路由，使其传入当前 Zustand state
   - 将 `stateUpdates.newSect` 转换为 Zustand dispatch

3. **`hooks/useGame/gameOrchestrator.ts`**
   - 简化 RPG 引擎注册逻辑（不再需要独立实例生命周期管理）
   - 引擎导出为纯工具模块

**复杂度：** 高 | **风险：** 中

---

### Phase 4: UI 统一（展示层）✅ 已完成

**目标：** 合并两套 UI，保留 `SectModal` 的完整展示 + 接入 RPG 交互按钮。

**已完成的文件变更：**

1. **`components/features/Sect/SectModal.tsx`** ✅
   - 添加 `injectSectState` 回调，RPG action 前先注入 Zustand 最新状态

2. **`components/features/Sect/MobileSect.tsx`** ✅ — 同上

3. **`components/features/Sect/RpgSectIntegration.tsx`** ✅ — **已删除**

4. **`components/layout/RightPanel.tsx`** ✅
   - 移除 `onOpenRpgSect` 属性
   - 移除 `🏯 RPG门派` 菜单项
   - 保留 `RPG_MENU_ITEMS` 中战斗/装备/功法/任务

5. **`App.tsx`** ✅
   - 移除 `openRpgSect` 路由

6. **`components/app/GameView.tsx`** ✅
   - 移除 `openRpgSect` 属性 + `onOpenRpgSect` 传递

7. **`components/features/lazyComponents.tsx`** ✅
   - 移除 `RpgSectIntegration` 导出

8. **`utils/moduleRegistry/legacyRegistrations.ts`** ✅
   - 移除 `rpgSect` 模块注册

---

### Phase 5: 持久化接入（保障层）✅ 已完成

**目标：** 完整门派数据（含岗位派遣）通过 IndexedDB 保存/恢复。

**确认结果：**

1. **`services/dbService.ts`** ✅ — `玩家门派` 字段已在保存/恢复时被正确处理（第 164 行）
2. **`models/system.ts`** ✅ — `存档结构` 已包含 `玩家门派?: 详细门派结构`（第 1757 行）
3. **`hooks/useGame/saveLoad/saveLoadWorkflow.ts`** ✅ — 加载存档后 `设置玩家门派` 被正确调用
4. **RPG 引擎不持有独立持久化状态** — 从 `state.玩家门派` 通过 `setState()` 注入

---

### Phase 6: 移除 RPG toggle 依赖（收尾）✅ 已完成

**目标：** 门派功能不再依赖 `rpgModeEnabled` flag。

**已完成的文件变更：**

1. **`components/layout/RightPanel.tsx`** ✅ — `🏯 RPG门派` 菜单项已移除
2. **门派统一入口** ✅ — 保留「门派」按钮作为唯一入口，不再根据 `rpgModeEnabled` 条件渲染
3. **`SectModal.tsx` / `MobileSect.tsx`** — 保留 `rpgMode` prop 用于条件显示 RPG 行动按钮（非阻断性，仅控制按钮可见性）

---

## 4. 执行顺序与依赖

```
Phase 1 (状态统一)
    ↓
Phase 2 (引擎重构) ← 依赖 Phase 1
    ↓
Phase 3 (桥接重定向) ← 依赖 Phase 2
    ↓
Phase 4 (UI 统一) ← 可与 Phase 3 并行
    ↓
Phase 5 (持久化) ← 依赖 Phase 1
    ↓
Phase 6 (移除 toggle) ← 最后执行
```

## 5. 风险评估

| 风险 | 等级 | 缓解措施 |
|------|------|---------|
| 引擎重构后不可变更新遗漏 | 中 | TypeScript readonly 约束 + 代码审查 |
| Zustand 状态膨胀 | 低 | 门派数据结构 <10KB |
| 存档兼容性破坏 | 中 | 保留 serialize()/fromJSON() 向后兼容 |
| UI 合并后组件过大 | 低 | 拆分 tab 为独立子组件 |

## 6. 预期效果

**融合前：**
- 门派功能需要手动切换 RPG 模式
- RPG 模式下功能残缺（按钮无效、无 UI）
- 两套数据不互通

**融合后：**
- 门派功能是原生模块，始终可用
- 完整的经济、贡献、任务、派遣交互
- 单一数据源，存档一致性
- AI 生成数据 + 玩家操作数据统一管理
