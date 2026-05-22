# 立绘与动态交互视觉增强方案

> 在保持浏览器优先的前提下，通过打通已有 Galgame 基础设施，实现从纯文字到 Galgame 级视觉交互体验的升级。

## 背景与目标

### 背景

项目已拥有完善的 Galgame 基础设施但处于未打通状态：
- `GalgameView` + `MobileGalgameView` 已完成但未作为默认视图
- `CharacterSprite` 支持表情和位置但表情未动态化
- `SceneBackground` 支持场景背景但仅 8 种渐变降级
- NPC 立绘生图已支持（`NPC图片档案.已选立绘图片ID`）但未在 GalgameView 中使用
- CG 生成器（`galgameCgGenerator.ts`）已完成但未接入故事流程
- `useNpcExpression` 表情推断已完成但未接入 CharacterSprite
- `useAvgStateBridge` AVG 引擎桥接已完成
- 摄影 NSFW 系统、派对场景系统已完成建模但无可视化面板

### 目标

1. **Galgame 级视觉呈现**：立绘 + 场景背景 + 动态表情 + CG 收藏
2. **交互式玩法面板**：桌游/酒令、摄影取景、驾驶出行等场景化交互
3. **场景上下文感知**：AI 自动判断场景内 NPC 位置、表情、动作
4. **保持浏览器优先**：不迁移引擎，在 React 架构内完成

---

## 涉及的文件与模块

### 新建文件

| 文件 | 用途 |
|------|------|
| `hooks/useSceneContext.ts` | 场景上下文引擎：NPC 追踪、环境映射、活动判定 |
| `components/features/Galgame/PartyGamePanel.tsx` | 派对桌游交互面板 |
| `components/features/Galgame/PhotographyPanel.tsx` | 摄影取景框面板 |
| `components/features/Galgame/TravelPanel.tsx` | 驾驶/出行场景面板 |
| `components/features/Galgame/SceneTransition.tsx` | 场景转场动画组件 |
| `hooks/useSceneTransition.ts` | 转场动画状态管理 |
| `prompts/runtime/sceneAwarePrompt.ts` | 场景感知 AI Prompt 注入 |
| `hooks/useGame/scene/sceneCommandParser.ts` | 从 AI 响应解析场景指令 |

### 修改文件

| 文件 | 修改内容 |
|------|----------|
| `components/app/GalgameView.tsx` | 接入立绘、动态表情、多角色布局、交互面板 |
| `components/features/Galgame/CharacterSprite.tsx` | 支持动态表情切换、入场/退场动画 |
| `components/features/Galgame/SceneBackground.tsx` | 扩展场景类型、接入场景图片档案 |
| `components/features/Galgame/GalgameDialogueBox.tsx` | 选项样式增强、与交互面板联动 |
| `components/app/GameView.tsx` | GalgameView 数据注入增强 |
| `hooks/useNpcExpression.ts` | 扩展表情推断逻辑 |
| `hooks/useGame.ts` | 注入场景上下文状态 |
| `services/ai/image/galgameCgGenerator.ts` | 接入自动 CG 解锁流程 |
| `hooks/useGame/sendWorkflow.ts` | 场景感知 Prompt 注入 |
| `models/imageGeneration.ts` | 扩展场景图片档案类型 |

---

## 技术方案

### 架构设计

```
┌─────────────────────────────────────────────────────────────────┐
│                        GameView (容器)                           │
│  ┌──────────┐ ┌───────────────────────────────────┐ ┌────────┐ │
│  │LeftPanel │ │         中央互动区域                 │ │Right   │ │
│  │          │ │  ┌──────────────────────────────┐  │ │Panel   │ │
│  │ 角色属性 │ │  │    SceneBackground (背景层)    │  │ │        │ │
│  │ 状态面板 │ │  │  ┌──────────┐  ┌──────────┐  │  │ │ 功能   │ │
│  │          │ │  │  │Character │  │Character │  │  │ │ 菜单   │ │
│  │          │ │  │  │ Sprite左 │  │ Sprite中 │  │  │ │        │ │
│  │          │ │  │  └──────────┘  └──────────┘  │  │ │        │ │
│  │          │ │  │  ┌─────────────────────────┐ │  │ │        │ │
│  │          │ │  │  │  GalgameDialogueBox      │ │  │ │        │ │
│  │          │ │  │  │  (对话 + 选项 + 操作)     │ │  │ │        │ │
│  │          │ │  │  └─────────────────────────┘ │  │ │        │ │
│  │          │ │  │  ┌─────────────────────────┐ │  │ │        │ │
│  │          │ │  │  │  交互面板 (条件渲染)      │ │  │ │        │ │
│  │          │ │  │  │  PartyGame/Photography/   │ │  │ │        │ │
│  │          │ │  │  │  Travel/NSFW...           │ │  │ │        │ │
│  │          │ │  │  └─────────────────────────┘ │  │ │        │ │
│  │          │ │  └──────────────────────────────┘  │ │        │ │
│  └──────────┘ └───────────────────────────────────┘ └────────┘ │
│                            ▲                                    │
│                            │ 消费                                │
│              ┌─────────────────────────────┐                    │
│              │   useSceneContext (新)       │                    │
│              │   - activeNpcs[]            │                    │
│              │   - backgroundImage         │                    │
│              │   - sceneType               │                    │
│              │   - activityType            │                    │
│              └─────────────────────────────┘                    │
│                            ▲                                    │
│                            │ 读取                                │
│              ┌─────────────────────────────┐                    │
│              │   Zustand Store              │                    │
│              │   - 角色 / 环境 / 社交        │                    │
│              │   - NPC图片档案 / 场景图片档案 │                    │
│              │   - 写真系统 / 派对场景       │                    │
│              └─────────────────────────────┘                    │
└─────────────────────────────────────────────────────────────────┘
```

### 数据流

```
AI 响应 ──→ sceneCommandParser ──→ 场景指令 { npcId, position, expression, action }
                                        │
                                        ▼
                              useSceneContext 更新 activeNpcs
                                        │
                                        ▼
                              GalgameView 重新渲染
                                ├── CharacterSprite (立绘 + 表情 + 位置)
                                ├── SceneBackground (背景切换)
                                ├── GalgameDialogueBox (对话 + 选项)
                                └── 交互面板 (按 activityType 渲染)
```

### 场景类型定义

```typescript
type SceneType =
  | '门派' | '客栈' | '市集' | '秘境' | '山洞' | '村庄' | '城镇' | '荒野'
  | '车内' | '酒吧' | '摄影棚' | '公园' | '办公室' | '校园' | '住宅'
  | '战场' | '温泉' | '寝殿' | '书房' | '花园' | '码头';

type ActivityType =
  | '对话'       // 普通对话场景
  | '派对'       // 聚会/酒令/桌游
  | '摄影'       // 写真拍摄
  | '驾驶'       // 车内出行
  | '亲密'       // NSFW 亲密场景
  | '战斗'       // 战斗场景
  | '探索'       // 探索/冒险
  | '社交'       // 社交互动
  | '独处';      // 个人活动
```

### NPC 场景内位置管理

```typescript
interface NpcScenePresence {
  npcId: string;
  position: 'left' | 'center' | 'right';
  expression: 'normal' | 'happy' | 'angry' | 'sad' | 'surprised';
  imageUrl: string;       // 立绘图片 URL
  isSpeaking: boolean;    // 是否正在说话（呼吸动画）
  action?: string;        // 当前动作描述
}
```

---

## 实施步骤

### 第一阶段：打通现有系统（核心基础设施）

- [ ] 步骤 1：创建 `hooks/useSceneContext.ts`
  - 从 `环境` 推导 `sceneType`（大地点/具体地点映射）
  - 从 `历史记录` 中提取当前在场 NPC 列表（通过发言者和上下文）
  - 从 `社交` + `NPC图片档案` 中获取立绘 URL
  - 接入 `场景图片档案` 作为背景来源
  - 输出 `SceneContextSnapshot`

- [ ] 步骤 2：修改 `CharacterSprite.tsx`
  - 接入 `useNpcExpression` 实现表情动态化
  - 添加入场/退场 CSS 动画（滑入/滑出）
  - 支持 `isSpeaking` 呼吸动画
  - 优化图片懒加载和占位符

- [ ] 步骤 3：扩展 `SceneBackground.tsx`
  - 从 8 种场景类型扩展到 22 种（覆盖所有常见场景）
  - 接入 `场景图片档案.当前壁纸图片ID`
  - 添加场景切换淡入淡出动画
  - 时间感知的色调叠加（晨光/黄昏/夜晚）

- [ ] 步骤 4：修改 `GalgameView.tsx`
  - 接入 `useSceneContext` 获取场景数据
  - 将 `currentSceneCharacters` 替换为场景上下文推导结果
  - 多角色位置布局（左/中/右三槽位）
  - 动态表情传递到 `CharacterSprite`

- [ ] 步骤 5：修改 `GameView.tsx`
  - 向 `GalgameView` 注入新增的 props（环境详情、NPC 图片档案、场景图片档案）
  - 确保 `当前背景图片地址` 优先使用场景图片档案

### 第二阶段：交互性增强（桌游/摄影/出行）

- [ ] 步骤 6：创建 `PartyGamePanel.tsx`
  - 基于 `models/contemporary/partyScenarios.ts` 数据结构
  - 实现酒令/猜拳/行酒令等回合制交互 UI
  - 每轮结果影响好感度（通过已有的好感度系统）
  - 在 GalgameView 中作为 overlay 渲染

- [ ] 步骤 7：创建 `PhotographyPanel.tsx`
  - 基于 `models/photographyNSFW/` 完整状态机
  - 取景框覆盖在场景背景上
  - 构图/尺度/服装/姿势选择器
  - 拍摄结果直接进入 CG 收藏

- [ ] 步骤 8：创建 `TravelPanel.tsx`
  - 车内场景专用背景和布局
  - 驾驶员/副驾驶/后座位置分配
  - 目的地选择和路径事件
  - 行车中的对话触发

- [ ] 步骤 9：修改 `GalgameView.tsx`
  - 根据 `activityType` 条件渲染交互面板
  - 面板与对话系统的协调（面板操作生成对话输入）

### 第三阶段：动态呈现增强

- [ ] 步骤 10：创建 `SceneTransition.tsx` + `hooks/useSceneTransition.ts`
  - 地点切换时的淡入淡出动画
  - NPC 入场/退场滑入/滑出动画
  - 时间流逝色调过渡效果
  - 过渡期间 loading 遮罩

- [ ] 步骤 11：打通 CG 自动解锁流程
  - 修改 `galgameCgGenerator.ts`：生图完成后自动注册 CG 条目
  - 在 `CGGallery` 中展示已解锁 CG
  - 特定剧情节点触发 CG 生成

- [ ] 步骤 12：完善音频系统
  - 增强 `useGalgameAudio`：BGM 切换、环境音效
  - 接入 GalgameView 的场景切换触发音效
  - 静音控制和音量调节

### 第四阶段：AI Prompt 增强

- [ ] 步骤 13：创建 `prompts/runtime/sceneAwarePrompt.ts`
  - 在 AI 请求中注入场景上下文（地点、在场 NPC、活动类型）
  - 引导 AI 输出结构化场景指令

- [ ] 步骤 14：创建 `hooks/useGame/scene/sceneCommandParser.ts`
  - 从 AI 响应中解析场景指令
  - 提取 NPC 位置、表情、动作信息
  - 反馈到 `useSceneContext` 驱动视图更新

- [ ] 步骤 15：修改 `sendWorkflow.ts`
  - 集成场景感知 Prompt
  - 集成场景指令解析
  - 确保场景状态与故事状态同步

### 第五阶段：测试与优化

- [ ] 步骤 16：为 `useSceneContext` 编写单元测试
- [ ] 步骤 17：为 `sceneCommandParser` 编写单元测试
- [ ] 步骤 18：端到端测试 Galgame 视图的完整交互流程
- [ ] 步骤 19：性能优化（图片预加载、渲染优化）
- [ ] 步骤 20：移动端适配（`MobileGalgameView` 同步更新）

---

## 风险评估与依赖

### 风险

| 风险 | 等级 | 应对 |
|------|------|------|
| AI 响应无法稳定输出场景指令 | 中 | 提供降级方案：从对话文本推断场景状态 |
| 立绘图片质量不稳定 | 低 | 已有多种生图后端支持，可切换 |
| 多角色渲染性能问题 | 低 | 限制同屏最多 3 个立绘，使用懒加载 |
| 移动端适配复杂度高 | 中 | 移动端优先保证基础 Galgame 视图，交互面板降级为全屏模态 |

### 依赖

- 已有的 NPC 图片生成管线（`services/ai/image/`）
- 已有的 CG 生成器（`galgameCgGenerator.ts`）
- 已有的 AVG 引擎桥接（`useAvgStateBridge`）
- 已有的表情推断（`useNpcExpression`）
- 已有的摄影 NSFW 系统（`models/photographyNSFW/`）
- 已有的派对场景系统（`models/contemporary/partyScenarios.ts`）
- Zustand Store（`hooks/useGame/subsystems/zustandStore`）

### 工作量估算

| 阶段 | 预估时间 |
|------|---------|
| 第一阶段：打通现有系统 | 1-2 周 |
| 第二阶段：交互性增强 | 2-3 周 |
| 第三阶段：动态呈现增强 | 1-2 周 |
| 第四阶段：AI Prompt 增强 | 1-2 周 |
| 第五阶段：测试与优化 | 1 周 |
| **总计** | **6-10 周** |
