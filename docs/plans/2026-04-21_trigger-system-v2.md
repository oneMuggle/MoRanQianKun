# 事件触发系统 V2 (Event Trigger System V2)

**日期**: 2026-04-21
**状态**: 已实现
**优先级**: 高

---

## 背景

V1 版本 (`2026-04-10_event-trigger-system.md`) 已实现基础触发机制：
- 回合偏移触发
- 绝对回合触发
- 条件表达式触发

V2 需要增强：
1. 事件链式触发（事件可触发其他事件）
2. 周期性/循环事件
3. 事件分组与分类
4. 更强大的条件求值器
5. 事件冲突解决机制
6. 事件与游戏状态深度集成

---

## 实现方案

### 1. 类型扩展 (`models/eventTrigger.ts`)

新增类型：

```typescript
// 事件链配置
interface 事件链 {
  源事件ID: string;
  目标事件ID: string;
  触发后延迟?: number; // 回合延迟
}

// 周期性配置
interface 周期性配置 {
  间隔回合: number;
  终止回合?: number;
  最大触发次数?: number;
}

// 事件分组
interface 事件分组 {
  id: string;
  名称: string;
  描述?: string;
  事件ID列表: string[];
  互斥?: boolean; // 同组事件是否互斥
}

// 增强条件求值器
type 增强条件 =
  | { kind: '属性比较'; 属性路径: string; 操作符: '>' | '<' | '>=' | '<=' | '==' | '!='; 值: number | string }
  | { kind: '状态检查'; 检查项: string; 期望值: unknown }
  | { kind: '概率'; 概率: number }
  | { kind: '且'; 条件列表: 增强条件[] }
  | { kind: '或'; 条件列表: 增强条件[] }
  | { kind: '非'; 条件: 增强条件 };
```

### 2. 核心模块扩展 (`hooks/useGame/eventTrigger.ts`)

新增函数：

- `求值增强条件(条件, 游戏状态)` → boolean
- `检查事件链(事件ID, 事件列表)` → 触发的事件[]
- `计算周期性触发(事件, 当前回合)` → boolean
- `处理事件组互斥(分组ID, 事件列表)` → 保留的事件
- `注册事件链(源事件, 目标事件, 延迟)`
- `执行事件链(源事件ID, 当前回合)` → 链式触发的事件[]

### 3. 事件管理器 (`hooks/useGame/eventTriggerManager.ts`)

新增管理器模块：

- `创建增强事件(配置)` → 游戏事件
- `调度事件(事件, 当前回合)` → 是否应触发
- `更新事件调度状态(事件列表, 当前回合)` → 更新后的事件列表
- `获取待触发事件分组(分组ID, 事件列表)` → 游戏事件[]
- `清除已过期事件(事件列表)` → 清理后的事件列表

---

## 文件清单

| 文件 | 职责 |
|------|------|
| `models/eventTrigger.ts` | 类型定义（V1 + V2 扩展） |
| `hooks/useGame/eventTrigger.ts` | 核心逻辑（V1 + V2 扩展） |
| `hooks/useGame/eventTriggerManager.ts` | 事件管理器 |
| `hooks/useGame/eventTrigger.test.ts` | 单元测试（扩展覆盖） |

---

## 验收标准

- [x] 支持属性比较条件（数值、字符串）
- [x] 支持概率触发
- [x] 支持且/或/非逻辑组合条件
- [x] 支持事件链式触发
- [x] 支持周期性事件
- [x] 支持事件分组互斥
- [x] 单元测试覆盖新增函数
- [x] 向后兼容 V1 事件格式
