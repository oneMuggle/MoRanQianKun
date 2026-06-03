# 项目质量基线 — 2026-06

> **采集时间**：2026-06-03
> **采集工具**：`madge`、`ts-prune`、`knip`、`vitest run`
> **采集脚本**：`scripts/collectMetricsBaseline.mjs` (`npm run metrics:baseline`)
> **对照基线**：用于 `docs/plans/2026-06-03-project-optimization.md` 8 阶段优化方案完成后做对比

---

## 一、关键指标（基线快照）

| 指标 | 数值 | 状态 | 目标（Phase 8 完成时） |
|---|---|---|---|
| 循环依赖数（madge） | **16** | ✗ | 0 |
| 未引用导出数（ts-prune） | **958** 行 / 数千项 | ✗ | 评估后清除 ≥ 50% |
| 未使用依赖项（knip） | 见 `baseline-unused.txt` | ✗ | 评估后处理 |
| 测试文件数 | **96** | ⚠ | ≥ 120 |
| 测试用例数（it+test） | **2126** | ⚠ | ≥ 3000 |
| vitest 失败用例 | **4 / 2138** | ✗ | 0 |

## 二、文件清单

| 文件 | 内容 | 大小 |
|---|---|---|
| `baseline-circular.txt` | madge 输出的 16 个循环依赖链 | 3.4 KB |
| `baseline-dead.txt` | ts-prune 输出的未引用导出 | 339 KB |
| `baseline-unused.txt` | knip 输出的未使用文件/依赖/类型 | 364 KB |
| `baseline-tests.txt` | vitest run 完整输出（2132 通过 / 4 失败） | 7.9 KB |
| `baseline-test-count.txt` | 测试文件 + 用例统计 | 133 B |

## 三、循环依赖热点（Top 16）

来源：`baseline-circular.txt`

1. `types.ts > models/character.ts`
2. `models/bdsmNSFW/index.ts > models/bdsmNSFW/normalization.ts`
3. `models/game-settings.ts > models/era-config.ts`
4. `models/npcNSFWEnhancement/types.ts > models/npcNSFWEnhancement/dailyPattern.ts`
5. `models/npcNSFWEnhancement/types.ts > models/npcNSFWEnhancement/discovery/fetishDiscovery.ts`
6. `models/social.ts > models/npcNSFWEnhancement/types.ts > models/npcNSFWEnhancement/discovery/fetishDiscovery.ts`
7. `models/npcNSFWEnhancement/types.ts > models/npcNSFWEnhancement/discovery/personalityTrigger.ts`
8. `models/social.ts > models/npcNSFWEnhancement/types.ts > models/npcNSFWEnhancement/discovery/personalityTrigger.ts`
9. `models/npcNSFWEnhancement/types.ts > models/npcNSFWEnhancement/discovery/sensitivePointDiscovery.ts > models/npcNSFWEnhancement/sensitiveZones.ts`
10. `models/npcNSFWEnhancement/types.ts > models/npcNSFWEnhancement/discovery/sensitivePointDiscovery.ts`
11. `models/social.ts > models/npcNSFWEnhancement/types.ts > models/npcNSFWEnhancement/discovery/sensitivePointDiscovery.ts`
12. `models/social.ts > models/npcNSFWEnhancement/types.ts`
13. `models/boardGameNSFW/index.ts > models/boardGameNSFW/normalization.ts`
14. `prompts/runtime/eraLiMode.ts > prompts/runtime/npcNSFWEnhancement.ts`
15. `services/ai/image/imageTasks.ts > services/ai/image/backends.ts > services/ai/image/persistence.ts`
16. `hooks/useGame/sendWorkflow/index.ts > hooks/useGame/sendWorkflow/responseProcessingPhase.ts`

### 模式观察

- **npcNSFWEnhancement 集中区**（4-12 共 9 条）— 主要由 `types.ts` 反向引用子模块引发
- **Vite 兜底**：`vite.config.ts` 已把 `prompts + models + hooks/useGame` 全部打入 `game-runtime` chunk 避免运行时 TDZ

## 四、测试失败用例清单

来源：`baseline-tests.txt` 中 4 个失败测试

| # | 测试文件 | 失败原因 |
|---|---|---|
| 1 | `hooks/useGame/sendWorkflow.test.ts` | `returns cancelled and restores from snapshot on AbortError` |
| 2 | `hooks/useGame/time/historyTurnWorkflow.test.ts` | `returns player input on success` |
| 3 | `hooks/useGame/ui/rollbackSnapshot.test.ts` | `restores history and memory` |
| 4 | `hooks/useGame/memory/memorySummaryHandlers.test.ts` | `TypeError: deps.set后台记忆总结状态 is not a function` |

均与 `AbortError`、`jsdom` confirm/alert 警告、测试 mock 工厂版本不一致相关。

## 五、复现命令

```bash
# 一键复现所有基线
pnpm run metrics:baseline

# 单项复现
pnpm run lint:graph    # 循环依赖
pnpm run lint:dead     # 未引用导出
pnpm run lint:unused   # 未使用文件/依赖
pnpm run test:run      # 测试运行
```

## 六、下一阶段目标（Phase 1 完成后）

| 指标 | 预期改善 |
|---|---|
| 计划文档数（docs/plans/） | 30+ → ≤ 8（仅未完成） |
| docs/technical/ 章节数 | 0 → 10 + 总览 |
| 用户手册 README | 创建 |

---

**基线文件**与本文档配套保存，Phase 8 完成后用同脚本再次采集，做前后对比。
