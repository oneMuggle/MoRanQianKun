# 露出系统增强优化方案

**日期**: 2026-05-18
**状态**: 已实施（Phase 1-7 引擎层+UI 全部完成）
**优先级**: P1 — 核心 NSFW 子系统增强

---

## 一、现状分析

### 1.1 系统定位

露出系统是游戏中 NPC 在"公开/半公开场合暴露"的 NSFW 子系统，核心体验是 **"随时可能被发现"的紧张感**。系统包含四个模块：

| 模块 | 功能 | 数据模型 |
|------|------|----------|
| **露出偏好** | 0-5 等级，记录 NPC 对暴露的接受度 | `露出状态` (types.ts) |
| **紧张度** | 0-100 动态值，反映被发现的风险感 | `紧张度状态` (types.ts) |
| **旁观者** | 周围人的察觉概率与反应 | `旁观者[]` 数组 (types.ts) |
| **网络流言** | 偷拍/论坛/群/社媒传播链 | `网络流言状态` (types.ts) |

### 1.2 涉及文件清单

**核心模型** (`models/exposureNSFW/`):
- `types.ts` — 核心类型：露出偏好等级、露出状态、旁观者、紧张度、网络流言、场景配置
- `settings.ts` — 设置接口：开关、内容强度、子系统启用
- `constants.ts` — 常量：察觉率、类型修正、反应权重
- `index.ts` — 统一导出入口

**引擎层** (`hooks/useGame/exposureNSFWEngine/`):
- `core.ts` — 核心计算：露出推进、紧张度、旁观者判定、网络传播、衰减（6 个函数）
- `factoryFunctions.ts` — 工厂函数：创建默认状态

**Prompt 层**:
- `prompts/runtime/exposureNSFW.ts` — 4 个叙事约束构建函数 + 1 个完整叙事约束构建

**模块注册**:
- `modules/contemporary/exposureNSFW/registration.ts` — StoryModule 注册，`eraId='contemporary'`，`priority=70`

**UI 层**:
- `components/features/ExposureDashboard.tsx` — 桌面端仪表盘
- `components/features/MobileExposureDashboard.tsx` — 移动端仪表盘
- `components/features/Settings/ExposureNSFWSettings.tsx` — 设置面板

**集成层**:
- `utils/moduleRegistry/legacyRegistrations.ts` — UI 功能注册
- `hooks/useGame/nsfw/nsfwSystemInitialization.ts` — 系统初始化
- `hooks/useGame/ui/contextSnapshot.ts` — 上下文快照参数提取

**关联模块** (`models/npcNSFWEnhancement/`):
- `linkage.ts` — 联动逻辑：生成 NSFW 画像
- `personalityProfiles.ts` — 人格档案匹配
- `types.ts` — NPC NSFW 画像类型

### 1.3 现有数据流

```
游戏开始
  -> nsfwSystemInitialization 为每个主要角色创建 Exposure 档案
每回合
  -> exposureNSFWEngine 计算紧张度、判定旁观者、模拟网络传播
Prompt 构建
  -> registration.ts 提取参数 -> 构建叙事约束注入 AI
AI 输出状态更新
  -> 解析并更新游戏状态
UI 展示
  -> ExposureDashboard 显示档案列表、旁观者记录
```

### 1.4 当前问题清单

| # | 问题 | 严重度 | 说明 |
|---|------|--------|------|
| 1 | 时代绑定过死 | 高 | `eraId: 'contemporary'` 仅限现代纪元，武侠/修仙等古代时代不可用 |
| 2 | 场景系统为空 | 高 | `露出场景配置` 类型已定义但无数据文件、无场景引擎 |
| 3 | 个性/偏好不联动 | 高 | 露出等级是纯数值，与 npcNSFWEnhancement 模块（人格/性癖/敏感点）完全脱节 |
| 4 | 后果系统空白 | 高 | 暴露失败只有 `暴露失败次数` 计数，无实际后果（名誉/关系/惩罚） |
| 5 | 紧张度模型简单 | 中 | 仅考虑周围人数+行为，未考虑 NPC 性格、服装状态、地点隐秘性、时间段 |
| 6 | 旁观者系统浅 | 中 | 无身份追踪、无关系影响、无长期记忆 |
| 7 | 传播渠道单一 | 中 | 仅 4 个固定渠道（论坛/群/截图/社媒），古代时代不适用 |
| 8 | 仪表盘信息不足 | 低 | 无历史记录、无趋势、无关键事件时间线 |
| 9 | 衰减公式线性 | 低 | 固定每 3 回合衰减 10 进度，无 NPC 个体差异 |
| 10 | 无成就/记忆 | 低 | 露出里程碑事件无记录、无回顾 |

---

## 二、增强方案

### Phase 1: 时代泛化与场景系统

**目标**: 打破现代纪元绑定，让露出系统适配所有时代；建立场景数据库。

#### 1.1 时代泛化

**变更文件**:

| 文件 | 变更 |
|------|------|
| `modules/contemporary/exposureNSFW/registration.ts` | 将 `eraId` 从 `'contemporary'` 改为支持多时代，或移至共享模块 |
| `prompts/runtime/exposureNSFW.ts` | 露出等级描述改为时代自适应，传播渠道改为时代自适应 |
| `models/exposureNSFW/types.ts` | `网络流言状态.传播渠道` 增加时代变体类型 |

**时代适配矩阵**:

| 时代 | 传播渠道 | 场景类型 |
|------|---------|---------|
| 武侠 | 茶馆传言、江湖传闻、门派流言 | 庭院、客房、密室、舟船 |
| 修仙 | 宗门传讯、坊市议论、玉简流传 | 洞府、灵堂、试炼秘境 |
| 志怪 | 村落闲话、庙宇传言、妖界密语 | 破庙、客栈、荒村野店 |
| 维多利亚 | 社交圈八卦、沙龙私语、报纸暗讽 | 书房、花园温室、舞会露台 |
| 谍战 | 情报网流转、黑市传闻、暗码泄密 | 安全屋、审讯室、酒店走廊 |
| 校园（现有） | 匿名论坛、校园群、截图、社媒 | 教室、走廊、操场 |

#### 1.2 场景数据库

**新增文件**: `models/exposureNSFW/scenarios.ts`

```typescript
export interface 露出场景模板 {
  id: string;
  名称: string;
  适用时代: string[];
  场所类型: '半私密' | '半公开' | '公开';
  描述: string;
  隐秘度: 1 | 2 | 3 | 4 | 5;
  基础发现概率: number;
  紧张度基础值: number;
  周围人数范围: [number, number];
  适合互动: string[];
  时代变体?: Record<string, { 名称: string; 描述: string }>;
}

export const 武侠时代场景: 露出场景模板[] = [
  // 每个时代 6-10 个场景
];

export function 获取时代场景(时代Id: string): 露出场景模板[];
```

#### 1.3 场景管理器

**新增文件**: `hooks/useGame/exposureNSFWEngine/scenarioManager.ts`

```typescript
export function 选择当前场景(档案: 露出状态, 时代Id: string): 露出场景模板 | null;
export function 验证场景可行性(场景: 露出场景模板, 露出等级: number): boolean;
```

**风险评估**: 低。纯数据 + 简单查找逻辑。

---

### Phase 2: 个性联动系统

**目标**: 将露出系统与 `npcNSFWEnhancement` 模块打通，使露出倾向由人格/性癖驱动。

**变更文件**:

| 文件 | 变更 |
|------|------|
| `models/npcNSFWEnhancement/linkage.ts` | 新增 `计算露出倾向()` 函数 |
| `hooks/useGame/exposureNSFWEngine/core.ts` | 加入个性系数修正 |
| `hooks/useGame/nsfw/nsfwSystemInitialization.ts` | 初始化时基于人格自动设置基础等级 |

**新增类型** (`models/exposureNSFW/types.ts`):

```typescript
export interface 露出个性系数 {
  冒险倾向: number;      // 0-100
  羞耻敏感度: number;    // 0-100
  刺激渴望: number;      // 0-100
  从众压力: number;      // 0-100
  关系信赖: number;      // 0-100
}
```

**联动规则**:

| 来源条件 | 效果 |
|----------|------|
| 里人格.反差触发器 包含"暴露" | 露出基础等级 +1 |
| 性癖档案.核心偏好 包含"暴露窥视" | 冒险倾向 +20 |
| 性癖条目.类别 === '公共冒险' | 紧张度修正 -10 |
| 身份为"侠女/浪子"类 | 刺激渴望 +15 |
| 核心性格含"谨慎/保守" | 羞耻敏感度 +20 |

**风险评估**: 低。纯计算逻辑，不影响已有数据结构。

---

### Phase 3: 后果系统

**目标**: 暴露成功/失败都有真实的后续影响，不再只是计数器。

**新增文件**: `models/exposureNSFW/consequences.ts`

```typescript
export type 后果严重等级 = '轻微' | '中等' | '严重' | '毁灭';
export type 后果类型 =
  | '短暂尴尬'
  | '旁人窃语'
  | '流言扩散'
  | '信任危机'
  | '名誉受损'
  | '强制分离'
  | '公开曝光'
  | '社会性死亡';

export interface 露出后果记录 {
  id: string;
  后果类型: 后果类型;
  严重等级: 后果严重等级;
  描述: string;
  触发时间: string;
  持续回合: number;
  已解决: boolean;
  影响NPCId?: string;
}

export interface 名誉状态 {
  公开名誉: number;    // 0-100
  私密名誉: number;    // 0-100
  风评: string;         // 文本描述
  标签: string[];       // 如 ['风流', '放荡', '神秘']
  黑历史: { 事件: string; 时间: string; 影响: string }[];
}
```

**新增文件**: `hooks/useGame/exposureNSFWEngine/consequenceEngine.ts`

```typescript
export function 判定露出后果(
  露出结果: '成功' | '失败',
  当前等级: number,
  紧张度: number,
  旁观者: 旁观者[],
  名誉: 名誉状态
): 露出后果记录[];

export function 应用后果衰减(后果: 露出后果记录, 经过回合: number): 露出后果记录;
export function 更新名誉状态(名誉: 名誉状态, 后果: 露出后果记录[]): 名誉状态;
```

**后果矩阵**:

| 严重等级 | 后果类型 | 效果 | 持续回合 |
|----------|---------|------|---------|
| 轻微 | 短暂尴尬 | 紧张度 +10 | 1 |
| 轻微 | 旁人窃语 | 网络流言 +1 | 5 |
| 中等 | 流言扩散 | 网络流言 +2 | 10 |
| 中等 | 信任危机 | 关系轨道 -5% | 直到修复 |
| 严重 | 名誉受损 | 公开名誉 -15 | 20 |
| 严重 | 强制分离 | NPC 远离玩家 | 15 |
| 毁灭 | 公开曝光 | 关系重构 | 永久 |
| 毁灭 | 社会性死亡 | 关系断裂 | 需要大事件修复 |

**风险评估**: 高。prompt 注入可能变长，需仅注入活跃后果，历史记录摘要化。

---

### Phase 4: 旁观者系统深化

**目标**: 旁观者有身份、有关系、有记忆。

**变更文件**:

| 文件 | 变更 |
|------|------|
| `models/exposureNSFW/types.ts` | `旁观者` 增加 `关联NPCId`、`关系亲密度` 字段 |
| `hooks/useGame/exposureNSFWEngine/core.ts` | 反应判定加入关系修正 |

**新增类型** (`models/exposureNSFW/types.ts`):

```typescript
export interface 旁观者记忆 {
  旁观者Id: string;
  事件: string;
  时间: string;
  反应: 旁观者反应;
  是否有证据: boolean;
  后续影响: string;
  已解决: boolean;
}
```

**关系修正逻辑**:

| 旁观者类型 | 反应倾向修正 |
|-----------|-------------|
| 密友 | "假装没看到" 权重 +20，"传播流言" 权重 -10 |
| 竞争对手 | "传播流言" 权重 +20，"直接揭穿" 权重 +10 |
| 权威人物 | "直接揭穿" 权重 +25 |
| 陌生人 | "偷拍记录" 权重 +15 |
| 熟人 | "暗示嘲弄" 权重 +15 |

**风险评估**: 低。纯逻辑增强，数据结构向后兼容。

---

### Phase 5: 紧张度模型升级

**目标**: 从 2 因子模型升级为多因子模型。

**变更文件**:

| 文件 | 变更 |
|------|------|
| `hooks/useGame/exposureNSFWEngine/core.ts` | `计算紧张度()` 增加 5 个新因子 |
| `models/exposureNSFW/types.ts` | 新增 `紧张度阶段` 类型 |

**新增因子**:

| 因子 | 修正范围 | 说明 |
|------|---------|------|
| 服装状态 | +/-20 | 暴露度越高，紧张度越高 |
| 地点隐秘性 | +/-25 | 来自场景数据库的 `隐秘度` |
| NPC 性格 | +/-15 | 外向/内向修正 |
| 时间段 | +/-10 | 白天高、夜晚低 |
| 声音环境 | +/-10 | 安静环境更易暴露 |
| 过往经历 | -5*次数 | 经验丰富者更从容 |

**新增类型**:

```typescript
export type 紧张度阶段 = '安全' | '微险' | '危险' | '极限' | '崩溃';

export function 获取紧张度阶段(紧张度: number): 紧张度阶段;
// 安全: 0-25, 微险: 26-50, 危险: 51-75, 极限: 76-90, 崩溃: 91-100
```

**风险评估**: 中。核心计算函数变更，需仔细验证不破坏现有逻辑。

---

### Phase 6: UI 仪表盘升级

**目标**: 仪表盘从"数值展示"升级为"叙事面板"。

**变更文件**:

| 文件 | 变更 |
|------|------|
| `components/features/ExposureDashboard.tsx` | 全面增强 |
| `components/features/MobileExposureDashboard.tsx` | 同步增强 |

**新增 UI 组件**:

| 组件 | 功能 |
|------|------|
| 名誉卡片 | 显示公开/私密名誉条、风评文本、标签 |
| 后果时间线 | 活跃后果列表，带剩余回合倒计时 |
| 紧张度阶段指示器 | 彩色标签显示当前紧张度阶段 |
| 个性分析面板 | 显示露出个性系数 5 维值 |
| 场景推荐 | 根据当前露出等级推荐可解锁场景 |
| 事件日志 | 最近 10 条露出事件记录 |
| 趋势指示器 | 等级进度趋势（上升/持平/下降） |

**风险评估**: 中。UI 变更量大，分阶段独立验证。

---

### Phase 7: 成就与记忆系统

**目标**: 记录露出里程碑，提供回顾价值。

**新增文件**:

- `models/exposureNSFW/achievements.ts` — 成就定义与达成检测
- `models/exposureNSFW/memories.ts` — 精彩事件回忆录

**成就示例**:

| 成就 | 条件 |
|------|------|
| "初出茅庐" | 第一次成功露出 |
| "走廊常客" | 在走廊场景成功 5 次 |
| "万众瞩目" | 紧张度 > 90 仍成功露出 |
| "流言终结者" | 成功辟谣 3 次 |
| "无所畏惧" | 露出等级达到 5 |

**风险评估**: 低。纯追加功能，不影响核心逻辑。

---

## 三、实施步骤

### Phase 1: 时代泛化与场景系统（3-4h）

- [x] 1.1 `models/exposureNSFW/scenarios.ts` — 场景数据库，每个时代 6-10 个场景
- [x] 1.2 `modules/contemporary/exposureNSFW/registration.ts` — 改为多时代支持，或移至共享模块
- [x] 1.3 `prompts/runtime/exposureNSFW.ts` — 露出等级描述、传播渠道改为时代自适应
- [x] 1.4 `hooks/useGame/exposureNSFWEngine/scenarioManager.ts` — 场景选择/验证/切换逻辑

### Phase 2: 个性联动系统（2-3h）

- [x] 2.1 `models/npcNSFWEnhancement/linkage.ts` — 新增 `计算露出倾向()` 函数
- [x] 2.2 `hooks/useGame/exposureNSFWEngine/core.ts` — `计算露出偏好推进()` 加入个性系数修正
- [x] 2.3 `hooks/useGame/nsfw/nsfwSystemInitialization.ts` — 初始化时基于人格自动设置基础等级

### Phase 3: 后果系统（4-5h）

- [x] 3.1 `models/exposureNSFW/consequences.ts` — 后果类型与名誉状态定义（在 types.ts 中）
- [x] 3.2 `models/exposureNSFW/types.ts` — `露出状态` 增加 `名誉`、`活跃后果` 字段
- [x] 3.3 `hooks/useGame/exposureNSFWEngine/consequenceEngine.ts` — 后果引擎
- [x] 3.4 `hooks/useGame/exposureNSFWEngine/core.ts` — 引擎集成后果判定
- [x] 3.5 `prompts/runtime/exposureNSFW.ts` — 新增 `构建后果叙事约束()` 函数

### Phase 4: 旁观者系统深化（1-2h）

- [x] 4.1 `models/exposureNSFW/types.ts` — `旁观者` 增加 `关联NPCId`、`关系亲密度`，新增 `旁观者记忆` 类型
- [x] 4.2 `models/exposureNSFW/constants.ts` — 反应权重按旁观者类型动态调整
- [x] 4.3 `hooks/useGame/exposureNSFWEngine/core.ts` — `模拟旁观者反应()` 加入关系修正

### Phase 5: 紧张度模型升级（2-3h）

- [x] 5.1 `models/exposureNSFW/types.ts` — 新增 `紧张度阶段` 类型
- [x] 5.2 `hooks/useGame/exposureNSFWEngine/core.ts` — `计算紧张度()` 增加多因子计算，返回 `{ 紧张度, 阶段 }`
- [ ] 5.3 `prompts/runtime/exposureNSFW.ts` — 紧张度叙事约束增加阶段描述

### Phase 6: UI 仪表盘升级（4-6h）

- [x] 6.1 `components/features/ExposureDashboard.tsx` — 新增名誉卡片、后果时间线、紧张度阶段、个性分析、成就展示、记忆统计
- [x] 6.2 `components/features/MobileExposureDashboard.tsx` — 同步增强

### Phase 7: 成就与记忆系统（2-3h）

- [x] 7.1 `models/exposureNSFW/achievements.ts` — 成就定义与达成检测
- [x] 7.2 `models/exposureNSFW/memories.ts` — 回忆录系统
- [x] 7.3 `hooks/useGame/exposureNSFWEngine/achievementEngine.ts` — 成就引擎
- [x] 7.4 `hooks/useGame/exposureNSFWEngine/memoryEngine.ts` — 记忆引擎
- [x] 7.5 `components/features/ExposureDashboard.tsx` — 集成成就和回忆展示

---

## 四、数据结构变更总览

### 新增类型

| 类型 | 所在文件 | 用途 |
|------|---------|------|
| `露出场景模板` | `types.ts` / `scenarios.ts` | 场景数据库条目 |
| `露出个性系数` | `types.ts` | 冒险倾向/羞耻敏感度/刺激渴望/从众压力/关系信赖 |
| `露出后果记录` | `consequences.ts` | 后果记录（id、类型、严重等级、描述、持续回合） |
| `后果严重等级` | `consequences.ts` | 轻微/中等/严重/毁灭 |
| `后果类型` | `consequences.ts` | 8 种后果枚举 |
| `名誉状态` | `types.ts` | 公开名誉/私密名誉/风评/标签/黑历史 |
| `旁观者记忆` | `types.ts` | 旁观者察觉事件的历史记录 |
| `紧张度阶段` | `types.ts` | 安全/微险/危险/极限/崩溃 |
| `露出成就` | `achievements.ts` | 成就定义与达成记录 |
| `露出回忆` | `memories.ts` | 精彩事件记录 |

### 修改类型

| 类型 | 新增字段 | 所在文件 |
|------|---------|---------|
| `露出状态` | `当前场景Id?: string`、`个性系数?: 露出个性系数`、`名誉?: 名誉状态`、`活跃后果?: 露出后果记录[]` | `types.ts` |
| `旁观者` | `关联NPCId?: string`、`关系亲密度?: number` | `types.ts` |

### 新增文件清单

| 文件 | 行数预估 | 用途 |
|------|---------|------|
| `models/exposureNSFW/scenarios.ts` | ~200 | 场景数据库 |
| `models/exposureNSFW/consequences.ts` | ~80 | 后果类型定义 |
| `hooks/useGame/exposureNSFWEngine/scenarioManager.ts` | ~60 | 场景管理器 |
| `hooks/useGame/exposureNSFWEngine/consequenceEngine.ts` | ~120 | 后果引擎 |
| `models/exposureNSFW/achievements.ts` | ~100 | 成就系统 |
| `models/exposureNSFW/memories.ts` | ~80 | 回忆录系统 |

### 修改文件清单

| 文件 | 变更范围 |
|------|---------|
| `models/exposureNSFW/types.ts` | 新增 6 个类型，修改 2 个类型 |
| `models/exposureNSFW/constants.ts` | 反应权重动态化 |
| `prompts/runtime/exposureNSFW.ts` | 时代自适应描述 + 后果约束 |
| `hooks/useGame/exposureNSFWEngine/core.ts` | 多函数增强 |
| `hooks/useGame/nsfw/nsfwSystemInitialization.ts` | 初始化增加个性联动 |
| `modules/contemporary/exposureNSFW/registration.ts` | 时代泛化 |
| `components/features/ExposureDashboard.tsx` | UI 全面增强 |
| `components/features/MobileExposureDashboard.tsx` | UI 同步增强 |
| `models/npcNSFWEnhancement/linkage.ts` | 新增露出倾向计算 |

---

## 五、风险评估与依赖

| 风险 | 等级 | 影响 | 应对 |
|------|------|------|------|
| 时代泛化破坏现有现代纪元功能 | 中 | 现代纪元露出系统失效 | 保留现有现代描述作为默认 fallback |
| 后果系统导致 prompt 过长 | 高 | AI 上下文窗口压力 | 仅注入活跃后果，历史记录摘要化 |
| 旁观者记忆数据量膨胀 | 中 | 存档变大 | 记忆设置上限（最多 20 条），超出自动归档 |
| UI 变更量大，调试困难 | 中 | 开发效率低 | 分阶段实施，每阶段独立验证 |
| 紧张度模型变更破坏平衡 | 中 | 游戏体验变化 | 增加调试开关，可切换新旧模型 |

**依赖关系**:

```
Phase 1 (场景+时代)  ──────> 无依赖
Phase 2 (个性联动)  ──────> 依赖 npcNSFWEnhancement 模块（已完成）
Phase 3 (后果+名誉)  ─────> 无依赖
Phase 4 (旁观者深化)  ────> 依赖 Phase 3 的后果类型
Phase 5 (紧张度升级)  ────> 依赖 Phase 1 的场景数据库（隐秘度字段）
Phase 6 (UI)  ───────────> 依赖 Phase 1-5 所有新增数据
Phase 7 (成就)  ─────────> 依赖 Phase 3 的后果系统
```

**外部依赖**: `npcNSFWEnhancement` 模块（已完成）、`nsfwCore` 模块。无外部库依赖。

---

## 六、预计复杂度

| Phase | 复杂度 | 预估时间 | 新增文件 | 修改文件 |
|-------|--------|----------|---------|---------|
| Phase 1 | 中 | 3-4h | 2 | 3 |
| Phase 2 | 中 | 2-3h | 0 | 3 |
| Phase 3 | 高 | 4-5h | 2 | 2 |
| Phase 4 | 低 | 1-2h | 0 | 3 |
| Phase 5 | 中 | 2-3h | 0 | 2 |
| Phase 6 | 高 | 4-6h | 0 | 2 |
| Phase 7 | 低 | 2-3h | 2 | 1 |
| **总计** | | **18-26h** | **6** | **16** |

---

## 七、向后兼容策略

1. **所有新字段均为可选**: 旧存档不会因缺少字段而崩溃
2. **默认值兜底**: 缺失字段使用默认常量或空值
3. **旧路径兼容**: 保持 `校园系统.欲望系统.露出状态` 和 `校园系统.Exposure系统.露出档案` 双路径读取
4. **时代检测**: 旧存档无 `eraId` 时默认使用武侠时代描述
5. **功能渐进启用**: 每个 Phase 的功能可通过 `ExposureNSFW设置` 开关独立启用/关闭
6. **紧张度模型切换**: `计算紧张度()` 内部检测参数完整性，旧参数走旧逻辑，新参数走新逻辑

---

## 八、验收标准

### Phase 1 验收
- [ ] 非现代纪元世界生成时，露出系统正常初始化
- [ ] 场景数据库每个时代至少 6 个场景
- [ ] prompt 中的传播渠道描述与时代匹配

### Phase 2 验收
- [ ] 新 NPC 初始化时露出个性系数非零（基于人格）
- [ ] 人格含"暴露"相关触发器的 NPC 基础露出等级 >= 1

### Phase 3 验收
- [ ] 暴露失败后产生至少 1 条后果记录
- [ ] 名誉状态随后果动态变化
- [ ] prompt 中注入活跃后果描述

### Phase 4 验收
- [ ] 密友旁观者"假装没看到"概率高于陌生人
- [ ] 旁观者记忆可查询

### Phase 5 验收
- [ ] 紧张度受至少 5 个因子影响
- [ ] 紧张度阶段标签正确显示

### Phase 6 验收
- [ ] 仪表盘显示名誉、后果时间线、紧张度阶段
- [ ] 移动端布局不崩坏

### Phase 7 验收
- [ ] 达成条件时自动解锁成就
- [ ] 成就可以在仪表盘查看
