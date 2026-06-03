# 13 - 性能与构建优化

> 创建：2026-06-03
> 状态：**调研完成，待优化**

## 当前构建产物（2026-06-03）

```
dist/assets/MobileCharacter-5yFAM6At.js                       32.02 kB │ gzip:  7.70 kB
dist/assets/CharacterModal-DLxlTvCN.js                        32.90 kB │ gzip:  8.16 kB
dist/assets/SocialNetworkView-CC0jmn6r.js                     34.58 kB │ gzip: 10.10 kB
dist/assets/MemoryModal-BFN6rJSx.js                           34.73 kB │ gzip:  9.55 kB
dist/assets/MobileSocial-Ba4Hb7ex.js                          66.16 kB │ gzip: 15.15 kB
dist/assets/SocialModal-DftK-cKK.js                           71.38 kB │ gzip: 16.30 kB
dist/assets/image-manager-mobile-D2h3ZEuo.js                 115.05 kB │ gzip: 22.83 kB
dist/assets/MobileDeviceModal-BDi7hlI4.js                    153.93 kB │ gzip: 33.97 kB
dist/assets/image-manager-desktop-DzzyvXmA.js                196.47 kB │ gzip: 37.21 kB
dist/assets/index-CNWLCPV8.js                                326.88 kB │ gzip: 91.58 kB
dist/assets/EraSelector-CUWZdA_n.js                          465.54 kB │ gzip:139.27 kB
dist/assets/settings-panels-Bz_-ZLev.js                      494.06 kB │ gzip:113.94 kB
dist/assets/game-runtime-Aq7Mdzc8.js                       2,857.42 kB │ gzip:869.50 kB  ⚠️
dist/assets/vendor-DejTZOyi.js                             3,616.03 kB │ gzip:1,701.81 kB
```

**Build time**: 15.91s

## 巨型 chunk 根因

| Chunk | 体积 | 来源 | 优化空间 |
|---|---|---|---|
| `vendor` | 3.62 MB | React + zustand + IndexedDB 依赖 | 中（拆分 zustand）|
| `game-runtime` | 2.86 MB | `prompts + models + hooks/useGame` 合并 | **高**（解决循环依赖后可拆）|
| `settings-panels` | 494 KB | 7 个设置子组件 | 低（按需加载）|
| `EraSelector` | 465 KB | 时代选择器 | 低 |

## 关键瓶颈：`game-runtime` 2.86 MB

`vite.config.ts` 注释：
```js
// prompts 和 models 与 hooks/useGame 存在双向依赖
// 将它们全部纳入 game-runtime 避免跨 chunk 的 ESM TDZ 错误
// 依赖链: prompts → models → hooks/useGame → prompts
```

**这是 Phase 4 循环依赖未完全解决的副作用**：
- Phase 4 已解 2/16 环
- 剩余 14 环（特别是 npcNSFWEnhancement 9 子环）让 Vite 兜底合并
- **真正解耦后**：game-runtime 可拆为 3-5 个 chunk，预计首屏减 50-60%

## 已完成的优化

| 优化 | 效果 |
|---|---|
| `vite.config.ts` manualChunks | era/nsfw/biz 按模块分包 |
| `modules/era-*` 删除（Phase 3 P3-6）| -6502 行 |
| `services/dbService/index.ts` 提取子文件 | 减少 200+ 行主文件 |
| `models/system.ts` eraPresets 拆分 | 减少 800 行 |
| 13 个子模块已拆 | 总体减约 10000 行 |

## 推荐优化路线

### P7-2: useGame 拆分订阅

`useGame()` 整对象返回，导致任何 state 变化都重渲染所有 useGame 调用方。

**目标**：拆为
- `useGameState()` — 业务 state
- `useGameMeta()` — 静态 meta
- `useGameActions()` — action 函数（引用稳定）

**预计收益**：减少 30-50% 不必要重渲染

### P7-3: 列表虚拟化

大型列表（NPC、记忆、聊天历史）一次渲染全部 DOM：
- NPC 列表：可能 100+ 项
- 记忆：50+ 条
- 聊天历史：1000+ 条

**目标**：引入 `@tanstack/react-virtual`，只渲染可视区域

**预计收益**：列表 DOM 节点从 1000+ 减到 20-30

### P7-4: IndexedDB 性能

当前 `dbService.ts` 1396 行（含 helpers），每次保存：
- 1 次 `保存存档` 写
- 1 次 `保存图片资源` 写（外置化图片）
- 1 次 `保存设置` 写（如果修改）

**优化**：
- 写路径批处理（debounce 200ms）
- 读路径加 `idb-keyval` 缓存
- 大对象（带图片）写入前 `fflate` 压缩

**预计收益**：连续编辑时减少 50%+ IDB 操作

### 解决 Phase 4 剩余循环依赖

彻底解耦 `prompts ↔ models ↔ hooks/useGame` 循环后，`game-runtime` chunk 可拆分：
- `core-runtime`（核心 hooks，1-2 MB）
- `prompts-runtime`（按需加载，500 KB）
- `models-runtime`（按需加载，500 KB）

**预计收益**：首屏 chunk 减 50-60%（**最大收益**）

## Vite 配置建议

`vite.config.ts` 已支持 `manualChunks` 按模式分包。新增：
- 动态 `import()` 大型设置面板
- `loading="lazy"` 弹窗组件（已部分实施）
- 移除 `game-runtime` 兜底（依赖 Phase 4 完成）

## 监控指标

| 指标 | 当前 | 目标 |
|---|---|---|
| 首屏 chunk (gzip) | ~3.0 MB | < 1.5 MB |
| Build time | 15.9s | < 20s |
| Lighthouse Performance | 未测 | > 80 |
| TTI (Time to Interactive) | 未测 | < 3s |

## 下个 Phase 8 之前应做

1. **P7-2 useGame 拆分**：~0.5-1 天
2. **P7-3 列表虚拟化**：~1-2 天
3. **P7-4 IDB 优化**：~0.5 天

**最大收益**：完成 Phase 4 剩余 14 环解耦（~2-3 天），让 `game-runtime` 可拆。
