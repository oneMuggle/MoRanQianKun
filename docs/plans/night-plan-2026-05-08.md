# 夜间实施方案 — 2026-05-08

**分支:** `nightly/2026-05-07` (刚 rebase from main)
**构建状态:** ✅ 通过 (已安装 zustand 依赖)
**待提交:** `package-lock.json`

---

## 一、现状概览

### 已完成 (Phase 0 + 1.6)
- Vitest 测试框架 + Error Boundary + CI lint check
- `storyResponseParser` 去重
- `sendWorkflow.ts` 已拆分为 `hooks/useGame/sendWorkflow/` 子目录 (index.ts 953行 + 多个子模块)

### 待处理大型文件 (高价值目标)

| 文件 | 行数 | 复杂度 | 备注 |
|------|------|--------|------|
| `components/features/Social/ImageManagerModal.tsx` | 3521 | 🔴 High | 最大文件，UI+逻辑混合 |
| `hooks/useGame/systemPromptBuilder.ts` | 1763 | 🔴 High | 提示词构建核心 |
| `hooks/useGame/opening/openingStoryWorkflow.ts` | 1493 | 🟡 Med | 开局工作流，已在 opening/ 子目录 |

### 工具函数重复情况
- `normalizeCanonicalGameTime` — 定义于 `time/timeUtils.ts:65`，被 **21+ 文件** 引用
- `规范化文本` — 定义于 `utils/stringNormalizers.ts:13`，但 `time/timeUtils.ts` 等处有类似重复实现

---

## 二、今夜推荐任务

### Task 1: Phase 1.7 — 字符串规范化工具统一 (低风险)

**Objective:** 将 `normalizeCanonicalGameTime` 及相关时间规范化函数移入 `utils/stringNormalizers.ts`，消除跨文件重复

**文件涉及:**
- `hooks/useGame/time/timeUtils.ts` — 定义 `normalizeCanonicalGameTime` (约 40 行)
- `utils/stringNormalizers.ts` — 已有 `规范化文本`、`规范化标题候选行` (31 行)
- 21+ 个引用 `normalizeCanonicalGameTime` 的文件需要更新 import 路径

**具体步骤:**
1. 读取 `hooks/useGame/time/timeUtils.ts` 中的 `normalizeCanonicalGameTime` 实现
2. 将其 (连同 `标准时间串转结构化`、`结构化时间转标准串`、`环境时间转标准串` 如果合适) 添加到 `utils/stringNormalizers.ts`
3. 更新 `hooks/useGame/time/timeUtils.ts` 从 stringNormalizers.ts 重新导出
4. 运行 `grep -r "normalizeCanonicalGameTime" hooks/ --include="*.ts" | wc -l` 确认引用数
5. 批量更新各文件的 import 路径 (可以用 sed 批量处理或逐个修改)
6. 运行 `npm run build` 验证

**估计复杂度:** 🟢 Low
- 纯工具函数，无业务逻辑依赖
- 已被21+文件引用，统一后更易于维护
- 风险：import 路径更新可能遗漏少数文件 → 用构建验证

**预期收益:**
- 消除重复代码 (~40 行重复)
- 集中规范化逻辑，便于后续扩展
- 为后续 TypeScript strict mode 准备

---

### Task 2: Phase 1.3 — systemPromptBuilder.ts 拆分 (高价值)

**Objective:** 将 1763 行的 `systemPromptBuilder.ts` 拆分为 `hooks/useGame/systemPromptBuilder/` 子目录

**文件涉及:**
- `hooks/useGame/systemPromptBuilder.ts` (1763 行)
- 预计产出: 5-6 个子文件，最大 ~400 行

**具体步骤:**
1. 分析 systemPromptBuilder.ts 的结构:
   - `构建系统提示词 as 构建系统提示词工作流` (主函数)
   - `运行时提示词状态` 类型定义
   - `系统提示词上下文片段` 类型定义
   - 多个工具函数 (构建XXX提示词)
2. 拆出子模块:
   - `index.ts` — 主入口 + 类型导出 (~300行)
   - `promptFragments.ts` — 各提示词片段构建逻辑
   - `eraThemeInjector.ts` — 时代主题注入
   - `worldbookInjector.ts` — 世界书注入
   - 其他按功能分割
3. 创建 `hooks/useGame/systemPromptBuilder/` 目录
4. 逐个创建子文件，逐步验证 `npm run build`
5. 删除原 `systemPromptBuilder.ts`

**估计复杂度:** 🟡 Medium
- 纯重构，无功能变更
- 依赖较多 (prompts/, utils/, types/)
- 建议逐个子模块拆分，每步验证

**预期收益:**
- 将 1763 行拆分为 ~6 个各 300 行以内的文件
- 改善可维护性，便于单独测试各提示词模块

---

### Task 3: Phase 1.4 — openingStoryWorkflow.ts 拆分 (中等)

**Objective:** 将 1493 行的 `opening/openingStoryWorkflow.ts` 拆分为更小的子模块

**文件涉及:**
- `hooks/useGame/opening/openingStoryWorkflow.ts` (1493 行)

**具体步骤:**
1. 分析 openingStoryWorkflow.ts 结构:
   - 开局变量生成初始化 (`开局变量生成附加提示词`)
   - 开局规划初始化 (`开局规划初始化附加提示词`)
   - 开局世界演变初始化 (`开局世界演变初始化附加提示词`)
   - 开局场景时代注入 (`构建时代开局场景注入`)
2. 已有子模块: `variableModelWorkflow.ts`, `variableCalibrationMerge.ts`, `worldEvolutionUtils.ts`
3. 拆出:
   - `opening/index.ts` — 主入口
   - `opening/initPhases.ts` — 三个初始化阶段逻辑
   - `opening/eraSceneInjection.ts` — 时代开局场景注入
4. 更新 `hooks/useGame.ts` 的 import 路径

**估计复杂度:** 🟡 Medium
- 已在 `opening/` 子目录中，结构较清晰
- 主要拆分主文件内的长函数

**预期收益:**
- 将 1493 行拆分为 4-5 个文件
- 与 Phase 1.3 的 systemPromptBuilder 拆分模式类似

---

## 三、今夜执行计划 (3-4 小时)

```
Phase 1 (30 分钟)
└── Task 1: stringNormalizers.ts 扩展 + normalizeCanonicalGameTime 迁移
    ├── [ ] 读取 time/timeUtils.ts 中的 normalizeCanonicalGameTime 实现
    ├── [ ] 添加到 utils/stringNormalizers.ts
    ├── [ ] 更新 time/timeUtils.ts 重新导出
    ├── [ ] 批量更新 21+ 文件的 import
    └── [ ] npm run build 验证

Phase 2 (60-90 分钟)
└── Task 2: systemPromptBuilder.ts 拆分
    ├── [ ] 分析文件结构，确定拆分点
    ├── [ ] 创建 promptBuilder/ 目录
    ├── [ ] 逐个子模块创建 + npm run build 验证
    └── [ ] 删除原文件 + 最终验证

Phase 3 (60 分钟)
└── Task 3: openingStoryWorkflow.ts 拆分
    ├── [ ] 分析文件结构
    ├── [ ] 创建子模块 (initPhases, eraSceneInjection 等)
    └── [ ] npm run build 验证

(如果时间充裕)
Phase 4 (60 分钟)
└── Task 4: Phase 1.1 ImageManagerModal.tsx 分析
    └── 准备 Phase 1.1 的详细拆分方案 (不下代码)
```

---

## 四、风险与注意事项

1. **Import 路径更新** — Task 1 中批量更新 import 时，确保不遗漏
2. **构建验证** — 每个 Phase 后立即 `npm run build` 验证
3. **不要修改业务逻辑** — 今夜纯重构，无功能变更
4. **分支状态** — `nightly/2026-05-07`，`package-lock.json` 待提交

---

## 五、后续待办 (供明晚继续)

1. Phase 1.1: ImageManagerModal.tsx (3521 行) — 最大文件，最高价值
2. Phase 0.2: TypeScript strict mode — 横跨全代码库，高风险
3. 其他待识别的重复工具函数