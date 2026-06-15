# yishijie 项目 UI / 玩法 / 展示度 借鉴计划

> 创建：2026-06-15
> 状态：**计划阶段（待用户确认后启动实施）**
> 与 `2026-06-15_yishijie-borrow-plan.md`（基建版 B1-B8）**并列存在**，本计划**不**混入 B1-B8。
> 重点：**游戏性、交互、视觉呈现**，不走基建路线。

---

## 1. 需求重述

本次任务**仅做分析和规划**。目标：把 `yishijie` 项目中**已经验证可玩**的 UI 组件、玩法系统、视觉特效（含 Vue 风格但**可移植到 React**），落地到 `MoRanQianKun` 的 React + TypeScript + Vite 6 + Tailwind 体系里。

**明确不做：**

- ❌ 不引入 Vue 3 / Pinia / Three.js（基建版已声明）
- ❌ 不重写 `App.tsx` / `useGame.ts` 业务核心
- ❌ 不动基建版 B1-B8（错误监控 / env 注入 / 多端构建 / release bundle 等）
- ❌ 不引入 `socket.io-client` / `simplex-noise` / `pinyin-pro`
- ❌ 不做"全量复刻"——只挑选**与本项目主线契合**的玩法/视觉模式
- ❌ 不引入商业化装扮商店、虚拟货币、签到奖励等与本项目价值观冲突的设计

**与基建版 B1-B8 的边界：**

- B1-B8 关心「**工程外围**」（错误、构建、监控、env）
- 本计划关心「**产品体验**」（角色创建、战斗、地图、多媒体、NPC、主题、工坊）
- 实施阶段应**先合入本计划**（UI/玩法），**再合入基建版**，避免在 UI 大改期间同时动构建脚本导致冲突

---

## 2. 项目概览（基于第一手探查）

### 2.1 MoRanQianKun 当前 UI / 玩法 / 展示度盘点

| 维度 | 实际情况（已读取） |
|------|------------------|
| 启动层 | 没有 StartScreen 独立组件；进入游戏走 `useGame.ts` + `App.tsx` 入口；当前由 `components/app/GameView.tsx` + `MobileQuickMenu` 接管主视图 |
| 角色创建 | `components/features/NewGame/NewGameWizard.tsx`（5 步骤：世界观 / 角色基础 / 天赋背景 / 开局配置 / 确认生成），左右侧边栏步骤导航 + 进度条；通过 `useNewGameWizardState.ts` 管理 state |
| 角色详情 | `components/features/Character/CharacterModal.tsx`（标签 image/profile，props 复杂：含 `onGeneratePlayerImage` / `onExtractPlayerAnchor` / `onSavePlayerAnchor` 等），立绘档案以"图片库 + 锚点"双轨；`CharacterProfileCard.tsx` 已用渐变色块呈现气运稀有度 |
| 战斗 | `components/features/Battle/BattleModal.tsx`：单面板 + 卡片网格（敌人数 4 列）+ 资源条（气血/精力/内力）+ `BattleActionPanel` + `RpgBattleIntegration`；**没有"立绘对战"模式**（playerSheet + 战斗动画）；`battle.ts` 模型只定义 `战斗状态结构`（是否战斗中 + 敌方列表），**不含我方数据** |
| 地图 | `components/features/Map/MapModal.tsx`：3 列布局（地图列表 / 详情 / 内部建筑），文字 + 距离等级 + 旅行可行性评估；**没有 2D 网格地图也没有 3D 地图** |
| 多媒体 | `components/features/Galgame/CGGallery.tsx` + `CGGalleryModal.tsx`（CG 画廊）；`Story/StoryModal.tsx`（剧情）；**没有视频画廊**（代码搜索未命中 `video-gallery` 类组件） |
| NPC 交互 | `useNpcExpression.ts` 已实现「情感关键词→表情」推断（5 类：normal/happy/angry/sad/surprised）；`GalgameMode.tsx` 有 `CharacterSprite`；`RelationGraphView.tsx` 关系图 |
| 主题 | `hooks/useEraTheme.ts` 已实现「时代 ID → 主题配置」+ 5 种 UI 装饰效果；`Settings/ThemeSettings.tsx` 支持 era 选择 + theme 网格；`应用时代主题到根元素()` 可实时切换 |
| 工坊 | `components/features/Settings/Api/ApiConfigAssistant.tsx`（API 配置助手）；`Worldbook/WorldbookManagerModal.tsx`（世界书）；`Image/ImageGenSettings.tsx`（生图） |
| 动画 / 转场 | 全项目使用 Tailwind + `animate-fadeIn` / `animate-pulse` 等内置动画；**没有 3D 门 / 蛋糕 / 蛋糕吞噬**等大型 SVG 动画 |

### 2.2 yishijie UI / 玩法 / 展示度盘点（基于实际读取）

| 维度 | 实际做法 |
|------|---------|
| 启动层 | `StartScreen.vue`（原生 HTML + CSS）：背景层（图片 + 渐变 + 3 层光晕 + 30 颗星尘粒子 + 15 个飘浮光点）+ 4 角装饰 + 左上角拖拽**带翅膀的 MAIDEN 头像按钮** + 右上 DLC 入口 + 标题居中 + 左下菜单（新游戏/继续/多人） |
| 角色创建 | 7 步拆组件：`BirthInitialization.vue`（出生设置总览）→ `RaceSelection.vue`（种族）→ `EraSelection.vue`（时代）→ `BirthplaceSelection.vue`（出生地）→ `TalentSelection.vue`（天赋）→ `DifficultySelection.vue`（难度）→ `ExperienceModeSelection.vue`（体验模式） |
| 角色详情 | `PlayerSheet.vue` 760+ 行：**双列布局**（左立绘 + 右上 Rank/Lv/HP-MP + 左下职业 & 经验条 + 右侧属性 5 维水晶 + 武器栏 + 标签页 attributes/skills/inventory/...）；HP/MP 用 5 颗「水晶」按等级点亮（点水晶 = 加属性点） |
| 战斗 | `BattleSystem.vue` 920+ 行：**双方对战式布局**（我方/敌方左右对立）+ 4 个阵位 `standee-unit`（含 SVG 浮空数字） + 回合横幅 + 阶段轨（开始/行动/结算/结束） + 鼠标悬浮 standee 显示 HP/MP/状态 |
| 雷达图 | `AttributeRadar.vue` 350+ 行：纯 SVG，6 维多边形雷达，外发光滤镜 + 魔法阵装饰 + 数据多边形 |
| 地图 | `Map3D.vue`（Three.js 加载 3D 场景）+ `MapCanvas3D.vue`（地图画布）+ `WorldMapModal.vue`（卷轴样式 + 纸张纹理 + 时代演化事件纸张样式）+ `MinimapRenderer.vue`（Canvas 2D 网格地图，**字符图块**：50+ 种字符 → 颜色映射） |
| 多媒体 | `StoryImageGallery.vue`（图片画廊 + 分类 + ZIP 导入/导出 + 人物匹配确认弹窗）+ `StoryVideoGallery.vue`（视频任务卡 + 状态徽章 + 嵌入 `StoryVideoPlayer`） |
| NPC 交互 | `NpcInteractionModal.vue` 800+ 行：Galgame 风格（背景虚化 + 立绘居中 + 底部对话框 + 左侧档案栏 + 日志编辑按钮） |
| 主题 | `ThemeSettings.vue`（字号 12-24 滑块 + 5 种字体 + 自定义字体 URL + 全屏 toggle） |
| 工坊 | `WorkshopPanel.vue` + `DlcEditor.vue` + `DlcLibrary.vue`（DLC 管理 + AI 生成 + AI 评审） |
| 商城 | `CosmeticsShop.vue`（头像框/动态头像/聊天气泡/我的装扮 + 异录点虚拟货币） |
| 启动动画 | `IntroAnimation.vue`（3D 门 + 门缝漏光闪烁 + 门打开光溢出 + 字符逐字动画 + 装饰角）+ `CakeTransition.vue`（SVG 蛋糕 + 4 处 bite 遮罩 + 樱桃/奶油 + 散落糖果点） |
| 浮窗/助手 | `AgentAssistantOverlay.vue`（可拖拽 + 可缩放 + 翅膀装饰圣女助手按钮） |

---

## 3. 对比分析（按 8 个主题）

> **说明：** 每条都标注「**证据**」，引用实际读取的文件 + 行号/片段，避免凭空推论。
> 「未访问」表示未读取。

### 3.1 启动 / 开局面板

| 维度 | yishijie 的做法（证据） | MoRanQianKun 现状 | 可借鉴点 | 优先级 |
|------|-------------------|-----------------|---------|--------|
| 启动屏 | `StartScreen.vue` 行 1-200：原生 DOM（无框架依赖）画背景层（图片 + 3 层光晕 + 30 颗粒子 + 15 飘浮光） | 无 StartScreen；`App.tsx` 入口直接渲染 `GameView` | **借鉴 1**：抽象 `<StartupBackdrop>` 组件（背景图 + 渐变 + 粒子 + 浮光）支持 era 主题色参数化 | P2 |
| MAIDEN 头像按钮 | 行 35-65：可拖拽 + 翅膀动画 + 弹出气泡公告；**不依赖业务**，纯装饰 | 无对应 UI 元素 | **借鉴 2**：`<FloatingWingedButton>` 可拖拽悬浮按钮，作为公告/助手/工坊的统一入口 | P2 |
| DLC 入口徽章 | 行 79-97：右上角带文字 + 装饰条 + 环形图标 | `DlcEditor` 在 `Settings/Api/`，无独立入口 | **借鉴 3**：右栏新增「工坊」入口按钮，可参考其装饰条 + 环形图标样式 | P1 |
| 菜单按钮 | 行 116-200：每个按钮有 btn-bg / btn-frame（4 角装饰）/ btn-content 双语标 | `GameButton.tsx` 已有 primary/secondary/danger 三档 | **借鉴 4**：扩展 `GameButton` 支持 `frame` 槽位，开放 4 角装饰可配置 | P3 |

### 3.2 角色创建流程

| 维度 | yishijie 的做法 | MoRanQianKun 现状 | 可借鉴点 | 优先级 |
|------|----------------|-----------------|---------|--------|
| 步骤编排 | 7 步分组件（`BirthInitialization.vue` 等），**每步独立 .vue**；左右"信息标签"（时代/天赋）可展开 | `NewGameWizard.tsx` 5 步：单文件 + 步骤导航 + `useNewGameWizardState.ts` 状态 | **借鉴 5**：将 `BirthInitialization` 的「左右信息标签侧栏」模式引入，作为 wizard 步骤内的**侧边浮卡** | P2 |
| Header 模式 | 行 12-50：`<div class="header-with-tabs">` + 左 tab 时代/右 tab 天赋，**展开为下拉式抽屉** | 当前无此交互；只有步骤导航 | **借鉴 6**：把左侧时代/右侧天赋这种"侧边抽屉"作为 wizard 步骤内可展开面板 | P2 |
| Era 时代配色预览 | 行 49：`应用时代主题到根元素(eraScheme)`（**NewGameWizard.tsx 行 49-52 实际已经做了**） | 已在做 | **不重复** | — |
| Talent 轮播 | `BirthInitialization.vue` 行 78-94：prev/next 按钮 + 1/N 计数 | 步骤内天赋选择**无轮播** | **借鉴 7**：天赋选择步骤增加轮播模式 + 稀有度高亮 | P2 |

### 3.3 战斗 / 属性展示

| 维度 | yishijie 的做法 | MoRanQianKun 现状 | 可借鉴点 | 优先级 |
|------|----------------|-----------------|---------|--------|
| 战斗布局 | `BattleSystem.vue`：**双方左右对立**（盟友 vs 敌人），中间战区 standee + 回合横幅 + 阶段轨（4 节点高亮）+ 浮空伤害数字 | `BattleModal.tsx` 单列卡片网格（敌人数 4 列），**无我方阵位** | **借鉴 8**：把布局改成「盟友+敌方左右对垒」，新增 `盟友` 数据结构（`BattleSystem` 已示范） | **P0** |
| 属性可视化 | `PlayerSheet.vue` 行 174-191：「水晶 5 颗按等级点亮」**（点击 = 加点）**；5 维属性（str/dex/con/int/wis），每维 5 水晶 = 25 点上限 | `BattleModal.tsx` 行 145-160：资源条 3 段（气血/精力/内力）；**属性点拨点交互缺失** | **借鉴 9**：为 `CharacterModal` 加 `<StatCrystalRow>` 5 颗水晶组件 + 点击加分 | **P0** |
| 雷达图 | `AttributeRadar.vue` 350 行：纯 SVG，6 维多边形 + 渐变填充 + 魔法阵装饰 + 发光滤镜 | 项目内**未访问到雷达图组件**（基于代码搜索） | **借鉴 10**：新建 `<AttributeRadar>` 组件，复用 `models/character.ts` 的 `气运属性类型`（力量/敏捷/体质/根骨/悟性/福源 6 维） | **P0** |
| 立绘对战 | `BattleSystem.vue` 行 117-130：`standee-img` 居中底座 + 浮空 SVG 数字 | **未访问到对应组件** | **借鉴 11**：在 `BattleModal` 中增加 4 阵位 `Standee` 组件，复用 `StoryImageGallery` 的图集 | P1 |
| 浮空伤害数字 | `BattleSystem.vue` 行 119-127：`v-for="floater in combatantFloatingNumbers(member.id)"` + CSS 变量 `--float-index` 控制垂直偏移 | 无浮空数字 | **借鉴 12**：新建 `<DamageFloater>` 组件，CSS 变量驱动上浮 + 渐隐 | P1 |
| 战斗模型 | 含 `selectedTargetId / combatantMotionClass / statusSlots` 等 | `models/battle.ts` 仅 `是否战斗中 + 敌方[]` | **借鉴 13**：扩展 `战斗状态结构` 加 `盟友[] / 当前目标ID / 阶段` | **P0** |

### 3.4 地图 / 位置系统

| 维度 | yishijie 的做法 | MoRanQianKun 现状 | 可借鉴点 | 优先级 |
|------|----------------|-----------------|---------|--------|
| 2D 网格小地图 | `MinimapRenderer.vue` 行 14-100：Canvas 2D，**字符图块 50+ 种**（`"`:草地 / `^`:山 / `~`:深水 / `Z`:宗门大殿 / ...）+ 滚轮缩放 + 拖拽移动 + 纸张纹理 | **未访问到对应组件** | **借鉴 14**：新建 `<TileMinimap>` Canvas 组件，2.5D 平面代替 yishijie 3D（见 6.4） | P1 |
| 3D 地图 | `Map3D.vue` 行 44-100：Three.js + `OrbitControls` + `SCALE_FACTOR=0.01` + 网格辅助 | 无 3D | **不直接借鉴**（基建版 § 3.1 排除 Three.js）→ 改用 2.5D Canvas 见 6.4 | — |
| 地图 Modal | `WorldMapModal.vue` 行 1-100：卷轴样式（左右 `scroll-rod` 卷轴杆 + finial 装饰）+ 纸张纹理 + 角落装饰 | `MapModal.tsx`：3 列布局（列表/详情/建筑），卡片式风格 | **借鉴 15**：把 Modal 改成「卷轴展开」视觉（新组件 `<ScrollMapShell>` 复用包装） | P2 |
| 时代演化事件 | `WorldMapModal.vue` 行 67-94：「纸张样式」专门一种 `paper-bg / paper-fold-shadows / paper-content-wrapper` 容器 | 无 | **借鉴 16**：把世界事件卡片抽出 `<EventPaperCard>` 组件 | P2 |
| 搜索框 | `MapModal.tsx` 行 152-163：左侧搜索 + SVG 放大镜 | 已有 | **不重复** | — |
| 距离/旅行 | 行 240-262：距离等级 + 预计耗时 + 「启程前往」/「无法旅行」禁用态 | `MapModal.tsx` 行 240-260 已有 | **不重复** | — |

### 3.5 多媒体画廊

| 维度 | yishijie 的做法 | MoRanQianKun 现状 | 可借鉴点 | 优先级 |
|------|----------------|-----------------|---------|--------|
| 图片画廊 | `StoryImageGallery.vue` 行 1-100：分类切换 + ZIP 导入/导出 + 人物匹配确认弹窗 + 进度状态 | `Galgame/CGGallery.tsx`（CG 画廊，列表+大图预览），**无 ZIP 导入/导出** | **借鉴 17**：为 `CGGallery` 加 ZIP 批量导入 + 任务进度显示（使用 `useImageAssetPrefetch` 已有基础设施） | P1 |
| 人物匹配 | `StoryImageGallery.vue` 行 59-95：导入 ZIP 后弹「人物形象匹配」确认（缩略图 + 已有/无形象 + checkbox） | 无 | **借鉴 18**：新增 `<CharacterMatchConfirm>` 组件，导入图片后询问是否设为某 NPC 默认形象 | P2 |
| 视频画廊 | `StoryVideoGallery.vue` 行 1-50：视频任务卡 + 状态徽章（pending/succeeded/failed/...）+ 嵌入播放 | **项目内未访问到 video gallery**（基于代码搜索） | **借鉴 19**：新建 `<VideoGalleryModal>`，复用 `imageGeneration` 服务中的任务记录（如果存在） | P3 |
| 视频播放器 | `StoryVideoPlayer.vue`（独立） | 无 | **借鉴 20**：新建 `<InlineVideoPlayer>`（基于 `<video>` + 全屏 toggle） | P3 |
| 状态徽章 | 行 21-30：`<div class="card-status" :class="task.status">` + 不同图标 | `Galgame/CGGallery.tsx` 简单卡片 | **借鉴 21**：统一 `<StatusBadge status="...">` 组件（含 spinner/check/x/exclamation） | P1 |

### 3.6 NPC 交互（对话 / 表情 / 姿态）

| 维度 | yishijie 的做法 | MoRanQianKun 现状 | 可借鉴点 | 优先级 |
|------|----------------|-----------------|---------|--------|
| 交互模态 | `NpcInteractionModal.vue` 行 1-100：Galgame 风（背景虚化 + 立绘居中 + 底部对话框 + 左侧档案栏 + 日志编辑） | `GalgameMode.tsx` 已有类似布局（`GalgameDialogueBox.tsx`） | **借鉴 22**：复用 `useNpcExpression.ts` 的表情推断，作为对话气泡的 `expression` prop | P2 |
| 表情系统 | `useNpcExpression.ts` 已支持 5 类 | 同上 | **不重复** | — |
| 档案栏 | `NpcInteractionModal.vue` 行 53-82：`galgame-internal-archive` 容器 + 等级/好感度等 | 无 | **借鉴 23**：在 `CharacterModal` 增加左侧"角色档案"侧栏（仿 `PlayerSheet` 模式） | P2 |
| 日志编辑 | 行 85-99：「编辑当前消息」按钮 | 无 | **借鉴 24**：在 `ChatList` 或 `Galgame/DialogueBacklog` 加单条消息编辑入口 | P3 |
| 立绘姿态 | `PlayerSheet.vue` `portrait-frame` 4 角装饰 + 点击换图 | `CharacterModal` 的 image tab 已有 | **不重复** | — |

### 3.7 主题 / 动画 / 转场

| 维度 | yishijie 的做法 | MoRanQianKun 现状 | 可借鉴点 | 优先级 |
|------|----------------|-----------------|---------|--------|
| 主题系统 | `ThemeSettings.vue`：字号 12-24 滑块 + 5 种字体 + 自定义字体 URL | `useEraTheme.ts` 已实现时代主题（颜色/字体/装饰）；`ThemeSettings.tsx` 有 era 切换 | **借鉴 25**：扩展 `useEraTheme` 加 `字体大小档` 字段（small/medium/large）应用到正文 | P1 |
| 字体选择 | `ThemeSettings.vue` 行 63-67：黑体/宋体/楷体/中易宋体/custom | 项目内**未访问到主题字号选择器** | **借鉴 26**：复用 `useEraTheme` 的 `typography` 字段加 `adventureFontFamily` 滑块 | P1 |
| 自定义字体 | 行 69-79：custom URL 输入 | 无 | **借鉴 27**：`<CustomFontLoader url>` hook，动态注入 `@font-face` | P2 |
| 启动动画 | `IntroAnimation.vue` 行 1-100：3D 门 + 门缝漏光 + 字符逐字 | 无 | **借鉴 28**：把启动门作为"一次性开场动画"，复用 `useEraTheme` 的 `artStyle` 字段控制门样式 | P3 |
| 转场动画 | `CakeTransition.vue` SVG 蛋糕 + 4 处 bite 遮罩 | 无 | **不借鉴**（过于娱乐化，与本项目武侠/现代/赛博基调冲突） | — |
| CSS 装饰 | `useEraTheme` 行 80+ 已有 5 种装饰（scanline/grain/...） | 已有 | **不重复** | — |

### 3.8 工坊 / 商城 / DLC / 多人

| 维度 | yishijie 的做法 | MoRanQianKun 现状 | 可借鉴点 | 优先级 |
|------|----------------|-----------------|---------|--------|
| DLC 管理 | `DlcLibrary.vue` + `DlcEditor.vue` + `DlcAiGeneratorModal.vue` + `DlcAiReviewModal.vue` | `WorldbookManagerModal.tsx`（世界书） + `ApiConfigAssistant.tsx`（API 助手） | **借鉴 29**：把"世界书 + 提示词池 + 变量集"三件套统一入口为「工坊」侧栏 | P2 |
| AI 生成/评审 | `DlcAiGeneratorModal.vue` + `DlcAiReviewModal.vue` 双 modal | 无专门 AI 评审 UI | **借鉴 30**：新增 `<AiReviewPanel>`（在工坊中作为子页签） | P3 |
| 商城 | `CosmeticsShop.vue`（装扮商店 + 异录点虚拟货币） | 无 | **不借鉴**（与本项目价值观冲突，不引入虚拟货币） | — |
| 多人模式 | `MultiplayerBook.vue` + `MultiplayerHub.vue` + `RoomLobby.vue` | 无 | **不借鉴**（本项目单人游戏为主） | — |
| 故事书图谱 | `StoryBookGraphEditor.vue`（Mermaid 图谱） | `Galgame/RelationGraphView.tsx`（关系图） | **借鉴 31**：用 React Flow 替代 Mermaid（**注意**：当前无 React Flow 依赖，需评估体积） | P3 |
| Agent 助手 | `AgentAssistantOverlay.vue` 200+ 行：可拖拽圣女 + 缩放 phone-shell | 无对应 | **借鉴 32**：把助手抽象为 `<DraggableAssistantPanel>` 组件（可拖 + 可缩 + 关闭后藏角 peek 按钮） | P2 |

---

## 4. 借鉴点优先级矩阵

| # | 借鉴点 | 价值 | 工作量 | 风险 | 优先级 |
|---|--------|------|--------|------|--------|
| U1 | 战斗立绘对战布局（盟友 vs 敌方 standee）+ 阶段轨 | 高（战斗体验质变） | 高（需扩 `战斗状态结构` + 新建 `Standee`） | 中（修改核心模型） | **P0** |
| U2 | 5 维水晶属性点拨（点击水晶 = 加点） | 高（解决当前「无属性点交互」） | 中（新建 `<StatCrystalRow>`） | 低 | **P0** |
| U3 | 6 维属性雷达图（SVG） | 高（玩家能一眼看成长） | 中（纯展示组件，零状态风险） | 低 | **P0** |
| U4 | 战斗模型扩展（盟友[] / 目标 ID / 阶段 / 浮空数字） | 高（U1/U2 依赖） | 中（扩 `models/battle.ts` + 持久化迁移） | 中（存档兼容） | **P0** |
| U5 | 状态徽章统一组件 `<StatusBadge>` | 中（多个组件复用） | 低 | 低 | **P1** |
| U6 | 启动屏粒子/光晕装饰 `<StartupBackdrop>` | 中（首屏观感） | 中（CSS 动画） | 低 | P2 |
| U7 | 拖拽悬浮按钮 `<FloatingWingedButton>` | 中 | 低 | 低 | P2 |
| U8 | 工坊侧栏入口按钮 | 中 | 低 | 低 | P1 |
| U9 | 卷轴样式地图 Modal `<ScrollMapShell>` | 中（地图体验提升） | 中（CSS 装饰） | 低 | P2 |
| U10 | 时代演化事件纸张卡片 `<EventPaperCard>` | 中 | 低 | 低 | P2 |
| U11 | 2.5D 网格小地图 `<TileMinimap>` | 高（地图可视化） | 高（Canvas 2D + 50+ 图块） | 中（性能） | P1 |
| U12 | NPC 交互档案栏 + 表情 prop | 中 | 低 | 低 | P2 |
| U13 | 字体大小/自定义字体（U1 useEraTheme 扩展） | 中（无障碍） | 中（@font-face 注入） | 低 | P1 |
| U14 | 拖拽助手 `<DraggableAssistantPanel>` | 中 | 中 | 低 | P2 |
| U15 | CG 画廊 ZIP 导入 + 人物匹配 | 中 | 中 | 中（需要 ZIP 库） | P1 |
| U16 | 视频画廊 `<VideoGalleryModal>` | 低 | 中 | 高（无视频服务） | P3 |
| U17 | 启动门动画（IntroAnimation） | 低 | 中 | 低 | P3 |
| U18 | 蛋糕转场（CakeTransition） | — | — | — | **不借鉴** |
| U19 | 商城（CosmeticsShop） | — | — | — | **不借鉴** |
| U20 | 多人模式（MultiplayerBook/Hub） | — | — | — | **不借鉴** |
| U21 | 工坊统一入口（世界书+提示词+变量） | 中 | 中 | 低 | P2 |
| U22 | AI 评审面板 `<AiReviewPanel>` | 低 | 中 | 中（需要 LLM 调用） | P3 |

---

## 5. 涉及的文件与模块

### 5.1 需要参考的 yishijie 文件路径

> 仅作"模式参考"，**不复制 Vue 特定代码**。

- `/home/fz/project/yishijie/src/components/StartScreen.vue`（启动屏布局 + 粒子装饰）
- `/home/fz/project/yishijie/src/components/PlayerSheet.vue`（5 维水晶拨点 + 双列布局 + 4 角装饰）
- `/home/fz/project/yishijie/src/components/BattleSystem.vue`（盟友 vs 敌方 + standee + 阶段轨 + 浮空数字）
- `/home/fz/project/yishijie/src/components/AttributeRadar.vue`（SVG 雷达 + 渐变 + 魔法阵装饰）
- `/home/fz/project/yishijie/src/components/MinimapRenderer.vue`（Canvas 2D 字符图块，**只取数据结构，渲染用 2.5D**）
- `/home/fz/project/yishijie/src/components/WorldMapModal.vue`（卷轴 + 纸张纹理 + 演化事件）
- `/home/fz/project/yishijie/src/components/StoryImageGallery.vue`（人物匹配确认 + ZIP 导入）
- `/home/fz/project/yishijie/src/components/StoryVideoGallery.vue`（状态徽章模式）
- `/home/fz/project/yishijie/src/components/NpcInteractionModal.vue`（左侧档案 + 表情 prop）
- `/home/fz/project/yishijie/src/components/ThemeSettings.vue`（字号滑块 + 字体选择 + 自定义 URL）
- `/home/fz/project/yishijie/src/components/AgentAssistantOverlay.vue`（可拖拽 + 可缩 phone-shell + peek 角标）
- `/home/fz/project/yishijie/src/components/PortraitUpload.vue`（4 角装饰 + 拖拽上传）

### 5.2 需要新建 / 修改的 MoRanQianKun 文件

**新建组件（`components/ui/`）：**

| 路径 | 用途 |
|------|------|
| `components/ui/StatusBadge.tsx` | 统一状态徽章（spinner/check/x/exclamation/pending/succeeded/failed） |
| `components/ui/StatCrystalRow.tsx` | 5 颗水晶拨点属性条（点击加分，键盘可访问） |
| `components/ui/AttributeRadar.tsx` | 6 维 SVG 雷达（力量/敏捷/体质/根骨/悟性/福源） |
| `components/ui/StartupBackdrop.tsx` | 启动屏背景（图片 + 渐变 + 粒子 + 浮光） |
| `components/ui/FloatingWingedButton.tsx` | 可拖拽悬浮按钮（公告/助手/工坊通用） |
| `components/ui/DraggableAssistantPanel.tsx` | 可拖 + 可缩 phone-shell + peek 角标 |
| `components/ui/ScrollMapShell.tsx` | 卷轴样式包装（左右卷轴杆 + 纸张纹理） |
| `components/ui/EventPaperCard.tsx` | 时代演化事件纸张卡片 |
| `components/ui/DamageFloater.tsx` | 浮空伤害数字（CSS 变量驱动） |
| `components/ui/TileMinimap.tsx` | 2.5D Canvas 小地图（详见 6.4） |
| `components/ui/CharacterMatchConfirm.tsx` | ZIP 导入后人物匹配确认 |
| `components/ui/InlineVideoPlayer.tsx` | 视频播放（`<video>` 包装） |

**新建 / 改业务组件：**

| 路径 | 变更 |
|------|------|
| `components/features/Battle/BattleModal.tsx` | 重构为「盟友 vs 敌方」左右布局 + standee + 阶段轨 + 浮空数字 |
| `components/features/Battle/Standee.tsx` | **新建** 单阵位立绘组件 |
| `components/features/Character/CharacterModal.tsx` | 加 `<StatCrystalRow>` 属性水晶条 + `<AttributeRadar>` 雷达图 + 左侧档案栏 |
| `components/features/Character/CharacterProfileCard.tsx` | 嵌入 `<AttributeRadar>` |
| `components/features/NewGame/NewGameWizard.tsx` | 加 `<EventPaperCard>`-式侧栏（时代/天赋可展开抽屉） |
| `components/features/Map/MapModal.tsx` | 用 `<ScrollMapShell>` 替换外层包装 + `<TileMinimap>` 替换文字图 |
| `components/features/Galgame/CGGallery.tsx` | 加 ZIP 导入（用 `jszip`，基建版 B5 已装） + `<CharacterMatchConfirm>` |
| `components/features/Settings/ThemeSettings.tsx` | 加字号滑块（12-24px）+ 字体下拉 + 自定义字体 URL |
| `components/features/World/WorldModal.tsx` | 嵌入 `<EventPaperCard>` |

**新建 / 改模型：**

| 路径 | 变更 |
|------|------|
| `models/battle.ts` | 加 `盟友[] / 当前目标ID / 当前阶段 / 浮空数字[]`（**不破坏现有字段**，全 optional） |
| `models/era-config.ts`（或 `eraAssets.ts`） | 加 `adventureFontSize / adventureFontFamily` 字段（optional） |
| `types.ts`（如适用） | 加 `主角属性点` 可用数（`availableAttributePoints`） |

**新建 / 改 Hook：**

| 路径 | 变更 |
|------|------|
| `hooks/useNpcExpression.ts` | **已有**，无需改；U12 直接复用 |
| `hooks/useEraTheme.ts` | 加 `adventureFontSize / adventureFontFamily` 解析 |
| `hooks/useCustomFont.ts` | **新建** 动态注入 `@font-face` |

**新建测试：**

| 路径 | 用途 |
|------|------|
| `components/ui/StatCrystalRow.test.tsx` | 5 颗水晶状态切换 + 点击回调 |
| `components/ui/AttributeRadar.test.tsx` | SVG 渲染快照 + 数据驱动 |
| `components/ui/StatusBadge.test.tsx` | 状态 → 图标映射 |
| `hooks/useCustomFont.test.ts` | @font-face 注入 + 清理 |
| `models/battle.test.ts` | 新字段 optional 兼容性 |

**新建 / 改文档：**

| 路径 | 用途 |
|------|------|
| `docs/technical/18-battle-redesign.md` | 战斗系统重构（盟友 vs 敌方 + 阶段轨） |
| `docs/technical/19-attribute-radar.md` | 6 维属性雷达图组件 |
| `docs/technical/20-2.5d-minimap.md` | 2.5D Canvas 地图 |
| `docs/technical/21-stat-crystal.md` | 5 维水晶拨点 |
| `docs/user-manual/05-character-sheet.md` | 角色档案使用说明（含雷达图） |
| `docs/user-manual/06-battle-screen.md` | 新战斗界面说明 |

---

## 6. 技术方案

### 6.1 U1+U4 战斗重构（核心）

**目标：** 把 `BattleModal` 从「单列卡片网格」改成「盟友 vs 敌方左右对垒 + 阶段轨 + 浮空数字」。

**模型扩展（**不破坏现有**）：**

```ts
// models/battle.ts（追加，全部 optional）
export type 战斗阶段 = '开始' | '行动' | '结算' | '结束';

export interface 战斗盟友信息 {
  名字: string;
  境界: string;
  当前血量: number;
  最大血量: number;
  当前精力: number;
  最大精力: number;
  当前内力?: number;
  最大内力?: number;
  立绘URL?: string;
  状态?: string[];  // 简易版（yishijie 有 statusSlots）
  失能?: boolean;
}

export interface 浮空数字 {
  id: string;
  文本: string;
  类型: '伤害' | '治疗' | '暴击' | '闪避';
  时间戳: number;
}

export interface 战斗状态结构 {
  是否战斗中: boolean;
  敌方: 战斗敌方信息[];
  盟友?: 战斗盟友信息[];                  // 新增
  当前目标ID?: string;                    // 新增
  当前阶段?: 战斗阶段;                    // 新增
  当前回合?: number;                      // 新增
  浮空数字队列?: 浮空数字[];              // 新增
}
```

**组件 API：**

```tsx
// components/features/Battle/Standee.tsx
interface StandeeProps {
  名字: string;
  立绘URL?: string;
  血量: { 当前: number; 上限: number };
  精力: { 当前: number; 上限: number };
  内力?: { 当前: number; 上限: number };
  状态?: string[];
  失能?: boolean;
  选中?: boolean;
  朝向: '左' | '右';     // 盟友朝右，敌方朝左
  onClick?: () => void;
  浮空数字?: 浮空数字[]; // 渲染 SVG 浮空
}
```

**布局草案（Tailwind）：**

```tsx
<div className="grid grid-cols-[1fr_1.5fr_1fr] gap-4 h-full">
  {/* 左：盟友阵位 */}
  <div className="flex flex-col gap-3 justify-center">
    {盟友.map(m => <Standee 朝向="右" {...m} />)}
  </div>

  {/* 中：战区 */}
  <div className="flex flex-col items-center justify-center relative">
    <PhaseTrack 当前={当前阶段} />  {/* 4 节点 */}
    <div className="text-xs text-wuxia-gold/60 mt-2">回合 {当前回合}</div>
  </div>

  {/* 右：敌方阵位 */}
  <div className="flex flex-col gap-3 justify-center">
    {敌方.map(m => <Standee 朝向="左" {...m} />)}
  </div>
</div>
```

**测试方案：**
- `BattleModal.test.tsx`：单测 1 个盟友 + 1 个敌方，断言 standee 渲染 + 阶段轨高亮
- `models/battle.test.ts`：断言新字段 optional 兼容性（旧数据不报错）

**风险与缓解：**
- 风险：旧存档没有 `盟友` 字段，UI 看到空数组时直接渲染单方（兼容）
- 风险：`RpgBattleIntegration` 与新布局冲突，**保留分支**（`shouldUseRpgBattle` 仍走原布局）

---

### 6.2 U2 5 维水晶拨点

**目标：** 在 `CharacterModal` 的属性标签页加 5 维水晶组件，点击 = 加点。

**组件 API：**

```tsx
// components/ui/StatCrystalRow.tsx
export type 属性档 = '力量' | '敏捷' | '体质' | '根骨' | '悟性' | '福源';

interface StatCrystalRowProps {
  属性: 属性档;
  当前等级: number;       // 0-5
  数值: number;            // 实际数值
  颜色?: string;           // 默认 wuxia-gold
  可用属性点: number;
  onAllocate?: (属性: 属性档) => void;
  onDeallocate?: (属性: 属性档) => void;
}

// 5 颗水晶按"已点亮数"渲染 fill，右键 / 长按可减点
// 键盘可访问：Tab 进入、Space 触发、方向键调整
```

**Tailwind + CSS 变量（仿 PlayerSheet）：**

```tsx
<button
  className="crystal"
  data-filled={filled ? '1' : '0'}
  style={{ '--c-color': 颜色 || 'var(--wuxia-gold)' }}
  disabled={!可用属性点}
/>

// CSS（Tailwind plugin 或 styles/globals.css）
.crystal {
  width: 1rem;
  height: 1rem;
  background: rgba(255,255,255,0.08);
  border: 1px solid var(--c-color);
  border-radius: 0.25rem;
  transition: all 200ms;
}
.crystal[data-filled="1"] {
  background: var(--c-color);
  box-shadow: 0 0 8px var(--c-color);
}
.crystal:not(:disabled):hover {
  transform: scale(1.15);
  filter: brightness(1.3);
}
```

**测试方案：**
- 单测：5 颗水晶按 `当前等级` 渲染 fill 状态
- 单测：点击触发 `onAllocate`，无可用点时按钮 `disabled`
- 单测：键盘 Space 触发

---

### 6.3 U3 6 维属性雷达

**目标：** 复用 `models/character.ts` 的 `气运属性类型`（6 维），新建纯展示组件。

**组件 API：**

```tsx
// components/ui/AttributeRadar.tsx
interface AttributeRadarProps {
  数据: Record<'力量' | '敏捷' | '体质' | '根骨' | '悟性' | '福源', number>;
  最大值?: number;            // 默认 100
  尺寸?: number;              // 默认 320
  主题?: '亮' | '暗';         // 跟 useEraTheme 同步
  标题?: string;              // 默认「属性雷达」
  动画?: boolean;             // 默认 true，进入时从 0 渐变到目标
}
```

**实现要点（参考 `AttributeRadar.vue` 行 22-47）：**
- 纯 SVG，`viewBox="0 0 ${size} ${size}"`，不依赖外部库
- 用 `radialGradient` 做中心渐变
- 用 `filter` + `feGaussianBlur` 做外发光
- 6 轴多边形通过 `getAxisEndX/Y(index) = center + radius * cos/sin(index * 60°)` 计算
- 动画用 `requestAnimationFrame` 插值（避免 framer-motion 体积成本）

**与 useEraTheme 整合：**
- 主色取 `theme.colors.primary`（如 `#c9a962`）
- 暗主题用 `theme.colors['ink-black']` 做背景

**测试方案：**
- 快照测试：默认数据下 SVG 节点数 + 路径匹配
- 边界测试：所有值 = 0 / 所有值 = 最大值（多边形应塌缩为圆 / 撑满外环）
- 主题测试：暗主题下主色为指定色

---

### 6.4 U11 2.5D 网格小地图

**目标：** 仿 yishijie `MinimapRenderer.vue` 的 50+ 字符图块，但**不引入 Three.js**，用 2.5D 平面（顶视角 30° 倾斜的 Canvas 2D）。

**数据结构：**

```ts
// models/world.ts（追加）
export interface 网格图块 {
  字符: string;          // "草地" / "山" / "水" / "建筑A" / ...
  高度: number;          // 0-1，用于 2.5D 高度（山=1，草地=0.1）
  可通过: boolean;
}

export interface 网格地图 {
  宽度: number;          // 字符列数
  高度: number;          // 字符行数
  字符网格: string;      // 多行字符串（与 yishijie 同结构）
  玩家位置: { x: number; y: number };
  事件位置: Array<{ x: number; y: number; 类型: string; 标签: string }>;
}
```

**实现要点：**
- 不用字符渲染（那样是 ASCII 风），改成**图块 id → 颜色/纹理映射表**（与 yishijie 的 `TILE_PALETTE` 同结构但更精简）
- Canvas 2D 绘制：`ctx.save() / ctx.translate(中心) / ctx.scale(zoom) / ctx.rotate(0.4rad)` 实现 30° 倾斜
- 每帧只重绘可见瓦片（瓦片缓存）
- 性能目标：30 fps @ 50×50 网格

**与现有 `MapModal` 整合：**
- 把 `MapModal.tsx` 中「中间列地图详情」的文字图部分用 `<TileMinimap>` 替换
- 数据从 `世界数据结构.地图[]` 派生（`地图结构.描述` 含坐标字符串 → 解析为 `网格地图`）

**测试方案：**
- `TileMinimap.test.tsx`：快照（10×10 网格 + 玩家位置 + 1 个事件）
- 性能测试：50×50 网格 + 100 个事件，单帧渲染 < 16ms（vitest bench）

**风险与缓解：**
- 风险：Canvas 渲染需要 ref + `useEffect`，SSR 不渲染 → 使用 `dynamic import` 仅在客户端
- 风险：颜色映射表初期只覆盖 15-20 种核心图块（`" / . / * / ^ / ~ / F / W / # / + / = / Z / Y / E / a / j / P`），其他图块用 `未知地形` 灰兜底

---

### 6.5 U12 NPC 表情 prop

**复用现有 `useNpcExpression`，不重写：**

```tsx
// components/features/Chat/MessageRenderers.tsx（改 1 行）
import { inferExpressionFromText } from '../../../hooks/useNpcExpression';

// 在 CharacterBubble 组件内
const 表情 = useMemo(() => inferExpressionFromText(message.text), [message.text]);

return <CharacterBubble {...message} expression={表情} />;
```

**修改点：**
- `Galgame/CharacterSprite.tsx` 增加 `expression?: ExpressionType` prop（已有则不重复）
- `GalgameMode.tsx` 把对话消息的 `speaker + text` 喂给 `inferExpressionFromText` 后传给 `CharacterSprite`

**测试方案：**
- `useNpcExpression.test.ts`：断言「微笑」「愤怒」「沉默」分别映射到 `happy/angry/sad`
- 集成测试：`GalgameMode.test.tsx`：mock 对话，断言 sprite 收到 `expression="happy"`

---

### 6.6 U13 字号 / 自定义字体

**Hook 设计：**

```ts
// hooks/useCustomFont.ts
export function useCustomFont(url: string | null, family: string | null): void {
  useEffect(() => {
    if (!url || !family) return;
    const id = `font-${family}-${hash(url)}`;
    if (document.getElementById(id)) return;  // 防重复
    const style = document.createElement('style');
    style.id = id;
    style.textContent = `
      @font-face {
        font-family: '${family}';
        src: url('${url}') format('woff2');
        font-display: swap;
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, [url, family]);
}
```

**与 useEraTheme 整合：**

```ts
// hooks/useEraTheme.ts 追加
return {
  ...,
  字号: theme.typography.字号档 || 16,  // 12-24 滑块
  字体族: theme.typography.字体族 || 'serif',
};
```

**UI 整合（`Settings/ThemeSettings.tsx` 追加 2 个 input）：**

```tsx
<input
  type="range" min={12} max={24} step={1}
  value={字号} onChange={e => onUpdate({ typography: { 字号档: +e.target.value } })}
/>

<select value={字体族} onChange={...}>
  <option value="'Microsoft YaHei'">黑体</option>
  <option value="'Noto Serif SC'">宋体</option>
  <option value="'KaiTi'">楷体</option>
  <option value="custom">自定义...</option>
</select>
```

**应用点（CSS 变量）：**

```ts
// 在根元素设置
document.documentElement.style.setProperty('--mrqk-字号', `${字号}px`);
document.documentElement.style.setProperty('--mrqk-字体', 字体族);
```

```css
/* styles/globals.css */
.chat-message, .novel-text {
  font-family: var(--mrqk-字体, 'serif');
  font-size: var(--mrqk-字号, 16px);
}
```

**测试方案：**
- `useCustomFont.test.ts`：模拟 DOM，断言 `<style>` 注入 + 卸载清理
- 集成测试：传入 URL → 根元素有 `--mrqk-字体` 变量

---

### 6.7 与现有 Tailwind 样式系统整合

**约定：**
- 全部新组件用 Tailwind utility class（不引入新 CSS 文件，除非有 `keyframes` 必要）
- 主题色用 `text-wuxia-gold` / `border-wuxia-gold/40` / `bg-wuxia-gold/10`（**不**新增 `wuxia-*` token）
- 装饰效果（4 角 / 卷轴 / 纸张）用现有 `border` + `bg-black/40` + `mix-blend-overlay` + 伪元素实现
- 动画用 Tailwind 内置 `animate-*`（`fadeIn/pulse/bounce`） + 必要时 `<style>` keyframes 注入

**与 `styles/themes.ts` 的关系：**
- `应用时代主题到根元素(eraScheme)` 已存在，新组件**不**重复注入
- 新组件只读 `useEraTheme()`，不写全局 CSS 变量

**视觉一致性：**
- 所有 P0 组件都接受 `className` prop（用于外部覆盖）
- 字号 / 字体走 `--mrqk-字号` / `--mrqk-字体` 变量（U13）
- 颜色取自 `useEraTheme().colors`（不写死）

---

## 7. 实施步骤（可独立验证的里程碑）

### 阶段 1：战斗与角色核心（高优先级 / 4-5 天）

- [ ] **M1** 创建本计划文档（已完成）
- [ ] **M2** 扩展 `models/battle.ts`（盟友/目标/阶段/浮空数字，全部 optional）+ 迁移单测
- [ ] **M3** 新建 `components/ui/StatusBadge.tsx` + 单测
- [ ] **M4** 新建 `components/ui/StatCrystalRow.tsx` + 单测
- [ ] **M5** 新建 `components/ui/AttributeRadar.tsx` + 单测
- [ ] **M6** 新建 `components/features/Battle/Standee.tsx` + 单测
- [ ] **M7** 重构 `BattleModal.tsx` 改「盟友 vs 敌方」布局（保留 `shouldUseRpgBattle` 分支）
- [ ] **M8** `CharacterModal` 加 `<StatCrystalRow>` + `<AttributeRadar>`
- [ ] **M9** `CharacterProfileCard` 嵌入 `<AttributeRadar>`
- [ ] **验证：** `npm run test:unit` 全绿；`npm run build` 成功；手工进战斗 + 加点交互
- **工时估算：** 4.5 工作日

### 阶段 2：地图 / 主题 / NPC（中优先级 / 4 天）

- [ ] **M10** 扩展 `hooks/useEraTheme.ts` 加 `字号档 / 字体族`
- [ ] **M11** 新建 `hooks/useCustomFont.ts` + 单测
- [ ] **M12** `Settings/ThemeSettings.tsx` 加字号滑块 + 字体下拉 + 自定义 URL 输入
- [ ] **M13** 新建 `components/ui/ScrollMapShell.tsx`
- [ ] **M14** 新建 `components/ui/EventPaperCard.tsx`
- [ ] **M15** `MapModal.tsx` 用 `<ScrollMapShell>` 包装 + 嵌入 `<EventPaperCard>`
- [ ] **M16** 新建 `components/ui/TileMinimap.tsx`（2.5D Canvas）+ 单测
- [ ] **M17** `MapModal.tsx` 中间列文字图替换为 `<TileMinimap>`
- [ ] **M18** NPC 表情 prop 接入（`GalgameMode` + `CharacterSprite`）
- [ ] **验证：** 进地图看到卷轴样式 + 网格小地图；切时代字号/字体实时变化
- **工时估算：** 4 工作日

### 阶段 3：扩展功能（中低优先级 / 3 天）

- [ ] **M19** 新建 `components/ui/StartupBackdrop.tsx` + 启动屏改造
- [ ] **M20** 新建 `components/ui/FloatingWingedButton.tsx`
- [ ] **M21** 新建 `components/ui/DraggableAssistantPanel.tsx`
- [ ] **M22** 新建 `components/ui/CharacterMatchConfirm.tsx`
- [ ] **M23** `Galgame/CGGallery.tsx` 加 ZIP 导入（用基建版 B5 装的 `jszip`）
- [ ] **M24** 新建 `components/ui/DamageFloater.tsx` + 在 `BattleModal` 中接入
- [ ] **M25** 启动门动画（IntroAnimation）—— 复用 `useEraTheme.artStyle`
- [ ] **验证：** 启动屏有粒子/光晕；CG 画廊可 ZIP 导入并匹配人物
- **工时估算：** 3 工作日

### 阶段 4：验证与归档（1-2 天）

- [ ] **M26** 全量跑测试 + lint + build + type-check
- [ ] **M27** 归档：删除本计划文档（按 `feedback_document-organization.md` 规则），把内容并入：
  - `docs/technical/18-battle-redesign.md`
  - `docs/technical/19-attribute-radar.md`
  - `docs/technical/20-2.5d-minimap.md`
  - `docs/technical/21-stat-crystal.md`
  - `docs/user-manual/05-character-sheet.md`
  - `docs/user-manual/06-battle-screen.md`
- [ ] **M28** 跑 `code-reviewer` agent + 修复 CRITICAL/HIGH
- [ ] **M29** 按 `feature-branch-workflow.md` 建 `feat/battle-redesign` 等分支 + PR
- [ ] **工时估算：** 1.5 工作日

**总工时估算：** 13 工作日（约 2.5 周）

---

## 8. 风险评估

| 风险 | 级别 | 缓解策略 |
|------|------|----------|
| U1 战斗模型扩展破坏旧存档 | 中 | 全 optional 字段 + `migrations` 兜底：读旧数据时 `盟友 ??= []` / `当前阶段 ??= '开始'` |
| U1 `RpgBattleIntegration` 与新布局冲突 | 中 | 保留 `shouldUseRpgBattle` 分支，RPG 模式仍走原布局 |
| U3 雷达图 SVG 在 Safari 性能 | 低 | 用 `viewBox` 不缩放，CSS transform 缩放交给外层 |
| U4 浮空数字 GPU 合成 | 低 | 限制队列长度（最多 20 个）+ 1.5s 后自动移除 |
| U11 Canvas 2.5D 性能 | 中 | 瓦片缓存 + 只重绘可见区域 + 60fps 降级到 30fps |
| U13 字体 URL CORS / 防盗链 | 中 | 加 `crossorigin="anonymous"` + 失败时 fallback serif |
| U18 启动门动画在 prefers-reduced-motion 下闪烁 | 低 | 检测媒体查询后跳过门动画直接进入 |
| U23 ZIP 库体积 | 低 | 基建版 B5 已装 `jszip`，复用 |
| U24 视频服务缺失 | 高 | 暂不实施（标 P3），等 imageGeneration 视频服务上线后再做 |
| 阶段 1 + 基建版 B1-B8 同期合入冲突 | 中 | 顺序约束：**先合入本计划**，再合入基建版 PR |

---

## 9. 不需要借鉴的内容

**明确不借鉴 yishijie 的以下内容：**

1. ❌ **3D 地图（Map3D.vue）** — Three.js 与基建版 § 3.1 排除，**改用 2.5D Canvas** 替代（U11）
2. ❌ **蛋糕转场（CakeTransition.vue）** — 过于娱乐化，与本项目武侠/现代/赛博基调冲突
3. ❌ **装扮商城（CosmeticsShop.vue）** — 引入虚拟货币（异录点）与本项目价值观冲突
4. ❌ **多人模式（MultiplayerBook/Hub/Lobby）** — 本项目以单人游戏为主
5. ❌ **Mermaid 图谱（StoryBookGraphEditor.vue）** — 引入 Mermaid 库体积大，**改用 React Flow**（待评估，U 不直接借鉴）
6. ❌ **多文件分散的 7 步角色创建** — 当前 5 步已足够，**只借鉴侧栏抽屉**（U6）不分 7 个 .vue
7. ❌ **Vue 3 Composition API 写法** — 仅参考布局 / 装饰 / 数据结构模式，**不**复制 `<script setup>` 到 React
8. ❌ **Vue 指令 `v-for / v-if` 转场动画** — 改用 React `framer-motion` 或 CSS transition（如有需要，体积允许用 framer-motion）
9. ❌ **`# 'runes'` / 拖拽圣女助手** — 直接照搬不可取，**只借鉴"可拖悬浮按钮"模式**（U7 + U21），不抄 wings 翅膀装饰
10. ❌ **yishijie 的 `bdsm` / `nsfw` 玩法系统** — 与本项目模型不冲突的部分已通过 `npcNSFWEnhancement` 自有方案实现

---

## 10. 与基建版计划的关系

### 10.1 协作执行顺序

```
Week 1:
  - 完成本计划 M2-M9（阶段 1 战斗 + 角色核心）
  - 同步开基建版 M2-M5（错误监控 + env + base path）

Week 2:
  - 完成本计划 M10-M18（阶段 2 地图 + 主题 + NPC）
  - 完成基建版 M6-M10（dbService 迁移 + release-bundle）

Week 3:
  - 完成本计划 M19-M25（阶段 3 扩展）
  - 完成基建版 M11-M13（资源错误捕获 + debug logger 接入）

PR 顺序：
  1. 先合入本计划（PR #1: feat/battle-redesign + feat/attribute-radar）
  2. 再合入基建版（PR #2: feat/browser-error-monitor + feat/release-bundle）
  3. 最后合入本计划阶段 3（PR #3: feat/minimap + feat/cg-zip-import）
```

### 10.2 共享依赖

- **`jszip` 依赖**：基建版 B5 已装 `jszip`，本计划 M23 ZIP 导入直接复用
- **Tailwind 主题变量**：基建版不动 `styles/themes.ts`，本计划 M11 扩展 `useEraTheme` 字段
- **IndexedDB 模型迁移**：基建版 B4 dbService schema 迁移门，本计划 M2 战斗模型扩展可一并走迁移

### 10.3 与项目级规则的关系

- **feature-development.md**：本计划按 plan → 实施 → 归档流程走
- **feedback_document-organization.md**：M27 删除本计划文档，内容并入 `docs/technical/` 和 `docs/user-manual/`
- **feature-branch-workflow.md**：M29 按规范建 `feat/*` 分支 + PR
- **testing.md**：每个新组件强制带单测，coverage 不回退（`StatCrystalRow` / `AttributeRadar` / `StatusBadge` / `Standee` / `TileMinimap` / `useCustomFont`）
- **coding-style.md**：所有新组件保持纯展示 + props 显式 + 不可变数据

---

## 11. 等待确认（WAITING FOR CONFIRMATION）

请用户回复以下任一：

- **proceed** — 全量按本计划执行（建议先实施 M2-M9，再视效果决定是否继续 M10-M25）
- **proceed-p0-only** — 只实施 P0 项（U1+U2+U3+U4 战斗+水晶+雷达），其他等下一轮
- **modify** — 列出要调整的内容（例如「不要 U11 小地图」、「U6 改为全屏侧栏而非抽屉」）
- **cancel** — 终止本次 UI/玩法借鉴计划

> 按用户全局规则，本次任务**仅做规划**。所有代码层面的实施应在用户确认后启动。
> 基建版 B1-B8 已在 `2026-06-15_yishijie-borrow-plan.md` 等待确认，**本计划与之独立**，可单独决策。
