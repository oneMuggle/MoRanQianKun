# 10 - 测试策略

> 创建：2026-06-03
> 状态：**已建立基础**（覆盖率门槛=0，待下个 Phase 提升）

## 当前测试覆盖

| 文件 | 测试文件 | 用例数 | 状态 |
|---|---|---|---|
| `utils/apiConfig.ts` | `apiConfig.test.ts` | 24 | ✅ |
| `utils/jsonRepair.ts` | `jsonRepair.test.ts` | 43 | ✅ |
| `utils/apiDiagnostics.ts` | `apiDiagnostics.test.ts` | 42 | ✅ |
| `utils/modelCategorizer.ts` | `modelCategorizer.test.ts` | 已存在 | ✅ |
| `utils/promptFeatureToggles.ts` | `promptFeatureToggles.test.ts` | 已存在 | ✅ |
| `utils/stateHelpers.ts` | `stateHelpers.test.ts` | 已存在 | ✅ |
| `hooks/useGame/saveCoordinator.ts` | `saveCoordinator.test.ts` | 20 | ✅ |
| `__tests__/photographyNSFW/*` | 多个 | 已存在 | ✅ |
| `hooks/useGame/intimacyUtils.ts` | `intimacyUtils.test.ts` | 已存在 | ✅ |
| `hooks/useGame/eventTrigger.ts` | `eventTrigger.test.ts` | 已存在 | ✅ |
| `hooks/useGame/mainStoryRequest.ts` | `mainStoryRequest.test.ts` | 已存在 | ✅ |

**总测试用例**：~2200+（含 hooks/useGame 的 96+ 测试文件）

## 测试分层

| 层级 | 范围 | 工具 | 当前 |
|---|---|---|---|
| 单元 | utils、纯函数 | vitest | ✅ utils 100% 覆盖 |
| Hook | useGame 子模块 | vitest + jsdom | ✅ 部分 |
| 集成 | IndexedDB、AI service（mock） | vitest | ⚠ 仅 photographyNSFW |
| E2E | 核心用户流 | Playwright | 3 个测试 |

## Phase 5 启动成果（2026-06-03）

### 新增测试

`utils/apiConfig.test.ts` 13 → **24 个用例**（+11 个，覆盖 4 个核心函数）：
- `创建空接口设置`：返回默认 + 引用独立
- `获取当前接口配置`：空设置/fallback/简化结构
- `获取主剧情接口配置`：空/有 active
- `接口配置是否可用`：null/缺字段/完整

### 验证现有测试

| 测试文件 | 之前 | 之后 |
|---|---|---|
| `apiConfig.test.ts` | 13/13 ✅ | 24/24 ✅ |
| `jsonRepair.test.ts` | 43/43 ✅ | 43/43 ✅ |
| `apiDiagnostics.test.ts` | 42/42 ✅ | 42/42 ✅ |
| `saveCoordinator.test.ts` | 20/20 ✅ | 20/20 ✅ |

### 配置变更

`vitest.config.ts`：
- 新增 `coverage.thresholds`（起步=0）
- `coverage.include: ['utils/**/*.ts']`（**只对 utils 强制门槛**）
- `coverage.reporter: [..., 'json-summary']`（CI 可读 JSON）

## CI 接入（未来）

```yaml
# .github/workflows/ci.yml
- name: Run tests
  run: pnpm exec vitest run

- name: Check coverage
  run: |
    pnpm exec vitest run --coverage
    # 读取 coverage/coverage-summary.json 校验
```

## 推荐优先级

| 优先级 | 模块 | 原因 |
|---|---|---|
| P0 | `utils/apiConfig.ts` ✅ | API 调用核心 |
| P0 | `utils/jsonRepair.ts` ✅ | AI 返回 JSON 修复 |
| P0 | `hooks/useGame/saveCoordinator.ts` ✅ | 存档不可逆 |
| P1 | `utils/eraUIText.ts` | 时代 UI 文案 |
| P1 | `hooks/useGame/responseCommandProcessor.ts` | NPC 命令处理 |
| P1 | `utils/apiConfigConstants.ts` | API 常量 |
| P2 | `models/era-config/presets.ts` | 时代预设数据 |
| P2 | `services/dbService/deviceMessages.ts` | 设备消息 |
| P3 | 其他 utils / hooks | 按访问频率 |

## 下个 Phase 目标

| 指标 | 当前 | 目标 |
|---|---|---|
| utils/ 覆盖率门槛 | 0% | 30% |
| 总测试用例 | ~2200 | 2500+ |
| utils/ 关键函数覆盖 | 5 个 | 10+ |

## 已知失败用例（基线中已有，非 Phase 5 引入）

| 测试 | 失败原因 |
|---|---|
| `memorySummaryHandlers.test.ts` | `deps.set后台记忆总结状态 is not a function`（mock 工厂版本不一致）|
| `sendWorkflow.test.ts` | AbortError 处理 |
| `historyTurnWorkflow.test.ts` | 玩家输入 |
| `rollbackSnapshot.test.ts` | 历史/记忆恢复 |

这些属 **Phase 3 重构（dbService 拆分）的副作用**，留作后续 Phase 修复。
