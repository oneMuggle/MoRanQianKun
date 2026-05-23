# 2026-05-23_memory_summary_background_refactor

## 背景与目标

当前记忆总结流程存在以下问题：

1. **弹窗仍然存在**：自动触发的记忆总结弹出 `remind` 弹窗，用户预期应为后台自动执行
2. **`processing` 阶段阻塞**：点击"确认并开始总结"后，弹窗内显示 spinner，关闭按钮被隐藏，用户无法关闭弹窗
3. **没有"正在总结中"的页面导航**：用户期望点击后能跳转到一个状态页面，但当前只是在弹窗内切换阶段
4. **总结完成后才显示内容**：AI 调用是 `await` 阻塞的，只有等返回后才进入 `review` 阶段

**目标**：将自动触发的记忆总结改为后台执行，同时保留手动触发的完整弹窗流程。

## 当前流程分析

### 自动触发流程

```
AI回复 → 写入记忆 → 应用并同步记忆系统 → 刷新记忆总结任务
  → 检查阈值 → set阶段('remind') → 弹窗弹出 → 阻塞用户体验
```

关键路径：
- `memorySummaryHandlers.ts` 第160-184行 `刷新记忆总结任务` — 总是设 `remind` 阶段
- `memorySummaryHandlers.ts` 第224-248行 `handleStartMemorySummary` — async 阻塞等待 AI 返回
- `MemorySummaryFlowModal.tsx` 第59-67行 — processing 阶段隐藏关闭按钮
- `useGameReturnMapper.ts` 第335行 — `memorySummaryOpen` 计算依赖 `阶段 !== 'idle'`

### 已有"静默"机制但不完整

代码中已有 `{ 静默: true }` 选项：
- `刷新记忆总结任务(memory, { 静默: true })` 不会设 `remind` 阶段
- 但任务仍然会被 `set待处理记忆总结任务(task)` 保存
- 由于 `memorySummaryOpen = Boolean(待处理任务) && 阶段 !== 'idle'`，如果阶段是 `idle` 则不会弹窗

**关键发现**：只要阶段保持 `idle`，后台任务可以被处理而不弹窗。但当前没有后台执行 + 完成通知的机制。

## 涉及的文件与模块

| 文件 | 角色 | 改动类型 |
|------|------|----------|
| `models/game-settings.ts` | 记忆配置结构 | 新增 `启用后台自动总结` 选项 |
| `hooks/useGame/memory/memorySummaryHandlers.ts` | 核心处理器 | 新增后台执行逻辑 + 完成通知 |
| `hooks/useGame/core/useGameReturnMapper.ts` | meta映射 | 新增后台总结状态暴露 |
| `hooks/useGame/subsystems/zustandStore.ts` | 状态定义 | 新增后台总结状态字段 |
| `components/features/Memory/MemorySummaryFlowModal.tsx` | 弹窗UI | processing阶段显示关闭按钮 |
| `components/app/MemoryModals.tsx` | 弹窗挂载 | 接入后台总结通知 |
| `components/features/Memory/BackgroundSummaryNotification.tsx` | 新建通知组件 | 显示后台总结状态 |
| `hooks/useGame/sendWorkflow/responseProcessingPhase.ts` | 自动触发点 | 传入静默选项 |

## 技术方案

### 方案概述

引入"后台自动总结"机制：

1. **新增配置项** `启用后台自动总结`（默认 `true`）
2. **新增 Zustand 状态** `后台记忆总结状态`: `'idle' | 'running' | 'done' | 'error'`
3. **后台执行**：当自动触发总结时，如果开启了后台模式：
   - 不设置 `记忆总结阶段`（保持 `idle`），不弹窗
   - 设置 `后台记忆总结状态 = 'running'`
   - 在后台调用 AI 进行总结
   - 完成后设置 `后台记忆总结状态 = 'done'`，保存草稿
   - 如果失败设置 `后台记忆总结状态 = 'error'`
4. **状态指示**：在 TopBar 或游戏界面顶部显示一个小型图标提示"正在总结"或"总结完成"
5. **结果查看**：用户点击提示后，跳转到 review 阶段弹窗
6. **手动触发不受影响**：手动触发仍然走完整的弹窗流程

### 实施步骤

#### 步骤 1：新增配置项和状态定义
- [ ] `models/game-settings.ts`：在 `记忆配置结构` 中添加 `启用后台自动总结?: boolean`
- [ ] `hooks/useGame/subsystems/zustandStore.ts`：添加 `后台记忆总结状态`、`后台记忆总结草稿`、`后台记忆总结错误` 状态字段

#### 步骤 2：修改 `memorySummaryHandlers.ts`
- [ ] 新增 `handleBackgroundMemorySummary` 方法 — 后台异步执行总结
- [ ] 修改 `刷新记忆总结任务` — 根据 `启用后台自动总结` 配置决定是否静默
- [ ] 新增 `handleApplyBackgroundMemorySummary` — 应用后台总结结果
- [ ] 新增 `handleDismissBackgroundNotification` — 关闭通知

#### 步骤 3：暴露状态到 meta/actions
- [ ] `hooks/useGame/core/useGameReturnMapper.ts`：添加 `backgroundMemorySummaryStatus` 等 meta
- [ ] `hooks/useGame/memory/memorySummaryHandlers.ts`：return 新增方法

#### 步骤 4：创建后台总结通知组件
- [ ] 新建 `components/features/Memory/BackgroundSummaryNotification.tsx` — 顶部通知条
- [ ] 集成到 `components/app/MemoryModals.tsx`

#### 步骤 5：修改弹窗 UI
- [ ] `MemorySummaryFlowModal.tsx`：processing 阶段允许关闭（改为"在后台继续"）
- [ ] `MemorySummaryFlowMobileModal.tsx`：同上

#### 步骤 6：连接自动触发点
- [ ] `responseProcessingPhase.ts`：确认自动触发时传入正确的静默选项
- [ ] 确保默认行为为后台执行

## 风险评估与依赖

| 风险 | 等级 | 应对 |
|------|------|------|
| AI 调用期间组件卸载导致 setState 警告 | 中 | 在后台任务中添加 abort/cleanup 逻辑 |
| 多个后台任务并发 | 低 | 同一时间只允许一个后台任务，新任务排队 |
| 用户误关闭 processing 弹窗后状态丢失 | 低 | 关闭后转为后台继续，不丢失进度 |

## 用户体验流程

### 修改后的自动触发流程

```
AI回复 → 写入记忆 → 检查阈值 → 后台开始总结
  → 游戏界面顶部显示 ⏳ "记忆总结中..."
  → AI 返回 → 显示 ✓ "总结完成，点击查看"
  → 用户点击 → 弹出 review 弹窗（可编辑）
  → 确认写入 → 应用结果
```

### 修改后的手动触发流程（不变）

```
用户点击"熔金化元" → 弹出 remind 弹窗
  → 确认开始 → processing 阶段（可关闭→后台继续）
  → AI 返回 → review 阶段
  → 确认写入
```
