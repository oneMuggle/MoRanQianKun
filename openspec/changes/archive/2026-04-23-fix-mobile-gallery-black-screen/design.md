## Context

移动端点击图册功能后，页面全黑。根据用户提供的 HTML body 源码：
```html
<body class="bg-ink-black text-paper-white font-sans overflow-hidden h-screen w-screen selection:bg-wuxia-red selection:text-white transition-colors duration-500">
    <div id="root" class="relative z-10 h-full"></div>
    <script type="module" src="/index.tsx"></script>
</body>
```

问题分析：
1. root div 内为空，说明 React 组件未渲染
2. 可能原因：JavaScript 运行时错误、组件崩溃、或数据依赖问题
3. 需要检查懒加载、组件加载、和 useImageAssetPrefetch hook

## Goals / Non-Goals

**Goals:**
- 修复 MobileImageManagerModal 移动端黑屏问题
- 确保图册功能正常显示和工作

**Non-Goals:**
- 不修改桌面版 ImageManagerModal
- 不添加新功能
- 不修改其他移动端功能

## Decisions

### 技术方案

#### 可能的问题根源:

1. **useImageAssetPrefetch hook 问题**
   - MobileImageManagerModal 使用了 `useImageAssetPrefetch` hook
   - 该 hook 可能在 SSR 或无数据时出错

2. **大量 Props 传递**
   - MobileImageManagerModal 接收 60+ 个 props
   - App.tsx 中传递大量 state/meta 数据
   - 检查是否有必需数据缺失

3. **组件文件过大**
   - MobileImageManagerModal 约 3097 行
   - 可能存在模块加载问题

4. **懒加载Boundary异常**
   - 检查 `懒加载边界` 组件是否有 fallback 问题

#### 解决方案:

1. 逐步检查 props 数据源
2. 添加错误边界捕获
3. 验证数据完整性
4. 检查 useImageAssetPrefetch hook 实现

**决策依据：** 问题表现为"全黑"，说明 JS 执行链在某个环节断裂。需要从数据源→组件加载→渲染的链路逐步排查。

## Risks / Trade-offs

| 风险 | 缓解措施 |
|------|---------|
| 问题无法复现 | 需要用户设备信息进一步排查 |
| 大文件导致加载超时 | 考虑代码分割 |
| 缓存的旧数据导致问题 | 清除 IndexedDB |

## 影响评估

### 功能影响
- 直接影响：移动端图册功能

### 兼容性
- 不影响桌面端
- 不影响其他移动端功能

### 性能
- 大组件文件可能影响加载速度
- 需要检查 chunk 分割