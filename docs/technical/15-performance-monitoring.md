# 15 - 性能监控

> 归档来源：`docs/plans/2026-05-17-performance-monitor-enhancement.md`（已实施）
> 创建：2026-06-03

## 模块清单

| 文件 | 用途 |
|------|------|
| `components/features/Performance/FPSDisplay.tsx` | 实时 FPS 显示 |
| `components/features/Performance/PerformanceDashboard.tsx` | 性能仪表盘（更详细的运行时统计） |
| `App.tsx` 入口 | 通过条件编译包裹 `<Profiler>` 与 FPS 显示 |

## 关键设计

- **Profiler 包裹**：在 `App.tsx` 顶层使用 React 19 `<Profiler>` 收集渲染时间
- **FPS 计算**：requestAnimationFrame 滑动窗口
- **采样率**：开发模式 1s 一次，生产模式 5s 一次

## 触发场景

- 首次加载时启用
- 用户在 Settings 打开"显示性能信息"开关
