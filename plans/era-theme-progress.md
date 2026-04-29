# 三层时代架构 — 实施进度追踪

> 最后更新: 2026-04-29 21:10
> 分支: main
> 最新提交: Phase G-5 (里模式完整实现)

---

## Phase A: 元数据扩展 ✅ 已完成
**提交:** `6f6a2a5`

---

## Phase B: 树结构重组 ✅ 已完成
### B-1: contemporaryEpoch 重组 ✅ `a11725c`
### B-2: nearFutureEpoch + farFutureEpoch 重组 ✅ `bba2abf`
### B-3: 新建纪元 + 扩展 SubEra ✅ `307fdeb`
**结构总计:** 7 时代 × 13 纪元 × 36 子纪元

---

## Phase C: 新 SubEra 元数据定义 ✅ 已完成

### C-1: promptVars 填充 ✅ 已完成
**提交:** `3166ef2` — 全部 11 个缺失 SubEra 已补充

### C-2: openingScenes 开局场景池 ✅ 已完成
**提交:** `65d5891` — 全部 37 个 SubEra 已补充（每个 3 个场景）

### C-3: characterArchetypes 角色原型 ✅ 已完成
**提交:** `21a74c0` — 全部 37 个 SubEra 已补充（每个 3 个角色）

### C-4: writingSamples 文风示例 ✅ 已完成
**提交:** `42c057c` — 全部 37 个 SubEra 已补充（每个 2 个示例）

---

## Phase D: 提示词层接入 ✅ 已完成

### D-1: resolveEraNode 扩展 ✅ 已完成
**提交:** `3ff9d75` — 新增 promptVars/openingScenes/characterArchetypes/writingSamples/conflictTypes 返回字段

### D-2: systemPromptBuilder 接入 promptVars ✅ 已完成
**提交:** `a37bc06` — 新建 prompts/runtime/eraTheme.ts，注入 eraId 到系统提示词

### D-3: openingStoryWorkflow 接入 openingScenes ✅ 已完成
**提交:** `8e1dd85` — 新建 prompts/runtime/eraOpeningScene.ts，开场剧情随机选取时代场景

### D-4: 角色生成接入 characterArchetypes ✅ 已完成
**提交:** `fb1cbd2` — 角色原型注入开场初始化任务提示词

### D-5: 写作风格提示接入 writingSamples ✅ 已完成
**提交:** `a723bef` — 文风示例注入系统提示词

### D-6: 时代现实主义提示词接入 (eraRealism) ✅ 已完成
**提交:** `cc4cf58` — 现实主义约束接入系统提示词

---

## Phase E: 资源需求更新 ✅ 已完成
**提交:** pending

- 修正 SubEra 数量从 35→37
- 修正 ID 不匹配: `ancient_eastern_politics` → `ancient_eastern_intrigue`, `primordial_norse_saman` → `primordial_norse`, `post-human_pure_energy` → `post-human_energy`, `post-human_math_reality` → `post-human_math`
- 更新资源总量: 图片 180 张需生成, BGM 32 首需生成
- 添加 Phase D 完成标记

---

## 断点恢复

1. `git log --oneline -5` 确认最新提交
2. Phase D + E 已全部完成, 全部代码已提交

---

## Phase F: Bug 修复与数据补全

### F-1: CRITICAL Bug — worldGenerationWorkflow 缺少 eraId ✅ 已修复
- `hooks/useGame/worldGenerationWorkflow.ts:433` 添加 `eraId: worldConfig.时代配置ID || null`
- `类型 世界生成选项` 新增 `eraId?: string | null`

### F-2: HIGH Bug — resolveEraNode 兜底配色错误 ✅ 已修复
- `models/eraTheme.ts:4382-4384` 将 hardcoded `ancientEpoch` 改为 `path[0]`（节点自身所属 Epoch）

### F-3: 数据缺失 — 6 个 Era 缺少 promptVars ✅ 已修复
- **修复**: 为 6 个 Era 添加 era-appropriate promptVars
- **缺失 Era**: `ancient_eastern`, `ancient_western`, `modern_eastern`, `modern_western`, `contemporary_eastern`, `contemporary_western`

### F-4: 数据缺失 — conflictTypes 覆盖率不足 ✅ 已修复
- **修复**: 为 4 个未来 Era 添加 conflictTypes

---

## Phase G: 子纪元里模式完整实现 ✅ 已完成

### G-1: EraLiMode 接口 + EraNode 扩展 ✅ 已完成
- 新增 `EraLiMode` 接口：name, description, rules, configKey?, themeColor?
- `EraNode` 新增 `liMode?: EraLiMode` 字段
- `makeNode()` extra 参数新增 `liMode` 类型支持

### G-2: resolveEraNode 扩展 ✅ 已完成
- 返回值新增 `liMode: EraLiMode | undefined`
- liMode 采用"第一个有值的祖先"继承策略

### G-3: 提示词注入层 ✅ 已完成
- 新建 `prompts/runtime/eraLiMode.ts` — `构建子纪元里模式注入(eraId)`
- `hooks/useGame/systemPromptBuilder.ts` 在 otherPrompts 中注入
- `utils/promptFeatureToggles.ts` 新增 `limode` case 默认启用

### G-4: UI 联动 ✅ 已完成
- `useNewGameWizardState.ts` — 新增 `子纪元里模式` state + useEffect 自动同步
- `NewGameWizardContent.tsx` — 显示 SubEra 专属里模式卡片（自动激活，主题色高亮）
- 保留全局里武侠/里志怪开关作为"额外里模式"

### G-5: 数据填充 ✅ 已完成
- **37 个 SubEra 全部拥有 liMode**
- 13 种里模式主题类型：
  | 类型 | SubEra 示例 | 核心规则主题 |
  |---|---|---|
  | 里武侠 | ancient_eastern_wuxia | 表里双修、武根系统（复用 liWuxiaWorld.ts 完整规则）|
  | 里志怪 | ancient_eastern_zhiguai | 妖根灵视、因果系统（复用 liZhiguaiWorld.ts 完整规则）|
  | 里修仙 | ancient_eastern_cultivation | 炉鼎双修、阴阳大道 |
  | 里宫廷 | ancient_eastern_intrigue | 权谋暗面、色欲政治 |
  | 里神话 | ancient_eastern_myth + 6 个西方古代 | 神人交媾、半神血脉（各 SubEra 变体）|
  | 里图腾 | primordial_african/amer/norse | 巫术仪式、先祖血脉（各 SubEra 变体）|
  | 里谍战 | modern_eastern_* | 情报色诱、双面间谍 |
  | 里工业 | modern_western_* | 礼教束缚、阶级欲望 |
  | 里都市 | contemporary_urban/rural | 职场秘事/乡野风情 |
  | 里末日 | contemporary_apocalypse_* | 生存繁衍、废土部落 |
  | 里赛博 | near-future_cyberpunk/dystopia | 义体改造、神经交感 |
  | 里星际 | near-future/far-future_* | 殖民繁衍、基因优选 |
  | 里超维 | far-future/post-human_* | 意识融合、超越形态 |

### G-6: 向后兼容验证 ✅ 已完成
- TypeScript 编译通过（仅存预存的 RulesTab.tsx 错误）
- `构建子纪元里模式注入()` null/undefined 安全处理
- `resolveEraNode()` 正确返回 liMode
- 现有 `启用里武侠模式`/`启用里志怪模式` GameConfig 字段保留
- promptFeatureToggles 中 `liwuxia`/`lizhiguai` case 保持不变
