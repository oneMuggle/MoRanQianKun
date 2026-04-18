# 项目目录结构

```
MoRanJiangHu/
├── App.tsx                    # 应用入口 (~1600行)
├── index.tsx                  # React 挂载点
├── types.ts                  # 全局类型定义
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.cjs
├── postcss.config.cjs
│
├── components/              # UI 组件 (22 功能模块)
│   ├── features/           # 功能模块
│   │   ├── Agreement/      # 约定系统
│   │   ├── Auth/           # 认证 (GitHub 同步)
│   │   ├── Battle/        # 战斗
│   │   ├── Character/     # 角色
│   │   ├── Chat/          # 聊天 (InputArea, ChatList)
│   │   ├── Equipment/     # 装备
│   │   ├── Inventory/    # 背包
│   │   ├── Kungfu/       # 功法
│   │   ├── Map/          # 地图
│   │   ├── Memory/       # 记忆
│   │   ├── Music/        # 音乐
│   │   ├── NewGame/      # 新游戏向导
│   │   ├── NovelDecomposition/  # 小说分解
│   │   ├── SaveLoad/     # 存档
│   │   ├── Sect/         # 门派
│   │   ├── Settings/     # 设置 (29 文件)
│   │   ├── Social/       # 社交
│   │   ├── Story/        # 剧情
│   │   ├── Task/         # 任务
│   │   ├── Team/         # 队伍
│   │   ├── World/        # 世界
│   │   └── Worldbook/    # 世界书
│   │
│   ├── layout/            # 布局组件
│   │   ├── LandingPage.tsx
│   │   ├── LeftPanel.tsx
│   │   ├── RightPanel.tsx
│   │   ├── TopBar.tsx
│   │   └── MobileQuickMenu.tsx
│   │
│   └── ui/                # 基础 UI
│       ├── GameButton.tsx
│       ├── Icons.tsx
│       ├── InAppConfirmModal.tsx
│       ├── InlineSelect.tsx
│       ├── ToggleSwitch.tsx
│       ├── rarityStyles.ts
│       └── decorations/
│
├── hooks/                  # React hooks
│   ├── useGame.ts        # 主入口 (~3000行)
│   ├── useGameState.ts   # 状态管理
│   ├── useGitHubOAuth.ts
│   ├── useImageAssetPrefetch.ts
│   └── useGame/          # 44 个子模块
│       ├── sendWorkflow.ts          # 主剧情发送
│       ├── worldEvolutionWorkflow.ts  # 世界演变
│       ├── variableCalibration.ts    # 变量校准
│       ├── worldGenerationWorkflow.ts # 世界生成
│       ├── openingStoryWorkflow.ts    # 开局剧情
│       ├── planningUpdateWorkflow.ts  # 规划更新
│       ├── bodyPolish.ts            # 正文润色
│       ├── memoryRecall.ts         # 记忆召回
│       ├── recallWorkflow.ts      # 记忆检索
│       ├── npcImageWorkflow.ts    # NPC 生图
│       ├── sceneImageWorkflow.ts  # 场景生图
│       ├── npcSecretImageWorkflow.ts  # 香闺秘档生图
│       ├── playerImageWorkflow.ts   # 主角生图
│       ├── saveCoordinator.ts     # 存档协调
│       ├── config/                # 配置持久化
│       ├── image/                 # 图片工作流
│       ├── saveLoad/              # 存档读写
│       └── ... (30+ 工作流)
│
├── models/                 # 领域模型
│   ├── system.ts         # 系统类型 (23KB)
│   ├── battle.ts        # 战斗
│   ├── character.ts    # 角色
│   ├── environment.ts  # 环境
│   ├── heroinePlan.ts # 女主规划
│   ├── imageGeneration.ts  # 图片生成
│   ├── item.ts        # 物品
│   ├── kungfu.ts     # 功法
│   ├── sect.ts      # 门派
│   ├── social.ts   # 社交
│   ├── story.ts   # 剧情
│   ├── storyPlan.ts  # 剧情规划
│   ├── task.ts    # 任务
│   ├── world.ts  # 世界
│   ├── worldbook.ts  # 世界书
│   └── fandomPlanning/  # 同人规划
│       ├── heroinePlan.ts
│       └── story.ts
│
├── services/              # 服务层 (AI, 数据库, 同步)
│   ├── ai/              # AI 服务
│   │   ├── text/        # 文本生成
│   │   │   ├── index.ts
│   │   │   ├── storyTasks.ts      # (1673行)
│   │   │   └── storyResponseParser.ts
│   │   │
│   │   ├── image/       # 图片生成
│   │   │   ├── index.ts
│   │   │   ├── runtime.ts
│   │   │   └── imageTasks.ts    # (3590行)
│   │   │
│   │   ├── chatCompletionClient.ts  # 通用客户端
│   │   ├── artistTagDictionary.ts
│   │   ├── artistTagExtractor.ts
│   │   └── text/index.ts        # re-export
│   │
│   ├── novel-decomposition/  # 小说分解 (7 文件)
│   │   ├── novelDecompositionStore.ts
│   │   ├── novelDecompositionInjection.ts
│   │   ├── novelDecompositionRuntime.ts
│   │   ├── novelDecompositionScheduler.ts
│   │   ├── novelDecompositionPipeline.ts
│   │   ├── novelDecompositionCalibration.ts
│   │   └── novelDecompositionTime.ts
│   │
│   ├── dbService.ts       # IndexedDB 封装
│   ├── githubSync.ts     # GitHub 云同步
│   ├── saveArchiveService.ts  # 存档压缩
│   ├── epubImport.ts    # EPUB 导入
│   └── novelStructureHeuristics.ts
│
├── prompts/               # 提示词系统 (6 层)
│   ├── core/           # 核心规则
│   │   ├── actionOptions.ts
│   │   ├── ancientRealism.ts
│   │   ├── cot*.ts      # COT 片段
│   │   ├── format.ts
│   │   ├── heroinePlan.ts
│   │   ├── memory.ts
│   │   ├── realm.ts
│   │   ├── rules.ts
│   │   └── world.ts
│   │
│   ├── runtime/        # 运行时
│   │   ├── opening.ts         # 开局
│   │   ├── world*.ts       # 世界生成/演变
│   │   ├── variable*.ts   # 变量
│   │   ├── novelDecomposition.ts
│   │   ├── planning*.ts # 规划
│   │   ├── image*.ts    # 图片
│   │   ├── storyStyles/  # 风格变体
│   │   └── defaults.ts
│   │
│   ├── writing/        # 写作约束
│   │   ├── emotionGuard.ts
│   │   ├── noControl.ts
│   │   ├── perspective.ts
│   │   ├── requirements.ts
│   │   └── style.ts
│   │
│   ├── stats/         # 统计规则
│   │   ├── body.ts
│   │   ├── character.ts
│   │   ├── combat.ts
│   │   ├── cultivation.ts
│   │   ├── drop.ts
│   │   ├── experience.ts
│   │   ├── items.ts
│   │   ├── kungfu.ts
│   │   ├── npc.ts
│   │   └── world.ts
│   │
│   ├── difficulty/   # 难度判定
│   │   ├── check.ts
│   │   ├── game.ts
│   │   └── physiology.ts
│   │
│   ├── shared/        # 共享
│   │   └── realmDefaults.ts
│   │
│   └── index.ts       # 入口导出
│
├── utils/                 # 工具函数 (20+ 文件)
│   ├── apiConfig.ts        # API 配置 (110KB)
│   ���─�� gameSettings.ts   # 游戏设置
│   ├── settingsSchema.ts # 设置 Schema
│   ├── worldbook.ts     # 世界书 (~60KB)
│   ├── visualSettings.ts
│   ├── imageAssets.ts
│   ├── tokenEstimate.ts
│   ├── stateHelpers.ts
│   ├── jsonRepair.ts
│   └── ... (15+ 文件)
│
├── data/                  # 静态数据
│   ├── presets.ts       # 预设
│   ├── newGamePresets.ts
│   └── world.ts       # 世界数据
│
├── styles/                # 样式
│   ├── themes.ts
│   ├── global.css
│   ├── tailwind.css
│   └── components/
│
├── functions/             # Cloudflare Functions
│   └── api/
│       ├── auth/github.ts
│       └── github/
│           ├── release-upload.ts
│           └── release-download.ts
│
├── docs/                  # 设计文档
│   ├── 项目功能梳理与重构任务清单.md
│   ├── 世界观系统分析.md
│   ├── 小说分解-主剧情章节联动改造计划.md
│   └── COT_Fix_Plan.md
│
├── plans/                  # 规划文档
│   ├── novel-decomposition-feature-plan.md
│   ├── character-anchor-plan.md
│   └── fandom-mode-prompt-plan.md
│
└── scripts/                # 开发脚本
    └── promptStressTest.js
```

---

## 关键文件规模

| 文件 | 行数 | 职责 |
|------|------|------|
| `App.tsx` | ~1636 | 应用入口 |
| `hooks/useGame.ts` | ~2990 | 主状态 hook |
| `models/system.ts` | ~700 | 系统类型 |
| `utils/apiConfig.ts` | ~3500 | API 配置 |
| `utils/worldbook.ts` | ~1900 | 世界书工具 |
| `services/ai/storyTasks.ts` | ~1673 | 文本任务 |
| `services/ai/imageTasks.ts` | ~3590 | 图片任务 |

---

## 模块分层

```
入口层: App.tsx → hooks/useGame.ts → useGameState.ts
     ↓
UI层: components/features/*
     ↓
服务层: services/ai/*, services/dbService.ts
     ↓
数据层: models/*, types.ts
     ↓
配置层: prompts/*, utils/*
```