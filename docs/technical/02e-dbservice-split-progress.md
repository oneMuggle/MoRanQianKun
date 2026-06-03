# 02e - dbService 拆分进展

> 创建：2026-06-03
> 状态：**部分完成**（拆了 1/4 区块）

## 拆分目标

原 `services/dbService.ts`（1396 行）拆为 4 个子模块：
- schema/initialization（基础设施）
- saves（存档）
- settings（设置）
- imageAssets（图片资源 + 维护）
- deviceMessages（设备消息）✅

## 已完成（2026-06-03）

✅ **deviceMessages**（112 行）：6 个设备消息 CRUD 函数
✅ **schema**（12 行）：DB_NAME/STORE_NAME 等常量
✅ **initialization**（51 行）：`初始化数据库()` + `safeNumber` helper
✅ **index.ts**（1289 行）：re-export 子模块 + 保留其余函数（存档/设置/图片/维护/导出导入）

## 试错记录

### 尝试：拆 saves.ts

提取存档相关（465-731 行）到 `saves.ts`，遇到**深耦合问题**：
- `清洗导入存档` helper 在 `index.ts`（不是 saves.ts 内部）
- `外置化图片字段`、`构建存档去重键`、`读取存档保护状态`、`清理未引用图片资源` 等同样依赖 index.ts 内的 helper
- 简单切片无法工作；需要**先把 helper 也拆出来**才能真正解耦 saves

**结论**：1396 行的真实解耦是 2-3 天的工程，需要按依赖层级从外到内逐层拆。

## 推荐策略（未来 Phase）

1. **阶段 1**：拆 helper（清洗/外置化/构建键/保护状态）到 `dbService/_helpers.ts`
2. **阶段 2**：拆图片资源相关（保存/读取/预热/清理）到 `dbService/imageAssets.ts`
3. **阶段 3**：拆设置相关（保存/读取/管理/迁移）到 `dbService/settings.ts`
4. **阶段 4**：拆存档相关（保存/读取/列表/删除/导入导出）到 `dbService/saves.ts`
5. **阶段 5**：拆维护（清空全部/清空数据库）到 `dbService/maintenance.ts`

每阶段必须**先验证 index.ts 编译通过 + 23 个引用方不破**。

## 当前状态

```
services/dbService/
├── index.ts           (1289 行) - 暂时保留所有存档/设置/图片/维护
├── schema.ts          (12 行)  ✅
├── initialization.ts  (51 行)  ✅
└── deviceMessages.ts  (112 行) ✅

删除: services/dbService.ts (1396 行) → services/dbService/index.ts (1289 行)
净减少: 1396 - 1289 = 107 行（提取到 deviceMessages 12 + 51）
```

## API 兼容性

23 个引用方**全部无需修改**：
- 旧：`import { ... } from '../services/dbService'`
- 新：`import { ... } from '../services/dbService'`（Node.js 自动解析为 `dbService/index.ts`）

tsc 总错误数：628 → 628（持平）
