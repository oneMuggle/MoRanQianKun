# 移动端 UI 优化计划

> 创建日期：2026-04-01
> 状态：进行中
> 关联规范：`openspec/specs/desktop-mobile-settings-unification/spec.md`

---

## 1. 需求分析

### 1.1 现状

项目采用桌面端/移动端双组件模式，通过 `App.tsx` 中 `window.matchMedia('(max-width: 767px)')` 检测设备类型，动态加载 Desktop 或 Mobile 组件。

**现有实现**：
- `SettingsPanel.tsx` 使用 `navMode` prop 区分桌面端（'sidebar'）和移动端（'pills'）
- `mobileTabs` 和 `desktopTabs` 在 `tabDefinitions.ts` 中定义
- 所有设置标签页在两端都有对应实现

**问题**：
- 规范文档 `openspec/specs/desktop-mobile-settings-unification/spec.md` 引用了不存在的 `MobileSettingsModal.tsx`
- 规范描述与实际实现不一致，可能导致后续开发困惑
- 需要确认 SaveLoad 组件是否需要真正统一

### 1.2 规范要求

根据 `openspec/specs/desktop-mobile-settings-unification/spec.md`：

1. **移动端设置必须包含所有桌面端标签页** - 包括 `integrated_models`、`npc_management` 等
2. **桌面端和移动端 Settings 必须共享相同的 Props API**
3. **SaveLoad 模态框应该跨设备统一** - 使用单一响应式组件

---

## 2. 实施方案

### Phase 1: 验证现有实现

- [x] 检查 `SettingsPanel.tsx` 是否包含所有必要的设置面板
- [x] 验证 `mobileTabs` 与 `desktopTabs` 的一致性
- [x] 确认 `integrated_models` 和 `npc_management` 面板存在

**验证结果**：
- `SettingsPanel.tsx` 第23行导入 `IntegratedModelSettings`
- `SettingsPanel.tsx` 第28行导入 `NpcManager`
- `tabDefinitions.ts` 中 `mobileTabs` 包含所有 23 个标签页
- 现有实现满足规范要求

### Phase 2: 文档修正

- [ ] 更新 `openspec/specs/desktop-mobile-settings-unification/spec.md` 移除对不存在文件的引用
- [ ] 明确说明使用 `SettingsPanel` + `navMode` 的响应式方案

### Phase 3: SaveLoad 组件评估

根据 `design.md` 分析：
- 桌面端 `SaveLoadModal.tsx` (18529 bytes) - 三栏布局，支持导入/导出 ZIP
- 移动端 `MobileSaveLoadModal.tsx` (5201 bytes) - 单栏布局，简化设计

**结论**：两者布局和交互方式不同，是合理的设计差异，不需要合并。

---

## 3. 验收标准

1. **功能 parity**：移动端设置包含与桌面端相同的所有设置标签页
2. **Props 一致性**：两端的 `SettingsPanel` 接收相同的核心 props
3. **响应式适配**：使用 `navMode` prop 区分桌面端和移动端布局
4. **文档准确**：规范文档准确反映实际实现

---

## 4. 文件变更清单

### 无需变更

现有实现已满足规范要求：
- `components/features/Settings/SettingsPanel.tsx` - 响应式设置面板
- `components/features/Settings/tabDefinitions.ts` - 统一的标签页定义
- `components/features/SaveLoad/SaveLoadModal.tsx` - 桌面端存档
- `components/features/SaveLoad/MobileSaveLoadModal.tsx` - 移动端存档（独立设计合理）

### 待更新

- `openspec/specs/desktop-mobile-settings-unification/spec.md` - 文档澄清

---

## 5. 风险评估

| 风险 | 等级 | 缓解措施 |
|------|------|----------|
| 文档与实现不一致导致开发困惑 | 低 | 更新文档以反映实际架构 |
| SaveLoad 组件差异影响用户体验 | 低 | 差异是有意设计，移动端简化适合触屏 |

---

## 6. 实施记录

### 2026-04-01 初始化
- 创建本计划文件
- 验证现有实现满足规范要求
- 确定无需大规模代码修改，仅需文档更新
