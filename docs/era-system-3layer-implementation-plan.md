# 墨染江湖·三层时代体系完整实施方案

## 背景

当前 `models/eraTheme.ts` 已实现 **Epoch → Era → SubEra 三层树状结构**，共定义 **22 个 SubEra**，但：
- 只有 **5 个 SubEra 有完整素材**（场景图 + BGM）
- 17 个 SubEra **只有 ID 和基础元数据**，缺少 `bgmTags`、`artStyle`、`uiCopy` 等完整定义
- 时代选择器、时代感知的世界生成、时代特定的 UI 呈现 **尚未完整实现**

---

## 一、现状盘点

### 1.1 已有素材的 SubEra（5 个）✅

| SubEra ID | 名称 | 场景图 | BGM | 状态 |
|-----------|------|--------|-----|------|
| ancient_eastern_wuxia | 武侠 | 6 张 | 1 首 | ✅ 完整 |
| modern_eastern_republic | 民国风云 | 6 张 | 1 首 | ✅ 完整 |
| contemporary_urban | 都市 | 6 张 | 1 首 | ✅ 完整 |
| near-future_cyberpunk | 赛博朋克 | 6 张 | 1 首 | ✅ 完整 |
| far-future_space_opera | 星际科幻 | 6 张 | 1 首 | ✅ 完整 |

### 1.2 缺失素材的 SubEra（17 个）❌

#### 古代（ancient）- 6 个 SubEra

| SubEra ID | 名称 | 需要素材 |
|-----------|------|----------|
| ancient_eastern_zhiguai | 志怪 | 6 场景图 + BGM + uiCopy |
| ancient_eastern_myth | 神话 | 6 场景图 + BGM + uiCopy |
| ancient_western_greek | 古希腊 | 6 场景图 + BGM + uiCopy |
| ancient_western_roman | 古罗马 | 6 场景图 + BGM + uiCopy |
| ancient_western_medieval | 中世纪 | 6 场景图 + BGM + uiCopy |

#### 近代（modern）- 5 个 SubEra

| SubEra ID | 名称 | 需要素材 |
|-----------|------|----------|
| modern_eastern_meiji_taisho | 明治·大正 | 6 场景图 + BGM + uiCopy |
| modern_western_victorian | 维多利亚 | 6 场景图 + BGM + uiCopy |
| modern_western_jazz_age | 爵士时代 | 6 场景图 + BGM + uiCopy |
| modern_western_postwar | 战后重建 | 6 场景图 + BGM + uiCopy |

#### 现代（contemporary）- 2 个 SubEra

| SubEra ID | 名称 | 需要素材 |
|-----------|------|----------|
| contemporary_rural | 乡村 | 6 场景图 + BGM + uiCopy |
| contemporary_post_apocalyptic | 末日废土 | 6 场景图 + BGM + uiCopy |

#### 近未来（near-future）- 2 个 SubEra

| SubEra ID | 名称 | 需要素材 |
|-----------|------|----------|
| near-future_dystopia | 反乌托邦 | 6 场景图 + BGM + uiCopy |
| near-future_space_colonization | 太空殖民 | 6 场景图 + BGM + uiCopy |

#### 远未来（far-future）- 2 个 SubEra

| SubEra ID | 名称 | 需要素材 |
|-----------|------|----------|
| far-future_cyborg | 赛博格 | 6 场景图 + BGM + uiCopy |
| far-future_virtual_reality | 虚拟现实 | 6 场景图 + BGM + uiCopy |

---

## 二、实施阶段

### 阶段 1：数据模型完善（优先级 P0）

**目标**：为 17 个缺失的 SubEra 补充完整元数据

#### 1.1 补充元数据定义

为每个缺失的 SubEra 补充：
- `bgmTags`: BGM 风格标签数组
- `artStyle`: 美术风格参考描述
- `uiCopy`: 完整的 UI 文案（40+ 条）

#### 1.2 创建时代素材清单

为每个 SubEra 生成：
- 场景图需求清单（6 个代表性场景）
- BGM 风格需求描述
- 预设数据需求说明

### 阶段 2：功能层实现（优先级 P1）

**目标**：实现时代感知的游戏逻辑

#### 2.1 时代选择器

- 在新建游戏流程中添加时代选择步骤
- 支持 Epoch / Era / SubEra 三级导航选择
- 保存用户选择的 SubEra 到存档设置

#### 2.2 时代感知的世界生成

- 根据 SubEra 动态加载时代特定的提示词
- 时代特定的 NPC 生成规则
- 时代特定的物品/武学/背景设定

#### 2.3 时代特定的游戏机制

- 古代：江湖门派、武功秘籍、江湖恩怨
- 现代：公司与帮派、金融系统、枪械
- 未来：科技树、义体改造、虚拟经济

### 阶段 3：UI 层实现（优先级 P2）

**目标**：实现时代主题的视觉呈现

#### 3.1 时代选择界面

- 时代树状导航组件
- 时代预览卡片（显示配色、美术风格）
- 已选择时代的视觉预览

#### 3.2 时代主题动态 UI

- 根据 SubEra 的 `colors` 动态切换主题色
- 根据 `uiStyle.decorations` 应用视觉特效
- 根据 `typography` 切换字体

### 阶段 4：内容层填充（优先级 P3）

**目标**：为各 SubEra 补充实际素材

#### 4.1 素材生成

- 使用 AI 生成场景图
- 使用 AI 生成 BGM
- 补充预设天赋和背景数据

#### 4.2 素材管理

- 建立 `data/era_assets/{subera}/` 目录结构
- 创建 `manifest.json` 管理素材清单
- 实现素材懒加载

---

## 三、优先级排序

### P0 - 立即实施

1. **补充 17 个 SubEra 的 `bgmTags` 和 `artStyle`**
   - 文件：`models/eraTheme.ts`
   - 工作量：约 200 行定义
   - 风险：低，仅数据扩展

2. **补充 17 个 SubEra 的 `uiCopy`**
   - 文件：`models/eraTheme.ts`
   - 工作量：约 3000 行（每个 SubEra 约 40 条 × 2）
   - 风险：低，仅数据扩展

### P1 - 短期实施

3. **创建 SubEra 素材需求清单**
   - 文件：`docs/era-subera-resources.md`
   - 内容：每个 SubEra 的场景图清单、BGM 描述

4. **实现时代选择器组件**
   - 文件：`components/features/EraSelector/`
   - 功能：树状导航 + 预览

5. **实现时代感知的世界生成**
   - 文件：`prompts/runtime/worldGeneration.ts`
   - 功能：根据 SubEra 加载特定提示词

### P2 - 中期实施

6. **实现时代主题的动态 UI**
   - 文件：`hooks/useEraTheme.ts`、`styles/themes.ts`
   - 功能：动态主题色、字体、特效

7. **实现时代特定的预设数据**
   - 文件：`data/presets/era/`
   - 内容：各时代的专属天赋、背景

### P3 - 长期实施

8. **生成各 SubEra 的实际素材**
   - 使用 AI 生成场景图和 BGM
   - 建立素材管线

---

## 四、对开局设置的影响

### 4.1 新建游戏流程变化

**当前流程**：
```
开始游戏 → 选择天赋/背景 → 开始游戏
```

**新流程**：
```
开始游戏 → 选择 Epoch → 选择 Era → 选择 SubEra → 选择天赋/背景 → 开始游戏
```

### 4.2 存档数据结构变化

```typescript
// 新增字段
interface 游戏存档 {
  设置: {
    eraId: string;  // 例如 "ancient_eastern_wuxia"
  };
}
```

### 4.3 向后兼容性

- 旧存档无 `eraId` 字段，默认使用 `ancient_eastern_wuxia`（武侠）
- 时代选择为可选项，未选择时使用默认值

---

## 五、关键文件清单

| 文件路径 | 修改内容 | 优先级 |
|----------|----------|--------|
| `models/eraTheme.ts` | 补充 17 个 SubEra 的完整元数据 | P0 |
| `components/features/EraSelector/` | 新建时代选择器组件 | P1 |
| `prompts/runtime/worldGeneration.ts` | 时代感知的世界生成 | P1 |
| `hooks/useEraTheme.ts` | 新建时代主题 Hook | P2 |
| `styles/themes.ts` | 动态主题切换 | P2 |
| `data/presets/era/` | 各时代专属预设数据 | P2 |
| `docs/era-subera-resources.md` | SubEra 素材需求清单 | P1 |

---

## 六、实施检查清单

- [ ] 补充 17 个 SubEra 的 `bgmTags`
- [ ] 补充 17 个 SubEra 的 `artStyle`
- [ ] 补充 17 个 SubEra 的 `uiCopy`
- [ ] 创建 SubEra 素材需求清单文档
- [ ] 实现 EraSelector 组件
- [ ] 实现时代感知的世界生成
- [ ] 实现动态主题切换
- [ ] 创建各时代专属预设数据
- [ ] 生成实际素材（场景图、BGM）
