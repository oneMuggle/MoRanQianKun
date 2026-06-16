# NSFW 系统优化方案

> 创建日期：2026-06-03
> 状态：计划中

---

## 背景与目标

墨染乾坤的 NSFW 系统经过多轮迭代已具备 7 个子模块、30+ 模型文件、1200+ 行提示词规则的规模。但在代码审计中发现了一系列问题：

1. **核心 Bug**：部分调用路径丢失 NSFW 档位参数，导致运行时回退到 "完全展开"
2. **代码重复**：`npcContext/` 与 `npc/npcContext.ts` 存在 1460 行重复代码
3. **集成缺口**：BDSM/BoardGame 独立 NSFW 未接入运行时提示词管线
4. **死代码残留**：`intimacy/index.ts` 中未被调用的函数、`npcContext/` 目录部分冗余

**目标**：修复已知 Bug、补齐集成缺口、清理技术债、提升代码可维护性。

---

## 架构现状

```
当前 NSFW 数据流（已修复规范化后的状态）：

gameConfig (规范化后含 nsfw场景类型)
  ├── mainStoryRequest → 构建运行时额外提示词(...{ ...runtimeGameConfig, 时代配置ID, 校园NSFW参数, ... })
  │                        ✅ nsfw场景类型 正确传入
  │                        ✅ 校园/Exposure/网约车/写真/酒吧 5 模块接入
  │                        ❌ BDSM/BoardGame 独立模块未接入
  │
  ├── variableModelWorkflow → 构建运行时额外提示词(...runtimeGameConfig)
  │                        ❌ 缺少 时代配置ID → 时代叙事约束永远走默认路径
  │                        ❌ 缺少 5 个子模块参数 → 子模块约束不注入
  │
  ├── openingStoryWorkflow → 构建运行时额外提示词(...openingGameConfig)
  │                        ❌ 缺少 时代配置ID
  │
  └── novelDecompositionRuntime → 构建运行时额外提示词(...gameSettings)
                             ❌ 缺少 时代配置ID
                             ❌ 缺少子模块参数
```

---

## 问题清单

### P1 — HIGH：`variableModelWorkflow` 和 `openingStoryWorkflow` 丢失时代参数

**文件**：
- `hooks/useGame/planning/variableModelWorkflow.ts:283`
- `hooks/useGame/opening/openingStoryWorkflow.ts:646`

**问题**：调用 `构建运行时额外提示词()` 时直接 spread `runtimeGameConfig` / `openingGameConfig`，但未传入 `时代配置ID`。导致 `自动选择叙事约束()` 始终走 `构建里象修行叙事约束`（武侠框架），在都市/校园时代下会注入错误的武侠术语提示词。

**影响范围**：变量生成阶段、开局故事阶段的 NSFW 提示词可能与时代表不匹配。

### P2 — HIGH：`variableModelWorkflow` / `openingStoryWorkflow` 未接入子模块参数

**问题**：与 `mainStoryRequest.ts` 不同，这两个调用点未传入 `校园NSFW参数`、`ExposureNSFW参数`、`都市网约车NSFW参数`、`写真NSFW参数`、`酒吧NSFW参数`。

### P3 — HIGH：BDSM/BoardGame 独立模块未接入运行时提示词管线

**文件**：`prompts/runtime/nsfw.ts` — `构建运行时NSFW提示词` 函数

**问题**：5 个子模块（校园/Exposure/网约车/写真/酒吧）已通过 `构建运行时NSFW提示词` 的 options 参数注入到 runtime extra prompt 中。但 BDSM（独立于校园纪元的版本）和 BoardGame（跨时代桌游 NSFW）未接入此管线。

**现状**：这两个模块的叙事约束仅通过 `systemPromptBuilder.ts` 的条件注入，不在 `构建运行时NSFW提示词` 的统一参数化管线中。

### P4 — MEDIUM：`npcContext/` 目录与 `npc/npcContext.ts` 重复

**文件**：
- `hooks/useGame/npcContext/contextBuilder.ts` (626 行)
- `hooks/useGame/npcContext/imageDataExtraction.ts`
- `hooks/useGame/npc/npcContext.ts` (834 行，包含全部函数)

**问题**：两个文件都导出 `构建NPC上下文`、`提取NPC生图基础数据`、`提取主角生图基础数据`、`提取NPC香闺秘档部位生图数据`。`npc/npcContext.ts` 是更完整的版本，但 `useGame.ts` 仍从旧的 `npcContext/index.ts` 导入。

### P5 — MEDIUM：天赋/背景的 `nsfw: boolean` 与气运的 `nsfw等级` 两套过滤标准

**问题**：天赋/背景使用 `nsfw: boolean`，气运使用 `nsfw等级: 0|1|2`。两者过滤逻辑不一致，新增内容时需同时维护两套标准。

### P6 — LOW：NSFW 角色卡片仅过滤女性 NPC

**文件**：`prompts/runtime/nsfwCard.ts`

**代码**：`npcs.filter(npc => npc.是否在场 !== false && npc.性别 === '女')`

**说明**：可能是有意设计（异性恋男主向），但应添加注释说明意图，或改为可配置。

### P7 — LOW：`intimacy/index.ts` 中部分函数为死代码

**文件**：`prompts/intimacy/index.ts`

**问题**：`是否加载亲密提示词` 函数未被任何文件引用。可能是早期架构遗留。

### P8 — LOW：默认 NSFW 提示词已优化，但仍有微调空间

**现状**：`默认NSFW模式提示词` 已改为 "explicitness level controlled by 档位" 的中性描述（非 "extremely explicit"），但 `默认文生图NSFW模式提示词` 仍有冗余。

### P9 — LOW：`npcContext/` 与 `npc/npcContext.ts` 的导入路径不统一

**现状**：`useGame.ts` 从 `./useGame/npcContext` 导入，`systemPromptBuilder.ts` 从 `./npc/npcContext` 导入。统一路径可减少混淆。

---

## 实施方案

### Phase 1：修复时代参数传递链路 🔧

**目标**：让所有调用点正确传入 `时代配置ID`。

**修改文件**：
1. `hooks/useGame/planning/variableModelWorkflow.ts`
2. `hooks/useGame/opening/openingStoryWorkflow.ts`
3. `services/novel-decomposition/novelDecompositionRuntime.ts`

**改动**：在 `构建运行时额外提示词()` 调用中添加 `时代配置ID: params.时代配置ID`（或等价字段）。

**风险**：低。`时代配置ID` 在 params/options 中通常已存在，只需确保传递。

**验收**：
- [ ] 3 个文件修改后 `tsc --noEmit` 通过
- [ ] 都市时代下变量生成流程的 NSFW 提示词使用现代情感约束

---

### Phase 2：补齐子模块参数传递 🔧

**目标**：让 `variableModelWorkflow` 和 `openingStoryWorkflow` 也能注入子模块 NSFW 约束。

**修改文件**：
1. `hooks/useGame/planning/variableModelWorkflow.ts`
2. `hooks/useGame/opening/openingStoryWorkflow.ts`

**改动**：参考 `mainStoryRequest.ts` 的调用方式，添加子模块参数的提取和传递。

**风险**：中。需从游戏状态中提取对应子模块数据，需了解各模块数据在 state 中的位置。

**验收**：
- [ ] 校园时代开启校园 NSFW 后，变量生成阶段也能注入校园约束
- [ ] 编译通过

---

### Phase 3：BDSM/BoardGame 接入运行时提示词管线 🔧

**目标**：将 BDSM 和 BoardGame 独立模块的叙事约束接入 `构建运行时NSFW提示词` 函数。

**修改文件**：
1. `prompts/runtime/nsfw.ts` — 在 `构建运行时NSFW提示词` 中添加 BDSM/BoardGame 选项
2. `hooks/useGame/mainStoryRequest.ts` — 在调用处传递 BDSM/BoardGame 参数

**改动**：
- 为 `构建运行时NSFW提示词` 的 options 添加 `BDSMNSFW参数` 和 `BoardGameNSFW参数`
- 在函数体中按时代条件注入对应的叙事约束
- 在 `mainStoryRequest.ts` 中提取相关状态并传递

**风险**：中。需理解 BDSM 和 BoardGame 模块的叙事约束接口。

**验收**：
- [ ] BDSM 模块开启后，运行时 extra prompt 中包含 BDSM 叙事约束
- [ ] BoardGame 桌游 NSFW 场景触发时，runtime prompt 包含对应约束
- [ ] 编译通过

---

### Phase 4：统一 `npcContext` 导入路径 🧹

**目标**：消除 `npcContext/` 与 `npc/npcContext.ts` 的重复导入混乱。

**修改文件**：
1. `hooks/useGame.ts` — 将 `./useGame/npcContext` 改为 `./npc/npcContext`
2. `hooks/useGame/useSceneImageArchive.ts` — 将 `./npcContext` 改为 `./npc/npcContext` 或单独提取

**注意**：
- 确认 `npc/npcContext.ts` 包含了 `imageDataExtraction.ts` 的所有导出函数
- 确认 `提取NPC香闺秘档部位生图数据` 在两文件中实现一致
- 修改后考虑标记或移除 `npcContext/index.ts` 和 `npcContext/contextBuilder.ts`

**风险**：低。函数签名相同，仅改导入路径。

**验收**：
- [ ] `tsc --noEmit` 通过
- [ ] 所有从 `npcContext/` 导入的点改为 `npc/npcContext`
- [ ] 可选项：删除 `npcContext/` 目录（需确认无其他引用）

---

### Phase 5：清理死代码和冗余 🧹

**目标**：移除确认未被使用的代码。

**改动**：
1. 移除或标注 `prompts/intimacy/index.ts` 中未引用的函数
2. 确认 `npcContext/` 目录是否可以完全删除（Phase 4 完成后）
3. 检查 `prompts/intimacy/index.ts` 中 `是否加载亲密提示词` 是否真的死代码

**风险**：低。需二次确认无引用后再删除。

**验收**：
- [ ] 删除后 `tsc --noEmit` 通过
- [ ] 无运行时报错

---

### Phase 6：NSFW 角色卡片性别过滤可配置 ⚙️

**目标**：让 NPC 卡片的性别过滤不再写死为女性。

**修改文件**：`prompts/runtime/nsfwCard.ts`

**改动**：添加配置参数 `允许性别`，默认为 `['女']`（保持向后兼容），可在游戏设置中扩展。

**风险**：低。默认行为不变。

**验收**：
- [ ] 默认行为与修改前一致
- [ ] 可通过设置扩展为 ['男', '女'] 等

---

## 不在本次范围

| 项目 | 原因 |
|------|------|
| 天赋/背景 `nsfw` 布尔升级为 `nsfw等级` | 涉及数据迁移，需独立计划 |
| 新增 NSFW 子模块 | 功能开发，非优化 |
| 前端 UI 优化 | 需 separate 计划 |
| NSFW 测试覆盖 | 项目尚无测试框架，需先配置 |

---

## 依赖关系

```
Phase 1 ← Phase 2 ← Phase 3（按顺序，后序依赖前序的改动模式）
Phase 4 → Phase 5（先统一路径，再清理）
Phase 6（独立，可与任何 Phase 并行）
```

---

## 风险评估

| 风险 | 级别 | 缓解措施 |
|------|------|----------|
| 时代参数在部分调用点不存在 | 中 | 检查各调用点的 params 结构，确保字段可用 |
| BDSM/BoardGame 接口与现有 5 模块不一致 | 中 | 先读对应 prompt 文件确认接口，必要时做适配层 |
| npcContext 合并后破坏生图功能 | 低 | 函数签名已确认一致，改动前备份 |
| 死代码清理误删 | 低 | 用 grep 三重确认后再删 |

---

## 实施步骤

- [ ] Phase 1: 修复时代参数传递链路
  - [ ] variableModelWorkflow.ts 添加时代配置ID
  - [ ] openingStoryWorkflow.ts 添加时代配置ID
  - [ ] novelDecompositionRuntime.ts 添加时代配置ID
  - [ ] 编译验证
- [ ] Phase 2: 补齐子模块参数传递
  - [ ] variableModelWorkflow.ts 添加子模块参数
  - [ ] openingStoryWorkflow.ts 添加子模块参数
  - [ ] 编译验证
- [ ] Phase 3: BDSM/BoardGame 接入运行时提示词
  - [ ] nsfw.ts 添加 BDSM/BoardGame 选项和注入逻辑
  - [ ] mainStoryRequest.ts 传递对应参数
  - [ ] 编译验证
- [ ] Phase 4: 统一 npcContext 导入路径
  - [ ] useGame.ts 改导入
  - [ ] useSceneImageArchive.ts 改导入
  - [ ] 编译验证
  - [ ] 可选：删除 npcContext/ 目录
- [ ] Phase 5: 清理死代码
  - [ ] 确认 intimacy/index.ts 死代码
  - [ ] 确认 npcContext/ 可删除后删除
  - [ ] 编译验证
- [ ] Phase 6: NSFW 角色卡片性别过滤可配置
  - [ ] 添加性别配置参数
  - [ ] 编译验证
