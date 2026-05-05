# 网约车司机 NSFW 深化计划 — 触发条件分析

> 日期: 2026-05-05
> 关联计划: `docs/plans/2026-05-05_urban-driver-nsfw-enhancement.md`

## Context

分析 `docs/plans/2026-05-05_urban-driver-nsfw-enhancement.md` 中制定的都市网约车司机 NSFW 系统在**运行时会通过什么条件触发**。基于现有校园 NSFW 系统的注入链路进行推断。

> **当前状态**: 该计划文档的所有 Phase 均标记为 `[x]`，但实际代码文件（`models/urbanDriverNSFW/`、`urbanDriverNSFWEngine.ts` 等）**尚未创建**。以下分析的是计划中设计的触发条件。

---

## 触发条件链路

网约车司机 NSFW 系统需要**同时满足以下 6 个层级**的条件才会激活：

### 层级 1：总开关（Settings Gate）

**条件**: `gameConfig.启用NSFW模式 === true`

**位置**: `prompts/runtime/nsfw.ts` 第 195-199 行

```typescript
const nsfwEnabled = options?.启用NSFW模式 === true;
if (!nsfwEnabled) {
    return custom;  // 直接返回，不注入任何 NSFW 约束
}
```

这是**所有 NSFW 系统的第一道门**。不开启则后续全部跳过。

---

### 层级 2：子系统开关（Subsystem Gate）

**条件**: `gameConfig.都市网约车NSFW设置?.启用都市网约车NSFW系统 === true`

**位置**: 计划文档 `models/urbanDriverNSFW/index.ts`（待创建）

这是网约车专属的子开关，独立于校园 NSFW 开关。计划中 `默认都市网约车NSFW设置` 的默认值为 `false`，意味着即使总开关打开，子系统也需要手动启用。

---

### 层级 3：时代门（Era Gate）

**条件**: `时代配置ID === 'contemporary_urban'`

**位置**: 计划文档第 223 行明确定义：
> 注入逻辑：当 `时代配置ID === 'contemporary_urban'` 且玩家职业为网约车司机时，注入都市网约车 NSFW 约束。

**注意**: 现有的校园 NSFW 注入条件使用的是 `MODERN_ERA_IDS.includes(时代配置ID)`，会匹配所有现代时代（包括 `contemporary_campus`、`contemporary_urban` 等 10 个）。而网约车司机 NSFW 需要**更严格的精确匹配**，只限 `contemporary_urban`。

`contemporary_urban` 属于 `MODERN_ERA_IDS`（定义在 `models/eraTheme/assembly.ts`），因此也满足现代时代判定。

---

### 层级 4：职业门（Occupation Gate）

**条件**: 玩家角色背景为以下之一：

| 背景名称 | 文件 | NSFW 等级 |
|---|---|---|
| `网约车司机` | `data/backgrounds/modern.ts` | SFW |
| `网约车夜司机` | `data/backgrounds/nsfw.ts` | 2 |
| `代驾司机` | `data/backgrounds/modern.ts` | SFW |
| `网约车队长` | `data/backgrounds/modern.ts` | SFW |

计划文档第 223 行：
> 且玩家**职业为网约车司机**时

实际代码中职业 = 角色背景（`state.角色.背景名称`）。需要扩展判定逻辑来识别这 4 种司机相关背景。

---

### 层级 5：数据存在门（Data Existence Gate）

**条件**: 网约车 NSFW 引擎中存在有效的乘客欲望档案和行程上下文

类比校园 NSFW 的 `构建校园NSFW参数()`（`sendWorkflow/index.ts` 第 148-198 行），网约车需要类似的参数构建函数：

1. 存在 `state.都市网约车系统?.乘客欲望档案`（至少一个 NPC 有档案）
2. 存在当前行程上下文（地点、时间、NSFW 类型判定结果）
3. 如果所有档案为空/未初始化 → 返回 `undefined` → 不注入约束

---

### 层级 6：场景子开关（Sub-scenario Gates）

**条件**: 具体场景类型需要各自的子开关开启

| 场景 | 触发条件 | 对应开关 |
|---|---|---|
| 醉酒搭车 | NPC 醉酒状态 ≠ '清醒' | `启用醉酒乘客场景` |
| 饮料下药 | NPC 药物状态 ≠ undefined | `启用饮料下药场景` |
| 深夜独处 | 时间 ∈ 深夜 + 单乘客 | `启用深夜独处场景` |
| 后座暗示 | 乘客行为判定 | `启用后座暗示场景` |
| 停车场秘密 | 到达目的地后未离开 | `启用停车场秘密场景` |
| 拼车暧昧 | 多乘客同乘 | `启用拼车暧昧场景` |
| 常客关系 | 固定乘客渐进关系 | `启用常客关系系统` |
| 行车记录仪 | 记录仪状态 = '录制中' | `启用行车记录仪系统` |

---

## 完整注入链路图

```
用户发送消息
  │
  ├─ sendWorkflow/index.ts
  │    │
  │    ├─ 构建都市网约车NSFW参数(state)  ← 新建函数
  │    │    │
  │    │    ├─ 检查 时代配置ID === 'contemporary_urban'  ✓?
  │    │    ├─ 检查 角色背景 ∈ 司机背景列表  ✓?
  │    │    ├─ 检查 都市网约车NSFW设置.启用 === true  ✓?
  │    │    ├─ 检查 乘客欲望档案存在  ✓?
  │    │    └─ 返回 都市网约车NSFW参数 | undefined
  │    │
  │    └─ 传入 构建主剧情请求参数()
  │
  ├─ mainStoryRequest.ts
  │    └─ 传入 构建运行时额外提示词(..., { 都市网约车NSFW参数: ... })
  │
  └─ prompts/runtime/nsfw.ts
       └─ 构建运行时NSFW提示词()
            │
            ├─ 启用NSFW模式 === true?  ← 层级 1
            │   └─ NO → 返回原始提示词
            │   └─ YES ↓
            ├─ 自动选择叙事约束()  ← 时代叙事框架
            │
            └─ 都市网约车NSFW参数存在?  ← 层级 2-5
                └─ YES → 注入 构建都市网约车叙事约束()  ← 层级 6 子场景判定
                └─ NO → 跳过
```

---

## 与校园 NSFW 的对比

| 维度 | 校园 NSFW | 网约车司机 NSFW |
|---|---|---|
| 时代要求 | `MODERN_ERA_IDS` (10 个时代) | 精确匹配 `contemporary_urban` |
| 职业要求 | 无（所有角色可用） | 必须为司机相关背景 |
| 数据依赖 | `校园系统.欲望系统.NPC欲望档案` | `都市网约车系统.乘客欲望档案` |
| 默认开关 | `启用校园NSFW深化系统: false` | `启用都市网约车NSFW系统: false` |
| 注入时机 | 每次发送消息 | 每次发送消息 |
| 子场景数量 | 欲望+露出+SM+校园祭+桌游 | 8 种行程类型 + 12 种后果 |

---

## 需要新增的代码注入点

基于现有架构，网约车 NSFW 需要在以下位置增加注入逻辑：

1. **`hooks/useGame/sendWorkflow/index.ts`**: 新增 `构建都市网约车NSFW参数(state)` 函数，在 `构建主剧情请求参数()` 调用时传入
2. **`hooks/useGame/mainStoryRequest.ts`**: 在 `构建运行时额外提示词()` 调用时增加 `都市网约车NSFW参数` 传递
3. **`prompts/runtime/nsfw.ts`**: 扩展 `构建运行时NSFW提示词()` 的参数类型和注入逻辑，增加网约车分支

---

## 总结

网约车司机 NSFW 系统的**最小触发条件组合**为：

```
启用NSFW模式 = true
AND 启用都市网约车NSFW系统 = true
AND 时代配置ID = 'contemporary_urban'
AND 角色背景 ∈ ['网约车司机', '网约车夜司机', '代驾司机', '网约车队长']
AND 存在至少一个有效的乘客欲望档案
```

任一条件不满足 → 系统不激活，AI 不会收到网约车 NSFW 约束提示词。
