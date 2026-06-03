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
