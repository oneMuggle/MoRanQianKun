# yishijie 项目借鉴计划

> 创建：2026-06-15
> 状态：**计划阶段（待用户确认后启动实施）**
> 来源：用户要求参考 `/home/fz/project/yishijie` 项目，把可借鉴的部分落地到当前项目 `MoRanQianKun`（注意：仓库目录名仍为 `MoRanQianKun`，但 README 标题为「墨染乾坤：万象纪元」，本次仅做规划，不动 README）

---

## 1. 需求重述

本次任务**仅做分析和规划**。目标：把 `yishijie` 项目中已经被验证可用的工程化做法（多端构建 / 发布工作流 / 浏览器错误监控 / 早期存储迁移门 / OTA 风格更新机制 / PWA 安装提示 / 运行时提示词注入 / 多平台 base path 自动适配）借鉴到 `MoRanQianKun`，并匹配当前项目的 React + TypeScript + Vite 6 + IndexedDB + Cloudflare Functions 技术栈。

**明确不做：**

- ❌ 不引入 Vue 3（当前项目是 React 19）
- ❌ 不引入 Three.js / Mermaid / Marked（与本项目主路线无关）
- ❌ 不引入 yishijie 的 `socket.io-client` / `simplex-noise` / `pinyin-pro`（非通用基建）
- ❌ 不动 `App.tsx` / `useGame.ts` 业务核心（涉及面太广，先做外围基建）
- ❌ 不引入 Electron / Capacitor Android 工程文件（用户没要求桌面端）

---

## 2. 项目概览（来自第一手探查）

### 2.1 当前项目 MoRanQianKun

- 路径：`/home/fz/project/MoRanQianKun`（pwd = 当前项目，仓库目录名仍是 `MoRanQianKun`）
- 类型：React 19 + TypeScript + Vite 6 + Tailwind + IndexedDB + fflate + Cloudflare Pages Functions
- 测试：vitest 已就绪，2200+ 用例，coverage 阈值 12%，`test-coverage.yml` workflow 已在跑
- 错误处理：已建 `ErrorBoundary` + `ToastManager`，文档 `12-error-handling.md`
- 文档：完整 plans/technical/user-manual 三层
- CI：`.github/workflows/` 有 android.yml / ci.yml / deploy.yml / lighthouse.yml / release.yml / test-coverage.yml

### 2.2 参考项目 yishijie

- 路径：`/home/fz/project/yishijie`
- 类型：Vue 3 + Vite 5 + Pinia + Three.js + Electron 33 + Capacitor 6
- 体积：约 232KB 单文件 `App.vue`，60+ 个 Vue 组件
- 重要特征：开源前端包，只包含前端（不含后端），`yishijie-api/releases/` 由 OTA 脚本生成
- 无 GitHub Actions，无 `.claude/` 配置，无 docs/ 目录（结构极简）

---

## 3. 对比分析（按维度）

### 3.1 项目结构

| 维度 | yishijie 的做法 | MoRanQianKun 现状 | 可借鉴点 | 优先级 |
|------|----------------|------------------|----------|--------|
| 多端构建入口 | `BUILD_TARGET=electron/capacitor/web`，`vite.config.js` 自动切换 `outDir` 与 `base` | 单 web 端（已支持 GitHub Pages base 切换） | yishijie 的 `resolveBase/resolveOutDir` 模式适合扩展桌面端 | P3（暂无桌面端需求） |
| 启动脚本分层 | 完整多端脚本 `build:electron / build:capacitor / electron:dev / android:sync` | `dev / build / preview / test:unit / test:cov` | 当前脚本已经足够，**无需调整** | — |
| 文件组织 | 扁平 `components/ composables/ stores/ utils/ plugins/` | 按功能域 `features/ / layout/ / ui/` 分层（更优） | 不借鉴（当前更清晰） | — |

### 3.2 技术栈

| 维度 | yishijie | MoRanQianKun | 备注 |
|------|----------|--------------|------|
| 框架 | Vue 3.4 + Vite 5 + Pinia | React 19 + Vite 6 + Zustand | 完全不同，**不强制对齐** |
| 类型 | 全 JS（无 TS） | TypeScript 5.8 | 不借鉴 |
| 持久化 | localStorage（token/user）+ IndexedDB（推测） | IndexedDB（`dbService.ts`） | 略 |
| AI 调用 | API Settings 内置 | 多供应商抽象（`chatCompletionClient.ts`） | 远强于 yishijie，不借鉴 |

### 3.3 文档组织

| 维度 | yishijie | MoRanQianKun | 借鉴点 |
|------|----------|--------------|--------|
| 用户文档 | 仅 `README.md` | `docs/user-manual/` + `README.md` | 不借鉴（当前更完善） |
| 计划文档 | 无 `docs/` | `docs/plans/` 50+ 文档 | 不借鉴 |
| 技术文档 | 无 | `docs/technical/` 30+ 章节 | 不借鉴 |
| README 质量 | 4.1KB，结构清晰，技术栈/构建/部署完整 | 6.1KB，含功能、技术栈、运行、云同步 | yishijie 的「快速开始」段落更紧凑，可参考简化结构 |

**结论：当前项目文档体系更完善，yishijie 没有可借鉴的文档结构。**

### 3.4 开发工作流

| 维度 | yishijie | MoRanQianKun | 借鉴点 |
|------|----------|--------------|--------|
| 测试 | 无测试（无 vitest/jest） | vitest + Playwright + msw + fake-indexeddb + Coverage | 不借鉴 |
| Lint | 仅默认 Vite | ESLint + ts-prune + madge + knip + size-limit + ast-grep | 远强于 yishijie，不借鉴 |
| 错误处理 | `bindBrowserErrorMonitor` + 30 条 window error 队列 | `ErrorBoundary` + `ToastManager` | **借鉴 yishijie 的「浏览器全局错误队列 + 全局读取器」模式**（用于 AI 服务降级 / 后续 agent 调试），但要适配 React |
| 环境隔离 | `.env.example` 简洁，3 个变量 | `.env.example` 也有，多变量 | 不借鉴 |
| Feature 分支 | 无显式规范 | CLAUDE.md 已规定 `feature-branch-workflow.md` | 不借鉴 |

### 3.5 测试策略

yishijie 完全没有测试（无 vitest 配置、无 `*.test.*` 文件）。
MoRanQianKun 已有完整测试基础设施（覆盖率门槛 12%、CI workflow 落地）。

**结论：测试策略无需借鉴，反向说明 yishijie 的工程化不成熟。**

### 3.6 代码组织

| 维度 | yishijie | MoRanQianKun |
|------|----------|--------------|
| 单文件最大 | `App.vue` 232KB（2273 行） | `App.tsx` ~1680 行（远小于） |
| 状态管理 | Pinia store × 3 | `useGame.ts` ~3000 行 + Zustand |
| Composables/Hooks | 12 个 | 25+ 个 |

**结论：当前代码组织更清晰，yishijie 没有可借鉴的代码组织模式。**

### 3.7 配置管理

| 维度 | yishijie | MoRanQianKun | 借鉴点 |
|------|----------|--------------|--------|
| Vite base path | 4 平台自动判断（Vercel/CF/GH Pages/Electron/Capacitor） | 仅 GH Pages 一档 | **借鉴：扩展 `resolveBase()` 支持更多平台（CF Pages / Vercel 自动检测）** |
| 运行时 env 注入 | `define: { 'import.meta.env.BUILD_TARGET' }` | `define: { 'process.env.API_KEY' }`（旧式） | **借鉴：迁移到 `import.meta.env` 标准 Vite 注入方式**（避免 deprecation 警告） |
| .env.example | 3 行 | 4 行 | 略 |

### 3.8 错误处理 ⭐

| 维度 | yishijie | MoRanQianKun | 借鉴点 |
|------|----------|--------------|--------|
| 全局 ErrorBoundary | `app.config.errorHandler`（Vue） | `components/ui/ErrorBoundary.tsx` | 已建好，不重复 |
| 未捕获 Promise 拒绝 | 捕获到 `__yishijieBrowserErrorStore.entries`（30 条 FIFO） | 未全局捕获 | **借鉴：补齐全局 `unhandledrejection` 捕获 + 资源加载失败捕获**（写到 `window.__MRQK_ERROR_LOG__`） |
| 自定义事件分发 | `yishijie:browser-error-updated` | Toast 一次性 | **借鉴：在 DevTools 调试器面板中显示最近错误** |
| 启动期 localStorage 迁移门 | `AUTH_LOCAL_RESET_VERSION_KEY` + 版本号比较清理 | 无 | **借鉴：给 dbService 增加 schema 版本号 + 自动迁移门** |

### 3.9 OTA / 发布流程 ⭐

| 维度 | yishijie | MoRanQianKun | 借鉴点 |
|------|----------|--------------|--------|
| OTA bundle 打包 | `scripts/release-bundle.cjs`（zip + SHA256 + manifest.json） | 无 | **借鉴：写一个 `scripts/release-bundle.mjs` 用于把 `dist/` 打包成可分发的 zip + SHA256**（可挂到 Cloudflare R2 / GitHub Release） |
| 版本切换文件 | `current.json` 指向 bundle 目录 | 无 | 不借鉴（无原生壳需求） |
| 容错回退 | 检测 `index.html` 缺失自动清理 current.json | 无 | 不借鉴 |

### 3.10 构建产物分发 ⭐

yishijie 的 `release-bundle.cjs` 是相对独立、可复制的 264 行脚本，逻辑清晰：
1. 调对应平台构建
2. zip 打包
3. 算 SHA256
4. 更新 manifest.json

**这个模式可整体迁移到 MoRanQianKun（语言从 cjs 改 mjs，平台简化为 web 单一平台）。**

---

## 4. 借鉴点优先级矩阵

| # | 借鉴点 | 价值 | 工作量 | 风险 | 优先级 |
|---|--------|------|--------|------|--------|
| B1 | 全局浏览器错误监控（window error + unhandledrejection + resource error） | 高（AI/IndexedDB 调试需要） | 低 | 低 | **P0** |
| B2 | Vite 运行时 env 迁移到 `import.meta.env` 标准注入 | 中（避免 deprecation + 未来 SSR 友好） | 低 | 低 | **P0** |
| B3 | Vite base path 多平台自动适配（CF Pages / Vercel / GH Pages） | 中（部署到 CF Pages 时缺这层） | 极低 | 低 | **P0** |
| B4 | dbService schema 版本号 + 自动迁移门 | 高（避免 localStorage 残留数据 bug 复现） | 中 | 中 | **P1** |
| B5 | `scripts/release-bundle.mjs`（zip + SHA256 + manifest.json） | 中（未来分发需要） | 中 | 低 | **P1** |
| B6 | 资源加载失败的全局捕获（`tagName` = `'IMG'/'SCRIPT'/'LINK'` 时上报） | 中（图片资源问题排查） | 低 | 低 | **P1** |
| B7 | PWA 安装提示（`beforeinstallprompt`） | 低（当前未启用 PWA） | 低 | 低 | **P3** |
| B8 | Electron / Capacitor 多端构建（如未来需要桌面端） | 视需求 | 高 | 高 | **P3（暂不实施）** |

---

## 5. 涉及的文件与模块

### 5.1 需要参考的 yishijie 文件路径

- `/home/fz/project/yishijie/src/main.js`（`bindBrowserErrorMonitor` / `bindInstallPromptListeners` 实现参考，**仅参考模式，不复制 Vue 特定代码**）
- `/home/fz/project/yishijie/vite.config.js`（`resolveBase / resolveOutDir` 函数实现参考）
- `/home/fz/project/yishijie/scripts/release-bundle.cjs`（`parseArgs / zipDirectory / sha256OfFile / loadManifest` 实现参考，**整体重写为 ESM**）
- `/home/fz/project/yishijie/src/utils/save-bundle.js`（导出 zip 的 IPC 流程参考）
- `/home/fz/project/yishijie/src/utils/native-shell.js`（`isNative` 判断模式参考）

### 5.2 需要新建/修改的 MoRanQianKun 文件

**新建：**

| 路径 | 用途 |
|------|------|
| `src/utils/browserErrorMonitor.ts` | 浏览器全局错误监控（捕获 window.error / unhandledrejection / resource error + FIFO 30 条队列 + `window.__MRQK_ERROR_LOG__` 暴露） |
| `src/utils/basePath.ts` | 多平台 base path 自动适配工具（独立函数，便于测试） |
| `scripts/release-bundle.mjs` | ESM 版 release bundle 脚本（zip + SHA256 + manifest.json） |
| `src/services/dbService/migrations/_migrationGate.ts` | schema 版本号 + 自动迁移门（可选 B4） |
| `src/test-utils/setup.ts` 追加 | 增加 `window.__MRQK_ERROR_LOG__` mock |

**修改：**

| 路径 | 变更 |
|------|------|
| `vite.config.ts` | 用 `loadEnv` 读取 + `import.meta.env` 标准注入 + 多平台 base path |
| `src/main.tsx` 或新文件 `src/index.tsx` | 注册 `bindBrowserErrorMonitor`（启动时挂全局） |
| `package.json` | 新增 `release:bundle` 脚本 + 装 `jszip` 到 devDependencies |
| `docs/technical/` | 新增 `16-error-monitoring.md`、`17-build-bundle.md` 两个章节 |
| `docs/user-manual/user-manual.md` | 不动 |

---

## 6. 技术方案

### 6.1 B1：浏览器全局错误监控

**参考模式（yishijie）：** `bindBrowserErrorMonitor(app)` 在 Vue 启动时挂载：
- `window.addEventListener('error', capture, true)`（capture 阶段捕获资源加载错误）
- `window.addEventListener('unhandledrejection', capture)`
- Vue 3: `app.config.errorHandler` 兜底

**MoRanQianKun 适配方案：**

```ts
// src/utils/browserErrorMonitor.ts
const MAX_ENTRIES = 30;
declare global {
  interface Window {
    __MRQK_ERROR_LOG__?: BrowserErrorEntry[];
  }
}
export type BrowserErrorEntry = {
  id: string;
  type: 'window_error' | 'resource_error' | 'unhandledrejection' | 'react_error';
  message: string;
  stack: string;
  filename: string;
  lineno: number;
  colno: number;
  componentName?: string;
  createdAt: number;
};

export function bindBrowserErrorMonitor(): void {
  if (typeof window === 'undefined') return;
  if (window.__MRQK_ERROR_LOG__) return; // 单例

  window.__MRQK_ERROR_LOG__ = [];

  window.addEventListener('error', (event) => {
    const target = event.target as HTMLElement | undefined;
    const isResource = target && (!event.message || target.tagName === 'IMG' || target.tagName === 'SCRIPT' || target.tagName === 'LINK');
    pushEntry({
      type: isResource ? 'resource_error' : 'window_error',
      message: isResource
        ? `资源加载失败: ${target?.tagName || 'unknown'}`
        : String(event.message || event.error || '未知错误'),
      stack: event.error instanceof Error ? event.error.stack : '',
      filename: (target as any)?.src || (target as any)?.href || event.filename || '',
      lineno: event.lineno || 0,
      colno: event.colno || 0,
    });
  }, true);  // capture 阶段才能捕获资源加载错误

  window.addEventListener('unhandledrejection', (event) => {
    pushEntry({
      type: 'unhandledrejection',
      message: String(event.reason?.message || event.reason || 'Promise rejected'),
      stack: event.reason instanceof Error ? event.reason.stack : '',
    });
  });
}
```

**调用点：** `src/index.tsx`（或 `src/main.tsx`）顶部第一行（**早于 ReactDOM.createRoot**）

**测试方案：** `src/utils/browserErrorMonitor.test.ts`
- 模拟 `window.dispatchEvent(new ErrorEvent('error', { message: 'X' }))`
- 模拟 `Promise.reject(...)` 不被 catch
- 验证 FIFO 30 条上限

---

### 6.2 B2 + B3：Vite 多平台 base path 与 env 注入

**参考模式（yishijie vite.config.js）：**

```js
function resolveBase() {
  if (IS_NATIVE) return './';  // electron/capacitor file://
  if (process.env.VERCEL) return '/';
  if (process.env.CF_PAGES) return '/';
  if (process.env.GITHUB_ACTIONS === 'true' && repoName) return `/${repoName}/`;
  return '/';
}
```

**MoRanQianKun 适配方案（vite.config.ts）：**

```ts
// vite.config.ts
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    base: resolveBase(),  // 提取到 src/utils/basePath.ts 便于单测
    plugins: [react(), novelAiDevProxyPlugin(), r2CdnPlugin()],
    define: {
      // 改用 import.meta.env 标准注入
      __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
      __R2_CDN_BASE__: JSON.stringify(process.env.R2_CDN_BASE || 'https://mrqk.cc.cd'),
    },
    // ...
  };
});
```

**注意：** 现有 `process.env.API_KEY` 注入保留（兼容旧代码），不强行删除。

**测试方案：** `src/utils/basePath.test.ts` 覆盖 4 种 env 场景

---

### 6.3 B4：dbService schema 迁移门（可选）

**参考模式（yishijie main.js 中 `applyAuthLocalResetGate`）：**

```js
const AUTH_LOCAL_RESET_VERSION_KEY = 'auth_local_reset_version';
const AUTH_LOCAL_RESET_VERSION = '2026-02-28-reset-1';
function applyAuthLocalResetGate() {
  const current = localStorage.getItem(KEY);
  if (current === VERSION) return;
  localStorage.removeItem('yishijie_token');
  localStorage.removeItem('yishijie_user');
  localStorage.setItem(KEY, VERSION);
}
```

**MoRanQianKun 适配：** IndexedDB 没有 localStorage 那种「自动清理」机制，但可以加版本号：

```ts
// src/services/dbService/migrations/_migrationGate.ts
const SCHEMA_VERSION = 5;  // 当前版本
const SCHEMA_VERSION_KEY = 'mrqk_db_schema_version';

export async function applySchemaMigrationGate(): Promise<void> {
  const stored = Number(localStorage.getItem(SCHEMA_VERSION_KEY) || 0);
  if (stored >= SCHEMA_VERSION) return;

  // 按需执行迁移
  if (stored < 1) await migration0001_clearOldIndexes();
  if (stored < 5) await migration0005_unifyImageAssetsStore();

  localStorage.setItem(SCHEMA_VERSION_KEY, String(SCHEMA_VERSION));
}
```

**风险：** 写迁移函数需要熟悉 dbService 各 store 的结构，**实施前先读完整 `services/dbService/`**。

---

### 6.4 B5：scripts/release-bundle.mjs

**参考模式（yishijie scripts/release-bundle.cjs）：** 整体迁移 + ESM 化 + 简化（只支持 web 平台）

```js
#!/usr/bin/env node
// scripts/release-bundle.mjs
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import JSZip from 'jszip';
import { execSync } from 'node:child_process';

const PROJECT_ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const RELEASE_ROOT = path.join(PROJECT_ROOT, 'dist-release');

function parseArgs() { /* ... */ }
function sha256OfFile(p) { /* ... */ }
async function zipDirectory(src, dest) { /* ... */ }

async function main() {
  const args = parseArgs();
  // 1. 跑 vite build (BASE_PATH + BUILD_TARGET)
  // 2. zip dist/
  // 3. sha256
  // 4. 写 manifest.json
}
```

**依赖：** 装 `jszip` 到 devDependencies（yishijie 已经用，放心引用）

---

## 7. 实施步骤（可独立验证的里程碑）

### 阶段 1：基础设施（高优先级 / 2 天）

- [ ] **M1** 在 `docs/plans/` 创建本计划文档（已完成）
- [ ] **M2** 新建 `src/utils/browserErrorMonitor.ts` + 单测
- [ ] **M3** 在 `src/index.tsx` 注册监控（早于 ReactDOM.createRoot）
- [ ] **M4** 提取 `src/utils/basePath.ts` + 单测，迁移 `vite.config.ts` 使用
- [ ] **M5** vite.config.ts 改 `import.meta.env` 标准注入（保守迁移，不删旧）
- [ ] **验证：** `npm run test:unit` 全绿；`npm run build` base path 在 4 平台下正确
- **工时估算：** 1.5 工作日

### 阶段 2：核心借鉴点落地（P0 + P1 / 3-4 天）

- [ ] **M6** dbService schema 迁移门（先做调研，再实现迁移函数）
- [ ] **M7** 写 `scripts/release-bundle.mjs` + jszip 装依赖 + 单测
- [ ] **M8** `package.json` 加 `release:bundle` 脚本
- [ ] **M9** 更新 `docs/technical/12-error-handling.md` 增补「浏览器全局错误监控」章节
- [ ] **M10** 新建 `docs/technical/16-build-bundle.md` 说明发布脚本
- [ ] **验证：** `npm run release:bundle -- --version=0.1.0` 能产出 zip + sha256 + manifest.json
- **工时估算：** 3 工作日

### 阶段 3：辅助改进（中优先级 / 2 天）

- [ ] **M11** 增加资源加载失败的全局捕获（IMG/SCRIPT/LINK）
- [ ] **M12** 在 `useDebugLogger` hook 中暴露 `window.__MRQK_ERROR_LOG__.slice(-10)` 供 DevTools 用
- [ ] **M13** CI workflow 新增 `release-bundle.yml`（可选 / 视需求）
- [ ] **验证：** 故意在测试页插入 `<img src="/missing.png">`，DevTools 控制台可见错误条目
- **工时估算：** 2 工作日

### 阶段 4：验证与归档（1 天）

- [ ] **M14** 全量跑测试 + lint + build
- [ ] **M15** 归档：本计划文档删除（按用户规则），把核心内容并入 `docs/technical/16-error-monitoring.md` 与 `docs/technical/17-build-bundle.md`
- [ ] **M16** 跑 code-reviewer agent + 修复 CRITICAL/HIGH
- [ ] **M17** 按 `feature-branch-workflow.md` 建分支 + PR
- **工时估算：** 1 工作日

**总工时估算：** 7.5 工作日（约 1.5 周）

---

## 8. 风险评估

| 风险 | 级别 | 缓解策略 |
|------|------|----------|
| B1 全局 error 监听可能捕获到第三方库错误导致噪音 | 中 | FIFO 30 条上限 + 至少 800ms 去重 + 类型归一 |
| B2 vite `define` 改名可能影响下游代码 | 中 | 不删除旧 `process.env.API_KEY` 注入，**追加** `import.meta.env` 方式；grep 全仓 `process.env.API_KEY` 确认下游 |
| B3 base path 改动可能让 Cloudflare Pages / GitHub Pages 部署 404 | 中 | 先在本地构建 + `npx serve dist` 验证 4 种 base path；参考 yishijie 默认 `/` 兜底 |
| B4 dbService 迁移函数写错会丢用户存档 | 高 | **不在第一次借鉴就实施**，先做调研；先建空 migration gate 函数 + 单测，再按版本号逐步迁移 |
| B5 release-bundle 打包包含敏感信息 | 中 | 参照 yishijie 排除 `*.md / node_modules / .git` |
| 装 jszip 增加 100KB devDep | 低 | yishijie 已经在用，是 battle-tested 的库 |
| 与现有 useDebugLogger 冲突 | 低 | B12 把错误流接入 useDebugLogger，不另起炉灶 |

---

## 9. 不需要借鉴的内容

**明确不借鉴 yishijie 的以下做法：**

1. ❌ **Vue 3 + Pinia 整体架构** — 当前项目是 React 19 + Zustand，技术栈迁移成本极高
2. ❌ **`App.vue` 单文件 2273 行的模式** — 当前 `App.tsx` ~1680 行已经偏大，但不应继续恶化
3. ❌ **Three.js 3D 地图 / Mermaid 图谱 / socket.io** — 与本项目主线不相关
4. ❌ **`.env.example` 3 行的极简风格** — 当前 4 行已经够用
5. ❌ **OTA 热更新机制（写 `current.json` + 解压到 `userData`）** — 这是 Electron 桌面端专用机制，Web 端不需要
6. ❌ **yishijie 的 PWA 安装提示** — 当前项目没启用 PWA，且 Web 端用户场景与 Electron 桌面用户不同
7. ❌ **`AUTH_LOCAL_RESET_VERSION_KEY` 硬编码清理 token** — 当前项目已有更完善的 IndexedDB 数据迁移方案（DB 版本号），不要用这种「硬清理」风格
8. ❌ **electron-builder + png-to-ico 图标生成** — 当前无桌面端需求

---

## 10. 与项目级规则的关系

- **feature-development.md**：本次按计划→实施→归档流程走，本文档就是 `docs/plans/` 入口
- **feedback_document-organization.md**：完成后本计划文档会**删除**（按用户规则「plans 仅保留进行中」），内容并入 `docs/technical/`
- **feature-branch-workflow.md**：实施阶段会按规范建 `feat/browser-error-monitor` 等分支 + PR
- **testing.md**：B1/B3/B5 都强制带单测，coverage 不会回退
- **coding-style.md**：所有新工具函数保持纯函数 + 无副作用 + TypeScript 严格模式

---

## 11. 等待确认（WAITING FOR CONFIRMATION）

请用户回复以下任一：

- **proceed** — 全量按本计划执行（建议先实施 M2-M5，再视效果决定是否继续 M6-M13）
- **proceed-p0-only** — 只实施 P0 项（B1/B2/B3），其他等下一轮
- **modify** — 列出要调整的内容（例如「不要 B4」、「加 B14: ...」）
- **cancel** — 终止本次借鉴计划

> 按用户全局规则，本次任务**仅做规划**。所有代码层面的实施应在用户确认后启动。