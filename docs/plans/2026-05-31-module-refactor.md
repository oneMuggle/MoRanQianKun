# 模块化拆分方案：骨架 + 插件化模块架构

> 创建时间: 2026-05-31
> 状态: Phase 1 已完成，Phase 2+ 待实施
> 目标: 将项目拆分为通用骨架和独立模块，实现按需加载、减少初始包体积

---

## 一、背景与目标

### 现状问题

1. **强耦合打包**：`prompts/`、`models/`、`hooks/useGame/`、`services/ai/` 全部打包到同一个 `game-runtime` chunk（约占总体积 60%+）
2. **静态引用**：`legacyRegistrations.ts` 一次性静态导入 78+ 个懒加载组件，import() 语句形成静态引用，无法 tree-shaking
3. **无效加载**：用户只玩"古代武侠"时代，却要加载"赛博朋克"、"后人类"等时代的提示词和主题资源
4. **NSFW 子系统耦合**：campus、photography、urbanDriver、exposure 等子系统与核心代码打包在一起
5. **业务域无边界**：BDSM、房产、RPG 战斗、Galgame、桌游、小说等业务模块相互耦合

### 拆分目标

- ✅ 提取通用骨架（核心引擎 + 基础 UI + 数据持久化）
- ✅ 模块按需加载（时代、NSFW 子系统、业务域独立 chunk）
- ✅ 保持现有 UIFeatureRegistry 系统的可见性控制能力
- ✅ 不影响现有功能，纯架构优化
- ✅ 首屏 chunk 体积减少 50-60%

---

## 二、目标架构

```
src/
├── core/                    # 【骨架】核心引擎（必须加载，~40% 体积）
│   ├── types/               # 基础类型定义
│   ├── state/               # 游戏状态核心结构
│   ├── engine/              # 核心游戏引擎 + 模块加载器
│   ├── db/                  # 数据持久化
│   ├── api/                 # AI 客户端基础
│   ├── ui/                  # 基础 UI 组件和布局
│   └── module-registry/     # 模块注册表系统（已有）
│
├── modules/                 # 【插件】可独立加载的业务模块
│   ├── era-*/               # 按时代拆分（7 个 Epoch，各 ~50KB）
│   │   ├── theme.ts         # UI 主题（颜色、字体、装饰）
│   │   ├── prompts.ts       # 时代提示词（现实逻辑、文风）
│   │   ├── presets.ts       # 时代预设（开局场景、世界观）
│   │   └── components/      # 时代专属 UI 组件
│   │
│   ├── nsfw-*/              # 按 NSFW 子系统拆分（各 ~30-80KB）
│   │   ├── campus/          # 校园 NSFW
│   │   ├── photography/     # 写真 NSFW
│   │   ├── urban-driver/    # 网约车 NSFW
│   │   └── exposure/        # 露出 NSFW
│   │
│   ├── business-*/          # 按业务域拆分（各 ~20-100KB）
│   │   ├── bdsm/            # BDSM 子系统
│   │   ├── property/        # 房产经营
│   │   ├── rpg-battle/      # RPG 战斗
│   │   ├── galgame/         # Galgame/AVG
│   │   ├── board-game/      # 桌游
│   │   ├── novel/           # 小说系统
│   │   └── device/          # 移动设备系统
│   │
│   └── shared/              # 模块间共享的基础设施
│       ├── prompts-core/    # 核心提示词（所有模块依赖）
│       ├── models-base/     # 基础模型（角色、世界、战斗等）
│       └── hooks-common/    # 通用 hooks
│
└── components/features/     # UI 功能组件（保持现有 lazy 加载）
```

### 模块接口定义

```typescript
interface ModuleManifest {
  id: string;
  name: string;
  version: string;
  dependencies?: string[];
  uiFeatures?: UIFeatureModule[];
  promptBlocks?: () => string | Promise<string>;
  stateExtensions?: (state: GameState) => void;
  initialize?: (context: ModuleContext) => void | Promise<void>;
  dispose?: () => void;
}
```

---

## 三、加载时序

```
应用启动
  │
  ├─ 加载 core-skeleton chunk（骨架，~40% 体积）
  │   ├─ 基础类型、状态、引擎
  │   ├─ AI 客户端、数据库
  │   ├─ 模块注册表、模块加载器
  │   └─ 核心提示词、基础 UI
  │
  ├─ 检测当前时代 → 加载对应 era-* chunk（~10% 体积）
  │   └─ 注册时代提示词、主题、预设
  │
  ├─ 检测 gameConfig → 按需加载业务模块
  │   ├─ 启用NSFW → 加载对应 nsfw-* chunk
  │   ├─ 启用修炼 → 加载 cultivation 模块
  │   └─ 其他开关...
  │
  └─ 游戏运行中 → 事件触发加载
      ├─ 进入战斗 → 加载 rpg-battle chunk
      ├─ 获得房产 → 加载 property 模块
      └─ 触发特殊事件 → 加载对应业务模块
```

---

## 四、实施步骤

### Phase 1: 骨架提取与基础架构 ✅ 已完成

**目标：** 建立 `core/` 目录，定义模块接口契约，创建模块加载器

- [x] **1.1** 定义模块接口 `ModuleManifest` 和 `ModuleContext`
  - 文件: `core/types/module.ts`（新建）
  - 内容: ModuleManifest、ModuleContext、ModuleLoaderOptions 类型
- [x] **1.2** 创建模块加载器 `ModuleLoader`
  - 文件: `core/engine/ModuleLoader.ts`（新建）
  - 功能: 模块注册、依赖解析、按需加载、生命周期管理
  - 文件: `core/engine/PromptRegistry.ts`（新建）
  - 功能: 核心提示词 + 动态注册/卸载 + 懒求值组装
- [x] **1.3** 迁移模块注册表系统
  - 从 `utils/moduleRegistry/` → `core/module-registry/`
  - 保持现有 API 兼容
- [x] **1.4** 创建 Prompt 动态注册中心
  - 文件: `core/engine/PromptRegistry.ts`（新建）
  - 功能: 核心提示词 + 动态注册/卸载 + 懒求值组装
- [x] **1.5** 迁移核心 AI 客户端
  - 从 `services/ai/chatCompletionClient.ts` → `core/api/`（代码复制完成，导入路径兼容）
- [x] **1.6** 迁移数据库服务
  - 从 `services/dbService.ts` → `core/db/`（re-export 方式，保持向后兼容）
- [x] **1.7** 更新 import 路径
  - 新建 `core/index.ts` 统一导出入口
  - 原有路径保持不变（向后兼容）
- [x] **1.8** 验证构建和功能
  - `npx tsc --noEmit` ✅ 无 core/ 相关错误
  - `npx vite build` ✅ 构建成功 (14.60s)

### Phase 2: 时代模块拆分

**目标：** 将 7 个 Epoch 拆分为独立 chunk，按当前游戏时代按需加载

- [ ] **2.1** 创建时代模块目录结构
  - `modules/era-primordial/`、`modules/era-ancient/`、`modules/era-modern/`
  - `modules/era-contemporary/`、`modules/era-near-future/`、`modules/era-far-future/`、`modules/era-post-human/`
- [ ] **2.2** 拆分 `eraTheme/epoch-*.ts` 到对应目录
- [ ] **2.3** 拆分时代提示词和现实逻辑
- [ ] **2.4** 拆分时代预设（开局场景、世界观卡片）
- [ ] **2.5** 实现时代切换时的动态 import()
- [ ] **2.6** 更新 Vite manualChunks 配置
- [ ] **2.7** 验证时代切换功能

### Phase 3: NSFW 子系统拆分

**目标：** 4 个 NSFW 子系统独立 chunk，按需加载

- [ ] **3.1** 提取 campus 子系统（hooks + prompts + models + components）
- [ ] **3.2** 提取 photography 子系统
- [ ] **3.3** 提取 urban-driver 子系统
- [ ] **3.4** 提取 exposure 子系统
- [ ] **3.5** 实现配置驱动的动态加载
- [ ] **3.6** 更新 Vite manualChunks 配置
- [ ] **3.7** 验证 NSFW 功能

### Phase 4: 业务域模块拆分

**目标：** 各业务域独立 chunk，通过 ModuleLoader 按需激活

- [ ] **4.1** 提取 BDSM 子系统
- [ ] **4.2** 提取房产经营模块
- [ ] **4.3** 提取 RPG 战斗模块
- [ ] **4.4** 提取 Galgame/AVG 模块
- [ ] **4.5** 提取桌游模块
- [ ] **4.6** 提取小说系统模块
- [ ] **4.7** 提取移动设备系统
- [ ] **4.8** 更新 Vite manualChunks 配置
- [ ] **4.9** 验证各业务模块功能

### Phase 5: Prompts 系统重构

**目标：** 从静态数组改为动态注册机制

- [ ] **5.1** 重构 `prompts/index.ts` 为 PromptRegistry
- [ ] **5.2** 核心提示词保留在 `core/`
- [ ] **5.3** 各模块通过 `promptBlocks` 注册
- [ ] **5.4** 更新 `systemPromptBuilder.ts` 使用新注册中心
- [ ] **5.5** 验证提示词组装正确性

### Phase 6: Vite 构建配置优化

**目标：** 配置合理的 chunk 分割策略

- [ ] **6.1** 更新 `vite.config.ts` manualChunks
- [ ] **6.2** 配置按需加载的 chunk 命名
- [ ] **6.3** 优化 preload/prefetch 策略
- [ ] **6.4** 验证构建输出和 chunk 大小

### Phase 7: lazyComponents 重构

**目标：** 消除 legacyRegistrations.ts 的静态引用

- [ ] **7.1** 改造模块注册为 componentFactory 模式
- [ ] **7.2** 更新 ModalRenderer 支持动态工厂
- [ ] **7.3** 清理 legacyRegistrations.ts 静态 import
- [ ] **7.4** 验证所有弹窗功能正常

---

## 五、Vite 构建配置（Phase 6 目标）

```typescript
manualChunks(id) {
  // 骨架（必须）
  if (id.includes('/core/')) return 'core-skeleton';
  
  // 按时代拆分
  if (id.includes('/modules/era-')) {
    const era = id.match(/era-(\w+)/)?.[1];
    return era ? `era-${era}` : undefined;
  }
  
  // 按 NSFW 子系统拆分
  if (id.includes('/modules/nsfw-')) {
    const nsfw = id.match(/nsfw-(\w+)/)?.[1];
    return nsfw ? `nsfw-${nsfw}` : undefined;
  }
  
  // 按业务域拆分
  if (id.includes('/modules/business-')) {
    const biz = id.match(/business-(\w+)/)?.[1];
    return biz ? `biz-${biz}` : undefined;
  }
  
  // 现有策略保留
  if (id.includes('fflate')) return 'fflate-vendor';
  if (id.includes('@google/genai')) return 'ai-sdk-vendor';
  return 'vendor';
}
```

---

## 六、风险评估

| 风险 | 级别 | 应对措施 |
|------|------|----------|
| 双向依赖导致 TDZ 错误 | **高** | Phase 1 先建立清晰的核心→模块单向依赖，核心不依赖任何模块 |
| prompts 动态注册影响性能 | **中** | 使用懒求值 `()=>string`，只在发送请求时组装 |
| 时代切换时的加载延迟 | **中** | 预加载下一个时代 chunk，使用 Suspense fallback |
| 模块间通信复杂化 | **中** | 通过 ModuleContext 提供统一事件总线 |
| 构建配置调试困难 | **低** | 逐步迁移，每次只拆一个模块，验证构建 |
| 现有功能回归 | **中** | 每完成一个 Phase 进行完整功能测试 |

---

## 七、预期收益

| 指标 | 当前 | 目标 |
|------|------|------|
| 首屏 chunk 体积 | ~100%（game-runtime） | ~40%（core-skeleton） |
| 初始加载时间 | 基准 | 减少 50-60% |
| 未使用代码加载 | 大量时代/NSFW/业务代码 | 按需加载，减少 60%+ |
| 模块独立性 | 强耦合 | 可独立开发、测试、替换 |
| 代码可维护性 | 大文件多、耦合深 | 职责清晰、边界明确 |
