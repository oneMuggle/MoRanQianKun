# 关系图谱整合方案

## 背景与目标

关系图谱当前作为独立按钮/modal 存在，与社交面板功能重叠。整合方案：
- **去掉独立关系按钮**，移除入口
- **将关系图谱嵌入社交面板**作为 tab 之一（"江湖谱" + "关系网"）
- **增强关系图谱内容**，提供社交面板没有的独特信息

## 涉及模块

- `components/features/Social/SocialModal.tsx` — 主社交面板，新增 tab 切换
- `components/features/Social/MobileSocial.tsx` — 移动端适配
- `components/features/Relationship/RelationshipGraph.tsx` — 图谱组件（增强）
- `hooks/useModalOpeners.ts` — 移除关系按钮入口
- `components/app/ModalLayer.tsx` — 移除关系 modal 渲染
- `components/layout/RightPanel.tsx` — 移除关系按钮
- `components/layout/MobileQuickMenu.tsx` — 移除移动端关系按钮
- `App.tsx` / `components/features/lazyComponents.tsx` — 移除关系懒加载组件

## 增强内容

关系图谱 tab 将展示社交面板没有的信息：

1. **关系分类图例** — 亲情/友情/爱情/敌对/师徒/同门/主从/恩仇/陌路，带颜色标识
2. **关系阶段进度** — 素未谋面 → 初识 → 点头之交 → 熟识 → 挚交 → 知己 → 生死之交
3. **NPC-NPC 关系边** — 不仅展示主角与 NPC 的关系，还展示 NPC 之间的关系网
4. **好感度数值标注** — 在关系线上显示好感度数值
5. **阵营/势力分组** — 根据 NPC 的身份/所属门派着色分组
6. **关系事件时间线** — 选中某条关系后展示互动历史

## 技术方案

### 状态传递

SocialModal 新增 props：
- `关系谱?: 关系网络数据` — 当前关系网络数据

### Tab 结构

社交面板顶部新增 tab 切换器：
- **Tab 1: "江湖谱"** — 原有的 NPC 列表 + 详情面板（保持不变）
- **Tab 2: "关系网"** — 关系图谱 + 图例 + 选中边详情

### 图谱增强

将 RelationshipGraph 增强为独立可复用组件，接受关系网络数据作为 props，
新增：图例面板、关系摘要卡片、选中边详情浮层。

## 实施步骤

- [x] 步骤 1：增强 RelationshipGraph 组件（图例、摘要、选中边详情）
- [x] 步骤 2：在 SocialModal 中新增 tab 切换，嵌入关系图谱
- [x] 步骤 3：在 MobileSocial 中同样嵌入关系图谱 tab
- [x] 步骤 4：SocialModal/MobileSocial props 传入关系谱数据
- [x] 步骤 5：从 RightPanel/MobileQuickMenu 移除独立关系按钮
- [x] 步骤 6：从 ModalLayer 移除关系 modal 渲染
- [x] 步骤 7：清理 lazyComponents 中的关系组件注册
- [x] 步骤 8：浏览器验证

## 风险评估

- 低风险：纯前端 UI 整合，不涉及数据层变更
- 关系谱数据已存在于 state.关系谱，只需传递到 SocialModal
