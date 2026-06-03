# 02c - modules/ 目录未使用脚手架

> 创建：2026-06-03
> 状态：**B 方案已执行**（2026-06-03）

## 调研结论

`modules/` 目录下 20 个子目录（era-*、nsfw-*、biz-*、contemporary）**没有任何文件 import 它们**。

```bash
$ for d in /home/fz/project/MoRanJiangHu/modules/*/; do
    name=$(basename "$d")
    count=$(grep -rln "from ['\"].*modules/$name" /home/fz/project/MoRanJiangHu --include="*.ts" --include="*.tsx" 2>/dev/null | grep -v node_modules | wc -l)
    echo "$name: $count importers"
  done
biz-device: 0
biz-galgame: 0
biz-novel: 0
... (全部 0)
```

## 与 2026-05-31 module-refactor 方案的关系

`docs/plans/2026-05-31-module-refactor.md` 提出"core 骨架 + modules 插件"架构。
**实施状态**：
- ✅ `core/` 骨架已搭建（`core/types/`、`core/engine/`、`core/db/`、`core/module-registry/`）
- ✅ `ModuleLoader` 类已实现（`core/engine/ModuleLoader.ts`）
- ❌ `ModuleLoader.registerMany()` 无任何调用方
- ❌ `modules/*/index.ts` 的 `manifest` 导出无任何引用
- ❌ 实际功能仍在 `legacyRegistrations.ts` 注册，未迁移到 ModuleLoader

**结论**：模块化重构只完成了"骨架建设"，未完成"迁移到新骨架"。

## 历史重复

`modules/era-*/epoch-*.ts` 与 `models/eraTheme/epoch-*.ts` 内容**完全重复**（仅 1 行 import 路径差异）：
- `models/eraTheme/` = 7317 行（带 types、assembly、test）
- `modules/era-*/` = 6502 行（重复内容）

**单一真相源应保留 `models/eraTheme/`**（它有 375 行测试覆盖）。

## 推荐行动（待用户确认）

| 行动 | 影响 | 风险 |
|---|---|---|
| **A. 立即删除整个 `modules/` 目录** | 节省 6502+ 行死代码、简化 Vite 配置 | 如果未来某天要启用 module-registry，需要重写 |
| **B. 保留 modules/，但删除 era 重复** | 仅删 6502 行 era 重复，保留 nsfw/biz 脚手架 | 中等风险 |
| **C. 全部保留，记录在案** | 0 改动，承认是未启用脚手架 | 维护成本（每个文件都需关注） |

## 我的建议

**B 方案**：删除 era 重复（7320 行 → 0），保留 nsfw/biz 脚手架（按 Phase 4 计划，新架构启用时会用到）。

具体步骤：
1. 删除 `modules/era-*/` 整个目录（7 个子目录 × 2 文件 = 14 文件，6502 行）
2. Vite 配置移除 `era-*` manualChunks（已无意义）
3. `tsconfig.strict.json` 排除 `modules/era-*`
4. ts-prune 重新跑，验证 `models/eraTheme/` 是唯一引用

## 用户决策

- [x] **B 方案已执行**（2026-06-03）
  - 删除 `modules/era-ancient/`、`era-contemporary/`、`era-far-future/`、`era-modern/`、`era-near-future/`、`era-post-human/`、`era-primordial/`
  - 共 14 文件、约 6502 行
  - `modules/index.ts` 同步清空 `eraModules` 字段（避免 tsc 报错）
  - Vite 配置加注释标记 era 拆分已无意义
  - tsc 错误数：628 → 628（持平，无回归）

**遗留 nsfwModules / businessModules**：保留但需用户未来决定是否进一步清理。
