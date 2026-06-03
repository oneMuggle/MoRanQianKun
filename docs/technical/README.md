# 技术手册 — 墨染乾坤：万象纪元

> 面向开发者的技术文档总览，包含架构、API、各功能模块实现细节、部署说明。
> **当前版本**：2026-06-03 起按新规范重构中

## 章节目录

| 编号 | 章节 | 简介 |
|------|------|------|
| 01 | [architecture-overview](./01-architecture-overview.md) | 项目总览、技术栈、目录约定、构建工具链 |
| 02 | [state-modularization](./02-state-modularization.md) | useGame 架构、zustandStore、子模块拆分（来自 2026-05-31 重构） |
| 02b | [typescript-strict-strategy](./02b-typescript-strict-strategy.md) | TS 严格度渐进策略、试错记录、CI 接入（Phase 2 暂停后方案） |
| 02c | [modules-unused-scaffolding](./02c-modules-unused-scaffolding.md) | modules/ 目录调研：20 个子目录 0 引用方，B 方案已删 era 重复 6502 行 |
| 02d | [circular-deps-decoupling](./02d-circular-deps-decoupling.md) | 循环依赖解耦记录：16 → 14（BDSM + boardGame 已解），剩余 14 个待后续 |
| 02e | [dbservice-split-progress](./02e-dbservice-split-progress.md) | dbService 拆分进展：deviceMessages/schema/initialization 已拆，剩余 1/3 待后续 |
| 03 | [prompt-architecture](./03-prompt-architecture.md) | 提示词分层、运行时构建、systemPromptBuilder 迁移（来自 2026-06-01） |
| 04 | [ai-pipeline](./04-ai-pipeline.md) | AI 客户端、多 provider 抽象、图像/文本/流式 |
| 05 | [persistence](./05-persistence.md) | IndexedDB、dbService、GitHub Sync、存档迁移 |
| 06 | [module-registry](./06-module-registry.md) | 弹窗注册、桌面/移动组件工厂、动态导入 |
| 07 | [eras-and-themes](./07-eras-and-themes.md) | 多纪元系统、时代主题、子纪元预设 |
| 08 | [nsfw-systems](./08-nsfw-systems.md) | NSFW 子系统合集（harem、bar、bdsm、photography、campus） |
| 09 | [image-pipeline](./09-image-pipeline.md) | 图像生成、NovelAI 代理、资产引用 |
| 10 | [build-and-deploy](./10-build-and-deploy.md) | Vite 配置、manualChunks、Cloudflare Pages Functions、GitHub Pages |
| 11 | [testing-strategy](./11-testing-strategy.md) | 测试体系：utils 100% 覆盖 + 96+ hooks 测试文件 + 2200+ 用例 |
| 11 | [memory-system](./11-memory-system.md) | 四段记忆（短期/中期/长期/背景）、记忆检索与总结 |
| 12 | [novel-decomposition](./12-novel-decomposition.md) | 小说拆解调度、长篇规划注入 |
| 13 | [planning-systems](./13-planning-systems.md) | 剧情规划、女主规划、同人规划 |
| 14 | [interaction-model](./14-interaction-model.md) | 玩家交互、命令处理器、NSFW 反馈链路 |
| 15 | [performance-monitoring](./15-performance-monitoring.md) | FPS 显示、性能仪表盘（来自 2026-05-17） |
| 16 | [metrics-baseline-2026-06](./metrics-baseline-2026-06/README.md) | 2026-06-03 项目质量基线（16 循环依赖等） |

## 归档决策来源

每个章节如有"已归档决策"区，会引用对应的历史 `docs/plans/*.md`（已完成且重要的设计决策）。

已完成并迁移到本目录的历史计划：
- `2026-05-17-performance-monitor-enhancement.md` → 15 章
- `2026-05-18-exhibition-system-enhancement.md` → 08 章 NSFW 子项
- `2026-05-22_nsfw-gameplay-enhancement.md` → 08 章 NSFW 子项
- `2026-05-31-module-refactor.md` → 02 章
- `2026-06-01-systemPromptBuilder-migration.md` → 03 章

## 旧主题文档（未重构）

以下文件仍保留在 `docs/technical/` 根下，未被本 README 索引归并：

- `architecture.md`（旧版架构说明，2026-05 前）
- `components.md`（旧版组件说明）
- `services.md`（旧版服务说明）
- `state-management.md`（旧版状态管理）
- `prompt-system.md`（旧版提示词系统）
- `refactor-story-response-parser.md`（历史重构记录）
- `completed-features-2026-05-09.md`（功能清单）
- `era-theme-tree.md`（时代主题树）
- `nsfw-systems-decoupling.md`（NSFW 解耦方案）
- `search-filter-wizard.md`（搜索过滤向导）
- `phase-0-infrastructure.md`（2026-04-28 基础设施）
- `plans-archive/`（已归档子目录）
- `reference/`（参考资料子目录）
- `功能清单.md`（中文功能清单）

## 写入规范

新增技术文档时：
1. 在本 README 表格中追加一行
2. 文件名格式 `NN-topic-name.md`（NN 为两位数编号）
3. 不与现有章节重复

## 相关资源

- [项目总优化方案](../../plans/2026-06-03-project-optimization.md) — 8 阶段路线图
- [项目根 CLAUDE.md](../../../CLAUDE.md) — Claude Code 项目指引
- [用户手册](../user-manual/) — 面向最终用户
