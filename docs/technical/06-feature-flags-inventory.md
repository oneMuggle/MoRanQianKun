# 06 — Feature Flags 清单（阶段 6.1 产出）

> 来源：阶段 6.1 任务（性能模块化方案 — `docs/plans/2026-06-04-performance-modularization-optimization.md`）。
> 目标：为阶段 6.2（NSFW 子系统动态 import）提供 flag 总览。
>
> **本文件为只读清单**，不修改任何运行时行为。

## 0. 范围与定义

### 0.1 "Feature Flag" 在本项目中的三种形态

| 形态 | 载体 | 形态说明 | 影响路径 |
|------|------|----------|----------|
| **A. 设置类 flag** | `state.gameConfig.启用Xxx: boolean` | 由 `游戏设置结构` 定义，玩家/默认配置驱动 | UI 渲染分支、提示词注入、状态归一化 |
| **B. API 模型类 flag** | `state.apiConfig.功能模型占位.启用Xxx: boolean` | 由 `功能模型占位配置结构` 定义，描述"该子功能是否使用独立模型" | 文本/图像请求时选择 API 配置 |
| **C. 提示词功能块 ID** | `<!-- PROMPT_FEATURE:<id>:START/END -->` | 由 `utils/promptFeatureToggles.ts` 解析，按 `功能附加块是否启用` 决定是否保留 | `systemPromptBuilder` 拼接提示词 |

### 0.2 关键源文件

- `hooks/useGame/core/useFeatureFlags.ts` —— **门面 hook**，导出 `世界演变功能已开启` / `文章优化功能已开启` / `已进入主剧情回合` / `执行正文润色` / 4 个 `规范化*` / `应用开场基态` 等。它**不是** flag 定义处，而是消费方；真正的"是否开启"判断硬编码在 `规范化接口设置(deps.apiConfig).功能模型占位.世界演变独立模型开关` 等位置。
- `utils/promptFeatureToggles.ts` —— 形态 C 的解析器；定义了 `功能附加块是否启用(featureId, config)` 的 case 表。
- `models/system.ts` —— 形态 A / B 的 type 定义（`游戏设置结构` 第 828 行起、`功能模型占位配置结构` 第 248 行起）。
- `models/game-settings.ts` —— 形态 A 的另一份镜像（`游戏设置结构` 第 267 行起，**字段比 system.ts 少 5 项**，见 §6.3）。
- `App.tsx` 第 60-110 行 —— 形态 A 的运行时激活（按 flag 动态 `import('./modules')` + `loader.activate(manifest.id)`）。
- `core/module-registry/legacyRegistrations.ts` / `selectors.ts` —— 形态 A 的模块注册入口。

---

## 1. 游戏设置 flag（`state.gameConfig.*`）

> 数据源：`游戏设置结构`（`models/system.ts:828-889`，镜像于 `models/game-settings.ts:267-321`）。
> 仅列出以 `启用` 开头的开关及常用强度字段；不重复 NSFW 子系统的子开关（见 §2）。

### 1.1 通用 / 行为控制

| Flag 名 | 类型 | 默认 | 启用条件 | 影响代码模块 | Domain |
|---------|------|------|----------|--------------|--------|
| `启用行动选项` | boolean | true | `!== false` 时启用 | `sendWorkflow/*`、UI 行动选项按钮；`GameSettings.tsx:201` | Gameplay |
| `行动选项输入模式` | union `'追加'\|'替换'` | — | 玩家在设置中选 | `components/.../ChatInput.tsx` 行动选项点击行为 | UI |
| `启用行动选项增强` | boolean | false | === true 时启用 | `prompts/runtime/actionOptionsRuntime.ts` 多档生成；`GameSettings.tsx:215` | Gameplay |
| `启用NSFW推进选项` | boolean | false | === true 时启用 | `sendWorkflow/*` 在暧昧场景中追加亲密向选项 | NSFW / Gameplay |
| `剧情推进速度` | union | `'正常'` | 4 档之一 | `systemPromptBuilder.ts` 节奏提示词 | Gameplay |
| `启用COT伪装注入` | boolean | true | `!== false` 时启用 | `systemPromptBuilder` 在用户输入前注入"伪历史 COT" | Prompt |
| `启用GPT模式` | boolean | true | === true 时主剧情正常模式 | `sendWorkflow/*` 消息构造（直接发送当前输入） | Prompt |
| `启用女主剧情规划` | boolean | true | === true 时注入女主规划 | `systemPromptBuilder` + `storyPlan/*` | Planning |
| `启用防止说话` | boolean | true | `!== false` 时注入 NoControl 提示词 | `systemPromptBuilder` | Prompt |
| `启用真实世界模式` | boolean | false | === true 时世界可拒绝/惩罚/击杀主角 | `prompts/runtime/realWorldMode.ts` | Prompt |
| `启用免责声明输出` | boolean | true | === true 时要求独立免责声明块 | `sendWorkflow` 解析校验 | Validation |
| `启用标签检测完整性` | boolean | true | === true 时校验标签协议 | `sendWorkflow` 响应解析 | Validation |
| `启用标签修复` | boolean | true | `!== false` 时自动修复畸形标签 | `sendWorkflow` 解析前 | Validation |
| `启用自动重试` | boolean | true | === true 时失败自动重试 | `sendWorkflow` 主循环 | Robustness |
| `启用动态难度` | boolean | false | === true 时根据表现调难度 | `models/system.ts` 难度统计 | Difficulty |
| `启用调试模式` | boolean | false | === true 时 LLM debug 模式 | `prompts/runtime/*` 注入 trace；`SettingsPanel.tsx:198` | Debug |
| `调试日志保留条数` | number | 20 | — | Debug 日志环形缓冲 | Debug |

### 1.2 NSFW 总开关

| Flag 名 | 类型 | 默认 | 启用条件 | 影响代码模块 | Domain |
|---------|------|------|----------|--------------|--------|
| `启用NSFW模式` | boolean | false | === true 时启用 | `App.tsx:69-86` 按 `nsfwModules` 动态 import 7 个 NSFW 子系统；`prompts/runtime/nsfw.ts` 注入 | NSFW |
| `nsfw场景类型` | union `'无'\|'点到为止'\|'适度展开'\|'完全展开'` | — | 4 档之一 | `NSFW场景描述映射`；运行时也镜像到 `state.openingConfig.nsfw场景类型` | NSFW |
| `成人内容` | boolean | false | === true 时解锁 nsfw 等级 2 气运条目 | `data/qiyun/*` 解锁 | NSFW |
| `启用NSFW增强系统` | boolean | false | === true 时启用孕产/善后/服装/后果/跨模块联动 | `models/npcNSFWEnhancement/*` | NSFW |
| `启用孕产系统` | boolean | false | === true 且 `启用NSFW增强系统 === true` 时 | `models/npcNSFWEnhancement/pregnancyEngine.ts:58,122,196` | NSFW |

### 1.3 行为世界 / 时代子系统

| Flag 名 | 类型 | 默认 | 启用条件 | 影响代码模块 | Domain |
|---------|------|------|----------|--------------|--------|
| `启用饱腹口渴系统` | boolean | true | `!== false` 时启用 | `utils/promptFeatureToggles.ts:48`（survival feature ID 注入 + 关键词行过滤）；`GameSettings.tsx:391` | Survival |
| `启用修炼体系` | boolean | true | `!== false` 时启用 | `utils/promptFeatureToggles.ts:44`（cultivation feature ID）；`裁剪修炼体系上下文数据()` 递归裁剪 `境界/功法列表/精元储量` 等字段；`App.tsx:107` 按 `biz-rpg-battle` 模块激活 | Cultivation |
| `启用里武侠模式` | boolean | false | === true 时启用 | `utils/promptFeatureToggles.ts:50`（liwuxia feature ID）；`裁剪里武侠上下文数据()` 裁剪 `武根/硬度/尺寸/精元储量` | LiMode |
| `启用里志怪模式` | boolean | false | === true 时启用 | `utils/promptFeatureToggles.ts:52`（lizhiguai feature ID）；`裁剪里志怪上下文数据()` 裁剪 `妖根/业障/功德/灵视能力/已知道法` | LiMode |
| `启用子纪元里模式` | `Record<eraId, boolean>` | 默 true | 任意 eraId 对应值为 true 时 | `prompts/runtime/eraLiMode.ts` 按子纪元注入 | LiMode |
| `子纪元里模式强度` | `Record<eraId, '微暗'\|'暧昧'\|'露骨'>` | `'露骨'` | 3 档之一 | `eraLiMode.ts` 强度提示 | LiMode |
| `子纪元里模式阶段` | `Record<eraId, LiModeStage>` | `'羞耻'` | — | `eraLiMode.ts` NPC 心理/行为阶段 | LiMode |
| `古代体系选择` | union `'武侠'\|'志怪'\|'双修'` | — | 3 选 1 | `WorldGenConfig.古代体系选择`；`utils/promptFeatureToggles.ts:55`（zhiguai feature ID） | Era |

### 1.4 剧情风格 / 酒馆

| Flag 名 | 类型 | 默认 | 启用条件 | 影响代码模块 | Domain |
|---------|------|------|----------|--------------|--------|
| `剧情风格` | union | — | 6 档 (`后宫\|修炼\|一般\|修罗场\|纯爱\|NTL后宫`) | `systemPromptBuilder` 注入为 assistant 上下文 | Story |
| `NTL后宫档位` | union | — | 3 档 (`禁止乱伦\|假乱伦\|无限制`) | NTL 风格注入 | Story |
| `启用酒馆预设模式` | boolean | false | === true 时启用 | `services/ai/chatCompletionClient.ts` 走 SillyTavern 预设管道；`TavernPresetSettings.tsx:269` | API |
| `酒馆提示词后处理` | union | `'未选择'` | 4 档 | 酒馆预设后处理 | API |
| `独立APIGPT模式` | object 7 booleans | — | 7 个子开关：剧情回忆/记忆总结/文章优化/世界演变/变量生成/规划分析/小说拆分 | 与 §3 模型占位互为冗余开关，**疑似配置错位**（见 §6.2） | API |

### 1.5 视觉

| Flag 名 | 类型 | 默认 | 启用条件 | 影响代码模块 | Domain |
|---------|------|------|----------|--------------|--------|
| `启用背景音乐` | boolean | — | 视觉设置内 | `components/.../Music*` | Visual |
| `AI思考流式折叠` | boolean | true | — | `components/.../Chat` 流式显示 | Visual |
| `底部滚动关闭显示` | boolean | false | === true 时隐藏世界大事 | `components/layout/TopBar` | Visual |

---

## 2. NSFW 子系统 flag（按子系统分组）

> 这些是 `state.gameConfig.XxxNSFW设置.*` 的子字段；其**总开关**（例如 `启用校园NSFW深化系统`）在 §1.2 已经列出。

### 2.1 校园 NSFW (`state.gameConfig.校园NSFW设置.*`，仅 `contemporary_campus`)

| Flag | 类型 | 默认 | 启用条件 | 影响代码模块 |
|------|------|------|----------|--------------|
| `启用校园NSFW深化系统` | boolean | false | === true | `App.tsx:76` 注册 `nsfw-campus`；`prompts/runtime/campusNSFW.ts` |
| `NSFW内容强度` | union | — | 3 档 | `campusNSFW.ts` 注入强度 |
| `启用后果系统` | boolean | — | === true | `campusNSFW.ts` 后果管线 |
| `启用多角关系` | boolean | — | === true | `campusNSFW.ts` |
| `启用露出系统` | boolean | false | === true | `App.tsx:79` 注册 `nsfw-exposure`；`models/exposureNSFW/*` |
| `露出内容强度` | union | — | 4 档 | `exposureNSFW/settings.ts` |
| `启用公开隐秘侵犯` | boolean | — | === true | `exposureNSFW/*` |
| `启用旁观者反应` | boolean | — | === true | `exposureNSFW/*` |
| `启用网络传播` | boolean | — | === true | `exposureNSFW/*` |
| `校园活动NSFW频率` | union | — | 4 档 | `exposureNSFW/*` |
| `启用SM系统` | boolean | — | === true | `campusNSFW.ts` SM 模块 |
| `SM内容强度` | union | — | 4 档 | `campusNSFW.ts` |
| `启用契约系统` | boolean | — | === true | `campusNSFW.ts` |
| `启用公开服从` | boolean | — | === true | `campusNSFW.ts` |
| `权力天平初始倾向` | union | — | 4 档 | `campusNSFW.ts` |
| `启用桌游NSFW` | boolean | — | === true | `campusNSFW.ts` 桌游子项 |
| `桌游NSFW强度` | union | — | 4 档 | `campusNSFW.ts` |
| `启用密室逃脱NSFW` | boolean | — | === true | `campusNSFW.ts` |
| `启用狼人杀NSFW` | boolean | — | === true | `campusNSFW.ts` |
| `启用剧本杀NSFW` | boolean | — | === true | `campusNSFW.ts` |
| `启用派对游戏NSFW` | boolean | — | === true | `campusNSFW.ts` |
| `桌游触发频率` | union | — | 3 档 | `campusNSFW.ts` |
| `启用校园祭NSFW` | boolean | — | === true | `campusNSFW.ts` |
| `校园祭NSFW强度` | union | — | 4 档 | `campusNSFW.ts` |
| `启用后夜祭告白` | boolean | — | === true | `campusNSFW.ts` |
| `启用摊位NSFW` | boolean | — | === true | `campusNSFW.ts` |
| `启用舞台NSFW` | boolean | — | === true | `campusNSFW.ts` |
| `校园祭频率` | union | — | 3 档 | `campusNSFW.ts` |
| `启用BDSM论坛` | boolean | — | === true | `campusNSFW.ts:51,78,122` |
| `BDSM内容强度` | union | — | 4 档 | `campusNSFW.ts` |
| `启用BDSM_NPC影响` | boolean | — | === true | `campusNSFW.ts` |
| `启用BDSM_流言传播` | boolean | — | === true | `campusNSFW.ts` |
| `启用BDSM关系管线` | boolean | — | === true | `campusNSFW.ts` |
| `启用BDSM调教任务` | boolean | — | === true | `campusNSFW.ts` |
| `启用BDSM契约系统` | boolean | — | === true | `campusNSFW.ts` |
| `启用BDSM见面预约` | boolean | — | === true | `campusNSFW.ts` |

> `models/campusNSFW/index.ts:163-204` 定义 36 个字段。

### 2.2 桌游社交 NSFW (`state.gameConfig.桌游社交NSFW设置.*`，全部时代)

| Flag | 类型 | 影响代码模块 |
|------|------|--------------|
| `启用桌游社交NSFW系统` | boolean | `App.tsx:78` 注册 `nsfw-board-game`；`models/boardGameNSFW/*` |
| `桌游社交NSFW强度` | union 4 档 | `boardGameNSFW/*` |
| `启用密室逃脱NSFW` | boolean | `boardGameNSFW/*` |
| `启用狼人杀NSFW` | boolean | `boardGameNSFW/*` |
| `启用剧本杀NSFW` | boolean | `boardGameNSFW/*` |
| `启用派对游戏NSFW` | boolean | `boardGameNSFW/*` |
| `启用骰子桌游NSFW` | boolean | `boardGameNSFW/*` |
| `启用棋牌桌游NSFW` | boolean | `boardGameNSFW/*` |
| `桌游触发频率` | union 3 档 | `boardGameNSFW/*` |
| `启用桌游多人局` | boolean | `boardGameNSFW/*` |

### 2.3 BDSM 独立子系统 (`state.gameConfig.BDSM系统设置.*`，全部时代)

| Flag | 类型 | 影响代码模块 |
|------|------|--------------|
| `启用BDSM独立系统` | boolean | `App.tsx:77` 注册 `nsfw-bdsm`；`models/bdsmNSFW/*` |
| `BDSM内容强度` | union 4 档 | `bdsmNSFW/*` |
| `启用BDSM论坛` | boolean | `bdsmNSFW/*`（与 §2.1 校园内的同名 flag 重复，见 §6.1） |
| `启用BDSM调教任务` | boolean | `bdsmNSFW/*` |
| `启用BDSM契约系统` | boolean | `bdsmNSFW/*` |
| `启用BDSM见面预约` | boolean | `bdsmNSFW/*` |
| `启用BDSM关系管线` | boolean | `bdsmNSFW/*` |
| `启用BDSM多角色关系` | boolean | `prompts/runtime/bdsmNSFW.ts:165` |
| `启用BDSM时代场景包` | boolean | `bdsmNSFW/*` |
| `启用BDSM信誉系统` | boolean | `bdsmNSFW/*` |

### 2.4 写真 NSFW (`state.gameConfig.写真NSFW设置.*`，`contemporary_*`)

| Flag | 类型 | 影响代码模块 |
|------|------|--------------|
| `启用写真NSFW系统` | boolean | `App.tsx:80` 注册 `nsfw-photography`；`PhotographyNSFWSettings.tsx:24` |
| `NSFW内容强度` | union | `photographyNSFW/*` |
| `主要玩法层` | union | `photographyNSFW/*` |
| `次要玩法权重` | number | `photographyNSFW/*` |
| `启用道德选择` | boolean | `photographyNSFW/*` |
| `启用尺度递进` | boolean | `photographyNSFW/*` |
| `启用摄影师筛选` | boolean | `photographyNSFW/*` |
| `启用越界识别` | boolean | `photographyNSFW/*` |
| `启用安全词系统` | boolean | `photographyNSFW/*` |
| `启用照片交付` | boolean | `photographyNSFW/*` |

### 2.5 都市网约车 NSFW (`state.gameConfig.都市网约车NSFW设置.*`，`contemporary_urban`)

| Flag | 类型 | 影响代码模块 |
|------|------|--------------|
| `启用都市网约车NSFW系统` | boolean | `App.tsx:81` 注册 `nsfw-urban-driver`；`models/urbanDriverNSFW/*` |
| `NSFW内容强度` | union | `urbanDriverNSFW/*` |
| `启用醉酒乘客场景` | boolean | `urbanDriverNSFW/*` |
| `醉酒场景强度` | union | `urbanDriverNSFW/*` |
| `启用饮料下药场景` | boolean | `urbanDriverNSFW/*` |
| `下药场景强度` | union | `urbanDriverNSFW/*` |
| `首选药物类型` | union | `urbanDriverNSFW/*` |
| `启用深夜独处场景` | boolean | `urbanDriverNSFW/*` |
| `启用后座暗示场景` | boolean | `urbanDriverNSFW/*` |
| `启用停车场秘密场景` | boolean | `urbanDriverNSFW/*` |
| `启用拼车暧昧场景` | boolean | `urbanDriverNSFW/*` |
| `启用常客关系系统` | boolean | `urbanDriverNSFW/*` |
| `启用行车记录仪系统` | boolean | `urbanDriverNSFW/*` |
| `启用后果系统` | boolean | `urbanDriverNSFW/*` |
| `后果严重程度` | union | `urbanDriverNSFW/*` |
| `启用平台处罚` | boolean | `urbanDriverNSFW/*` |
| `启用网络传播` | boolean | `urbanDriverNSFW/*` |
| `启用警察盘查` | boolean | `urbanDriverNSFW/*` |
| `启用勒索威胁` | boolean | `urbanDriverNSFW/*` |

### 2.6 酒吧 NSFW (`state.gameConfig.酒吧NSFW设置.*`，`contemporary_urban`)

| Flag | 类型 | 影响代码模块 |
|------|------|--------------|
| `启用` (顶层) | boolean | `App.tsx:82` 注册 `nsfw-bar`；`models/contemporary/barNSFW/*` |
| `内容强度` | union | `barNSFW/*` |
| `启用醉酒系统` | boolean | `barNSFW/*` |
| `启用危机事件` | boolean | `barNSFW/*` |
| `启用陪酒服务` | boolean | `barNSFW/*` |
| `尺度上限` | union | `barNSFW/*` |

> **命名不一致**：其他子系统开关用 `启用Xxx`，酒吧用裸名 `启用` —— 见 §6.4。

---

## 3. API 模型占位 flag（`state.apiConfig.功能模型占位.*`）

> 数据源：`功能模型占位配置结构`（`models/system.ts:248-392`）。
> 这些 flag 决定"该子流程是否走独立 API"。

| Flag 名 | 类型 | 默认 | 影响代码模块 | Domain |
|---------|------|------|--------------|--------|
| `剧情回忆独立模型开关` | boolean | false | `hooks/useGame/sendWorkflow/memoryRecall.ts` | API / Memory |
| `记忆总结独立模型开关` | boolean | false | `hooks/useGame/memory/*` | API / Memory |
| `世界演变独立模型开关` | boolean | false | `useFeatureFlags.ts:67` 读取判断 `世界演变功能已开启`；`hooks/useGame/world/*` | API / World |
| `变量计算独立模型开关` | boolean | false | `prompts/runtime/variableCalibrationReference.ts` | API / Variable |
| `规划分析独立模型开关` | boolean | false | `hooks/useGame/planning/*` | API / Planning |
| `女主规划独立模型开关` | boolean | false | `hooks/useGame/planning/*` | API / Planning |
| `剧情规划独立模型开关` | boolean | false | `hooks/useGame/planning/*` | API / Planning |
| `文章优化独立模型开关` | boolean | false | `useFeatureFlags.ts:76` 读取判断 `文章优化功能已开启`；`hooks/useGame/opening/bodyPolish.ts` | API / Polish |
| `小说拆分功能启用` | boolean | false | `NovelDecompositionSettings.tsx` 主开关 | API / NovelDecomp |
| `小说拆分独立模型开关` | boolean | false | `services/novel-decomposition/*` | API / NovelDecomp |
| `设备消息独立模型开关` | boolean | false | `hooks/useGame/device/*` | API / Device |
| `文生图功能启用` | boolean | false | `ImageGenerationSettings.tsx:840`；`App.tsx` 文生图块 | API / Image |
| `场景生图独立接口启用` | boolean | false | 文生图场景通道 | API / Image |
| `场景生图启用` | boolean | true | 文生图场景 | API / Image |
| `主角生图启用` | boolean | true | 文生图主角 | API / Image |
| `NPC生图启用` | boolean | true | 文生图 NPC | API / Image |
| `主角生图独立接口启用` | boolean | false | 主角独立通道 | API / Image |
| `NPC生图使用词组转化器` | boolean | — | `词组转化器` 主开关 | API / Image |
| `词组转化器启用独立模型` | boolean | false | `ImageGenerationSettings.tsx:1314,1368` | API / Image |
| `词组转化兼容模式` | boolean | — | 兼容旧版 | API / Image |
| `香闺秘档特写强制裸体语义` | boolean | — | 写真特殊语义 | API / Image |
| `PNG提炼启用独立模型` | boolean | false | `ImageGenerationSettings.tsx:1386,1411` | API / Image |
| `小说拆分后台运行` | boolean | false | `services/novel-decomposition/*` | API / NovelDecomp |
| `小说拆分自动续跑` | boolean | false | 同上 | API / NovelDecomp |
| `小说拆分主剧情注入` | boolean | — | `CurrentNovelDecompositionInjectionSettings.tsx:68` | API / NovelDecomp |
| `小说拆分规划分析注入` | boolean | — | 同上 | API / NovelDecomp |
| `小说拆分世界演变注入` | boolean | — | 同上 | API / NovelDecomp |

---

## 4. 记忆配置 flag（`state.memoryConfig.*`）

> 数据源：`记忆配置结构`（`models/system.ts:891-901`）。

| Flag 名 | 类型 | 默认 | 影响代码模块 | Domain |
|---------|------|------|--------------|--------|
| `启用后台自动总结` | boolean | — | `hooks/useGame/memory/*` 后台 Worker | Memory |
| `短期记忆阈值` / `中期记忆阈值` / `NPC记忆总结阈值` / `即时消息上传条数N` / `重要角色关键记忆条数N` | number | 30 / 50 / 20 / 10 / 20 | `hooks/useGame/memory/*` | Memory |
| `短期转中期提示词` / `中期转长期提示词` / `NPC记忆总结提示词` | string | — | 提示词文本 | Memory |

---

## 5. 提示词功能块 ID（形态 C）

> 数据源：`utils/promptFeatureToggles.ts:38-60` 的 `功能附加块是否启用` 内部 case 表。
> 标记为 `default: true` 的 ID 即使未命中也保持原样。

| `featureId` | 关联 `gameConfig` flag | 行为 |
|-------------|------------------------|------|
| `cultivation` | `启用修炼体系 !== false` | 关闭时移除 `<!-- PROMPT_FEATURE:cultivation -->` 块 |
| `nsfw` | `启用NSFW模式 === true` | 开启才保留；默认移除 |
| `survival` | `启用饱腹口渴系统 !== false` | 关闭时移除块；外加行级过滤（`过滤饱腹口渴提示词行`） |
| `liwuxia` | `启用里武侠模式 === true` | 同上 |
| `lizhiguai` | `启用里志怪模式 === true` | 同上 |
| `limode` | `Object.keys(启用子纪元里模式).length > 0` | 开启才保留 |
| `zhiguai` | `古代体系选择 === '志怪' \|\| '双修'` | 同上 |
| 其他 / 未知 | — | 默认 `return true` 保留块 |

---

## 6. 关键发现

### 6.1 重复的 flag（同名字段，含义/作用域不同）

| 字段名 | 出现位置 | 备注 |
|--------|----------|------|
| `启用BDSM论坛` | `校园NSFW设置` + `BDSM系统设置` | 两处独立，含义不同（校园 BDSM 论坛 vs 独立 BDSM 论坛）。`prompts/runtime/campusNSFW.ts:51` 接受的是前者；`App.tsx` 通过 `BDSM系统设置.启用BDSM独立系统` 注册 `nsfw-bdsm`。 |
| `启用后果系统` | `校园NSFW设置` + `都市网约车NSFW设置` | 两个独立子系统分别控制 |
| `启用网络传播` | `校园NSFW设置`（exposure 子项）+ `都市网约车NSFW设置` | 同上 |
| `启用密室逃脱NSFW` / `启用狼人杀NSFW` / `启用剧本杀NSFW` / `启用派对游戏NSFW` | `校园NSFW设置`（游戏类 NSFW 子项）+ `桌游社交NSFW设置` | 重复定义 4 项 |

### 6.2 疑似配置错位 / 死代码

1. **`游戏设置结构.独立APIGPT模式`**（`models/system.ts:874-882` / `game-settings.ts:310-318`）
   - 7 个 boolean（剧情回忆/记忆总结/文章优化/世界演变/变量生成/规划分析/小说拆分）。
   - 与 §3 的 `*.独立模型开关` 一一对应，但**未被任何代码读取**（grep 0 hit）。
   - 结论：**疑似遗留死字段**，应在阶段 6.2 之后清理（参见 §0.2 关键源文件中的 `GameSettings.tsx` 实际只读写 `功能模型占位.独立Xxx开关`）。

2. **`启用教学/启用PC播放/启用多维NTR/启用NTR`** 等阶段 2 提到的"7 个嵌套路径"（来源：`docs/technical/08c-nsfw-gameplay-enhancement.md`）
   - 本次扫描未在 `游戏设置结构` / `功能模型占位配置结构` 顶层找到这些 flag；它们位于 NSFW 子系统 `*NSFW设置.启用*` 内，已在 §2 完整覆盖。

### 6.3 `models/system.ts` 与 `models/game-settings.ts` 字段不一致

| 字段 | `system.ts` | `game-settings.ts` |
|------|-------------|---------------------|
| `BDSMNSFW设置` 字段名 | `BDSM系统设置` | `BDSMNSFW设置` |
| `ExposureNSFW设置` | **缺失** | `ExposureNSFW设置?: ExposureNSFW设置` |
| `写真系统扩展` | 在 `存档结构` | 在 `存档结构` |
| `启用动态难度` | 有 | **缺失** |
| `启用调试模式` | 有 | **缺失** |
| `调试日志保留条数` | 有 | **缺失** |
| `变量生成并发数` | 有 | **缺失** |
| `变量生成最大重试次数` | 有 | **缺失** |
| `酒馆预设列表/当前酒馆预设ID/...` | 有 | **缺失** |
| `独立APIGPT模式` | 有 | 有 |
| `额外提示词` | 有 | 有 |
| `视觉设置` 在 `存档结构` | 有 | 缺失（用 `Partial<视觉设置结构>`） |

> **结论**：`game-settings.ts` 是早期拆分版本，落后于 `system.ts`；建议在阶段 6.2 期间合并（参见 [02e-dbservice-split-progress](./02e-dbservice-split-progress.md) 的拆分收尾讨论）。

### 6.4 命名不一致

| 不一致点 | 出现处 |
|----------|--------|
| `酒吧NSFW设置.启用` vs 其他子系统的 `启用Xxx` | `models/contemporary/barNSFW/types.ts:50` |
| `nsfw场景类型` vs 早期阶段残留 `NSFW场景类型` | `WorldGenConfig` 同时使用别名 |
| 顶层 `启用里志怪模式` (gameConfig) vs 子纪元 `启用子纪元里模式[eraId]` (gameConfig) | 同时存在，作用层级不同 |

### 6.5 `useFeatureFlags.ts` 自身产出的"动态判断"函数

虽然是 hook，但**只暴露 2 个 feature flag 判断**：

| 导出函数 | 判定逻辑 | 含义 |
|----------|----------|------|
| `世界演变功能已开启()` | `功能模型占位.世界演变独立模型开关 && 世界演变使用模型非空字符串` | 真正开启"独立模型世界演变"（不只是用户偏好） |
| `文章优化功能已开启()` | `功能模型占位.文章优化独立模型开关 && 文章优化使用模型非空字符串` | 同上，针对 bodyPolish |

> 这两个函数在 `useFeatureFlags` 内被 useCallback 包裹并通过 deps 数组追踪 `apiConfig`，是当前项目**唯一一处**"flag 集中判断"的位置。其他所有 flag 都在消费方各自读取。

### 6.6 阶段 6.2 改造建议（NSFW 子系统动态 import）

阶段 6.1 已扫清 §2.1–2.6 的 7 个 NSFW 子系统（`App.tsx:69-86`）。
现有 `nsfwModules` 注册顺序是串行 await（同一 `useEffect` 内），阶段 6.2 改造方向：

1. **并行化**：`Promise.all(nsfwFlags.filter([_, on] => on).map(...))`。
2. **延迟到首回合**：把这段注册代码从初始化 `useEffect` 迁移到首回合触发前，避免首屏 JS 阻塞。
3. **按需持久化**：缓存 `已激活` 的 subsystem ID 到 `localStorage`，第二次进入跳过网络/解析。
4. **移除 §6.2 死字段 `独立APIGPT模式`**：在阶段 6.2 PR 中连同 `models/game-settings.ts` 一起合并。
5. **命名统一**：把 `酒吧NSFW设置.启用` 改名为 `启用酒吧NSFW系统`，与其他子系统一致。

---

## 7. 附：flag 总数速览

| 类别 | 数量 | 说明 |
|------|------|------|
| §1 游戏设置 flag | 30+ | 含 6 档 `剧情风格` / 4 档 `nsfw场景类型` / 3 档 `NTL后宫档位` 等 union |
| §2.1 校园 NSFW | 36 | `models/campusNSFW/index.ts:163-204` |
| §2.2 桌游社交 NSFW | 10 | `models/boardGameNSFW/normalization.ts` |
| §2.3 BDSM 独立 | 10 | `models/bdsmNSFW/normalization.ts` |
| §2.4 写真 NSFW | 10 | `models/photographyNSFW/index.ts` |
| §2.5 都市网约车 NSFW | 19 | `models/urbanDriverNSFW/index.ts` |
| §2.6 酒吧 NSFW | 6 | `models/contemporary/barNSFW/types.ts:50` |
| §3 API 模型占位 | 27 | `功能模型占位配置结构` 中 `启用*` 字段 |
| §4 记忆配置 | 1 | `启用后台自动总结` |
| §5 提示词功能块 ID | 7+ | `promptFeatureToggles.ts` case 表 |
| **合计** | **~155** | 仅计算 "启用" 前缀或带主控开关的可动态决策项；不含纯 number 阈值 |

---

## 8. 相关文档

- [03-prompt-architecture](./03-prompt-architecture.md) — 提示词分层与 systemPromptBuilder
- [06-module-registry](./06-module-registry.md) — 弹窗注册（README 已列，文件待写）
- [08-nsfw-systems](./08-nsfw-systems.md) — NSFW 子系统合集
- [09-image-pipeline](./09-image-pipeline.md) — 图像生成流水线
- [13-performance](./13-performance.md) — 性能与构建优化路线
- `docs/plans/2026-06-04-performance-modularization-optimization.md` — 本清单来源
