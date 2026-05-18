# 性能监控系统完善计划

**日期：** 2026-05-17
**状态：** 已完成
**分支：** main
**关联计划：** [2026-05-04_performance-monitoring.md](./2026-05-04_performance-monitoring.md)（原始实现，代码已写但未集成）

---

## 背景与目标

用户在加入新模块后感到浏览器明显卡顿。经排查发现：**原始性能监控计划（2026-05-04）的代码已全部写好，但从未真正启用**——FPS 组件没有被挂载到 App.tsx，监控 Hook 没有被接入 useGame.ts，且存在 FPS 计算逻辑重复实现的问题。

**目标：**
1. 修复现有性能监控的断裂链路，让监控真正生效
2. 增加 React 渲染分析，定位哪个模块导致卡顿
3. 增加内存追踪与 AI 队列监控
4. 提供统一的性能面板 UI，支持快捷键切换

## 涉及文件

### 新建文件（6个）

| 文件 | 说明 |
|------|------|
| `hooks/useGame/quality/renderProfiler.ts` | React Profiler API 封装，追踪组件渲染耗时/次数 |
| `hooks/useGame/quality/memoryTracker.ts` | 核心状态对象体积增长检测 |
| `hooks/useGame/quality/aiQueueMonitor.ts` | AI 请求队列追踪（pending/active/平均等待） |
| `components/features/Performance/PerformanceDashboard.tsx` | 性能面板：集成所有指标 |
| `components/features/Performance/SlowOperationLog.tsx` | 慢操作日志列表 UI |
| `hooks/useGame/quality/performanceProfilerWrapper.tsx` | ProfiledComponent 包裹器，用于懒加载弹窗 |

### 修改文件（8个）

| 文件 | 变更内容 |
|------|----------|
| `models/system.ts` | 扩展 `性能监控配置结构` 接口 |
| `utils/performanceMonitorSettings.ts` | 新字段规范化 |
| `hooks/useGame/quality/performanceMonitor.ts` | 重写为单一数据源，消除重复 |
| `components/features/Performance/FPSDisplay.tsx` | 移除内部 FPS 计算，消费共享数据 |
| `App.tsx` | 挂载 FPSDisplay + PerformanceDashboard + 快捷键 |
| `hooks/useGame.ts` | 接入性能监控，包裹 AI/生图计时 |
| `hooks/useGame/config/settingsPersistenceWorkflow.ts` | 持久化新配置字段 |
| `components/features/Settings/PerformanceMonitorSettings.tsx` | 新增功能开关 UI |

## 技术方案

### 架构概览

```
App.tsx
├── FPSDisplay (消费共享 FPS)
├── PerformanceDashboard (Ctrl+Shift+P 切换)
│   ├── FPS 卡片
│   ├── 内存卡片
│   ├── AI 响应时间卡片
│   ├── AI 队列状态卡片
│   ├── 渲染热区报告
│   └── SlowOperationLog
│
useGame.ts
├── usePerformanceMonitor (Hook)
│   ├── FPS 计算 (requestAnimationFrame)
│   ├── 记录AI响应()
│   ├── 记录生图响应()
│   └── 记录状态更新()
├── usePerformanceTracker
│   └── 慢操作记录 (ring buffer, 20条)
├── aiQueueMonitor
│   ├── enqueue() / complete() / fail()
│   └── activeCount / avgWaitTime
└── memoryTracker
    ├── 定期采样 JSON.stringify(state).length
    └── 单调增长检测
```

### 关键设计决策

1. **FPS 数据源唯一化**：FPSDisplay.tsx 不再有自己的 requestAnimationFrame 循环，改为通过 props 或订阅接收 performanceMonitor.ts 提供的 FPS 值。

2. **渲染分析默认关闭**：React Profiler 会引入额外开销，因此默认不启用，用户通过设置面板手动开启。

3. **内存检测使用 requestIdleCallback**：避免在主线程繁忙时执行 JSON.stringify，检测间隔设为 30s。

4. **AI 队列无侵入接入**：通过包装现有的 AI 调用点（sendWorkflow 中的 generateStoryResponse 等），在调用前后自动 enqueue/complete，不改变业务逻辑。

## 实施步骤

### 步骤 1：扩展性能配置模型

**文件：** `models/system.ts`

在 `性能监控配置结构` 接口中新增字段：

```typescript
export interface 性能监控配置结构 {
    启用性能监控: boolean;       // 默认 false
    显示FPS: boolean;           // 默认 false
    AI响应慢阈值ms: number;     // 默认 10000
    生图慢阈值ms: number;       // 默认 30000
    // --- 新增 ---
    显示性能面板: boolean;       // 默认 false
    启用渲染分析: boolean;       // 默认 false
    启用内存追踪: boolean;       // 默认 false
    启用AI队列监控: boolean;     // 默认 false
    慢操作显示条数: number;      // 默认 10
}
```

同步更新 `默认性能监控配置` 常量。

### 步骤 2：更新配置规范化

**文件：** `utils/performanceMonitorSettings.ts`

为新增字段添加规范化逻辑：

```typescript
export const 规范化性能监控设置 = (
    raw?: Partial<性能监控配置结构> | null
): 性能监控配置结构 => {
    return {
        启用性能监控: raw?.启用性能监控 ?? 默认性能监控配置.启用性能监控,
        显示FPS: raw?.显示FPS ?? 默认性能监控配置.显示FPS,
        AI响应慢阈值ms: Number(raw?.AI响应慢阈值ms) || 默认性能监控配置.AI响应慢阈值ms,
        生图慢阈值ms: Number(raw?.生图慢阈值ms) || 默认性能监控配置.生图慢阈值ms,
        // 新增
        显示性能面板: raw?.显示性能面板 ?? 默认性能监控配置.显示性能面板,
        启用渲染分析: raw?.启用渲染分析 ?? 默认性能监控配置.启用渲染分析,
        启用内存追踪: raw?.启用内存追踪 ?? 默认性能监控配置.启用内存追踪,
        启用AI队列监控: raw?.启用AI队列监控 ?? 默认性能监控配置.启用AI队列监控,
        慢操作显示条数: Number(raw?.慢操作显示条数) || 默认性能监控配置.慢操作显示条数,
    };
};
```

### 步骤 3：重写 performanceMonitor.ts

**文件：** `hooks/useGame/quality/performanceMonitor.ts`

核心变更：
- FPS 计算逻辑保持为唯一实现
- 新增 `subscribe(listener)` 机制，让 FPSDisplay 和 Dashboard 能响应数据变化
- 新增 `记录状态更新(category, duration)` 用于追踪 setState 延迟
- 新增 `获取FPS()` 直接返回当前 FPS 值
- 慢操作阈值改为从配置读取（而非硬编码 10s/30s）

### 步骤 4：修改 FPSDisplay

**文件：** `components/features/Performance/FPSDisplay.tsx`

移除内部 `requestAnimationFrame` 循环，改为 props 驱动：

```typescript
interface Props {
  fps: number;
  memoryMB?: number;
  enabled: boolean;
}

const FPSDisplay: React.FC<Props> = ({ fps, memoryMB, enabled }) => {
  if (!enabled) return null;
  return (
    <div style={{ /* 原有样式 */ }}>
      {fps} FPS{memoryMB ? ` · ${memoryMB}MB` : ''}
    </div>
  );
};
```

### 步骤 5：挂载 FPSDisplay 到 App.tsx

**文件：** `App.tsx`

在 game view 区域内添加：

```tsx
<FPSDisplay
  enabled={state.performanceConfig?.显示FPS && state.performanceConfig?.启用性能监控}
  fps={perfData.fps}
  memoryMB={perfData.当前内存MB}
/>
```

### 步骤 6：创建 renderProfiler.ts（新建）

**文件：** `hooks/useGame/quality/renderProfiler.ts`

使用 React Profiler API，核心功能：
- `RenderProfiler` 类：记录每个 id 的 renderCount / totalTime / averageTime / maxTime
- `useRenderProfiler(enabled)` Hook：返回 profiler 实例和 onRender 回调
- `getHotComponents(threshold)`：返回渲染次数超过阈值的 Top 10 组件

### 步骤 7：包裹关键组件

为 GameView 主内容和懒加载弹窗添加 `<Profiler>` 包裹：

```tsx
import { Profiler } from 'react';

{renderProfilingEnabled && (
  <Profiler id="GameView" onRender={onRenderCallback}>
    {/* 游戏主内容 */}
  </Profiler>
)}
```

### 步骤 8：创建 memoryTracker.ts（新建）

**文件：** `hooks/useGame/quality/memoryTracker.ts`

- 追踪 `历史记录`、`社交`、`记忆系统`、`世界`、`任务列表` 等核心状态对象
- 每 30s 采样一次（使用 requestIdleCallback）
- 检测单调增长：当对象体积增长超过 50% 或超过 5MB 时产生告警
- 保留最近 20 条告警

### 步骤 9：创建 aiQueueMonitor.ts（新建）

**文件：** `hooks/useGame/quality/aiQueueMonitor.ts`

- 追踪每条 AI 请求：`{ id, operation, model, startTime, status }`
- 方法：`enqueue()` / `activate()` / `complete()` / `fail()`
- 统计：activeCount / pendingCount / averageDuration / failedCount
- 保留最近 50 条历史记录

### 步骤 10：创建 SlowOperationLog 组件（新建）

**文件：** `components/features/Performance/SlowOperationLog.tsx`

展示慢操作记录列表，包含时间戳、操作名称、耗时（颜色编码：绿色 < 5s，黄色 5-10s，红色 > 10s）。

### 步骤 11：创建 PerformanceDashboard 组件（新建）

**文件：** `components/features/Performance/PerformanceDashboard.tsx`

集成所有指标的总控面板，布局：

```
┌─────────────────────────────────────────┐
│ 性能监控面板              [×] [最小化]  │
├─────────────────────────────────────────┤
│ FPS: 58 ████████████░░░░░  内存: 245MB │
├─────────────────────────────────────────┤
│ AI 响应: 3.2s  |  生图: --  |  队列: 0 │
├─────────────────────────────────────────┤
│ AI 队列状态                             │
│   活跃: 0 | 等待: 0 | 平均耗时: 2.8s    │
├─────────────────────────────────────────┤
│ 渲染热区 (最近 100 次渲染)              │
│   1. ChatPanel     42次  总计 890ms    │
│   2. NPCList       28次  总计 456ms    │
│   3. WorldMapView  15次  总计 234ms    │
├─────────────────────────────────────────┤
│ 内存告警                                │
│   ⚠ 历史记录 增长 67% (2.1MB → 3.5MB)  │
├─────────────────────────────────────────┤
│ 慢操作日志                              │
│   [12:34:56] AI响应 耗时 12.3s         │
│   [12:35:01] 图片生成 耗时 35.1s       │
└─────────────────────────────────────────┘
```

### 步骤 12：挂载 PerformanceDashboard 到 App.tsx

**文件：** `App.tsx`

添加快捷键监听和面板渲染：

```tsx
useEffect(() => {
  const handler = (e: KeyboardEvent) => {
    if (e.ctrlKey && e.shiftKey && e.key === 'P') {
      setShowPerfDashboard(prev => !prev);
    }
  };
  window.addEventListener('keydown', handler);
  return () => window.removeEventListener('keydown', handler);
}, []);

{showPerfDashboard && (
  <PerformanceDashboard
    perfData={perfData}
    aiQueueStats={aiQueueMonitor.getStats()}
    renderReport={renderProfiler?.getHotComponents()}
    memoryAlerts={memoryTracker.alerts}
    slowOps={performanceTracker.获取慢操作记录()}
  />
)}
```

### 步骤 13：在 useGame.ts 中接入性能监控

**文件：** `hooks/useGame.ts`

1. 在 Hook 顶部初始化性能监控：
```typescript
const perfTracker = usePerformanceTracker();
const perfMonitor = usePerformanceMonitor({
  onSlowOperation: perfTracker.处理慢操作,
  config: performanceConfig,
});
const aiQueueMonitor = useAIQueueMonitor();
const memoryTracker = useMemoryTracker(performanceConfig.启用内存追踪, state);
const renderProfiling = useRenderProfiler(performanceConfig.启用渲染分析);
```

2. 在 AI 调用点包裹计时（sendWorkflow 中的 generateStoryResponse 前后）
3. 在生图调用点包裹计时（类似模式）
4. 将监控对象加入返回值

### 步骤 14：暴露性能数据到 useGame 返回值

**文件：** `hooks/useGame.ts`

在 return 对象中新增 `perfData` 和 `perfActions` 字段。

### 步骤 15：更新设置持久化

**文件：** `hooks/useGame/config/settingsPersistenceWorkflow.ts`

在保存/加载性能监控设置中增加对新字段的读写支持。

### 步骤 16：更新设置 UI

**文件：** `components/features/Settings/PerformanceMonitorSettings.tsx`

新增开关：显示性能面板、启用渲染分析、启用内存追踪、启用 AI 队列监控、慢操作显示条数（数字输入框，范围 5-20）。

### 步骤 17：添加快捷键

**文件：** `App.tsx`

已在步骤 12 中实现 Ctrl+Shift+P 快捷键。

## 风险评估

| 风险 | 级别 | 缓解 |
|------|------|------|
| useGame.ts 近 3000 行，改动易出错 | 高 | 最小化改动，仅通过现有 dep 传递函数 |
| React Profiler 引入额外开销 | 中 | 默认关闭，用户手动开启 |
| 内存检测阻塞主线程 | 中 | requestIdleCallback + 30s 间隔 |
| 面板自身导致重渲染 | 低 | React.memo + 节流 |

## 验收标准

- [ ] FPS 显示在游戏角落可见（之前不可见）
- [ ] 性能监控已接入 useGame（之前未使用）
- [ ] 无重复 FPS 计算逻辑
- [ ] 性能面板显示 FPS、内存、AI 计时、队列状态、渲染热区
- [ ] 慢操作日志在 UI 中可见
- [ ] 渲染分析可识别高频重渲染组件
- [ ] 内存检测可发现增长过快的状态对象
- [ ] AI 队列监控显示 pending/active 请求
- [ ] 所有新设置跨会话持久化
- [ ] Ctrl+Shift+P 快捷键可用
- [ ] 所有监控功能可独立开关
- [ ] 构建通过无错误
