# 02d - 循环依赖解耦记录

> 创建：2026-06-03
> 状态：**进行中**（已解 2/16）

## 进度

| 时点 | 循环依赖数 | 减少 |
|---|---|---|
| 2026-06-03 00:50（Phase 0 基线） | 16 | - |
| 2026-06-03 03:11（Phase 4 进展） | **14** | **-2** |

## 已解耦（2 个）

### ✅ 环 B：`models/bdsmNSFW/index.ts ↔ normalization.ts`

**根因**：`index.ts` 导出 `BDSM系统设置` 接口 + `默认BDSM系统设置` 常量；`normalization.ts` 同时 import 它们作为规范化函数入参。

**修复**：
1. 将 `BDSM系统设置` interface 与 `默认BDSM系统设置` 常量从 `index.ts` 移到 `normalization.ts` 内部
2. `index.ts` 用 `export type / export` 重新导出，对外 API 100% 兼容
3. 净减少 0 行代码（纯重构）

**验证**：`pnpm exec madge --circular models/bdsmNSFW/` → "✔ No circular dependency found!"

### ✅ 环 E：`models/boardGameNSFW/index.ts ↔ normalization.ts`

**修复模式**：与环 B 完全相同（同样是从 `index.ts` 移接口/常量到 `normalization.ts`）。

**验证**：`pnpm exec madge --circular models/boardGameNSFW/` → "✔ No circular dependency found!"

## 剩余 14 个循环依赖

### 环 A：`types.ts ↔ models/character.ts`

- **根因**：`types.ts` 是总 re-export 入口（`export * from './models/character'`）
- **`character.ts` 反向引用 `types.ts`**：因为它需要其他模型类型
- **修复方案**：让 `types.ts` 不再 `export *` 自 `character.ts`，改为 `export type` + 各使用方直接 import `./models/character`
- **影响面**：约 50+ 文件，**需要批量改 import**
- **难度**：中（耗时 0.5-1 天）

### 环 C：`models/game-settings.ts ↔ models/era-config.ts`

- **根因**：两个文件互相引用对方的类型
- **修复方案**：把共享类型提取到 `models/_shared/eraConfigShared.ts`
- **影响面**：约 10-20 文件
- **难度**：低（0.3-0.5 天）

### 环 D（9 条子环）：`models/npcNSFWEnhancement/*` 复杂环

- **根因**：`types.ts` 引用 `discovery/*` 等子模块；`discovery/*` 又通过复杂类型链反向引用 `types.ts`
- **修复方案**：将 `types.ts` 拆为多个子文件（`types/core.ts`、`types/discovery.ts`），按子模块归属；或建立 `types/_shared.ts` 中转
- **影响面**：约 30+ 文件（整个 `npcNSFWEnhancement` 子系统）
- **难度**：**高**（2-3 天）— 涉及类型层级重构

### 环 F：`prompts/runtime/eraLiMode.ts ↔ npcNSFWEnhancement.ts`

- **根因**：`eraLiMode.ts` import `构建NPCNSFW注入`（值）；`npcNSFWEnhancement.ts` 通过 `models/npcNSFWEnhancement/*` 间接反向触发
- **修复方案**：与环 D 合并处理（同样的 npcNSFWEnhancement 子系统）
- **难度**：包含在环 D 内

### 环 G（3 文件环）：`services/ai/image/{imageTasks,backends,persistence}.ts`

- **根因**：3 文件互相引用
- **修复方案**：把共用的 helper 提取到 `imageTasks/_shared.ts`；或重新梳理调用方向
- **难度**：中（0.5 天）

### 环 H：`hooks/useGame/sendWorkflow/{index,responseProcessingPhase}.ts`

- **根因**：`responseProcessingPhase.ts` `import type { 回合快照结构 } from './index'`（纯类型）
- **本质**：**madge 误报**（纯 `import type` 不会运行时 TDZ）
- **修复方案**：保留现状（Vite 兜底已生效）；或加 `// @ts-ignore` 抑制 madge
- **难度**：零（已无需处理）

## 推荐策略

按"投入产出比"优先级处理：

| 优先级 | 环 | 工作量 | 建议时机 |
|---|---|---|---|
| P0 | 环 A | 0.5-1 天 | Phase 4 剩余时间内 |
| P1 | 环 C | 0.3-0.5 天 | Phase 4 剩余时间内 |
| P2 | 环 G | 0.5 天 | 后续 Phase |
| P3 | 环 D + F | 2-3 天 | 单独 Phase（**不建议与 Phase 5+ 并行**）|
| - | 环 H | 0（madge 误报）| 不需要 |

**Phase 4 完成目标**：14 → 12（再解 A、C）

## Vite 兜底确认

尽管有 14 个循环，**`pnpm run build` 成功**（2.86 MB game-runtime chunk，gzip 870KB），证明当前架构在打包后能正常运行。

`game-runtime` chunk 合并 `prompts + models + hooks/useGame` 三个目录是 Vite 兜底策略（避免运行时 TDZ），未来 Phase 4 完成后可优化该 chunk 拆分粒度。
