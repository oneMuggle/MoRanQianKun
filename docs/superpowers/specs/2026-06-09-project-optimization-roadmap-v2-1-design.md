# 项目优化路线图 v2.1 设计文档

> **创建日期**：2026-06-09
> **作者**：planner（brainstorming skill）
> **状态**：已获用户批准
> **项目**：墨染乾坤：万象纪元
> **承接文档**：
> - v2.0 父 spec：`docs/superpowers/specs/2026-06-06-project-optimization-roadmap-v2-design.md`
> - v2.0 收口报告：`docs/technical/14-optimization-roadmap-v2.md`（v2.0 §7 已列 v2.1 候选）
> - v2.0 决策记录：`docs/phase-decisions/2026-06-06-*.md`（4 份）
> - 上一轮：v2.0 feat/optimization-v2 → main merge 完成（commit `db5f333`）
> - 本 spec 启动前 CI 状态：5 个 workflow 全绿（含 `fix(ci): vitest exclude` commit `6735414`）

---

## 1. 背景与目标

### 1.1 v2.0 末态（2026-06-08）

| 指标 | 值 | 备注 |
|---|---|---|
| 全项目覆盖率 | 14.78% statements / 15.21% lines | spec 目标 30%，**差 15%** |
| T1 纯函数覆盖 | 12-15% | spec 目标 80%，**差 65%** |
| T2 services 覆盖 | ~50% | spec 目标 60%，差 10% |
| 循环依赖 | 26 个（madge） | spec 目标 ≤ 20，差 6 |
| 历史 plan 文件 | 48 个（docs/plans/） | spec 目标 0，差 48 |
| CI threshold | 12% | 妥协值，渐进提升 |
| CI Node.js | 20 | 2026-06-16 后 GitHub 强制 24 |
| Deferred 8 个 L1 核心文件 | social/intimacy/campusPhone/index/system/eraDevice/era-config/game-settings | 8 个跨层问题 |
| Deferred L2-2/L2-3/L3 | 全部 | 留待 v2.2 |

### 1.2 v2.1 核心目标

**Day 1 定义**：本文档"Day N" 计数起点为 v2.1 路线图正式启动日（2026-06-09，与本文档创建同一天）。如启动日延后，Day N 同步顺延。

**60 天（2026-06-09 → 2026-08-07）** 内达成：

1. **覆盖率补齐**：全项目 ≥ 30%（+15%），T1 ≥ 50%（+35%），T2 ≥ 60%（+10%）
2. **文档归一化**：48 个历史 plan 文件全部迁移/删除
3. **循环依赖起步**：26 → ≤ 20
4. **CI 升级**：Node.js 20 → 24，threshold 12% → 25%
5. **不动业务逻辑**：与 v2.0 严守 spec 边界一致

### 1.3 v2.1 范围外（推迟到 v2.2）

按 v2.0 报告 §7 完整列表 + 实施新发现，v2.1 不做：
- Phase 6 错误边界与日志统一（10d）
- Phase 2 L2-2 / L2-3 / L3 收尾（15d）
- 8 个推迟 L1 核心文件 strict
- NSFW 测试禁区清理（5-10d）
- T4 组件扩展（NewGameWizard/ChatList/InputArea）（5-10d）
- scripts/standardize_manifests.ts 19 个 JSDoc 语法错误修复（1.5d）

---

## 2. 路线图骨架

```
┌────────────────────────────────────────────────────────────────────┐
│ v2.1 · 60 天 · 覆盖率优先 · 基础设施先行                          │
├────────────────────────────────────────────────────────────────────┤
│ Phase A  CI 升级与 threshold 渐进   [基础]  Day  1-2  ( 2d)      │
│ Phase B1 T1 纯函数补齐              [质量]  Day  3-17 (15d)      │
│ Phase B2 T2 services 全覆盖         [质量]  Day 18-22 ( 5d)      │
│ Phase C  Phase 1 文档归一化         [治理]  Day 23-27 ( 5d)      │
│ Phase D  Phase 4 循环依赖解耦起步   [架构]  Day 28-42 (15d)      │
│ 缓冲                                       Day 43-60 (18d)      │
├────────────────────────────────────────────────────────────────────┤
│ 推迟到 v2.2                                                      │
│ - Phase 6 错误边界与日志统一                                    │
│ - Phase 2 L2-2 / L2-3 / L3 收尾                                 │
│ - NSFW 测试禁区清理                                              │
│ - scripts/standardize_manifests.ts 修复                          │
│ - T4 组件扩展                                                    │
└────────────────────────────────────────────────────────────────────┘
```

---

## 3. Phase A：CI 升级与 threshold 渐进（Day 1-2, 2d）

### 3.1 目标

- 解决 GitHub Node.js 20 deprecation deadline（2026-06-16）
- threshold 从 0% → 10%（基础门槛，避免覆盖率倒退）

### 3.2 涉及文件

| 文件 | 变更 |
|---|---|
| `.github/workflows/test-coverage.yml` | `actions/checkout@v4` → `@v5`、`actions/setup-node@v4` → `@v5`、`actions/upload-artifact@v4` → `@v5`、加 `FORCE_JAVASCRIPT_ACTIONS_TO_NODE24: 'true'` |
| `.github/workflows/ci.yml`（如存在）| 同上 |
| `.github/workflows/lighthouse-ci.yml` | 同上 |
| `.github/workflows/build-android-apk.yml` | 同上 |
| `.github/workflows/deploy-cloudflare.yml` | 同上 |
| `vitest.config.ts` | `coverage.thresholds`：`lines: 0 → 10, functions: 0 → 10, branches: 0 → 8, statements: 0 → 10` |

### 3.3 技术方案

**Day 1：action 升级 + 环境变量**

```yaml
# .github/workflows/test-coverage.yml（关键片段）
name: test-coverage

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

env:
  FORCE_JAVASCRIPT_ACTIONS_TO_NODE24: 'true'

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5
      - uses: actions/setup-node@v5
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - name: Run unit tests
        run: npm run test:unit
      - name: Run coverage
        run: npm run test:coverage
      - name: Check coverage threshold
        run: npx vitest run --coverage --coverage.thresholds.lines=10
        continue-on-error: false
      - name: Upload coverage artifacts
        if: always()
        uses: actions/upload-artifact@v5
        with:
          name: coverage-report
          path: coverage/
          retention-days: 7
```

**Day 2：threshold 渐进提升 + 决策记录**

修改 `vitest.config.ts`：
```ts
coverage: {
  thresholds: {
    lines: 10,        // Day 2 起步门槛（实际 14.78% 之上留缓冲）
    functions: 10,    // 实际 14.5%
    branches: 8,      // 实际 8.63%
    statements: 10,   // 实际 14.78%
  }
}
```

推进到中段（Day 22）时升到 20%。末段（Day 42）时升到 25%。

### 3.4 验证矩阵

- 5 个 workflow 全部用 Node.js 24 跑通
- threshold 10% 通过（实际 14.78% > 10%）
- 修复阶段无业务逻辑变更
- spec §1 风险 R3（strict 例外）不适用

### 3.5 严守约束

- 仅升级 action 版本号，不改 workflow 业务逻辑
- threshold 提升不修改测试代码
- 不引入新 npm 依赖
- **不**修改 vite.config.ts、tsconfig、scripts/

---

## 4. Phase B1：T1 纯函数补齐（Day 3-17, 15d）

### 4.1 目标

- 全项目覆盖率 14.78% → ≥ 30%
- T1 纯函数覆盖 12-15% → ≥ 50%
- 不写 NSFW/useGame 顶层/prompts/runtime 集成测试（spec test 禁区）

### 4.2 涉及文件（按 5 天 × 3 批划分）

**Day 3-7（5d）utils/ 工具函数**

| 新测试文件 | 覆盖目标 | 样板 |
|---|---|---|
| `utils/calculations.test.ts` | `calculations.ts`（战斗/属性/Qi Yun）| happy（3 case）|
| `utils/format.test.ts` | `format.ts`（数字/日期格式化）| happy + empty |
| `utils/hash.test.ts` | `hash.ts` | happy |
| `utils/random.test.ts` | `random.ts` | happy |
| `utils/storage.test.ts` | `storage.ts`（localStorage 边界）| happy + error |
| `utils/validators.test.ts` | `validators.ts`（API key / era id）| error（3 case）|
| `utils/parseJson.test.ts` | `parseJson.ts` | error + retry |

**预期**：utils 覆盖率 15% → 60%+

**Day 8-12（5d）models/ 纯类型与计算**

| 新测试文件 | 覆盖目标 |
|---|---|
| `models/system/game-config.test.ts` | `system/game-config.ts` 默认值/枚举 |
| `models/system/visual-config.test.ts` | theme 验证 |
| `models/system/initialization.test.ts` | 默认值组合 |
| `models/era-config/presets.test.ts` | era 映射唯一性 |
| `models/era-config/types.test.ts` | 类型守卫 |
| `models/eraDevice/presets.test.ts` | 设备预设 |
| `models/eraDevice/props.test.ts` | 属性验证 |

**预期**：models 覆盖率 12% → 50%+

**Day 13-17（5d）剩余 utils/ 与 worldbook 子模块**

| 新测试文件 | 覆盖目标 |
|---|---|
| `utils/tokenEstimate.test.ts` | token 估算 |
| `utils/clothingHelpers.test.ts` | 服装工具 |
| `utils/imageAssets.test.ts` | 图片资源 |
| `utils/worldbook/parser.test.ts` | 拆分后 parser 子模块（0% → 60%）|
| `utils/worldbook/matcher.test.ts` | 拆分后 matcher 子模块 |
| `utils/worldbook/serializer.test.ts` | 拆分后 serializer 子模块 |

**预期**：utils 全部子模块覆盖、worldbook 子模块 0% → 60%

### 4.3 技术方案

**测试样板（5 个已验证模式）**：

样板 1 happy：
```ts
import { describe, it, expect } from 'vitest';
import { calculateCombatPower } from './calculations';

describe('calculateCombatPower', () => {
  it('returns 0 for empty stats', () => {
    expect(calculateCombatPower({ str: 0, dex: 0, int: 0 })).toBe(0);
  });
  it('sums stats correctly', () => {
    expect(calculateCombatPower({ str: 10, dex: 20, int: 30 })).toBe(60);
  });
});
```

样板 2 error：
```ts
describe('validateApiKey', () => {
  it('accepts valid key', () => {
    expect(() => validateApiKey('sk-abc')).not.toThrow();
  });
  it('rejects empty', () => {
    expect(() => validateApiKey('')).toThrow();
  });
});
```

样板 3 loading（流式响应）：
```ts
import { findByText } from '@testing-library/react';
// render + findByText + waitFor
```

样板 4 empty（空数据）：
```ts
it('returns empty list when no archives', async () => {
  const list = await listArchives();
  expect(list).toEqual([]);
});
```

样板 5 retry（重试机制）：
```ts
import { vi } from 'vitest';
vi.useFakeTimers();
// advance timers + counter assertion
```

### 4.4 验证矩阵

- 全项目覆盖率 14.78% → ≥ 30%
- T1 纯函数覆盖率 ≥ 50%
- vitest 109/109+ 通过（4 spec 禁区 fail 保留）
- TS 0 错误
- 累计 `as any` cast < 5 per layer

### 4.5 严守约束

- 严守 spec test 禁区（NSFW 18 个子模块、useGame 顶层、prompts/runtime）
- 不改业务逻辑
- 不写集成测试（仅单元）
- 优先 mock 真实接口（fake-indexeddb、msw）而非手写 mock

---

## 5. Phase B2：T2 services 全覆盖（Day 18-22, 5d）

### 5.1 目标

- T2 services 覆盖率 50% → ≥ 60%
- 补全 v2.0 跳过的 `ai/text/novelDecomposition.ts`（724 行）+ `ai/text/storyCoreTasks.ts`（592 行）+ `ai/image/`

### 5.2 涉及文件

| 新测试文件 | 覆盖目标 | 工期 |
|---|---|---|
| `services/ai/text/novelDecomposition.test.ts` | `novelDecomposition.ts` 拆分逻辑 | 1.5d |
| `services/ai/text/storyCoreTasks.test.ts` | `storyCoreTasks.ts` 主流程 | 1.5d |
| `services/ai/image/imageGenerationClient.test.ts` | `imageGenerationClient.ts` | 1d |
| `services/ai/image/imageStorage.test.ts` | `imageStorage.ts` 缓存策略 | 1d |

### 5.3 技术方案

复用 v2.0 阶段已建立的 msw 模式：
- msw handlers 拦截 fetch
- fake-indexeddb 替代真实 IndexedDB
- 样板：happy / error / retry / loading

### 5.4 验证矩阵

- T2 services 覆盖率 50% → ≥ 60%
- 全项目覆盖率 ≥ 30%（与 B1 累计）
- vitest 通过率 ≥ 109/116
- TS 0 错误

### 5.5 严守约束

- 严守 spec 边界（不改业务逻辑）
- 严守测试禁区
- 复用 v2.0 已有 msw setup（不重建）
- 新建文件遵循 `__tests__` 或 `<name>.test.ts` 命名

---

## 6. Phase C：Phase 1 文档归一化（Day 23-27, 5d）

### 6.1 目标

- 48 个 `docs/plans/*.md` → 0（迁移或删除）
- 新增 `docs/technical/16-*.md` ~ `19-*.md` 系列章节
- 更新 `docs/technical/README.md` 章节目录

### 6.2 涉及文件

**Day 23：盘点**

```bash
ls docs/plans/ | wc -l  # 48
# 按内容分类
ls docs/plans/2026-04-*.md  # 早期历史
ls docs/plans/2026-05-*.md  # 中期
ls docs/plans/2026-06-*.md  # 近期
```

**Day 24-25：迁移**

按主题聚类到 `docs/technical/`：
- NSFW 系列（~9 个 plan）→ `docs/technical/16-nsfw-systems.md`（合并）
- contemporary 子系统系列（~10 个）→ `docs/technical/17-contemporary-modules.md`（合并）
- 性能/优化系列（~5 个）→ `docs/technical/13c-performance-extra.md`（增量）
- 关系/规划系列（~8 个）→ `docs/technical/18-planning-systems.md`（合并）
- 战斗/技能/装备等（~10 个）→ `docs/technical/19-game-systems.md`（合并）
- 单文件级（~6 个）→ 各自独立章节

**Day 26：删除已迁移 + 过期 plan**

```bash
git rm docs/plans/2026-04-01_mobile-ui-optimization.md ...
# 保留可能仍在用的（如 v2.0 仍 active 的）
ls docs/plans/  # 应仅剩 0-3 个
```

**Day 27：更新 README**

```markdown
# docs/technical/README.md（追加）

## 目录
- 11-testing-strategy.md
- 12-error-handling.md
- 13-performance.md
- 13b-performance-modularization.md
- 13c-performance-extra.md  ← 新
- 14-optimization-roadmap-v2.md
- 15-roadmap-v2-1.md  ← v2.1 报告
- 16-nsfw-systems.md  ← 新（合并 ~9 NSFW plans）
- 17-contemporary-modules.md  ← 新（合并 ~10 plans）
- 18-planning-systems.md  ← 新（合并 ~8 plans）
- 19-game-systems.md  ← 新（合并 ~10 plans）
- ... 其他单文件级 plan
```

### 6.3 严守约束

- **不删决策记录**（`docs/phase-decisions/` 与 `docs/technical/` 已合并内容）
- **不删 active 文档**（如有 v2.0 仍引用的 plan 暂留）
- 迁移前先 Read 原文，避免内容丢失
- 合并时保留原始 commit SHA 引用

---

## 7. Phase D：Phase 4 循环依赖解耦起步（Day 28-42, 15d）

### 7.1 目标

- 循环依赖 26 → ≤ 20（**只拆 5-8 个高 priority 链，不追求全清零**）
- 优先拆 `prompts ↔ models` 链（影响最大）
- 接续 spec `02d-circular-deps-decoupling.md` 已有 16 → 14 的进度

### 7.2 涉及文件

**Day 28-30（3d）madge 现状审计**

```bash
npx madge --circular --extensions ts,tsx . > /tmp/circular-v2-1.txt
# 分析 26 个循环，按模式分类
```

按循环模式分类（基于 v2.0 报告 + 实施经验）：
- `prompts ↔ models` 链（预估 8-10 个）
- `hooks ↔ services` 链（预估 6-8 个）
- `models ↔ services` 链（预估 4-6 个）
- 跨层链（预估 2-4 个）

**Day 31-37（7d）拆 prompts ↔ models 链**

按 spec `02d-circular-deps-decoupling.md` 模式：
1. `import type` 替代 `import` 命名导入
2. 提取共享类型到 `models/types/` 中间层
3. 拆 `prompts/runtime/*.ts` 中的 `import { type X }` 模式
4. 用 `vitest run` 验证无回归

**Day 38-42（5d）拆 hooks ↔ services 高优链**

只挑 5-8 个高 priority 循环拆。**不追求全清零**（剩余循环推迟 v2.2）。

### 7.3 技术方案

接续 v2.0 决策（`02d-circular-deps-decoupling.md`）：

**模式 1：命名导入改为类型导入**
```ts
// 修复前
import { 角色数据结构 } from '../../models/character';
// 修复后
import type { 角色数据结构 } from '../../models/character';
```

**模式 2：提取共享类型中间层**
```ts
// 新文件 models/types/character-shared.ts
export interface 角色共享字段 {
  姓名: string;
  性别: string;
}

// 修复后
// prompts/runtime/character-prompts.ts
import type { 角色共享字段 } from '../../models/types/character-shared';
// 不再直接 import models/character.ts
```

**模式 3：拆分 barrel 暴露面**
```ts
// models/index.ts（barrel）
export * from './character-name';     // 名字相关
export * from './character-stats';     // 状态相关
// 不再 export * from './character' （整个）
```

### 7.4 验证矩阵

- 26 → ≤ 20 循环
- 拆后 0 业务逻辑变更
- vitest 109/116+ 通过
- TS 0 错误
- madge 报告 0 新增（**只减少**）

### 7.5 严守约束

- 不改业务逻辑
- 不改公开 API 签名
- 仅调整 import 模式 + 提取共享类型
- 不引入新依赖
- 不删 `migrations/` 占位脚本

---

## 8. 缓冲期：Day 43-60（18d）

**目的**：为以下预留：
- 阶段偏差修复（如 Phase B 覆盖率未达 30% 需补救）
- CI 反复失败修复
- unforeseen issue 修复
- v2.1 60 天报告归档
- 决策记录更新

**不**做：引入新功能、重构、改业务逻辑

---

## 9. 风险登记册

| 风险 ID | 描述 | 等级 | 缓解 |
|---|---|---|---|
| V1 | Phase A action 升级后 5 个 workflow 行为变化 | LOW | 升级前先在 1 个 workflow 测试，验证通过再批量 |
| V2 | Phase B1 写测试后发现业务函数有 bug | MEDIUM | 仅写测试不修业务代码；记录 bug 到下轮处理 |
| V3 | Phase B2 msw handlers 与真实 AI 行为差异 | MEDIUM | msw 只 mock 成功响应，错误路径用 snapshot 替代 |
| V4 | Phase C 合并 plan 时内容丢失 | HIGH | 迁移前 backup 到 `/tmp/legacy-plans/`；保留原 commit SHA 引用 |
| V5 | Phase D 拆循环引入新的 import 路径错误 | MEDIUM | 拆前跑 `madge --circular`；拆后跑 `vitest` 验证 |
| V6 | 缓冲期 18 天不够，6 个推迟项仍遗留 | LOW | 文档化"v2.2 优先项"清单；不强行 v2.1 收口 |
| V7 | spec test 禁区（NSFW）在测试代码清理时被破坏 | MEDIUM | 严守 v2.0 决策（`__tests__/photographyNSFW/SKIP.md`）；CI exclude 模式不变 |
| V8 | `vitest.config.ts` threshold 渐进引发 CI 红 | LOW | 阈值升幅保守（每次 +5%）；CI 配置单独 job 而非全量失败 |
| V9 | scripts/standardize_manifests.ts 19 个 JSDoc 错误在 v2.1 不修 | LOW | 文档化推迟理由（不是 v2.1 优先项）|
| V10 | Node.js 24 升级后某 action 不兼容 | LOW | 升级前看 GitHub 官方 release notes；备有 `@v4` 回退路径 |

### 依赖

- 现有：vitest + jsdom + fake-indexeddb + msw + @testing-library/react
- 新增：**无**（v2.1 不引入新依赖）
- 团队：60 天内需要 1-2 人持续投入

---

## 10. KPI 与验收

### 10.1 阶段 KPI

| Phase | Day | 关键 KPI |
|---|---|---|
| A | 2 | CI 全部用 Node.js 24，threshold 10% |
| B1 | 17 | T1 纯函数覆盖 ≥ 50%，全项目 ≥ 25% |
| B2 | 22 | T2 services 覆盖 ≥ 60%，全项目 ≥ 30% |
| C | 27 | docs/plans/ 仅剩 0-3 个 |
| D | 42 | 循环依赖 ≤ 20，TS 0 错误 |
| 缓冲 | 60 | v2.1 报告归档 |

### 10.2 总验收（Day 60）

- [ ] 全项目覆盖率 ≥ 30%（基线 14.78%）
- [ ] T1 纯函数覆盖率 ≥ 50%（基线 12-15%）
- [ ] T2 services 覆盖率 ≥ 60%（基线 50%）
- [ ] 循环依赖 ≤ 20（基线 26）
- [ ] docs/plans/ 仅剩 0-3 个（基线 48）
- [ ] CI 5 个 workflow 全绿，Node.js 24
- [ ] vitest threshold 25%（基线 0% → 10% → 20% → 25%）
- [ ] 0 业务逻辑变更
- [ ] 0 行为级破坏
- [ ] 所有 commits 用 `planner <planner@moran.local>` 身份
- [ ] v2.1 60 天报告归档到 `docs/technical/15-roadmap-v2-1.md`

### 10.3 推迟到 v2.2（spec 范围外）

- Phase 6 错误边界与日志统一（10d）
- Phase 2 L2-2 / L2-3 / L3 收尾（15d）
- 8 个推迟 L1 核心文件 strict
- NSFW 测试禁区清理
- scripts/standardize_manifests.ts 修复
- T4 组件扩展
- threshold 25% → 30%
- 循环依赖 20 → 0

---

## 11. 实施移交

本文档获用户批准后，将由 `writing-plans` skill 拆解为可独立验证的子计划文档：

- `docs/plans/2026-06-09_phase-a-ci-upgrade.md`（Day 1-2）
- `docs/plans/2026-06-09_phase-b1-t1-pure-functions.md`（Day 3-17）
- `docs/plans/2026-06-09_phase-b2-t2-services.md`（Day 18-22）
- `docs/plans/2026-06-09_phase-c-docs-normalize.md`（Day 23-27）
- `docs/plans/2026-06-09_phase-d-circular-deps.md`（Day 28-42）
- 缓冲期（Day 43-60）不写独立 plan，按需响应

每个 plan 文档包含：背景、涉及文件、实施方案（步骤 + 命令 + 代码）、验收、风险与依赖。
