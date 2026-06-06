# Phase 3 — 大文件拆分实施计划

> **创建日期**：2026-06-06
> **状态**：已批准（spec `docs/superpowers/specs/2026-06-06-project-optimization-roadmap-v2-design.md`）
> **父路线图**：[2026-06-06-project-optimization-roadmap-v2-design](../../superpowers/specs/2026-06-06-project-optimization-roadmap-v2-design.md)
> **前置依赖**：[Phase 2 — TypeScript 严格度分层](./2026-06-06_phase2-ts-strict-layered.md)（已闭环）
> **工期**：Day 31-45（15 天）
> **目标**：4 个超大型文件（`system.ts` 1822 / `dbService.ts` 1396 / `eraDevice.ts` 1410 / `worldbook.ts` 1245）全部 ≤ 600 行

---

## 背景与目标

### 背景

Phase 0 实测仍存在的 4 个超大型文件承担过多职责，导致：

- **改动痛点**：修改任一字段需在 1000+ 行中翻找，PR 经常跨越无关代码
- **测试阻塞**：单文件包含多种 domain，难以针对性写单元测试（影响 Phase 5）
- **循环依赖温床**：超大文件容易同时 import 多个领域类型，孕育 TDZ
- **代码 review 效率低**：reviewer 需在长文件中反复 scroll

### 目标

1. 4 个目标文件全部 ≤ 600 行
2. 拆分后用 `madge --circular` 验证无新增循环依赖
3. 拆分后用 `ts-prune --error` 验证无新增死代码
4. `size-limit` 3 budget 仍 ≥ 80% 余量
5. 存档、API、UI 100% 兼容（barrel export 保持对外 API 不变）
6. `madge` / `ts-prune` / `size-limit` / Playwright 4 个验证环节全绿

### 范围外

- 不做文件级功能改造（仅结构调整）
- 不删除任何 API（即使看起来无用）
- 不修改 IndexedDB schema 字段名（仅迁移函数边界）

---

## 涉及文件

### system.ts 拆分（Day 31-35）

| 新文件 | 职责 | 预估行数 |
|---|---|---|
| `models/system/index.ts` | barrel re-export（保持外部 import 路径） | ~50 |
| `models/system/types.ts` | 全部 interface / type alias | ~250 |
| `models/system/api-config.ts` | `接口配置类型` 及其默认值 | ~300 |
| `models/system/ui-settings.ts` | 视觉/界面相关配置 | ~250 |
| `models/system/game-config.ts` | 游戏逻辑开关（NSFW 模式等） | ~200 |
| `models/system/memory-config.ts` | 记忆系统配置 | ~200 |
| `models/system/visual-config.ts` | 主题/字体/动画 | ~200 |
| `models/system.ts`（**保留**） | 仅 re-export from `./system/index.ts`（兼容旧 import） | ~10 |

### dbService.ts 拆分（Day 36-39）

| 新文件 | 职责 | 预估行数 |
|---|---|---|
| `dbService/index.ts` | barrel re-export | ~50 |
| `dbService/schema.ts` | IndexedDB schema 定义、版本号、迁移路径 | ~150 |
| `dbService/stores.ts` | 各 store 的 CRUD 通用方法 | ~300 |
| `dbService/migrations.ts` | 版本升级迁移函数 | ~250 |
| `dbService/image-assets.ts` | 图片资产存取 | ~250 |
| `dbService/save-archive.ts` | 存档管理（save/load/list/delete） | ~300 |
| `dbService/transactions.ts` | IndexedDB 事务封装 | ~150 |
| `dbService.ts`（**保留**） | re-export from `./dbService/index.ts` | ~10 |

### worldbook.ts 拆分（Day 40-42）

| 新文件 | 职责 | 预估行数 |
|---|---|---|
| `utils/worldbook/index.ts` | barrel re-export | ~30 |
| `utils/worldbook/types.ts` | Worldbook 条目类型、匹配规则类型 | ~150 |
| `utils/worldbook/parser.ts` | 解析 AI 输出的 worldbook 更新 | ~350 |
| `utils/worldbook/matcher.ts` | 条目匹配算法（关键词/正则/上下文） | ~400 |
| `utils/worldbook/serializer.ts` | 序列化/反序列化 | ~250 |
| `utils/worldbook.ts`（**保留**） | re-export | ~10 |

### eraDevice.ts 拆分（Day 43-45）

| 新文件 | 职责 | 预估行数 |
|---|---|---|
| `models/eraDevice/index.ts` | barrel re-export | ~30 |
| `models/eraDevice/types.ts` | 纪元设备类型、属性类型 | ~200 |
| `models/eraDevice/devices.ts` | 各纪元设备定义（7 个 epoch） | ~500 |
| `models/eraDevice/props.ts` | 设备属性/可交互项 | ~300 |
| `models/eraDevice/presets.ts` | 设备预设（开局/剧情触发） | ~250 |
| `models/eraDevice.ts`（**保留**） | re-export | ~10 |

---

## 技术方案

### 通用拆分模式（4 个文件复用）

**Step 1：抽离 types → `types.ts`**
- 提取所有 `interface` / `type` 到独立 `types.ts`
- 命名规则：保留原命名（如 `接口配置类型`），不强行改名

**Step 2：按职责切分函数**
- 一个领域一个文件（`api-config.ts` / `ui-settings.ts` / ...）
- 函数跨领域时，迁移到**调用方最多**的那个文件

**Step 3：建 barrel `index.ts`**
```ts
// models/system/index.ts
export * from './types';
export * from './api-config';
export * from './ui-settings';
export * from './game-config';
export * from './memory-config';
export * from './visual-config';
```

**Step 4：原文件改为 re-export shim**
```ts
// models/system.ts（兼容层）
export * from './system/index';
```

**Step 5：跑验证四件套**
```bash
npx tsc --noEmit                            # 类型检查
npx madge --circular --extensions ts,tsx .  # 循环依赖
npx ts-prune --error                        # 死代码
npm run build && npx size-limit             # bundle 大小
```

### 拆分原则

1. **先抽 types，再切函数** — types 独立后函数边界更清晰
2. **barrel 必须存在** — 避免业务模块被迫改 import 路径
3. **原文件 re-export** — 兼容期 ≥ 1 个 release，确认无引用后可删
4. **不删 API** — 即使某 export 看起来无用，保留以防下游依赖
5. **拆完不增 bundle** — `size-limit` 阈值不变，chunk 数量上限 50

### 验证矩阵（每个文件拆完后必跑）

| 检查 | 命令 | 预期 |
|---|---|---|
| 类型 | `npx tsc --noEmit -p tsconfig.core.json` | 退出码 0 |
| 循环 | `npx madge --circular --extensions ts,tsx .` | 无新增环 |
| 死代码 | `npx ts-prune --error` | 退出码 0 |
| Bundle | `npm run build && npx size-limit` | 3 budget 全过 |
| 存档读档 | Playwright `archive-readwrite.spec.ts` | 通过 |
| 开局 | Playwright `opening-flow.spec.ts` | 通过 |
| 故事推进 | Playwright `story-progression.spec.ts` | 通过 |

### 与 Phase 2 衔接

- **强依赖**：P3 拆分的"先抽 types"步骤依赖 P2 strict 类型系统暴露出的真实字段类型
- **互不阻塞**：P3 不修改任何函数实现，仅重组 import 边界，因此 P2 的 strict 旗标不会因 P3 而产生新错误
- **回归窗口**：每个文件拆完必须等 P2 L1 错误数稳定 1 天后再继续，避免改动叠加

---

## 实施步骤

> 步骤粒度遵循 writing-plans skill：每步 2-5 分钟，可独立验证，可提交。

### Day 31-35：拆分 `models/system.ts`（1822 → 7 个 ≤ 600 行文件）

#### Day 31：抽 types + 建 barrel

- [ ] **Step 1：建立 `models/system/` 目录**

```bash
mkdir -p models/system
```

- [ ] **Step 2：创建 `models/system/types.ts`**

把所有 `interface` 和 `type` 从 `models/system.ts` 剪切到此文件。命名保留原样（如 `接口配置类型`、`记忆配置类型`）。

预期：types.ts ~250 行。

- [ ] **Step 3：创建 `models/system/index.ts` barrel**

```ts
export * from './types';
```

仅导出 types（其余文件 Day 32-35 逐步加入）。

- [ ] **Step 4：建原文件 re-export shim**

修改 `models/system.ts`：

```ts
export * from './system/index';
```

- [ ] **Step 5：跑类型检查**

```bash
npx tsc --noEmit -p tsconfig.core.json
```

预期：退出码 0（仅导出变化，业务 import 不变）。

- [ ] **Step 6：提交**

```bash
git add models/system/types.ts models/system/index.ts models/system.ts
git commit -m "refactor(system): 抽离 types 到 models/system/types.ts（Day 31）"
```

#### Day 32：拆 api-config + ui-settings

- [ ] **Step 1：创建 `models/system/api-config.ts`**

把 `models/system.ts` 中所有与 API 配置相关的常量、函数、默认值迁移到此文件。函数包括 `normalizeApiConfig`、`getDefaultApiConfig`、`validateApiKey` 等。

预估 ~300 行。

- [ ] **Step 2：创建 `models/system/ui-settings.ts`**

迁移 UI 相关设置：主题色、字体、布局相关。

预估 ~250 行。

- [ ] **Step 3：更新 `models/system/index.ts`**

```ts
export * from './types';
export * from './api-config';
export * from './ui-settings';
```

- [ ] **Step 4：跑验证四件套**

```bash
npx tsc --noEmit -p tsconfig.core.json
npx madge --circular --extensions ts,tsx .
npx ts-prune --error
npm run build
```

预期：全绿。

- [ ] **Step 5：测量 `models/system.ts` 剩余行数**

```bash
wc -l models/system.ts
```

预期：≤ 1000 行（已减少 500+）。

- [ ] **Step 6：提交**

```bash
git add models/system/api-config.ts models/system/ui-settings.ts models/system/index.ts
git commit -m "refactor(system): 拆 api-config + ui-settings 到 models/system/（Day 32）"
```

#### Day 33：拆 game-config + memory-config

- [ ] **Step 1：创建 `models/system/game-config.ts`**

迁移游戏逻辑开关：`启用NSFW模式`、`难度等级`、`启用气运系统` 等。

预估 ~200 行。

- [ ] **Step 2：创建 `models/system/memory-config.ts`**

迁移记忆系统配置：上下文窗口、记忆衰减、摘要策略。

预估 ~200 行。

- [ ] **Step 3：更新 `models/system/index.ts`**

```ts
export * from './types';
export * from './api-config';
export * from './ui-settings';
export * from './game-config';
export * from './memory-config';
```

- [ ] **Step 4：跑验证四件套**

预期：全绿。

- [ ] **Step 5：测量 `models/system.ts` 剩余行数**

预期：≤ 200 行（仅剩少量共享函数 + re-export shim）。

- [ ] **Step 6：提交**

```bash
git add models/system/game-config.ts models/system/memory-config.ts models/system/index.ts
git commit -m "refactor(system): 拆 game-config + memory-config（Day 33）"
```

#### Day 34：拆 visual-config + 清理 system.ts 残余

- [ ] **Step 1：创建 `models/system/visual-config.ts`**

迁移视觉/主题相关：字体、动画速度、背景透明度、纪元主题切换。

预估 ~200 行。

- [ ] **Step 2：检查 `models/system.ts` 残余**

如果仍有 > 50 行业务代码，按职责继续拆；否则保留 re-export shim。

- [ ] **Step 3：最终 barrel 更新**

```ts
// models/system/index.ts
export * from './types';
export * from './api-config';
export * from './ui-settings';
export * from './game-config';
export * from './memory-config';
export * from './visual-config';
```

- [ ] **Step 4：跑完整验证矩阵**

```bash
npx tsc --noEmit -p tsconfig.core.json
npx madge --circular --extensions ts,tsx .
npx ts-prune --error
npm run build && npx size-limit
```

预期：全绿。

- [ ] **Step 5：测量所有新文件**

```bash
wc -l models/system/*.ts
```

预期：每个 ≤ 600 行。

- [ ] **Step 6：跑 Playwright 核心场景**

```bash
npx playwright test archive-readwrite.spec.ts opening-flow.spec.ts story-progression.spec.ts
```

预期：全通过。

- [ ] **Step 7：提交（Day 34 收口）**

```bash
git add models/system/ models/system.ts
git commit -m "refactor(system): 拆 visual-config + system.ts 拆分完成（1822 → 7 个 ≤ 600 行）"
```

#### Day 35：手动回归 + 记录

- [ ] **Step 1：手动测试 7 个纪元开局**

每个纪元分别走一遍开局流程，确保 API 配置、视觉设置、游戏配置、记忆配置均正确加载。

- [ ] **Step 2：导出/导入存档**

- 创建存档 → 退出 → 重新载入 → 验证字段一致
- 覆盖 7 个纪元 × 1 个 = 7 次

- [ ] **Step 3：记录 system.ts 拆分结果**

更新 `docs/technical/02-state-modularization.md` 或新建子章节，记录拆分前后文件结构对比。

- [ ] **Step 4：归档 commit log**

```bash
git log --oneline -- models/system/ | tee /tmp/system-split-log.txt
```

- [ ] **Step 5：提交（Day 35 收口）**

```bash
git add docs/technical/02-state-modularization.md
git commit -m "docs(technical): 记录 system.ts 拆分前后对比（1822 → 7 文件）"
```

### Day 36-39：拆分 `dbService.ts`（1396 → 7 个 ≤ 600 行文件）

> 警告：dbService 涉及 IndexedDB 事务边界，**先冻结 schema**。所有迁移前跑一次现有 schema dump 留底。

#### Day 36：冻结 schema + 抽 types

- [ ] **Step 1：备份当前 schema**

```bash
npx tsx scripts/dump-indexeddb-schema.ts > /tmp/db-schema-before-split.json
git add /tmp/db-schema-before-split.json 2>/dev/null || true
```

- [ ] **Step 2：建立 `dbService/` 目录**

```bash
mkdir -p dbService
```

- [ ] **Step 3：创建 `dbService/schema.ts`**

迁移 `CURRENT_SCHEMA_VERSION`、所有 store 定义、索引列表。

预估 ~150 行。

- [ ] **Step 4：创建 `dbService/types.ts`**

迁移 `SaveRecord`、`ImageAssetRecord`、迁移路径类型等。

预估 ~200 行。

- [ ] **Step 5：建 `dbService/index.ts` barrel**

```ts
export * from './schema';
export * from './types';
```

- [ ] **Step 6：原 `dbService.ts` 改为 re-export**

```ts
export * from './dbService/index';
```

- [ ] **Step 7：跑存档读档回归**

```bash
npx playwright test archive-readwrite.spec.ts
```

预期：全通过（schema 未变）。

- [ ] **Step 8：提交**

```bash
git add dbService/schema.ts dbService/types.ts dbService/index.ts dbService.ts
git commit -m "refactor(db): 抽 schema + types 到 dbService/（Day 36，schema 冻结）"
```

#### Day 37：拆 stores + transactions

- [ ] **Step 1：创建 `dbService/transactions.ts`**

迁移 `withTransaction`、`withReadonlyTransaction` 等事务封装。

预估 ~150 行。

- [ ] **Step 2：创建 `dbService/stores.ts`**

迁移各 store 的通用 CRUD：`getAll`、`getById`、`put`、`delete`、`bulkPut`。

预估 ~300 行。

- [ ] **Step 3：更新 barrel**

```ts
export * from './schema';
export * from './types';
export * from './transactions';
export * from './stores';
```

- [ ] **Step 4：跑验证四件套**

```bash
npx tsc --noEmit
npx madge --circular --extensions ts,tsx .
npx ts-prune --error
npm run build
```

预期：全绿。

- [ ] **Step 5：测量 `dbService.ts` 剩余行数**

```bash
wc -l dbService.ts
```

预期：≤ 800 行（已减少 600+）。

- [ ] **Step 6：提交**

```bash
git add dbService/transactions.ts dbService/stores.ts dbService/index.ts
git commit -m "refactor(db): 拆 transactions + stores（Day 37）"
```

#### Day 38：拆 migrations + image-assets

- [ ] **Step 1：创建 `dbService/migrations.ts`**

迁移所有版本升级函数：`migrate_v1_to_v2`、`migrate_v2_to_v3` 等。

预估 ~250 行。

- [ ] **Step 2：创建 `dbService/image-assets.ts`**

迁移图片资产存取：`saveImageAsset`、`getImageAssetByHash`、`deleteOrphanImages`。

预估 ~250 行。

- [ ] **Step 3：更新 barrel**

```ts
export * from './schema';
export * from './types';
export * from './transactions';
export * from './stores';
export * from './migrations';
export * from './image-assets';
```

- [ ] **Step 4：跑存档读档 + 7 纪元开局回归**

```bash
npx playwright test archive-readwrite.spec.ts opening-flow.spec.ts
```

预期：全通过。

- [ ] **Step 5：测量 `dbService.ts` 剩余行数**

预期：≤ 200 行。

- [ ] **Step 6：提交**

```bash
git add dbService/migrations.ts dbService/image-assets.ts dbService/index.ts
git commit -m "refactor(db): 拆 migrations + image-assets（Day 38）"
```

#### Day 39：拆 save-archive + 清理 + 验证

- [ ] **Step 1：创建 `dbService/save-archive.ts`**

迁移 `save`、`load`、`list`、`delete`、`exportSave`、`importSave`。

预估 ~300 行。

- [ ] **Step 2：更新 barrel（最终）**

```ts
export * from './schema';
export * from './types';
export * from './transactions';
export * from './stores';
export * from './migrations';
export * from './image-assets';
export * from './save-archive';
```

- [ ] **Step 3：跑完整验证矩阵**

```bash
npx tsc --noEmit
npx madge --circular --extensions ts,tsx .
npx ts-prune --error
npm run build && npx size-limit
npx playwright test archive-readwrite.spec.ts opening-flow.spec.ts story-progression.spec.ts
```

预期：全绿。

- [ ] **Step 4：测量所有新文件**

```bash
wc -l dbService/*.ts dbService.ts
```

预期：每个 ≤ 600 行，`dbService.ts` 仅 ~10 行 re-export。

- [ ] **Step 5：手动测 5 个老存档（覆盖 7 个纪元）**

- 加载 `archive-ancient.json`、`archive-medieval.json`、`archive-modern.json`、`archive-future.json`、`archive-cosmic.json`
- 验证字段一致、无报错

- [ ] **Step 6：迁移脚本占位**

创建 `dbService/migrations/2026-06-06-phase3-split.ts`，内容为占位（不实际迁移，因为 schema 没变）：

```ts
// Phase 3 拆分占位迁移脚本
// 拆分未改 schema，所以此脚本为 noop
// 保留此文件作为后续 schema 变更时的迁移模板
export const phase3_split_marker = 'phase3-split-2026-06-06';
```

- [ ] **Step 7：提交（Day 39 收口）**

```bash
git add dbService/ dbService.ts
git commit -m "refactor(db): 拆 save-archive 完成（1396 → 7 个 ≤ 600 行）+ 5 老存档回归"
```

### Day 40-42：拆分 `utils/worldbook.ts`（1245 → 5 个 ≤ 600 行文件）

#### Day 40：抽 types + 拆 parser

- [ ] **Step 1：建立 `utils/worldbook/` 目录**

```bash
mkdir -p utils/worldbook
```

- [ ] **Step 2：创建 `utils/worldbook/types.ts`**

迁移 `WorldbookEntry`、`WorldbookUpdate`、`MatchRule` 等类型。

预估 ~150 行。

- [ ] **Step 3：创建 `utils/worldbook/parser.ts`**

迁移解析 AI 输出的 `parseWorldbookUpdate`、`extractEntriesFromText` 等。

预估 ~350 行。

- [ ] **Step 4：建 barrel + re-export shim**

```ts
// utils/worldbook/index.ts
export * from './types';
export * from './parser';

// utils/worldbook.ts
export * from './worldbook/index';
```

- [ ] **Step 5：跑类型 + Playwright 回归**

```bash
npx tsc --noEmit
npx playwright test story-progression.spec.ts
```

预期：全通过（worldbook 在故事推进中被调用）。

- [ ] **Step 6：提交**

```bash
git add utils/worldbook/types.ts utils/worldbook/parser.ts utils/worldbook/index.ts utils/worldbook.ts
git commit -m "refactor(worldbook): 抽 types + 拆 parser（Day 40）"
```

#### Day 41：拆 matcher

- [ ] **Step 1：创建 `utils/worldbook/matcher.ts`**

迁移 `matchEntry`、`evaluateRule`、`scoreEntry` 等匹配算法。

预估 ~400 行（最复杂的一块）。

- [ ] **Step 2：更新 barrel**

```ts
export * from './types';
export * from './parser';
export * from './matcher';
```

- [ ] **Step 3：跑验证四件套**

预期：全绿。

- [ ] **Step 4：测量 `utils/worldbook.ts` 剩余行数**

预期：≤ 600 行（matcher 拆完后剩 serializer）。

- [ ] **Step 5：提交**

```bash
git add utils/worldbook/matcher.ts utils/worldbook/index.ts
git commit -m "refactor(worldbook): 拆 matcher（Day 41）"
```

#### Day 42：拆 serializer + 清理

- [ ] **Step 1：创建 `utils/worldbook/serializer.ts`**

迁移 `serializeEntries`、`deserializeEntries`、`toJSON`、`fromJSON`。

预估 ~250 行。

- [ ] **Step 2：更新 barrel（最终）**

```ts
export * from './types';
export * from './parser';
export * from './matcher';
export * from './serializer';
```

- [ ] **Step 3：跑完整验证矩阵**

```bash
npx tsc --noEmit
npx madge --circular --extensions ts,tsx .
npx ts-prune --error
npm run build && npx size-limit
npx playwright test
```

预期：全绿。

- [ ] **Step 4：测量所有新文件**

```bash
wc -l utils/worldbook/*.ts utils/worldbook.ts
```

预期：每个 ≤ 600 行。

- [ ] **Step 5：提交（Day 42 收口）**

```bash
git add utils/worldbook/serializer.ts utils/worldbook/index.ts
git commit -m "refactor(worldbook): 拆 serializer 完成（1245 → 5 个 ≤ 600 行）"
```

### Day 43-45：拆分 `models/eraDevice.ts`（1410 → 5 个 ≤ 600 行文件）

#### Day 43：抽 types + 拆 devices

- [ ] **Step 1：建立 `models/eraDevice/` 目录**

```bash
mkdir -p models/eraDevice
```

- [ ] **Step 2：创建 `models/eraDevice/types.ts`**

迁移 `EraDevice`、`DeviceProp`、`DevicePreset` 等类型。

预估 ~200 行。

- [ ] **Step 3：创建 `models/eraDevice/devices.ts`**

迁移 7 个纪元的设备定义。

预估 ~500 行（最大文件）。

- [ ] **Step 4：建 barrel + re-export shim**

```ts
// models/eraDevice/index.ts
export * from './types';
export * from './devices';

// models/eraDevice.ts
export * from './eraDevice/index';
```

- [ ] **Step 5：跑类型 + 7 纪元开局回归**

```bash
npx tsc --noEmit
npx playwright test opening-flow.spec.ts
```

预期：全通过。

- [ ] **Step 6：提交**

```bash
git add models/eraDevice/types.ts models/eraDevice/devices.ts models/eraDevice/index.ts models/eraDevice.ts
git commit -m "refactor(eraDevice): 抽 types + 拆 devices（Day 43）"
```

#### Day 44：拆 props + presets

- [ ] **Step 1：创建 `models/eraDevice/props.ts`**

迁移设备属性/可交互项定义。

预估 ~300 行。

- [ ] **Step 2：创建 `models/eraDevice/presets.ts`**

迁移设备预设（开局默认 / 剧情触发）。

预估 ~250 行。

- [ ] **Step 3：更新 barrel**

```ts
export * from './types';
export * from './devices';
export * from './props';
export * from './presets';
```

- [ ] **Step 4：跑验证四件套**

预期：全绿。

- [ ] **Step 5：测量 `models/eraDevice.ts` 剩余行数**

预期：≤ 100 行（基本只剩 re-export）。

- [ ] **Step 6：提交**

```bash
git add models/eraDevice/props.ts models/eraDevice/presets.ts models/eraDevice/index.ts
git commit -m "refactor(eraDevice): 拆 props + presets（Day 44）"
```

#### Day 45：清理 + 总验证

- [ ] **Step 1：检查 `models/eraDevice.ts`**

如果仍有业务代码，按职责继续拆；否则保留 ~10 行 re-export shim。

- [ ] **Step 2：跑完整验证矩阵**

```bash
npx tsc --noEmit
npx madge --circular --extensions ts,tsx .  # 退出码 0
npx ts-prune --error                        # 退出码 0
npm run build && npx size-limit             # 3 budget 全过
npx playwright test                         # 3 核心场景全通过
```

预期：全绿。

- [ ] **Step 3：测量所有目标文件**

```bash
echo "=== system ==="
wc -l models/system/*.ts models/system.ts
echo "=== dbService ==="
wc -l dbService/*.ts dbService.ts
echo "=== worldbook ==="
wc -l utils/worldbook/*.ts utils/worldbook.ts
echo "=== eraDevice ==="
wc -l models/eraDevice/*.ts models/eraDevice.ts
```

预期：每个文件 ≤ 600 行。

- [ ] **Step 4：手动回归 4 场景 × 7 纪元**

- 开局（每纪元 1 次 = 7 次）
- 故事推进（每纪元 1 次 = 7 次）
- 存档读档（每纪元 1 次 = 7 次）
- 跨纪元跳转（1 次）

- [ ] **Step 5：更新 `docs/technical/02-state-modularization.md`**

新增章节"Phase 3 拆分记录"：
- 拆分前后文件大小对比
- 4 个目标文件的行数历史
- 拆分原则与验证矩阵

- [ ] **Step 6：归档 commit log**

```bash
git log --oneline -- models/system/ dbService/ utils/worldbook/ models/eraDevice/ > /tmp/phase3-split-log.txt
```

- [ ] **Step 7：提交（Day 45 收口）**

```bash
git add docs/technical/02-state-modularization.md
git commit -m "docs(technical): Phase 3 大文件拆分完成（4 文件全部 ≤ 600 行）+ 拆分记录"
```

---

## 验收标准（P3 完成）

- [ ] 4 个目标文件全部 ≤ 600 行
  - [ ] `models/system.ts` ≤ 600 行（原 1822）
  - [ ] `dbService.ts` ≤ 600 行（原 1396）
  - [ ] `utils/worldbook.ts` ≤ 600 行（原 1245）
  - [ ] `models/eraDevice.ts` ≤ 600 行（原 1410）
- [ ] 无新增循环依赖（`madge --circular` 退出码 0）
- [ ] 无新增死代码（`ts-prune --error` 退出码 0）
- [ ] `size-limit` 3 budget 仍 ≥ 80% 余量
- [ ] 手动回归：开局 / 故事推进 / 存档读档 / 跨纪元跳转 4 个核心场景无回归
- [ ] Playwright 3 个核心流程测试通过
- [ ] 5 个老存档读档兼容
- [ ] `docs/technical/02-state-modularization.md` 已新增拆分记录章节
- [ ] 原 `system.ts` / `dbService.ts` / `worldbook.ts` / `eraDevice.ts` 全部保留为 re-export shim

---

## 风险与依赖

| ID | 风险 | 等级 | 缓解 |
|---|---|---|---|
| R1 | 拆分 `system.ts` 影响 ~80% 业务模块 import 路径 | HIGH | 保留 `models/system.ts` re-export；用 codemod 批量迁移后保留兼容层 |
| R2 | 拆分 `dbService.ts` 改了 IndexedDB 事务边界，影响存档读档 | HIGH | Day 36 先冻结 schema；用 5 个老存档（覆盖 7 个纪元）做读档回归；新增 `phase3-split-marker` 占位迁移 |
| R3 | 拆分后行数反弹（不自觉又堆回 1000+ 行） | LOW | size-limit 阈值（> 800 行 CI 报警）；ESLint `max-lines` 规则 |
| R4 | 拆分中误删 API | MEDIUM | 拆分前用 `ts-prune` 列出所有 export 清单；拆完对比，确保 0 缺失 |
| R5 | `madge` 暴露原有循环依赖（拆分未引入新的） | MEDIUM | 不视为 P3 失败；记录到 P4（下一轮 60 天）处理 |
| R6 | chunk 数膨胀（cache 命中率下降） | LOW | 监控 chunk 数量，> 50 合并；保留 vendor 6 块 + runtime 5 块 + settings 5 块为上限 |

### 依赖

- **强依赖**：Phase 2 strict 类型系统（已完成 Day 1-30）
- **现有工具**：madge、ts-prune（Phase 0 已装）、Playwright（项目已配）
- **团队**：15 天需要 1-2 人持续投入，Day 36-39 dbService 期间需专注

---

## 与下一阶段衔接

- **P5 测试体系**（Day 46-60）依赖：本计划拆分的 `system/` `dbService/` `worldbook/` `eraDevice/` 边界清晰，单元测试可针对每个文件写
- **下轮 P4 循环依赖解耦**：本计划 `madge` 验证中暴露的所有原有循环依赖（即使非本计划引入）需记录到 `docs/technical/14-optimization-roadmap-v2.md` 留给 P4
- **下轮 P1 文档归一化**：本计划产生的 `/tmp/system-split-log.txt` `/tmp/phase3-split-log.txt` 临时文件需在文档归一化阶段清理或归档

---

## 参考文档

- 父路线图：[2026-06-06-project-optimization-roadmap-v2-design](../../superpowers/specs/2026-06-06-project-optimization-roadmap-v2-design.md)
- v1.0 总体路线图：[2026-06-03-project-optimization](../2026-06-03-project-optimization.md)
- 前置：Phase 2 — TS 严格度分层：[2026-06-06_phase2-ts-strict-layered](./2026-06-06_phase2-ts-strict-layered.md)
- 性能与模块化（已闭环）：[13b-performance-modularization](../../technical/13b-performance-modularization.md)
- State 模块化：[02-state-modularization](../../technical/02-state-modularization.md)
- 测试策略：[11-testing-strategy](../../technical/11-testing-strategy.md)
- 错误处理：[12-error-handling](../../technical/12-error-handling.md)
- 项目规则：`/home/fz/.claude/rules/common/testing.md`（TDD/AAA 模式）
