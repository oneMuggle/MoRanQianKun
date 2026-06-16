# 根目录 src/ 迁移计划

> **状态**: 进行中
> **创建日期**: 2026-06-16
> **目标分支**: `refactor/migrate-to-src-layout`
> **关联决策**: 用户选定 P0 方案 A（统一到 `src/`）
> **前置清理**: `docs/plans/2026-06-09_root-dir-cleanup.md`（已完成，PR#2）—— 本计划解决该次未触及的源码布局问题

---

## 1. 背景与目标

### 1.1 当前问题

项目根目录存在 **59 个条目**，源码呈"半迁移"状态：

| 类型 | 位置 | 说明 |
|------|------|------|
| 入口文件 | `/App.tsx`、`/index.tsx`、`/types.ts` | 散落根目录 |
| 主源码 | `/components/`、`/hooks/`、`/services/` 等 | 老结构（直接挂在根） |
| 新增源码 | `/src/utils/`、`/src/test-utils/` | 新结构（部分迁移） |
| 业务子模块 | `/core/`、`/modules/` | 独立架构目录 |

**关键症状：**
- `index.tsx` 已出现混合导入：`./App`（根）+ `./src/utils/browserErrorMonitor`（src/）
- 128 个文件 `import ... from './types'` 引用根目录类型
- `@/*` 别名在 `tsconfig.base.json` 与 `vite.config.ts` 都已配置但指向根
- 新人 onboarding 时无法判断"代码该放哪"

### 1.2 目标

- ✅ 所有应用源码（`App.tsx`、`components/`、`hooks/`、`services/`、`utils/`、`models/`、`data/`、`prompts/`、`styles/`、`contexts/`、`__tests__`）统一进入 `src/`
- ✅ `@/*` 别名改为指向 `src/*`，全代码库改用 `@/...` 引用
- ✅ 根目录仅保留：构建配置、CI 配置、入口约定文件（`index.html`、`index.tsx`）、文档、`.env.*`、`public/`
- ✅ 保留 `android/`、`capacitor.config.ts`、`metadata.json` 等移动端配置（不强行合并，由 CI workflow 自然接管）
- ✅ 不破坏任何现有功能；`npm run lint / build / test` 全绿

### 1.3 非目标

- ❌ 不修改 `core/` 和 `modules/` 的内部结构（这两个是独立架构目录，不属于本次迁移范围）
- ❌ 不修改 `android/`、`functions/`、`r2-worker/`、`scripts/`、`e2e/`
- ❌ 不删任何 `.md` 文档
- ❌ 不修改 `App.tsx` 内部实现（仅移动位置 + 修 import）
- ❌ 不合并/删除 tsconfig 子文件（仅修改 `base.json` 的 `paths`，子文件单独评估）

---

## 2. 涉及的文件与模块

### 2.1 移动清单（git mv）

| 当前位置 | 目标位置 |
|----------|----------|
| `/App.tsx` | `/src/App.tsx` |
| `/types.ts` | `/src/types.ts` |
| `/components/` | `/src/components/` |
| `/hooks/` | `/src/hooks/` |
| `/contexts/` | `/src/contexts/` |
| `/services/` | `/src/services/` |
| `/utils/` | `/src/utils/` |
| `/models/` | `/src/models/` |
| `/data/` | `/src/data/` |
| `/prompts/` | `/src/prompts/` |
| `/styles/` | `/src/styles/` |
| `/__tests__/` | `/src/__tests__/` |
| `/App.test.tsx` | `/src/App.test.tsx` |

**冲突处理：**
- `/src/utils/` 已存在 `basePath.ts` + `browserErrorMonitor.ts`（来自 PR#4），但根 `/utils/` 没有同名文件 → **无冲突**，合并到统一目录即可
- `/src/test-utils/` 已存在 → 与根 `/__tests__/` 不冲突，保留

### 2.2 配置修改清单

| 文件 | 改动 |
|------|------|
| `/tsconfig.base.json` | `paths: { "@/*": ["./*"] }` → `"./src/*"` |
| `/vite.config.ts` | `alias: { '@': path.resolve(__dirname, '.') }` → `path.resolve(__dirname, './src')` |
| `/index.tsx` | `import App from './App'` → `'./src/App'`（index.tsx 仍在根，App 在 src/） |
| `/App.test.tsx` | `import App from './App'` → 同上 `'./src/App'` |

### 2.3 import 路径批量修改（预计 ~130 处）

- `from './types'` → `from '@/types'`（128 处）
- `from '../types'` → `from '@/types'`（少量）
- `from './components/...'` → `from '@/components/...'`（可选，建议改以减少相对路径深度）
- `from '../utils/X'` → `from '@/utils/X'`（建议改）
- `from './src/utils/X'` → `from '@/utils/X'`（3 处，`index.tsx` 等已用 `./src/` 路径的）

**策略：** 使用 `sed`/`VS Code 全局替换` 一次性处理；然后跑 TypeScript 检查遗漏。

### 2.4 CI / Workflow 检查

- `.github/workflows/ci.yml` 触发条件为 PR/push to main，**无 paths 过滤** → 无需改
- `.github/workflows/{android,deploy,lighthouse,release,test-coverage}.yml` 同上 → 无需改
- ⚠️ 但需确认 workflows 里的命令路径仍是根路径（`npm run build` 等） → 应当不受影响

---

## 3. 技术方案

### 3.1 目录结构（迁移后）

```
/
├── index.html              ← Vite 入口（保持根）
├── index.tsx               ← React 入口（保持根，import './src/App'）
├── package.json            ← 保持根
├── vite.config.ts          ← alias 改为 src/
├── vitest.config.ts        ← 确认 include 覆盖 src/
├── tsconfig*.json          ← base paths 改 src/
├── .env.*                  ← 保持根
├── .github/                ← CI
├── public/                 ← 静态资源
├── android/                ← Capacitor Android
├── capacitor.config.ts     ← Capacitor 配置
├── metadata.json           ← Capacitor metadata
├── functions/              ← Cloudflare Functions
├── r2-worker/              ← R2 Worker
├── scripts/                ← 构建脚本（PowerShell 等）
├── e2e/                    ← Playwright E2E
├── docs/                   ← 文档
├── artifacts/              ← 归档（baseline、report）
├── references/             ← 参考资料
├── core/                   ← 业务子模块（不迁移）
├── modules/                ← 业务子模块（不迁移）
└── src/                    ← ⭐ 新增：所有应用源码
    ├── App.tsx
    ├── App.test.tsx
    ├── types.ts
    ├── components/
    ├── hooks/
    ├── contexts/
    ├── services/
    ├── utils/
    ├── models/
    ├── data/
    ├── prompts/
    ├── styles/             ← 从 /styles/ 迁入
    ├── __tests__/
    └── test-utils/         ← 已存在，保留
```

### 3.2 别名约定

```jsonc
// tsconfig.base.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]   // 单一根别名，覆盖所有 src 下子模块
    }
  }
}
```

```ts
// vite.config.ts
resolve: {
  alias: {
    '@': path.resolve(__dirname, './src'),
  }
}
```

### 3.3 styles/ 的处理决定

`/styles/` 目录（含 `tailwind.css`、`mobileDevice.css` 等）当前被 `/index.tsx` 用 `./styles/...` 引入。
**方案：** 一并迁入 `src/styles/`，index.tsx 改为 `./src/styles/...`。
**理由：** 样式代码属于应用源码一部分；不迁入会留下第二处源码散点。

---

## 4. 实施步骤（按依赖顺序）

### [ ] 步骤 1：建测试基线
- **执行人**: Claude
- **输出**: 测试通过日志
- **验收**: `npm test -- --run` 全绿；`npm run lint` 0 错；`npm run build` 成功

### [ ] 步骤 2：建 feature 分支
- **执行人**: Claude
- **命令**: `git switch -c refactor/migrate-to-src-layout`
- **验收**: 分支创建并切到该分支

### [ ] 步骤 3：批量 git mv（一次性完成）
- **执行人**: Claude
- **命令**: 见 §2.1
- **验收**: `git status` 只见 renamed 状态，无 untracked

### [ ] 步骤 4：修改 tsconfig.base.json + vite.config.ts
- **执行人**: Claude
- **验收**: 配置修改完成，diff 干净

### [ ] 步骤 5：批量 import 路径替换
- **执行人**: Claude（用 sed/Edit 全局替换）
- **策略**:
  - `'./types'` → `'@/types'`
  - `'./App'`（仅在 index.tsx 与 App.test.tsx 中）→ `'./src/App'`
- **验收**: `npm run build` 类型检查 0 错

### [ ] 步骤 6：局部残留修正
- **执行人**: Claude
- **内容**: 处理任何相对深度路径（如 `../../types`），统一改 `@/types`
- **验收**: `grep -r "from ['\"]\./types['\"]" src/` 输出为空

### [ ] 步骤 7：lint + build + test 三件套
- **执行人**: Claude
- **验收**: 全部 0 错 0 警告（lint 警告评估后处理）

### [ ] 步骤 8：本地手动 smoke
- **执行人**: Claude（用 `npm run dev` 启动，目视确认主页 + 关键路由）

### [ ] 步骤 9：commit + push + PR
- **执行人**: Claude
- **commit message**: `refactor(layout): migrate app source into src/ directory (#X)`
- **PR base**: main
- **PR 标题**: 同 commit message
- **PR body**: 列出迁移清单 + 测试结果

### [ ] 步骤 10：等 CI + AI review + 用户 merge
- **执行人**: Claude（监控 + 报告）+ 用户（最终 merge）

### [ ] 步骤 11：归档
- **执行人**: Claude
- **动作**: 把本文档复制到 `docs/technical/02-src-layout-migration.md`，**删除** `docs/plans/2026-06-16_src-layout-migration.md`
- **附录章节**: 列出最终目录树 + 经验教训

---

## 5. 风险评估与依赖

### 5.1 风险

| 风险 | 概率 | 影响 | 缓解 |
|------|------|------|------|
| 路径批量替换遗漏 | 中 | build 失败 | 步骤 6 用 grep 兜底 |
| Vite alias 与 tsconfig paths 不一致 | 低 | dev server 路径错误 | 两个文件同时改，验证 dev server 启动 |
| 测试覆盖率统计路径变化 | 中 | CI 数字跳动 | `vitest.config.ts` 同步调整 coverage include |
| PR 体积过大（>500 文件变更） | 高 | review 难 | 用 `--diff-merges=first-parent` 让 reviewer 看树结构 + 单测通过即可信 |
| Capacitor 打包路径找不到 | 低 | Android 构建失败 | 评估 `vite.config.ts` 的 `build.outDir` 是否仍指向 `dist/`（应不受影响） |
| `core/` `modules/` 里有相对路径跳出 | 中 | 类型错误 | 步骤 5 完成后跑 `tsc --noEmit`，若 core/modules 内有错，独立 PR 处理 |
| CI 上的 `actions/cache` key 变化 | 低 | cache miss | 不用管，cache 会自动重建 |

### 5.2 依赖

- 依赖本地 Node 20 + npm
- 依赖 `npm run build` 在迁移前已绿（步骤 1 验证）
- 不依赖任何外部服务
- 不依赖用户操作（除最后 merge）

### 5.3 不动项

- `core/`、`modules/` 内部结构
- `android/`、`capacitor.config.ts`、`metadata.json`、`functions/`、`r2-worker/`、`scripts/`、`e2e/`
- 任何文档（`README.md`、`CLAUDE.md` 等）
- `App.tsx`、`useGame.ts` 等内部业务逻辑

---

## 6. 验收标准

- [ ] `src/` 目录包含本次迁移的所有子目录（components/hooks/services/utils/models/data/prompts/styles/__tests__/test-utils）
- [ ] 根目录除 `core/` `modules/` `android/` 等保留项外，**不再有** `App.tsx`、`types.ts`、`components/`、`hooks/`、`contexts/`、`services/`、`utils/`、`models/`、`data/`、`prompts/`、`styles/`、`__tests__/`
- [ ] `@/*` 别名指向 `src/*`，`tsconfig` 与 `vite.config.ts` 一致
- [ ] `index.tsx` 与 `App.test.tsx` 的 `import App` 路径指向 `./src/App`
- [ ] `npm run lint` 0 错
- [ ] `npm run build` 成功，bundle 大小变化 < 5%
- [ ] `npm test -- --run` 全绿
- [ ] `npm run dev` 启动成功，主页正常渲染
- [ ] 根目录文件条目数从 59 降到 ≤ 40（仅保留必要的配置/文档/平台入口）

---

## 7. 附录

### 7.1 迁移前根目录概览（59 项）

```
AGENTS.md                              android/                       App.test.tsx
App.tsx (22586B)                       artifacts/                     .astgreprc.yml
capacitor.config.ts                    .claude/                       CLAUDE.md
CODE_OF_CONDUCT.md                     components/                    contexts/
CONTRIBUTING.md                        core/                          coverage/
data/                                  dist/                          docs/
e2e/                                   .env.local                     .env.production
.env.r2.example                        eslint.config.js               functions/
.github/                               .gitignore                     hooks/
index.html                             index.tsx                      LICENSE
lighthouserc.json                      metadata.json                  models/
modules/                               node_modules/                  .opencode/
package.json                           package-lock.json              playwright.config.ts
.playwright-mcp/                        postcss.config.cjs             PROJECT_STRUCTURE.md
prompts/                               public/                        r2-worker/
README.md                              references/                    resources/
.ruff_cache/                           scripts/                       SECURITY.md
services/                              src/                           styles/
__tests__/                             .tmp/                          tsconfig.app.json
tsconfig.base.json                     tsconfig.core.json             tsconfig.core.README.md
tsconfig.json                          tsconfig.l2.json               tsconfig.strict.json
tsconfig.strict.README.md              tsconfig.vitest.json           types.ts
utils/                                 .vite/                         vite.config.ts
vitest.config.ts                       .vscode/
```

### 7.2 关键文件 import 依赖（迁移前）

- `from './types'` 引用方：**128 个文件**（详见步骤 5）
- `from './App'` 引用方：**2 个文件**（`index.tsx`、`App.test.tsx`）
- `from './src/utils/...'` 引用方：**1 个文件**（`index.tsx`，已用新约定）

### 7.3 关联文档

- 上游决策：本计划完成后归档到 `docs/technical/02-src-layout-migration.md`
- 项目总览：`CLAUDE.md` 第 8 节（开发流程）
- 分支策略：`~/.claude/rules/common/feature-branch-workflow.md`
- CI/CD 流程：`~/.claude/rules/common/cicd-workflow.md`
- 前置清理：`docs/plans/2026-06-09_root-dir-cleanup.md`（已完成 PR#2）
