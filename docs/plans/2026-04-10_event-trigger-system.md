# 事件触发系统 (Event Trigger System)

**日期**: 2026-04-10
**状态**: 已实现
**优先级**: 高

---

## 背景

游戏需要统一的事件触发机制，支持：
1. 预约型触发（到回合数触发）
2. 条件型触发（满足条件时触发）
3. 一次性/循环触发

现有 `bdsmMeetingTrigger.ts` 和 `bdsmTaskTrigger.ts` 是特定领域的实现，需要通用事件触发框架。

---

## 实现方案

### 1. 类型定义 (`models/eventTrigger.ts`)

```typescript
interface 游戏事件 {
  id: string;
  类型: '预约' | '条件' | '定时';
  名称: string;
  描述?: string;
  触发条件: 触发条件;
  事件数据: Record<string, unknown>;
  状态: '待触发' | '已触发' | '已过期';
  创建回合: number;
  触发回合?: number;
  优先级?: number;
}

type 触发条件 =
  | { kind: '回合偏移'; 偏移量: number }
  | { kind: '回合绝对'; 目标回合: number }
  | { kind: '条件表达式'; 表达式: string };
```

### 2. 核心模块 (`hooks/useGame/eventTrigger.ts`)

- `检查到期事件(事件列表, 当前回合)` → 到期事件[]
- `构建事件注入提示词(事件)` → 提示词字符串
- `解析事件完成信号(响应文本)` → 事件更新?
- `计算下一触发回合(事件)` → 回合数

### 3. 集成点

- 在 `sendWorkflow` 的 `responseProcessingPhase` 阶段调用 `检查到期事件`
- 将触发提示词注入到 `systemPromptBuilder`
- 响应解析后更新事件状态

---

## 文件清单

| 文件 | 职责 |
|------|------|
| `models/eventTrigger.ts` | 类型定义 |
| `hooks/useGame/eventTrigger.ts` | 触发器核心逻辑 |
| `hooks/useGame/eventTrigger.test.ts` | 单元测试 |

---

## 验收标准

- [x] 支持回合偏移触发（基于创建回合 + 偏移量）
- [x] 支持绝对回合触发
- [x] 生成的事件注入提示词格式正确
- [x] 能解析 `<事件更新>` 标签
- [x] 单元测试覆盖核心函数
