# 实现方案：人物关系谱系统

## 概述

构建一个完整的人物关系库，让玩家能够查看、追踪和可视化主角与所有 NPC 之间的关系。系统将新增结构化的关系数据模型、关系网络图谱可视化、详细的关系历史追踪，以及桌面端和移动端的 UI 弹窗——同时与现有的社交系统（`state.社交`、`NPC结构.关系网变量`）和校园关系引擎（`models/campusNSFW/relationship.ts`）无缝集成。

## 需求

- **R1**：查看主角与每个 NPC 之间的关系（好感度、关系类型、历史事件）
- **R2**：查看 NPC 与 NPC 之间的关系（基于现有 `关系网变量` 并扩展详情）
- **R3**：查看详细的关系进展——多维度指标（好感度、亲密度、信任度、感情值）配合进度条
- **R4**：查看关系历史/时间线——塑造关系的关键事件
- **R5**：查看关系网络/图谱可视化——节点 = 人物，边 = 关系
- **R6**：与现有社交系统集成——复用 `NPC结构`、`关系网变量`、校园 NSFW `NPC关系数据`
- **R7**：在存档中持久化关系数据——无需新增 IndexedDB 表（数据存储在存档内）
- **R8**：桌面端和移动端 UI 组件，遵循现有 JRPG 风格设计规范

## 架构变更

### 新增数据模型：`models/relationship.ts`
- 定义 `人物关系边`（两个人物之间的关系边）
- 定义 `人物关系档案`（两个人物之间的完整关系档案）
- 定义 `关系网络数据`（整个关系图谱）
- 定义关系分类（亲情、友情、爱情、敌对、师徒、同门、主从等）
- 定义 `关系事件记录`（关系事件/时间线条目）
- 工具函数：计算关系摘要、判定关系谱阶段、构建图谱邻接数据

### 新增状态字段：`state.关系谱`（存档结构上）
- 在 `models/system.ts` 和 `models/game-settings.ts` 的 `存档结构` 中添加 `关系谱?: 关系网络数据`
- 在 `services/dbService.ts` 的 `清洗导入存档()` 中添加对新增字段的处理

### 新增工作流：`hooks/useGame/relationshipNetworkWorkflow.ts`
- 从 `state.社交` + 主角信息构建关系网络
- 将校园 NSFW `NPC关系数据` 同步到统一关系模型
- 提供函数：`构建关系网络`、`更新关系边`、`添加关系事件`、`获取主角关系摘要`、`获取NPC关系摘要`
- 工具：`将关系网络转为图谱数据`（转换为节点-边格式用于可视化）

### 新增 UI 组件
- `components/features/Relationship/RelationshipModal.tsx`（桌面端）——主关系查看器
- `components/features/Relationship/MobileRelationship.tsx`（移动端）
- `components/features/Relationship/RelationshipGraph.tsx`——关系网络图谱可视化（纯 SVG，不引入外部库）
- `components/features/Relationship/RelationshipDetailPanel.tsx`——特定关系的详情视图
- `components/features/Relationship/RelationshipTimeline.tsx`——时间线/历史视图

### 新增懒组件注册
- 在 `components/features/lazyComponents.tsx` 中注册

### App.tsx 集成
- 添加 `state.showRelationship` 视图状态
- 在桌面端和移动端添加路由
- 从 `useGame` 绑定 props

### useGame 集成
- 在 `hooks/useGame/types.ts` 的 `UseGameSetters` 中添加 `setShowRelationship`
- 在 `UseGameActions` 中添加关系相关操作（手动更新关系、记录关系事件）
- 在存档/读档工作流中集成关系网络构建

## 数据模型设计

### 核心接口（`models/relationship.ts`）

```typescript
// 关系分类
export type 关系分类 =
  | '亲情'   // family
  | '友情'   // friend
  | '爱情'   // lover/romantic
  | '敌对'   // enemy
  | '师徒'   // master-disciple
  | '同门'   // sect siblings
  | '主从'   // master-servant
  | '恩仇'   // benefactor/rival
  | '陌路';  // stranger

// 关系谱阶段（递进式）
export type 关系谱阶段 =
  | '素未谋面'
  | '初识'
  | '点头之交'
  | '熟识'
  | '挚交'
  | '知己'
  | '生死之交';

// 单个关系事件（时间线条目）
export interface 关系事件记录 {
  id: string;
  时间: string;          // 游戏时间字符串
  事件类型: '初识' | '对话' | '赠礼' | '相助' | '冲突' | '结缘' | '决裂' | '突破' | '其他';
  标题: string;
  描述: string;
  好感度变化?: number;
  亲密度变化?: number;
  信任度变化?: number;
  感情值变化?: number;
}

// 关系网络中的一条边
export interface 人物关系边 {
  id: string;                         // 唯一边ID，如 "player->npc001" 或 "npc001->npc002"
  主体姓名: string;                   // 来源角色姓名
  客体姓名: string;                   // 目标角色姓名
  客体ID?: string;                    // 目标NPC ID（如果存在于社交列表中）
  关系分类: 关系分类;
  关系谱阶段: 关系谱阶段;
  关系描述: string;                   // 自由描述，如 "青梅竹马"、"杀父仇人"
  好感度: number;                     // 0-100
  亲密度: number;                     // 0-100
  信任度: number;                     // 0-100
  感情值: number;                     // 0-100
  互动次数: number;
  最近互动时间?: string;
  事件记录: 关系事件记录[];
  双向关系?: boolean;                 // true 表示目标也有指向来源的关系
}

// 完整的关系网络
export interface 关系网络数据 {
  主角姓名: string;
  关系边列表: 人物关系边[];
  最后更新时间: string;
}
```

### 设计说明

- **不新增 IndexedDB 表**：关系数据存储在存档文件中（`存档结构.关系谱`），与 `社交`、`任务列表` 等的存储方式相同
- **向后兼容**：所有新增字段均为可选（`?`）。老存档加载时不包含关系网络，会从现有的 `NPC结构.关系网变量` + `NPC结构.好感度` + `NPC结构.关系状态` 懒初始化
- **复用现有数据**：系统从 `NPC结构`（好感度、关系状态、关系网变量）和 `NPC关系数据`（校园NSFW）读取数据并构建统一视图
- **图谱可视化**：纯 SVG 实现——不引入外部图谱库。节点使用简单的径向布局（以主角为中心）

## UI 组件设计

### RelationshipModal.tsx（桌面端）

布局：三面板设计（类似 SocialModal 的现有模式）

```
+----------------------------------------------------------+
| 标题栏：「人物关系谱」+ 关闭按钮                          |
+------------------+---------------------------------------+
| 左侧面板         | 右侧面板（标签页）                    |
| 角色列表         | [标签1: 关系总览] [标签2: 关系图谱]    |
| + 搜索过滤       |                                        |
|                  | 标签1: 选中角色的详情卡片              |
| - 主角           |   - 多维度进度条                      |
| - NPC 列表       |   - 关系分类徽章                      |
|（可过滤）        |   - NPC间关系                         |
|                  |   - 关系时间线                        |
|                  |                                        |
|                  | 标签2: 关系网络图谱（SVG）            |
|                  |   - 主角中心节点                      |
|                  |   - 周围 NPC 节点                     |
|                  |   - 按分类着色的关系边                |
|                  |   - 悬停显示概要信息                  |
|                  |   - 点击边查看详情                    |
+------------------+---------------------------------------+
```

### MobileRelationship.tsx（移动端）

- 全屏弹窗，可滑动标签页
- 标签1：角色列表 + 关系详情
- 标签2：简化版关系图谱（触屏优化）

### RelationshipGraph.tsx（关系图谱）

- 基于 SVG 的可视化
- 节点：圆形，显示角色首字母/姓名，按性别着色
- 边：线条，按关系分类着色（亲情=粉色，友情=蓝色，爱情=红色，敌对=深红，师徒=金色等）
- 简单的迭代力导向布局（不使用 D3，轻量级自定义实现约 100 行）
- 支持拖拽交互来重新定位节点
- 通过 CSS 变换实现缩放/平移

### RelationshipDetailPanel.tsx（关系详情面板）

- 显示选中角色与主角的关系
- 多维度指标条（好感度/亲密度/信任度/感情值）
- 关系分类徽章 + 关系谱阶段徽章
- 该角色与其他 NPC 的关系列表
- 可展开的关系时间线

### RelationshipTimeline.tsx（关系时间线）

- 垂直时间线组件（类似 SocialModal 中现有的记忆时间线）
- 每个事件显示时间、类型图标、标题、描述和数值变化

## 集成点

### 1. 现有社交系统
- `SocialModal.tsx` 已展示 `关系网变量`（基础的 NPC 间关系边）
- 新的 RelationshipModal 提供**专用的、扩展的视图**，包含相同的 data 以及更丰富的指标
- `NPC结构.好感度` 和 `NPC结构.关系状态` 作为基础数据源

### 2. 校园 NSFW 关系引擎
- `models/campusNSFW/relationship.ts` 的 `NPC关系数据` 包含好感度/亲密度/信任度/感情值
- 新系统在可用时读取这些值并合并到 `人物关系边`
- 不修改校园 NSFW 引擎——纯读取集成

### 3. 存档/读档
- `关系谱` 字段添加到 `存档结构`
- `dbService.ts` 中的 `清洗导入存档()` 处理新字段
- 读档时：如果缺少 `关系谱`，从 `社交` 数据懒构建

### 4. 剧情生成（LLM）
- 关系数据作为运行时变量的一部分发送给 LLM（类似已有的社交数据发送方式）
- LLM 可以通过现有的 `t_npc` / `t_var` 指令通道输出关系变化
- **第 3 阶段实现**——不属于 MVP 范围

### 5. 状态管理
- `state.关系谱` 存储在游戏状态中
- 新增设置器：`setShowRelationship`
- 新增操作：`updateRelationshipEdge`、`recordRelationshipEvent`

## 实施步骤

### 第一阶段：数据模型与核心逻辑（基础）

**目标**：定义数据模型和纯工具函数。不涉及 UI 变更。可独立测试。

1. **创建关系数据模型**（文件：`/home/fz/project/MoRanJiangHu/models/relationship.ts`）
   - 定义所有接口：`关系分类`、`关系谱阶段`、`关系事件记录`、`人物关系边`、`关系网络数据`
   - 定义常量：关系分类颜色、阶段阈值、事件类型图标
   - 为什么：为后续所有工作奠定基础
   - 依赖：无
   - 风险：低

2. **创建关系工具函数**（文件：`/home/fz/project/MoRanJiangHu/models/relationship.ts`）
   - `创建默认关系网络(主角姓名: string): 关系网络数据`
   - `创建人物关系边(主体, 客体, 分类, 阶段, 描述): 人物关系边`
   - `计算关系谱阶段(好感度, 亲密度, 信任度, 感情值): 关系谱阶段`
   - `计算关系分类(关系状态文本): 关系分类`——从现有 `关系状态` 字符串的启发式映射
   - `获取关系摘要(边: 人物关系边): string`
   - `验证关系边(边: 人物关系边): boolean`
   - 为什么：UI 和工作流依赖的核心逻辑
   - 依赖：步骤 1
   - 风险：低

3. **创建关系网络构建器**（文件：`/home/fz/project/MoRanJiangHu/hooks/useGame/relationshipNetworkWorkflow.ts`）
   - `构建关系网络(社交列表: NPC结构[], 主角姓名: string): 关系网络数据`
     - 从 `NPC结构.好感度`、`NPC结构.关系状态` 构建主角-NPC 关系边
     - 从 `NPC结构.关系网变量` 构建 NPC-NPC 关系边
     - 如果可用，合并校园 NSFW `NPC关系数据`
   - `从NPC关系数据合并(网络: 关系网络数据, 校园系统?: any): 关系网络数据`
   - `将关系网络转为图谱数据(网络: 关系网络数据): { nodes: GraphNode[]; edges: GraphEdge[] }`
   - 为什么：将现有存档数据转换为新的统一格式
   - 依赖：步骤 1-2
   - 风险：中——需要优雅处理缺失/不完整的数据

4. **添加到存档结构**（文件：`/home/fz/project/MoRanJiangHu/models/system.ts`、`/home/fz/project/MoRanJiangHu/models/game-settings.ts`、`/home/fz/project/MoRanJiangHu/services/dbService.ts`）
   - 在两个 `存档结构` 定义中添加 `关系谱?: 关系网络数据`
   - 在 `dbService.ts` 的 `清洗导入存档()` 中添加深拷贝处理
   - 为什么：在存档间持久化关系数据
   - 依赖：步骤 1
   - 风险：低

### 第二阶段：UI 组件（核心体验）

**目标**：构建关系查看器弹窗，包括桌面端和移动端版本，以及详情面板和时间线。

5. **创建 RelationshipDetailPanel 组件**（文件：`/home/fz/project/MoRanJiangHu/components/features/Relationship/RelationshipDetailPanel.tsx`）
   - Props：`{ 关系边: 人物关系边; 关联关系边?: 人物关系边[] }`
   - 多维度进度条（好感度/亲密度/信任度/感情值）带颜色渐变
   - 关系分类徽章（彩色药丸形）+ 阶段徽章
   - 关系描述文本
   - 子区域：「TA与其他人的关系」——列出涉及该角色的其他关系边
   - 为什么：桌面端和移动端弹窗共用的核心详情视图
   - 依赖：第一阶段
   - 风险：低

6. **创建 RelationshipTimeline 组件**（文件：`/home/fz/project/MoRanJiangHu/components/features/Relationship/RelationshipTimeline.tsx`）
   - Props：`{ 事件列表: 关系事件记录[] }`
   - 带类型特定图标的垂直时间线
   - 复用 `SocialModal.tsx` 中现有的时间线 CSS 模式（记忆时间线部分）
   - 支持事件描述的展开/折叠
   - 为什么：展示关系历史
   - 依赖：步骤 5
   - 风险：低

7. **创建 RelationshipGraph SVG 可视化**（文件：`/home/fz/project/MoRanJiangHu/components/features/Relationship/RelationshipGraph.tsx`）
   - Props：`{ 网络: 关系网络数据; 选中边?: string; on边Click: (id: string) => void }`
   - 基于 SVG 的力导向布局（简单的自定义实现，约 100-150 行）
   - 节点：主角（居中，金色）、NPC（环绕，按性别着色）
   - 边：按关系分类着色的线条
   - 悬停工具提示显示关系概要
   - 点击边以选中
   - 支持拖拽交互来重新定位节点
   - 为什么：视觉化网络概览——本功能的核心差异化点
   - 依赖：步骤 3（`将关系网络转为图谱数据`）
   - 风险：高——力导向布局较复杂；先用简单的径向布局作为后备方案

8. **创建 RelationshipModal（桌面端）**（文件：`/home/fz/project/MoRanJiangHu/components/features/Relationship/RelationshipModal.tsx`）
   - 三面板布局：左侧（角色列表）+ 右侧（标签页：详情/图谱）
   - 遵循现有 `SocialModal.tsx` 设计风格（JRPG 风格，暗色主题，金色点缀）
   - 带搜索过滤的角色列表
   - 标签1：详情面板 + 时间线
   - 标签2：关系网络图谱
   - Props 来自 `useGame`：`socialList`、`关系谱`、`playerName`、`onClose`
   - 为什么：桌面端主要 UI 入口
   - 依赖：步骤 5、6、7
   - 风险：中——布局较复杂

9. **创建 MobileRelationship（移动端）**（文件：`/home/fz/project/MoRanJiangHu/components/features/Relationship/MobileRelationship.tsx`）
   - 全屏弹窗，带标签导航
   - 遵循现有 `MobileSocial.tsx` 模式
   - 标签1：角色列表 → 详情 → 时间线
   - 标签2：简化版图谱（触屏优化）
   - 为什么：移动端适配
   - 依赖：步骤 5、6、7
   - 风险：中

10. **注册懒组件**（文件：`/home/fz/project/MoRanJiangHu/components/features/lazyComponents.tsx`）
    - 添加 `RelationshipModal` 和 `MobileRelationship` 导出
    - 为什么：启用懒加载（与其他功能弹窗一致）
    - 依赖：步骤 8、9
    - 风险：低

### 第三阶段：应用集成与状态接线 [x]

**目标**：将新弹窗接入应用，添加状态管理，连接到现有社交系统。

11. **[x] 添加状态和设置器**（文件：`/home/fz/project/MoRanJiangHu/hooks/useGame/types.ts`）
    - [x] 在 `UseGameSetters` 中添加 `setShowRelationship`
    - [x] 在 `useGameState.ts` 中添加 `showRelationship` 状态
    - [x] 在 `GameStateContext.tsx` 的 `GameModal` 接口中添加 `showRelationship`
    - [x] 在 `gameStateAccess.ts` 中添加类型和实现
    - [x] 在 `useGame.ts` 中解构设置器
    - [x] 在 `useModalOpeners.ts` 中添加 `GameSetters` 类型、`openRelationship`、`closeRelationship`
    - 为什么：状态管理集成
    - 依赖：第一阶段
    - 风险：低

12. **[x] 集成到 App.tsx / GameView.tsx**
    - [x] 在 App.tsx 中解构 `openRelationship` / `closeRelationship`
    - [x] 传递 `openRelationship` 到 `GameView`
    - [x] 在 `ModalLayer` 中渲染 `RelationshipModal` / `MobileRelationship`
    - 为什么：让用户可以访问该功能
    - 依赖：步骤 10、11
    - 风险：中

13. **[x] 添加导航入口**
    - [x] 在 `RightPanel.tsx` 中添加「关系」按钮
    - [x] 在 `MobileQuickMenu.tsx` 的 `PRIMARY_MENUS` 中添加「关系」
    - [x] 在 `useModalOpeners.ts` 的 `handleMobileMenuClick` 中添加 '关系' 路由
    - 为什么：用户需要一个打开关系查看器的方式
    - 依赖：步骤 12
    - 风险：低

### 第四阶段：边界情况与优化

**目标**：处理边界情况、性能优化和用户体验打磨。

15. **懒初始化与迁移**（文件：`/home/fz/project/MoRanJiangHu/hooks/useGame/relationshipNetworkWorkflow.ts`）
    - 加载不含 `关系谱` 的老存档时，从现有数据自动构建
    - 处理没有 `关系网变量` 的 NPC（显示「暂无记录」）
    - 处理主角没有名字的情况（使用默认值「少侠」）
    - 为什么：向后兼容
    - 依赖：第三阶段
    - 风险：低

16. **性能：多节点图谱**（文件：`/home/fz/project/MoRanJiangHu/components/features/Relationship/RelationshipGraph.tsx`）
    - 添加节点数量限制（仅显示好感度最高的前 N 个，带「显示更多」开关）
    - 节流力导向计算
    - 为大型网络添加加载状态
    - 为什么：防止 50+ NPC 时卡顿
    - 依赖：步骤 7
    - 风险：中

17. **关系事件自动记录**（文件：`/home/fz/project/MoRanJiangHu/hooks/useGame/relationshipNetworkWorkflow.ts`）
    - 接入剧情响应解析：从 `t_var` / `t_npc` 指令中检测关系变化
    - 当 `好感度` 变化超过阈值（>5）时自动添加 `关系事件记录`
    - 为什么：自动保持关系历史更新
    - 依赖：第三阶段
    - 风险：高——需要仔细集成到现有响应管道

18. **导出/导入兼容**（文件：`/home/fz/project/MoRanJiangHu/services/dbService.ts`、现有导入/导出）
    - 确保 `关系谱` 包含在存档导出中
    - 确保导入能处理有/无 `关系谱` 的存档
    - 为什么：数据可移植性
    - 依赖：步骤 4
    - 风险：低

## 测试策略

- **单元测试**：`models/relationship.ts`——所有纯函数（阶段计算、分类映射、网络构建）
- **集成测试**：`relationshipNetworkWorkflow.ts`——从模拟 `NPC结构[]` 数据构建网络
- **手动端到端测试**：
  - 从社交界面打开关系弹窗
  - 选择一个角色并验证详情面板显示正确的数据
  - 切换到图谱标签页并验证网络正确渲染
  - 在图谱上点击一条边并验证详情面板更新
  - 保存游戏、重新加载、验证关系数据持久化
  - 导入老存档（不含 `关系谱`），验证懒初始化正常工作

## 风险与缓解

- **风险**：力导向图谱布局复杂且可能性能不佳
  - **缓解**：先用简单的径向布局（主角居中，NPC 环绕）。仅在时间允许时添加力导向模拟。使用 CSS 变换进行缩放/平移而非 Canvas。

- **风险**：App.tsx 已有 1680+ 行，添加更多路由增加复杂度
  - **缓解**：保持集成最小化——只添加 showRelationship 状态检查和组件渲染。使用现有的懒组件模式。

- **风险**：关系数据可能与现有校园 NSFW `NPC关系数据` 冲突
  - **缓解**：新系统对校园 NSFW 数据是只读的。合并到统一视图时不修改源数据。

- **风险**：大型社交列表（50+ NPC）会使图谱难以阅读
  - **缓解**：实现过滤（仅显示好感度超过阈值的角色）、搜索和「聚焦模式」（高亮显示选定角色的连接）。

- **风险**：与老存档的向后兼容性
  - **缓解**：所有新增字段均为可选。懒初始化在加载时从现有 `社交` 数据构建关系网络。

## 成功标准

- [ ] 关系弹窗可以从社交界面打开（桌面端和移动端）
- [ ] 角色列表显示主角和社交列表中的所有 NPC
- [ ] 详情面板显示四维指标（好感度/亲密度/信任度/感情值）带可视化进度条
- [ ] 关系分类和阶段以彩色徽章显示
- [ ] NPC 间关系列在详情面板中
- [ ] 关系时间线展示历史事件
- [ ] 关系网络图谱渲染，主角居中，NPC 通过彩色边连接
- [ ] 点击图谱边高亮对应角色的详情
- [ ] 关系数据在存档/读档周期中持久化
- [ ] 不含 `关系谱` 的老存档正确加载并自动初始化数据
- [ ] 对现有 SocialModal 功能无回归
- [ ] 图谱在 30+ NPC 下性能可接受（渲染 < 200ms）
