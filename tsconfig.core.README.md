# tsconfig.core.json L1 范围说明

> Created: 2026-06-06 (Phase 2 Day 8-12 of 60-day optimization roadmap)
> Plan: docs/plans/2026-06-06_phase2-ts-strict-layered.md
> Spec: docs/superpowers/specs/2026-06-06-project-optimization-roadmap-v2-design.md

## L1 范围定义

`tsconfig.core.json` 包含**核心领域模型**，**显式列举**（不用 glob）。

### L1 include（核心文件，26 个）

**核心领域模型**（`models/` 顶层，无 cross-import 到 L2/L3 子目录）：

| 文件 | 行数 | 角色 |
|---|---|---|
| `models/character.ts` | 201 | 角色数据结构 |
| `models/environment.ts` | 38 | 环境信息 |
| `models/battle.ts` | 19 | 战斗状态 |
| `models/item.ts` | 88 | 物品/装备 |
| `models/kungfu.ts` | 76 | 功法 |
| `models/sect.ts` | 80 | 门派 |
| `models/task.ts` | 57 | 任务/约定 |
| `models/imageGeneration.ts` | 194 | 图片生成类型 |
| `models/worldbook.ts` | 88 | 世界书 |
| `models/world.ts` | 116 | 世界数据结构 |
| `models/story.ts` | 48 | 剧情系统 |
| `models/relationship.ts` | 291 | 人物关系谱 |
| `models/eventTrigger.ts` | 104 | 事件触发器 |
| `models/narrativeGrammar.ts` | 111 | 叙事语法 |
| `models/api-config.ts` | 357 | API/生图配置 |
| `models/appRegistry.ts` | 451 | App 注册表 |
| `models/theme-visual.ts` | 81 | 视觉/主题配置 |
| `models/storyPlan.ts` | 73 | 剧情规划 |
| `models/heroinePlan.ts` | 58 | 女主规划 |
| `models/novelDecomposition.ts` | 182 | 小说拆分 |
| `models/novelWriting.ts` | 81 | 小说写作 |
| `models/installedApps.ts` | 145 | 已安装 App |
| `models/nsfwApps.ts` | 113 | NSFW App 分级 |
| `models/eraTheme.ts` | 4 | 时代主题（顶层重定向 + 透传 `eraTheme/`） |
| `models/eraAssets.ts` | 90 | 时代素材 |

### L1 exclude（非核心子目录，应在 L2/L3 阶段处理）

| 子目录 | 类型 | 备注 |
|---|---|---|
| `models/contemporary/**` | 场景子系统 | dating、sugarRelationship、streaming、diving、adultIndustry 等 |
| `models/contpective/**` | 疑似拼写错误目录 | 已废弃，保留以防历史引用 |
| `models/npcNSFWEnhancement/**` | 特性扩展 | 性癖演化、敏感点等 |
| `models/nsfwCore/**` | NSFW 核心 | |
| `models/photographyNSFW/**` | 资源管理 | 图片资产相关 |
| `models/era-config/**` | 配置层 | |
| `models/eraTheme/**` | 配置层 | 注意：`models/eraTheme.ts`（顶层文件）保留 |
| `models/avg/**` | 场景子系统 | galgame、relationGraph 等 |
| `models/bdsmNSFW/**` | NSFW 子系统 | |
| `models/boardGameNSFW/**` | NSFW 子系统 | |
| `models/campusNSFW/**` | NSFW 子系统 | dating、streaming、photography、eliteClub 等 |
| `models/dailyTown/**` | 场景子系统 | |
| `models/era-device/**` | 配置层 | 注意：`models/eraDevice.ts`（顶层文件）不保留（cross-import 较重） |
| `models/exploration/**` | 场景子系统 | |
| `models/exposureNSFW/**` | NSFW 子系统 | |
| `models/outdoorNSFW/**` | NSFW 子系统 | |
| `models/property/**` | 配置层 | |
| `models/urbanDriverNSFW/**` | NSFW 子系统 | |
| `models/domain/**` | 子领域 | 内部 domain 层（未使用） |
| `models/game/**` | 子领域 | 内部 game 层（未使用） |
| `models/planning/**` | 子领域 | 内部 planning 层（未使用） |
| `models/fandomPlanning/**` | 子领域 | 同人规划（跨入 social 子系统） |
| `models/system/**` | 子领域 | 时代预设（内联在 system.ts 中） |

### L1 不包含的核心文件（因 cross-import 被 L2/L3 推迟）

| 文件 | 原因 | 推迟阶段 |
|---|---|---|
| `models/social.ts` | 导入 `npcNSFWEnhancement/types`、`eraTheme/types`（L2 域），共 17 错误 | L2 |
| `models/intimacy.ts` | 导入 `campusNSFW`（L2 域），共 84 错误 | L2 |
| `models/campusPhone.ts` | 导入 `campusNSFW`（L2 域），共 21 错误 | L2 |
| `models/mobileDevice.ts` | 导入 `campusPhone`（推迟），并需要 `social` | L2 |
| `models/eraDevice.ts` | 导入 `era-device/`（L3 配置层），共 82 错误 | L3 |
| `models/era-config.ts` | 导入 `eraTheme`、自身目录，共 87 错误 | L3 |
| `models/index.ts` | 集中导出，会拉入所有子模块，共 96 错误 | L2 |
| `models/system.ts` | 1030 行系统主入口，导入 9+ 个 L2/L3 子目录 | L2 |
| `models/game-settings.ts` | re-export 层，导入 game-settings/ 内部目录 | L2 |

### L1 不包含的服务文件（因 cross-import 拉入过多 L2/L3 域）

| 路径 | 原因 | 推迟阶段 |
|---|---|---|
| `services/dbService/**` | 通过 `types.ts` 拉入 `models/system.ts` 触发 82 错误 | L2 |
| `services/ai/**` | 通过 `utils/apiConfig`、`types.ts`、`prompts/runtime/*` 拉入 utils/prompts/hooks（200+ 错误） | L3 |

## 为什么是显式清单而不是 glob？

最初设计 `models/**/*.ts` glob 在 Day 1 时，期望"L1 = models 全部"是正确的。但随着项目发展，`models/` 下累积了大量场景子系统、NSFW 子系统、配置层子目录。这些**不是核心领域模型**，应在 L2/L3 阶段处理。

### 关于 `exclude` 的真实行为

TypeScript 的 `exclude` **只能阻止文件被加入编译入口**，但**无法阻止 cross-imports**。一旦 L1 中的某个文件 `import` 一个被 exclude 的文件，TypeScript 仍会**沿 import 链类型检查**被 import 的文件。

实测数据（Path B 实施，Day 8-12）：
- `tsconfig.core.json` 用 glob `models/**/*.ts` + 最小 exclude：开启 `noUncheckedIndexedAccess` 后产生 100+ 错误
- 改用显式 include（26 个文件） + 显式 exclude：0 错误

但即便如此，**不能引入跨 L2/L3 域的 import**——一旦引入，那些域的 strict 错误就会"穿透"进来。所以 L1 包含的 26 个文件**经精心挑选**，全是**不向 L2/L3 子目录发出 cross-import 的核心领域文件**。

## 当前 L1 错误数

**0 errors**（Day 13-18 后：开启 `exactOptionalPropertyTypes` 后基线 5 个错误，全部用 conditional spread 模式修复至 0）

### Day 13-18 修复明细（exactOptionalPropertyTypes）

| 文件 | 错误类型 | 修复方式 |
|---|---|---|
| `models/relationship.ts:191` | TS2375（创建人物关系边） | `客体ID` 用 conditional spread |
| `models/relationship.ts:247` | TS2379（图谱节点-主体） | `性别` 用 conditional spread |
| `models/relationship.ts:258` | TS2379（图谱节点-客体） | `性别` 用 conditional spread |
| `models/eraTheme/assembly.ts:218` | TS2375（toLegacyEra） | `界面文案` 用 conditional spread |
| `models/eraTheme/types.ts:200` | TS2375（makeNode） | `children` 用 conditional spread |

> **关于 prompts/core ↔ models 局部解耦**：经 grep + madge 验证，`prompts/core/*.ts` 中**无任何** `models/` 命名导入；`models/*.ts` 中**无任何** `prompts/` 导入。spec R1 提到的"prompts/core ↔ models/types 循环"在当前代码库**不存在**。所有 14 个 `prompts/models` 范围的循环均为 NSFW 子系统内部循环（L2/L3 范围），不影响 L1 解耦目标。

## 添加新文件到 L1

1. 确认文件**真正属于核心领域**（不向 L2/L3 子目录发出 import）
2. 验证 strict + `noUncheckedIndexedAccess` 下 0 错误：
   ```bash
   npx tsc --noEmit -p tsconfig.core.json 2>&1 | grep "your-file.ts"
   ```
3. 加入 `tsconfig.core.json` 的 `include`
4. 同步本 README

## 添加新排除目录

1. 确认新目录**不是核心领域**
2. 加入 `exclude`
3. 同步本 README

## 后续阶段

- **L2 (Day 13-22)**：扩展到 cross-import 较轻的子系统（如 `models/social.ts`、`models/intimacy.ts`）
- **L3 (Day 23-30+)**：覆盖全部 `models/` + `services/ai/` + `services/dbService/` + `utils/` + `prompts/` + `hooks/`
