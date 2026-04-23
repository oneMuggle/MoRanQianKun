## Why

移动端点击图册功能时，页面全黑，React 组件未能正确渲染。root div 内部没有内容，页面只显示空的结构。这说明 `MobileImageManagerModal` 组件在移动端加载时可能存在 JavaScript 错误、异步数据依赖缺失或其他渲染问题。

## What Changes

- 修复 `MobileImageManagerModal` 组件在移动端的渲染问题
- 确保组件能正确加载并显示图像管理工作台界面

## Capabilities

### New Capabilities
- `mobile-gallery-fix`: 修复移动端图册功能无法显示的问题

### Modified Capabilities
- (无)

## Impact

- 受影响组件：`components/features/Social/mobile/MobileImageManagerModal.tsx`
- 受影响页面：移动端图册功能

## 变更范围

### 需要修复的内容
1. 检查组件的 props 传递和数据依赖
2. 检查是否存在 JavaScript 错误
3. 检查懒加载边界配置

### 非目标
- 不修改桌面版图册功能
- 不修改其他移动端功能

## 验收标准

1. 移动端点击图册后能正确显示界面
2. 图像工作台的各个 Tab（手动、图库、场景、队列、历史、资源、规则）能正常切换
3. 关闭按钮和其他交互元素能正常工作