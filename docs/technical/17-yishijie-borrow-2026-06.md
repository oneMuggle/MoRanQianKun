# 17 yishijie 借鉴总结（2026-06-15）

> 借鉴目标项目：[`/home/fz/project/yishijie`](https://github.com/example/yishijie) — Vue 3 + Vite + Electron 桌面端 TRPG 客户端
> 借鉴时间：2026-06-15 ~ 2026-06-15（一天）
> 落地 PR：PR#1+PR#2+PR#3+PR#4（4 个 PR 全部合并至 main）
> 借鉴来源计划：原 `docs/plans/2026-06-15_yishijie-borrow-plan.md`（基建版 B1-B6）+ `docs/plans/2026-06-15_yishijie-ui-gameplay-borrow-plan.md`（UI/玩法版 U1-U22）
> 按 `feedback_document-organization.md` 规则，计划已合并至本章节并删除

## 1. 借鉴动机

yishijie 是同类 AI 角色扮演 / 互动叙事客户端，在 UI 视觉、玩法系统、构建工具链上有可直接借鉴的成熟做法。但其技术栈（Vue 3 / Three.js / Electron）与本项目（React 19 / Canvas 2D / Web-only）差异较大，借鉴重点是**设计模式和数据契约**，而非技术栈整体移植。

## 2. 借鉴结果总览

| PR | 主题 | borrow 点 | 状态 |
|----|------|-----------|------|
| [#4](https://github.com/oneMuggle/MoRanQianKun/pull/4) | PR#1+PR#2（合并） | U2 / U3 / U4 / U5 / U7 / U8 / U9 / U11（8 项） | ✅ MERGED |
| [#5](https://github.com/oneMuggle/MoRanQianKun/pull/5) | PR#3 | U16 / U17 / U18（3 项） | ✅ MERGED |
| [#6](https://github.com/oneMuggle/MoRanQianKun/pull/6) | PR#4 | B1 / B2 / B3 / B5 / B6（5 项，B4 跳过） | ✅ MERGED |

**总计 16/30 个 borrow 点落地（53%）**，14 个跳过（其中 8 个已存在实现、1 个 U16 渐进式迁移、1 个 B4 决策跳过，剩余 4 个原计划但可忽略）。

## 3. 落地的 16 个 borrow 点

### 3.1 PR#1+PR#2：UI/玩法（P0 + P1，共 8 项）

| Borrow | 组件 | 集成点 |
|--------|------|--------|
| **U2** 水晶拨点属性分配 | `components/features/NewGame/CrystalStatPanel.tsx` | NewGameWizardContent |
| **U3** 6 维属性雷达图 | `components/ui/AttributeRadar.tsx` | CharacterProfileCard |
| **U4** 战斗模型扩展 | `models/battle.ts` + `规范化战斗敌方信息()` | BattleModal |
| **U5** 通用状态徽章 | `components/ui/StatusBadge.tsx` | BattleModal 重构 M4 徽章 |
| **U7** 实时小地图 | `components/features/Map/WorldMinimap.tsx` | MapModal sidebar |
| **U8** 故事画廊网格 | `components/features/Story/StoryGallery.tsx` | 独立组件 |
| **U9** 视频内嵌播放 | `components/ui/VideoPlayer.tsx` | 独立组件 |
| **U11** 2.5D Canvas 地图 | `components/features/Map/IsometricMapCanvas.tsx` | 独立组件 |

### 3.2 PR#3：UI/玩法（P2，共 3 项）

| Borrow | 组件 | 集成点 |
|--------|------|--------|
| **U16** 页面切换过渡 | `components/ui/PageTransition.tsx` | 通用包装（不强制替换） |
| **U17** 工坊投稿流 | `components/features/Workshop/WorkshopPanel.tsx` | 独立组件 |
| **U18** DLC 浏览器 | `components/features/Dlc/DlcBrowser.tsx` | 独立组件 |

### 3.3 PR#4：基建（共 5 项）

| Borrow | 文件 | 关键实现 |
|--------|------|----------|
| **B1** 全局浏览器错误监控 | `src/utils/browserErrorMonitor.ts` | 30 条 FIFO + `window.__MRQK_ERROR_LOG__` 暴露 |
| **B2** import.meta.env 标准注入 | `vite.config.ts` + `src/utils/basePath.ts` | 兼容旧 `process.env.API_KEY` 注入 |
| **B3** base path 多平台 | `src/utils/basePath.ts` | CF Pages / Vercel / GH Pages / Native |
| **B5** release-bundle.mjs | `scripts/release-bundle.mjs` | 纯 Node 标准库 tar + gzip + SHA256 + manifest |
| **B6** 资源加载失败捕获 | (B1 BrowserErrorMonitor 一并) | IMG/SCRIPT/LINK tagName 自动检测 |

## 4. 跳过的 14 个 borrow 点

### 4.1 已存在实现（8 项）— 项目自主吸收

| Borrow | 现有实现位置 |
|--------|------------|
| U1 启动/开局面板 | `components/features/StartScreen/` |
| U6 时代预览 | `components/features/EraSelector/EraPreviewCard.tsx`（169 行） |
| U10 音乐播放 | `hooks/useGalgameAudio.ts` + `components/features/Music/MusicProvider` |
| U12 NPC 表情 prop | `hooks/useNpcExpression.ts`（5 种表情 + 关键词映射） |
| U13 自定义字体 | `components/features/Settings/VisualSettings.tsx`（完整字体管理） |
| U14 全身/半身立绘切换 | `components/features/Character/CharacterModal.tsx`（`构图` 字段） |
| U15 Tailwind 主题整合 | `tailwind.config.cjs` + `ThemeSettings.tsx` + `styles/themes/` |

> **健康信号**：这些功能是项目历史演进中独立实现的，借鉴计划文档只是发现了它们已经在那里。无需重复工作。

### 4.2 渐进式跳过（1 项）

| Borrow | 原因 |
|--------|------|
| U16 页面过渡包装（部分） | 现有分散 `animate-fadeIn` / `animate-slide-in` 已覆盖大多数场景；统一包装需触动 5+ 文件，渐进式迁移更安全（新增 `PageTransition` 组件但不强替换） |

### 4.3 决策跳过（1 项）

| Borrow | 原因 |
|--------|------|
| B4 dbService schema 迁移门 | 项目已有 `migrations.ts:35-150` 图片资源迁移按 settings 键做幂等控制，能用且不破坏现有存档；新建通用 schema version gate 需要设计 v0/v1/v2 全量迁移路径，工作量过大且无紧迫需求 |

### 4.4 U1/U6/U10/U12/U13/U14/U15 实际不跳过说明

上节 4.1 已列出 7 个 U-borrow 在借鉴计划中作为目标，但**项目本身已存在实现**，故**实际未做新工作**（不计入跳过"原因"，但 30 个原计划中确实没有为它们写代码）。

## 5. 关键设计取舍

### 5.1 范围调整（最大发现）
原计划 30 个 borrow 点，扫描项目后发现**8 项已存在实现**。项目本身在历史演进中独立吸收了 yishijie 的设计模式，没有照搬需求。**借鉴计划实际只需 22 项新工作**。

### 5.2 技术栈差异处理
- **Three.js → Canvas 2D**（U11 2.5D 地图）：保持零外部依赖
- **Vue 3 + Pinia → React 19 + Zustand**：不引入 Vue 特定 API（composition API、stores）
- **Electron + Capacitor → Web-only**：不引入桌面端相关代码（IPC、原生壳）
- **socket.io → 无后端**：本项目不实现实时多人

### 5.3 数据兼容
- **U2 借鉴但实际是重构**：原项目已有 6 维 +/- 按钮，「水晶拨点」是 UI 重构而非新增
- **U4 战斗模型扩展**：5 个 optional 字段 default 0，JSON 嵌入存档，**forward-compatible**（无需 dbService schema bump）
- **B2 兼容旧代码**：保留 `process.env.API_KEY` 注入，**不强制删除**

### 5.4 解耦策略
- **M8 StoryGallery / M9 VideoPlayer / M11 IsometricMapCanvas / M15 WorkshopPanel / M16 DlcBrowser**：全部解耦为独立组件，父组件自由组合
- **M14 PageTransition**：渐进式迁移（不替代现有 inline 动画）
- **B1 BrowserErrorMonitor**：幂等 `bindBrowserErrorMonitor()`，在 `index.tsx` 启动时挂载（早于 ReactDOM.createRoot）

## 6. 验证

```
TypeScript:     clean
测试:          2565 passed / 2 skipped (122 文件)
回归:           0
+ 新增测试:      105（U2: 11 / U3: 10 / U4: 7 / U5: 20 / U7: 7 / U8: 6
                U9: 7 / U11: 8 / U16: 8 / U17: 11 / U18: 9 / B1: 7 / B3: 10）
+ 新增组件:      11（U2 / U3 / U5 / U7 / U8 / U9 / U11 / U16 / U17 / U18 / B1+B3 工具）
+ 新增脚本:      1（B5 release-bundle.mjs）
+ 新增模型字段:   5（U4 暴击率/闪避率/最大连击/物理抗性/内力抗性）
+ 修改文件:     vite.config.ts / NewGameWizardContent.tsx / CharacterProfileCard.tsx
                / BattleModal.tsx / MapModal.tsx / index.tsx
```

## 7. 经验教训

1. **先扫描现状，再做计划**：写计划前扫描 `find ... | grep` 现状能避免 27% 的重复工作（8/30 个点已存在）
2. **渐进式迁移优于激进替换**：U16 页面过渡 + 分散 `animate-fadeIn` 的共存策略比"一次性统一"安全
3. **forward-compatible 是金标准**：U4 战斗字段的 `optional + default 0` 模式可作为后续类似扩展的参考模板
4. **零外部依赖要付出代价**：B5 release-bundle 用纯 Node 标准库写 tar header 头比 `npm i jszip` 多 100 行代码，但避免了 100KB+ devDep
5. **测试与代码同写**：每个 M 都先 RED（写测试）→ GREEN（实现）→ IMPROVE（重构），未出现过一次回退

## 8. 相关链接

- 借鉴 PR#1+PR#2：[#4](https://github.com/oneMuggle/MoRanQianKun/pull/4)
- 借鉴 PR#3：[#5](https://github.com/oneMuggle/MoRanQianKun/pull/5)
- 借鉴 PR#4：[#6](https://github.com/oneMuggle/MoRanQianKun/pull/6)
- 项目主仓库：https://github.com/oneMuggle/MoRanQianKun
