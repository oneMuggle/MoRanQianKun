# 纪年与时间显示优化 — 实施方案

> 基于 `docs/plans/2026-05-08_datetime-era-display.md`，结合代码现状细化。

## 需求梳理

1. **纪年由 LLM 生成**：开局时 LLM 根据世界观背景自动生成年号（如"天授"、"2024"、"新历"），替代硬编码的"1年1月1日"
2. **时间显示按时代切换**：古代/近代用传统时辰（子时二刻），现代/未来用 24 小时制（14:30）
3. **开场初始时间由 LLM 确定**：不再固定从 `1:01:01:00:00` 起算，由 LLM 根据背景生成合理的初始时间快照

## 代码现状分析

| 现状 | 问题 |
|------|------|
| `环境信息结构` 没有 `年号` 字段 | 需新增 |
| `创建空环境()` 硬编码 `时间: '1:01:01:00:00'` | 需改为 LLM 生成的动态值 |
| `worldGeneration.ts` 的世界生成 prompt 没有年号生成指令 | 需补充 |
| `opening.ts` 第90行写死"开局时间默认从 `1年1月1日` 起算" | 需移除/改为 LLM 动态生成 |
| `cotOpening.ts` Step2 写死"环境日期默认规划为 `1年1月1日`" | 需移除/改为 LLM 动态生成 |
| `scheduleWorkflow.ts` 的 `格式化时间()` 一律输出传统时辰 | 需按时代分流 |
| `TopBar.tsx` 直接解析 `YYYY:MM:DD:HH:MM` 显示，没有年号 | 需适配年号+按时代格式化 |
| 存档兼容：旧存档没有 `年号` 字段 | 需回退默认值 |

## 实施方案

### Phase 1: 数据模型 — `环境信息结构` 新增字段

**文件**: `models/environment.ts`

```typescript
export interface 环境信息结构 {
    时间: string;          // YYYY:MM:DD:HH:MM，环境时间唯一真值（计算用）
    年号: string;          // 新增：显示用年号，如"天授"、"公元"、"新历"
    大地点: string;
    // ... 其他字段不变
}
```

**设计决策**：`环境.时间` 保持纯数字 `Y:MM:DD:HH:MM` 格式不变，年号作为独立显示字段。这样不影响现有的时间计算、比较、存档解析逻辑。

### Phase 2: 状态初始化 — 空环境默认值

**文件**: `hooks/useGameState.ts` + `hooks/useGame/state/factories.ts`

- `创建空环境()` 中新增 `年号: ''` （空字符串，开局时由 LLM 填充）
- 存档兼容：在打开存档的解析逻辑中，如果 `年号` 字段缺失，根据 `世界.时代配置ID` 回退：
  - 古代/近代 → `"天授"`
  - 现代 → `"公元"`
  - 近未来/未来 → `"新历"`
  - 自定义 → `"纪年"`

### Phase 3: 世界生成 Prompt — 年号生成指令

**文件**: `prompts/runtime/worldGeneration.ts`

在 `构建世界观生成系统提示词()` 的【world_prompt 必含信息】中新增第7节：

```
7. 起始纪年
- 根据所选时代背景，生成合理的起始年号标识：
  - 古代：使用传统年号（如"天授"、"开元"、"景初"）
  - 近代：使用历史或虚构年号（如"民国"、"明治"）
  - 现代：使用公元纪年标识（如"公元"）
  - 近未来：使用虚构纪元（如"新历"、"星历"）
  - 未来：使用星际纪元（如"星历"、"联邦历"）
  - 自定义：根据自定义时代描述生成合理年号
- 将年号作为 `<世界观>` 标签内的一行写明，格式为：`起始年号：XXX`
```

### Phase 4: 开局 Prompt — 移除硬编码日期

**文件**: `prompts/runtime/opening.ts`

修改第 90 行：
```
// 修改前：
'开局时间默认从 `1年1月1日` 起算；若同人模式上下文已明确给出原著时间线锚点...'

// 修改后：
'开局时间以世界母本中 `起始年号` 为纪年基准，由 LLM 根据场景自然确定具体年月日；若同人模式上下文已明确给出原著时间线锚点...'
```

修改第 144 行（环境初始化段落）：
```
// 修改前：
'若开局上下文没有给出明确时间锚点，则默认把日期初始化为 `1年1月1日`...'

// 修改后：
'若开局上下文没有给出明确时间锚点，则由你根据世界观背景和开场场景，生成合理的初始年月日和年号...'
```

**文件**: `prompts/core/cotOpening.ts`

修改 Step0 (约第 57 行)：
```
// 修改前：
'先判定开局时间锚点来源：默认按 `1年1月1日` 起算；若同人上下文...'

// 修改后：
'先判定开局时间锚点来源：以世界母本中的 `起始年号` 为纪年基准，根据场景自然确定具体年月日；若同人上下文...'
```

修改 Step2 (约第 78 行)：
```
// 修改前：
'若当前没有外部明确时间锚点，环境日期默认规划为 `1年1月1日`...'

// 修改后：
'若当前没有外部明确时间锚点，则根据世界观背景和开场场景，规划合理的初始年月日和年号...'
```

### Phase 5: 时间格式化 — 按时代背景切换

**文件**: `hooks/useGame/scheduleWorkflow.ts`

新增函数：

```typescript
export function 格式化时间按时代(时间串: string, 时代背景: string): string {
    const 结构化 = 标准时间串转结构化(时间串);
    if (!结构化) return 时间串;

    if (时代背景 === '古代' || 时代背景 === '近代') {
        const 时辰 = 小时转时辰(结构化.时);
        const 刻 = mapMinuteToKe(结构化.分);
        return `${时辰} · ${刻}`;
    }
    // 现代/近未来/未来/自定义
    return `${String(结构化.时).padStart(2, '0')}:${String(结构化.分).padStart(2, '0')}`;
}
```

### Phase 6: TopBar — 时间显示改造

**文件**: `components/layout/TopBar.tsx`

Props 已包含 `eraId?: string | null`，改动：

1. 从 `props.eraId` 获取当前时代配置 ID，调用 `获取时代背景(eraId)` 得到时代背景
2. 日期显示格式改为：`${环境.年号 || ''}${parsedTime.year}年${parsedTime.month}月${parsedTime.day}日`
3. 时间显示调用 `格式化时间按时代(环境.时间, 时代背景)` 按时代切换

```typescript
// 新增 import
import { 获取时代背景 } from '../../models/system';
import { 格式化时间按时代 } from '../../hooks/useGame/scheduleWorkflow';

// 组件中：
const eraBackground = eraId ? 获取时代背景(eraId) : '古代';

// 时间显示：
const displayTime = parsedTime
    ? 格式化时间按时代(环境.时间, eraBackground)
    : '未知时间';

// 日期显示（加入年号）：
const fullDateStr = parsedTime
    ? `${环境.年号 || ''}${parsedTime.year}年${parsedTime.month.toString().padStart(2, '0')}月${parsedTime.day.toString().padStart(2, '0')}日 ${displayTime}`
    : displayTime;
```

### Phase 7: world_prompt 解析 — 提取年号并传递

**文件**: `hooks/useGame/world/worldGenerationWorkflow.ts`

在解析 LLM 返回的 `<世界观>` 标签内容时：
- 用正则 `/起始年号[：:]\s*(.+)/` 提取年号
- 将提取的年号存储到 `世界` 状态或通过上下文传递给开局流程
- 如果提取不到，使用基于时代背景的默认值

### Phase 8: 开局工作流年号传递

**文件**: `hooks/useGame/opening/openingStoryWorkflow.ts`

在构建开局请求时：
1. 从已生成的 `world_prompt` 中提取 `起始年号`
2. 将其作为额外上下文变量传递给开局 prompt
3. LLM 在 `<变量规划>` 中同时输出 `环境.时间` 和 `环境.年号`

## 实施步骤

- [ ] 步骤 1：`models/environment.ts` 新增 `年号: string` 字段
- [ ] 步骤 2：`hooks/useGame/state/factories.ts` 的 `创建开场空白环境()` 新增 `年号: ''`
- [ ] 步骤 3：`hooks/useGameState.ts` 的 `创建空环境()` 新增 `年号: ''`
- [ ] 步骤 4：`prompts/runtime/worldGeneration.ts` 增加年号生成指令
- [ ] 步骤 5：`prompts/runtime/opening.ts` 移除硬编码日期
- [ ] 步骤 6：`prompts/core/cotOpening.ts` 移除硬编码日期
- [ ] 步骤 7：`hooks/useGame/scheduleWorkflow.ts` 新增按时代格式化时间函数
- [ ] 步骤 8：`components/layout/TopBar.tsx` 改造时间显示逻辑
- [ ] 步骤 9：`hooks/useGame/world/worldGenerationWorkflow.ts` 解析并传递年号
- [ ] 步骤 10：`hooks/useGame/opening/openingStoryWorkflow.ts` 开局工作流年号传递
- [ ] 步骤 11：存档兼容处理（年号字段回退）
- [ ] 步骤 12：手动测试不同时代背景下的开局生成和时间显示

## 风险评估

| 风险 | 等级 | 缓解措施 |
|------|------|----------|
| LLM 年号输出不稳定 | 中 | 解析时增加回退默认值；`年号` 字段为空时 UI 显示为空但不崩溃 |
| LLM 不输出 `起始年号` | 中 | world_prompt 解析时用正则提取，提取不到时使用基于时代背景的默认值 |
| 已有存档兼容 | 低 | `年号` 字段为可选，缺失时按时代背景回退 |
| Prompt 变更影响其他流程 | 低 | 仅影响世界生成和开局流程，不影响运行中的时间推进 |

## 依赖

无外部依赖，纯内部代码和 Prompt 变更。
