# 修复：取消发送后输入框不可用

## 问题描述

用户发送消息后点击"停止"取消，输入框保持灰色不可用状态，无法再次发送信息。

## 根因

abort 处理中调用 `应用并同步记忆系统(normalizedMemBeforeSend)` 时没有传入静默选项，触发了 `刷新记忆总结任务` → `执行后台记忆总结` → `set后台记忆总结状态('running')`。由于 `backgroundSummaryLocking` 来自 `meta.backgroundMemorySummaryStatus === 'running'`，这导致输入框被 `busy = loading || isPreparing || backgroundSummaryLocking` 永久禁用。

## 修复

**文件**: `hooks/useGame/sendWorkflow/index.ts`（约第982行）

abort 时传入 `{ 静默总结提示: true }`，阻止触发新的后台记忆总结。

```typescript
// 修复前
deps.应用并同步记忆系统(normalizedMemBeforeSend);

// 修复后
deps.应用并同步记忆系统(normalizedMemBeforeSend, { 静默总结提示: true });
```

## 已完成

- [x] 修改 sendWorkflow abort 处理，传入静默选项阻止后台记忆总结
- [x] 修改 sendWorkflow abort 回档逻辑，不再弹出快照（保留快照供重roll使用）
- [x] 清理调试日志
- [x] 验证 build 通过
