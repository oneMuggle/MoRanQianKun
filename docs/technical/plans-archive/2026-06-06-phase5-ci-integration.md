# Phase 5 CI 集成决策记录

> 创建：2026-06-08（Day 59）
> 父 spec：docs/superpowers/specs/2026-06-06-project-optimization-roadmap-v2-design.md
> 父计划：docs/plans/2026-06-06_phase5-test-system-bootstrap.md

## 决策

- 创建 `.github/workflows/test-coverage.yml`（独立于现有 `ci.yml`）
- threshold 设为 **12%**（当前实际覆盖率，避免 CI 红）
- 4 个 `__tests__/photographyNSFW/` 失败为 spec 决策跳过（不在 coverage 范围）
- 上传 `coverage/` 报告为 GitHub Actions artifact（保留 7 天）

## 阈值规划

| 阶段 | 阈值 | 备注 |
|------|------|------|
| Day 59（现在） | 12% | 当前实际值 |
| Day 60（1 周内） | 20% | services/ 覆盖率稳定后提升 |
| 下轮 60 天末 | 30%+ | hooks/ + components/ 覆盖提升后 |

## workflow 详情

- **触发**：PR + push 到 `main` / `feat/optimization-v2`
- **环境**：ubuntu-latest + Node 20
- **执行顺序**：
  1. `npm ci` 安装依赖
  2. `npm run test:unit` 跑单元测试
  3. `npm run test:coverage` 生成 coverage 报告
  4. `npx vitest run --coverage --coverage.thresholds.lines=12` 阈值校验
  5. 上传 `coverage/` artifact

## 与现有 CI 关系

| Workflow | 职责 | 覆盖 |
|----------|------|------|
| `ci.yml` | 构建 + 单元测试（无阈值） | PR + push main |
| `test-coverage.yml`（新） | 跑 coverage + 阈值校验 | PR + push main + feat/optimization-v2 |
| `deploy.yml` / `release.yml` | 部署与发布 | 手动 + tag |
| `android.yml` / `lighthouse.yml` | 移动端 / 性能 | 特定场景 |

两套 CI 测试 job 并存不冲突：`ci.yml` 提供 fail-fast 单元测试，`test-coverage.yml` 提供详尽 coverage 报告。

## spec 边界遵守

- 未改任何测试代码
- 未新建 `__tests__/photographyNSFW/` 测试（spec 禁区）
- 阈值 12% 是当前实测，非目标值；目标值由 Day 60+ 阶段逐步提升
- 适配现有 `package.json` scripts（`test:unit` / `test:coverage` 已存在）
- 未引入新依赖
