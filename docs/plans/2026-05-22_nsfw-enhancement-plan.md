# NSFW 增强系统 — 三期路线图

> 创建日期：2026-05-22
> 状态：计划阶段

## 一、背景与目标

### 1.1 现状概述

NSFW 系统已经历两期开发，当前包含 13+ 个子系统，覆盖性癖分类、敏感点、表里人格、心理防线、潜能池、偏好漂移、人格演化、敏感点演化、孕产引擎、事后护理、服装层次、场景修饰器、NSFW后果、跨模块联动、视觉 UI 等模块。

**已有架构核心文件：**
- 核心类型：`models/nsfwCore/types.ts`（欲望阶段、关系轨道、权力倾向、后果类型）
- NPC 增强：`models/npcNSFWEnhancement/`（完整演化状态、心理防线、性癖潜能、孕产、服装层次、后果、跨模块联动）
- 写真约拍：`models/photographyNSFW/types.ts`（尺度等级、越界行为、泄露类型、玩法层）
- 运行时 Prompt：`prompts/runtime/nsfw.ts`（467 行多子系统约束构建器）
- 视觉状态：`hooks/useNSFWState.ts`（useNSFWVisualState 聚合钩子）
- UI 组件：`components/features/NSFW/`（状态条、服装面板、亲密度计量、风险警告、移动端面板）
- 系统初始化：`hooks/useGame/nsfw/nsfwSystemInitialization.ts`（5 个子系统的自动初始化）

### 1.2 已覆盖能力（一、二期已完成）

| 模块 | 状态 | 文件 |
|------|------|------|
| 性癖分类体系 | ✅ 已完成 | `models/npcNSFWEnhancement/fetishTaxonomy.ts` |
| 敏感点系统 | ✅ 已完成 | `models/npcNSFWEnhancement/sensitiveZones.ts` |
| 表里人格 | ✅ 已完成 | `models/npcNSFWEnhancement/personalityProfiles.ts` |
| 心理防线 | ✅ 已完成 | `types.ts` 内定义 |
| 偏好漂移 | ✅ 已完成 | `models/npcNSFWEnhancement/preferenceDrift.ts` |
| 人格演化 | ✅ 已完成 | `models/npcNSFWEnhancement/personalityEvolution.ts` |
| 孕产引擎 | ✅ 已完成 | `models/npcNSFWEnhancement/pregnancyEngine.ts` |
| 事后护理 | ✅ 已完成 | `models/npcNSFWEnhancement/aftercareSystem.ts` |
| 服装层次 | ✅ 已完成 | `models/npcNSFWEnhancement/clothingLayers.ts` |
| 场景修饰器 | ✅ 已完成 | `models/npcNSFWEnhancement/sceneModifiers.ts` |
| 后果系统 | ✅ 已完成 | `models/npcNSFWEnhancement/consequences/` |
| 跨模块联动 | ✅ 已完成 | `models/npcNSFWEnhancement/linker/` |
| 视觉 UI | ✅ 已完成 | `components/features/NSFW/` |
| AI 叙事注入 | ✅ 已完成 | `prompts/runtime/npcNSFWEnhancement.ts` |
| 里程碑追踪 | ✅ 已完成 | `models/npcNSFWEnhancement/milestoneTracker.ts` |
| 玩家偏好档案 | ✅ 已完成 | `models/npcNSFWEnhancement/playerProfile.ts` |

### 1.3 识别的增强缺口

| # | 缺口描述 | 优先级 | 影响范围 |
|---|----------|--------|----------|
| G1 | **同意/撤回机制**：当前缺乏显式的同意确认与撤回追踪，AI 叙事中无法体现 consent 动态变化 | **高** | 叙事质量、关系演化 |
| G2 | **NPC 长期 NSFW 记忆**：跨回合的 NSFW 交互记忆衰减模型不完善，缺少"记忆触发"机制 | **高** | NPC 行为一致性 |
| G3 | **风险升级模型**：当前风险仅依赖暴露风险数值，缺乏多因子综合建模（时间+地点+服装+心理+历史） | **高** | 游戏平衡性 |
| G4 | **写真尺度递进细化**：写真模块的尺度推进缺乏自动化阶梯和越界自动识别 | 中 | 写真玩法深度 |
| G5 | **关系演化追踪**：NSFW 交互对关系轨道的长期影响缺乏量化模型 | 中 | 社交系统深度 |
| G6 | **心理状态动态 UI**：当前心理状态仅展示数值，缺乏可视化情绪曲线和历史趋势 | 中 | 用户体验 |
| G7 | **后果系统深化**：后果类型有限，缺乏连锁反应和 NPC 间传播 | 中 | 叙事连贯性 |
| G8 | **NSFW 系统测试**：无专用的单元测试覆盖核心引擎 | **高** | 代码质量 |
| G9 | **Prompt 质量提升**：运行时 NSFW prompt 缺乏动态权重调整和上下文感知 | 中 | AI 叙事质量 |
| G10 | **NSFW 控制中心**：缺少统一的 NSFW 设置/状态总览面板 | 低 | 用户体验 |

### 1.4 增强目标

1. **叙事质量**：通过同意机制、长期记忆、风险建模提升 AI 叙事深度
2. **游戏体验**：通过关系演化、心理可视化、后果深化增强沉浸感
3. **代码质量**：建立 NSFW 系统专用测试套件，覆盖核心引擎
4. **可维护性**：优化 prompt 构建器结构，提升可扩展性

## 二、实施阶段

### Phase 1: 同意/撤回机制（~6h）

**目标**：建立显式的同意确认与撤回追踪系统，使 AI 叙事能体现 consent 的动态变化。

#### 1.1 创建同意系统类型定义
- **文件**: `models/npcNSFWEnhancement/consent/types.ts`
- **内容**:
  - `同意类型`: '明确同意' | '默许' | '犹豫' | '拒绝' | '撤回'
  - `同意维度`: '身体接触' | '亲密行为' | '特定玩法' | '场景公开' | '拍照录像'
  - `同意状态接口`: 包含当前同意级别、历史变化日志、撤回条件、恢复条件
  - `同意变化日志`: 时间、旧状态、新状态、触发事件、NPC 反应
- **依赖**: 无
- **风险**: 低

#### 1.2 创建同意引擎
- **文件**: `models/npcNSFWEnhancement/consent/consentEngine.ts`
- **内容**:
  - `初始化同意状态()`: 基于心理防线和亲密度计算初始同意倾向
  - `评估同意级别(上下文)`: 根据场景、历史、心理状态综合评估
  - `记录同意变化()`: 记录同意状态变更
  - `检查撤回条件()`: 检测是否触发撤回（恐惧度突增、后悔度超限等）
  - `应用同意衰减()`: 随时间和交互逐渐变化
  - `生成同意摘要()`: 用于 prompt 注入的文本摘要
- **依赖**: 步骤 1.1
- **风险**: 中 — 需要与心理状态系统深度集成

#### 1.3 集成到演化引擎
- **文件**: `models/npcNSFWEnhancement/evolutionEngine.ts`
- **内容**: 在 `应用性癖衰减` 和 `记录性癖触发事件` 中调用同意引擎
- **依赖**: 步骤 1.2
- **风险**: 低

#### 1.4 更新 NPCNSFW 画像
- **文件**: `models/npcNSFWEnhancement/linkage.ts`
- **内容**: `生成NSFW画像()` 返回值中包含同意状态
- **依赖**: 步骤 1.2
- **风险**: 低

#### 1.5 更新 Prompt 注入
- **文件**: `prompts/runtime/npcNSFWEnhancement.ts`
- **内容**:
  - 在 `构建NPCNSFW注入()` 中注入同意状态
  - 新增 `<同意变化>` XML 标签解析模板
  - 当同意级别为"犹豫"或"拒绝"时，添加叙事约束提示词
- **依赖**: 步骤 1.2
- **风险**: 低

#### 1.6 更新 types.ts
- **文件**: `models/npcNSFWEnhancement/types.ts`
- **内容**: `完整演化状态` 新增 `同意系统` 字段；`NPCNSFW画像` 新增 `同意状态` 字段
- **依赖**: 步骤 1.1
- **风险**: 低

#### 1.7 更新 index.ts 导出
- **文件**: `models/npcNSFWEnhancement/index.ts`
- **内容**: 导出 consent 模块
- **依赖**: 步骤 1.1, 1.2
- **风险**: 低

---

### Phase 2: NPC 长期 NSFW 记忆增强（~8h）

**目标**：建立跨回合的 NSFW 交互记忆模型，实现记忆衰减、触发回忆和"记忆闪回"效果。

#### 2.1 扩展记忆锚点系统
- **文件**: `models/npcNSFWEnhancement/consequences/memoryAnchors.ts`
- **内容**:
  - 新增 `创建NSFW记忆()`: 基于事件强度创建不同等级的记忆
  - 新增 `触发记忆查询(场景线索)`: 根据当前场景匹配历史记忆
  - 新增 `记忆强度衰减()`: 基于时间、情感强度、重复频率的衰减模型
  - 新增 `记忆强化()`: 通过相关事件强化已有记忆
  - 新增 `生成记忆摘要()`: 用于 prompt 注入
- **依赖**: 现有 `memoryAnchors.ts`
- **风险**: 中 — 需要设计合理的衰减公式

#### 2.2 创建记忆触发引擎
- **文件**: `models/npcNSFWEnhancement/memory/memoryTriggerEngine.ts`
- **内容**:
  - `记忆触发条件`: 地点匹配、时间匹配、人物匹配、行为匹配、情感匹配
  - `检查记忆触发()`: 遍历记忆锚点，检查是否触发"闪回"
  - `生成触发叙事()`: 生成"他突然想起..."类型的叙事提示
  - `应用记忆影响()`: 被触发的记忆对当前心理状态的影响
- **依赖**: 步骤 2.1
- **风险**: 中

#### 2.3 集成到场景修饰器
- **文件**: `models/npcNSFWEnhancement/sceneModifiers.ts`
- **内容**: 在 `计算场景修饰系数()` 中加入记忆触发系数
- **依赖**: 步骤 2.2
- **风险**: 低

#### 2.4 更新 Prompt 注入
- **文件**: `prompts/runtime/npcNSFWEnhancement.ts`
- **内容**:
  - 在 `构建NPCNSFW注入()` 中注入活跃记忆摘要
  - 新增 `<记忆闪回>` XML 标签解析模板
  - 当检测到记忆触发时，添加"自然融入历史回忆"的叙事指引
- **依赖**: 步骤 2.2
- **风险**: 低

#### 2.5 更新 index.ts 导出
- **文件**: `models/npcNSFWEnhancement/index.ts`
- **内容**: 导出 memory 模块
- **依赖**: 步骤 2.2
- **风险**: 低

---

### Phase 3: 多因子风险升级模型（~6h）

**目标**：建立基于时间、地点、服装、心理状态、历史事件的综合风险评估模型。

#### 3.1 创建风险模型类型
- **文件**: `models/npcNSFWEnhancement/risk/types.ts`
- **内容**:
  - `风险因子`: 时间因子、地点因子、服装因子、心理因子、历史因子、社交因子
  - `风险评估结果`: 综合风险值(0-100)、各因子分解、风险等级、风险趋势
  - `风险事件记录`: 风险事件类型、触发条件、影响范围
- **依赖**: 无
- **风险**: 低

#### 3.2 创建风险计算引擎
- **文件**: `models/npcNSFWEnhancement/risk/riskEngine.ts`
- **内容**:
  - `计算综合风险(环境, 服装, 心理, 历史)`: 多因子加权计算
  - `计算时间因子()`: 深夜风险高于白天，工作时间风险高于休息时间
  - `计算地点因子()`: 公共场所 > 半公开 > 私人空间
  - `计算服装因子()`: 基于服装层次系统的暴露程度
  - `计算心理因子()`: 冒险倾向、麻木度对风险感知的影响
  - `计算历史因子()`: 历史暴露事件对当前风险的影响（有前科风险更高）
  - `计算社交因子()`: 在场 NPC 数量和关系对风险的影响
  - `检测风险升级()`: 检测是否触发风险等级跃迁
  - `生成风险摘要()`: 用于 UI 展示和 prompt 注入
- **依赖**: 步骤 3.1、`clothingLayers.ts`、`consequences/types.ts`
- **风险**: 中 — 权重调优需要实际测试

#### 3.3 替换现有简单风险计算
- **文件**: `hooks/useNSFWState.ts`
- **内容**: 将 `计算风险等级()` 从单一的 `修饰.暴露风险` 改为调用新的风险引擎
- **依赖**: 步骤 3.2
- **风险**: 中 — 需要保持向后兼容

#### 3.4 更新场景修饰器
- **文件**: `models/npcNSFWEnhancement/sceneModifiers.ts`
- **内容**: `计算场景修饰系数()` 返回的综合风险值改为调用风险引擎
- **依赖**: 步骤 3.2
- **风险**: 低

#### 3.5 更新 RiskWarning 组件
- **文件**: `components/features/NSFW/RiskWarning.tsx`
- **内容**:
  - 展示风险因子分解（时间、地点、服装、心理等）
  - 显示风险趋势箭头（上升/下降/稳定）
  - 新增风险升级警告（当检测到风险跃迁时）
- **依赖**: 步骤 3.2
- **风险**: 低

#### 3.6 更新 index.ts 导出
- **文件**: `models/npcNSFWEnhancement/index.ts`
- **内容**: 导出 risk 模块
- **依赖**: 步骤 3.1, 3.2
- **风险**: 低

---

### Phase 4: 关系演化追踪（~5h）

**目标**：量化 NSFW 交互对关系轨道的长期影响，建立关系变化追踪和预测模型。

#### 4.1 创建关系演化类型
- **文件**: `models/npcNSFWEnhancement/relationship/types.ts`
- **内容**:
  - `关系变化类型`: '亲密度提升' | '信任加深' | '依赖形成' | '关系倒退' | '信任破裂' | '权力失衡'
  - `关系演化记录`: 时间、变化类型、旧关系状态、新关系状态、触发事件、影响因子
  - `关系趋势`: 短期趋势(5回合)、中期趋势(20回合)、长期趋势
- **依赖**: 无
- **风险**: 低

#### 4.2 创建关系演化引擎
- **文件**: `models/npcNSFWEnhancement/relationship/relationshipEngine.ts`
- **内容**:
  - `计算关系变化(NSFW事件, 当前关系, 同意状态)`: 基于事件性质和同意状态计算关系变化
  - `应用关系变化()`: 更新亲密度、信任度、依赖度
  - `检测关系跃迁()`: 检测是否跨越关系轨道（如从"纯爱"跃迁到"肉体"）
  - `计算关系趋势()`: 基于历史变化序列预测趋势
  - `生成关系摘要()`: 用于 prompt 注入
  - `检查关系修复条件()`: 检测是否满足关系修复条件（事后护理质量、时间衰减等）
- **依赖**: 步骤 4.1、Phase 1 的同意系统
- **风险**: 中

#### 4.3 集成到演化引擎
- **文件**: `models/npcNSFWEnhancement/evolutionEngine.ts`
- **内容**: 在事件处理中调用关系演化引擎
- **依赖**: 步骤 4.2
- **风险**: 低

#### 4.4 更新 IntimacyMeter 组件
- **文件**: `components/features/NSFW/IntimacyMeter.tsx`
- **内容**:
  - 显示关系趋势箭头
  - 新增关系轨道可视化（纯爱/暧昧/肉体/支配/多角的进度指示）
  - 显示最近关系变化事件
- **依赖**: 步骤 4.2
- **风险**: 低

#### 4.5 更新 Prompt 注入
- **文件**: `prompts/runtime/npcNSFWEnhancement.ts`
- **内容**: 注入关系趋势和最近变化事件
- **依赖**: 步骤 4.2
- **风险**: 低

#### 4.6 更新 index.ts 导出
- **文件**: `models/npcNSFWEnhancement/index.ts`
- **内容**: 导出 relationship 模块
- **依赖**: 步骤 4.1, 4.2
- **风险**: 低

---

### Phase 5: 写真尺度递进与越界识别增强（~4h）

**目标**：细化写真模块的尺度推进逻辑，增强越界自动识别和安全词系统。

#### 5.1 创建尺度递进引擎
- **文件**: `models/photographyNSFW/scaleProgression.ts`
- **内容**:
  - `计算下一尺度阈值()`: 基于当前进度和模特保护意识计算
  - `检查尺度递进条件()`: 亲密度、信任度、历史拍摄记录
  - `应用尺度递进()`: 自动推进或需要玩家确认
  - `检测越界行为()`: 对比约定尺度和实际行为，识别越界
  - `生成尺度摘要()`: 用于 prompt 注入
- **依赖**: 现有 `models/photographyNSFW/types.ts`
- **风险**: 低

#### 5.2 增强安全词系统
- **文件**: `models/photographyNSFW/safewordSystem.ts`
- **内容**:
  - `初始化安全词()`: 基于模特类型和摄影师信誉
  - `检查安全词触发()`: 检测是否应该触发安全词
  - `应用安全词效果()`: 停止当前行为、关系影响、后果生成
  - `生成安全词摘要()`: 用于 prompt 注入
- **依赖**: 现有 `models/photographyNSFW/types.ts`
- **风险**: 低

#### 5.3 更新写真 Prompt 构建器
- **文件**: `prompts/runtime/photographyNSFW.ts`
- **内容**:
  - 在 `构建写真NSFW完整叙事约束()` 中加入尺度递进状态
  - 加入越界识别提示
  - 加入安全词系统提示
- **依赖**: 步骤 5.1, 5.2
- **风险**: 低

#### 5.4 集成到写真引擎
- **文件**: `hooks/useGame/photographyNSFWEngine.ts`
- **内容**: 在拍摄流程中调用尺度递进和安全词检查
- **依赖**: 步骤 5.1, 5.2
- **风险**: 中

---

### Phase 6: 心理状态可视化增强（~4h）

**目标**：将心理状态从纯数值展示升级为可视化情绪曲线和历史趋势。

#### 6.1 创建心理状态历史追踪
- **文件**: `models/npcNSFWEnhancement/consequences/psychologyHistory.ts`
- **内容**:
  - `记录心理快照()`: 定时记录五维度心理状态
  - `获取心理趋势()`: 返回最近 N 个快照的趋势分析
  - `检测心理异常()`: 检测数值突变（如羞耻度骤降可能意味着麻木化）
  - `生成心理报告()`: 包含当前值、趋势、异常检测
- **依赖**: 现有 `psychologyTracker.ts`
- **风险**: 低

#### 6.2 创建心理状态可视化组件
- **文件**: `components/features/NSFW/PsychologyPanel.tsx`
- **内容**:
  - 五维度雷达图（羞耻度、麻木度、依赖度、冒险倾向、后悔度）
  - 历史趋势迷你图（最近 10 回合变化）
  - 异常检测警告标记
  - 心理状态解读文本（如"该角色正在逐渐麻木化"）
- **依赖**: 步骤 6.1
- **风险**: 中 — 需要简单的图表组件

#### 6.3 集成到 MobileNSFWPanel
- **文件**: `components/features/NSFW/MobileNSFWPanel.tsx`
- **内容**: 在展开面板中加入心理状态简化视图
- **依赖**: 步骤 6.2
- **风险**: 低

#### 6.4 更新 useNSFWVisualState
- **文件**: `hooks/useNSFWState.ts`
- **内容**: 新增 `心理趋势` 返回值
- **依赖**: 步骤 6.1
- **风险**: 低

---

### Phase 7: NSFW 系统测试套件（~10h）

**目标**：为 NSFW 核心引擎建立完整的单元测试覆盖，确保 80%+ 代码覆盖率。

#### 7.1 同意系统测试
- **文件**: `__tests__/nsfwEnhancement/consentEngine.test.ts`
- **内容**:
  - 初始化测试（不同心理防线和亲密度下的初始同意倾向）
  - 同意评估测试（各种场景组合）
  - 撤回条件测试（恐惧度、后悔度超限场景）
  - 衰减测试（时间衰减曲线验证）
- **依赖**: Phase 1
- **风险**: 低

#### 7.2 记忆系统测试
- **文件**: `__tests__/nsfwEnhancement/memoryTriggerEngine.test.ts`
- **内容**:
  - 记忆创建测试（不同强度事件）
  - 衰减测试（验证衰减公式）
  - 触发查询测试（场景匹配准确性）
  - 强化测试（重复事件强化效果）
- **依赖**: Phase 2
- **风险**: 低

#### 7.3 风险引擎测试
- **文件**: `__tests__/nsfwEnhancement/riskEngine.test.ts`
- **内容**:
  - 单因子测试（时间、地点、服装、心理、历史、社交各因子）
  - 综合测试（多因子组合计算）
  - 边界测试（极端值处理）
  - 风险升级检测测试
- **依赖**: Phase 3
- **风险**: 低

#### 7.4 关系演化测试
- **文件**: `__tests__/nsfwEnhancement/relationshipEngine.test.ts`
- **内容**:
  - 关系变化计算测试
  - 关系跃迁检测测试
  - 趋势预测测试
  - 关系修复测试
- **依赖**: Phase 4
- **风险**: 低

#### 7.5 后果系统测试
- **文件**: `__tests__/nsfwEnhancement/consequenceEngine.test.ts`
- **内容**:
  - 后果创建和衰减测试
  - 蝴蝶效应检测测试
  - 记忆锚点衰减测试
  - 心理状态演化测试
- **依赖**: 现有 `consequenceEngine.ts`
- **风险**: 低

#### 7.6 跨模块联动测试
- **文件**: `__tests__/nsfwEnhancement/crossModuleLinker.test.ts`
- **内容**:
  - 事件发布/订阅测试
  - NPC 记忆衰减测试
  - 声誉计算测试
  - 联动规则执行测试
- **依赖**: 现有 `crossModuleLinker.ts`
- **风险**: 低

#### 7.7 写真系统测试补充
- **文件**: `__tests__/nsfwEnhancement/scaleProgression.test.ts`
- **内容**:
  - 尺度递进条件测试
  - 越界识别测试
  - 安全词触发测试
- **依赖**: Phase 5
- **风险**: 低

#### 7.8 集成测试
- **文件**: `__tests__/nsfwEnhancement/integration.test.ts`
- **内容**:
  - 完整 NSFW 交互流程测试
  - 多系统联动测试
  - 边界条件和异常处理
- **依赖**: 以上所有测试
- **风险**: 中

---

### Phase 8: Prompt 质量提升与 NSFW 控制中心（~6h）

**目标**：优化运行时 NSFW prompt 构建器结构，创建统一的 NSFW 状态总览面板。

#### 8.1 重构 NSFW Prompt 构建器
- **文件**: `prompts/runtime/nsfw.ts`
- **内容**:
  - 提取各子系统约束为独立构建函数（已完成大部分，需补全）
  - 新增动态权重调整：根据当前上下文自动调整各子系统 prompt 权重
  - 新增上下文感知：根据当前场景类型自动启用/禁用相关子系统约束
  - 优化 prompt 组装顺序，减少 token 浪费
- **依赖**: 无
- **风险**: 中 — 需要确保向后兼容

#### 8.2 创建 NSFW 控制中心组件
- **文件**: `components/features/NSFW/NSFWControlCenter.tsx`
- **内容**:
  - 全局 NSFW 设置总览（各子系统开关状态）
  - 当前活跃 NSFW 状态摘要（所有 NPC 的 NSFW 状态概览）
  - 风险总览（所有活跃风险项）
  - 后果总览（所有活跃后果）
  - 快速操作（一键调整各子系统参数）
- **依赖**: Phase 3, Phase 6
- **风险**: 低

#### 8.3 集成到 Settings 面板
- **文件**: `components/features/Settings/` (新建 `NSFWControlCenterSettings.tsx`)
- **内容**: 在设置面板中新增 NSFW 控制中心入口
- **依赖**: 步骤 8.2
- **风险**: 低

## 三、依赖关系图

```
Phase 1: 同意/撤回机制
    ↓
Phase 2: NPC 长期记忆
    ↓
Phase 3: 风险升级模型
    ↓
Phase 4: 关系演化 ← 依赖 Phase 1 (同意系统)
    ↓
Phase 5: 写真增强 (可独立进行)
    ↓
Phase 6: 心理可视化 ← 依赖 Phase 2 (记忆系统)
    ↓
Phase 7: 测试套件 ← 依赖 Phase 1-6
    ↓
Phase 8: Prompt 优化 + 控制中心 ← 依赖 Phase 3, 6
```

**并行策略：**
- Phase 5 可与 Phase 1-4 并行
- Phase 1-4 顺序依赖，不可并行
- Phase 6 依赖 Phase 2，可在 Phase 3-4 完成后开始
- Phase 7 在所有功能完成后进行
- Phase 8 可与 Phase 7 并行

## 四、复杂度评估

| 阶段 | 复杂度 | 工时 | 涉及文件数 | 新增文件数 |
|------|--------|------|-----------|-----------|
| Phase 1: 同意/撤回 | 高 | 6h | 5 | 3 |
| Phase 2: 长期记忆 | 高 | 8h | 4 | 2 |
| Phase 3: 风险模型 | 高 | 6h | 5 | 3 |
| Phase 4: 关系演化 | 中 | 5h | 5 | 3 |
| Phase 5: 写真增强 | 中 | 4h | 4 | 2 |
| Phase 6: 心理可视化 | 中 | 4h | 4 | 2 |
| Phase 7: 测试套件 | 高 | 10h | 0 | 8 |
| Phase 8: Prompt + 控制中心 | 中 | 6h | 3 | 2 |
| **总计** | | **~49h** | **30** | **25** |

## 五、风险评估与缓解策略

| 风险 | 等级 | 影响 | 缓解策略 |
|------|------|------|----------|
| 同意系统与 AI 叙事不兼容 | 中 | AI 可能忽略同意状态 | 在 prompt 中强化同意约束，添加明确的叙事指令 |
| 记忆衰减公式不合理 | 中 | 记忆消失太快或太慢 | 建立可调参数的衰减模型，通过测试调优 |
| 风险权重调优困难 | 中 | 风险感知与玩家体验不符 | 提供权重配置接口，允许运行时调整 |
| 测试覆盖不足 | 高 | 上线后出现 bug | 严格按照 TDD 流程，每个引擎先写测试 |
| Prompt token 超限 | 中 | 新增 prompt 导致上下文溢出 | 实现动态裁剪，token 紧张时自动精简 |
| 向后兼容问题 | 高 | 现有存档数据损坏 | 所有新增字段使用可选类型，提供数据迁移脚本 |

## 六、文件级影响分析

### 新增文件（25 个）

| 文件 | 阶段 | 行数估计 |
|------|------|----------|
| `models/npcNSFWEnhancement/consent/types.ts` | P1 | ~80 |
| `models/npcNSFWEnhancement/consent/consentEngine.ts` | P1 | ~200 |
| `models/npcNSFWEnhancement/consent/index.ts` | P1 | ~10 |
| `models/npcNSFWEnhancement/memory/memoryTriggerEngine.ts` | P2 | ~200 |
| `models/npcNSFWEnhancement/memory/index.ts` | P2 | ~10 |
| `models/npcNSFWEnhancement/risk/types.ts` | P3 | ~60 |
| `models/npcNSFWEnhancement/risk/riskEngine.ts` | P3 | ~250 |
| `models/npcNSFWEnhancement/risk/index.ts` | P3 | ~10 |
| `models/npcNSFWEnhancement/relationship/types.ts` | P4 | ~80 |
| `models/npcNSFWEnhancement/relationship/relationshipEngine.ts` | P4 | ~200 |
| `models/npcNSFWEnhancement/relationship/index.ts` | P4 | ~10 |
| `models/photographyNSFW/scaleProgression.ts` | P5 | ~150 |
| `models/photographyNSFW/safewordSystem.ts` | P5 | ~120 |
| `models/npcNSFWEnhancement/consequences/psychologyHistory.ts` | P6 | ~150 |
| `components/features/NSFW/PsychologyPanel.tsx` | P6 | ~120 |
| `__tests__/nsfwEnhancement/consentEngine.test.ts` | P7 | ~150 |
| `__tests__/nsfwEnhancement/memoryTriggerEngine.test.ts` | P7 | ~150 |
| `__tests__/nsfwEnhancement/riskEngine.test.ts` | P7 | ~200 |
| `__tests__/nsfwEnhancement/relationshipEngine.test.ts` | P7 | ~150 |
| `__tests__/nsfwEnhancement/consequenceEngine.test.ts` | P7 | ~150 |
| `__tests__/nsfwEnhancement/crossModuleLinker.test.ts` | P7 | ~150 |
| `__tests__/nsfwEnhancement/scaleProgression.test.ts` | P7 | ~120 |
| `__tests__/nsfwEnhancement/integration.test.ts` | P7 | ~200 |
| `components/features/NSFW/NSFWControlCenter.tsx` | P8 | ~200 |
| `components/features/Settings/NSFWControlCenterSettings.tsx` | P8 | ~80 |

### 修改文件（16 个）

| 文件 | 阶段 | 变更范围 |
|------|------|----------|
| `models/npcNSFWEnhancement/types.ts` | P1, P4 | 新增同意系统、关系演化字段 |
| `models/npcNSFWEnhancement/evolutionEngine.ts` | P1, P4 | 集成同意引擎、关系引擎 |
| `models/npcNSFWEnhancement/linkage.ts` | P1 | 画像生成包含同意状态 |
| `prompts/runtime/npcNSFWEnhancement.ts` | P1, P2, P4 | 新增同意、记忆、关系注入 |
| `models/npcNSFWEnhancement/consequences/memoryAnchors.ts` | P2 | 扩展记忆功能 |
| `models/npcNSFWEnhancement/sceneModifiers.ts` | P2, P3 | 加入记忆触发、风险引擎 |
| `hooks/useNSFWState.ts` | P3, P6 | 使用新风险引擎、新增心理趋势 |
| `components/features/NSFW/RiskWarning.tsx` | P3 | 展示风险因子分解 |
| `components/features/NSFW/IntimacyMeter.tsx` | P4 | 显示关系趋势 |
| `components/features/NSFW/MobileNSFWPanel.tsx` | P6 | 集成心理状态视图 |
| `prompts/runtime/nsfw.ts` | P8 | 重构构建器结构 |
| `models/npcNSFWEnhancement/index.ts` | P1-P6 | 新增模块导出 |
| `prompts/runtime/photographyNSFW.ts` | P5 | 增强写真约束 |
| `hooks/useGame/photographyNSFWEngine.ts` | P5 | 集成尺度递进 |
| `hooks/useGame/nsfw/nsfwSystemInitialization.ts` | P8 | 新增同意系统初始化 |
| `models/system.ts` | P8 | 新增 NSFW 控制中心配置 |

## 七、里程碑与交付物

| 里程碑 | 交付物 | 验收标准 |
|--------|--------|----------|
| M1: 同意系统完成 | 同意引擎 + Prompt 注入 + XML 解析 | AI 叙事能体现同意状态变化 |
| M2: 记忆系统完成 | 记忆引擎 + 触发引擎 + Prompt 注入 | NPC 能"回忆"历史 NSFW 事件 |
| M3: 风险模型完成 | 风险引擎 + UI 更新 | 风险值能反映多因子综合评估 |
| M4: 关系演化完成 | 关系引擎 + IntimacyMeter 更新 | 关系变化能追踪和预测 |
| M5: 写真增强完成 | 尺度递进 + 安全词系统 | 写真尺度推进更精细化 |
| M6: 心理可视化完成 | PsychologyPanel + 趋势追踪 | 心理状态可视化展示 |
| M7: 测试套件完成 | 8 个测试文件 | 覆盖率达到 80%+ |
| M8: Prompt 优化完成 | 重构后的 nsfw.ts + 控制中心 | Token 使用减少，控制中心可用 |

## 八、测试策略

### 单元测试
- 每个引擎函数单独测试
- 边界条件和异常处理测试
- 衰减公式和计算准确性验证

### 集成测试
- 多引擎协同工作流程测试
- Prompt 注入完整性测试
- UI 组件与数据层集成测试

### E2E 测试（可选）
- 完整 NSFW 交互流程（开始 → 互动 → 后果 → 恢复）
- 写真约拍完整流程

### 测试覆盖目标
- Phase 7 完成后，NSFW 相关代码覆盖率 >= 80%
- 核心引擎（同意、记忆、风险、关系）覆盖率 >= 90%

## 九、向后兼容性策略

1. **可选字段**：所有新增类型字段均使用 `?` 可选修饰
2. **默认值**：为所有新增字段提供合理的默认值
3. **数据迁移**：提供 `migrateNSFWState()` 函数处理旧存档升级
4. **开关控制**：新增系统默认关闭，需用户显式启用
5. **降级策略**：当新增系统未启用时，回退到现有行为

## 十、成功标准

- [ ] 同意系统能正确追踪和反映 NPC 的 consent 状态
- [ ] NPC 能在适当场景下触发历史 NSFW 记忆
- [ ] 风险评估能综合至少 5 个因子，输出准确的风险等级
- [ ] 关系演化能追踪 NSFW 交互对关系的长期影响
- [ ] 写真模块支持自动尺度递进和越界识别
- [ ] 心理状态能以可视化方式展示趋势和异常
- [ ] NSFW 系统测试覆盖率达到 80%+
- [ ] Prompt 构建器支持动态权重和上下文感知
- [ ] NSFW 控制中心能总览所有子系统状态
- [ ] 所有变更向后兼容，旧存档可正常加载
