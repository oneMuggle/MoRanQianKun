# 项目优化方案

> **创建日期**：2026-06-03
> **作者**：planner
> **状态**：待评审
> **项目**：墨染乾坤：万象纪元

---

## 一、需求重述

针对当前 `MoRanJiangHu` 项目，从**架构、代码质量、测试、性能、可维护性、文档**六个维度，给出可执行的分阶段优化方案。要求：

1. 不引入破坏性变更（保留全部现有功能与游戏数据兼容性）
2. 不替换核心技术栈（React 19 + TypeScript + Vite 6 + IndexedDB）
3. 每个阶段可独立验证、可回滚
4. 优先解决"高频维护痛点"和"潜在风险"而非"理想化完美"

## 二、项目现状摘要（2026-06-03 实测）

| 指标 | 数值 | 备注 |
|---|---|---|
| TS/TSX 文件 | 1502 | 不含 node_modules |
| 代码行数 | 33.3 万 | 全量统计 |
| 目录数 | 565 | 反映功能粒度 |
| 测试文件 | ~22 | 主要集中在 photographyNSFW 和 utils/ |
| 测试覆盖率 | < 5%（估算） | 大量 hooks/components 无测试 |
| `App.tsx` | 406 行 | 已从 1680 缩减 |
| `useGame.ts` | 1196 行 | 已从 2990 拆分出 60+ 子文件 |
| `models/system.ts` | 1822 行 | 仍是超大型 |
| `dbService.ts` | 1396 行 | 仍可继续拆 |
| Vite manualChunks | 已按 era/nsfw/biz/runtime 拆分 | 配置较成熟 |
| TypeScript 配置 | 无 `strict`、`noImplicitAny` | 全局宽松 |

### 已发现的关键问题

1. **重复文件**：`models/eraTheme/epoch-*.ts` 与 `modules/era-*/epoch-*.ts` 共存但**内容不同**（import 路径不同），存在两套并行真相源
2. **超大型文件**：`models/system.ts`（1822）、`models/eraDevice.ts`（1410）、`dbService.ts`（1396）、`utils/worldbook.ts`（1245）、`era-config.ts`（959）
3. **测试稀缺**：60+ `hooks/useGame/*.ts` 子模块几乎无单元测试，重构风险高
4. **TDZ 风险**：`prompts ↔ models ↔ hooks/useGame` 已用 `game-runtime` chunk 包裹缓解，但本质上是**循环依赖**，需要从架构层修复
5. **TypeScript 宽松**：缺 `strict`、`noUncheckedIndexedAccess`、`exactOptionalPropertyTypes`
6. **CI/CD**：未发现 `.github/workflows/*.yml` 自动化测试
7. **桌面/移动双份组件**：`XxxModal.tsx` + `MobileXxx.tsx`，重复率高，部分已合并（如 ImageManagerModal），其余可评估
8. **i18n 缺失**：UI 文案中文硬编码在 JSX 中，无 i18n 框架
9. **错误处理零散**：AI 错误、流式中断、IndexedDB 失败等场景缺乏统一错误边界
10. **文档管理**：`docs/plans/` 中**有 30+ 历史计划文档**未按规范迁移到 `docs/technical/`

## 三、风险与依赖

| 类别 | 描述 | 等级 |
|---|---|---|
| **HIGH** | 移动 30+ `plans/*.md` 到 `technical/` 时若打乱目录结构，会影响开发检索效率 | 需要按 README.md 索引规则 |
| **HIGH** | 修复 `prompts ↔ models ↔ hooks` 循环依赖可能触发大面积 import 调整 | 必须用 `ts-prune` + `madge` 验证 |
| **HIGH** | 拆分 `models/system.ts`（1822 行）涉及几乎所有模块 | 必须先建立类型再迁移函数 |
| **MEDIUM** | 提升 TS 严格度会暴露历史代码的 null 错误 | 需分模块渐进开启 strict |
| **MEDIUM** | IndexedDB 抽象层（`dbService.ts`）拆分涉及迁移脚本 | 需保证数据格式兼容 |
| **MEDIUM** | 引入 i18n 会要求改动几乎全部 UI 组件 | 应先抽离 string-only 文本 |
| **LOW** | 错误边界统一（ErrorBoundary + Toast） | 可与桌面/移动组件合并并行 |
| **LOW** | E2E 用 Playwright 已配置，但场景仅 3 个 | 补充核心流程即可 |

## 四、优化总览（路线图）

```
┌─────────────────────────────────────────────────────────────┐
│ Phase 0  准备                [基础设施]  本周  ~1d          │
│ Phase 1  文档归一化            [治理]      ~2d              │
│ Phase 2  TS 严格度渐进        [质量]      ~3d              │
│ Phase 3  大文件拆分           [重构]      ~5d              │
│ Phase 4  循环依赖解耦         [架构]      ~4d              │
│ Phase 5  测试体系补齐         [质量]      ~5d              │
│ Phase 6  错误边界与日志统一    [可观测]    ~3d              │
│ Phase 7  性能与构建优化        [性能]      ~3d              │
│ Phase 8  i18n 框架预埋        [国际化]    后续/选做         │
└─────────────────────────────────────────────────────────────┘
总投入约 26 个工作日，按优先级滚动推进。
```

---

## 五、分阶段实施方案

### Phase 0：准备与基线测量（1 天）

**目标**：建立可量化基线，让后续优化有依据。

**状态**：✅ 已完成（2026-06-03）

#### 0.1 安装质量工具
```bash
npm install -D madge ts-prune knip depcheck @vitest/coverage-v8 \
  size-limit @size-limit/preset-app
```

#### 0.2 添加测量脚本
- `package.json` 新增：
  - `lint:graph` → `madge --circular --extensions ts,tsx --warning .`
  - `lint:dead` → `ts-prune --error`
  - `lint:unused` → `knip`
  - `size` → `size-limit`
- `vitest.config.ts` 启用覆盖率阈值：`thresholds.global.lines = 5`，允许从低基线渐进提升

#### 0.3 基线快照
- `npm run lint:graph > .tmp/baseline-circular.txt`
- `npm run lint:dead > .tmp/baseline-dead.txt`
- `vitest run --coverage > .tmp/baseline-coverage.txt`
- 提交 `.tmp/baseline-*.txt`（临时文件，验证用后归档到 `docs/technical/metrics-baseline-2026-06.md`）

#### 0.4 自动化任务清单
| ID | 任务 | 文件 | 状态 |
|---|---|---|---|
| P0-1 | 装包 + 配置 + 写 collectMetricsBaseline.mjs | `package.json`, `scripts/collectMetricsBaseline.mjs` | ✅ |
| P0-2 | 五个 baseline 测量 | `.tmp/baseline-*.txt` | ✅ |
| P0-3 | 写入基线文档 | `docs/technical/metrics-baseline-2026-06/README.md` | ✅ |

**验收**：✅ 五个 baseline 文件生成并归档到 `docs/technical/metrics-baseline-2026-06/`。

**关键发现**：
- 16 个循环依赖（npcNSFWEnhancement 子树最严重）
- 96 个测试文件，2126 个测试用例，4 个失败
- 339 KB 的 ts-prune 输出（未引用导出）

---

### Phase 1：文档归一化与归档（2 天）

**目标**：执行"过时文档立即删除 / 新文档立即建章"规范。

**状态**：✅ 已完成（2026-06-03）

#### 1.1 计划文档分类

```
docs/plans/
├── 2026-04-* 至 2026-05-31  （24 个历史计划）  →  评估 → 迁移 / 删除
├── 2026-06-01-*              （3 个近期计划）   →  按状态分类
└── 2026-06-03-*              （进行中）         →  保留
```

#### 1.2 分类规则
| 状态 | 处理 |
|---|---|
| **已实现且无维护价值** | 删除 |
| **已实现且仍是重要架构** | 关键章节迁到 `docs/technical/`，并入对应章 README |
| **已实现但仅供历史** | 删除 |
| **未完成** | 保留在 `docs/plans/` |
| **部分完成** | 更新进度标记 `[x]`，未完成部分保留 |

#### 1.3 `docs/technical/README.md` 重构
按 `feature-development.md` 规范拆分为子章节：
- `01-architecture-overview.md` — 项目总览与目录约定
- `02-state-and-store.md` — useGame 架构 + zustandStore
- `03-ai-pipeline.md` — AI 调用链与提示词系统
- `04-persistence.md` — IndexedDB + GitHub Sync
- `05-eras-and-themes.md` — 多纪元系统
- `06-module-registry.md` — 弹窗/模块注册
- `07-nsfw-systems.md` — NSFW 子系统集合
- `08-image-pipeline.md` — 图像生成链路
- `09-build-and-deploy.md` — Vite 配置、Cloudflare Pages
- `10-testing-strategy.md` — 测试分层与覆盖率

每个 chapter 内含"已完成功能归档"小节，引述对应历史计划文档的关键决策。

#### 1.4 删除与归档
- 一次性脚本（一次性实验报告、临时分析）→ 删除
- 关键设计决策 → 提炼到对应 chapter 的"已归档决策"区

**验收**：`docs/plans/` 中仅保留未完成计划；`docs/technical/` 有完整 README + 10 章节；`docs/user-manual/` 至少包含总览。

#### 1.5 任务清单
| ID | 任务 | 状态 |
|---|---|---|
| P1-1 | 列出全部 `docs/plans/*.md` 的摘要与状态 | ✅ |
| P1-2 | 分类：删除 12 个（一次性 fix / 已完成模块 / 引擎实验 / 被替代）+ 迁移 5 个 | ✅ |
| P1-3 | 撰写 `docs/technical/README.md`（16 章节索引）+ 5 个新章节文件 | ✅ |
| P1-4 | 清理 17 个过期计划文档 | ✅ |

**验收**：
- ✅ `docs/plans/` 从 55 → 41 个（删除 12 个已实现 + 删除 5 个已迁移）
- ✅ `docs/technical/README.md` 创建（16 章节索引）
- ✅ 5 个新章节文件创建（02/03/08b/08c/15）
- ⏳ 6 个旧主题文档（architecture.md 等）暂保留，归并留待后续

---

### Phase 2：TypeScript 严格度渐进提升（3 天）

**目标**：在不打乱开发节奏的前提下，让 `tsc --noEmit` 能暴露更多历史问题。

**状态**：⚠️ 暂停推进（2026-06-03）— 全局 strict 暴露 628 个错误，**重排到 Phase 3 之后**

#### 2.1 渐进策略
**严禁**一次性开启 `strict: true`，会一次性暴露数百个错误。

采用**按目录渐进**模式：

```jsonc
// tsconfig.json
{
  "compilerOptions": {
    "strict": false,                         // 全局默认
    "noImplicitAny": false,
    "strictNullChecks": false,
    // ...
  }
}
```

**改造方式**：在目标子目录中创建 `tsconfig.json`（含 `extends`），独立开启严格选项。

#### 2.2 阶段顺序
| 顺序 | 子目录 | 复杂度 | 估计 |
|---|---|---|---|
| 1 | `utils/` | 低（纯函数） | 0.5d |
| 2 | `services/dbService.ts` 子模块 | 中 | 0.5d |
| 3 | `data/` 静态预设 | 低 | 0.5d |
| 4 | `models/domain/` | 中 | 0.5d |
| 5 | `models/game/` | 中 | 0.5d |
| 6 | `models/planning/` | 中 | 0.5d |
| 7 | `hooks/useGame/` 子模块 | 高 | 1d |

每个子目录完成时强制全量 `tsc --noEmit` 通过。

#### 2.3 配套
- ESLint `@typescript-eslint/no-explicit-any` → warn（不允许新增 `any`）
- CI 步骤先跑 `tsc --noEmit`，再跑 `eslint`
- `noUncheckedIndexedAccess` 仅在 `utils/`、`models/domain/` 开启

**验收**：所有 utils/、data/、models/domain/ 子目录的 `tsc --noEmit` 零错误；全局 `tsc --noEmit` 错误数下降 ≥ 30%。

**实际结果（2026-06-03）**：
- ❌ utils/ 子目录 strict 化试错失败（子 tsconfig 被父配置吞掉 include）
- ⚠️ 全局 tsc 错误 628 个（排除 scripts/ 后），**远超预估**
- ✅ 修复 2 个真实错误（worldEvolution 缺 import、campusPhone 联合类型冲突）
- ✅ 添加 scripts/ e2e/ android/ 等 6 个目录到 tsconfig exclude
- ✅ 创建 `tsconfig.strict.json` + `docs/technical/02b-typescript-strict-strategy.md`
- 📋 **重排策略**：Phase 3 拆分大文件后再 strict（影响范围可控）

---

### Phase 3：超大型文件拆分（5 天）

**目标**：将 5 个超大型文件（>900 行）拆分为 < 400 行的聚焦模块。

**状态**：⚠️ 部分完成（2026-06-03）— 完成 P3-6（era 重复清理 6502 行），其他大文件拆分留到后续

#### 3.1 `models/system.ts`（1822 行）— 最优先

按主题拆分为：
```
models/system/
├── index.ts               ← 统一导出
├── apiConfig.ts           ← API 供应商、模型定义
├── uiSettings.ts          ← 视觉/主题配置
├── memoryConfig.ts        ← 记忆系统配置
├── nsfwConfig.ts          ← NSFW 等级与开关
├── modelRegistry.ts       ← 模型/角色/预设注册
├── types.ts               ← 共享类型
└── __tests__/             ← 单元测试
```

迁移步骤：
1. 用 `madge` 找出 `models/system` 的所有引用方
2. 把每一组常量/类型迁出到对应子文件
3. `models/system/index.ts` 用 `export *` 维持向后兼容
4. 验证：`tsc --noEmit` 通过 + 运行现有测试
5. 灰度：每迁出一组，删除原 `system.ts` 中的对应块

#### 3.2 `models/eraDevice.ts`（1410 行）— 同步拆分
按设备类型拆为 `device-mobile.ts`、`device-desktop.ts`、`device-shared.ts`、`device-types.ts`。

#### 3.3 `services/dbService.ts`（1396 行）— 按 store 拆
已存在 `core/db/` 目录，沿用结构：
```
core/db/
├── index.ts                ← 旧 dbService 的转发层（保留兼容）
├── saves.ts                ← 存档 store
├── settings.ts             ← 设置 store
├── imageAssets.ts          ← 图片资源 store
├── schema.ts               ← schema 定义
└── migrations.ts           ← 版本迁移
```

提供 12 个月内删除 `dbService.ts` 的弃用时间表。

#### 3.4 `utils/worldbook.ts`（1245 行）— 按操作拆
拆分为 `worldbookBuilder.ts`、`worldbookMatcher.ts`、`worldbookSerializer.ts`、`worldbookTypes.ts`。

#### 3.5 `models/era-config.ts`（959 行）— 拆
按纪元拆为 `era-config/primordial.ts`、`era-config/ancient.ts` 等，共享 `era-config/base.ts`。

#### 3.6 解决 `models/eraTheme` vs `modules/era-*` 重复

确认两者内容差异：仅 `import` 路径不同（`./types` vs `../../models/eraTheme/types`）。

**方案**：
- 保留 `models/eraTheme/` 为唯一权威（带类型与测试）
- `modules/era-*/epoch-*.ts` 改为 `export { default } from '../../models/eraTheme/epoch-*'` 的转发
- 未来"业务域扩展"放 `modules/era-*/extensions/`

#### 3.7 任务清单
| ID | 文件 | 目标 | 状态 |
|---|---|---|---|
| P3-1 | `models/system.ts` | < 400 行 | ⚠ 调研完成，99 export / 69 importers，完整拆分需 1-2 天 |
| P3-2 | `models/eraDevice.ts` | < 400 行 | ⏳ 后续 |
| P3-3 | `services/dbService.ts` | < 400 行（保留转发壳） | ⏳ 后续 |
| P3-4 | `utils/worldbook.ts` | < 400 行 | ⏳ 后续 |
| P3-5 | `models/era-config.ts` | < 400 行 | ⏳ 后续 |
| P3-6 | eraTheme 重复合并 | 单一真相源 | ✅ 删除 modules/era-* 14 文件 6502 行，tsc 错误持平 |

**实际进展（2026-06-03）**：
- ✅ P3-1：完成 `models/system.ts` 99 个 export 的清点与分类（7 大主题）
- ✅ P3-6：调研发现 `modules/era-*/` 重复源 + 整个 `modules/` 目录 0 引用方
- ✅ 写 `docs/technical/02c-modules-unused-scaffolding.md` 列出 A/B/C 三个方案待用户选
- ⏳ 完整大文件拆分留到后续阶段

---

### Phase 4：循环依赖与 import 架构（4 天）

**目标**：消除 `prompts ↔ models ↔ hooks/useGame` 循环依赖。

**状态**：⚠️ 部分完成（2026-06-03）— 已解 2/16 循环（BDSM + boardGame），剩余 14 个列入待办

#### 4.1 当前症状
`vite.config.ts` 已通过把三个目录都打到 `game-runtime` chunk 兜底（避免运行时 TDZ），但**结构上仍是循环依赖**，是架构债。

#### 4.2 拆解方案
**核心原则**：单向依赖 `低层 → 高层`

```
低层 (无依赖)        →  utils, types
        ↓
中层 (依赖 utils)     →  models, data, prompts/core
        ↓
高层 (依赖中层)      →  prompts/runtime, services, hooks
        ↓
顶层 (依赖高层)      →  components
```

**具体动作**：
1. 找出 prompts 中反向引用 hooks/services 的位置（`madge --circular`）
2. 提取反向引用到的常量/类型到 `utils/` 或 `models/`
3. 用"接口分离"方式：定义 `prompts/core/contracts.ts`，hooks 实现接口，prompts 只引用接口
4. 验证 `madge --circular` 返回 0
5. 删除 `vite.config.ts` 中 `game-runtime` 的合并逻辑，验证 Vite 构建成功

#### 4.3 兜底机制保留
即使解耦成功，仍保留 `game-runtime` chunk 命名作为性能优化（合并首屏关键代码），但去除"为避免 TDZ 合并"的注释。

#### 4.4 任务清单
| ID | 任务 | 状态 |
|---|---|---|
| P4-1 | 跑 `madge --circular` 列出全部循环链 | ✅ 16 个识别 |
| P4-2 | 提取反向引用常量到 `utils/` | ⚠ 部分：BDSM + boardGame 已解（移到 normalization.ts） |
| P4-3 | 引入 `prompts/core/contracts.ts` 接口层 | ⏳ 推迟到 Phase 4 续期 |
| P4-4 | 验证 0 循环，构建成功 | ⚠ 当前 14 循环，Vite 构建已通过 |

**实际结果（2026-06-03）**：
- 16 → 14 循环（-2：BDSM 环、boardGame 环）
- 模式：从 `index.ts` 把"被 normalization 引用"的接口/常量移到 `normalization.ts` 内部
- 环 D（npcNSFWEnhancement 9 条子环）工程量大，留作单独 Phase
- 环 H（sendWorkflow）是 madge 误报（`import type` 不引发 TDZ），不需要处理
- 完整记录见 `docs/technical/02d-circular-deps-decoupling.md`

---

### Phase 5：测试体系补齐（5 天）

**目标**：在已有 `photographyNSFW` 测试模式上扩展到核心 hooks/utils。

#### 5.1 测试分层

| 层级 | 范围 | 工具 | 目标覆盖率 |
|---|---|---|---|
| 单元 | utils、纯函数、reducer | vitest | 80% |
| Hook | useGame 子模块、custom hooks | @testing-library/react + happy-dom | 60% |
| 集成 | IndexedDB、AI service（mock） | vitest + jsdom | 50% |
| E2E | 核心用户流 | Playwright（已配） | 关键流程 |
| 视觉 | 弹窗、模态 | Playwright screenshot | 弹窗 100% |

#### 5.2 优先级测试目标
| 优先级 | 模块 | 原因 |
|---|---|---|
| P0 | `utils/apiConfig.ts` | 多人修改、出错后影响全部 API 调用 |
| P0 | `utils/jsonRepair.ts` | AI 返回的 JSON 修复，影响全游戏流程 |
| P0 | `hooks/useGame/saveCoordinator.ts` | 存档损毁 = 不可逆 |
| P1 | `hooks/useGame/memoryUtils.ts` | 记忆系统核心 |
| P1 | `hooks/useGame/systemPromptBuilder.ts` | 提示词组装 |
| P1 | `models/era-config.ts` | 多纪元数据 |
| P2 | 各 `MobileXxx.tsx` | 桌面/移动行为差异 |
| P2 | `services/dbService.ts` 子模块 | 持久化 |

#### 5.3 测试模式
延续 `__tests__/photographyNSFW/` 的命名与 AAA 结构：
- `__tests__/utils/apiConfig.test.ts`
- `__tests__/hooks/saveCoordinator.test.ts`
- ...

#### 5.4 覆盖率门槛
- `vitest.config.ts` 设置 `thresholds.global.lines = 5`（基线）
- 每完成一个阶段后提高 5%
- 长期目标：核心模块 60%、工具 90%

#### 5.5 CI 集成
```yaml
# .github/workflows/ci.yml
- run: npm run lint
- run: npm run typecheck
- run: vitest run --coverage
- run: playwright test
```

**验收**：核心 utils 100% 覆盖，hooks/useGame 关键子模块 60% 覆盖；CI 跑通。

---

### Phase 6：错误边界与日志统一（3 天）

**目标**：让玩家看到的错误从"黑屏 + console.log"升级为"友好提示 + 可重试"。

#### 6.1 ErrorBoundary
- 全局 `ErrorBoundary` 包裹 `App.tsx` 根
- 弹窗级 `ErrorBoundary` 包裹每个 `XxxModal`
- 弹窗崩溃不波及主游戏

#### 6.2 Toast/Notification 系统
- 已有 `deviceNotificationWorkflow.ts`，进一步抽象为统一 Toast Manager
- 三类提示：info / warn / error
- 移动端适配（顶部下拉 vs 桌面右下角）

#### 6.3 AI 错误处理
- 流式中断 → 自动重试 1 次（已在 `useGame.ts` 中部分实现，需统一）
- 解析失败 → 兜底渲染（已有 `jsonRepair.ts`，需统一调用）
- 网络错误 → 用户可见的重试按钮

#### 6.4 IndexedDB 错误
- 配额超限（QuotaExceeded）→ 提示用户清理
- 迁移失败 → 阻止启动并提示
- 写失败 → 内存兜底 + 警告

#### 6.5 任务清单
| ID | 任务 |
|---|---|
| P6-1 | 全局 ErrorBoundary |
| P6-2 | 弹窗级 ErrorBoundary |
| P6-3 | 统一 Toast |
| P6-4 | AI 错误重试与解析统一 |
| P6-5 | IndexedDB 错误处理 |

---

### Phase 7：性能与构建优化（3 天）

**目标**：在已有 Vite manualChunks 基础上进一步压榨首屏与运行时性能。

#### 7.1 Bundle 分析
- `npx vite-bundle-visualizer` 生成可视化报告
- 找出 `game-runtime` 内部最大子模块
- 评估是否可拆出"非首屏必需"代码

#### 7.2 React 性能
- `useGame()` 整对象返回 → 改为分别 `useGameState()` / `useGameMeta()` / `useGameActions()` 减少订阅
- 大型列表（NPC、记忆）虚拟化：`@tanstack/react-virtual`
- 弹窗内重组件用 `React.memo` + props 浅比较

#### 7.3 IndexedDB 性能
- 读路径加 `idb-keyval` 索引
- 写路径批处理（debounce 200ms）
- 大对象（带图片）写入前压缩

#### 7.4 启动时间
- 主入口仅加载 `App.tsx` + `LandingPage` + 必要 hook
- 游戏 view 才异步加载 `useGame` 子模块
- 评估 `React.lazy` 当前覆盖是否充分

#### 7.5 任务清单
| ID | 任务 |
|---|---|
| P7-1 | Bundle 报告与优化点分析 |
| P7-2 | useGame 拆分订阅 |
| P7-3 | 列表虚拟化（NPC、聊天历史） |
| P7-4 | IndexedDB 性能调优 |

---

### Phase 8：i18n 框架预埋（后续/选做）

**目标**：为未来多语言支持铺路，本次只做基础，不做完整翻译。

#### 8.1 选型
- `react-i18next`（生态最全）
- 或 `lingui`（编译时优化）

#### 8.2 步骤
1. 安装 + 配置（仅中文资源）
2. 将 JSX 中**纯中文文案**（如按钮 label）抽离到 `locales/zh-CN/*.json`
3. 不动**叙事性中文**（剧情、对话）— 这些是游戏内容
4. 替换 `<button>设置</button>` 为 `<button>{t('settings')}</button>`
5. 不删除原硬编码（用 `useTranslation` 双轨：原 hard-code + i18n key 暂存）

#### 8.3 任务清单
| ID | 任务 |
|---|---|
| P8-1 | 安装 i18next |
| P8-2 | 创建 `locales/zh-CN/common.json` |
| P8-3 | 抽离 Settings、SaveLoad、ConfirmModal 等 UI 文案 |
| P8-4 | 文档：开发者使用规范 |

**仅在确认有 i18n 需求时启动**。否则不投入。

---

## 六、不在本次范围

| 主题 | 原因 |
|---|---|
| 替换 React 状态管理（zustand → Redux） | 已有 zustand，重构成本高于收益 |
| 改写 NSFW 模块为微前端 | 增量太大，收益不明确 |
| 引入 Storybook | 项目体量大、维护成本高 |
| 替换 IndexedDB 为 SQLite（WASM） | 已有稳定方案 |
| 引入 E2E 视觉回归（percy/reg-suit） | 仅在 UI 大改时才有价值 |

## 七、监控与成功标准

### 进度跟踪
- 每个 Phase 在 `docs/plans/2026-06-03-project-optimization.md` 中更新 `[x]`
- 完成的 Phase 内容并入 `docs/technical/`

### 量化指标（Phase 8 结束预期）

| 指标 | 基线 | 目标 |
|---|---|---|
| 单元测试覆盖率 | < 5% | ≥ 30% |
| 文件 > 800 行的数量 | 20+ | < 5 |
| TypeScript 严格度 | 全局宽松 | 核心 6 目录严格 |
| `madge --circular` 错误 | 1+ | 0 |
| `ts-prune` 死代码 | 未知 | 评估后清除 ≥ 50% |
| `npm run build` 错误 | 0 | 0（保持） |
| E2E 核心流程 | 3 | ≥ 8 |
| 文档 README 索引 | 缺失 | 完整 |

## 八、风险缓解

| 风险 | 缓解 |
|---|---|
| 拆分大文件破坏功能 | 迁移时保持 `index.ts` `export *` 兼容，逐步删除旧文件 |
| TS 严格度暴露问题 | 按目录渐进，CI 错误基线锁定 |
| 测试新增拖慢开发 | 强制测试绑定到 P0/P1 模块，不强求 100% |
| 性能优化引入 bug | 每次优化前后用 Playwright 跑 baseline e2e |
| 循环依赖解耦引发连锁 | 阶段性提交，git revert 易回滚 |

## 九、参考资料

- `openspec/changes/split-large-files/` — 已完成的拆分规范
- `openspec/changes/split-nsfw-levels/` — NSFW 分层方案
- `docs/technical/` — 已完成的技术归档
- `vite.config.ts` — 当前分包配置
- `vitest.config.ts` — 当前测试配置

---

**等待确认**：是否按上述优先级分阶段推进？是否调整任何 Phase 的范围或顺序？需要确认后开始 Phase 0 准备。
