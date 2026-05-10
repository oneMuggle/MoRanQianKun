# 地图功能优化方案

**日期：** 2026-05-10
**状态：** 待实施

---

## 背景与目标

地图功能（`components/features/Map/`、`hooks/useGame/travel/`）在当前项目中已经实现且可正常工作，但存在以下体验问题：

1. **开局地图为空** — `世界.地图` 初始化为空数组，完全依赖 AI 世界演变生成，新用户打开地图可能看到"暂无数据"
2. **旅行事件叙事割裂** — 旅行事件使用硬编码模板，与 AI 生成的主剧情风格不一致
3. **旅行事件不会自动清除** — 执行旅行后事件长期驻留 Zustand store
4. **TypeScript 类型不规范** — MapModal 中大量使用 `any`，违反类型安全最佳实践

本次优化目标：提升地图功能的数据可用性、叙事一致性和代码质量。

---

## 涉及文件

| 文件 | 变更类型 |
|------|----------|
| `hooks/useGame/opening/openingStoryWorkflow.ts` | 修改 — 开局保底地图注入 |
| `hooks/useGame/state/factories.ts` | 可选修改 — 地图预设数据 |
| `hooks/useGame/useTravelAndTrade.ts` | 修改 — 旅行事件注入叙事流 + 自动清理 |
| `components/features/Map/MapModal.tsx` | 修改 — 消除 `any` 类型 |
| `components/features/Map/MobileMapModal.tsx` | 修改 — 消除 `any` 类型 |
| `components/features/MobileDevice/apps/MapApp.tsx` | 可选修改 — emoji 替换 SVG 图标 |
| `components/app/ModalLayer.tsx` | 可选修改 — 打开地图时清理过期事件 |

---

## 技术方案

### 4.1 开局地图保底数据

**问题：** `factories.ts` 初始化 `地图: [], 建筑: []` 为空数组。AI 开局世界演变 prompt 只在"真正有后续导航或长期世界价值的对象"时才创建地图节点，可能导致地图为空。

**方案：** 在开局流程完成后，检查 `世界.地图.length === 0`，若为真则根据 `state.环境`（大地点/中地点/小地点/具体地点）自动生成一条保底地图记录和一条建筑记录，写入 `世界.地图` 和 `世界.建筑`。

**具体操作：**
- 在 `openingStoryWorkflow.ts` 的开局流程末尾增加检查逻辑
- 若地图为空，构造保底数据：
  - 地图名称：取自 `state.环境.大地点`（如"汴京城"）
  - 建筑名称：取自 `state.环境.具体地点`（如"悦来客栈"）
  - 描述：简单占位描述
- 通过 `setters.setWorld` 更新世界状态

### 4.2 旅行事件注入主叙事流

**问题：** `travelWorkflow.ts` 中 `生成旅行事件` 使用硬编码模板（如"街巷间传来阵阵吆喝"），与 AI 叙事割裂。旅行只改变环境信息，没有向故事流注入叙事。

**方案：** 旅行完成后，将旅行事件描述作为系统消息写入 `state.历史记录`，使其成为后续 AI 生成剧情的上下文。

**具体操作：**
- 在 `useTravelAndTrade.ts` 的 `handleTravel` 成功分支中
- 调用 `追加系统消息`（或等价方法）将旅行事件描述写入历史记录
- 格式示例：`[旅行] 你从{出发地}出发，经过{距离}跋涉，抵达了{目的地}。{旅行事件描述}`

### 4.3 消除 MapModal 中的 `any` 类型

**问题：** `MapModal.tsx` 和 `MobileMapModal.tsx` 中约 12 处使用 `(item: any)`、`(building: any)`。

**方案：** 引入 `models/world.ts` 中已定义的 `地图结构` 和 `建筑结构` 类型，替换所有 `any`。

**具体操作：**
- 在两个文件顶部添加类型导入：`import type { 地图结构, 建筑结构 } from '../../../models/world'`
- 逐一替换 `any` 为对应类型（约 6 处 MapModal + 6 处 MobileMapModal）

### 4.4 旅行事件自动清理

**问题：** 旅行事件执行后长期驻留 Zustand store，下次打开地图时仍显示旧事件。

**方案：** 在打开地图 Modal 时检查旅行事件是否已过期（如超过 1 个游戏回合），自动清除。

**具体操作：**
- 在 `ModalLayer.tsx` 中 MapModal 挂载时，或 `useTravelAndTrade.ts` 暴露一个 `clearExpiredTravelEvents` 方法
- 比较旅行事件的时间戳与当前游戏时间
- 若已过期则清空 `travelEvents` 状态

### 4.5 统一手机 MapApp 风格（可选）

**问题：** `MapApp.tsx` 使用 emoji 图标，与项目武侠美术风格不一致。

**方案：** 将 emoji 替换为 SVG 图标，对齐项目 `components/ui/Icons.tsx` 的图标体系。

---

## 实施步骤

- [ ] 步骤 1：实现开局地图保底数据（P0-4.1）
- [ ] 步骤 2：实现旅行事件注入主叙事流（P0-4.2）
- [ ] 步骤 3：消除 MapModal 中的 `any` 类型（P1-4.3）
- [ ] 步骤 4：实现旅行事件自动清理（P1-4.4）
- [ ] 步骤 5：统一手机 MapApp 风格（P2-4.5，可选）

---

## 风险评估

| 风险 | 影响 | 应对 |
|------|------|------|
| 保底地图与 AI 生成的地图重复 | 低 — 保底数据只在地图为空时生成 |
| 旅行事件写入历史记录占用 token | 低 — 旅行事件描述较短，且会被正常的消息滚动清理 |
| 类型替换后可能出现编译错误 | 中 — 需逐一验证 `any` 替换后的类型兼容性 |

## 依赖

无外部依赖。所有变更均在现有代码范围内。
