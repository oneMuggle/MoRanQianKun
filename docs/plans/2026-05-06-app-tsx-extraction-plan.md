# App.tsx 提取优化方案

> 生成时间：2026-05-06
> 当前状态：App.tsx 2027 行，66 个 hooks（14 useState + ~30 useCallback + ~10 useMemo + ~12 useEffect）

---

## 已完成提取

| 步骤 | 提取内容 | 目标文件 | 减少行数 | 状态 |
|------|---------|---------|---------|------|
| 7.2 | 55 个懒组件声明 | `components/features/lazyComponents.tsx` | -54 行 | ✅ |
| 7.3 | isMobile + matchMedia | `hooks/useResponsive.ts` | -10 行 | ✅ |
| 7.4 | useModalOpeners 面板开关 | `hooks/useModalOpeners.ts` | -170 行 | ✅ |
| 7.5 | useConfirmSystem 确认框 | `hooks/useConfirmSystem.tsx` | -29 行 | ✅ |

---

## 候选提取项（按 ROI 排序）

### 1. useModalOpeners — 面板开关逻辑 (最高 ROI)

**涉及代码：** 第 409-614 行（~200 行）

**内容：**
- `closeAllPanels` — 关闭所有面板
- 20+ 个 `openXxx` / `closeXxx` callbacks（角色、装备、战斗、背包、社交等）
- `handleMobileMenuClick` — 移动端菜单路由（~80 行 switch）
- `openImageManagerWithCheck` — 带 API 检查的图片管理器
- `openNovelDecompositionWorkbench` — 带异步检查的小说分解工作台

**提取后接口：**
```typescript
// hooks/useModalOpeners.ts
export function useModalOpeners(setters: GameSetters, localStates: LocalModalStates) {
  return {
    closeAllPanels,
    openCharacter, openSettings, openInventory, // ... 20+ openers
    handleMobileMenuClick,
    openImageManagerWithCheck,
    openNovelDecompositionWorkbench,
    // Local state setters
    setShowCharacter, setShowImageManager, setShowWorldbookManager,
    showNovelDecompositionWorkbench, showNovelWritingWorkbench,
    showMobileMusic, showCampusDesire,
    showBDSMRelationship, showBDSMContract, showBDSMSafety,
  };
}
```

**预估减少：** ~180 行

---

### 2. useConfirmSystem — 确认对话框 (中等 ROI)

**涉及代码：** 第 111-141 行（~30 行）

**内容：**
- `confirmState` 状态
- `requestConfirm` callback
- `resolveConfirm` callback
- `InAppConfirmModal` 的渲染逻辑

**提取后接口：**
```typescript
// hooks/useConfirmSystem.ts
export function useConfirmSystem() {
  return {
    confirmState,
    requestConfirm: (opts: ConfirmOptions) => Promise<boolean>,
    resolveConfirm: (accepted: boolean) => void,
    ConfirmModal: () => JSX.Element, // 渲染 InAppConfirmModal
  };
}
```

**预估减少：** ~30 行

---

### 3. useTicker — 滚动公告 (低 ROI)

**涉及代码：** 第 303-336 行（~35 行）

**内容：**
- `tickerEvents` useMemo
- `启用同人模式` useMemo
- `renderTickerItems` callback
- `currentEnvTime` useMemo

**提取后接口：**
```typescript
// hooks/useTicker.ts
export function useTicker(state: GameState) {
  return { tickerEvents, 启用同人模式, currentEnvTime, renderTickerItems };
}
```

**预估减少：** ~30 行

---

### 4. useVisualTheme — 视觉主题 (低 ROI)

**涉及代码：** 第 338-355 行（~20 行）

**内容：**
- `当前背景图片地址` useMemo
- `玩家头像地址` useMemo
- `fontFaceStyleText` useMemo
- `uiTextStyleVars` useMemo

**提取后接口：**
```typescript
// hooks/useVisualTheme.ts
export function useVisualTheme(visualConfig: 视觉设置结构, playerState: any) {
  return { 背景样式, 头像样式, fontFaceStyleText, uiTextStyleVars };
}
```

**预估减少：** ~20 行

---

### 5. useDerivedState — 派生状态计算 (低 ROI)

**涉及代码：** 第 346-407 行（~60 行）

**内容：**
- `玩家锚点` useMemo
- `playerProfile` useMemo
- `runtimeStateSections` useMemo
- `latestAssistantMessage` useMemo
- `currentOptions` useMemo
- 活跃面板名称计算

**提取后接口：**
```typescript
// hooks/useDerivedState.ts
export function useDerivedState(state: GameState, meta: GameMeta, actions: GameActions) {
  return { 玩家锚点, playerProfile, runtimeStateSections, latestAssistantMessage, currentOptions, activePanelName };
}
```

**预估减少：** ~55 行

---

### 6. useKeyboardShortcuts — 快捷键 (低 ROI)

**涉及代码：** 第 622-638 行（~16 行）

**内容：**
- M 键打开设备
- 条件判断（game view + 无其他面板打开）

**提取后接口：**
```typescript
// hooks/useKeyboardShortcuts.ts
export function useKeyboardShortcuts(state: GameState, actions: GameActions) {
  // M key → openDevice
}
```

**预估减少：** ~15 行

---

### 7. useNovelDecompositionMonitor — 小说分解监控 (极低 ROI)

**涉及代码：** 第 159-167 行（~10 行）

**内容：**
- 订阅 `小说拆分后台调度服务`
- 错误通知推送

**预估减少：** ~10 行

---

## 预期效果汇总

| 提取项 | 行数减少 | 难度 | 依赖 |
|--------|---------|------|------|
| useModalOpeners | ~180 | 中 | 无 |
| useConfirmSystem | ~30 | 低 | 无 |
| useDerivedState | ~55 | 中 | 无 |
| useTicker | ~30 | 低 | 无 |
| useVisualTheme | ~20 | 低 | 无 |
| useKeyboardShortcuts | ~15 | 低 | 无 |
| useNovelDecompositionMonitor | ~10 | 低 | 无 |
| **已完成** | **~258** | | |

**App.tsx 当前行数：** 2115 → 1828 行（-287 行）

---

## 推荐执行顺序

```
已完成: 7.2 (lazyComponents) → 7.3 (useResponsive) → 7.4 (useModalOpeners) → 7.5 (useConfirmSystem)
剩余跳过: 7.6-7.9 (循环依赖 + 低 ROI)
```

---

## 风险与约束

1. **useModalOpeners** 依赖最多（20+ callbacks + local states），需要仔细处理闭包依赖
2. **useDerivedState** 计算的 useMemo 如果被 UI 组件直接引用，需要确保依赖数组正确
3. 所有提取必须保证 `npx vite build` 通过
4. 不改变任何运行时行为
