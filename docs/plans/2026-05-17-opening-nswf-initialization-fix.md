# 修复计划：开场 NPC NSFW 字段缺失

## 背景与目标

**问题：** 开启 NSFW 模式后，新游戏开场（第0回合）的正文中没有出现 NPC 的衣着、敏感点、性癖等 NSFW 初始化信息。

**根因（已确认）：**

1. **数据流断裂：** `openingStoryWorkflow.ts` 调用 `构建系统提示词` 时传入 5 个位置参数，但函数签名期望 7 个参数（解构对象）。第 5 个参数错误地传入了 options 对象而非 `gameConfig`，导致 `启用NSFW模式` 回退为 `false`，整个 NSFW 注入管线被跳过。
2. **缺少 NSFW 叙事指引：** 即使数据流修复，开场提示词（`prompts/runtime/opening.ts`）和 CoT（`prompts/core/cotOpening.ts`）也没有指示 AI 在正文中描写 NPC 外观/NSFW 细节。

**目标：**
- 修复 `gameConfig` 和 `eraId` 的参数传递，使 NSFW 数据正确注入系统提示词。
- 在开场叙事提示词和 CoT 中添加条件性 NSFW 描写指引。

## 涉及文件

| 文件 | 变更类型 | 说明 |
|------|----------|------|
| `hooks/useGame/opening/openingStoryWorkflow.ts` | Bug 修复 | 修正 `构建系统提示词` 调用签名，补充 NSFW 叙事指引 |
| `hooks/useGame/sendWorkflow/index.ts` | Bug 修复 | 修正 `构建系统提示词` 调用签名 |
| `hooks/useGame/domains/workflowDomain.ts` | Bug 修复 | 更新包装器函数签名以匹配新的对象调用方式 |
| `hooks/useGame/ui/contextSnapshot.ts` | Bug 修复 | 更新 `构建系统提示词` 类型与调用方式 |
| `prompts/core/cotOpening.ts` | 功能补充 | 在 Step5 添加 NSFW 感知指引 |

## 技术方案

### 变更 1：修正 `构建系统提示词` 调用

**当前调用（约 536-556 行）：** 第 5 个参数是 options 对象
**修正后：** 第 5 个参数改为 `openingGameConfig`，第 6 个参数改为 `deps.memoryConfig`，第 7 个参数为原 options 对象并补充 `eraId: options?.eraId`

### 变更 2：注入 NSFW 开场外观描写要求

在 `openingStoryWorkflow.ts` 中，当 `openingGameConfig.启用NSFW模式 === true` 时，向开场系统提示词追加一段 NSFW 描写指引，要求 AI 在正文中自然融入 NPC 的衣着风格、外貌特征、敏感点暗示等。

### 变更 3：在开场 CoT Step5 添加 NSFW 感知

在 `prompts/core/cotOpening.ts` 的 Step5 区域增加一行指引：若上下文提供 NSFW 字段，将其纳入 NPC 外观与行为分析中。

## 实施步骤

- [x] 步骤 1：修正 `构建系统提示词` 调用参数（openingStoryWorkflow.ts）
- [x] 步骤 2：在开场提示词组装中注入 NSFW 叙事指引（openingStoryWorkflow.ts）
- [x] 步骤 3：在开场 CoT 中添加 NSFW 观察指引（cotOpening.ts）
- [x] 步骤 4：同步修复 sendWorkflow/index.ts 的调用方式
- [x] 步骤 5：同步修复 workflowDomain.ts 的包装器签名
- [x] 步骤 6：同步修复 contextSnapshot.ts 的类型与调用
- [ ] 步骤 7：验证——启动新游戏，NSFW 模式下开场应包含 NPC 外观/NSFW 描写

## 风险评估

| 风险 | 可能性 | 影响 | 缓解措施 |
|------|--------|------|----------|
| 参数顺序错误导致开场流程崩溃 | ~~中~~ 已修复 | ~~高~~ | 已统一改为对象调用 |
| deps.memoryConfig 为 undefined | ~~低~~ 已修复 | ~~高~~ | 各调用方使用各自作用域内的 memoryConfig |
| NSFW 指引泄漏到 SFW 游戏 | 低 | 中 | 严格门控 `openingGameConfig.启用NSFW模式 === true` |
| 其他调用方遗漏 | ~~中~~ 已修复 | ~~高~~ | 已排查全部 3 个调用点 + 1 个包装器 + 1 个类型定义 |
