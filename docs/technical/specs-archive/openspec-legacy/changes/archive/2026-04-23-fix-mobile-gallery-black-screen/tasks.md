## 1. 问题排查

- [x] 1.1 检查App.tsx中isMobile状态的初始化逻辑
- [x] 1.2 检查MobileImageManagerModal懒加载是否正常触发
- [x] 1.3 检查useImageAssetPrefetch hook是否有运行时错误
- [x] 1.4 检查组件props传递的必需数据是否存在

## 2. 修复实施

- [x] 2.1 添加cultivationSystemEnabled到ManualTabContent的参数解构
- [ ] 2.2 检查其他TabContent组件是否也有相同问题
- [x] 2.3 验证修复后的组件能正常渲染

## 3. 验证测试

- [ ] 3.1 移动端打开图册功能，验证界面正常显示
- [ ] 3.2 验证所有Tab可正常切换
- [ ] 3.3 验证关闭按钮正常工作

## 完成标准

- 移动端点击图册后能正确显示界面（不再是空白黑屏）
- 图像工作台标题"图像工作台"和"Image Matrix"正常显示
- 7个Tab按钮（手动、图库、场景、队列、历史、资源、规则）可见可切换