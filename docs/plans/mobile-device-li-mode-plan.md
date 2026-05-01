# 跨时代移动设备 — 正常模式与里模式适配方案

> 项目：墨色江湖：无尽武林
> 版本：v2.0
> 日期：2026-05-01
> 状态：设计方案，待审批

---

## 一、需求概述

在 `docs/mobile-device-cross-era-plan.md` 的基础上，为每个时代的移动设备增加**正常模式**与**里模式（里模式/暗面模式）**的差异适配。

### 1.1 核心原则

- **设备形态不变**：同一个子纪元的正常/里模式使用相同的物理设备（智能手机、玉简、数据终端等）
- **应用名称差异化**：里模式下，各 App 的名称、图标文案、内容风格跟随里模式主题变化
- **UI 主题色差异化**：里模式使用 `EraLiMode.themeColor` 作为主色调，与正常模式形成视觉区分
- **AI 提示词差异化**：设备中产生的消息、论坛帖子、资讯等内容生成时，注入里模式规则，影响 AI 输出风格
- **开关联动**：设备内的正常/里模式切换与全局 `启用子纪元里模式` 设置联动，同时设备内部可做额外的内容层切换

### 1.2 正常 vs 里模式差异矩阵

| 维度 | 正常模式 | 里模式 |
|------|---------|--------|
| 设备名称 | 标准名称（智能手机） | 同左（物理设备不变） |
| 应用名称 | 标准名称（地图、通讯录、群聊…） | 里模式化名称（见下方词典） |
| UI 主题色 | 时代标准配色 | 里模式 `themeColor`（偏暗/暧昧色调） |
| 内容风格 | 时代标准叙事 | 里模式规则驱动（亲密/欲望/隐秘剧情） |
| AI 提示词 | 标准注入 | 额外注入 `构建子纪元里模式注入` |
| 联系人标签 | 公开关系 | 可能标记隐秘关系 |

---

## 二、里模式设备应用名称词典

### 2.1 当代 · 里都市（霓虹暗欲、职场秘事、都市浮华）

| 功能 | 正常模式 | 里模式 |
|------|---------|--------|
| 设备名 | 智能手机 | 智能手机 |
| 地图 | 地图 | 夜行地图 |
| 通讯录 | 通讯录 | 关系网 |
| 群聊 | 群聊 | 私密聊天 |
| 论坛 | 论坛 | 都市秘闻 |
| 资讯 | 资讯 | 深夜推送 |
| 相册 | 相册 | 私密相册 |

**UI 主题色**：暗紫 `#6B2D8B` + 霓虹粉 `#FF6B9D`

### 2.2 当代 · 里乡土（乡野秘事、淳朴欲望、田园风情）

| 功能 | 正常模式 | 里模式 |
|------|---------|--------|
| 设备名 | 功能机/对讲机 | 功能机/对讲机 |
| 地图 | 手绘地图 | 乡野小路图 |
| 通讯录 | 通讯录 | 乡亲录 |
| 群聊 | 对讲频道 | 村口闲聊 |
| 论坛 | 广播公告 | 村头八卦 |
| 资讯 | 电台广播 | 乡野传闻 |

**UI 主题色**：暗绿 `#2D5A27` + 土黄 `#8B7355`

### 2.3 当代 · 里废土（生存繁衍、部落新秩序、末日狂欢）

| 功能 | 正常模式 | 里模式 |
|------|---------|--------|
| 设备名 | 对讲机/收音机 | 对讲机/收音机 |
| 地图 | 手绘地图 | 生存区域图 |
| 通讯录 | 通讯录 | 幸存者名录 |
| 群聊 | 对讲频道 | 加密频道 |
| 论坛 | 广播公告 | 黑市公告板 |
| 资讯 | 电台广播 | 废土电台 |

**UI 主题色**：锈红 `#8B3A3A` + 暗橙 `#B8652A`

### 2.4 当代 · 里黑色（蛇蝎美人、黑色电影、欲念深渊）

| 功能 | 正常模式 | 里模式 |
|------|---------|--------|
| 设备名 | 智能手机 | 智能手机 |
| 地图 | 地图 | 暗巷地图 |
| 通讯录 | 通讯录 | 线人录 |
| 群聊 | 群聊 | 暗线通讯 |
| 论坛 | 论坛 | 地下情报 |
| 资讯 | 资讯 | 黑色快讯 |

**UI 主题色**：炭黑 `#1A1A2E` + 琥珀黄 `#E2A03F`

### 2.5 当代 · 里嬉皮（自由恋爱、迷幻摇滚、反文化运动）

| 功能 | 正常模式 | 里模式 |
|------|---------|--------|
| 设备名 | 智能手机 | 智能手机 |
| 地图 | 地图 | 迷幻地图 |
| 通讯录 | 通讯录 | 灵魂伴侣录 |
| 群聊 | 群聊 | 公社圈子 |
| 论坛 | 论坛 | 地下刊物 |
| 资讯 | 资讯 | 反文化快报 |

**UI 主题色**：迷幻紫 `#9B59B6` + 橙红 `#E74C3C`

### 2.6 近未来 · 里赛博（义体改造、神经交感、赛博空间）

| 功能 | 正常模式 | 里模式 |
|------|---------|--------|
| 设备名 | 数据终端 | 数据终端 |
| 地图 | 全息地图 | 暗网节点图 |
| 通讯录 | 意识通讯录 | 神经契约 |
| 群聊 | 神经群聊 | 深网频道 |
| 论坛 | 数据论坛 | 暗网论坛 |
| 资讯 | 资讯过滤 | 黑市数据流 |

**UI 主题色**：赛博青 `#00FFFF` + 暗品红 `#8B008B`

### 2.7 近未来 · 里反乌托邦（监控之下、欲望反抗、体制突破）

| 功能 | 正常模式 | 里模式 |
|------|---------|--------|
| 设备名 | 数据终端 | 数据终端 |
| 地图 | 全息地图 | 监控盲区图 |
| 通讯录 | 意识通讯录 | 抵抗者名录 |
| 群聊 | 神经群聊 | 加密反抗频道 |
| 论坛 | 数据论坛 | 地下广播 |
| 资讯 | 资讯过滤 | 体制外真相 |

**UI 主题色**：监控红 `#CC0000` + 暗灰 `#2C2C2C`

### 2.8 近未来 · 里星际拓荒（殖民繁衍、异星基因、太空联姻）

| 功能 | 正常模式 | 里模式 |
|------|---------|--------|
| 设备名 | 数据终端 | 数据终端 |
| 地图 | 全息地图 | 殖民星域图 |
| 通讯录 | 意识通讯录 | 基因匹配录 |
| 群聊 | 神经群聊 | 殖民者共鸣 |
| 论坛 | 数据论坛 | 星际联姻网 |
| 资讯 | 资讯过滤 | 殖民地秘闻 |

**UI 主题色**：星光金 `#FFD700` + 深空蓝 `#0A0A23`

### 2.9 古代东方 · 里模式通用

| 功能 | 正常模式 | 里模式 |
|------|---------|--------|
| 设备名 | 传音玉简 | 传音玉简 |
| 地图 | 真气感应图 / 神识舆图 | 灵识暗图 |
| 通讯录 | 玉简录 / 仙盟录 | 暗契簿 |
| 群聊 | 传音阵 / 天机阁 | 密音阵 |
| 论坛 | 江湖榜 / 仙道榜 | 暗榜 |
| 资讯 | 驿站快讯 / 天机筒 | 秘闻录 |

**UI 主题色**：暗朱砂 `#5C1A1A` + 墨黑 `#1C1C1C`

---

## 三、技术实现方案

### 3.1 类型定义扩展

```typescript
// models/mobileDevice.ts 扩展

// 设备运行模式
export type DeviceMode = 'normal' | 'li';

// 设备状态（新增 mode 字段）
export interface DeviceState {
  isOpen: boolean;
  activeApp: MobileApp | null;
  mode: DeviceMode;  // 当前运行模式
}

// 应用定义扩展
export interface AppDefinition {
  id: MobileApp;
  normalName: string;    // 正常模式名称
  liName: string;        // 里模式名称
  icon: string;          // 图标标识
  component: React.ComponentType<AppProps>;
}
```

### 3.2 设备配置扩展

```typescript
// models/eraDevice.ts 扩展

export interface EraDeviceConfig {
  // ... 原有字段
  
  // 里模式覆盖
  liModeOverrides?: {
    appNames?: Partial<Record<MobileApp, string>>;  // 里模式应用名
    themeColor?: string;      // 里模式主题色
    uiStyleOverride?: string; // 里模式 UI 风格覆盖
  };
}
```

### 3.3 架构变更

```
components/features/MobileDevice/
├── MobileDevice.tsx              # 主容器（新增 mode 状态管理）
├── MobileDeviceModal.tsx         # 弹窗模式
├── MobileHome.tsx                # 主屏幕（根据 mode 渲染不同应用名）
├── apps/
│   ├── MapApp.tsx                # 接收 mode prop，切换内容风格
│   ├── ContactsApp.tsx
│   ├── ChatApp.tsx
│   ├── ForumApp.tsx
│   └── NewsApp.tsx
├── panels/
│   ├── AncientPanel.tsx
│   ├── ModernPanel.tsx
│   ├── NearFuturePanel.tsx
│   └── ...
├── eraStyles/
│   ├── ancientStyles.ts
│   ├── modernStyles.ts
│   └── ...
│   └── liModeStyles.ts           # 新增：里模式统一样式
├── hooks/
│   ├── useMobileDevice.ts        # 扩展：添加 mode 切换逻辑
│   └── useEraDevice.ts
└── ModeToggle.tsx                # 新增：正常/里模式切换组件
```

### 3.4 ModeToggle 组件设计

```typescript
// components/features/MobileDevice/ModeToggle.tsx

interface ModeToggleProps {
  mode: DeviceMode;
  onToggle: (mode: DeviceMode) => void;
  liModeEnabled: boolean;   // 全局里模式开关
  liModeName?: string;      // 例如 "里都市"
  themeColor?: string;      // 里模式主题色
}
```

- 位置：设备主屏幕顶部状态栏
- 样式：跟随设备时代风格（智能手机 = iOS 风格开关，玉简 = 符文切换）
- 行为：切换时保存偏好到 IndexedDB（按存档粒度）

### 3.5 提示词集成

```typescript
// hooks/useGame/mobileDeviceWorkflow.ts 新增

import { 构建子纪元里模式注入 } from '../../prompts/runtime/eraLiMode';

export function 构建设备消息提示词(
  eraId: string,
  deviceMode: DeviceMode,
  appType: MobileApp,
  context: DeviceContext
): string {
  const parts = [构建基础设备提示词(eraId, appType, context)];
  
  if (deviceMode === 'li') {
    const liInjection = 构建子纪元里模式注入(eraId, true);
    if (liInjection) {
      parts.push(`\n【里模式设备内容规则】${liInjection}`);
    }
  }
  
  return parts.join('\n');
}
```

### 3.6 状态管理集成

在 `hooks/useGame.ts` 中扩展：

```typescript
// 新增状态
const [设备模式, 设置设备模式] = useState<DeviceMode>('normal');
const [设备里模式名称, 设置设备里模式名称] = useState<string>('');

// 与全局设置联动
useEffect(() => {
  if (!state.gameConfig?.启用子纪元里模式) {
    设置设备模式('normal');  // 全局关闭时强制正常模式
  }
}, [state.gameConfig?.启用子纪元里模式]);
```

### 3.7 持久化

在 `services/dbService.ts` 的设备数据存储中增加 `mode` 字段：

```typescript
// 存档时保存设备模式偏好
{
  deviceMode: currentMode,
  lastActiveApp: activeApp,
  // ... 其他字段
}
```

---

## 四、UI 样式方案

### 4.1 里模式视觉特征

| 特征 | 正常模式 | 里模式 |
|------|---------|--------|
| 背景 | 时代标准背景色 | 暗色背景 + 主题色渐变 |
| 边框 | 标准边框 | 发光边框（glow 效果） |
| 文字 | 标准文字色 | 浅色文字 + 主题色高亮 |
| 图标 | 标准图标 | 图标加主题色滤镜 |
| 切换动画 | — | 模式切换时 0.3s 渐变过渡 |

### 4.2 CSS 变量方案

```css
/* styles/mobileDevice.css */

:root {
  /* 正常模式变量 */
  --device-bg: #ffffff;
  --device-text: #333333;
  --device-primary: #007bff;
  --device-border: #e0e0e0;
}

[data-device-mode="li"] {
  /* 里模式变量 — 由 JS 动态设置主题色 */
  --device-bg: #1a1a2e;
  --device-text: #e0e0e0;
  --device-primary: var(--li-theme-color, #6B2D8B);
  --device-border: #2a2a4a;
  --device-glow: 0 0 8px var(--li-theme-color, #6B2D8B);
}
```

---

## 五、实施阶段

### 5.1 Phase 1：基础架构 + 类型定义（P0）

| 任务 | 工作量 | 依赖 |
|------|--------|------|
| 扩展 `models/mobileDevice.ts`（DeviceMode, AppDefinition） | 小 | 无 |
| 扩展 `models/eraDevice.ts`（liModeOverrides） | 小 | 无 |
| 创建 `eraDeviceConfigs` 里模式覆盖配置 | 中 | 需确认各子纪元里模式名称 |
| 创建 `ModeToggle` 组件 | 小 | 无 |

### 5.2 Phase 2：现代都市里模式适配（P1）

| 任务 | 工作量 | 依赖 |
|------|--------|------|
| MobileHome 支持 mode 切换应用名 | 中 | Phase 1 |
| 5 个 App 组件接收 mode prop | 中 | Phase 1 |
| 里模式 CSS 主题色系统 | 小 | Phase 1 |
| 模式切换动画 | 小 | CSS 主题色 |

### 5.3 Phase 3：提示词集成（P1）

| 任务 | 工作量 | 依赖 |
|------|--------|------|
| `mobileDeviceWorkflow.ts` 创建 | 中 | Phase 1 |
| 里模式提示词注入逻辑 | 中 | 复用 `eraLiMode.ts` |
| AI 消息生成适配 | 中 | 提示词注入 |

### 5.4 Phase 4：其他时代里模式适配（P2）

| 任务 | 工作量 | 依赖 |
|------|--------|------|
| 古代东方里模式适配 | 中 | Phase 2 |
| 近未来里模式适配 | 中 | Phase 2 |
| 其他时代里模式适配 | 中 | Phase 2 |
| 各时代 ModeToggle 皮肤 | 小 | Phase 2 |

### 5.5 Phase 5：持久化 + 状态联动（P2）

| 任务 | 工作量 | 依赖 |
|------|--------|------|
| IndexedDB 设备模式持久化 | 小 | Phase 2 |
| 与全局 `启用子纪元里模式` 联动 | 小 | 无 |
| 存档/读档模式恢复 | 小 | 持久化 |

---

## 六、关键设计决策

### 6.1 设备模式 vs 全局里模式的关系

**决策**：设备内模式切换受全局开关约束。

- 全局 `启用子纪元里模式 = false` → 设备强制 `normal` 模式，隐藏切换按钮
- 全局 `启用子纪元里模式 = true` → 设备可自由切换 `normal` / `li`
- 设备模式偏好按存档独立保存

**理由**：保持与现有里模式开关的一致性，避免用户在关闭里模式后仍看到里模式内容。

### 6.2 应用名 vs 设备名

**决策**：设备名不变，应用名变化。

**理由**：设备是物理实体，同一部手机不会因为内容变化而改名。但设备里的 App 名称和功能描述可以随模式变化。

### 6.3 内容生成策略

**决策**：里模式下的设备内容（论坛帖子、资讯、聊天消息）通过 AI 提示词注入里模式规则来生成。

**理由**：复用现有的 `构建子纪元里模式注入` 函数，不需要新增独立的里模式内容引擎。

---

## 七、文件变更清单

### 7.1 新增文件

```
components/features/MobileDevice/
├── MobileDevice.tsx
├── MobileDeviceModal.tsx
├── MobileHome.tsx
├── ModeToggle.tsx                    # 新增：模式切换
├── apps/
│   ├── MapApp.tsx
│   ├── ContactsApp.tsx
│   ├── ChatApp.tsx
│   ├── ForumApp.tsx
│   └── NewsApp.tsx
├── panels/
│   ├── AncientPanel.tsx
│   ├── ModernPanel.tsx
│   ├── NearFuturePanel.tsx
│   └── ...
├── eraStyles/
│   ├── ancientStyles.ts
│   ├── modernStyles.ts
│   └── liModeStyles.ts               # 新增：里模式样式
├── hooks/
│   ├── useMobileDevice.ts
│   └── useEraDevice.ts

hooks/useGame/
└── mobileDeviceWorkflow.ts           # 新增：设备工作流

models/
├── mobileDevice.ts                   # 新增
└── eraDevice.ts                      # 新增

prompts/runtime/
└── mobileDevice.ts                   # 新增：设备提示词
```

### 7.2 修改文件

```
hooks/useGame.ts                      # 添加设备状态和模式管理
components/features/                  # 添加 M 键快捷键入口
utils/gameSettings.ts                 # 确认里模式开关字段
services/dbService.ts                 # 设备数据持久化（含 mode）
```

---

## 八、验证方案

### 8.1 功能验证

- [ ] 全局关闭里模式后，设备内不显示切换按钮
- [ ] 全局开启里模式后，设备内可切换 normal/li
- [ ] 切换模式后，应用名称正确变化
- [ ] 切换模式后，UI 主题色正确变化
- [ ] 里模式下论坛/资讯内容由 AI 按里模式规则生成

### 8.2 沉浸感验证

- [ ] 里模式应用名称符合里模式主题（见第二部分词典）
- [ ] 里模式 UI 色调与 `EraLiMode.themeColor` 一致
- [ ] 各时代的里模式名称差异正确反映（如都市→夜行地图、赛博→暗网节点图）

### 8.3 兼容性验证

- [ ] 桌面端/移动端正常显示
- [ ] 存档/读档后设备模式正确恢复
- [ ] 切换子纪元后设备配置正确更新

---

*方案版本：v2.0*
*最后更新：2026-05-01*
