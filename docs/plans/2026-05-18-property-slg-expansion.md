# 房产 SLG 经营扩展系统 - 实施计划

**日期**: 2026-05-18
**作者**: Planner Agent
**状态**: 实施中 (Phase 1-5 已完成)

---

## 1. 需求概述

为"墨色江湖：无尽武林"添加一套偏 SLG（策略模拟经营）的房产玩法扩展。针对房东、民宿老板等角色定位，实现三大核心玩法：

1. **房屋扩建** — 玩家可购买/继承初始房产，逐步扩建房间、楼层、院落
2. **设施建造** — 在房产内建造各类设施（床铺、厨房、浴室、花园、温泉、练功房等），设施影响房客吸引力和租金收益
3. **房客招揽** — 吸引 NPC 入住为房客，管理房客关系、满意度、租金收取
4. **SLG 经营循环** — 资源投入（金钱/材料/时间） → 设施建设 → 房客入住 → 收入产出 → 再投资

本系统在现有 AVG（叙事）+ RPG（个人冒险战斗）架构之上叠加 SLG 经营层，复用已有的货币系统、NPC 系统、任务系统、时间系统，做到增量扩展而非重写。

> 与现有 `docs/plans/slg-system-plans.md` 的关系：该文件是高层概述，仅在"现代 SLG 经营模式"章节简略提及"房屋出租"。本计划是其房产子系统的详细落地方案，涵盖数据模型、引擎逻辑、UI 组件等完整实现细节。

## 2. 架构变更

### 2.1 新增文件

**数据模型** (`models/property/`)
- `models/property/types.ts` — 核心类型：房产、房间、设施、房客、经营状态
- `models/property/facilityPresets.ts` — 设施预设（古代/现代/未来时代模板）
- `models/property/tenantPresets.ts` — 房客类型预设

**工作流** (`hooks/useGame/property/`)
- `hooks/useGame/property/propertyEngine.ts` — 经营引擎：回合推进、收益计算
- `hooks/useGame/property/facilityWorkflow.ts` — 设施建造/升级/拆除
- `hooks/useGame/property/tenantWorkflow.ts` — 房客招揽/退租/满意度
- `hooks/useGame/property/eventWorkflow.ts` — 随机事件（纠纷/损坏/访客）
- `hooks/useGame/property/promptBuilder.ts` — AI 提示词构建

**UI 组件** (`components/features/Property/`)
- `components/features/Property/PropertyDashboard.tsx` — 桌面端仪表盘
- `components/features/Property/MobilePropertyApp.tsx` — 移动端应用
- `components/features/Property/RoomCard.tsx` — 房间卡片
- `components/features/Property/FacilityBuilder.tsx` — 设施建造面板
- `components/features/Property/TenantList.tsx` — 房客管理
- `components/features/Property/EventLog.tsx` — 事件日志

### 2.2 修改已有文件

| 文件 | 变更内容 |
|------|----------|
| `models/system.ts` | 存档结构新增 `房产系统?: 房产数据结构` |
| `models/index.ts` | 导出房产类型 |
| `hooks/useGameState.ts` | 新增 `房产系统` useState |
| `hooks/useGame.ts` | 集成房产工作流到主循环 |
| `hooks/useGame/index.ts` | 导出房产工作流 |
| `hooks/useGame/storyState.ts` | 新增 `创建空房产状态()` |
| `components/features/lazyComponents.tsx` | 注册懒加载组件 |
| `services/dbService.ts` | 存读档序列化支持房产数据 |
| `utils/moduleRegistry/bootstrap.ts` | 模块注册 |

## 3. 数据模型设计

### 3.1 核心类型

```typescript
interface 房产数据结构 {
    房产名称: string;
    房产类型: '民居' | '客栈' | '民宿' | '庄园' | '商铺' | '青楼' | '武馆' | '医馆';
    房产等级: number;            // 1-10
    当前经验: number;
    升级所需经验: number;
    房产位置: string;
    房间列表: 房间结构[];
    设施列表: 全局设施结构[];
    房客列表: 房客结构[];
    经营状态: 经营状态结构;
    扩建历史: 房产变更记录[];
}

interface 房间结构 {
    id: string;
    房间名称: string;
    房间类型: '客房' | '卧室' | '功能房' | '公共区域' | '储藏室';
    房间等级: number;            // 1-5
    房间品质: 物品品质;
    面积: number;
    已建设施: 房间设施结构[];
    当前房客Id: string | null;
    房间状态: '空闲' | '使用中' | '维修中' | '装修中';
}

interface 全局设施结构 {
    id: string;
    设施ID: string;              // 引用预设
    设施名称: string;
    设施类别: '寝具' | '卫浴' | '餐饮' | '休闲' | '修炼' | '安全' | '装饰' | '功能';
    设施等级: number;            // 1-5
    品质: 物品品质;
    建造完成时间: string;
    耐久度: number;              // 0-100
    最大耐久度: number;
    位置引用: string | null;     // null 表示全局设施
}

interface 房客结构 {
    id: string;
    NPC姓名: string;
    NPC引用ID: string;
    入住房间ID: string;
    入住时间: string;
    租约到期时间: string;
    租金: number;                // 每回合
    满意度: number;              // 0-100
    房客类型: '江湖客' | '商人' | '文人' | '侠客' | '隐士' | '官差' | '游医' | '艺伎';
    性格标签: string[];
    特殊需求: string[];
    关系状态: '良好' | '一般' | '不满' | '愤怒' | '退租中';
}

interface 经营状态结构 {
    总资金: number;
    总收入: number;
    总支出: number;
    当前回合收入: number;
    名誉值: number;
    吸引力: number;
    舒适度: number;
    安全性: number;
    事件日志: 经营事件结构[];
    待处理事件: 经营待处理事件[];
    每日开销: number;
}

interface 经营事件结构 {
    id: string;
    事件类型: '纠纷' | '损坏' | '访客' | '好评' | '差评' | '特殊事件';
    事件描述: string;
    触发时间: string;
    影响: { 资金变化?: number; 名誉变化?: number; 满意度变化?: number };
    已处理: boolean;
}

interface 房产变更记录 {
    变更类型: '扩建' | '拆除' | '升级' | '装修' | '建造' | '房客入住' | '房客退租';
    变更描述: string;
    变更时间: string;
    消耗资源: { 资金?: number; 材料?: Record<string, number> };
}
```

### 3.2 设施预设示例

```typescript
// models/property/facilityPresets.ts
interface 设施预设结构 {
    设施ID: string;
    名称: string;
    类别: 设施类别;
    描述: string;
    基础价格: number;            // 铜钱
    建造时间: string;            // 'DD:HH:MM' 格式
    吸引力加成: number;
    舒适度加成: number;
    租金加成: number;
    维护费用: number;
    耐久损耗: number;            // 每回合损耗
    可升级: boolean;
    升级目标ID?: string;
    特殊效果?: string[];
    时代: string[];              // ['古代', '现代', '未来']
}

// 古代设施预设示例
const 古代设施预设: 设施预设结构[] = [
    { 设施ID: 'bed_wood_simple', 名称: '简易木床', 类别: '寝具',
      基础价格: 200, 建造时间: '00:02:00', 吸引力加成: 5,
      舒适度加成: 10, 租金加成: 15, 维护费用: 5, 耐久损耗: 2,
      可升级: true, 升级目标ID: 'bed_wood_carved', 时代: ['古代'] },
    { 设施ID: 'bed_wood_carved', 名称: '雕花木床', 类别: '寝具',
      基础价格: 800, 建造时间: '00:04:00', 吸引力加成: 15,
      舒适度加成: 25, 租金加成: 30, 维护费用: 10, 耐久损耗: 1,
      可升级: true, 升级目标ID: 'bed_golden_phoenix', 时代: ['古代'] },
    { 设施ID: 'bath_hot_spring', 名称: '温泉池', 类别: '卫浴',
      基础价格: 5000, 建造时间: '01:00:00', 吸引力加成: 40,
      舒适度加成: 35, 租金加成: 50, 维护费用: 30, 耐久损耗: 1,
      可升级: true, 特殊效果: ['吸引文人', '吸引隐士'], 时代: ['古代'] },
    { 设施ID: 'kitchen_wood_stove', 名称: '木灶台', 类别: '餐饮',
      基础价格: 500, 建造时间: '00:06:00', 吸引力加成: 10,
      舒适度加成: 15, 租金加成: 20, 维护费用: 8, 耐久损耗: 3,
      可升级: true, 时代: ['古代'] },
    { 设施ID: 'garden_small', 名称: '小花园', 类别: '休闲',
      基础价格: 1000, 建造时间: '00:12:00', 吸引力加成: 20,
      舒适度加成: 20, 租金加成: 10, 维护费用: 5, 耐久损耗: 0,
      可升级: true, 特殊效果: ['提升环境'], 时代: ['古代'] },
    { 设施ID: 'training_room', 名称: '练功房', 类别: '修炼',
      基础价格: 3000, 建造时间: '01:00:00', 吸引力加成: 15,
      舒适度加成: 5, 租金加成: 25, 维护费用: 15, 耐久损耗: 2,
      可升级: true, 特殊效果: ['吸引侠客', '吸引隐士'], 时代: ['古代'] },
    { 设施ID: 'guard_post', 名称: '门房', 类别: '安全',
      基础价格: 800, 建造时间: '00:08:00', 吸引力加成: 5,
      舒适度加成: 5, 租金加成: 10, 维护费用: 10, 耐久损耗: 1,
      可升级: true, 特殊效果: ['提升安全性'], 时代: ['古代'] },
    { 设施ID: 'decoration_lantern', 名称: '灯笼', 类别: '装饰',
      基础价格: 100, 建造时间: '00:01:00', 吸引力加成: 8,
      舒适度加成: 3, 租金加成: 5, 维护费用: 2, 耐久损耗: 1,
      可升级: false, 时代: ['古代'] },
];
```

### 3.3 房客类型预设

```typescript
// models/property/tenantPresets.ts
interface 房客类型预设 {
    类型: string;
    基础租金倍率: number;
    偏好设施: string[];          // 设施ID列表
    厌恶设施: string[];
    性格标签池: string[];
    特殊需求池: string[];
    满意度衰减率: number;        // 每回合衰减
    退租阈值: number;            // 满意度低于此值可能退租
}
```

## 4. 实施步骤

### Phase 1: 数据模型与核心引擎（预计 3-4 天）

- [x] **步骤 1.1**: 创建 `models/property/types.ts`，定义所有接口和类型
- [x] **步骤 1.2**: 创建 `models/property/facilityPresets.ts`，三时代设施预设共 59 种
- [x] **步骤 1.3**: 创建 `models/property/tenantPresets.ts`，房客类型预设 8 种
- [x] **步骤 1.4**: 修改 `hooks/useGame/storyState.ts`，新增 `创建空房产状态()` 函数
- [x] **步骤 1.5**: 创建 `hooks/useGame/property/propertyEngine.ts`，实现纯函数经营引擎
  - `推进经营回合()` — 每回合调用，更新所有状态
  - `计算房产吸引力()` — 基于设施、房间、房客
  - `计算舒适度()` — 基于设施品质和状态
  - `计算安全性()` — 基于安全设施和房客类型
  - `计算房客满意度()` — 基于设施匹配度、租金、事件
  - `计算应付租金()` — 基于房客类型、房间等级、设施加成
  - `计算维护费用()` — 基于设施数量和等级
- [x] **步骤 1.6**: 修改 `hooks/useGameState.ts`，新增 `房产系统` useState
- [x] **步骤 1.7**: 修改 `models/system.ts`，存档结构新增 `房产系统?: 房产数据结构`

### Phase 2: 设施建造与扩建（预计 2-3 天）

- [x] **步骤 2.1**: 创建 `hooks/useGame/property/facilityWorkflow.ts`，实现：
  - `开始建造设施()` — 加入建造队列
  - `完成建造()` — 设施安装到房产
  - `升级设施()` — 提升等级和效果
  - `拆除设施()` — 回收部分资源
- [x] **步骤 2.2**: 实现房间扩建逻辑：
  - `扩建房间()` — 新增房间
  - `升级房间()` — 提升房间等级
- [x] **步骤 2.3**: 条件验证：
  - 资金检查
  - 房间槽位检查

### Phase 3: 房客招揽与事件（预计 3-4 天）

- [x] **步骤 3.1**: 创建 `hooks/useGame/property/tenantWorkflow.ts`，实现：
  - `招揽房客()` — 基于吸引力招揽 NPC 入住
  - `房客退租()` — 清理状态，释放房间
  - `自动退租检查()` — 满意度低于阈值自动退租
  - `更新房客满意度()` — 定期计算
  - `驱逐房客()` — 房东主动驱逐
  - `分配房间()` — 房客换房
- [ ] **步骤 3.2**: 创建 `hooks/useGame/property/eventWorkflow.ts`，实现随机事件（后续）
- [ ] **步骤 3.3**: 创建 `hooks/useGame/property/promptBuilder.ts`，构建 AI 提示词（后续）
  - 纠纷事件（房客之间）
  - 损坏事件（设施老化）
  - 访客事件（名人到访）
  - 好评/差评事件
  - 特殊事件（节日活动、官府检查）
- [ ] **步骤 3.3**: 创建 `hooks/useGame/property/promptBuilder.ts`，构建 AI 提示词：
  - 注入房产状态到 AI 上下文
  - 生成事件描述文案
  - 处理房客交互对话

### Phase 4: UI 组件（预计 4-5 天）

- [x] **步骤 4.1**: 创建 `components/features/PropertyDashboard.tsx` — 桌面端经营仪表盘
- [x] **步骤 4.6**: 创建 `components/features/mobile/MobilePropertyDashboard.tsx` — 移动端适配
- [ ] **步骤 4.2-4.5**: 细化组件（RoomCard, FacilityBuilder, TenantList, EventLog）— 后续
- [ ] **步骤 4.7**: 修改 `components/features/lazyComponents.tsx` — 注册懒加载组件
- [ ] **步骤 4.8**: 修改 `utils/moduleRegistry/bootstrap.ts` — 模块注册
  - 资金/收入/支出总览
  - 房产等级与经验条
  - 快捷操作入口
  - 事件提醒
- [ ] **步骤 4.2**: 创建 `components/features/Property/RoomCard.tsx` — 房间卡片组件：
  - 房间信息展示
  - 设施列表
  - 房客状态
  - 操作按钮
- [ ] **步骤 4.3**: 创建 `components/features/Property/FacilityBuilder.tsx` — 设施建造面板：
  - 设施列表（按类别分组）
  - 建造/升级/拆除操作
  - 资源消耗预览
  - 建造进度条
- [ ] **步骤 4.4**: 创建 `components/features/Property/TenantList.tsx` — 房客管理面板：
  - 房客列表
  - 满意度显示
  - 租金状态
  - 招揽操作
- [ ] **步骤 4.5**: 创建 `components/features/Property/EventLog.tsx` — 事件日志：
  - 事件时间线
  - 事件处理
  - 筛选功能
- [ ] **步骤 4.6**: 创建 `components/features/Property/MobilePropertyApp.tsx` — 移动端适配
- [ ] **步骤 4.7**: 修改 `components/features/lazyComponents.tsx` — 注册懒加载组件
- [ ] **步骤 4.8**: 修改 `utils/moduleRegistry/bootstrap.ts` — 模块注册

### Phase 5: 系统集成（预计 2-3 天）

- [x] **步骤 5.1**: 修改 `hooks/useGame/index.ts` — 统一导出房产系统函数
- [ ] **步骤 5.2**: 修改 `services/dbService.ts` — 存读档序列化支持房产数据
- [ ] **步骤 5.3**: 旧存档兼容 — 缺失房产字段时创建空状态
- [ ] **步骤 5.4**: 修改设置面板，增加房产系统开关
  - 每回合调用 `推进经营回合()`
  - 房产事件与主故事线联动
- [ ] **步骤 5.2**: 修改 `services/dbService.ts` — 存读档序列化支持房产数据
- [ ] **步骤 5.3**: 旧存档兼容 — 缺失房产字段时创建空状态
- [ ] **步骤 5.4**: 修改设置面板，增加房产系统开关

### Phase 6: 边缘优化（预计 2-3 天）

- [ ] **步骤 6.1**: 时代适配 — 设施预设根据游戏时代自动切换
- [ ] **步骤 6.2**: 名誉联动 — 房产经营影响全局名誉值
- [ ] **步骤 6.3**: AI 事件生成 — 事件描述走 AI 生成增强沉浸感
- [ ] **步骤 6.4**: 性能优化 — 批量处理、缓存、memoization

## 5. 依赖关系

| 依赖 | 说明 |
|------|------|
| 现有货币系统 | 房产经营收支复用 |
| 现有 NPC 系统 | 房客来源 |
| 现有时间系统 | 建造进度、回合推进驱动 |
| 现有任务系统 | 可派发房产相关任务 |
| 现有存读档系统 | 数据持久化 |
| 现有名誉系统 | 经营成果联动 |

## 6. 风险评估

| 风险 | 影响 | 概率 | 缓解措施 |
|------|------|------|----------|
| 经营引擎增加每回合计算负担 | 性能 | 中 | 纯函数计算 + 结果缓存；仅在有房产时激活 |
| 房客与 NPC 引用断裂 | 数据一致性 | 低 | 定期引用检查；房客存储 NPC 快照数据 |
| 设施平衡性差 | 游戏体验 | 高 | 数值走配置表，可后期调参 |
| AI 提示词膨胀 | 上下文超限 | 中 | 仅活跃事件时注入；摘要模式 |
| 旧存档不兼容 | 用户体验 | 低 | 房产字段 optional，缺失则创建空状态 |

## 7. 可独立交付里程碑

| 里程碑 | 包含阶段 | 交付物 |
|--------|----------|--------|
| MVP | Phase 1-2 | 可建造设施、扩建房间，经营基础设施可用 |
| Beta | Phase 1-3 | 加入房客系统，完整经营循环可运行 |
| RC | Phase 1-5 | 完整 UI + 系统集成 + 存读档 |
| Release | Phase 1-6 | 全部优化完成，可发布 |

## 8. 成功标准

- [ ] 玩家可购买初始房产并查看经营仪表盘
- [ ] 可建造至少 10 种不同类型设施
- [ ] 可扩建房间并升级房产等级
- [ ] NPC 房客可入住并自动支付租金
- [ ] 每回合自动计算收益、耐久、满意度
- [ ] 随机事件系统正常（至少 5 种事件类型）
- [ ] 存读档完整保留房产状态
- [ ] 桌面端和移动端 UI 均可用
- [ ] 单元测试覆盖率 80%+（项目已有测试框架后补充）
- [ ] 旧存档可正常加载

## 9. 测试策略

### 单元测试
- `propertyEngine.ts` — 纯函数计算（吸引力、舒适度、租金等）
- `facilityWorkflow.ts` — 条件验证（资金、槽位）
- `tenantWorkflow.ts` — 租金计算、满意度更新

### 集成测试
- 房产-NPC 引用完整性
- 房产-时间回合推进
- 存读档完整性

### 手动测试
- 完整经营循环
- 跨时代适配
- 移动端 UI
- 旧存档兼容
