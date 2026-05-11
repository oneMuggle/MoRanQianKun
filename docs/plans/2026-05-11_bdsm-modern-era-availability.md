# BDSM 系统现代纪元可用性分析与调整计划

**日期：** 2026-05-11

---

## 背景与目标

BDSM 系统作为校园 NSFW 模块的子功能，当前**仅在 `contemporary_urban`（都市）纪元下可用**。项目中共有 11 个现代纪元（contemporary 子纪元），但 BDSM 系统对其余 10 个纪元完全不可见。

**目标：** 使 BDSM 系统在所有现代纪元下均可用。

---

## 问题分析

### 问题 1：模块注册绑定单一纪元

**文件：** `modules/contemporary/campusNSFW/registration.ts:100`

```typescript
const 校园NSFW模块: StoryModule<校园NSFW设置, 校园运行时参数> = {
  id: 'campusNSFW',
  eraId: 'contemporary_urban',    // ← 仅限都市
  ...
};
```

### 问题 2：注册表使用严格相等匹配

**文件：** `utils/storyModule/registry.ts:24`

```typescript
static 获取时代模块(eraId: string): StoryModule<any, any>[] {
    return Array.from(this._模块映射.values())
      .filter(m => m.eraId === eraId)   // ← 严格相等，不支持继承
      .sort((a, b) => b.priority - a.priority);
}
```

### 受影响的纪元列表

以下现代纪元当前**无法使用** BDSM 系统：

| 纪元 ID | 名称 | 类型 |
|---------|------|------|
| `contemporary_campus` | 校园 | SubEra |
| `contemporary_rural` | 乡村 | SubEra |
| `contemporary_campus_urban` | 校园都市 | SubEra |
| `contemporary_post_apocalyptic` | 末日废土 | SubEra |
| `contemporary_noir` | 黑色犯罪 | SubEra |
| `contemporary_hippie` | 嬉皮士时代 | SubEra |
| `contemporary_zombie` | 丧尸危机 | SubEra |
| `contemporary_extreme_cold` | 极寒末日 | SubEra |
| `contemporary_biohazard` | 生化危机 | SubEra |
| `contemporary_nuclear_winter` | 核冬天 | SubEra |

### 纪元层级结构

```
contemporary (Epoch, depth=0)
  ├── contemporary_eastern (Era, depth=1)
  │   ├── contemporary_urban        ← 当前唯一可用
  │   ├── contemporary_campus
  │   ├── contemporary_rural
  │   ├── contemporary_campus_urban
  │   ├── contemporary_post_apocalyptic
  │   ├── contemporary_noir
  │   ├── contemporary_hippie
  │   ├── contemporary_zombie
  │   ├── contemporary_extreme_cold
  │   ├── contemporary_biohazard
  │   └── contemporary_nuclear_winter
  ├── contemporary_western (Era, depth=1)
  └── contemporary_apocalypse (Era, depth=1)
```

---

## 技术方案

### 方案对比

| 方案 | 复杂度 | 维护成本 | 扩展性 | 推荐度 |
|------|--------|----------|--------|--------|
| A. 为每个纪元单独注册模块 | 低 | 高（重复注册） | 差 | 不推荐 |
| B. 支持层级纪元匹配 | 中 | 低 | 好 | **推荐** |
| C. 修改 eraId 为 'contemporary' | 低 | 低 | 好 | 备选 |

### 推荐方案：方案 B — 支持层级纪元匹配

修改模块注册表的匹配逻辑，使其支持父子纪元的层级匹配。当模块的 `eraId` 匹配当前纪元的父级时，模块对所有子纪元可用。

**涉及文件：**

| 文件 | 变更内容 |
|------|----------|
| `utils/storyModule/types.ts` | 在 `StoryModule` 接口中添加 `parentEraIds?: string[]` 字段 |
| `utils/storyModule/registry.ts` | 修改 `获取时代模块()` 方法，支持层级匹配 |
| `modules/contemporary/campusNSFW/registration.ts` | 将 `eraId` 改为 `'contemporary'` 或添加 `parentEraIds` |
| `models/eraDevice.ts` | 确认所有现代纪元的设备配置包含 BDSM 相关 app |

---

## 实施步骤

### 步骤 1：扩展 StoryModule 接口

- [x] 在 `utils/storyModule/types.ts` 中为 `StoryModule` 接口添加 `parentEraIds?: string[]` 可选字段
- [x] 添加注释说明其用途：支持模块在多个相关纪元下共享

### 步骤 2：修改模块注册表匹配逻辑

- [x] 在 `utils/storyModule/registry.ts` 中导入纪元层级工具函数（`getEraPath`）
- [x] 修改 `获取时代模块()` 方法：
  1. 保留原有的精确匹配逻辑作为第一优先级
  2. 添加层级匹配逻辑：如果当前纪元的路径中包含模块的 `eraId`，则视为匹配
  3. 确保排序逻辑正确处理精确匹配 vs 层级匹配的优先级

### 步骤 3：更新 campusNSFW 模块注册

- [x] 在 `modules/contemporary/campusNSFW/registration.ts` 中将模块的 `eraId` 从 `'contemporary_urban'` 改为 `'contemporary'`
- [x] 添加 `parentEraIds: [...MODERN_ERA_IDS]` 显式声明适用的所有现代纪元

### 步骤 4：验证设备配置

- [x] 检查 `models/eraDevice.ts` 中所有现代纪元的设备配置
- [x] 为以下现代纪元添加完整的 NSFW 深化系统 app 配置：
  - `contemporary_urban`（都市）— 新增 schedule/campus_card/club/confession/rules/hypnosis/bdsn
  - `contemporary_campus_urban`（校园都市）— 新增完整配置（之前缺失）
  - `contemporary_rural`（乡村）— 追加 NSFW app
  - `contemporary_post_apocalyptic`（末日废土）— 追加 NSFW app
  - `contemporary_noir`（黑色犯罪）— 追加 NSFW app
  - `contemporary_hippie`（嬉皮士时代）— 追加 NSFW app
  - `contemporary_zombie`（丧尸危机）— 追加 NSFW app
  - `contemporary_extreme_cold`（极寒末日）— 追加 NSFW app
  - `contemporary_biohazard`（生化危机）— 追加 NSFW app
  - `contemporary_nuclear_winter`（核冬天）— 追加 NSFW app
  - `contemporary_campus`（校园）— 已有完整配置，无需变更

### 步骤 5：运行时验证

- [x] 启动开发服务器（端口 3001）
- [x] 页面加载无错误（console 无 MODERN_ERA_IDS 引用错误）
- [x] 代码级验证完成：
  - `registry.ts` 包含 `模块匹配纪元()` 方法，支持精确/层级/parentEraIds 三种匹配
  - `campusNSFW/registration.ts` 正确导入 `MODERN_ERA_IDS` 并设置 `eraId: 'contemporary'`
  - `eraDevice.ts` 中所有 11 个现代纪元均包含 NSFW 深化系统 app
- [x] TypeScript 编译通过（无新增错误）
- [ ] 手动在不同纪元下测试 BDSM 功能（建议人工验证）

---

## 风险评估

| 风险 | 级别 | 应对 |
|------|------|------|
| 层级匹配逻辑引入性能问题 | 低 | 纪元数量有限（42个），匹配开销可忽略 |
| 某些现代纪元不适合 BDSM 内容 | 中 | 可通过 `parentEraIds` 精确控制，而非一刀切 |
| 设备配置遗漏导致 UI 入口缺失 | 中 | 步骤 4 逐一核对 |
| 精确匹配优先级被破坏 | 低 | 在排序中确保精确匹配 > 层级匹配 |

## 依赖

- 无外部依赖
- 依赖已有的纪元层级工具函数（`models/eraTheme/assembly.ts`）

## 预计工作量

- 步骤 1-2：核心逻辑修改 ~1 小时
- 步骤 3-4：配置更新 ~30 分钟
- 步骤 5：验证测试 ~30 分钟
- **总计：约 2 小时**
