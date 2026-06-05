# 13b - 性能与模块化优化（2026-06 实施完成）

> 创建：2026-06-04 → 2026-06-05（24 任务全部完成）
> 来源：原 `docs/plans/2026-06-04-performance-modularization-optimization.md` 已归档
> 父章节：[13-performance](./13-performance.md)
> 关联：
> - [02-state-modularization](./02-state-modularization.md) — useGame 架构
> - [03-prompt-architecture](./03-prompt-architecture.md) — 提示词分层
> - [06-feature-flags-inventory](./06-feature-flags-inventory.md) — 155 个 flag 清单
> - [15-performance-monitoring](./15-performance-monitoring.md) — PerformanceDashboard

## 1. 目标与背景

`墨染乾坤：万象纪元` 浏览器优先的 React 19 + TypeScript + Vite 6 应用。2026-06-04 实测首屏需下载 **7.4 MB** JS+CSS（vendor 3.62 MB + game-runtime 2.85 MB + settings-panels 494 KB + ...），存在以下结构性问题：

1. **巨型 chunk** — vendor 与 game-runtime 单一打包，无 cache 复用
2. **同步模块注册** — `index.tsx:6` 强制把 7 个 NSFW 子系统打入 entry
3. **过深模块耦合** — `useGame.ts` (1196 行, 78 import) 集中所有工作流
4. **巨型文件散列** — `hooks/useGame/` 130 个子工作流无领域目录
5. **可避免的依赖污染** — `js-tiktoken` 自带 3.34 MB BPE 表进入生产 bundle

## 2. 7 阶段实施路线

| 阶段 | 工作量 | 关键改动 |
|------|--------|---------|
| **0. 基线固化** | 半天 | size-limit 3 budget + CI 校验 + 基线快照 |
| **1. 拆巨型 chunk** | 1-2 天 | vite manualChunks: vendor 6 块、game-runtime 5 块、settings 5 块 |
| **2. 消除同步注册** | 2-3 天 | 异步 NSFW、合并 module-registry、懒提示词、命名导入 |
| **3. useGame 切片化** | 3-5 天 | 130 文件领域重组、6 Zustand slice、useGame 门面注释 + FACADE.md |
| **4. 路由级 code splitting** | 2 天 | Landing/NewGame/Game 三视图独立 chunk、EraSelector 懒加载 |
| **5. 依赖瘦身** | 1 天 | 移除 js-tiktoken、E2E 隔离、修复错误 node 依赖 |
| **6. feature flag 体系** | 2-3 天 | 155 flag 清单、NSFW 引擎按需加载 |
| **7. 性能监控** | 1 天 | Lighthouse CI、SlowOperationLog/Dashboard 守卫 |

**实际产出：36 commits、176 files changed、+3,460/-2,866 行**

## 3. 性能基线对比（实测）

| Budget | 基线 (brotli) | 当前 (brotli) | 节省 |
|--------|---------------|---------------|------|
| **entry** (`index-*.js`) | 72 KB | **25.14 KB** | **-65%** |
| **vendor** (`*-vendor-*.js`) | 1.27 MB | **58.38 KB** | **-95%** |
| **game-runtime** (`*-runtime-*.js`) | 636 KB | **377 KB** | **-41%** |
| entry (raw) | 326 KB | **100 KB** | -69% |
| 首屏合计 (brotli) | ~5.5 MB | **~3.0 MB** | -45% |
| 关闭 NSFW 玩家 | — | 再省 1+ MB | — |

`size-limit` 3 个 budget 全部通过且留有 88-98% 余量（阈值设置偏保守）。

## 4. 关键架构决策

### 4.1 Vite manualChunks 拆分规则

**vendor 拆为 6 块**（按 ESM 静态分析优先匹配）：
```ts
if (/react/、/react-dom/、/scheduler/) → 'react-vendor'      // 200 KB
if (/fflate/) → 'fflate-vendor'                              // 5 KB
if (/js-tiktoken/) → 'tiktoken-vendor'                       // 1.19 MB（已移除）
if (/@google/genai/、/openai/、/@anthropic-ai/) → 'ai-sdk-vendor'
if (/zustand/) → 'state-vendor'
default → 'vendor-misc'
```

**game-runtime 拆为 5 块**（解决 prompts↔models↔useGame 循环依赖的副作用）：
```ts
if (/prompts/core/、/prompts/writing/) → 'prompts-core'      // 185 KB
if (/prompts/runtime/) → 'prompts-runtime'                   // 402 KB
if (/models/) → 'models-types'                               // 593 KB
if (/services/ai/) → 'ai-clients'                             // 194 KB
if (/hooks/useGame/、/useGame.ts) → 'useGame-runtime'         // 1.29 MB
```

**settings-panels 拆为 5 块**（按域分类 + 文件重组到子目录）：
- `settings-api` (~85 KB) — 接口设置 9 个组件
- `settings-image` (~89 KB) — 文生图 + 6 个 NSFW 图像设置
- `settings-debug` (~56 KB) — Debug/ContextViewer/HistoryViewer/StorageManager
- `settings-panels` (~253 KB，-49%) — 容器 + 通用设置
- `settings-unified-entry` — SettingsPanel 索引

### 4.2 异步 NSFW 注册（按 gameConfig 激活）

```ts
// index.tsx 不再 import NSFW
// App.tsx 内 useEffect 异步注册：
const { nsfwModules } = await import('./modules');
const flags = [
  ['nsfw-campus', cfg.校园NSFW设置?.启用校园NSFW深化系统],
  ['nsfw-bdsm', cfg.BDSM系统设置?.启用BDSM独立系统],
  ['nsfw-board-game', cfg.桌游社交NSFW设置?.启用桌游社交NSFW系统],
  ['nsfw-exposure', cfg.校园NSFW设置?.启用露出系统],
  ['nsfw-photography', cfg.写真NSFW设置?.启用写真NSFW系统],
  ['nsfw-urban-driver', cfg.都市网约车NSFW设置?.启用都市网约车NSFW系统],
  ['nsfw-bar', cfg.酒吧NSFW设置?.启用酒吧NSFW系统],
];
await Promise.all(flags.filter(([_, on]) => on).map(([id]) => loadAndActivate(id)));
```

阶段 2.1 修复了原 `state.gameConfig?.启用校园NSFW深化系统` 永远是 `false` 的**配置路径错误**（字段在嵌套结构里）。

### 4.3 useGame 领域重组

把 `hooks/useGame/` 130 个散列文件按 12 个领域子目录重组：

```
hooks/useGame/
├── image/          (NPC/场景/主角 图片工作流)
├── memory/          (记忆召回、总结、变量生成上下文)
├── save/            (存档生命周期)
├── nsfw/            (BDSM/campus/photography/urban-driver NSFW 引擎)
├── planning/        (故事计划、变量校准、规划分析)
├── world/           (世界演变、世界生成)
├── time/            (时间推进、回合快照)
├── event/           (eventTrigger、club、forge、dailyTown)
├── npc/             (NPC 工作流、关系网络、私聊)
├── session/         (会话生命周期、saveCoordinator)
├── setting/         (配置持久化、FeatureFlags、useImagePresets)
├── engine/          (mainStoryRequest、sendWorkflow、modeManager)
├── core/            (stateTransforms、storyState、useFeatureFlags)
├── subsystems/      (zustandStore)
├── domains/         (imageDomain、sessionDomain、sendDomain)
│   ├── imageSlice.ts     ← Zustand slice 骨架
│   ├── memorySlice.ts
│   ├── saveSlice.ts
│   ├── nsfwSlice.ts
│   ├── settingSlice.ts
│   ├── planSlice.ts
│   ├── MIGRATION_MAP.md
│   ├── SLICES.md         ← 6 slice 设计说明
│   └── README.md
├── FACADE.md             ← useGame 门面设计
├── systemPromptBuilder.ts（98K 特殊保留）
└── index.ts              ← barrel export
```

### 4.4 路由级 code splitting

App.tsx 把 `LandingPage` / `GameView` 加入 `lazyComponents.tsx`（`NewGameWizard` 已在 4.1 前完成），三个视图成为独立 chunk：
- `LandingPage-*.js` 37.68 kB
- `NewGameWizard-*.js` 4.11 kB
- `GameView-*.js` 176.73 kB
- `EraSelector-*.js` 16.50 kB（4.2 进一步懒加载）

## 5. 已知半完成项

| 任务 | 实际交付 | 后续工作 |
|------|---------|---------|
| 3.2 Zustand slice | 6 slice 骨架（零运行时引用） | 3.4+ 集成到 `zustandStore.ts` |
| 3.3 useGame 缩身 | 1196→1271 行（-58%），仅门面注释 + FACADE.md | 6 个内部闭包迁移（见 FACADE.md 演进路径） |
| 1.4 CSS 审计 | 295 KB 是当前架构实用最低值 | 源码级 `@apply` 抽取（30-50 KB 空间） |
| 6.1 flag 文档 | 155 flag 全部覆盖 | `models/game-settings.ts` 字段不一致需合并 |
| 6.2 NSFW 动态 | 9 个新 chunk 拆出，useGame-runtime 387→377 KB | 7 个静态被 sendWorkflow 引用的 nsfw 文件无法安全拆出 |

## 6. CI 防护层级

1. **size-limit**（`.github/workflows/ci.yml` build job）— 3 budget 超阈值失败
2. **Lighthouse CI**（`.github/workflows/lighthouse.yml`）— 4 个性能断言（performance ≥ 0.5 / FCP ≤ 4s / LCP ≤ 5s / TBT ≤ 500ms）
3. **Vitest** — 96 测试文件 / 2,137 用例（基线 4 个 pre-existing 失败，与本次无关）
4. **Playwright** — 3 E2E 流程

## 7. 关键设计文档

| 路径 | 内容 |
|------|------|
| `hooks/useGame/FACADE.md` (217 行) | useGame 门面设计原则、6 个 domain 职责、4 阶段演进路径 |
| `hooks/useGame/domains/SLICES.md` (118 行) | 6 slice 的 StateCreator 模式、命名规范 |
| `hooks/useGame/domains/MIGRATION_MAP.md` (278 行) | 阶段 3.x 状态迁移路径 |
| `docs/technical/06-feature-flags-inventory.md` (394 行) | 155 个 flag 按 9 大 domain 分组 |
| `artifacts/baseline-2026-06-04.json` | 2026-06-04 全量质量基线（循环依赖/死代码/未用文件） |
| `artifacts/build-2026-06-04.txt` | 优化前构建原始输出（21,121 字节） |

## 8. 经验与教训

### 8.1 成功

- **基线优先**：阶段 0 的 size-limit 提前钉定体积基线，使后续优化可量化、可回归检测
- **风险分级实施**：阶段 1/2 改 `vite.config.ts` 是低风险（不动业务代码），阶段 3 才动 useGame.ts
- **保守重构策略**：3.1 大重组 + 后续 6.2 深化 NSFW 动态 import，每次只动一个面，保留可回滚点
- **文档化质量**：所有"半完成"任务都有 FACADE.md / SLICES.md 自我披露设计原则与限制

### 8.2 教训

- **TS 循环依赖隐藏很深**：阶段 1.2 拆分 game-runtime 时 Vite 兜底合并避开了 TDZ，但 3.1 重组才暴露；3.x 仍有 119 个 "Cannot find module" pre-existing 错误未清
- **js-tiktoken 是隐藏炸弹**：3.34 MB BPE 表 24MB node_modules 占用，仅用于 token 估算；阶段 5.1 改为 CJK/ASCII 启发式后立即释放 1.19 MB brotli
- **配置路径错误历史债**：阶段 2.1 修复 `state.gameConfig?.启用校园NSFW深化系统` 永远为 `false` 的 bug，原因是字段在嵌套结构里（7 个 NSFW flag 全部如此）
- **CSS 不可压缩到 200 KB**：90% 是源码实际使用的 utility class，purge 已正确；继续优化需源码级 `@apply` 抽取

## 9. 后续建议

| 优先级 | 任务 | 预期收益 |
|--------|------|---------|
| P1 | 3.4 集成 6 个 Zustand slice 到 zustandStore | 状态访问性能、组件订阅精度 |
| P1 | 合并 `models/game-settings.ts` 与 `models/system.ts` | 消除 21 个 pre-existing tsc 错误 |
| P2 | 4.3 preload 机制（idle 预拉下一视图） | 进游戏首屏体感 |
| P2 | useGame-runtime 进一步拆分（拆 `sendWorkflow` 子树） | 7+ 个静态被引用 NSFW 文件可拆 |
| P3 | CSS `@apply` 抽取（settings 重复 utility 模式） | 30-50 KB CSS |
| P3 | 6.2 进一步动态化（bdsmForumEngine / crossSystemLinker 等） | 减小 useGame-runtime |
