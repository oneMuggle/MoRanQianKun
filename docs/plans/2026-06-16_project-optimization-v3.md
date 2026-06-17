# 项目优化方案 v3.0

> **创建日期**：2026-06-16
> **作者**：planner
> **状态**：已确认，待执行
> **前置**：[v2.0 路线图](../technical/14-optimization-roadmap-v2.md)（Phase 0~5 已完成）
> **项目**：墨染乾坤：万象纪元

---

## 一、需求重述

在已完成的 src/ 目录迁移 + 60 天路线图 Phase 0~5 基础上，针对**仍存在的实质性瓶颈**给出新一轮滚动优化方案。重点：

- 不破坏现有功能与游戏数据
- 不替换 React 19 + TypeScript + Vite 6 + IndexedDB 技术栈
- 每个阶段**独立可验证、可回滚**
- 优先解决**真正影响交付/维护**的问题（覆盖率、大文件、循环依赖、错误处理），跳过"锦上添花"（i18n、暗色主题等）

## 二、当前现状（2026-06-16 实测）

| 指标 | 数值 | v2 目标 | 评价 |
|---|---|---|---|
| 源文件数 | 1508 | — | 增长 0.4% |
| 测试文件 | 129 | ≥200 | ⚠️ 缺 70+ |
| 测试覆盖率 threshold | lines 10 / functions 10 / branches 8 | lines 80 | 🔴 远低于目标 |
| `App.tsx` | 22592 字节 | <800 行 | 🔴 仍超限（拆分已停滞） |
| `useGame.ts` | 1271 行 | <500 | 🟡 仍超限 |
| `ImageManagerModal.tsx` | 3523 行 | <800 | 🔴 全项目最大单文件 |
| `MobileImageManagerModal.tsx` | 3097 行 | <800 | 🔴 桌面/移动双份 |
| `NovelDecompositionSettings.tsx` | 3067 行 | <800 | 🔴 |
| `ImageGenerationSettings.tsx` | 2205 行 | <800 | 🔴 |
| `systemPromptBuilder.ts` | 1844 行 | <800 | 🔴 |
| TS 严格模式覆盖 | 仅 12 个 utils 文件 | 全量 | 🔴 覆盖率 < 1% |
| `any` / `@ts-ignore` / `@ts-expect-error` | 4371 处 | <500 | 🔴 严重技术债 |
| 循环依赖 | 已用 vite chunk 兜底 | 0 | 🟡 治标 |
| entry chunk | 25.45 KB | <350 KB | ✅ 优秀 |
| vendor chunk | 58.38 KB | <3.7 MB | ✅ 优秀 |
| game-runtime chunk | 375.96 KB | <3 MB | ✅ 优秀 |
| CI workflow | 6 个（android/ci/deploy/lighthouse/release/test-coverage） | ≥6 | ✅ 完善 |
| 总文档数 | plans 47 / technical 35 | plans 0（全部归档） | 🔴 47 份计划待清理 |

### 已完成的 Phase（无需再做）
- ✅ Phase 0：质量工具（madge/ts-prune/knip/size-limit）已安装
- ✅ Phase 1：文档归一化（部分，plans 仍多）
- ✅ Phase 2：TS 严格度渐进（仅 utils 部分）
- ✅ Phase 3：大文件拆分（useGame/App 已缩，仍有巨型组件）
- ✅ Phase 4：循环依赖解耦（已绕过，但未根治）
- ✅ Phase 5：测试体系 bootstrap（threshold 仍 10%）

## 三、风险与依赖

| 等级 | 描述 | 缓解措施 |
|---|---|---|
| **HIGH** | 拆分 `ImageManagerModal` (3523) / `NovelDecompositionSettings` (3067) 涉及业务深，破坏面大 | 必须先建立类型契约 → 抽 sub-component → 写测试 → 再拆状态 |
| **HIGH** | 4371 处类型转义，渐进开启 strict 会暴露历史 bug | 分子模块开启 strict，每个模块独立 PR；用 `// @ts-expect-error` 留逃生通道 |
| **HIGH** | 测试覆盖率从 10% → 80% 是体力活（缺口 ~70 个文件 × 平均 100 行测试） | 优先覆盖 utils + services + models（最高 ROI），UI 留 Phase 后 |
| **MEDIUM** | `prompts ↔ models ↔ useGame` 循环依赖若根治会触发大面积 import 调整 | 引入"接口层 `types/contracts.ts`" + DI 容器渐进解耦 |
| **MEDIUM** | 桌面/移动双组件（22 个特性 × 2）合并风险高 | 仅合并 ≥80% 重复的子模块（如 ImageManager）；其余保留但抽取共享 hook |
| **LOW** | 47 份 plans 文档迁移可批处理 | 一次性 PR，机械操作 |

## 四、优化总览（v3.0 路线图）

```
┌─────────────────────────────────────────────────────────────────┐
│ Phase A  文档清理         [治理]      ~0.5d   立即收益            │
│ Phase B  大组件拆分       [重构]      ~5d    一次性减负           │
│ Phase C  类型安全升级     [质量]      ~4d    渐进开启 strict      │
│ Phase D  测试覆盖率提升   [质量]      ~8d    10% → 50%           │
│ Phase E  循环依赖根治     [架构]      ~3d    移除 vite 兜底       │
│ Phase F  错误边界统一     [可观测]    ~2d    ErrorBoundary + Sentry │
│ Phase G  共享 hook 抽取   [重构]      ~3d    desktop/mobile 合并   │
└─────────────────────────────────────────────────────────────────┘
总投入约 25.5 个工作日（约 5 周）。可并行执行 C+D、E+F。
```

## 五、分阶段实施方案

### Phase A：文档清理（0.5 天）— 低风险高收益

**目标**：`docs/plans/` 中已完成的 47 份计划按规则归档到 `technical/` 或删除。

**步骤**：
1. 读取 `docs/plans/2026-06-09_phase-*-*.md` 等最近归档的写法作为模板
2. 用脚本扫描每份 plan 的标题与日期，结合 git log 判定是否已完成
3. 已完成的：移动到 `docs/technical/plans-archive/<YYYY-MM>/<原名>.md`
4. 仍有效的：保留在 `docs/plans/`
5. 更新 `docs/technical/README.md` 章节目录

**产出**：`docs/plans/` ≤ 5 份有效计划；新增归档索引。

### Phase B：大组件拆分（5 天）

**目标**：把 >2000 行的 5 个巨型组件降至 <800 行。

**优先级排序**（按业务深度由浅到深）：

| 顺序 | 文件 | 当前 | 目标 | 拆分策略 |
|---|---|---|---|---|
| B1 | `ImageGenerationSettings.tsx` | 2205 | <800 | 按设置子域拆 5 个 tab panel |
| B2 | `NovelDecompositionSettings.tsx` | 3067 | <800 | 状态机 → context，子页面 → 独立路由 |
| B3 | `systemPromptBuilder.ts` | 1844 | <500 | 按 prompt 域（core/runtime/writing）纯函数拆分 |
| B4 | `MobileImageManagerModal.tsx` | 3097 | <800 | 复用 B1 提取的子组件，仅保留移动端交互差异 |
| B5 | `ImageManagerModal.tsx` | 3523 | <800 | 同上，desktop/mobile 抽取共享子组件 |

**强制前置**（每个组件必须）：
1. 写 1 个 smoke test（确保不挂）
2. 用 `ts-prune` 列出 export 函数，确定公共 API
3. 抽出 props/types 到 `types/` 子目录
4. 拆 3 次以上小 PR（不一次性拆完）

**风险**：B4/B5 涉及桌面/移动双份代码，建议**合并**为单一组件 + 响应式 props（同步推进 Phase G）。

### Phase C：类型安全升级（4 天）

**目标**：把 TS strict 从"12 个 utils"扩展到全量 70% 模块。

**渐进开启顺序**（按改动量从小到大）：

| 轮次 | 开启模块 | 预期改动量 | 阈值 |
|---|---|---|---|
| C1 | `src/utils/*.ts`（除 nsfw） | ~50 处 | 已有 strict 文件 |
| C2 | `src/services/**/*.ts` | ~200 处 | 纯函数多 |
| C3 | `src/models/domain/**` | ~300 处 | 类型定义集中 |
| C4 | `src/hooks/useGame/*.ts`（子模块） | ~400 处 | 业务逻辑 |
| C5 | `src/components/**/*.tsx` | ~1500 处 | 最后处理 |

**具体规则**：
- `strictNullChecks`、`noImplicitAny`、`strictFunctionTypes` 一次性开
- `noUncheckedIndexedAccess` 分模块开（影响 array access）
- `exactOptionalPropertyTypes` 最后开（影响 React props 兼容性）

**工具**：用 `// @ts-expect-error <issue-id>` 标记每个历史逃逸，issue-id 跟踪修复。

**产出**：CI 加 `npm run typecheck:strict`，失败即阻塞 PR。

### Phase D：测试覆盖率提升（8 天，可与 C 并行）

**目标**：从 10% → 50%（务实目标，分阶段）。

**分阶段目标**：

| 周 | 目标覆盖率 | 范围 |
|---|---|---|
| D1 | 10% → 25% | `src/utils/`（已有基础，扩到全量） |
| D2 | 25% → 35% | `src/services/`（dbService / saveArchive / githubSync） |
| D3 | 35% → 45% | `src/models/`（类型守卫、纯函数） |
| D4 | 45% → 50% | `src/hooks/useGame/` 关键 workflow |

**原则**：
- UI 组件测试 ROI 低，**不在本阶段范围**（用 E2E 兜底）
- 测试类型偏好：纯函数单元测试 > integration > E2E
- 每个新测试必须有 aaa 结构 + 描述性命名（遵循 `common/testing.md`）

**工具**：vitest + msw + fake-indexeddb 已配置，可直接开干。

### Phase E：循环依赖根治（3 天）

**当前状态**：vite.config.ts 用 chunk 包裹 `prompts ↔ models ↔ useGame` 治标。

**根治方案**：

1. **识别循环**：跑 `npm run lint:graph`，列出所有 cycle
2. **抽接口层**：新建 `src/types/contracts.ts`，把所有跨域类型放进来
3. **依赖反转**：
   - `models/*.ts` 只依赖 `types/contracts.ts`
   - `prompts/*.ts` 只依赖 `types/contracts.ts` + 自己的常量
   - `hooks/useGame/*.ts` 依赖前两者 + services
4. **删除 vite chunk 白名单**：移除 `models/contemporary/barNSFW/engine.ts` 等强制归到 useGame-runtime 的特例

**验收**：`npm run lint:graph` 输出空（无 warning）。

### Phase F：错误边界统一（2 天，可与 E 并行）

**目标**：消除"silent failure"和零散 try/catch。

**实施**：
1. 顶层 `<App>` 包 `<ErrorBoundary>`，fallback UI 显示错误码
2. 关键路径（AI 请求、IndexedDB 写入、图片加载）加 Sentry 或自建 errorReporter
3. 把 `hooks/useGame/` 中散落的 `console.error` 替换为统一 logger
4. 把"AI 流式中断"等场景显式化（不静默吞掉）

**产出**：`utils/errorReporter.ts` + 全量 `__tests__/errorBoundary.test.tsx`。

### Phase G：桌面/移动共享 hook 抽取（3 天）

**目标**：22 个特性组件中 ≥80% 重复的部分合并。

**评估标准**：
- `grep "<div className=" <mobile>.tsx <desktop>.tsx` → 计算相同结构占比
- 占比 >80% 的：合并为单一组件 + `useResponsiveLayout()` hook
- 占比 <80% 的：保留双份但抽取共享逻辑到 `shared/<feature>.ts`

**优先级**：
- 必合并：ImageManager（Phase B 同步）、Settings（已部分合并）
- 可合并：Character、Inventory、Equipment、Task、Team
- 保留双份：Chat、Map（交互差异大）

**风险**：合并期间 UI 回归概率高，必须保留 v1 截图对照（用 Playwright snapshot）。

## 六、关键文件清单

### 必读
- `docs/plans/2026-06-03-project-optimization.md`（v2 路线图，理解已完成部分）
- `vite.config.ts`（理解现有 chunk 拆分与循环依赖兜底）
- `tsconfig.strict.json`（strict 模式现状）
- `vitest.config.ts`（覆盖率配置）
- `eslint.config.*`（lint 规则）

### 必改（Phase B）
- `src/components/features/Social/ImageManagerModal.tsx`（3523 行）
- `src/components/features/Social/mobile/MobileImageManagerModal.tsx`（3097 行）
- `src/components/features/Settings/NovelDecompositionSettings.tsx`（3067 行）
- `src/components/features/Settings/Image/ImageGenerationSettings.tsx`（2205 行）
- `src/hooks/useGame/systemPromptBuilder.ts`（1844 行）

### 必建（Phase E）
- `src/types/contracts.ts`（跨域类型契约）

## 七、验收标准

每个阶段完成后必须满足：

- [ ] `npm run lint` 0 error
- [ ] `npm run typecheck` 0 error
- [ ] `npm run test` 通过 + 覆盖率 ≥ 本阶段目标
- [ ] `npm run build` 通过（chunk warning 数不增加）
- [ ] 现有 e2e 流程未回归（Playwright smoke 通过）
- [ ] 该阶段引用的 CHANGELOG 条目已写入

## 八、与项目级规则的一致性

- 遵循 `feature-development.md`：每个 Phase 必须先有 plan 文档（在 `docs/plans/`），完成后归档到 `technical/`
- 遵循 `feature-branch-workflow.md`：每个 Phase 一个 feature 分支 + PR
- 遵循 `code-review.md`：每个 PR 必须经 code-reviewer 检阅后才 merge
- 遵循 `security.md`：拆分 dbService 时不暴露密钥到日志
- 遵循 `testing.md`：覆盖率阶段必须 80%+ 目标，但本路线图务实到 50%（UI 暂缓）

## 九、明确不做（避免范围蔓延）

- ❌ i18n 框架（v2 已规划为选做，本版明确不做）
- ❌ PWA / 离线强化（IndexedDB 已支持离线）
- ❌ UI 主题系统大改（已支持 visualConfig）
- ❌ React 19 → 20 升级（等其他生态稳定）
- ❌ 把 `useGame.ts` 完全拆为 store（zustand 已集成，风险大）

## 十、预估复杂度

| Phase | 工时 | 风险 | 并行度 |
|---|---|---|---|
| A 文档清理 | 0.5d | LOW | — |
| B 大组件拆分 | 5d | HIGH | B1+B3 并行 |
| C 类型安全升级 | 4d | HIGH | C 串行（按轮次） |
| D 测试覆盖率 | 8d | MEDIUM | D 全程可并行 |
| E 循环依赖根治 | 3d | HIGH | E 串行 |
| F 错误边界 | 2d | LOW | F 与 E 并行 |
| G 共享 hook 抽取 | 3d | MEDIUM | G 与 B 后半段并行 |
| **合计** | **25.5d** | | |

## 实施步骤

按 Phase 顺序执行，每个 Phase 一个 feature 分支：

- [x] Phase A：文档清理（2026-06-16，PR #9 merged）
- [x] Phase B：大组件拆分（2026-06-16~17，B1 完成，PR #10~#14 merged）
  - [x] B1：`ImageGenerationSettings.tsx`（2205 → 248 行，拆 6 个 panel）
- [ ] Phase C：类型安全升级
- [ ] Phase D：测试覆盖率提升
- [ ] Phase E：循环依赖根治
- [ ] Phase F：错误边界统一
- [ ] Phase G：共享 hook 抽取
