# 项目优化路线图 v2.0 设计文档

> **创建日期**：2026-06-06
> **作者**：planner（brainstorming skill）
> **状态**：已获用户批准
> **项目**：墨染乾坤：万象纪元
> **承接文档**：
> - `docs/plans/2026-06-03-project-optimization.md` — v1.0 总体路线图（8 阶段）
> - `docs/technical/13b-performance-modularization.md` — Phase 7 性能优化（已闭环）
> - `docs/technical/02-state-modularization.md` — useGame 架构
> - `docs/technical/03-prompt-architecture.md` — 提示词分层
> - `docs/technical/11-testing-strategy.md` — 测试策略
> - `docs/technical/12-error-handling.md` — 错误处理

---

## 1. 背景与目标

### 1.1 当前状态（2026-06-06 实测）

| 指标 | 数值 | 备注 |
|---|---|---|
| TS/TSX 文件 | 1502 | 不含 node_modules |
| 代码行数 | 33.3 万 | 全量统计 |
| 测试文件 | ~22 | 主要集中在 photographyNSFW 和 utils/ |
| 测试覆盖率 | < 5% | 大量 hooks/components 无测试 |
| `App.tsx` | 406 行 | 已从 1680 缩减（v1.0 期间） |
| `useGame.ts` | 1196 行 | 已从 2990 拆分出 60+ 子文件 |
| `models/system.ts` | 1822 行 | 仍是超大型 |
| `dbService.ts` | 1396 行 | 仍可继续拆 |
| `models/eraDevice.ts` | 1410 行 | 仍可继续拆 |
| `utils/worldbook.ts` | 1245 行 | 仍可继续拆 |
| Vite manualChunks | 已按 era/nsfw/biz/runtime 拆分 | 配置较成熟 |
| TypeScript 配置 | 无 `strict`、`noUncheckedIndexedAccess` | 全局宽松 |

### 1.2 核心痛点

**最大痛点（用户确认）**：TypeScript 散点错误反复出现。最近 5 个 commit 全是 `fix(types):` 前缀，已修复 260+ 个 TS 错误但仍频出新错误。根源是项目未开启 TypeScript strict 模式。

### 1.3 v2.0 目标

- **60 天内**把 TypeScript 散点错误率从 260+/周 压到 < 20/周
- 把 4 个超大型文件（`system.ts`/`dbService.ts`/`eraDevice.ts`/`worldbook.ts`）拆到 ≤ 600 行
- 把测试覆盖率从 < 5% 提升到 ≥ 30%，关键路径 ≥ 60%
- 不破坏存档、API、UI 兼容性；允许"可控破坏"（TS 严格启用、重复文件合并、UI 组件合并）

**Day 1 定义**：本文档"Day N" 计数起点为 v2.0 路线图正式启动日（即本文档批准后第一个工作日，2026-06-09 候选）。如启动日延后，Day N 同步顺延。

**NSFW 子系统数量口径**："约 18 个" 系按 06-03 方案与近期 commit（commit `3ddd269` 等修复 6 个 NSFW 模块的类型错误）粗略统计，最终数量以 P5 启动时 `find modules/era-*` / `find data/nsfw*` 实测为准。

### 1.4 范围外（v2.0 不做）

- Phase 1 文档归一化（下一轮 60 天）
- Phase 4 循环依赖解耦（下一轮 60 天，但 P2 day 15 同步做局部解耦）
- Phase 6 错误边界与日志统一（下一轮 60 天）
- Phase 8 i18n 框架预埋（远期）

---

## 2. 路线图骨架

```
┌──────────────────────────────────────────────────────────────────┐
│ 60 天 · 代码质量优先 · 允许可控破坏 · 分层 TS 严格               │
├──────────────────────────────────────────────────────────────────┤
│ Phase 2  TS 严格度分层       [质量]  Day  1-30  ← 30 天/核心    │
│ Phase 3  大文件拆分          [重构]  Day 31-45  ← 15 天         │
│ Phase 5  测试体系补齐        [质量]  Day 46-60  ← 15 天         │
├──────────────────────────────────────────────────────────────────┤
│ Phase 1  文档归一化          [治理]  下一轮 60 天                │
│ Phase 4  循环依赖解耦        [架构]  下一轮 60 天                │
│ Phase 6  错误边界与日志统一  [可观测] 下一轮 60 天               │
│ Phase 8  i18n 框架预埋       [国际化] 远期                       │
└──────────────────────────────────────────────────────────────────┘
```

**承接关系**：
- 上一轮（已闭环）：Phase 0 基线测量 + Phase 7 性能与构建优化
- 本轮（v2.0）：Phase 2 → 3 → 5
- 下一轮（v2.1 草案）：Phase 1 → 4 → 6

---

## 3. Phase 2：TS 严格度分层（Day 1-30）

### 3.1 目标

根治 TS 散点错误反复，把 strict 类型系统从核心库向外铺开。

### 3.2 核心机制 — tsconfig 分层 + 项目引用

```
tsconfig.json                      # 根：引用 + 路径映射
├─ tsconfig.base.json              # 公共 compilerOptions（含 strict 子集）
├─ tsconfig.core.json              # 核心层（models/services/hooks）
│   project references: true
│   strict: true
│   noUncheckedIndexedAccess: true
│   exactOptionalPropertyTypes: true
│   noImplicitOverride: true
├─ tsconfig.app.json               # 应用层（components/features）
│   extends: base
│   references: [core]
│   strict: true（晚 15 天开）
│   noUncheckedIndexedAccess: false（先开更稳的子集）
├─ tsconfig.vitest.json            # 测试层
│   references: [core, app]
│   strict: true
```

### 3.3 分层规则

按依赖方向：**上层依赖下层，下层先严格**。

1. **L1 核心类型**（`models/**`、`services/dbService.ts`、`services/ai/**`）— Day 1-10
2. **L2 业务逻辑**（`hooks/useGame/**`、`utils/**`、`prompts/**`）— Day 11-20
3. **L3 UI 层**（`components/**`、`App.tsx`）— Day 21-30
4. **L4 测试与配置**（`*.test.ts`、`vite.config.ts`）— 与 L3 同步

### 3.4 渐进开关节奏

每天开 1-2 个 flag：

- **Day 1-3**：`strict: true`、`noImplicitAny: true`、`strictNullChecks: true`
- **Day 4-7**：`strictFunctionTypes`、`strictBindCallApply`、`strictPropertyInitialization`
- **Day 8-12**：`noUncheckedIndexedAccess`（最大杀伤力，预计暴露 80+ 错误）
- **Day 13-18**：`exactOptionalPropertyTypes`（与 NSFW / imageGen 配置层交互需特别处理）
- **Day 19-25**：`noImplicitOverride`、`noFallthroughCasesInSwitch`、`useUnknownInCatchVariables`
- **Day 26-30**：补漏 + 移除所有 `// @ts-ignore` 与 `as any`（强制 < 5 个，列出豁免名单）

### 3.5 Milestone Gate（每周末）

- 周末跑 `tsc --noEmit`，错误数必须下降 ≥ 30%，否则暂停下一层
- CI 加 `typecheck-strict` job（只检查 L1），day 8 后加 L2，day 22 后加 L3
- 阻断合入：新增 commit 引入 > 5 个 strict 错误则 lint fail

### 3.6 P2 完成验收

- [ ] `tsconfig.core.json` 全 strict flag 开启且 L1 错误数 = 0
- [ ] L2 错误数 ≤ 30
- [ ] L3 错误数 ≤ 50
- [ ] 散点错误 ≤ 20/周（基线 260+）
- [ ] CI typecheck-strict job 绿
- [ ] 旧 commit 历史中出现过的 TS 错误码（TS2551/TS2395/TS2352/...）全部归零

---

## 4. Phase 3：大文件拆分（Day 31-45）

### 4.1 目标

把 4 个超大型文件压到 ≤ 600 行，建立可维护的模块边界。

### 4.2 优先级与拆法

按"被引用频次 × 改动痛点"排序：

| 序 | 文件 | 当前行数 | 目标结构 | 工期 |
|---|---|---|---|---|
| 1 | `models/system.ts` | 1822 | 拆为 `models/system/{api-config, ui-settings, game-config, memory-config, visual-config, types, index}.ts` 7 文件 | 5 天 |
| 2 | `dbService.ts` | 1396 | 拆为 `dbService/{index, schema, stores, migrations, image-assets, save-archive, transactions}.ts` 7 文件 | 4 天 |
| 3 | `utils/worldbook.ts` | 1245 | 拆为 `utils/worldbook/{parser, matcher, serializer, types, index}.ts` 5 文件 | 3 天 |
| 4 | `models/eraDevice.ts` | 1410 | 拆为 `models/eraDevice/{devices, props, presets, types, index}.ts` 5 文件 | 3 天 |

### 4.3 拆分原则

- 拆前先在 `// types-only bridge`（参考已归档的 commit `0e55500`）阶段抽离**所有类型**到独立 `types.ts`
- 拆后用 **barrel export**（`index.ts`）保持对外 API 不变，避免 `import` 路径爆炸
- 拆完用 `madge --circular` 验证无新增循环依赖；用 `ts-prune` 验证无新增死代码
- 拆后立即跑回归：手动 + Playwright 三个核心场景（开局 / 故事推进 / 存档读档）

### 4.4 拆分节奏

- **Day 31-35**：`system.ts` 拆分（影响最大，必须先做）
- **Day 36-39**：`dbService.ts` 拆分
- **Day 40-42**：`worldbook.ts` 拆分
- **Day 43-45**：`eraDevice.ts` 拆分
- **Day 45 末**：跑 `size-limit` 验证 chunk 大小未恶化（拆分 ≠ 增大 bundle）

### 4.5 P3 完成验收

- [ ] 4 个目标文件 ≤ 600 行
- [ ] 无新增循环依赖（`madge --circular` 退出码 0）
- [ ] 无新增死代码（`ts-prune --error` 退出码 0）
- [ ] `size-limit` 3 budget 仍 ≥ 80% 余量
- [ ] 手动回归：开局 / 故事推进 / 存档读档 / 跨纪元跳转 4 个核心场景无回归
- [ ] Playwright 3 个核心流程测试通过

---

## 5. Phase 5：测试体系补齐（Day 46-60）

### 5.1 目标

从 < 5% 覆盖到 ≥ 30% 全量覆盖，关键路径 ≥ 60%。

### 5.2 测试架构

- 沿用项目已有 Vitest + `@vitest/coverage-v8`（Phase 0 已装）
- 新增 `@testing-library/react`（组件层用）+ `msw`（AI 客户端 mock）
- 配置 v8 coverage threshold：**渐进式提升**，每周末 +5%

### 5.3 测试金字塔

| 层级 | 目标对象 | 目标覆盖率（终态） | 工具 | 工期 |
|---|---|---|---|---|
| **T1 纯函数** | `utils/**`、`models/**`（纯类型与计算） | 80% | Vitest | Day 46-48 |
| **T2 服务层** | `services/ai/text/**`、`dbService` 抽象层 | 60% | Vitest + msw | Day 49-52 |
| **T3 工作流** | `hooks/useGame/` 子工作流（sendWorkflow、memoryRecall、saveCoordinator） | 60% | Vitest + renderHook | Day 53-56 |
| **T4 关键组件** | `App.tsx` 路由、`NewGameWizard`、`Chat` 主组件 | 30% | @testing-library/react | Day 57-60 |

> 注：表内"目标覆盖率"为各层级 **Day 60 终态目标**。Day 48/52/56 的 milestone gate 数值（5.6 节）为此终态的阶段性检查点，预期 Day 60 达到或超过终态值。

### 5.4 测试样板与协作约定

- 在 `*.test.ts` 同目录或 `__tests__/` 下放测试（沿用现有习惯，如 `photographyNSFW/` 下测试文件）
- 强制 AAA 模式（已写入项目规则 `testing.md`）
- 测试文件名后缀：纯函数 `.test.ts`、组件 `.test.tsx`、hook `.test.ts`
- 必须 mock 外部依赖：`fetch`（用 msw）、`IndexedDB`（用 `fake-indexeddb`）、AI 客户端（用 msw）
- CI 跑测试 + coverage 上传，`coverage` 下降则 build fail

### 5.5 测试禁区

避免给仍在流动的代码写废测试：

- ❌ 18 个 `NSFW` 子系统的内部逻辑（场景太多，回报低）
- ❌ `useGame.ts` 顶层 hook 整合测试（依赖链太深，单独 mock 不现实）
- ❌ `prompts/runtime/*`（AI 输出，断言 AI 行为 = 写测试易碎）
- ✅ 但是 `hooks/useGame` 下的**子工作流**（`sendWorkflow.ts` 等）必须覆盖到 60%

### 5.6 Milestone Gate

- **Day 48 末**：T1 覆盖率 ≥ 50%（纯函数好写）
- **Day 52 末**：T2 覆盖率 ≥ 30%
- **Day 56 末**：T3 覆盖率 ≥ 40%
- **Day 60 末**：全项目 ≥ 30%，T1+T2+T3 加权 ≥ 50%

### 5.7 P5 完成验收

- [ ] 全项目覆盖率 ≥ 30%
- [ ] T1（utils+models）≥ 80%
- [ ] T2（services）≥ 60%
- [ ] T3（hooks/useGame 子工作流）≥ 60%
- [ ] CI test + coverage job 绿，coverage 下降则 fail
- [ ] `docs/technical/11-testing-strategy.md` 更新测试样板与覆盖率阶梯图

---

## 6. 风险登记册

| 风险 ID | 描述 | 阶段 | 等级 | 缓解措施 |
|---|---|---|---|---|
| R1 | TS strict 开启后，`prompts ↔ models ↔ hooks` 循环依赖暴雷更多 TDZ | P2 | HIGH | day 15 同步做局部解耦（只拆 `prompts/core` ↔ `models/types` 的命名导入） |
| R2 | `exactOptionalPropertyTypes` 与 React props 传递冲突（~30 个组件） | P2 | MEDIUM | 优先用 `?:` 显式可选；建立 props 类型 lint 规则（`no-non-null-assertion`、`consistent-type-assertions`） |
| R3 | 拆分 `system.ts` 影响 ~80% 业务模块 import 路径 | P3 | HIGH | 必须保留 barrel `models/system/index.ts`；用 codemod 批量迁移后保留 `models/system.ts` re-export |
| R4 | 拆分 `dbService.ts` 改了 IndexedDB 事务边界，影响存档读档 | P3 | HIGH | 先冻结 schema；用 5 个老存档（覆盖 7 个纪元）做读档回归；新增 1 个 migration 脚本占位 |
| R5 | 拆分后行数反弹（不自觉又堆回 1000+ 行） | P3 | LOW | 设 size-limit 阈值（> 800 行 CI 报警）；ESLint `max-lines` 规则 |
| R6 | 测试 AI 流式响应时断言易碎 | P5 | MEDIUM | 用 snapshot + 关键字段断言（`status`/`error.code`/`metadata`），不断言完整文本 |
| R7 | 全量测试时间过长（> 5min），拖慢 PR | P5 | MEDIUM | PR 阶段只跑 `vitest --changed`；main merge 前跑全量；测试按域分 4 个 sharded job |
| R8 | 团队对 Vitest + msw 不熟，前期产能低 | P5 | MEDIUM | day 46 安排 1 天内部技术分享；准备 5 个测试样板（happy/error/loading/empty/retry） |
| R9 | strict 启用期间，新功能合入被 type 错误阻塞 | P2+P3 | MEDIUM | 设立"strict 例外"通道：单 PR 最多 5 个 @ts-expect-error + 注明 issue 号 + 24h 内必须移除 |
| R10 | `size-limit` 3 budget 在拆分后仍 green，但 chunk 数膨胀（cache 命中率下降） | P3 | LOW | 监控 chunk 数量，> 50 个合并；保留 vendor 6 块 + runtime 5 块 + settings 5 块为上限 |

---

## 7. 总体 KPI（60 天后验收）

- **TS 散点错误** ≤ 20/周（基线 260+）
- **4 个超大型文件**（`system.ts`/`dbService.ts`/`eraDevice.ts`/`worldbook.ts`）≤ 600 行
- **测试覆盖率** ≥ 30%（基线 < 5%），关键路径（hooks/useGame、services/ai、dbService）≥ 60%
- **构建仍 green**，`size-limit` 3 budget 仍有 ≥ 80% 余量
- **无新增 TDZ / 循环依赖告警**

---

## 8. 站立指标与节奏

- **每天**：CI 全绿（typecheck + lint + test + size-limit）
- **每周一**：跑 `tsc --noEmit` 记录错误数趋势；跑 `vitest run --coverage` 记录覆盖率趋势
- **每周日**：更新 `docs/technical/14-optimization-roadmap.md` 周报（新增章节）

---

## 9. 60 天总验收

- [ ] 上述三阶段验收清单全过
- [ ] 散点错误 < 5/周（持续观察 1 周）
- [ ] 关键路径（hooks/useGame 子工作流）单测覆盖 60%，重构安全
- [ ] 构建产物无膨胀（与 13b 归档基线对比 ±10% 内）
- [ ] 编写并归档 `docs/technical/14-optimization-roadmap-v2.md`

---

## 10. 实施移交

本文档获用户批准后，将由 `writing-plans` skill 拆解为可独立验证的子计划文档，每个子计划文档包含：

- 背景与目标
- 涉及的文件与模块
- 技术方案（架构/接口设计）
- 实施步骤（分解为可独立验证的里程碑）
- 风险评估与依赖
- 验收标准

子计划文档预计产出 3 份（对应 Phase 2/3/5），保存到 `docs/plans/`。
