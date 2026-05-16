# NSFW 系统独立化：BDSM & 露出

> 日期: 2026-05-16
> 来源计划: [2026-05-16_nsfw-bdsm-exposure-decoupling.md](../plans/2026-05-16_nsfw-bdsm-exposure-decoupling.md)

## 概述

将 BDSM NSFW 系统和露出 NSFW 系统完全从校园 NSFW 系统中独立出来，成为可在所有时代（校园、现代、古代等）独立使用的子系统。

## 架构

### 独立后的依赖关系

```
campusNSFW ──消费──> bdsmNSFW      ✅ 保留（父消费子，合理联动）
campusNSFW ──消费──> exposureNSFW  ✅ 保留（父消费子，合理联动）
bdsmNSFW <──> exposureNSFW          ✅ 保留（系统间联动）
bdsmNSFW ──✂──> campusPhone        ✋ 已切断（论坛帖子不再继承校园帖子）
exposureNSFW ──✂──> campusNSFW     ✋ 已切断（旁观者常量、里程碑类型、校园地点全部泛化）
```

### 模块注册

每个独立 NSFW 系统通过 `StoryModule` 机制注册到 NSFW Center：

```
moduleRegistry.ts
├── settingsComponentMap → 各系统的设置组件（React.lazy 加载）
└── dashboardLabelMap    → 各系统的仪表盘显示名称
```

## 类型系统

### BDSM NSFW（`models/bdsmNSFW/`）

| 文件 | 说明 |
|------|------|
| `index.ts` | 主入口：`BDSM系统设置`, `默认BDSM系统设置`, 核心类型 re-export |
| `forum.ts` | 论坛系统：`基础帖子`（通用类型），`BDSM论坛帖子 extends 基础帖子` |
| `settings.ts` | 设置接口：`BDSM系统设置`（12 个开关字段） |
| `constants.ts` | 常量定义 |

**基础帖子类型**（替代校园 `论坛帖子`）：
```typescript
interface 基础帖子 {
  id, 作者, 标题, 内容, 分类, 发布时间,
  回复数, 浏览数, 点赞数, 是否置顶, 是否精华
}
```

### 露出 NSFW（`models/exposureNSFW/`）

| 文件 | 说明 |
|------|------|
| `index.ts` | 主入口 + 迁移函数 re-export |
| `types.ts` | 核心类型：`露出状态`, `紧张度状态`, `网络流言状态`, `旁观者` |
| `settings.ts` | 设置接口：`ExposureNSFW设置`（6 个字段） |
| `constants.ts` | 旁观者常量：距离察觉率、类型修正、反应权重、活动状态修正 |

**去校园化类型映射**：

| 原校园值 | 新通用值 |
|----------|---------|
| 旁观者类型: 普通同学 | 路人 |
| 闺蜜好友 | 密友 |
| 老师辅导员 | 权威人物 |
| 情敌对手 | 竞争对手 |
| 室友 | 同住者 |
| 距离: 同桌邻座 | 紧邻 |
| 对面附近 | 附近 |
| 同一房间远处 | 同室远处 |
| 周围人状态: 正常上课 | 专注事务 |

**设置接口**：
```typescript
interface ExposureNSFW设置 {
  启用露出系统: boolean;
  露出内容强度: '关闭' | '轻度' | '中度' | '深度';
  启用公开隐秘侵犯: boolean;
  启用旁观者反应: boolean;
  启用网络传播: boolean;
  活动NSFW频率: '关闭' | '低' | '中' | '高';
}
```

### 兼容层

`models/campusNSFW/` 中保留 deprecated re-export，确保旧代码和存档兼容：

| 文件 | 操作 |
|------|------|
| `campusNSFW/exposure.ts` | `@deprecated` re-export → `../exposureNSFW` |
| `campusNSFW/bdsm-forum.ts` | `@deprecated` re-export → `../bdsmNSFW/forum` |
| `campusNSFW/sm.ts` | 已是 deprecated re-export |

**旧存档迁移函数**（`models/exposureNSFW/types.ts`）：
- `迁移旧旁观者类型()` — 旧类型值 → 新值
- `迁移旧距离()` — 旧距离值 → 新值
- `迁移旧周围人状态()` — 旧状态值 → 新值
- `迁移旁观者档案()` — 完整档案迁移
- `迁移紧张度状态()` — 紧张度状态迁移

## UI 组件

### 设置面板

| 系统 | 文件 | 开关数 |
|------|------|--------|
| BDSM | `components/features/Settings/BDSMNSFWSettings.tsx` | 12 |
| 露出 | `components/features/Settings/ExposureNSFWSettings.tsx` | 6 |
| 校园 | `components/features/Settings/CampusNSFWSettings.tsx` | 已移除迁出开关，仅保留校园专属子系统 |

### 仪表盘

| 系统 | 桌面端 | 移动端 |
|------|--------|--------|
| 露出 | `components/features/ExposureDashboard.tsx` | `components/features/MobileExposureDashboard.tsx` |

露出仪表盘展示内容：
- NPC 露出档案卡片（可展开：等级、进度条、成功/失败次数、紧张度、网络流言）
- 旁观者记录列表（类型、距离、已察觉状态、反应）

### CampusNSFWSettings 变更

从 `CampusNSFWSettings.tsx` 移除了以下区块：
- "v1.1 露出与公开隐秘"（6 个控件）→ 迁移至 `ExposureNSFWSettings.tsx`
- "v1.5 BDSM 论坛"（4 个控件）→ 迁移至 `BDSMNSFWSettings.tsx`
- "v1.6 BDSM 关系管线"（4 个控件）→ 迁移至 `BDSMNSFWSettings.tsx`

保留的校园专属子系统：基础设置、SM/支配服从、桌游社交 NSFW、校园祭 NSFW。

## 引擎层变更

- `hooks/useGame/exposureNSFWEngine/core.ts`：导入从 `campusNSFW/constants` 改为 `models/exposureNSFW/constants`
- `hooks/useGame/exposureNSFWEngine/factoryFunctions.ts`：默认 `周围人状态` 从 `'正常上课'` 改为 `'专注事务'`
- `prompts/runtime/exposureNSFW.ts`：等级 5 描述从 "在校园公开活动场合" 改为 "在公开活动场合"

## 文件清单

| 操作 | 文件 |
|------|------|
| 新增 | `models/exposureNSFW/constants.ts` |
| 新增 | `components/features/Settings/ExposureNSFWSettings.tsx` |
| 新增 | `components/features/ExposureDashboard.tsx` |
| 新增 | `components/features/MobileExposureDashboard.tsx` |
| 修改 | `models/bdsmNSFW/forum.ts` |
| 修改 | `models/exposureNSFW/types.ts` |
| 修改 | `models/exposureNSFW/index.ts` |
| 修改 | `models/exposureNSFW/settings.ts` |
| 修改 | `components/features/Settings/BDSMNSFWSettings.tsx` |
| 修改 | `components/features/NSFWCenter/moduleRegistry.ts` |
| 修改 | `components/features/Settings/CampusNSFWSettings.tsx` |
| 修改 | `hooks/useGame/exposureNSFWEngine/core.ts` |
| 修改 | `hooks/useGame/exposureNSFWEngine/factoryFunctions.ts` |
| 修改 | `prompts/runtime/exposureNSFW.ts` |
| 修改 | `models/campusNSFW/exposure.ts` |
| 修改 | `models/campusNSFW/bdsm-forum.ts` |
