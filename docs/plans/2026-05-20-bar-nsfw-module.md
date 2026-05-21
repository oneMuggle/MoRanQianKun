# 现代纪元酒吧场景 NSFW 模块

> 创建日期：2026-05-20
> 状态：实施中（Phase 1-4 后端完整，Phase 5-6 UI 基础完成）

## 一、背景与目标

### 1.1 背景

项目中已存在一个完整的 **夜场/KTV NSFW 模块**（`models/contemporary/nightlife/`），包含类型定义、状态管理、醉酒/陪酒/暧昧/危机系统、场景提示词等。但该模块目前：

1. **仅有纯数据和提示词层**，未接入游戏引擎（无 `BaseEngine` 实现）
2. **未在 `游戏设置结构` 中注册**（`models/system.ts` 中没有 `酒吧NSFW设置` 字段）
3. **未在 NSFW 运行时提示词中集成**（`prompts/runtime/nsfw.ts` 未导入 nightlife 约束）
4. **酒吧类型场景未在 `contemporary_urban`（现代都市）时代的开局场景中配置**
5. **`RegionType`（地域类型）中无酒吧类型**，`DailyTownEngine` 无法导航到酒吧

### 1.2 目标

将现有的 nightlife 模块从"纯数据/提示词"升级为**完整可运行的游戏引擎模块**，使其能够在现代纪元中：

1. 玩家在酒吧场景中触发完整的 NSFW 交互流程
2. 通过游戏设置控制酒吧 NSFW 的开启/关闭与参数
3. 在 AI 叙事中注入酒吧 NSFW 约束
4. 支持多类型酒吧（蹦迪酒吧、静吧、商务会所等）的差异化体验
5. 与现有 NPC 社交系统、醉酒系统、危机系统深度集成

## 二、涉及文件与模块

### 2.1 新增文件

| 文件路径 | 说明 |
|----------|------|
| `models/contemporary/barNSFW/types.ts` | 酒吧专属类型定义（复用+扩展 nightlife 类型） |
| `models/contemporary/barNSFW/index.ts` | 统一导出 |
| `models/contemporary/barNSFW/engine.ts` | 酒吧 NSFW 引擎（继承 BaseEngine） |
| `models/contemporary/barNSFW/actions.ts` | 玩家操作定义与处理 |
| `models/contemporary/barNSFW/events.ts` | 事件触发与处理逻辑 |
| `models/contemporary/barNSFW/prompts/酒吧叙事约束.ts` | AI 叙事约束提示词 |
| `hooks/useGame/engine/barNSFWEngine.ts` | 游戏引擎注册适配器 |
| `components/features/BarNSFW/BarPanel.tsx` | 桌面端酒吧 UI 面板 |
| `components/features/BarNSFW/MobileBarPanel.tsx` | 移动端酒吧 UI 面板 |

### 2.2 修改文件

| 文件路径 | 修改内容 |
|----------|----------|
| `models/system.ts` | 添加 `酒吧NSFW设置` 到 `游戏设置结构` |
| `prompts/runtime/nsfw.ts` | 导入并集成酒吧 NSFW 约束构建器 |
| `models/era-config.ts` | `contemporary_urban` 时代开局场景加入酒吧场景 |
| `models/dailyTown/regionNode.ts` | `RegionType` 增加 `'酒吧'` 类型 |
| `hooks/useGame/engine/types.ts` | `EngineType` 增加 `'barNSFW'` |
| `hooks/useGame.ts` | 注册酒吧 NSFW 引擎，状态管理集成 |
| `App.tsx` | 懒加载酒吧 UI 组件 |

### 2.3 复用文件

| 文件路径 | 复用内容 |
|----------|----------|
| `models/contemporary/nightlife/types.ts` | 夜场类型、醉酒程度、暧昧场景、危机事件等 |
| `models/contemporary/nightlife/states/*` | 消费者/服务人员/场所状态 |
| `models/contemporary/nightlife/systems/*` | 醉酒/消费/陪酒/暧昧/危机系统 |
| `models/contemporary/nightlife/prompts/*` | 提示词模板 |
| `hooks/useGame/engine/baseEngine.ts` | 引擎基类 |
| `hooks/useGame/engine/engineRegistry.ts` | 引擎注册表 |

## 三、技术方案

### 3.1 架构设计

遵循项目已有的 **Engine 模式**，酒吧 NSFW 模块作为独立引擎接入游戏主循环：

```
┌─────────────────────────────────────────────────┐
│                   App.tsx                        │
│              (UI 层: 懒加载面板)                    │
├─────────────────────────────────────────────────┤
│                  useGame.ts                      │
│         (状态管理 + EngineRegistry 注册)            │
├─────────────────────────────────────────────────┤
│               BarNSFWEngine                      │
│    (继承 BaseEngine, 实现 SLGEngine 接口)          │
├──────────┬──────────┬──────────┬────────────────┤
│ actions  │  events  │  state   │   prompts       │
│ .ts      │  .ts     │  /types  │   /酒吧叙事约束   │
├──────────┴──────────┴──────────┴────────────────┤
│          nightlife/* (复用已有模块)                 │
│  types → states → systems → prompts              │
└─────────────────────────────────────────────────┘
```

### 3.2 核心流程

```
玩家进入酒吧场景
    │
    ▼
BarNSFWEngine.activate()
    │
    ├── 初始化消费者状态（醉酒值=0，兴奋度=0）
    ├── 匹配当前时段的在场 NPC
    ├── 生成可用操作列表（点酒、搭讪、玩游戏...）
    │
    ▼
玩家执行操作（如"点酒"）
    │
    ├── BarNSFWEngine.executePlayerAction(action)
    ├── 消费系统 → 扣除资金
    ├── 醉酒系统 → 更新醉酒值
    ├── 暧昧系统 → 更新目标 NPC 关系进度
    ├── 事件系统 → 随机触发事件（表白、冲突、仙人跳...）
    │
    ▼
getNarrativeConstraints()
    │
    ├── 组装酒吧 NSFW 叙事约束
    ├── 注入 AI 系统提示词
    │
    ▼
AI 根据约束生成酒吧场景叙事
```

### 3.3 酒吧类型差异

| 酒吧类型 | NSFW 风格 | 核心玩法 | 风险等级 |
|----------|-----------|----------|----------|
| 蹦迪酒吧 | 身体接触、群舞 | 跳舞互动、酒精催化 | 中 |
| 静吧 | 情感对话、一对一 | 深度对话、逐步暧昧 | 低 |
| 商务会所 | 陪酒服务、金钱交易 | 消费解锁剧情 | 高 |

### 3.4 设置集成

在 `游戏设置结构` 中新增：

```typescript
interface 酒吧NSFW设置 {
  启用: boolean;
  内容强度: '微暗' | '暧昧' | '露骨';
  启用醉酒系统: boolean;
  启用危机事件: boolean;
  启用陪酒服务: boolean;
  尺度上限: NSFW场景类型;
}
```

### 3.5 AI 叙事约束

酒吧 NSFW 约束通过 `prompts/runtime/nsfw.ts` 注入，格式与其他子系统一致：

```typescript
构建酒吧NSFW叙事约束(params: {
  酒吧类型: 夜场类型;
  醉酒程度: 醉酒程度;
  暧昧对象?: NPC结构;
  当前事件?: 夜场事件;
  内容强度: '微暗' | '暧昧' | '露骨';
}): string
```

## 四、实施步骤

### Phase 1: 类型与设置集成

- [x] 1.1 创建 `models/contemporary/barNSFW/types.ts`，定义酒吧专属类型
- [x] 1.2 创建 `models/contemporary/barNSFW/index.ts` 统一导出
- [x] 1.3 修改 `models/system.ts`，在 `游戏设置结构` 中添加 `酒吧NSFW设置` 字段
- [x] 1.4 修改 `hooks/useGame/engine/types.ts`，添加 `'barNSFW'` 引擎类型

### Phase 2: 引擎核心实现

- [x] 2.1 创建 `models/contemporary/barNSFW/engine.ts`，继承 `BaseEngine`
- [x] 2.2 实现 `getEngineType()` 返回 `'barNSFW'`
- [x] 2.3 实现 `getSnapshot()` / `canExecuteAction()` 序列化与校验
- [x] 2.4 实现 `advanceTurn()` 回合推进逻辑
- [ ] 2.5 创建 `models/contemporary/barNSFW/actions.ts`，定义玩家操作枚举与处理器
- [ ] 2.6 创建 `models/contemporary/barNSFW/events.ts`，定义事件触发器

### Phase 3: 叙事约束与 AI 集成

- [x] 3.1 创建 `models/contemporary/barNSFW/prompts/酒吧叙事约束.ts`
- [x] 3.2 修改 `prompts/runtime/nsfw.ts`，导入并集成酒吧 NSFW 约束
- [x] 3.3 在 `构建运行时额外提示词` 中添加 `酒吧NSFW参数` 选项
- [x] 3.4 实现引擎的 `getNarrativeConstraints()` 方法

### Phase 4: 引擎注册与状态管理

- [x] 4.1 创建 `hooks/useGame/engine/barNSFWEngine.ts` 适配器
- [x] 4.2 修改 `hooks/useGame.ts`，注册酒吧 NSFW 引擎桥接层
- [x] 4.3 在 Zustand store 中添加酒吧相关状态字段（BarNSFWSlice）
- [x] 4.4 实现引擎的条件激活（通过 useBarNSFWBridge 的 enterBar/leaveBar 控制）

### Phase 5: 场景与区域系统集成

- [x] 5.1 修改 `models/dailyTown/regionNode.ts`，`RegionType` 添加 `'酒吧'`
- [x] 5.2 修改 `models/era-config.ts`，`contemporary_urban` 开局场景加入酒吧
- [ ] 5.3 为不同酒吧类型配置 NPC 调度规则

### Phase 6: UI 组件

- [x] 6.1 创建 `components/features/BarNSFW/BarPanel.tsx` 桌面端面板
- [x] 6.2 创建 `components/features/BarNSFW/MobileBarPanel.tsx` 移动端面板
- [x] 6.3 修改 `App.tsx`，懒加载酒吧 UI 组件（通过 lazyComponents.tsx + legacyRegistrations.ts 注册）
- [ ] 6.4 在设置面板中添加酒吧 NSFW 配置开关

### Phase 7: 测试与验证

- [ ] 7.1 手动测试酒吧场景进入/退出流程
- [ ] 7.2 验证醉酒值变化与叙事一致性
- [ ] 7.3 验证危机事件触发与处理
- [ ] 7.4 验证 NSFW 设置开关有效性

## 五、风险评估与依赖

### 5.1 风险

| 风险 | 等级 | 应对 |
|------|------|------|
| nightlife 模块现有类型与引擎接口不兼容 | 中 | Phase 2 初期做接口适配层 |
| AI 叙事约束过长导致 prompt 超载 | 中 | 约束提示词控制在 500 token 以内 |
| 与现有 NPC 社交系统状态冲突 | 低 | 复用 `是否在场` 字段，不修改 NPC 核心结构 |
| UI 面板与现有 Modal 系统风格不一致 | 低 | 遵循现有 `SocialModal` 等组件样式模式 |

### 5.2 依赖

- 依赖 `BaseEngine` 和 `EngineRegistry` 的稳定接口
- 依赖 nightlife 模块的类型和系统代码完整性
- 依赖 `prompts/runtime/nsfw.ts` 的约束注入机制
- 无外部依赖

### 5.3 复杂度评估

| 阶段 | 复杂度 | 预估工时 |
|------|--------|----------|
| Phase 1 | 低 | 1h |
| Phase 2 | 高 | 4h |
| Phase 3 | 中 | 2h |
| Phase 4 | 中 | 2h |
| Phase 5 | 中 | 2h |
| Phase 6 | 中 | 3h |
| Phase 7 | 低 | 1h |
| **总计** | | **~15h** |

## 六、与现有系统的关系

### 6.1 复用关系

- 复用 `nightlife/types.ts` 中的 `夜场类型`、`醉酒程度`、`暧昧场景`、`危机事件` 等
- 复用 `nightlife/systems/*` 中的醉酒、消费、陪酒、暧昧、危机系统逻辑
- 复用 `nightlife/prompts/*` 中的提示词模板

### 6.2 扩展关系

- 在 nightlife 基础上增加 `BaseEngine` 适配，使其成为可运行的游戏引擎
- 在 `游戏设置结构` 中新增 `酒吧NSFW设置`，与其他 NSFW 子系统并列
- 在 `nsfw.ts` 运行时中新增酒吧约束注入，与校园/网约车/写真等子系统并列

### 6.3 独立性

- 酒吧 NSFW 引擎可独立开启/关闭，不影响其他 NSFW 子系统
- 酒吧场景可与现有 `DailyTownEngine` 共存，玩家自由进出
