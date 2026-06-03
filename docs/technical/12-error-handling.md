# 12 - 错误处理

> 创建：2026-06-03
> 状态：**已建立基础设施**（ErrorBoundary 全局包裹 + Toast 系统就绪）

## 三层错误处理

```
┌─────────────────────────────────────┐
│ Layer 1: 全局 ErrorBoundary         │ ← 渲染错误兜底
│  （App.tsx 根）                      │
└─────────────────────────────────────┘
              ↓ 错误时
┌─────────────────────────────────────┐
│ Layer 2: ToastManager               │ ← 业务异常通知
│  （mounted 一次性）                  │
└─────────────────────────────────────┘
              ↓ 异步错误
┌─────────────────────────────────────┐
│ Layer 3: 业务代码显式 try/catch    │ ← 精细控制
│  （服务层 hooks）                    │
└─────────────────────────────────────┘
```

## 现有错误处理（2026-06-03 调研）

| 文件 | 类型 | 状态 |
|---|---|---|
| `components/ui/ErrorBoundary.tsx` | 渲染错误兜底 | ✅ 已激活 |
| `hooks/useGame/deviceNotificationWorkflow.ts` | 业务消息（设备消息系统）| 保留 |
| `components/features/Galgame/EndingNotification.tsx` | 结局提示 | 保留（独立） |
| `components/ui/ToastManager.tsx` | 统一 Toast | ✅ 新建（2026-06-03）|

## ErrorBoundary 用法

```tsx
// App.tsx
return (
    <ErrorBoundary>
        <MusicProvider>
            {/* ... 整个应用 ... */}
        </MusicProvider>
        <ToastManager />
    </ErrorBoundary>
);
```

- **捕获**：所有子组件的渲染错误
- **降级**：显示错误信息 + 重新加载按钮
- **不捕获**：事件处理器、异步代码（这些需手动 try/catch）

## ToastManager 用法

```tsx
import { toast, useToast } from './components/ui/ToastManager';

// 模块级（无需在组件内）
toast.error('保存失败：' + err.message);
toast.warn('存档已过期');
toast.info('已加载远程世界书');

// 组件内（推荐）
const { push, dismiss, clear } = useToast();
push('error', '网络断开，正在重试...', 0); // duration=0 不自动消失
```

### 三种级别

| 级别 | 颜色 | 默认时长 | 用途 |
|---|---|---|---|
| `info` | 蓝 | 3s | 普通通知、加载完成 |
| `warn` | 橙 | 5s | 警告、非阻塞问题 |
| `error` | 红 | 8s | 错误、需用户注意 |

## 未来工作

### Layer 3 业务层错误处理（待 P6-3/P6-4）

- **AI 调用**：流式中断→自动重试 1 次；解析失败→`jsonRepair`；网络错误→重试按钮
- **IndexedDB**：QuotaExceeded 提示清理；迁移失败阻止启动；写失败内存兜底

### 弹窗级 ErrorBoundary（待 P6-1 续）

```tsx
// 弹窗渲染时崩溃不影响主游戏
<ErrorBoundary fallback={<ModalErrorFallback />}>
    <XxxModal />
</ErrorBoundary>
```

可在 `components/app/ModalLayer.tsx` 中统一包装。

## 设计原则

1. **降级而非崩溃**：错误时尽量保留可用功能（如 Toast 不阻塞 UI）
2. **明确错误来源**：每条 toast 标明是哪个操作/哪个服务
3. **可重试优先**：AI/网络错误给用户"重试"按钮而非仅提示
4. **本地优先**：本地数据持久化，远程错误不影响游戏继续

## 相关文件

- `components/ui/ErrorBoundary.tsx`
- `components/ui/ToastManager.tsx`
- `App.tsx`（mount 点）
- `hooks/useGame/deviceNotificationWorkflow.ts`（业务消息，独立保留）
