# 02b - TypeScript 严格度渐进策略

> 创建：2026-06-03
> 状态：**暂停推进**（2026-06-03 Phase 2 评估）

## 现状

- 全局 `tsconfig.json` 极宽松：无 `strict`、无 `strictNullChecks`、无 `noImplicitAny`
- `pnpm exec tsc --noEmit` 当前错误数：**628**（2026-06-03 排除 scripts/ 后）
- 创建 `tsconfig.strict.json` 单独打开 `strictNullChecks` + `noImplicitOverride`，CI 可对照运行但不阻塞

## 试错记录

### 子 tsconfig 模式（已弃用）

最初尝试在 `utils/tsconfig.json` 开启 strict + 限定 include。结果：
- `noUncheckedIndexedAccess` 引入 886 个错误（过大）
- `strictNullChecks` 引入 156 个错误（且不在 utils 内部）
- 子 tsconfig 的 `include` 被父配置吞掉，tsc 默认扫全部

**结论**：项目根 `tsconfig.json` 缺 `include` 字段是问题根源。

### 全局 strict 渐进（已弃用）

直接在根 `tsconfig.json` 加 `strictNullChecks` 会暴露 628 个错误。**远超 Phase 2 估时**。

## 当前保留

1. `tsconfig.strict.json`（utils 子集 + strict）— 单独跑可观察趋势
2. `tsconfig.json` 排除 scripts/ e2e/ android/ r2-worker/ functions/（已实施）
3. 修复了 2 个**真实**全局错误：
   - `prompts/runtime/worldEvolution.ts` 缺 `import type { 提示词结构 }`
   - `models/campusPhone.ts` 联合类型字面量 `社团活动` 与 interface 同名（已加注释说明）

## 推荐策略

把"严格度渐进"重排在 Phase 3 大文件拆分**之后**：
- 拆分后每个模块 < 400 行，独立 strict 化影响范围可控
- 循环依赖解耦（Phase 4）后再 strict，可避免重构时 strict 错误叠加

具体步骤：
1. **Phase 3 完成**后，回到每个新拆分子文件逐一 strict
2. 工具配置：`tsconfig.strict.json` 用 `composite: true` 配合 project references，逐子目录 strict
3. 进度门槛：每 strict 一个目录，错误数应 < 50 才合并回主 tsconfig

## CI 接入（后续）

```yaml
- run: pnpm exec tsc --noEmit                                # 必须通过（基线 0 错误）
- run: pnpm exec tsc --project tsconfig.strict.json --noEmit  # 仅报告，不阻塞（Phase 2 目标 ≤ 50 错误）
```
