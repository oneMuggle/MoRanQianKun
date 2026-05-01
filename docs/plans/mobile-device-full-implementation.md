# 移动设备系统 — 完整实现计划

> 创建日期：2026-05-01
> 状态：待实施

---

## 概述

为墨色江湖项目实现完整的跨时代通讯设备（MobileDevice）系统。设备会根据当前游戏所处的时代（SubEra）自动适配设备形态、UI 风格、应用列表和能力属性。

## 当前状态

| 组件 | 状态 | 说明 |
|---|---|---|
| `models/mobileDevice.ts` | 完成 | 类型定义完整 |
| `models/eraDevice.ts` | 部分完成 | 19 个 Era 级配置，缺少 SubEra 映射 |
| `MobileDeviceModal.tsx` | 完成 | 模态框容器 |
| `MobileDevice.tsx` | 完成 | 设备外壳 |
| `MobileHome.tsx` | 完成 | 设备主页（应用网格） |
| `ModeToggle.tsx` | 完成 | 里/表模式切换 |
| `apps/ChatApp.tsx` | 占位符 | 仅显示"功能开发中" |
| `apps/MapApp.tsx` | 占位符 | 仅显示"功能开发中" |
| `apps/ContactsApp.tsx` | 占位符 | 仅显示"功能开发中" |
| `apps/ForumApp.tsx` | 占位符 | 仅显示"功能开发中" |
| `apps/NewsApp.tsx` | 占位符 | 仅显示"功能开发中" |
| `apps/AlbumApp.tsx` | 缺失 | 未创建 |
| `apps/ToolsApp.tsx` | 缺失 | 未创建 |
| `panels/` | 空目录 | 6 个面板组件待创建 |
| `eraStyles/` | 空目录 | 6 个时代 UI 组件待创建 |
| `hooks/` | 空目录 | 4 个 hooks 待创建 |
| `deviceAiWorkflow.ts` | 缺失 | AI 消息生成工作流 |

## 关键问题

### Era ID 映射不匹配

- `eraDevice.ts` 使用旧格式 ID：`ancient_eastern_wuxia`、`contemporary_urban` 等
- `eraTheme` SubEra 使用新格式 ID：`wuxia_1`、`urban_1`、`cyber_1` 等
- 当前 `getDeviceConfig(eraId)` 直接查找，SubEra ID 查不到任何配置
- 需要建立 SubEra → Era 设备映射

### SubEra 覆盖不全

- 已有 19 个 Era 级设备配置
- 约 230+ 个 SubEra 节点
- 约 15 个 Era 族系缺少设备配置（energy、dimension、math、jazz、meiji、late_qing、celtic、pa、pam、pn、spaceopera 等）

---

## Phase 1：修复 Era ID 映射

### 1.1 SubEra → Era 设备映射函数

在 `eraDevice.ts` 中添加 SubEra ID 到 Era ID 的映射表。

### 1.2 新增缺失的 Era 设备配置

为以下 Era 族系添加配置（约 15 个）：

| Era 族系 | 设备形态 | 设备名称 |
|---|---|---|
| energy（能源危机） | radio | 应急广播 |
| dimension（维度穿越） | jade_token | 时空玉简 |
| math（数学世界） | stone_tablet | 几何石板 |
| jazz（爵士时代） | mechanical | 爵士点唱机 |
| meiji（明治维新） | telegraph | 和风电报 |
| late_qing（晚清） | mechanical | 铜铃通讯器 |
| celtic（凯尔特神话） | scroll | 德鲁伊符文卷 |
| pa（古波斯） | scroll | 波斯信简 |
| pam（中美洲） | stone_tablet | 玛雅石刻 |
| pn（古近东） | stone_tablet | 楔形泥板 |
| spaceopera（太空歌剧） | data_terminal | 星际通讯器 |

### 1.3 修改 getDeviceConfig 函数

支持直接查找 → SubEra 映射 → eraTheme 树推导父节点的三级查找。

### 文件改动
- `models/eraDevice.ts` — 添加映射表 + 新增配置 + 修改查找函数

---

## Phase 2：实现 7 个 App 组件

每个 App 组件接收统一的 props 接口，实现对应功能页面。

### 2.1 ChatApp（群聊）— 显示群组列表、消息列表、AI 生成消息
### 2.2 MapApp（地图）— 时代化文本地图、位置标记
### 2.3 ContactsApp（通讯录）— NPC 联系人列表、搜索
### 2.4 ForumApp（论坛）— 帖子列表、帖子详情
### 2.5 NewsApp（资讯）— 新闻推送、时代化风格
### 2.6 AlbumApp（相册）— 图片网格、详情查看
### 2.7 ToolsApp（工具）— 设备信息、时代特色工具

### 文件改动
- `components/features/MobileDevice/apps/ChatApp.tsx` — 重写
- `components/features/MobileDevice/apps/MapApp.tsx` — 重写
- `components/features/MobileDevice/apps/ContactsApp.tsx` — 重写
- `components/features/MobileDevice/apps/ForumApp.tsx` — 重写
- `components/features/MobileDevice/apps/NewsApp.tsx` — 重写
- `components/features/MobileDevice/apps/AlbumApp.tsx` — 新建
- `components/features/MobileDevice/apps/ToolsApp.tsx` — 新建

---

## Phase 3：创建面板组件

6 个面板组件，用于 App 内部的二级/三级导航：

| 组件 | 用途 |
|---|---|
| `MessagePanel.tsx` | 消息列表面板 |
| `ChatDetailPanel.tsx` | 聊天详情面板 |
| `ContactDetailPanel.tsx` | 联系人详情面板 |
| `PostDetailPanel.tsx` | 帖子详情面板 |
| `ImagePreviewPanel.tsx` | 图片预览面板 |
| `SettingsPanel.tsx` | 设备设置面板 |

---

## Phase 4：创建时代 UI 风格组件

6 种时代 UI 风格，控制整体视觉表现：

| 组件 | 对应时代 | 视觉特征 |
|---|---|---|
| `AncientStyle.tsx` | ancient | 书法字体、水墨纹理、朱红印章 |
| `RetroStyle.tsx` | retro | 打字机字体、纸张纹理、黄铜色 |
| `ModernStyle.tsx` | modern | 无衬线字体、玻璃拟态、渐变色 |
| `TechStyle.tsx` | tech | 等宽字体、扫描线、霓虹色 |
| `HolographicStyle.tsx` | holographic | 全息投影效果、半透明层、彩虹色 |
| `ConsciousnessStyle.tsx` | consciousness | 意识流动效果、粒子动画、白光 |

---

## Phase 5：AI 消息生成工作流

新建 `hooks/useGame/deviceAiWorkflow.ts`，实现设备消息的 AI 生成逻辑：
- 根据时代 ID 获取时代主题配置
- 根据设备类型构建不同的 prompt
- 里模式下添加特殊规则
- 调用 AI 生成内容

---

## Phase 6：创建自定义 Hooks

| Hook | 用途 |
|---|---|
| `useDeviceMessages` | 管理设备消息状态、触发 AI 生成 |
| `useDeviceContacts` | 管理联系人列表、从 NPC 同步 |
| `useDeviceNavigation` | 管理 App 内导航状态、返回栈 |
| `useDeviceTheme` | 根据 eraId + mode 计算主题变量 |

---

## Phase 7：集成测试

- 构建验证：`npx vite build` 无报错
- 不同时代下设备形态正确
- 里/表模式切换正常
- 各 App 可以打开并显示内容
- AI 消息生成正常
- 主题色和 UI 风格随时代变化

---

## 预估工作量

| Phase | 文件数 | 代码行数 | 复杂度 |
|---|---|---|---|
| Phase 1: Era ID 映射 | 1 | ~300 | 低 |
| Phase 2: App 组件 | 7 | ~1500 | 中 |
| Phase 3: 面板组件 | 6 | ~800 | 中 |
| Phase 4: 时代 UI | 6 | ~600 | 中 |
| Phase 5: AI 工作流 | 2 | ~400 | 高 |
| Phase 6: Hooks | 4 | ~500 | 中 |
| Phase 7: 测试 | - | - | 低 |
| **合计** | **~26** | **~4100** | - |

---

## 依赖关系

```
Phase 1 (ID映射) → Phase 2 (App组件) → Phase 3 (面板)
                                         ├──→ Phase 4 (时代UI)
                                         └──→ Phase 5 (AI工作流)
                                              └──→ Phase 6 (Hooks)
                                                   └──→ Phase 7 (测试)
```

Phase 1 是基础，必须先完成。Phase 2-4 可部分并行。Phase 5 依赖 Phase 2 的 App 结构。Phase 6 依赖 Phase 2-5。Phase 7 最后执行。
