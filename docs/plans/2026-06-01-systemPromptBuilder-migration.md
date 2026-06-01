# systemPromptBuilder.ts 迁移方案

> 创建时间: 2026-06-01
> 状态: 步骤 1-2 已完成，步骤 3-4 待实施
> 目标: 消除 systemPromptBuilder.ts 中的 17 个静态 prompts import，改为按需加载

---

## 一、现状分析

### 1.1 文件概况

- **文件**: `hooks/useGame/systemPromptBuilder.ts`
- **大小**: 1844 行
- **静态 import**: 17 个 prompts 模块
- **调用方式**: 同步 `构建系统提示词()` — 每轮 AI 请求都调用
- **不能改为异步**: 核心同步函数，改为 `async` 会影响整个调用链

### 1.2 静态导入分类

#### 始终使用（核心层，保留同步 import）

| 导入 | 使用次数 | 说明 |
|------|----------|------|
| `核心_境界体系` | ~3 | 始终使用 |
| `构建AI角色声明提示词` | 1 | 始终使用 |
| `构建同人运行时提示词包, 应用境界体系区块替换` | 2 | 同人模式 |
| `构建女主剧情规划协议` + `构建女主规划专项提示词` | 2 | 女主规划 |
| `构建主剧情难度摘要提示词` | 1 | 难度摘要 |
| `构建时代主题注入, 构建时代文风注入` | 2 | 始终有时代 |
| `获取时代现实提示词ByEraId` | 1 | 时代现实 |
| `构建子纪元里模式注入` 等 4 个 | 5 | 里模式 |
| `获取输出协议提示词, 获取行动选项提示词` | 2 | 协议 |
| `构建字数要求提示词, 构建免责声明输出要求提示词` | 2 | 字数要求 |
| `构建在场NPC_NSWF卡片组` | 1 | NSFW 卡片 |

#### 条件使用（预加载层，通过独立文件组织）

| 导入 | 使用次数 | 条件 |
|------|----------|------|
| `构建里武侠世界提示词` | 1 | `启用里武侠模式 === true` |
| `构建里志怪世界提示词` | 1 | `启用里志怪模式 === true` |
| `构建志怪世界提示词` | 1 | 古代体系选择为志怪/双修 |
| `构建行动选项运行时指令` | 1 | `启用行动选项` |
| `构建校规注入提示词, 构建催眠注入提示词` | 2 | 校园系统有校规/催眠数据 |
| `构建设备通讯摘要` | 1 | 有设备消息 |
| `构建BDSM论坛叙事约束` | 1 | 校园系统有 BDSM 帖子 |
| `构建桌游NSFW完整叙事约束` | 1 | 有桌游系统 |

---

## 二、实施方案

**核心原则：保持同步 API，不改变 `构建系统提示词()` 的签名和调用方式。**

### 步骤 1: 创建 promptBuilders.ts 预加载层

将 8 个条件使用的模块抽离到独立文件，保持同步 import。

### 步骤 2: 更新 systemPromptBuilder.ts

将 17 个 import 精简到 10 个（核心层保留）+ 1 个 `promptBuilders.ts` 预加载层。

### 步骤 3: 时代/里模式提示词对接 PromptRegistry

时代模块加载时通过 `promptBlock` 注册提示词，`systemPromptBuilder` 保留同步 import 作为主路径，PromptRegistry 作为备份。

### 步骤 4: Vite 构建优化

将 prompts 中未被 systemPromptBuilder 使用的部分拆分为独立 chunk。

---

## 三、详细实施

### 步骤 1: 创建 `hooks/useGame/systemPromptBuilder/promptBuilders.ts`

```typescript
/**
 * 条件使用的提示词模块预加载层
 *
 * 这些模块仅在特定游戏配置下使用。
 * 通过独立文件组织，便于后续按需拆分。
 */

// 里模式
export { 构建里武侠世界提示词 } from '../../prompts/runtime/liWuxiaWorld';
export { 构建里志怪世界提示词 } from '../../prompts/runtime/liZhiguaiWorld';
export { 构建志怪世界提示词 } from '../../prompts/runtime/zhiguaiWorld';

// 行动选项
export { 构建行动选项运行时指令 } from '../../prompts/runtime/actionOptionsRuntime';

// 校园系统
export { 构建校规注入提示词, 构建催眠注入提示词 } from '../campusPromptInjector';

// 设备
export { 构建设备通讯摘要 } from '../device/triggerDeviceMessageWorkflow';

// NSFW 条件提示词
export { 构建BDSM论坛叙事约束 } from '../../prompts/runtime/bdsmForum';
export { 构建桌游NSFW完整叙事约束 } from '../../prompts/runtime/boardGameNSFW';
```

### 步骤 2: 精简 systemPromptBuilder.ts import

**旧**（17 个独立 import 行）→ **新**（10 个核心 + 1 个预加载层）

### 步骤 3: Vite 构建优化

```typescript
// vite.config.ts manualChunks 新增：
// 分离条件使用的 prompts 为独立 chunk
if (
  normalizedId.includes('/prompts/runtime/liWuxiaWorld') ||
  normalizedId.includes('/prompts/runtime/liZhiguaiWorld') ||
  normalizedId.includes('/prompts/runtime/zhiguaiWorld') ||
  normalizedId.includes('/prompts/runtime/actionOptionsRuntime') ||
  normalizedId.includes('/prompts/runtime/bdsmForum') ||
  normalizedId.includes('/prompts/runtime/boardGameNSFW')
) {
  return 'prompts-conditional';
}
```

---

## 四、实施优先级

| 步骤 | 难度 | 收益 | 建议 |
|------|------|------|------|
| 步骤 1+2: 预加载层 | 低 | 中 | **优先做** |
| 步骤 3: PromptRegistry 对接 | 中 | 高 | **第二做** |
| 步骤 4: Vite 优化 | 低 | 中 | **第三做** |

---

## 五、风险评估

| 风险 | 级别 | 应对措施 |
|------|------|----------|
| 同步 API 不能改为异步 | **高** | 保持 `构建系统提示词()` 同步，用预加载层替代 |
| 提示词丢失或顺序变化 | **中** | 预加载层保持原有 import 顺序 |
| 构建失败 | **低** | 逐步迁移，每步验证 |
