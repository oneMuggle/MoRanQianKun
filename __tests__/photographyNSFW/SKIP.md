# photographyNSFW 测试跳过决策

> 创建：2026-06-08
> 父 spec：docs/superpowers/specs/2026-06-06-project-optimization-roadmap-v2-design.md
> 父计划：docs/plans/2026-06-06_phase5-test-system-bootstrap.md

## 背景

Phase 5 测试体系补齐时发现 `__tests__/photographyNSFW/` 目录下 4 个测试文件无法加载：

- `engine.test.ts`
- `integration.test.ts`
- `leakWorkflow.test.ts`
- `shootWorkflow.test.ts`

## 跳过原因

**spec test 禁区**：根据父 spec，photographyNSFW 属于 18 个 NSFW 子系统之一，coverage 配置中已通过 `models/photographyNSFW/**` 排除项将其从覆盖率统计中剔除。

相关 vitest.config.ts 排除配置：

```ts
exclude: [
    // NSFW 子系统（spec 禁区：18 个）
    'models/bdsmNSFW/**',
    'models/boardGameNSFW/**',
    'models/campusNSFW/**',
    'models/exposureNSFW/**',
    'models/npcNSFWEnhancement/**',
    'models/nsfwCore/**',
    'models/outdoorNSFW/**',
    'models/photographyNSFW/**',
    'utils/nsfwResourceOps.ts',
],
```

## 决策

**跳过**这 4 个文件，不进行修复。其失败计入 spec 决策允许的失败数（27 个失败文件中的 4 个）。

后续阶段如需处理 NSFW 子系统测试，需：
1. 单独提案修改父 spec 中的禁区定义
2. 与 spec 维护者确认是否将 photographyNSFW 从禁区内移除
3. 然后再按正常流程修复测试

## 状态

- 跳过文件数：4 / 4
- 修复成本：未知（spec 禁区，未评估）
- 后续阶段依赖：spec 决策
