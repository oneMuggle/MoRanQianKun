# NSFW 后果与记忆持久化系统

> 创建日期：2026-05-20
> 状态：待审批

## 一、背景与目标

当前 NSFW 事件结束后缺乏长期影响：角色不记前事、无心理变化、无社会后果、无蝴蝶效应。本方案增加后果系统、记忆锚点、蝴蝶效应和心理演化。

## 二、涉及文件

### 新增
| 文件 | 说明 |
|------|------|
| `models/nsfw/consequences/types.ts` | 后果系统类型 |
| `models/nsfw/consequences/consequenceEngine.ts` | 后果引擎 |
| `models/nsfw/consequences/memoryAnchors.ts` | 记忆锚点 |
| `models/nsfw/consequences/psychologyTracker.ts` | 心理追踪 |
| `models/nsfw/consequences/butterflyEffects.ts` | 蝴蝶效应 |
| `prompts/runtime/consequenceNSFW.ts` | 后果叙事提示词 |
| `hooks/useGame/engine/consequenceEngine.ts` | 引擎适配器 |

### 修改
| 文件 | 修改内容 |
|------|----------|
| `models/system.ts` | 添加 `后果系统设置` |
| `models/social.ts` | NPC 添加 `NSFW记忆` 和 `心理变化` |
| `hooks/useGame/engine/types.ts` | 添加 `'nsfwConsequence'` |
| `hooks/useGame.ts` | 注册引擎 |
| `prompts/runtime/nsfw.ts` | 注入后果约束 |

## 三、技术方案

### 后果类型

| 类型 | 示例 | 持续 |
|------|------|------|
| 社会 | 名誉下降、流言传播 | 长期 |
| 关系 | NPC 态度改变 | 永久 |
| 法律 | 被举报、调查 | 中期 |
| 心理 | 羞耻、麻木、依赖 | 长期 |
| 经济 | 封口费、收入 | 持续 |

### NPC 记忆结构

```typescript
interface NSFW记忆锚点 {
  id: string;
  事件类型: string;
  涉及NPC: string[];
  情感标签: ('羞耻'|'兴奋'|'后悔'|'依恋'|'恐惧')[];
  当前强度: number;  // 0-100
  衰减率: number;    // 每回合衰减
}
```

### 心理状态

```typescript
interface NSFW心理状态 {
  羞耻度: number;
  麻木度: number;
  依赖度: number;
  冒险倾向: number;
  后悔度: number;
}
```

## 四、实施步骤

- [ ] Phase 1: 类型定义
- [ ] Phase 2: 核心引擎（记忆锚点/心理追踪/蝴蝶效应）
- [ ] Phase 3: AI 叙事约束集成
- [ ] Phase 4: 引擎注册 + 设置集成 + NPC 结构扩展
- [ ] Phase 5: 各 NSFW 子系统接入后果触发
- [ ] Phase 6: 验证记忆衰减/心理演化/蝴蝶效应

## 五、复杂度评估

总工时 ~14h（6个阶段）
