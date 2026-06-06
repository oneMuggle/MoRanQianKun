# 02 - 状态与模块化架构

> 归档来源：`docs/plans/2026-05-31-module-refactor.md`（已实施，新架构已激活）
> 创建：2026-06-03

## 核心架构

```
src/
├── core/                    # 骨架（必须加载）
│   ├── types/               # 基础类型
│   ├── engine/              # 核心游戏引擎 + 模块加载器
│   ├── db/                  # 数据持久化
│   ├── api/                 # AI 客户端基础
│   └── module-registry/     # 模块注册表
│
├── modules/                 # 插件（按需加载）
│   ├── era-*/               # 7 个时代主题
│   ├── nsfw-*/              # 9 个 NSFW 子系统
│   ├── biz-*/               # 业务域（BDSM、房产、RPG、Galgame、桌游、小说）
│   └── contemporary/        # 现代都市综合
```

## 关键决策

1. **chunk 拆分**：`vite.config.ts` 的 `manualChunks` 按 `era-*`/`nsfw-*`/`biz-*` 模式自动分包
2. **game-runtime 兜底**：`prompts + models + hooks/useGame` 合并为一个 chunk 避免循环依赖运行时 TDZ（**Phase 4 计划从架构层修复**）
3. **legacyRegistrations.ts 兼容壳**：所有弹窗注册从 `desktopComponent` 静态属性改为 `desktopComponentFactory` 动态函数，消除静态引用以利于 tree-shaking
4. **保持 UIFeatureRegistry 可见性控制能力**

## 模块注册方式

```ts
// 新模式（推荐）
registerModal({
    id: 'BDSMMeetingModal',
    desktopComponentFactory: () => import('./BDSMMeetingModal').then(m => m.default),
    mobileComponentFactory:  () => import('./mobile/MobileBDSMMeetingModal').then(m => m.default),
    isVisible: (state) => state.gameConfig.nsfw.bdsm.enabled,
});
```

详见 `core/module-registry/` 实现。

## Phase 3 拆分记录：models/system.ts → models/system/* (2026-06-06)

### 拆分动机

Phase 0 baseline 测得 `models/system.ts` 单文件 ~1800+ 行（含 7 个纪元配置等），后随开发演进降至 **1030 行**（spec 偏差 792 行，已记录）。该文件混杂以下职责：

- API 客户端配置（~350 行）
- UI 视觉 / 字体 / 性能监控（~90 行）
- 游戏时代 / 世界 / 能力 / 难度 / 统计配置（~410 行）
- 记忆 / 存档 / 聊天 / 提示词 / 节日（~130 行）
- 同人 / 酒馆预设 / OpeningConfig / WorldGenConfig / 游戏设置结构（~50 行）
- 若干描述映射 const 与获取时代 helpers

任意一处修改都会触发巨型文件的 L1 strict 编译，Phase 2 的 strict 旗标（11 个 L1 + 5 个 L2）下尤为吃力。

### 拆分后结构

| 文件 | 行数 | 职责 |
|------|------|------|
| `models/system.ts` (shim) | 26 | 仅 `export * from './system/index'`，100% 兼容 71 个调用点 |
| `models/system/index.ts` | 16 | Barrel re-export 入口 |
| `models/system/types.ts` | 225 | 跨子模块共用的 type alias + 小型 interface |
| `models/system/api-config.ts` | 43 | API/图片生成（re-export 自 `../api-config`，避免类型重复） |
| `models/system/ui-settings.ts` | 74 | UI 文字样式/字体/视觉设置结构/性能监控 + 默认值 const |
| `models/system/game-config.ts` | 385 | 时代/世界/能力/难度/同人/酒馆/Open/WorldGen/游戏设置 + 全部时代配置 const + helpers |
| `models/system/memory-config.ts` | 104 | 记忆系统/存档结构/聊天记录/提示词/节日 |
| `models/system/visual-config.ts` | 18 | 视觉主题（ThemePreset re-export，保留扩展位） |

合计 7 个新文件，均 ≤ 600 行（spec 上限）。`eraPresets.ts`（815 行，时代预设数据）不在拆分范围。

### 关键设计决策

1. **API 类型不重复声明**：`models/api-config.ts`（根，357 行）已包含 API 类型完整定义；`models/system/api-config.ts` 仅做 `export type {...} from '../api-config'`，避免双份真源。
2. **types.ts 只放小类型**：大型 interface（`功能模型占位配置结构` 145 行 / `游戏设置结构` 66 行 / `存档结构` 54 行 / `PNG解析参数结构` 54 行）下沉至对应职责文件，保持 types.ts ≤ 250 行。
3. **跨模块类型用 inline `import()`**：游戏设置结构 引用了 8 个外部 NSFW 子系统类型，全部用 `import('./../xxx').X` 形式避免循环依赖。
4. **保留 eraTheme / eraPresets 转出口**：原 `models/system.ts` 顶部对 `./eraTheme` 和 `./system/eraPresets` 的 export 由 shim 继续转发，下游 71 个调用点零修改。
5. **不重构 `models/api-config.ts` 与 `models/game-settings.ts`**：两者已是历史遗留的 re-export 桥，与本次拆分独立。

### 验证结果（Day 34 末）

| 工具 | 状态 |
|------|------|
| `tsc --noEmit` (全量) | 0 错误 |
| `tsc -p tsconfig.core.json` (L1 11 strict 旗标) | 0 错误 |
| `tsc -p tsconfig.l2.json` (L2 utils) | 0 错误（pre-existing 与本拆分无关） |
| `madge --circular` | 20 个环（与拆分前同数，**0 新增**） |
| `ts-prune --error` | 0 死代码 |
| `npm run build` | 成功 |

### 已知约束

- `tsconfig.core.json` 仍仅 include 顶层 `models/system.ts`（不在 L1 strict 检查范围含 `models/system/**` 子目录）；拆分后通过 barrel re-export 找到所有类型，L1 错误数仍为 0。
- 由于实际行数（1030）远低于 spec 假设（1822），每个子文件实际大小比 spec 估计更小。
- `models/system/eraPresets.ts` 本身 815 行（含 5+32 = 37 个纪元配置数据），属于数据文件而非类型定义，不在本次拆分范围；后续 Phase 4 可按需进一步拆分。

### Commit

- `a2b4f11 refactor(system): 拆 models/system.ts 为 7 个 ≤ 600 行子文件（Phase 3 Day 31-34）`
- 8 files changed, 885 insertions(+), 1024 deletions(-)

## Phase 3 拆分记录：models/eraDevice.ts → models/eraDevice/* (2026-06-06)

### 拆分动机

Phase 0 baseline 测得 `models/eraDevice.ts` 单文件 ~1410 行（含 41 个纪元设备配置 + 工具函数 + DEFAULT_APP_NAMES）。该文件混杂以下职责：

- 41 个 era 的 `DeviceConfig` 配置（1300+ 行）
- 4 个工具函数（`getDeviceConfig` / `getAppName` / `getLiModeThemeColor` 等，~75 行）
- 1 个 DEFAULT_APP_NAMES 双模式应用名映射（~50 行）
- 1 个 LEGACY_ERA_MAP 旧版 ID 兼容常量（~7 行）
- 1 个 DEFAULT_APP_NAMES_FALLBACK（嵌入 getAppName 内部 map，~30 行）

调用方包括 30+ 个 `components/features/MobileDevice/*` 文件，公共 API 必须保持 100% 兼容。

### 拆分后结构

| 文件 | 行数 | 职责 |
|------|------|------|
| `models/eraDevice.ts` (shim) | 29 | 公共 API re-export（含 `eraDeviceConfigs` / 工具函数 / 类型 / 常量） |
| `models/eraDevice/index.ts` | 38 | Barrel + 合并 ANCIENT/MODERN/FUTURE partial Records 为完整 `eraDeviceConfigs` |
| `models/eraDevice/types.ts` | 89 | 共享类型（`DeviceConfig` / `MobileApp` re-export）+ `LEGACY_ERA_MAP` + `DEFAULT_APP_NAMES_FALLBACK` + `EraDeviceConfigKey` / `DeviceUiStyle` 类型别名 |
| `models/eraDevice/devices.ts` | 375 | **古代纪元（12 era）**：`ANCIENT_EASTERN_*`（7 个）+ `ANCIENT_WESTERN_*`（5 个） |
| `models/eraDevice/props.ts` | 318 | **近代（6 era）+ 当代（12 era）**：`MODERN_EASTERN_*` / `MODERN_WESTERN_*` + 12 个 `CONTEMPORARY_*` |
| `models/eraDevice/presets.ts` | 302 | **近未来/远未来/后人类/远古（12 era）** + `DEFAULT_APP_NAMES` + 3 个工具函数（`getDeviceConfig` / `getAppName` / `getLiModeThemeColor`） |

合计 5 个新文件 + 1 个 shim，均 ≤ 600 行（spec 上限）。覆盖 7 个 epoch × 41 个 era 全部设备配置。

### 关键设计决策

1. **三层 partial Record + 顶层合并**：`ANCIENT_DEVICES`（devices.ts）+ `MODERN_DEVICES`（props.ts）+ `FUTURE_PRESETS`（presets.ts）三个 partial Record 在 `index.ts` 用 spread 合并为完整 `eraDeviceConfigs`，避免单一文件超过 600 行。
2. **shim 用 `./eraDevice/index` 显式路径**：原本 shim 用 `'./eraDevice'` 会与 shim 同名导致 madge 检测到自循环；改用显式目录路径后零环。
3. **`getDeviceConfig` 跨分片查询**：放在 presets.ts，import 三个 partial Record 后按"ANCIENT → MODERN → FUTURE"顺序回退查找。父 Era 节点查找（`resolveEraNode`）也跨分片查询。
4. **不复制 `DEFAULT_APP_NAMES_FALLBACK`**：原 `configs.ts` 的 `getAppName` 函数内嵌了一个 30 行的 fallback map。提取到 `types.ts` 命名常量 `DEFAULT_APP_NAMES_FALLBACK` 后，`getAppName`（presets.ts）仅 `return DEFAULT_APP_NAMES_FALLBACK[app]`，逻辑更清晰。
5. **保留 era-device/ 旧路径的过渡**：Day 43-44 期间 shim 同时 re-export `./eraDevice` 和 `./era-device/configs`；Day 45 删除 `models/era-device/` 整个目录（包括 `configs.ts` 1370 行 + `appNames.ts` 50 行）。
6. **不重构 `models/mobileDevice.ts`**：`DeviceConfig` / `MobileApp` / `DeviceCapabilities` 等核心类型仍由 `mobileDevice.ts` 提供，eraDevice 仅 re-export 而不重复声明。

### 验证结果（Day 45 末）

| 工具 | 状态 |
|------|------|
| `tsc --noEmit` (全量) | 0 错误 |
| `tsc -p tsconfig.core.json` (L1 11 strict 旗标) | 0 错误 |
| `tsc -p tsconfig.l2.json` (L2 utils) | 98 错误（pre-existing，与本拆分无关；与拆分前同数） |
| `madge --circular` | eraDevice 区域 0 环（**0 新增**；自循环通过显式路径已消除） |
| `ts-prune --error` | 0 死代码 |
| `npm run build` | 成功 |

### 已知约束

- `tsconfig.core.json` 不含 `models/eraDevice.ts`（L1 26 文件清单中未列出，按 Day 8-12 Path B 决定）。顶层 shim 通过 barrel re-export 找到所有类型，L1 错误数仍为 0。
- `models/eraDevice/presets.ts` 同时承载"12 era 配置"+"工具函数"两类职责（~302 行），仍 ≤ 600 行 spec 上限。如未来增长可拆出 `helpers.ts`。

### Commits

- `617c9c0 refactor(eraDevice): 抽 types + 拆 devices（Day 43）`
- `3477c7b refactor(eraDevice): 拆 props + presets（Day 44）`
- 3 commits 总（Day 43-45，2 个 refactor + 本 docs commit）
