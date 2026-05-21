# NSFW 增强系统 — 二期路线图

> 创建日期：2026-05-21
> 状态：实施中

## 一、背景与目标

### 1.1 现状

已实现 13 个子系统：性癖分类、敏感点、表里人格、心理防线、潜能池、偏好漂移、人格演化、敏感点演化、性癖演化引擎、事件映射、AI叙事注入、XML标签解析、穿着风格演变。

### 1.2 识别缺口

| # | 缺口 | 优先级 |
|---|------|--------|
| G1 | 子宫/孕产引擎（`子宫档案` 有数据结构但无引擎） | **高** |
| G2 | 玩家NSFW偏好档案 | 中 |
| G3 | NPC-NPC NSFW互动传播 | 中 |
| G4 | 时间/地点场景修饰器 | 中 |
| G5 | NSFW场景经济/资源 | 低 |
| G6 | 事后护理/情感余波 | 中 |
| G7 | NSFW成就/里程碑 | 低 |
| G8 | 动态难度调节 | 低 |
| G9 | 氛围音效管理 | 低 |
| G10 | 照片/回忆画廊 | 低 |
| G11 | 服装层次/破损追踪 | 中 |
| G12 | NSFW事件时间线 | 低 |

### 1.3 已有待实施计划

| 计划 | 文件 | 工时 |
|------|------|------|
| Plan A: 视觉UI | `docs/plans/2026-05-20-nsfw-visual-ui-enhancement.md` | ~6h |
| Plan B: 后果记忆 | `docs/plans/2026-05-20-nsfw-consequences-memory.md` | ~8h |
| Plan C: 跨模块联动 | `docs/plans/2026-05-20-nsfw-cross-module-linker.md` | ~10h |

## 二、实施阶段

### Phase 1: 孕产引擎 + 事后护理（~6h）

- [x] 1.1 创建 `models/npcNSFWEnhancement/pregnancyEngine.ts`
  - 受孕判定（检查 `子宫档案.内射记录` 的 `怀孕判定日`）
  - 妊娠推进（妊娠一月→九月→分娩）
  - 分娩事件处理
  - **孕产系统默认关闭，需设置 `启用孕产系统 === true` 才生效**
  - 函数：`初始化子宫档案`, `检查受孕判定`, `推进妊娠进程`, `处理分娩事件`, `记录内射`
- [x] 1.2 创建 `models/npcNSFWEnhancement/aftercareSystem.ts`
  - 事后情绪追踪（羞耻/依恋/后悔/ bonding）
  - 恢复速率、护理质量评估
  - 函数：`初始化事后状态`, `记录事后情绪`, `应用事后恢复`, `评估护理质量`
- [x] 1.3 在 `types.ts` 新增类型：`妊娠阶段`, `孕产变化日志`, `孕产演化状态`, `事后情绪类型`, `事后护理状态`, `情感余波日志`
- [x] 1.4 集成到 `evolutionEngine.ts`（在 `记录性癖触发事件` 和 `应用性癖衰减` 中调用）
- [x] 1.5 在 `responseCommandProcessor.ts` 新增 `<孕产变化>` / `<事后护理>` XML标签解析
- [x] 1.6 更新 `prompts/runtime/npcNSFWEnhancement.ts` 注入孕产/事后状态
- [x] 1.7 更新 `index.ts` 导出 + 更新 `linkage.ts` 生成画像时包含孕产/事后状态

### Phase 2: 场景修饰器 + 服装层次（~3h）

- [x] 2.1 创建 `sceneModifiers.ts` — 时间/地点/天气修饰系数
- [x] 2.2 创建 `clothingLayers.ts` — 层次移除顺序、损坏程度、污渍
- [x] 2.3 集成到演化引擎
- [x] 2.4 更新 `index.ts` 导出 sceneModifiers 和 clothingLayers
- [x] 2.5 更新 `prompts/runtime/npcNSFWEnhancement.ts` 注入场景氛围和服装状态

### Phase 3: 玩家档案 + 里程碑（~4h）

- [x] 3.1 创建 `playerProfile.ts` — 玩家偏好、NPC契合度
- [x] 3.2 创建 `milestoneTracker.ts` — 里程碑定义与触发
- [x] 3.3 在 `types.ts` 新增类型：`玩家NSFW偏好档案`, `NPC契合度条目`, `里程碑定义`, `里程碑追踪状态`等
- [x] 3.4 更新 `index.ts` 导出 playerProfile 和 milestoneTracker

### Phase 4: 后果系统（Plan B，~8h）

- [ ] 4.1 创建 `models/nsfw/consequences/types.ts`
- [ ] 4.2 创建 `consequenceEngine.ts`
- [ ] 4.3 创建 `memoryAnchors.ts`
- [ ] 4.4 创建 `psychologyTracker.ts`
- [ ] 4.5 创建 `butterflyEffects.ts`

### Phase 5: 跨模块联动（Plan C，~10h）

- [ ] 5.1 创建 `models/nsfw/linker/types.ts`
- [ ] 5.2 创建 `eventBus.ts`
- [ ] 5.3 创建 `npcMemoryTracker.ts`
- [ ] 5.4 创建 `reputationEngine.ts`
- [ ] 5.5 创建 `crossModuleLinker.ts`

### Phase 6: 视觉UI（Plan A，~6h）

- [ ] 6.1 创建 `hooks/useNSFWState.ts`
- [ ] 6.2 创建 `components/features/NSFW/` 组件集
- [ ] 6.3 集成到 SocialModal + MobileSocial

### Phase 7: 集成打磨（~4h）

- [ ] 7.1 更新 `hooks/useGame/engine/types.ts` 新增引擎类型
- [ ] 7.2 更新 `models/system.ts` 添加NSFW设置（含 `启用孕产系统: false` 默认关闭）
- [ ] 7.3 更新所有叙事prompt

## 三、复杂度评估

| 阶段 | 复杂度 | 工时 |
|------|--------|------|
| Phase 1 | 高 | 6h |
| Phase 2 | 中 | 3h |
| Phase 3 | 中 | 4h |
| Phase 4 | 高 | 8h |
| Phase 5 | 高 | 10h |
| Phase 6 | 中 | 6h |
| Phase 7 | 中 | 4h |
| **总计** | | **~41h** |

## 四、依赖关系

```
Phase 1 → Phase 2 → Phase 3 → Phase 4 → Phase 5 → Phase 6 → Phase 7
```

Phase 2 和 Phase 3 可与 Phase 1 并行。
