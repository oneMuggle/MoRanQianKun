# NSFW 跨模块联动系统

> 创建日期：2026-05-20
> 状态：待审批

## 一、背景与目标

### 1.1 背景

当前项目中存在多个 NSFW 子系统（校园、露出、网约车、写真、BDSM、桌游、夜场等），但它们是**完全孤立**的：

- 在酒吧醉酒闹事后，第二天校园 NPC 完全不知情
- 写真照片泄露后不会影响网约车乘客的态度
- 夜场认识的 VIP 客户不会出现在商务约会中
- 每个 NSFW 场景结束后状态基本丢失，没有长期记忆

### 1.2 目标

设计跨模块 NSFW 状态联动系统，使不同 NSFW 子系统之间能够事件传导、NPC 记忆延续、全局声誉影响、场景解锁。

## 二、涉及文件与模块

### 2.1 新增文件

| 文件路径 | 说明 |
|----------|------|
| `models/nsfw/linker/types.ts` | 跨模块联动类型定义 |
| `models/nsfw/linker/crossModuleLinker.ts` | 跨模块联动引擎（BaseEngine） |
| `models/nsfw/linker/eventBus.ts` | 全局事件总线 |
| `models/nsfw/linker/npcMemoryTracker.ts` | NPC 跨场景记忆追踪 |
| `models/nsfw/linker/reputationEngine.ts` | 全局声誉引擎 |
| `models/nsfw/linker/rules.ts` | 联动规则定义 |
| `prompts/runtime/crossModuleNSFW.ts` | 跨模块叙事约束提示词 |
| `hooks/useGame/engine/crossModuleLinkerEngine.ts` | 引擎注册适配器 |

### 2.2 修改文件

| 文件路径 | 修改内容 |
|----------|----------|
| `models/system.ts` | 添加 `跨模块联动设置` |
| `hooks/useGame/engine/types.ts` | 添加 `'crossModuleLinker'` |
| `models/social.ts` | NPC 结构添加 `跨模块记忆` 字段 |
| `hooks/useGame.ts` | 注册联动引擎 |
| `prompts/runtime/nsfw.ts` | 注入跨模块叙事约束 |

## 三、技术方案

### 3.1 架构

```
各 NSFW 子系统 → EventBus → Rule Engine → NPCMemory / Reputation → AI 叙事注入
```

### 3.2 联动规则示例

| 源事件 | 目标模块 | 效果 | 延迟 |
|--------|----------|------|------|
| 酒吧烂醉 | 网约车 | 触发"醉酒乘客"事件，概率+30% | 即时 |
| 酒吧冲突 | 露出 | 名誉受损，风险+20% | 1回合 |
| 写真泄露 | 校园 | 流言等级+2 | 2回合 |
| 夜场VIP | 商务 | 解锁高级场景 | 累积 |

### 3.3 NPC 记忆结构

```typescript
interface NPC跨模块记忆 {
  id: string;
  source: EngineType;
  event: string;
  timestamp: number;
  severity: number;    // 1-5
  attitude: '亲近' | '疏离' | '厌恶' | '好奇' | '威胁';
  记忆强度: number;    // 0-100，随时间衰减
  影响行为: string[];
}
```

## 四、实施步骤

### Phase 1: 类型与规则

- [ ] 1.1 创建 `models/nsfw/linker/types.ts`
- [ ] 1.2 创建 `models/nsfw/linker/rules.ts`

### Phase 2: 核心引擎

- [ ] 2.1 创建 `models/nsfw/linker/eventBus.ts`
- [ ] 2.2 创建 `models/nsfw/linker/npcMemoryTracker.ts`
- [ ] 2.3 创建 `models/nsfw/linker/reputationEngine.ts`
- [ ] 2.4 创建 `models/nsfw/linker/crossModuleLinker.ts`

### Phase 3: AI 集成

- [ ] 3.1 创建 `prompts/runtime/crossModuleNSFW.ts`
- [ ] 3.2 修改 `prompts/runtime/nsfw.ts` 注入跨模块约束
- [ ] 3.3 实现 `getNarrativeConstraints()`

### Phase 4: 注册与集成

- [ ] 4.1 创建引擎适配器
- [ ] 4.2 修改 `useGame.ts` 注册引擎
- [ ] 4.3 修改 `models/system.ts` 添加设置
- [ ] 4.4 修改 NPC 结构

### Phase 5: 子系统接入

- [ ] 5.1 nightlife 模块接入 EventBus
- [ ] 5.2 campus 模块接入 EventBus
- [ ] 5.3 exposure 模块接入 EventBus
- [ ] 5.4 driver 模块接入 EventBus
- [ ] 5.5 photography 模块接入 EventBus

### Phase 6: 验证

- [ ] 6.1 验证事件传导链路
- [ ] 6.2 验证 NPC 记忆衰减
- [ ] 6.3 验证声誉影响
- [ ] 6.4 验证 AI 叙事注入

## 五、复杂度评估

| 阶段 | 复杂度 | 预估工时 |
|------|--------|----------|
| Phase 1 | 低 | 1h |
| Phase 2 | 高 | 4h |
| Phase 3 | 中 | 2h |
| Phase 4 | 中 | 2h |
| Phase 5 | 高 | 4h |
| Phase 6 | 中 | 2h |
| **总计** | | **~15h** |
