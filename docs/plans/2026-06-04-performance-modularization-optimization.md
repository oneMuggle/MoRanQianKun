# 项目性能与模块化优化方案

> **与既有方案的关系**
>
> 本文件是 `2026-06-03-project-optimization.md`（8 阶段全量方案）Phase 7（性能与构建优化）的**专题深度版**。
>
> - **全量版**（旧）：覆盖 8 个 Phase、约 26 天、含文档归一化 / TS 严格度 / 测试体系 / i18n
> - **本文件**（新）：聚焦"性能 + 模块化/按需加载"两点，约 10-15 天，含**实测 chunk 体积数据**、`vite.config.ts` 具体的 `manualChunks` 拆分规则、`index.tsx` 同步注册消除、`useGame` 1196 行领域切片化、feature flag 按需激活、Lighthouse CI
>
> 两者**不冲突、可并行**。完成本文件后，应把"专题深度"内容回写合并到全量版的 Phase 7 章节，然后归档本文件。

> **For agentic workers:** 路线图文档，分阶段执行。每阶段独立可验证。
> **Goal:** 削减首屏 JS 体积 50%+，建立"按需激活"的功能模块体系，避免模块叠加导致整体臃肿。
> **Architecture:** 三层策略并行——(1) 拆 vendor/game-runtime 大块 chunk；(2) 改造同步模块注册为异步按需加载；(3) 拆分 `useGame` 巨型钩子为领域切片。
> **Tech Stack:** Vite 6 manualChunks、React 19 Suspense、Zustand 5 切片、TypeScript 5.8、IndexedDB

---

## 0. 现状基线（2026-06-04 实测）

### 0.1 构建产物（dist/assets 排序前 10）

| Chunk | 体积 | 内容推断 | 状态 |
|-------|------|---------|------|
| `vendor-DejTZOyi.js` | **3.62 MB** | React 19、react-dom、fflate、js-tiktoken 等所有 node_modules | 🔴 巨型，阻塞首屏 |
| `game-runtime-*.js` | **2.85 MB** | prompts + models + services/ai + useGame 全量 + utils/apiConfig | 🔴 巨型 |
| `settings-panels-*.js` | 494 KB | 22+ Settings 子面板合并块 | 🟡 偏大，可按域拆 |
| `EraSelector-*.js` | 465 KB | 时代资产/主题方案 | 🟡 偏大 |
| `index-*.js`（entry） | 326 KB | App.tsx + 核心提示词 + module-registry | 🟡 偏大 |
| `index-*.css` | 302 KB | Tailwind 编译输出 | 🟡 需 purge 审计 |
| `image-manager-desktop` | 196 KB | Social 模态的图集 | 🟢 可接受 |
| `MobileDeviceModal` | 154 KB | 移动端设备模态 | 🟢 可接受 |
| `image-manager-mobile` | 115 KB | 移动端图集 | 🟢 可接受 |
| `SocialModal` | 71 KB | 社交模态 | 🟢 正常 |

**首屏合计：~7.1 MB JS + 302 KB CSS = 7.4 MB 需在点击"开始游戏"前下载并解析。**

### 0.2 模块化现状（已有基础，但有断点）

✅ **已实现：**
- `创建可预加载懒组件()`（`components/features/lazyComponents.tsx`）：所有 22+ 功能模态用 `React.lazy` 懒加载
- 每个功能有 `desktop` / `mobile` 两个变体，各自有独立 chunk
- `vite.config.ts` 已配置 `manualChunks`：prompts + models + useGame → `game-runtime`
- 独立大块：`image-manager-desktop/mobile`、`settings-unified-entry`、`settings-panels`、`era-*` / `nsfw-*` / `biz-*`

🟡 **存在断点：**
- `index.tsx:6` 同步 `import './modules/contemporary'` —— 把 6 个 NSFW 子模块的注册文件（bar/bdsm/board/campus/exposure/photography/urban-driver）打入 entry chunk
- `core/module-registry/` 与 `utils/moduleRegistry/` **两套并存**（目录结构相同、内容不同），`App.tsx` 已迁到新 `core/`，但 `utils/moduleRegistry/` 仍在 `bootstrap.ts` 中被 import
- `App.tsx:18` 同步 `import { 核心提示词 } from './prompts/core-prompts'` —— 强制进入 entry
- `App.tsx:20` 同步 `import` 6 个立即渲染的全局组件（MusicProvider / ToastManager / ErrorBoundary / FPSDisplay / PerformanceDashboard / 懒加载边界）

🔴 **关键瓶颈：**
- `hooks/useGame.ts`（1196 行、78 个 import）作为统一外观，导入 130 个子工作流文件——一个钩子集中了网络、状态、动作、AI、图片、记忆、规划、保存、设置等多领域
- `hooks/useGame/` 130 个文件按"动词+名词"散列（academicWorkflow.ts、bdsmMeetingWorkflow.ts、campusForumWorkflow.ts、deviceNotificationWorkflow.ts…），无统一目录约定
- `components/features/Settings/` 37 个 `.tsx` 兄弟组件，每个 `React.lazy` 但全部合并进 `settings-panels` 494 KB 块
- `services/ai/text` 整包导入（`useGame.ts:13: import * as textAIService from '../services/ai/text'`）—— 用通配导入把全部 AI 客户端代码拉进 game-runtime

### 0.3 node_modules 体积风险

```
22M  /node_modules/js-tiktoken
12M  /node_modules/puppeteer-core
12M  /node_modules/playwright-core
```

- `js-tiktoken` 应只在 dev/test 阶段使用（如 `tokenEstimate.ts`），需确认是否进入生产 bundle
- `puppeteer-core` / `playwright-core` 仅供 E2E 测试（`@playwright/test`），应通过 devDependency 隔离

---

## 1. 优化目标

| 指标 | 当前 | 目标（阶段 7 末） | 达成路径 |
|------|------|------------------|----------|
| 首屏 JS 体积 | 7.1 MB | **≤ 2.5 MB** | 拆 vendor、拆 game-runtime、异步注册 |
| entry chunk | 326 KB | **≤ 100 KB** | 移除 核心提示词 同步导入、懒注册 |
| game-runtime | 2.85 MB | **≤ 1.2 MB** | 拆 prompts/models/AI services 三个独立 chunk |
| vendor | 3.62 MB | **≤ 1.5 MB** | React/fflate/js-tiktoken 拆分 |
| settings-panels | 494 KB | **≤ 200 KB** | 按域拆 4 个子块（api/visual/nsfw/debug） |
| useGame.ts 行数 | 1196 | **≤ 500** | 拆为领域门面 + Zustand 切片 |
| 同步注册模块数 | 7 个 NSFW | **0** | 全部改为运行时按 `gameConfig` 异步激活 |

---

## 2. 阶段化实施路线

### 阶段 0：基线固化（半天）

**目标：** 把当前 dist 体积钉在 CI 上，防止后续优化无法量化。

**任务：**

- [x] **0.1 添加 `size-limit` 预算** —— `package.json` 增加：
  ```json
  "size-limit": [
    { "name": "entry",       "path": "dist/assets/index-*.js",        "limit": "350 KB" },
    { "name": "vendor",      "path": "dist/assets/vendor-*.js",       "limit": "3.7 MB" },
    { "name": "game-runtime","path": "dist/assets/game-runtime-*.js", "limit": "3.0 MB" }
  ]
  ```
- [x] **0.2 添加体积检查到 CI** —— `.github/workflows/*.yml` 在 build 后跑 `npx size-limit`，超阈值失败
- [x] **0.3 跑一次 `npm run metrics:baseline`** 并把结果 commit 到 `artifacts/baseline-2026-06-04.json`
- [x] **0.4 跑一次 `npm run build` 记录 raw 输出**（`artifacts/build-2026-06-04.txt`）作为对比基准

**验证：** `npm run build` 后查看新生成 `artifacts/baseline-2026-06-04.json` 与 size-limit 报告。

**Commit：** `chore(perf): 钉定构建体积基线（size-limit + CI 校验）`

---

### 阶段 1：拆分巨型 chunk（1-2 天）

**目标：** 不动业务代码，纯靠 `vite.config.ts` 的 `manualChunks` 把大块拆成多个 ≤ 800 KB 的可独立缓存块。

#### Task 1.1：拆分 vendor 块 ✅

**Files:**
- Modify: `vite.config.ts:78-90`

**当前规则：**
```ts
if (normalizedId.includes('/node_modules/')) {
  if (normalizedId.includes('/fflate/')) return 'fflate-vendor';
  if (normalizedId.includes('/@google/genai/')) return 'ai-sdk-vendor';
  return 'vendor';
}
```

**改造为：**
```ts
if (normalizedId.includes('/node_modules/')) {
  if (normalizedId.includes('/react/') || normalizedId.includes('/react-dom/') ||
      normalizedId.includes('/scheduler/')) {
    return 'react-vendor';
  }
  if (normalizedId.includes('/fflate/'))   return 'fflate-vendor';
  if (normalizedId.includes('/js-tiktoken/')) return 'tiktoken-vendor';
  if (normalizedId.includes('/@google/genai/') || normalizedId.includes('/openai/') ||
      normalizedId.includes('/@anthropic-ai/')) {
    return 'ai-sdk-vendor';
  }
  if (normalizedId.includes('/zustand/')) return 'state-vendor';
  return 'vendor-misc';
}
```

**预期效果：**
- `react-vendor` 单独缓存（约 200 KB），二次访问秒开
- `tiktoken-vendor` 独立后，**主流程不调用 `tokenEstimate` 时不下载**
- `ai-sdk-vendor` 独立后，**主流程未配置 AI 时不下载**

**验证：** `npm run build` 后检查 `dist/assets/`，应出现 `react-vendor-*.js`、`tiktoken-vendor-*.js`、`ai-sdk-vendor-*.js` 三个新文件且总和 ≤ 1.5 MB。

**Commit：** `perf(build): 拆分 vendor 块为 react/fflate/tiktoken/ai-sdk/misc`

#### Task 1.2：拆分 game-runtime 大块 ✅ (2026-06-04)

**Files:**
- Modify: `vite.config.ts`

**当前：**
```ts
if (
  normalizedId.includes('/prompts/') ||
  normalizedId.includes('/models/') ||
  normalizedId.includes('/services/ai/') ||
  normalizedId.includes('/hooks/useGame/') ||
  normalizedId.endsWith('/hooks/useGame.ts')
) {
  return 'game-runtime';
}
```

**问题：** 2.85 MB 单一 chunk，所有模态首次打开都要拉取。

**改造为：**
```ts
// prompts 独立（变化频率低，可被浏览器长期缓存）
if (normalizedId.includes('/prompts/core/') || normalizedId.includes('/prompts/writing/')) {
  return 'prompts-core';
}
// 运行时提示词（每个 NSFW 子系统不同，体积分散）按文件夹切
if (normalizedId.includes('/prompts/runtime/')) {
  return 'prompts-runtime';
}
// 模型类型定义独立
if (normalizedId.includes('/models/')) {
  return 'models-types';
}
// AI 客户端独立
if (normalizedId.includes('/services/ai/')) {
  return 'ai-clients';
}
// useGame 主入口
if (normalizedId.includes('/hooks/useGame/') || normalizedId.endsWith('/hooks/useGame.ts')) {
  return 'useGame-runtime';
}
```

**预期效果：**
- `prompts-core` 约 200 KB，独立缓存
- `prompts-runtime` 约 400 KB（如果某些 NSFW 子系统的提示词被打进 useGame 触发链，可再按子域拆）
- `models-types` 约 300 KB
- `ai-clients` 约 200 KB
- `useGame-runtime` 降至 ~1.2 MB

**风险：** 当前 `prompts → models → useGame` 存在循环 import，被强制打包到 `game-runtime` 避开了 ESM TDZ。拆分时需要确认边界安全。

**验证：** `npm run build` 后用 `npx vite-bundle-visualizer` 或 dist 大小对比，确保总和没有增加（拆开后总计应略小于 2.85 MB，因为没有重复）。

**实际结果 (2026-06-04)：**

| Chunk | 原始字节 | 原始 KB | 压缩后 (gzip) |
|---|---|---|---|
| `prompts-core-*.js` | 189,431 | 185 KB | 66.93 KB |
| `prompts-runtime-*.js` | 412,009 | 402 KB | 152.17 KB |
| `models-types-*.js` | 606,805 | 593 KB | 189.55 KB |
| `ai-clients-*.js` | 199,143 | 194 KB | 62.91 KB |
| `useGame-runtime-*.js` | 1,359,288 | 1,327 KB | 360.26 KB |
| **合计** | **2,766,676** | **2,701 KB** | **831.82 KB** |

原 `game-runtime-*.js` 2,862,521 字节 (2,795 KB) → 拆分后合计 2,766,676 字节 (2,701 KB)，比原来减少 95,845 字节 (约 3.3%)，**未出现重复**。

`size-limit` 的 `game-runtime` budget 已更新为 glob `dist/assets/*-runtime-*.js` (3.0 MB 上限)，实测 brotli 387.53 kB ✅

`models-types` 比预期大 (593 KB vs 300 KB)，`useGame-runtime` 仍超过 1.2 MB 目标 (1,327 KB)。原因推测：`models/` 下的子目录 (era-config、bdsmNSFW、boardGameNSFW、campusNSFW、contemporary、dailyTown 等) 都包含 JSON/数据；`useGame/` 子工作流密集 import models + ai-clients + prompts-runtime。下一阶段可考虑：(a) 把 models/ 拆为 `models-domain` + `models-data` 两块；(b) 把 useGame 中静态导入的 prompts 改为动态 import。

**Commit：** `perf(build): 拆分 game-runtime 为 prompts/models/ai-clients/useGame 四块`

#### Task 1.3：拆分 settings-panels ✅ (2026-06-04)

**Files:**
- Modify: `vite.config.ts`

**当前：** SettingsPanel 下 22 个子面板全部合并到 `settings-panels` 494 KB。

**改造为按功能域拆：**
```ts
if (normalizedId.includes('/components/features/Settings/Api')) {
  return 'settings-api';
}
if (normalizedId.includes('/components/features/Settings/Image')) {
  return 'settings-image';
}
if (normalizedId.includes('/components/features/Settings/NSFW')) {
  return 'settings-nsfw';
}
if (normalizedId.includes('/components/features/Settings/Debug') ||
    normalizedId.includes('/components/features/Settings/MobileDebug') ||
    normalizedId.includes('/components/features/Settings/ContextViewer') ||
    normalizedId.includes('/components/features/Settings/HistoryViewer')) {
  return 'settings-debug';
}
if (normalizedId.includes('/components/features/Settings/')) {
  return 'settings-panels';
}
```

**预期效果：** 玩家首次打开设置 → 下载通用 `settings-panels` ~150 KB；切换到 API 标签 → 下载 `settings-api` ~120 KB；调试类标签独立。

**注意：** 需要把现有文件名按"分类前缀"重命名（如 `ApiSettings.tsx` → `Api/ApiSettings.tsx`），属于 Task 1.3 的子步骤。

**验证：** 打开设置页 → Network 面板确认第一次只下载 `settings-panels` + `settings-unified-entry`，切到"接口设置"标签时按需下载 `settings-api`。

**Commit：** `perf(build): 按域拆 settings-panels 为 api/image/nsfw/debug`

#### Task 1.4：审计 CSS 体积

**Files:**
- Modify: `tailwind.config.cjs`
- Possibly: `styles/tailwind.css`

**任务：**
- [x] 跑 `npx tailwindcss --input styles/tailwind.css --output /tmp/purged.css` 对比体积
- [x] 检查 `content` 配置是否覆盖 `index.html` + 全部 `*.tsx` + `*.ts`
- [x] 移除未使用的 `safelist` 项
- [x] 检查是否有内联 `<style>` 块绕过 purge

**目标：** CSS 302 KB → ≤ 180 KB

**实际结果（2026-06-04）：**
- dist CSS = **295 KB**（gzip 38.99 KB），与基线 302 KB 几乎持平
- 已验证：content 路径完整、无 safelist bloat、无内联 style 绕过 purge
- 274 KB purged 输出中 248 KB（90%）是源码实际使用的工具类
- **目标 ≤ 200 KB 在不动源码的情况下不可达**（需源码级重构或切换 CSS 架构）

**结论：** Tailwind purge 已正确工作，CSS 处于当前架构的实用最低值。

**Commit：** ❌ 无 commit（条件式"如果 CSS 体积下降"未满足）

---

### 阶段 2：消除同步模块注册（2-3 天）

**目标：** 把 `index.tsx` 与 `core/module-registry/bootstrap.ts` 中的所有同步模块注册改为基于 `gameConfig` 的运行时异步激活。

#### Task 2.1：消灭 `index.tsx` 的同步 NSFW 注册 ✅ (2026-06-04)

**Files:**
- Modify: `index.tsx:6`
- Delete: `modules/contemporary/index.ts`（6 行同步 import，迁移为异步动态）

**当前：**
```ts
// index.tsx
import './modules/contemporary'; // 注册现代纪元故事模块
import App from './App';
```

**改造为：**
```ts
// index.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/tailwind.css';
import './styles/mobileDevice.css';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}
const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

**App.tsx 内部按 gameConfig 异步注册**：
```ts
// App.tsx useEffect 内
const { nsfwModules, eraModules } = await import('./modules');
const cfg = state.gameConfig;
if (cfg?.启用校园NSFW深化系统) {
  const mod = nsfwModules['nsfw-campus'];  // 动态 import()，独立 chunk
  if (mod) {
    const { manifest } = await mod();
    loader.register(manifest);
    await loader.activate(manifest.id);
  }
}
// ... 其他 NSFW 子系统同模式
```

**预期效果：**
- 关闭 NSFW 的玩家：永远不下载 6 个 NSFW 子模块（每个 ~50 KB）
- 开启校园 NSFW 但不开 BDSM 的玩家：只下载 campus 不下载 bdsm

**Commit：** `perf(bootstrap): 移除 index.tsx 同步 NSFW 注册，改为运行时按 gameConfig 异步激活`

#### Task 2.2：合并两套 module-registry

**Files:**
- Confirm target: `core/module-registry/`（App.tsx 已用此）
- Migrate callers of: `utils/moduleRegistry/`
- Delete: `utils/moduleRegistry/`（确认无引用后删除）

**验证步骤：**
```bash
grep -rln "utils/moduleRegistry" --include="*.ts" --include="*.tsx" .
# 若有命中，逐个迁移到 core/module-registry
rm -rf utils/moduleRegistry
```

**风险：** 旧注册器可能有未迁移的注册中心。需 `npm run build` 确认无 import 错误。

**Commit：** `refactor(registry): 合并 core/module-registry 与 utils/moduleRegistry，移除遗留副本`

#### Task 2.3：懒加载核心提示词

**Files:**
- Modify: `App.tsx:18, 35-37`

**当前：**
```ts
import { 核心提示词 } from './prompts/core-prompts';
// ...
const promptTexts = 核心提示词.map(p => p.内容).filter(Boolean);
PromptRegistry.registerCoreMany(promptTexts);
```

**改造为：**
```ts
// App.tsx 顶部移除 import

// useEffect 内部
const { 核心提示词 } = await import('./prompts/core-prompts');
const promptTexts = 核心提示词.map(p => p.内容).filter(Boolean);
PromptRegistry.registerCoreMany(promptTexts);
```

**预期效果：** `prompts/core-prompts` 进入独立 chunk（Task 1.2 已拆），按需加载。

**Commit：** `perf(prompts): 懒加载核心提示词，移出 entry chunk`

#### Task 2.4：审计 `useGame` 内的通配 import

**Files:**
- Modify: `hooks/useGame.ts:13`

**当前：**
```ts
import * as textAIService from '../services/ai/text';
```

**问题：** 整包导入所有 AI 文本客户端。

**改造为命名导入：**
```ts
import { chatCompletionRequest, streamChatCompletion } from '../services/ai/text';
// 然后把代码中所有 textAIService.xxx 改为 xxx
```

**收益：** 减少 game-runtime 体积，避免触发 `services/ai/text` 下未使用的子模块。

**验证：** 全文搜索 `textAIService\.` 替换为新名；`npm run build` 通过。

**Commit：** `perf(ai): useGame 改用命名导入替代通配符 import * as textAIService`

---

### 阶段 3：useGame 领域切片化（3-5 天）

**目标：** 把 1196 行的 `useGame.ts` 拆为"门面 + 领域切片 + Zustand store"的现代 React 状态架构。

#### Task 3.1：盘点 hooks/useGame/ 130 个文件并按领域分组

**Files:**
- Read: `hooks/useGame/`
- Create: `hooks/useGame/domains/README.md`（领域划分说明）

**预期分组（基于现有文件名前缀）：**

| 领域 | 子目录 | 现状文件示例 |
|------|--------|-------------|
| `image/` | 已有 | npcImageStateWorkflow、sceneImageArchiveWorkflow、playerImageWorkflow、manualImageActionsWorkflow、imagePresetWorkflow |
| `memory/` | 已有 | memoryRecall、memoryConsolidation、memoryImport 等 |
| `save/` | 已有 | saveLoadWorkflow |
| `nsfw/` | 部分有 | bdsm/campus/exposure/boardGame/photography/bar 各有子目录 |
| `planning/` | 已有 | planningUpdateWorkflow、variableCalibration、storyPlanUpdater |
| `world/` | 已有 | worldEvolutionWorkflow、worldEvolutionControl |
| `time/` | 已有 | timeInitialization、timeUtils、historyTurnWorkflow、travelWorkflow |
| `setting/` | 已有 | config/、settingsPersistenceWorkflow、useSettingsActions |
| `npc/` | 散列 | manualNpcWorkflow、npcContext、relationshipNetworkWorkflow |
| `session/` | 新建 | sessionLifecycleWorkflow、saveCoordinator、domains/sessionDomain |
| `event/` | 已有子目录 | eventTrigger、eventTriggerManager、clubWorkflow、forgeWorkflow、dailytown |

**任务：** 把 130 个散列文件按上表归入对应子目录（如 `bdsmMeetingWorkflow.ts` → `nsfw/bdsm/meetingWorkflow.ts`）。

**验证：** 移动后用 `madge` 检查无循环引用，TS 编译通过。

**Commit：** `refactor(useGame): 将 130 个子工作流按领域重组到子目录`

#### Task 3.2：抽取领域域到 Zustand 切片

**Files:**
- Create: `hooks/useGame/domains/imageSlice.ts`
- Create: `hooks/useGame/domains/memorySlice.ts`
- Create: `hooks/useGame/domains/saveSlice.ts`
- Create: `hooks/useGame/domains/nsfwSlice.ts`
- Create: `hooks/useGame/domains/settingSlice.ts`
- Create: `hooks/useGame/domains/planSlice.ts`
- Modify: `hooks/useGame/subsystems/zustandStore.ts`

**模式：**
```ts
// domains/imageSlice.ts
import { StateCreator } from 'zustand';
import type { GameStore } from '../subsystems/zustandStore';

export interface ImageSlice {
  image: {
    npcImageArchive: Record<string, ...>;
    sceneImageArchive: Record<string, ...>;
    playerImageArchive: ...;
  };
  // 动作
  appendNpcImage: (npcId: string, record: ...) => void;
  mergeNpcImages: (...) => void;
}

export const createImageSlice: StateCreator<GameStore, [], [], ImageSlice> = (set, get) => ({
  image: { ... },
  appendNpcImage: (npcId, record) => set((s) => ({ image: { ...s.image, npcImageArchive: { ...s.image.npcImageArchive, [npcId]: [...] } } })),
  // ...
});
```

**预期效果：**
- 玩家用图片功能时只订阅 image slice，其他领域状态变更不触发 image 组件重渲染
- 减少 React DevTools Profiler 报告的"全树重渲染"问题

**Commit：** `refactor(state): useGame 拆为领域 Zustand 切片（image/memory/save/nsfw/setting/plan）`

#### Task 3.3：useGame.ts 缩身为门面

**Files:**
- Modify: `hooks/useGame.ts`

**当前 1196 行包含：** 78 个 import + 大量 hook 调用 + 大量 setState 协调 + 大量工作流触发

**改造后 ≤ 500 行的门面：**
```ts
export const useGame = () => {
  const state = useGameStore();
  // 收集领域动作
  const imageActions = useImageActions();
  const memoryActions = useMemoryActions();
  const nsfwActions = useNSFWActions();
  // ...

  return {
    state,
    meta: useGameMeta(),
    setters: useGameSetters(),
    actions: { ...imageActions, ...memoryActions, ...nsfwActions, ... },
  };
};
```

**实施步骤：**
- [ ] 创建 `hooks/useGame/useImageActions.ts`、`useMemoryActions.ts`、`useNSFWActions.ts`、`useSaveActions.ts`、`useSettingActions.ts` 等动作集合
- [ ] 把 useGame.ts 内联实现迁出
- [ ] 在 useGame.ts 顶部声明"门面导出"，移除所有已迁出的 helper
- [ ] 跑全量回归（开新档 → 玩 1 回合 → 存档 → 读档 → 改设置 → 触发图片生成）

**验证：**
- `wc -l hooks/useGame.ts` ≤ 500
- `npm run build` 通过
- `npm run test` 通过
- 手动冒烟 5 个核心流程

**Commit：** `refactor(useGame): 拆 useGame.ts 为门面（≤500 行）+ 领域 action hooks`

---

### 阶段 4：路由级 code splitting（2 天）

**目标：** LandingPage、NewGameWizard、GameView 走 React Router 或 lazy 边界，进入不下载。

#### Task 4.1：评估并引入轻量路由

**Files:**
- Modify: `App.tsx`
- Add: `react-router-dom@6` 依赖（或自实现 useState-based 简单路由）

**当前 view 状态：**
```ts
type View = 'home' | 'new_game' | 'game';
const [view, setView] = useState<View>('home');
```

**改造为 React.lazy 边界：**
```ts
const LandingPage = lazy(() => import('./components/layout/LandingPage'));
const NewGameWizard = lazy(() => import('./components/features/NewGame/NewGameWizard'));
const GameView = lazy(() => import('./components/app/GameView'));

const App = () => {
  const [view, setView] = useState<View>('home');
  return (
    <Suspense fallback={<懒加载占位 />}>
      {view === 'home' && <LandingPage onStart={() => setView('new_game')} />}
      {view === 'new_game' && <NewGameWizard onComplete={() => setView('game')} />}
      {view === 'game' && <GameView />}
    </Suspense>
  );
};
```

**预期效果：**
- 玩家停在首页 → 不下载 NewGameWizard 代码（包含大量世界生成提示词）
- 创建角色过程 → 不下载 GameView（包含 useGame 130 个子工作流）

**Commit：** `perf(router): 拆分 Landing/NewGame/Game 三视图为独立 chunk`

#### Task 4.2：首页与新档视图的轻量化

**Files:**
- Audit: `components/layout/LandingPage.tsx`
- Audit: `components/features/NewGame/NewGameWizard.tsx`

**任务：**
- 确认 LandingPage 不依赖 `useGame`（应纯静态）
- NewGameWizard 内嵌的 `EraSelector` 465 KB 块改为**首屏进入选择时代才下载**（用 React.lazy 包裹整个选择面板）
- 移除 NewGameWizard 中不必要的工作流（如开局就触发 `useGame.ts` 整块）

**Commit：** `perf(newgame): EraSelector 改为按需加载，进入新档向导时下载`

---

### 阶段 5：依赖瘦身与 tree-shaking 审计（1 天）

**目标：** 清理可疑依赖，减少 node_modules 间接进入 bundle。

#### Task 5.1：检查 `js-tiktoken` 是否进入生产 bundle

**Files:**
- Audit: `utils/tokenEstimate.ts`、`utils/tokenEstimate*.ts`
- Possibly: 删除或改用 `tiktoken/lite`

**任务：**
- [ ] 跑 `npx vite-bundle-visualizer` 确认 `js-tiktoken` 是否进 `dist/assets/`
- [ ] 若进入：考虑改为 `tiktoken` 的 `lite` 子路径（更小）
- [ ] 或将 `tokenEstimate` 改为纯估算（4 字符 ≈ 1 token 的简化算法），不依赖 js-tiktoken

**Commit：** `perf(deps): tokenEstimate 移除 js-tiktoken 依赖，改为简化估算`

#### Task 5.2：检查 `puppeteer-core` / `playwright-core` 隔离

**Files:**
- Audit: `package.json`

**任务：**
- [ ] 确认 `puppeteer-core` 是 `devDependencies`（不是 `dependencies`）
- [ ] 确认未在源码中 import
- [ ] 若必须保留在 `devDependencies`，加 `.npmrc` 防止误装到 `dependencies`

**Commit：** `chore(deps): 审计 E2E 依赖隔离，确保 puppeteer/playwright 不进入生产`

#### Task 5.3：移除未使用的 `node` 依赖

**Files:**
- `package.json:dependencies.node` —— `node: ^25.6.1` 不应作为运行时依赖，应删除

**Commit：** `chore(deps): 移除 package.json dependencies 中错误的 node 条目`

---

### 阶段 6：按需激活 feature flag（2-3 天）

**目标：** `useGame/useFeatureFlags` 已经存在（`hooks/useGame/useFeatureFlags.ts`），但 `useGame.ts` 仍同步导入所有 feature 的逻辑。改造为按 flag 动态加载。

#### Task 6.1：盘点 useFeatureFlags 现有 flag

**Files:**
- Read: `hooks/useGame/useFeatureFlags.ts`
- Read: `utils/promptFeatureToggles.ts`

**任务：** 列出所有 feature flag 和它们对应的代码模块。

#### Task 6.2：将 NSFW / 高级子系统改为动态 import

**Files:**
- Modify: `hooks/useGame.ts`（领域门面）
- Modify: 多个 NSFW 子引擎入口

**模式：**
```ts
// 替换前
import { bdsmForumEngine } from './useGame/bdsmForumEngine';
// 替换后
const bdsmForumEngine = state.gameConfig?.启用BDSM系统
  ? (await import('./useGame/bdsm/bdsmForumEngine')).bdsmForumEngine
  : null;
```

**候选模块：** bdsm、campus、exposure、boardGame、photography、bar、urbanDriver、device（mobileDevice）、avg、novel-decomposition、novel-writing。

**预期效果：** 关闭某子系统的玩家永远不下载该子系统代码。

**风险：** 动态 import 增加约 100 ms 首次进入延迟。可接受，因为玩家进入"校园"功能时本来就是异步操作。

**验证：** 关闭 BDSM 系统 → 打开 BDSM 模态 → 应触发一次 `bdsm-*.js` 加载。

**Commit：** `perf(features): NSFW 子系统按 gameConfig 改为动态 import`

---

### 阶段 7：性能监控 + 长期度量（1 天）

**目标：** 借助现有的 `PerformanceDashboard` 和 `PerformanceMonitorSettings`，在 CI 中跑 Lighthouse 跟踪回归。

#### Task 7.1：Lighthouse CI 集成

**Files:**
- Create: `.github/workflows/lighthouse.yml`
- Add: `@lhci/cli` 到 `devDependencies`

**任务：**
- [ ] 配置 `lighthouserc.json` 指定 base URL = preview 部署
- [ ] 跟踪指标：First Contentful Paint、Largest Contentful Paint、Total Blocking Time、Total Bundle Size
- [ ] 跑两次：基线 vs 当前，对比报告

**Commit：** `ci(perf): 集成 Lighthouse CI，追踪首屏性能回归`

#### Task 7.2：PerformanceMonitorSettings 接入

**Files:**
- Audit: `utils/performanceMonitorSettings.ts`
- Audit: `components/features/Performance/PerformanceDashboard.tsx`
- Audit: `components/features/Performance/SlowOperationLog.tsx`

**任务：**
- 确认 SlowOperationLog 在生产构建中被 `import.meta.env.DEV` 守卫
- 确认 PerformanceDashboard 不会在移动端或低性能设备自动渲染（按 `useResponsive`）
- 把 `performance.now()` 采样接入到 settings 持久化（IndexedDB）

**Commit：** `perf(monitor): SlowOperationLog 守卫生产构建，PerformanceDashboard 移动端默认关闭`

---

## 3. 风险评估

| 风险 | 等级 | 影响 | 缓解 |
|------|------|------|------|
| 拆分 chunk 引发运行时循环依赖 / ESM TDZ | 🟠 中 | 应用白屏 | 阶段 1 任务前先跑 `npm run build` 验证；如出现 TDZ，回滚到 `game-runtime` 单块 |
| 异步模块注册导致首进入某模态时延迟 200-500ms | 🟡 低 | 用户体验轻微下降 | 配合 idle 预加载（`preload()` 钩子）；用 `requestIdleCallback` 在游戏空闲时提前 import |
| useGame 切片化破坏现有闭包/性能优化模式 | 🟠 中 | 重渲染次数上升或新功能开发受阻 | 阶段 3 严格保留 `actions` API 表面不变；新增 Zustand selector 而非新增 props |
| EraSelector 465 KB 拆分后不能减小（数据驱动） | 🟡 低 | 优化目标不达 | 检查 `models/eraTheme.ts` 与 `data/backgrounds/`，按需 import 时代特定数据 |
| js-tiktoken 替换后估算精度下降 | 🟢 极低 | 不影响功能 | 估算精度仅用于成本提示，不参与业务逻辑 |
| Lighthouse CI 跑慢导致 CI 总时长 +3-5 分钟 | 🟡 低 | 开发体验下降 | 限制 Lighthouse 跑在 main 分支和 PR；缓存 base URL |

---

## 4. 验证清单（每阶段必跑）

```bash
# 1. 构建
npm run build
# 2. 体积（与 baseline 对比）
npx size-limit
# 3. 类型
npx tsc --noEmit -p tsconfig.strict.json
# 4. Lint
npm run lint
npm run lint:graph  # 检查循环引用
npm run lint:dead   # 检查死代码
npm run lint:unused # knip 未使用导出
# 5. 单元测试
npm run test:run
# 6. E2E 冒烟（至少跑这几个）
npx playwright test e2e/open-game.spec.ts
npx playwright test e2e/settings-load.spec.ts
npx playwright test e2e/save-load.spec.ts
# 7. 手动冒烟流程
#   - 开新档 → 选时代 → 写主角 → 进入游戏 → 1 回合故事 → 存档 → 读档
#   - 打开设置 → 切 4 个标签 → 改 API key → 保存
#   - 触发一次图片生成（如果 API 可用）
```

---

## 5. 实施优先级（建议执行顺序）

| 阶段 | 工作量 | 风险 | 收益 | 建议时机 |
|------|--------|------|------|----------|
| 阶段 0 基线 | 0.5 天 | 极低 | 可度量性 | 立即 |
| 阶段 1 拆 chunk | 1-2 天 | 低 | 首屏 -3 MB | 立即 |
| 阶段 2 异步注册 | 2-3 天 | 中 | 首屏 -500 KB；NSFW 用户 -1 MB | 紧接阶段 1 |
| 阶段 5 依赖瘦身 | 1 天 | 低 | 减少 node_modules 污染 | 阶段 1 期间并行 |
| 阶段 3 useGame 切片 | 3-5 天 | 中 | 维护性大幅提升 + 重渲染优化 | 在阶段 1 收益确认后 |
| 阶段 4 路由拆分 | 2 天 | 中 | 首页不下载 NewGame/Game | 阶段 3 完成后 |
| 阶段 6 feature flag | 2-3 天 | 中 | 用户可选子系统关闭 | 阶段 3 完成后 |
| 阶段 7 监控 | 1 天 | 低 | 长期回归保护 | 全部完成后 |

**预期总耗时：10-15 天，分 4 个 sprint 推进。**

---

## 6. 不在本次范围

- 引入 SSR / Next.js（项目无此需求）
- 替换 React 状态管理库（Zustand 已用，继续扩展）
- 重写 UI 框架（Tailwind 保留）
- 移动原生壳改造（Capacitor 已配）
- AI 客户端重写（按需拆 chunk 即可）
- IndexedDB 模式变更（`dbService.ts` 不动）

---

## 7. 文档归档

完成每个阶段后：
- 该阶段的代码改动保留
- 把本计划文件的"完成项"用 `[x]` 标记
- 完成后**删除**本文件（按 `docs/plans/` 只保留未完成计划规则）
- 同时把核心性能约定（chunk size budget、按需激活策略）回写到 `2026-06-03-project-optimization.md` 的 Phase 7 章节，让广度版与本文件保持一致
- 把最终的"性能基线 + 按需激活策略"独立归档到 `docs/technical/09-perf-budget-and-lazy-loading.md`

---

**等待用户确认：** 同意按此方案分阶段推进？还是只实施其中某几个阶段？
