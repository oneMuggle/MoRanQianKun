# 里模式（Inner Mode）完整实现计划

## 需求分析

为 37 个子纪元（SubEra）各自添加里模式（里模式）配置。当前系统有两个全局里模式开关：里武侠和里志怪，它们与时代选择无关，仅依赖"古代体系选择"（武侠/志怪/双修）。

新需求：每个 SubEra 定义自己的里模式变体，选择时代后自动激活对应的里模式，同时保留原有全局开关的向后兼容。

## 实现方案

### Phase 1: 元数据定义（models/eraTheme.ts）

**1.1 新增 `EraLiMode` 接口**

```typescript
export interface EraLiMode {
    /** 里模式名称，如 "里武侠"、"里赛博"、"里星际" */
    name: string;
    /** 简短描述，如 "表里双修、武根系统" */
    description: string;
    /** 核心规则提示词（完整注入内容） */
    rules: string;
    /** 对应的 GameConfig 开关字段名，如 "启用里武侠模式" */
    configKey?: string;
    /** 里模式主题色（用于 UI 高亮） */
    themeColor?: string;
}
```

**1.2 扩展 `EraNode` 接口**

在 `EraNode` 中新增：
```typescript
liMode?: EraLiMode;
```

**1.3 为 37 个 SubEra 添加 liMode**

按时代分类的里模式设计：

| 时代前缀 | 里模式名称 | 核心规则主题 |
|---|---|---|
| `ancient_*_wuxia` | 里武侠 | 表里双修、武根系统（复用现有 里武侠 规则） |
| `ancient_*_zhiguai` | 里志怪 | 阴阳相克、因果系统（复用现有 里志怪 规则） |
| `ancient_eastern_intrigue` | 里宫廷 | 权谋暗面、色欲政治 |
| `ancient_western_myth` | 里神话 | 神人交媾、半神血脉 |
| `primordial_*` | 里图腾 | 图腾仪式、原始繁衍 |
| `modern_*` | 里谍战 | 情报色诱、双面间谍 |
| `contemporary_*` | 里都市 | 都市暗面、权力游戏 |
| `near-future_*` | 里赛博 | 义体改造、神经交感 |
| `far-future_*` | 里超维 | 意识融合、维度交叠 |
| `post-human_*` | 里超验 | 纯意识融合、形态超越 |
| `apocalypse_*` | 里废土 | 生存繁衍、部落新秩序 |
| `dieselpunk_*` | 里柴油 | 机械狂热、血肉改造 |
| `solarpunk_*` | 里生态 | 自然融合、生命循环 |

**1.4 更新 `makeNode` 的 extra 参数类型**

将 `liMode` 加入 `Partial<Pick<EraNode, ...>>` 列表。

### Phase 2: resolveEraNode 扩展

**2.1 在 resolveEraNode 返回值中新增 liMode**

```typescript
liMode: EraLiMode | undefined;
```

liMode 采用"节点自身优先，否则继承父节点"的策略（与 openingScenes 类似，不做跨层合并，仅取第一个有值的祖先）。

### Phase 3: 提示词注入层

**3.1 新建 `prompts/runtime/eraLiMode.ts`**

```typescript
export function 构建子纪元里模式注入(eraId: string | null | undefined): string | null
```

- 调用 `resolveEraNode(eraId)` 获取 liMode
- 如果有值，返回格式化注入块
- 如果没有值，返回 null

**3.2 在 systemPromptBuilder.ts 中注入**

在 `otherPrompts` 数组中添加：
```typescript
获取子纪元里模式注入(eraId)
```

注入位置：在里武侠/里志怪全局注入之后，作为 SubEra 特定的里模式补充。

**3.3 更新 promptFeatureToggles.ts**

- 新增 `case 'liMode':` 分支，检查 resolved liMode 的 configKey 是否与 GameConfig 中的对应开关匹配
- 如果没有 configKey（SubEra 独有里模式），默认启用

### Phase 4: UI 层（NewGameWizard）

**4.1 NewGameWizardContent.tsx**

当前里模式 UI（lines 340-382）显示固定的里武侠/里志怪开关。改为：

- 如果当前选择的 SubEra 有 `liMode`，显示该 SubEra 的里模式开关
- 显示里模式名称和描述
- 开关颜色使用 liMode.themeColor
- 保留里武侠/里志怪全局开关作为"额外里模式"（仅当 古代体系选择 包含对应体系时显示）

**4.2 useNewGameWizardState.ts**

- 当 SubEra 选择变化时，自动检测是否有 `liMode`
- 如果有，自动设置对应的里模式状态
- 在角色数据创建时（line 413-414），根据 SubEra liMode 添加对应属性

**4.3 时代选择联动**

在 EraSelector 中，选择 SubEra 后：
- 如果该 SubEra 有 liMode，在 EraPreviewCard 中显示里模式预览
- 点击确认后，里模式状态自动同步到 NewGameWizard

### Phase 5: 向后兼容

- 保留 `GameConfig.启用里武侠模式` 和 `GameConfig.启用里志怪模式`
- 现有玩家的存档不受影响
- 新增的 SubEra liMode 作为"自动激活"层，与全局开关并行
- promptFeatureToggles 中 `liwuxia` 和 `lizhiguai` case 保持不变

## 文件变更清单

| 文件 | 变更类型 | 说明 |
|---|---|---|
| `models/eraTheme.ts` | 修改 | 新增接口 + 37 个 SubEra 的 liMode 数据 |
| `prompts/runtime/eraLiMode.ts` | 新增 | 里模式提示词构建函数 |
| `hooks/useGame/systemPromptBuilder.ts` | 修改 | 注入里模式提示词 |
| `utils/promptFeatureToggles.ts` | 修改 | 新增 liMode feature toggle |
| `components/features/NewGame/NewGameWizardContent.tsx` | 修改 | UI 里模式开关动态化 |
| `components/features/NewGame/useNewGameWizardState.ts` | 修改 | 状态联动 |
| `components/features/EraSelector/EraPreviewCard.tsx` | 修改 | 显示里模式预览 |

## 复杂度评估

- **High**: Phase 1 — 37 个 SubEra 的 liMode 规则编写（内容创作，非技术难点）
- **Medium**: Phase 4 — UI 联动逻辑
- **Low**: Phase 2/3/5 — 技术接入

## 风险

- liMode rules 提示词质量直接影响 AI 叙事效果，需参考现有 里武侠/里志怪 的写法
- 37 个里模式不可能一次性写出完美规则，建议先完成框架 + 核心 10 个 SubEra，其余用通用模板
