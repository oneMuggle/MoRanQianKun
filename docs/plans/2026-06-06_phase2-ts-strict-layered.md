# Phase 2 — TypeScript 严格度分层实施计划

> **创建日期**：2026-06-06
> **状态**：已批准（spec `docs/superpowers/specs/2026-06-06-project-optimization-roadmap-v2-design.md`）
> **父路线图**：[2026-06-06-project-optimization-roadmap-v2-design](../../superpowers/specs/2026-06-06-project-optimization-roadmap-v2-design.md)
> **工期**：Day 1-30（30 天）
> **目标**：根治 TS 散点错误（260+/周 → < 20/周），分层开启 strict

---

## 背景与目标

### 背景

最近 5 个 commit 全是 `fix(types):` 前缀，累计修复 260+ 个 TypeScript 错误，但仍频出散点错误（TS2551/TS2395/TS2352/TS2308/TS2749/TS2740/TS2693/TS2559/TS2556/TS2554/TS2552/TS18004）。根因是项目 tsconfig 没有 `strict`、`noUncheckedIndexedAccess`、`exactOptionalPropertyTypes` 等核心 strict 旗标，导致类型系统容忍大量隐式 `any`、数组越界、可选字段缺失。

### 目标

1. **30 天内**让 TS 散点错误数从 260+/周 降至 ≤ 20/周
2. 修复 commit 历史中**所有**出现过的 TS 错误码（回归清零）
3. 建立 `tsconfig` 项目引用分层，让 strict 旗标按依赖方向渐进铺开
4. CI 加 `typecheck-strict` job，阻断 strict 错误新增
5. 不破坏现有存档、API、UI（允许"可控破坏"：strict 旗标启用后产生的类型修正）

### 范围外

- 不开启 ESLint 类型相关规则（在 Phase 6 错误边界阶段统一处理）
- 不动 `vite.config.ts` 编译配置
- 不修复 NSFW 子系统内部 18 个模块的类型（在 Phase 5 测试禁区中明确不覆盖）

---

## 涉及文件

### 新建

| 文件 | 用途 |
|---|---|
| `tsconfig.base.json` | 公共 strict 子集基线 |
| `tsconfig.core.json` | L1 核心层（models/services/dbService/services-ai） |
| `tsconfig.app.json` | L3 UI 层（components/App），延后 15 天开 strict |
| `tsconfig.vitest.json` | 测试层 |
| `scripts/measure-ts-errors.sh` | 错误数趋势测量脚本（每周一跑） |
| `.github/workflows/typecheck-strict.yml` | CI job（仅检查 L1 → L2 → L3） |

### 修改

| 文件 | 变更 |
|---|---|
| `tsconfig.json` | 改为 references 入口，移除 direct compilerOptions |
| `package.json` | 新增 `typecheck:strict` / `typecheck:layer` / `typecheck:error-count` 脚本 |
| `package.json` | 新增 `lint:type-trend` 脚本（调用 measure-ts-errors.sh） |
| `.gitignore` | 追加 `tsc-error-trend.txt`（CI 临时产物） |

---

## 技术方案

### 核心机制 — tsconfig 分层 + 项目引用

```
tsconfig.json                          # 仅 references
├─ tsconfig.base.json                  # 公共 compilerOptions
├─ tsconfig.core.json                  # L1 核心层（strict 30 天内全开）
│   references: true
│   strict + noUncheckedIndexedAccess + exactOptionalPropertyTypes + noImplicitOverride
├─ tsconfig.app.json                   # L3 UI 层
│   references: [core]
│   strict: true（day 21+ 开启）
│   noUncheckedIndexedAccess: false（先开更稳的子集）
└─ tsconfig.vitest.json                # L4 测试
    references: [core, app]
    strict: true
```

### 渐进开关节奏

| 时段 | 旗标 | 预期暴露错误数 |
|---|---|---|
| Day 1-3 | `strict: true` + `noImplicitAny` + `strictNullChecks` | ~50 |
| Day 4-7 | `strictFunctionTypes` + `strictBindCallApply` + `strictPropertyInitialization` | ~30 |
| Day 8-12 | `noUncheckedIndexedAccess`（**最大杀伤力**） | ~80 |
| Day 13-18 | `exactOptionalPropertyTypes`（与 NSFW/imageGen 交互需特别处理） | ~40 |
| Day 19-25 | `noImplicitOverride` + `noFallthroughCasesInSwitch` + `useUnknownInCatchVariables` | ~30 |
| Day 26-30 | 补漏 + 移除 `// @ts-ignore` 与 `as any`（强制 < 5 个豁免） | 散点 ≤ 20/周 |

### 分层规则（L1-L4）

按依赖方向**上层依赖下层，下层先严格**：

1. **L1 核心类型**（`models/**`、`services/dbService.ts`、`services/ai/**`）— Day 1-10
2. **L2 业务逻辑**（`hooks/useGame/**`、`utils/**`、`prompts/**`）— Day 11-20
3. **L3 UI 层**（`components/**`、`App.tsx`）— Day 21-30
4. **L4 测试与配置**（`*.test.ts`、`vite.config.ts`）— 与 L3 同步

### Milestone Gate（每周末）

- 周末跑 `tsc --noEmit`，错误数必须下降 ≥ 30%（相对上周一基线），否则暂停下一层
- CI 加 `typecheck-strict` job（只检查 L1），day 8 后加 L2，day 22 后加 L3
- 阻断合入：新增 commit 引入 > 5 个 strict 错误则 lint fail

### 与现有架构协同

- **已有归档**：`docs/technical/02-state-modularization.md` 中 useGame 已按子工作流拆分（60+ 文件），本次 strict 不会破坏现有结构
- **TDZ 缓解**：commit `d9d7be1` 已用 `models-types` ↔ `useGame-runtime` chunk 包裹，本次 strict 会暴露更多**真实**循环依赖，需在 day 15 同步做局部解耦（仅拆 `prompts/core` ↔ `models/types` 命名导入，详见 R1）
- **测试稀缺陷碍**：strict 启用后会暴露 hooks/useGame 子工作流的隐式 any。本计划不写测试（属于 Phase 5），但需在 strict 通过**后**作为下一阶段的安全网

---

## 实施步骤

> 步骤粒度遵循 writing-plans skill：每步 2-5 分钟，可独立验证，可提交。

### Day 1：建立 tsconfig 分层骨架

- [ ] **Step 1：创建 `tsconfig.base.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "allowImportingTsExtensions": false,
    "esModuleInterop": true,
    "isolatedModules": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "noEmit": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

- [ ] **Step 2：创建 `tsconfig.core.json`（L1 暂不开启 strict）**

```json
{
  "extends": "./tsconfig.base.json",
  "include": [
    "models/**/*.ts",
    "models/**/*.tsx",
    "services/dbService.ts",
    "services/ai/**/*.ts"
  ],
  "exclude": ["node_modules", "dist"]
}
```

- [ ] **Step 3：创建 `tsconfig.app.json`（L3）**

```json
{
  "extends": "./tsconfig.base.json",
  "include": ["App.tsx", "index.tsx", "components/**/*.ts", "components/**/*.tsx"],
  "exclude": ["node_modules", "dist"]
}
```

- [ ] **Step 4：创建 `tsconfig.vitest.json`（L4）**

```json
{
  "extends": "./tsconfig.base.json",
  "include": ["**/*.test.ts", "**/*.test.tsx", "vitest.config.ts", "scripts/**/*.ts"],
  "exclude": ["node_modules", "dist"]
}
```

- [ ] **Step 5：改写 `tsconfig.json` 为 references 入口**

```json
{
  "files": [],
  "references": [
    { "path": "./tsconfig.core.json" },
    { "path": "./tsconfig.app.json" },
    { "path": "./tsconfig.vitest.json" }
  ]
}
```

- [ ] **Step 6：验证分层不破坏 build**

```bash
npm run build
```

预期：build 成功，chunk 大小与分层前一致（±0%）。

- [ ] **Step 7：提交**

```bash
git add tsconfig.base.json tsconfig.core.json tsconfig.app.json tsconfig.vitest.json tsconfig.json
git commit -m "refactor(tsconfig): 建立 core/app/vitest 三层项目引用骨架"
```

### Day 2：L1 strict 基础旗标开启

- [ ] **Step 1：在 `tsconfig.core.json` 开启 strict 基础子集**

```json
{
  "extends": "./tsconfig.base.json",
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true
  },
  "include": ["models/**/*.ts", "models/**/*.tsx", "services/dbService.ts", "services/ai/**/*.ts"],
  "exclude": ["node_modules", "dist"]
}
```

- [ ] **Step 2：测量当前 L1 错误数**

```bash
npx tsc --noEmit -p tsconfig.core.json 2>&1 | wc -l
```

记录到 `tsc-error-trend.txt`（gitignored），格式：`Day-N, L1, <count>, <timestamp>`。

- [ ] **Step 3：创建 `scripts/measure-ts-errors.sh`**

```bash
#!/usr/bin/env bash
set -euo pipefail
LAYER="${1:-core}"
TSCONFIG="tsconfig.${LAYER}.json"
OUT="${OUT_FILE:-tsc-error-trend.txt}"
COUNT=$(npx tsc --noEmit -p "$TSCONFIG" 2>&1 | grep -E "error TS[0-9]+" | wc -l)
echo "Day-$(date +%j), ${LAYER}, ${COUNT}, $(date -Iseconds)" >> "$OUT"
echo "Layer ${LAYER}: ${COUNT} errors"
```

```bash
chmod +x scripts/measure-ts-errors.sh
```

- [ ] **Step 4：跑 L1 strict 错误清单（仅看，不修）**

```bash
npx tsc --noEmit -p tsconfig.core.json 2>&1 | grep -E "error TS" | head -50
```

预期看到 30-50 个 strict null/any 错误。

- [ ] **Step 5：批量修 L1 错误（按文件逐个修）**

按 `models/` 目录顺序：`character.ts` → `environment.ts` → `social.ts` → `battle.ts` → `item.ts` → `kungfu.ts` → `sect.ts` → `task.ts` → `imageGeneration.ts`。每个文件先 `npx tsc --noEmit` 看具体错误，再针对性修。

- [ ] **Step 6：跑 `dbService.ts` 的 strict 检查**

```bash
npx tsc --noEmit -p tsconfig.core.json 2>&1 | grep "dbService.ts"
```

按错误修。dbService 涉及 IndexedDB 类型，可能需要把 `IDBRequest<T>` 显式断言改成 `await req` 模式。

- [ ] **Step 7：跑 `services/ai/` 的 strict 检查**

```bash
npx tsc --noEmit -p tsconfig.core.json 2>&1 | grep "services/ai/"
```

按错误修。AI 客户端层是 `chatCompletionClient.ts` 的下游，主要错误是 `Promise<T>` 泛型推断。

- [ ] **Step 8：测量 L1 错误数趋势**

```bash
./scripts/measure-ts-errors.sh core
```

预期：相对 Day 2 基线下降 ≥ 30%。

- [ ] **Step 9：提交**

```bash
git add models/ services/dbService.ts services/ai/ scripts/measure-ts-errors.sh
git commit -m "fix(types): 开启 L1 strict 基础子集，修复 models/dbService/AI 客户端 null/any 错误"
```

### Day 3-7：L1 strictFunctionTypes / strictBindCallApply / strictPropertyInitialization

- [ ] **Step 1：Day 3 开启 strictFunctionTypes**

在 `tsconfig.core.json` 加 `"strictFunctionTypes": true`，跑 `npx tsc --noEmit -p tsconfig.core.json`，按错误修（重点：`Record<string, T>` 反向协变）。

- [ ] **Step 2：Day 4 开启 strictBindCallApply**

加 `"strictBindCallApply": true`，跑测试，按错误修。

- [ ] **Step 3：Day 5 开启 strictPropertyInitialization**

加 `"strictPropertyInitialization": true`，对所有类属性加 `!` 或在 constructor 初始化。**重点**：`useGameState.ts`、`dbService.ts` 的类。

- [ ] **Step 4：Day 6-7 L1 全量回归**

```bash
npm run build
npm run test:unit 2>/dev/null || echo "no test framework yet"
```

预期：build 成功，无新增 TS 错误。

- [ ] **Step 5：Day 7 提交（Week 1 收口）**

```bash
git add tsconfig.core.json models/ services/
git commit -m "fix(types): Day 3-7 L1 strictFunctionTypes/BindCallApply/PropertyInitialization 全开"
```

### Day 8-12：L1 noUncheckedIndexedAccess（最大杀伤力）

- [ ] **Step 1：Day 8 上午 09:00 团队同步**

本阶段预计暴露 80+ 错误。提前在团队频道说明：本阶段需要全栈 3-5 天修错误，每日同步进度。

- [ ] **Step 2：Day 8 下午 开启 noUncheckedIndexedAccess**

在 `tsconfig.core.json` 加 `"noUncheckedIndexedAccess": true`。

- [ ] **Step 3：测量错误增量**

```bash
npx tsc --noEmit -p tsconfig.core.json 2>&1 | grep -E "error TS" | wc -l
./scripts/measure-ts-errors.sh core
```

预期：错误数比 Day 7 末翻倍（~40 → ~80+）。

- [ ] **Step 4：按文件优先级修错误**

顺序：
1. `models/character.ts`（最高频 import）
2. `models/environment.ts`
3. `models/social.ts`
4. `models/battle.ts`
5. `dbService.ts`（IndexedDB record 访问）
6. `services/ai/chatCompletionClient.ts`

每个文件用 `npx tsc --noEmit -p tsconfig.core.json 2>&1 | grep "<file>"` 过滤错误。

- [ ] **Step 5：建立数组访问的安全模式**

所有 `arr[i]` 改为：
```ts
const item = arr[i];
if (!item) throw new Error(`arr[${i}] is undefined`);
```
或者用 `arr.at(i)` 配合 nullish coalescing：`const item = arr[i] ?? defaultValue;`。

- [ ] **Step 6：Day 12 末测量 L1 错误数**

预期：≤ 10 个 L1 错误（仅余难以修的小问题，留 Day 26-30 补漏阶段处理）。

- [ ] **Step 7：提交**

```bash
git add tsconfig.core.json models/ services/
git commit -m "fix(types): Day 8-12 L1 noUncheckedIndexedAccess 开启（最大杀伤力阶段完成）"
```

### Day 13-18：L1 exactOptionalPropertyTypes（与 NSFW/imageGen 特别处理）

- [ ] **Step 1：Day 13 开启 exactOptionalPropertyTypes**

```json
"exactOptionalPropertyTypes": true
```

- [ ] **Step 2：测量错误增量**

预期 +30-40 错误。

- [ ] **Step 3：分模块修**

按以下顺序修：
1. `models/apiConfig.ts`（API 配置 optional 字段最多）
2. `models/visualConfig.ts`（视觉设置 optional 字段）
3. `models/gameConfig.ts`（游戏配置 optional 字段）
4. `models/memoryConfig.ts`
5. `services/ai/imageGenerationConfig.ts`（与 imageGen 交互）

- [ ] **Step 4：React props 特殊处理**

`exactOptionalPropertyTypes` 与 React props 传递有 ~30 个组件冲突。原则：
- 组件 props 用 `?:` 显式可选
- 不传 undefined 时用 conditional spread：`{...(value !== undefined && { value })}`
- 已存在的 `@types/react` 内部冲突用 `// @ts-expect-error <reason>` 标注，**单 PR ≤ 5 个**

- [ ] **Step 5：Day 15 同步：局部解耦 prompts ↔ models**

按 spec R1 缓解措施，把 `prompts/core/index.ts` 中的 `import type` 改为 `import`，去掉循环。

```ts
// prompts/core/index.ts（修改前）
import { 角色数据结构 } from '../../models/character';
// 改为：
import type { 角色数据结构 } from '../../models/character';
```

```bash
npx madge --circular --extensions ts,tsx prompts/ models/ hooks/ 2>&1 | tee /tmp/madge-out.txt
git diff --stat prompts/ models/ | tee -a /tmp/madge-out.txt
```

- [ ] **Step 6：Day 18 末测量**

预期 L1 错误数 ≤ 5。

- [ ] **Step 7：提交（分两个 commit）**

```bash
# Commit 1: exactOptionalPropertyTypes
git add tsconfig.core.json models/ services/ components/
git commit -m "fix(types): Day 13-18 L1 exactOptionalPropertyTypes 开启 + 局部解耦 prompts↔models"

# Commit 2: 局部解耦
git add prompts/ models/
git commit -m "refactor(arch): 局部解耦 prompts/core ↔ models/types 命名导入（消除循环）"
```

### Day 19-25：L1 剩余 strict 旗标 + L2 起步

- [ ] **Step 1：Day 19 开启 L1 剩余旗标**

在 `tsconfig.core.json` 加：
```json
"noImplicitOverride": true,
"noFallthroughCasesInSwitch": true,
"useUnknownInCatchVariables": true
```

- [ ] **Step 2：Day 20 修 catch 变量类型错误**

`useUnknownInCatchVariables` 会让 `catch (e) { e.message }` 报错，必须改为：
```ts
catch (e) {
  const message = e instanceof Error ? e.message : String(e);
  // ...
}
```

- [ ] **Step 3：Day 21 创建 `tsconfig.l2.json`（hooks/utils/prompts 层）**

```json
{
  "extends": "./tsconfig.core.json",
  "include": [
    "hooks/useGame/**/*.ts",
    "hooks/useGame.ts",
    "utils/**/*.ts",
    "prompts/**/*.ts"
  ],
  "exclude": ["node_modules", "dist"]
}
```

- [ ] **Step 4：Day 22 开启 L2 strict**

加 `"strict": true`，L2 错误预计 ~30-50。

- [ ] **Step 5：Day 23-25 修 L2 错误**

顺序：`utils/` → `prompts/core` → `prompts/runtime` → `hooks/useGame` 子工作流。

每个文件用 `npx tsc --noEmit -p tsconfig.l2.json 2>&1 | grep "<file>"` 过滤。

- [ ] **Step 6：Day 25 末测量**

```bash
./scripts/measure-ts-errors.sh l2
```

预期：L2 错误数 ≤ 30。

- [ ] **Step 7：提交**

```bash
git add tsconfig.core.json tsconfig.l2.json hooks/ utils/ prompts/
git commit -m "fix(types): Day 19-25 L1 剩余 strict 旗标 + L2 起步（hooks/utils/prompts）"
```

### Day 26-30：L3 起步 + 补漏 + 豁免名单

- [ ] **Step 1：Day 26 修 L2 剩余错误**

目标：L2 错误数 ≤ 10。

- [ ] **Step 2：Day 27 创建 `tsconfig.l3.json`（components/App）**

L3 引用 L1 + L2：
```json
{
  "extends": "./tsconfig.app.json",
  "references": [{ "path": "./tsconfig.l2.json" }],
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": false
  }
}
```

- [ ] **Step 3：Day 28 开启 L3 strict（noUncheckedIndexedAccess 暂不开启）**

L3 错误预计 ~50（主要是 React props 的隐式 any）。

- [ ] **Step 4：Day 29 修 L3 错误**

顺序：`App.tsx` → `components/layout/` → `components/features/NewGame` → `components/features/Chat` → 剩余。

- [ ] **Step 5：Day 30 补漏 + 移除 `// @ts-ignore` 与 `as any`**

```bash
# 列出所有 @ts-ignore
grep -rE "@ts-ignore|as any" --include="*.ts" --include="*.tsx" . | grep -v node_modules > ts-ignore-list.txt
```

**强制 < 5 个豁免**。超出部分必须修。每条豁免需注明 issue 号与移除日期。

- [ ] **Step 6：建立 CI typecheck-strict job**

创建 `.github/workflows/typecheck-strict.yml`：

```yaml
name: typecheck-strict
on:
  pull_request:
    branches: [main]
  push:
    branches: [main]
jobs:
  typecheck-core:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npx tsc --noEmit -p tsconfig.core.json
      - run: npx tsc --noEmit -p tsconfig.l2.json
      - run: npx tsc --noEmit -p tsconfig.l3.json
```

- [ ] **Step 7：补 `package.json` 脚本**

```json
{
  "scripts": {
    "typecheck:strict": "tsc --noEmit -p tsconfig.core.json && tsc --noEmit -p tsconfig.l2.json && tsc --noEmit -p tsconfig.l3.json",
    "typecheck:layer": "tsc --noEmit -p tsconfig.${LAYER:-core}.json",
    "typecheck:error-count": "./scripts/measure-ts-errors.sh ${LAYER:-core}",
    "lint:type-trend": "tail -20 tsc-error-trend.txt"
  }
}
```

- [ ] **Step 8：Day 30 末测量所有 L 层错误数**

```bash
./scripts/measure-ts-errors.sh core
./scripts/measure-ts-errors.sh l2
./scripts/measure-ts-errors.sh l3
```

预期：核心层 0、L2 ≤ 30、L3 ≤ 50。

- [ ] **Step 9：提交（Week 4 收口）**

```bash
git add tsconfig.*.json package.json scripts/ .github/workflows/typecheck-strict.yml
git commit -m "feat(ci): Day 26-30 L3 strict 起步 + 补漏 + CI typecheck-strict job + 豁免名单"
```

---

## 验收标准（P2 完成）

- [ ] `tsconfig.core.json` 全 strict 旗标开启且 L1 错误数 = 0
- [ ] L2 错误数 ≤ 30
- [ ] L3 错误数 ≤ 50
- [ ] 散点错误 ≤ 20/周（基线 260+）
- [ ] CI `typecheck-strict` job 在 main + PR 上全绿
- [ ] 旧 commit 历史中出现过的 TS 错误码（TS2551/TS2395/TS2352/TS2308/TS2749/TS2740/TS2693/TS2559/TS2556/TS2554/TS2552/TS18004）全部归零
- [ ] `// @ts-ignore` 与 `as any` 总数 < 5，豁免名单记录在 `ts-ignore-list.txt` 并附 issue 号
- [ ] `package.json` 新增 4 个 typecheck 脚本并入 CI
- [ ] `tsc-error-trend.txt` 记录了 30 天的错误数趋势

---

## 风险与依赖

| ID | 风险 | 等级 | 缓解 |
|---|---|---|---|
| R1 | `prompts ↔ models ↔ hooks` 循环依赖在 strict 下暴露更多 TDZ | HIGH | Day 15 同步局部解耦 `prompts/core` ↔ `models/types` 命名导入；用 madge 验证 |
| R2 | `exactOptionalPropertyTypes` 与 React props 冲突（~30 组件） | MEDIUM | 优先用 `?:` 显式可选 + conditional spread；建立 `no-non-null-assertion` lint 规则 |
| R3 | strict 启用期间新功能合入被阻塞 | MEDIUM | "strict 例外"通道：单 PR ≤ 5 个 `@ts-expect-error` + issue 号 + 24h 移除 |
| R4 | 1502 个文件一次性 strict 不可行 | LOW | 已按 L1-L4 分层；每个 L 独立 strict 旗标开关 |
| R5 | L1 错误数下降 < 30%/周，milestone 失败 | MEDIUM | 暂停下一层开启，先集中力量修当前层；调高资源投入 |
| R6 | `useUnknownInCatchVariables` 改动量大 | LOW | Day 20 单日专攻；提供 codemod（ts-morph）批量改 `catch (e)` → `catch (e: unknown)` |

### 依赖

- 现有：Vitest（Phase 0 已装）、madge、ts-prune（Phase 0 已装）
- 新增：无（不需要新 npm 依赖）
- 团队：30 天内需要 1-2 人持续投入，Day 8 团队同步会议

---

## 与下一阶段衔接

- **P3 大文件拆分**（Day 31-45）依赖：本计划建立的 strict 类型系统为拆分提供类型推导保障
- **P5 测试体系**（Day 46-60）依赖：本计划暴露的 strict 错误修完后，子工作流可安全写测试
- **下轮 P1 文档归一化**：本计划产生的 `ts-ignore-list.txt` 与 `tsc-error-trend.txt` 需在文档归一化阶段迁入 `docs/technical/14-optimization-roadmap-v2.md` 章节

---

## 参考文档

- 父路线图：[2026-06-06-project-optimization-roadmap-v2-design](../../superpowers/specs/2026-06-06-project-optimization-roadmap-v2-design.md)
- v1.0 总体路线图：[2026-06-03-project-optimization](../2026-06-03-project-optimization.md)
- 性能与模块化（已闭环）：[13b-performance-modularization](../../technical/13b-performance-modularization.md)
- State 模块化：[02-state-modularization](../../technical/02-state-modularization.md)
- 测试策略：[11-testing-strategy](../../technical/11-testing-strategy.md)
- 错误处理：[12-error-handling](../../technical/12-error-handling.md)
- 项目规则：`/home/fz/.claude/rules/common/testing.md`（TDD/AAA 模式）
- TypeScript handbook：https://www.typescriptlang.org/tsconfig#strict
