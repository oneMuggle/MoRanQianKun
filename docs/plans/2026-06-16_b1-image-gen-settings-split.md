# Phase B1：ImageGenerationSettings 拆分

> **创建日期**：2026-06-16
> **作者**：planner
> **关联**：[v3 路线图 Phase B](../plans/2026-06-16_project-optimization-v3.md)
> **目标**：把 `ImageGenerationSettings.tsx`（2205 行）拆为多个 panel 子组件，主文件 < 800 行

---

## 一、背景

`ImageGenerationSettings.tsx` 是 v3 路线图 Phase B 中最小、风险最低的拆分候选（仅被 `SettingsPanel.tsx` 引用 1 次）。文件内部已存在 6 个 `renderXxxPage()` 子函数（行 831-2200），结构天然适合按子函数拆分。

## 二、现状

**文件**：`src/components/features/Settings/Image/ImageGenerationSettings.tsx`（2205 行）

| 区段 | 行号 | 内容 |
|---|---|---|
| imports + 公共工具 | 1-185 | 8 个纯函数（`初始化模型列表`、`创建文生图配置模板` 等） |
| 主组件声明 | 187-380 | 17 useState + 4 useRef + useEffect + 10+ useMemo |
| `renderBasicPage` | 831-856 | 后端选择 + 基础连接测试 |
| `renderProviderPage` | 857-1277 | 模型列表、API key、NovelAI 自定义参数 |
| `renderTransformerPage` | 1278-1451 | 词组转化器（NAI/Custom） |
| `renderPresetsPage` | 1452-1606 | 画师串预设（npc/player/all） |
| `renderAutomationPage` | 1607-1877 | 重试、自动化、workflow 管理 |
| `renderPlayerPage` | 1878-2200 | 主角独立生图配置 |
| 主 return | 2200-2205 | `export default` |

**消费者**（仅 1 个）：
- `src/components/features/Settings/SettingsPanel.tsx`（props: `settings`, `onSave`）

## 三、目标结构

```
src/components/features/Settings/Image/
├── ImageGenerationSettings.tsx          # <800 行：state + 路由 + Provider
├── types.ts                              # ~80 行：Props、SettingsContext 类型
├── helpers.ts                            # ~150 行：原 1-185 行的纯函数
├── useImageGenState.ts                   # ~250 行：原 state 管理（含 useState/useMemo 提取）
├── useImageGenHandlers.ts                # ~200 行：原 onChange/onSave handlers
└── panels/
    ├── BasicPage.tsx                     # 原 renderBasicPage
    ├── ProviderPage.tsx                  # 原 renderProviderPage
    ├── TransformerPage.tsx               # 原 renderTransformerPage
    ├── PresetsPage.tsx                   # 原 renderPresetsPage
    ├── AutomationPage.tsx                # 原 renderAutomationPage
    └── PlayerPage.tsx                    # 原 renderPlayerPage
```

## 四、技术方案

### 4.1 状态管理：React Context（避免 prop drilling）

6 个 panel 共用主组件的 17 个 useState + 10+ useMemo + handlers。直接 props drilling 会出现长 prop 列表。

**方案**：
- 抽 `ImageGenContext` 包含 `{ form, setForm, modelOptions, ...all state }`
- 顶层 `<ImageGenProvider value={...}>` 包裹
- panel 用 `useImageGen()` hook 访问

### 4.2 拆分顺序（按依赖深度从浅到深）

1. **helpers.ts**：纯函数，无依赖（最先拆）
2. **types.ts**：类型定义，无运行时
3. **useImageGenState.ts**：state 初始化逻辑（含 useMemo 派生）
4. **useImageGenHandlers.ts**：onChange、onSave、test connection 等
5. **panels/BasicPage.tsx**：依赖最少，最先拆
6. **panels/PlayerPage.tsx**：内部 useMemo 最多（行 1831-1877），最复杂
7. **主文件改写**：route + Provider 包裹

### 4.3 公共类型提取

- `Props`：原 Props 接口
- `SettingsContextValue`：Context 类型
- `PanelProps`：每个 panel 的 props（统一从 Context 取值）
- 关键子类型：`WorkflowItem`、`TestResultModal`、`ModelOptions` 等

## 五、实施步骤

按 v3 路线图 Phase B 要求"3 次以上小 PR"：

### PR1：抽出公共层（helpers + types）— 不改 UI
- [ ] 创建 `types.ts`、`helpers.ts`
- [ ] 移动纯函数（行 31-185）
- [ ] 移动 type/interface 声明
- [ ] 主文件 import 改为从 helpers/types 取
- [ ] smoke test：组件 mount、save 不报错

### PR2：抽出 state 与 handlers
- [ ] 创建 `useImageGenState.ts`、`useImageGenHandlers.ts`
- [ ] 移动 state 初始化、useMemo 计算、onChange 处理
- [ ] 主文件用 hook 替代内联 state
- [ ] smoke test：state 变化正确传播

### PR3：拆分 panel（先 Basic + Presets）
- [ ] 创建 `panels/BasicPage.tsx`、`panels/PresetsPage.tsx`
- [ ] 引入 `ImageGenContext`
- [ ] 主文件改用 `<BasicPage />` 替代 `renderBasicPage()`
- [ ] smoke test：UI 渲染一致

### PR4：拆分剩余 panel
- [ ] `panels/ProviderPage.tsx`
- [ ] `panels/TransformerPage.tsx`
- [ ] `panels/AutomationPage.tsx`
- [ ] `panels/PlayerPage.tsx`（最复杂，最后做）
- [ ] 主文件 < 800 行
- [ ] smoke test + 视觉回归（用 Playwright snapshot 对比）

## 六、风险与缓解

| 风险 | 等级 | 缓解 |
|---|---|---|
| 状态丢失 / Context 值未传播 | HIGH | 每个 PR 跑 smoke test + Playwright 快照 |
| 主组件 useMemo 依赖循环 | MEDIUM | 用 useCallback 稳定 handler 引用 |
| 移动 useEffect 副作用丢失 | MEDIUM | PR1 跑全量测试套件 |
| `renderPlayerPage` 内部 useMemo（行 1831-1877）位置异常 | MEDIUM | 单独 commit 提取到独立 hook |
| 行 31-185 的纯函数被外部 import | LOW | 提前 `grep -r "from.*ImageGenerationSettings" src/` 验证 |

## 七、验收标准

- [ ] 主文件 < 800 行
- [ ] 6 个 panel 各自 < 500 行
- [ ] `npm run lint` 0 error
- [ ] `npm run typecheck` 0 error
- [ ] `npm run test` 现有用例全过
- [ ] Playwright 截图对比：UI 无视觉回归
- [ ] `SettingsPanel.tsx` 消费 API 不变（仍是默认导出 React.FC<Props>）

## 八、不在本 Phase 范围

- ❌ 重写为 useReducer（保留 useState，保留简单性）
- ❌ 拆 `Settings/Image/` 下其他 7 个 *NSFWSettings.tsx（等 B2）
- ❌ 重构 `SettingsPanel.tsx` 主入口
- ❌ 改 props 接口（保持向后兼容）

## 九、关联文件

- `src/components/features/Settings/SettingsPanel.tsx`（消费者）
- `src/components/features/Settings/Image/*.tsx`（同目录 7 个 NSFW settings，可参考命名约定）
- `docs/technical/13b-performance-modularization.md`（已有 chunk 拆分经验可参考）
