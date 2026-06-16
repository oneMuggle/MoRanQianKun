# 末日纪元搜集建造系统 — 设计计划文档

**日期**: 2026-05-19

**状态**: 待实施

---

## 一、需求分析总结

### 1.1 目标

在现代纪元及其末日子纪元（丧尸危机、极寒末日、核冬天、生化危机、末日废土）中，增加一套独立的搜集建造玩法子系统，与现有AI叙事系统并行运作。

### 1.2 核心玩法

| 系统 | 描述 |
|------|------|
| 搜集系统 | 选择地点类型进行搜掠，概率分布产出，危险遭遇，地点枯竭 |
| 建造系统 | 避难所设施建设升级，被动加成与能力解锁，建造队列 |
| 资源管理 | 10类资源每日消耗，存储上限受设施等级影响 |
| 角色状态 | 8维生存指标（饥饿/口渴/体温/疲劳/健康/精神/感染/辐射），恶化等级联动 |
| 日程循环 | 白天搜集/建造/制作，夜晚防御/事件/休息，天数递增难度 |
| 制作系统 | 资源合成物品，需设施等级解锁，成功率判定 |
| **招募系统** | **NPC独立人格/好感度/忠诚度，可分配任务，可能背叛或离队** |
| **NSFW系统** | **幸存者亲密事件 + 生存脆弱状态，与现有NSFW模式联动** |

### 1.3 设计原则

- **独立性**: 作为独立SLG引擎运行，不破坏现有武侠/志怪系统
- **可插拔**: 通过 EngineType 注册到 GameOrchestrator，按纪元条件激活
- **与AI叙事协同**: 搜集建造结果通过 NarrativeConstraint 注入AI提示词
- **移动端优先**: 桌面端和移动端两套UI

### 1.4 参考现有系统

- **房产SLG系统** (`models/property/`, `hooks/useGame/property/`): 设施建造/升级/队列模式
- **日常城镇引擎** (`hooks/useGame/engine/dailyTownEngine.ts`): 区域移动/行动力/时段推进
- **RPG物品引擎** (`hooks/useGame/engine/rpgItemEngine.ts`): 物品管理/背包
- **社交系统** (`models/domain/social.ts`): NPC关系/好感度基础
- **引擎基类** (`hooks/useGame/engine/baseEngine.ts`): SLGEngine 接口继承

---

## 二、系统架构设计

### 2.1 架构总览

```
┌─────────────────────────────────────────────────────────────┐
│                      GameOrchestrator                       │
│  ┌───────────┐ ┌───────────┐ ┌──────────────────────────┐   │
│  │ survival  │ │  rpgBattle│ │     avgDialogue          │   │
│  │  Engine   │ │  Engine   │ │     Engine               │   │
│  └─────┬─────┘ └─────┬─────┘ └────────────┬─────────────┘   │
│        │              │                     │                 │
│  ┌─────┴──────────────┴─────────────────────┴─────────────┐  │
│  │              SurvivalSubSystems (纯函数层)               │  │
│  │  ┌──────────┐ ┌──────────┐ ┌────────┐ ┌────────────┐   │  │
│  │  │ gathering│ │ building │ │crafting│ │  survival  │   │  │
│  │  │  .ts     │ │   .ts    │ │  .ts   │ │   tick.ts  │   │  │
│  │  └──────────┘ └──────────┘ └────────┘ └────────────┘   │  │
│  │  ┌──────────┐ ┌──────────┐                              │  │
│  │  │recruiting│ │  nsfw    │                              │  │
│  │  │  .ts     │ │  .ts     │                              │  │
│  │  └──────────┘ └──────────┘                              │  │
│  └────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                    NarrativeConstraint注入
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  AI 叙事层 (systemPromptBuilder)              │
│    搜集结果、状态恶化、夜晚事件、NSFW事件作为约束注入          │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 模块分层

| 层 | 职责 | 文件位置 |
|----|------|----------|
| 类型定义 | 所有TypeScript接口和类型 | `models/survival/types.ts` |
| 数据预设 | 地点、设施、配方、事件、NPC人格模板 | `models/survival/presets.ts` |
| 引擎层 | SLG引擎接口实现 | `hooks/useGame/engine/survivalEngine.ts` |
| 子系统 | 纯函数计算逻辑 | `hooks/useGame/survival/` |
| UI组件 | 桌面端/移动端视图 | `components/features/Survival/` |
| 状态桥接 | 与useGame主状态的映射 | `hooks/useGame/survival/survivalStateBridge.ts` |

---

## 三、详细TypeScript类型定义

### 3.1 核心类型 — `models/survival/types.ts`

```typescript
// ============================================================
// 末日纪元搜集建造系统 — 类型定义
// ============================================================

// ─── 子纪元类型 ───

export type 末日纪元类型 =
    | '丧尸危机'
    | '极寒末日'
    | '核冬天'
    | '生化危机'
    | '末日废土';

// ─── 搜集地点 ───

export type 地点危险等级 = '安全' | '低风险' | '中风险' | '高风险' | '死亡区域';

export interface 搜集地点预设 {
    id: string;
    名称: string;
    类型: 地点类型;
    危险等级: 地点危险等级;
    描述: string;
    产出权重: Record<string, number>;
    特殊产出?: Array<{ 物品ID: string; 概率: number }>;
    遭遇威胁: 威胁类型[];
    搜集耗时: number;
    剩余可搜次数: number;
    恢复速率: number;
    适用纪元: 末日纪元类型[];
}

export type 地点类型 =
    | '超市' | '医院' | '军事基地' | '居民区' | '加油站'
    | '警察局' | '仓库' | '学校' | '工厂' | '农场'
    | '下水道' | '商场' | '图书馆' | '教堂' | '避难所废墟';

// ─── 资源系统 ───

export type 资源类型 =
    | '食物' | '水' | '药品' | '木材' | '金属'
    | '布匹' | '电子零件' | '燃料' | '弹药' | '杂物';

export interface 资源存储 {
    食物: number; 水: number; 药品: number;
    木材: number; 金属: number; 布匹: number;
    电子零件: number; 燃料: number; 弹药: number; 杂物: number;
}

// ─── 角色生存状态 ───

export interface 生存状态 {
    饥饿值: number;       // 0-100
    口渴值: number;       // 0-100
    体温: number;         // -50 ~ +50
    疲劳值: number;       // 0-100
    健康值: number;       // 0-100
    精神状态: number;     // 0-100
    感染值: number;       // 0-100（丧尸/生化纪元）
    辐射值: number;       // 0-100（核冬天纪元）
}

export type 状态恶化等级 = '正常' | '轻微' | '中度' | '严重' | '濒死';

export interface 状态恶化效果 {
    等级: 状态恶化等级;
    搜集效率修正: number;
    战斗能力修正: number;
    制作成功率修正: number;
    描述: string;
}

export interface 生存负面状态 {
    id: string;
    名称: string;
    描述: string;
    原因: string;
    持续时间: number;
    效果: {
        饥饿值修正?: number; 口渴值修正?: number;
        体温修正?: number; 疲劳值修正?: number;
        健康值修正?: number; 精神状态修正?: number;
        搜集效率修正?: number;
    };
}

// ─── 背包系统 ───

export interface 背包格 {
    物品名称: string; 物品类型: string;
    数量: number; 重量: number; 品质: string; 描述: string;
}

export interface 背包状态 {
    容量: number; 已用格数: number;
    物品列表: 背包格[]; 当前负重: number; 最大负重: number;
}

// ─── 设施建造 ───

export type 设施类别 =
    | '基础设施' | '资源设施' | '生产设施' | '防御设施'
    | '能源设施' | '存储设施' | '舒适设施' | '特殊设施';

export type 设施状态 = '建造中' | '运行中' | '损坏' | '已拆除';

export interface 设施预设 {
    id: string; 名称: string; 类别: 设施类别; 描述: string;
    建造成本: Partial<资源存储>;
    建造回合: number;
    最大等级: number;
    等级效果: Array<{ 等级: number; 描述: string; 效果: Record<string, number> }>;
    维护消耗: Partial<资源存储>;
    基础耐久: number;
    适用纪元: 末日纪元类型[];
    前置设施: string[];
}

export interface 已建设施 {
    id: string; 设施ID: string; 名称: string; 类别: 设施类别;
    等级: number; 当前耐久: number; 最大耐久: number; 状态: 设施状态;
    建造开始回合: number; 建造完成回合: number | null;
    最后维护回合: number;
}

// ─── 制作系统 ───

export type 配方类别 = '武器' | '工具' | '药品' | '陷阱' | '衣物' | '食物加工' | '弹药';

export interface 制作配方 {
    id: string; 名称: string; 类别: 配方类别; 描述: string;
    材料消耗: Partial<资源存储>;
    制作回合: number;
    产出: { 物品名称: string; 数量: number; 描述: string; 品质: string };
    所需设施?: string;
    所需设施等级?: number;
    基础成功率: number;
    适用纪元: 末日纪元类型[];
}

export interface 制作中任务 {
    id: string; 配方ID: string; 配方名称: string;
    开始回合: number; 预计完成回合: number; 成功率: number;
}

// ─── 威胁与遭遇 ───

export type 威胁类型 =
    | '丧尸群' | '变异生物' | '掠夺者' | '恶劣天气' | '辐射尘' | '感染者';

export interface 威胁遭遇 {
    id: string; 类型: 威胁类型; 描述: string;
    危险等级: number; 战斗难度: number;
    可能损失: { 健康值损失?: number; 资源损失?: Partial<资源存储>; 感染风险?: number };
    逃避成功率: number;
    击退奖励?: { 资源: Partial<资源存储>; 经验: number };
}

// ─── 夜间事件 ───

export type 夜间事件类型 =
    | '袭击' | '恶劣天气' | '随机事件' | '设施故障' | '内部问题' | '平静夜晚';

export interface 夜间事件 {
    id: string; 类型: 夜间事件类型; 描述: string;
    影响: { 设施损伤?: string[]; 资源损失?: Partial<资源存储>; 状态变化?: Partial<生存状态> };
    应对选项: Array<{ 标签: string; 描述: string; 成功概率: number; 成功结果: string; 失败结果: string }>;
}

// ─── 日程阶段 ───

export type 日程阶段 =
    | '白天-空闲' | '白天-搜集' | '白天-建造' | '白天-制作'
    | '夜晚-防御' | '夜晚-休息';

// ─── 搜集任务 ───

export interface 搜集任务 {
    id: string; 地点ID: string; 地点名称: string;
    开始回合: number; 预计返回回合: number;
    参与人员: string[];
    目标资源?: 资源类型[];
}

// ============================================================
// ★ 招募系统类型定义
// ============================================================

// ─── NPC人格 ───

export type NPC人格类型 = '勇敢型' | '谨慎型' | '自私型' | '忠诚型' | '智慧型' | '懦弱型' | '狂热型';

export type NPC技能专长 =
    | '搜集'    // 提高搜集结算产出
    | '战斗'    // 提高夜间防御/遭遇战斗效果
    | '制作'    // 提高制作成功率和速度
    | '医疗'    // 加速健康值恢复，降低感染
    | '工程'    // 降低建造消耗，提高设施耐久
    | '侦察'    // 降低遭遇概率，提前发现危险
    | '烹饪'    // 食物消耗降低
    | '心理安抚' // 减缓精神值衰减

export interface 幸存者预设 {
    id: string;
    姓名: string;
    描述: string;          // 背景故事简述
    人格类型: NPC人格类型;
    专长: NPC技能专长[];
    专长等级: number;      // 1-5，影响加成幅度
    初始好感: number;       // 0-100
    初始忠诚: number;       // 0-100
    性格标签: string[];     // 用于AI叙事生成
    特殊能力?: string;
    招募条件: {
        类型: '首次偶遇' | '资源交换' | '救援事件' | '好感达标';
        所需资源?: Partial<资源存储>;
        所需好感?: number;
    };
    适用纪元: 末日纪元类型[];
}

// ─── 已招募NPC ───

export type NPC状态 = '空闲' | '搜集中' | '建造中' | '制作中' | '防御中' | '休息中' | '受伤' | '叛逃中' | '死亡';

export type 任务分配类型 =
    | '搜集'       // 跟随主角外出搜集
    | '独立搜集'   // NPC独立外出搜集（更高回报，更高风险）
    | '建造'       // 协助建造/升级设施
    | '制作'       // 独立制作物品
    | '防御'       // 夜间值守，提高防御成功率
    | '医疗'       // 治疗自己或其他NPC
    | '休息'       // 恢复状态
    | '探索'       // 探索新地点（高风险高回报）

export interface 已招募NPC {
    id: string;
    预设ID: string;
    姓名: string;
    人格类型: NPC人格类型;
    专长: NPC技能专长[];
    专长等级: number;

    当前状态: NPC状态;
    当前任务: 任务分配类型 | null;

    生存状态: {
        饥饿值: number; 口渴值: number;
        健康值: number; 疲劳值: number; 精神状态: number;
    };

    好感度: number;
    忠诚度: number;
    关系阶段: '陌生' | '熟识' | '信任' | '亲密' | '依恋';

    招募天数: number;
    累计贡献: number;

    装备: string[];
    受伤状态: Array<{ 部位: string; 严重程度: '轻伤' | '重伤'; 恢复天数: number }>;

    NSFW关系?: NSFWNPC关系;
}

// ─── NPC任务分配 ───

export interface NPC任务分配 {
    NPC_ID: string;
    任务类型: 任务分配类型;
    目标地点?: string;
    目标设施?: string;
    开始回合: number;
    预计完成回合: number;
}

// ─── NPC叛逃判定 ───

export interface 叛逃判定结果 {
    是否叛逃: boolean;
    原因: string;
    带走资源?: Partial<资源存储>;
    破坏设施?: string[];
}

// ============================================================
// ★ NSFW系统类型定义
// ============================================================

// ─── NSFW关系阶段 ───

export type NSFW关系阶段 =
    | '无' | '暧昧' | '试探' | '亲密' | '依赖';

export type NSFW事件类型 =
    | '暧昧对话' | '身体接触' | '共寝' | '亲密事件'
    | '胁迫事件' | '脆弱时刻' | '嫉妒冲突' | '依赖发作';

export interface NSFWNPC关系 {
    关系阶段: NSFW关系阶段;
    亲密次数: number;
    最后亲密天数: number;
    依赖值: number;         // 0-100
    触发标记: string[];      // 如 ['共寝触发', '受伤脆弱触发']
}

// ─── 脆弱状态 ───

export type 脆弱状态类型 =
    | '失温昏迷' | '饥饿虚脱' | '受伤无助'
    | '精神崩溃' | '药物影响' | '俘虏状态';

export interface 脆弱状态事件 {
    id: string;
    类型: 脆弱状态类型;
    描述: string;
    触发条件: {
        体温上限?: number;
        饥饿值下限?: number;
        健康值上限?: number;
        精神状态上限?: number;
        被俘虏?: boolean;
    };
    叙事约束: string;       // AI提示词注入的额外约束
}

// ─── NSFW事件结果 ───

export interface NSFW事件结果 {
    触发事件: NSFW事件类型;
    涉及NPC: string[];
    好感变化: number;
    忠诚变化: number;
    精神状态变化: number;
    NSFW阶段提升: boolean;
    依赖变化?: number;
    负面后果?: string;
}

// ─── 主状态结构 ───

export interface 生存系统状态 {
    已激活: boolean;
    纪元类型: 末日纪元类型;
    当前天数: number;
    当前阶段: 日程阶段;

    生存状态: 生存状态;
    负面状态列表: 生存负面状态[];

    资源存储: 资源存储;
    存储上限: { [K in 资源类型]: number };

    背包: 背包状态;

    设施列表: 已建设施[];
    建造队列: string[];

    制作队列: 制作中任务[];

    当前搜集任务: 搜集任务 | null;
    地点枯竭状态: Record<string, number>;

    待处理夜间事件: 夜间事件[];
    历史夜间事件: 夜间事件[];

    难度系数: number;
    累计击杀: number;
    累计搜集次数: number;

    // ★ 招募系统
    招募NPC列表: 已招募NPC[];
    NPC任务队列: NPC任务分配[];
    偶遇池: string[];
    最近叛逃事件: 叛逃判定结果 | null;

    // ★ NSFW系统
    NSFW事件日志: NSFW事件结果[];
    脆弱状态列表: 脆弱状态事件[];

    事件日志: Array<{ 天数: number; 阶段: 日程阶段; 事件类型: string; 描述: string; 时间戳: number }>;

    统计数据: {
        总搜集次数: number; 总制作次数: number; 总建造设施数: number;
        总击杀数: number; 总死亡次数: number; 最高存活天数: number;
        总招募NPC数: number; 总叛逃NPC数: number;
    };
}

// ─── 结果类型 ───

export interface 搜集结果 {
    成功: boolean; 获得资源: Partial<资源存储>;
    获得物品: 背包格[]; 遭遇: 威胁遭遇 | null;
    状态变化: Partial<生存状态>; 描述: string;
}

export interface 建造结果 {
    成功: boolean; 设施: 已建设施 | null;
    资源消耗: Partial<资源存储>; 描述: string;
}

export interface 制作结果 {
    成功: boolean; 产出物品: { 物品名称: string; 数量: number; 描述: string } | null;
    资源消耗: Partial<资源存储>; 描述: string;
}

export interface 回合结算结果 {
    天数变化: number;
    资源消耗: Partial<资源存储>;
    状态变化: Partial<生存状态>;
    新负面状态: 生存负面状态[];
    设施变化: Array<{ 设施ID: string; 变化: string }>;
    NPC变化: Array<{ NPC_ID: string; 变化: string }>;
    夜间事件: 夜间事件 | null;
    NSFW事件: NSFW事件结果 | null;
    是否存活: boolean;
    摘要: string;
}
```

---

## 四、招募系统详细设计

### 4.1 招募方式

| 方式 | 触发条件 | 说明 |
|------|----------|------|
| **首次偶遇** | 搜集时随机触发（15%概率） | 在废墟中发现幸存者，可选择是否招募 |
| **资源交换** | 特定地点（避难所废墟） | 用食物/药品换取NPC加入 |
| **救援事件** | 夜间事件/搜集遭遇 | 从丧尸/掠夺者手中救出NPC |
| **好感达标** | 偶遇后多次互动 | 先建立关系，好感度>60后愿意加入 |

### 4.2 NPC人格行为

每个NPC的 `人格类型` 决定其自主行为倾向：

```
勇敢型: 主动要求参与搜集/防御，忠诚度下降慢，可能擅自行动
谨慎型: 偏好防御/建造，拒绝高危险任务，叛逃阈值低
自私型: 高资源需求，忠诚度下降快，叛逃时可能偷资源
忠诚型: 忠诚度极难下降，好感提升快，可能为主角牺牲
智慧型: 擅长制作/医疗，贡献高，叛逃概率极低
懦弱型: 容易被恐惧事件影响，精神状态衰减快，可能崩溃
狂热型: 极端忠诚但精神状态不稳定，可能做出危险行为
```

### 4.3 忠诚度系统

```typescript
function 忠诚度变化(
    NPC: 已招募NPC,
    当前天数: number,
    资源充足: boolean,
    任务风险: number,
    主角互动: number
): number {
    let 变化 = 0;

    // 基础衰减：每天 -0.5
    变化 -= 0.5;

    // 资源满足
    if (资源充足) 变化 += 1;

    // 任务风险过高
    if (任务风险 > 7) 变化 -= 2;

    // 主角互动
    变化 += 主角互动;

    // 人格修正
    switch (NPC.人格类型) {
        case '忠诚型': 变化 += 0.5; break;
        case '自私型': 变化 -= 1; break;
        case '狂热型': 变化 += 主角互动 > 0 ? 1 : -2; break;
    }

    return clamp(变化, -5, 5);
}
```

**叛逃阈值**: 忠诚度 < 20 时触发叛逃判定

```typescript
function 叛逃判定(
    NPC: 已招募NPC,
    当前资源: 资源存储
): 叛逃判定结果 {
    const rand = Math.random();
    const 叛逃概率 = (20 - NPC.忠诚度) / 100;

    if (rand < 叛逃概率) {
        const 恶意叛逃 = NPC.人格类型 === '自私型' && Math.random() < 0.4;
        return {
            是否叛逃: true,
            原因: 恶意叛逃 ? '带着资源偷偷离开了' : '受不了这里的环境离开了',
            带走资源: 恶意叛逃 ? { 食物: randInt(2, 5), 药品: randInt(0, 2) } : undefined,
            破坏设施: 恶意叛逃 && Math.random() < 0.2 ? ['围墙'] : undefined,
        };
    }
    return { 是否叛逃: false, 原因: '' };
}
```

### 4.4 任务分配与加成

```typescript
function 计算NPC加成(
    NPC: 已招募NPC,
    任务类型: 任务分配类型
): Record<string, number> {
    const 专长加成 = NPC.专长等级 * 0.1;  // 每级+10%

    switch (任务类型) {
        case '搜集':
        case '独立搜集':
            if (NPC.专长.includes('搜集')) return { 产出加成: 专长加成 };
            if (NPC.专长.includes('侦察')) return { 遭遇降低: 专长加成 * 0.5 };
            break;
        case '建造':
            if (NPC.专长.includes('工程')) return { 消耗降低: 专长加成, 耐久加成: 专长加成 * 0.5 };
            break;
        case '制作':
            if (NPC.专长.includes('制作')) return { 成功率加成: 专长加成, 速度加成: 专长加成 * 0.3 };
            break;
        case '防御':
            if (NPC.专长.includes('战斗')) return { 防御加成: 专长加成 };
            break;
        case '医疗':
            if (NPC.专长.includes('医疗')) return { 恢复加速: 专长加成 };
            break;
    }
    return {};
}
```

---

## 五、NSFW系统详细设计

### 5.1 幸存者亲密事件

**触发链路**:

```
好感度 > 50 → 关系阶段: '熟识'
    ↓
好感度 > 70 且 共同经历危险事件 → 关系阶段: '信任'
    ↓
好感度 > 85 且 夜晚独处事件触发 → 关系阶段: '亲密'（可触发亲密事件）
    ↓
亲密次数 > 3 且 依赖值积累 → 关系阶段: '依赖'
```

**关系阶段效果**:

| 阶段 | 效果 |
|------|------|
| 暧昧 | 深夜对话选项增加，AI生成暗示性文本 |
| 试探 | 身体接触事件（包扎伤口、寒冷相拥等场景） |
| 亲密 | 完整亲密事件可触发，+10好感/+5忠诚，次日疲劳降低 |
| 依赖 | NPC对主角产生依赖，依赖值>70时分离会触发精神衰减 |

**亲密事件触发条件**:
- 夜晚阶段，无夜间袭击事件
- 目标NPC处于'休息'状态
- 关系阶段 >= '亲密'
- 好感度 >= 85

**亲密事件后果**:
- 正面: 好感+10, 忠诚+5, 精神状态+15（双方），次日疲劳-20
- 负面风险: 其他NPC好感-5（嫉妒），资源消耗+1（分心）
- 依赖阶段: 超过3天无亲密事件，依赖NPC精神状态-3/天

### 5.2 脆弱状态系统

当角色（主角或NPC）陷入极端状态时，触发脆弱事件：

```typescript
const 脆弱触发条件: Record<脆弱状态类型, Partial<生存状态>> = {
    '失温昏迷':   { 体温: -30 },
    '饥饿虚脱':   { 饥饿值: 80 },
    '受伤无助':   { 健康值: 20 },
    '精神崩溃':   { 精神状态: 15 },
    '药物影响':   {},  // 由制作/使用物品触发
    '俘虏状态':   {},  // 由夜间袭击失败触发
};
```

**叙事约束注入**:

```typescript
function 生成脆弱叙事约束(
    事件: 脆弱状态事件,
    涉及NPC?: 已招募NPC
): string {
    const 约束映射: Record<脆弱状态类型, string> = {
        '失温昏迷': '角色正处于极度虚弱的失温状态，意识模糊，身体不受控制地颤抖，需要他人的温暖和帮助',
        '饥饿虚脱': '角色因长时间饥饿而虚脱无力，连站立的力气都没有，意识在清醒和模糊之间徘徊',
        '受伤无助': '角色身受重伤，疼痛和无力感让Ta完全依赖他人的照顾，展现出最脆弱的一面',
        '精神崩溃': '角色的心理防线已经崩溃，恐惧、绝望和疯狂交织，可能在哭喊、呆滞或歇斯底里之间切换',
        '药物影响': '角色受到药物/止痛剂影响，意识处于半清醒状态，感官被放大，判断力严重下降',
        '俘虏状态': '角色被敌人俘虏，处于完全被动的境地，恐惧和无力感达到极点',
    };

    let 约束 = 约束映射[事件.类型];
    if (涉及NPC) {
        约束 += `\n此时${涉及NPC.姓名}（${涉及NPC.人格类型}）在场，其性格特点会影响反应`;
    }
    return 约束;
}
```

**脆弱状态与NSFW的联动**:
- 脆弱状态下，好感度上升速度翻倍（患难见真情）
- 脆弱状态可能触发保护/照顾类的亲密事件（非强制，需要好感达标）
- 俘虏状态可能触发胁迫事件（黑暗向，由AI叙事根据场景生成）

### 5.3 嫉妒与多NPC关系

当存在多个NPC且与主角关系阶段不同时：

```typescript
function 检查嫉妒冲突(
    NPC列表: 已招募NPC[],
    新NSFW事件: NSFW事件结果
): NSFW事件结果 | null {
    const 涉及NPC_IDs = new Set(新NSFW事件.涉及NPC);
    const 嫉妒NPCs = NPC列表.filter(
        n => n.NSFW关系?.关系阶段 >= '试探' && !涉及NPC_IDs.has(n.id)
    );

    if (嫉妒NPCs.length === 0) return null;

    const 触发嫉妒 = 嫉妒NPCs.filter(n => {
        const 概率 = n.人格类型 === '自私型' ? 0.3 : 0.15;
        return Math.random() < 概率;
    });

    if (触发嫉妒.length > 0) {
        return {
            触发事件: '嫉妒冲突',
            涉及NPC: 触发嫉妒.map(n => n.id),
            好感变化: -5,
            忠诚变化: -3,
            精神状态变化: -10,
            NSFW阶段提升: false,
            负面后果: `${触发嫉妒.map(n => n.姓名).join('和')}表现出不满`,
        };
    }
    return null;
}
```

### 5.4 NSFW模式开关

当 `state.gameConfig.启用NSFW模式` 为 false 时：
- `NSFW关系` 字段不初始化
- `脆弱状态` 的叙事约束不包含性相关内容
- `亲密事件` 降级为普通好感事件
- 胁迫事件完全不触发

---

## 六、核心算法流程

### 6.1 搜集概率算法

```typescript
function 计算搜集结果(
    地点: 搜集地点预设,
    状态: 生存状态,
    难度系数: number,
    参与NPC?: 已招募NPC
): 搜集结果 {
    // 1. 状态效率修正
    const 状态修正 = 计算状态修正(状态);
    const NPC加成 = 参与NPC ? 计算NPC加成(参与NPC, '搜集') : {};

    // 2. 加权随机产出
    //   产出量 = 权重 × (1 + 状态修正) × (1 + NPC加成) × 随机因子

    // 3. 遭遇判定
    //   遭遇概率 = 危险等级 × 难度系数 × (1 - NPC侦察加成)

    // 4. 地点枯竭: 剩余次数--, 产出降低
}
```

### 6.2 每日结算算法

```typescript
function 每日结算(
    状态: 生存系统状态,
    全局NSFW开关: boolean
): 回合结算结果 {
    // 1. 设施产出消耗（净水器产水、菜园产食物、发电机耗燃料）

    // 2. 资源消耗（主角 + 每个NPC的消耗）

    // 3. 主角状态衰减

    // 4. 每个NPC的状态衰减（独立计算）

    // 5. 忠诚度变化（每个NPC独立计算）
    //   忠诚度 < 20: 触发叛逃判定

    // 6. 负面状态检查

    // 7. 夜间事件生成

    // 8. ★ NSFW事件检查
    //   遍历所有关系阶段 >= '信任' 的NPC
    //   概率触发亲密事件（夜晚独处时）
    //   依赖值检查

    // 9. ★ 脆弱状态检查
    //   检查主角和每个NPC的状态是否触发脆弱条件

    // 10. 难度递增（每7天 +0.1）
}
```

---

## 七、引擎设计

### 7.1 引擎注册

在 `hooks/useGame/engine/types.ts` 中新增 `'survival'` 到 `EngineType`。

### 7.2 引擎实现框架

```typescript
// hooks/useGame/engine/survivalEngine.ts

export class SurvivalEngine extends BaseEngine {
    private _state: 生存系统状态;

    advanceTurn(): TurnResult { /* 推进日程阶段 */ }

    executePlayerAction(action: PlayerAction): ActionResult {
        switch (action.type) {
            case '开始搜集': return this._handleGather(action);
            case '开始建造': return this._handleBuild(action);
            case '开始制作': return this._handleCraft(action);
            case '分配NPC任务': return this._handleNPCTask(action);
            case '招募NPC': return this._handleRecruit(action);
            case '应对夜间事件': return this._handleNightEvent(action);
            case '休息': return this._handleRest(action);
            case '互动': return this._handleNPCInteraction(action);
            default: return { success: false, ... };
        }
    }

    canExecuteAction(action: PlayerAction): boolean { /* 权限检查 */ }
    getSnapshot(): GameStateSnapshot { /* 快照 */ }
    getNarrativeConstraints(): NarrativeConstraint {
        // 注入生存状态 + NPC状态 + NSFW约束
    }
}
```

---

## 八、UI组件设计

### 8.1 组件清单

| 组件 | 文件 | 描述 |
|------|------|------|
| 桌面端主面板 | `components/features/Survival/SurvivalModal.tsx` | 三栏布局整合 |
| 移动端视图 | `components/features/Survival/MobileSurvival.tsx` | Tab切换全屏视图 |
| 状态面板 | `components/features/Survival/SurvivalStatusPanel.tsx` | 八维状态条 + 负面状态 |
| 搜集面板 | `components/features/Survival/GatheringPanel.tsx` | 地点卡片 + 结果 |
| 建造面板 | `components/features/Survival/BuildingPanel.tsx` | 设施列表 + 建造队列 |
| 制作面板 | `components/features/Survival/CraftingPanel.tsx` | 配方列表 + 进度 |
| **招募面板** | `components/features/Survival/RecruitmentPanel.tsx` | NPC列表 + 任务分配 + 关系详情 |
| **NSFW事件弹窗** | `components/features/Survival/IntimacyEventModal.tsx` | 亲密/脆弱/胁迫事件展示 |
| 夜间事件弹窗 | `components/features/Survival/NightEventModal.tsx` | 夜间事件 + 应对选项 |

### 8.2 招募面板布局（桌面端）

```
┌──────────────────────────────────────────┐
│  ─── 幸存者管理 ───                      │
├──────────────────────────────────────────┤
│                                          │
│  [头像] 林小雨 Lv.3    [勇敢型]          │
│  专长: 搜集 ★★★★    状态: 空闲          │
│  好感: ████████░░ 82   忠诚: ██████░░ 65 │
│  关系: 信任 → [互动] [分配任务]           │
│  ┌─ 分配任务 ───────────────────────┐    │
│  │ ○搜集 ○独立搜集 ○建造 ○制作      │    │
│  │ ○防御 ○医疗 ○休息 ○探索          │    │
│  │ [确认分配]                        │    │
│  └──────────────────────────────────┘    │
│                                          │
│  [头像] 老王     Lv.2    [智慧型]        │
│  专长: 工程 ★★★   状态: 建造中          │
│  好感: ██████░░░░ 60   忠诚: ███████░ 72 │
│  关系: 熟识 → [互动] [更换任务]           │
│                                          │
│  ─── 偶遇记录 ───                        │
│  第38天: 在医院发现幸存者（待决定）        │
│  [招募(消耗食物×3)] [拒绝]                │
└──────────────────────────────────────────┘
```

### 8.3 移动端招募布局

```
┌─────────────────────────┐
│  幸存者 (3人)     [管理] │
├─────────────────────────┤
│ ┌─────────────────────┐ │
│ │ 👤 林小雨 [勇敢型]  │ │
│ │ 搜集 ★★★★ 空闲    │ │
│ │ ❤️82 💛65 [互动]   │ │
│ │ [搜集] [防御] [休息] │ │
│ └─────────────────────┘ │
│ ┌─────────────────────┐ │
│ │ 👤 老王   [智慧型]  │ │
│ │ 工程 ★★★ 建造中   │ │
│ │ ❤️60 💛72 [互动]   │ │
│ └────────────────────┘ │
└─────────────────────────┘
```

### 8.4 亲密事件弹窗

```
┌──────────────────────────────────┐
│                                  │
│    夜深了，避难所里格外安静...      │
│                                  │
│    林小雨坐在你身边，              │
│    火光映照着她的脸庞。            │
│    她轻轻靠在你的肩膀上，          │
│    轻声说...                      │
│                                  │
│    [温柔回应]    [保持距离]       │
│                                  │
└──────────────────────────────────┘
```

---

## 九、与现有系统的集成点

### 9.1 状态初始化

```typescript
// hooks/useGame/storyState.ts 中新增:

export const 创建空生存系统状态 = (
    纪元类型: string,
    启用NSFW: boolean
): 生存系统状态 => ({
    // ... 基础字段
    招募NPC列表: [],
    NPC任务队列: [],
    偶遇池: [],
    最近叛逃事件: null,
    NSFW事件日志: [],
    脆弱状态列表: [],
});
```

### 9.2 AI提示词注入

```typescript
// systemPromptBuilder.ts 中新增:

function 构建生存上下文(状态: 生存系统状态): string {
    const npc描述 = 状态.招募NPC列表.map(npc => {
        let desc = `${npc.姓名}(${npc.人格类型}): ${npc.当前状态}`;
        if (npc.专长.length > 0) desc += ` 专长:${npc.专长.join(',')}`;
        if (npc.NSFW关系?.关系阶段 !== '无') desc += ` 关系:${npc.NSFW关系.关系阶段}`;
        return desc;
    }).join('\n');

    return `
【末日生存 第${状态.当前天数}天】
阶段: ${状态.当前阶段} | 难度: ${状态.难度系数.toFixed(1)}
${npc描述 ? `【幸存者】\n${npc描述}` : ''}
    `.trim();
}
```

### 9.3 与现有社交系统的关系

- 招募NPC的好感度/关系与 `state.社交.NPC关系` 桥接
- NPC的专长加成作用于搜集/建造/战斗等子系统
- NSFW事件结果注入现有 `prompts/runtime/nsfw.ts` 的上下文

---

## 十、实施步骤分解

### Phase 1: 数据模型与预设（2文件）

1. **创建类型文件** (`models/survival/types.ts`) — ~450行
2. **创建预设数据** (`models/survival/presets.ts`) — ~600行
   - 地点(15)、设施(20)、配方(25)、威胁(8)、夜间事件(12)、**幸存者预设(20)**

### Phase 2: 核心算法层（6文件）

3. **搜集系统** (`hooks/useGame/survival/gatheringSystem.ts`) — ~150行
4. **生存状态系统** (`hooks/useGame/survival/survivalTick.ts`) — ~250行
5. **建造系统** (`hooks/useGame/survival/buildingSystem.ts`) — ~180行
6. **制作系统** (`hooks/useGame/survival/craftingSystem.ts`) — ~150行
7. **招募系统** (`hooks/useGame/survival/recruitingSystem.ts`) — ~250行
8. **NSFW系统** (`hooks/useGame/survival/survivalNSFW.ts`) — ~200行

### Phase 3: SLG引擎集成（2文件）

9. **引擎类型注册** (`hooks/useGame/engine/types.ts`) — +3行
10. **生存引擎** (`hooks/useGame/engine/survivalEngine.ts`) — ~300行

### Phase 4: 状态桥接与系统集成（3文件）

11. **状态桥接** (`hooks/useGame/survival/survivalStateBridge.ts`) — ~150行
12. **开场状态扩展** (`hooks/useGame/storyState.ts`) — +50行
13. **提示词注入** (`hooks/useGame/systemPromptBuilder.ts`) — +60行

### Phase 5: UI组件 — 桌面端（6文件）

14. **状态面板** (`SurvivalStatusPanel.tsx`) — ~150行
15. **搜集面板** (`GatheringPanel.tsx`) — ~180行
16. **建造面板** (`BuildingPanel.tsx`) — ~200行
17. **制作面板** (`CraftingPanel.tsx`) — ~180行
18. **招募面板** (`RecruitmentPanel.tsx`) — ~250行
19. **主面板** (`SurvivalModal.tsx`) — ~200行

### Phase 6: UI组件 — 移动端 + NSFW弹窗（3文件）

20. **移动端主视图** (`MobileSurvival.tsx`) — ~220行
21. **夜间事件弹窗** (`NightEventModal.tsx`) — ~120行
22. **亲密事件弹窗** (`IntimacyEventModal.tsx`) — ~150行

### Phase 7: 集成测试与数值调优

23. **端到端流程测试**
24. **数值平衡**

---

## 十一、文件清单总览

| # | 文件 | 类型 | Phase | 行数 |
|---|------|------|-------|------|
| 1 | `models/survival/types.ts` | 新增 | 1 | ~450 |
| 2 | `models/survival/presets.ts` | 新增 | 1 | ~600 |
| 3 | `hooks/useGame/survival/gatheringSystem.ts` | 新增 | 2 | ~150 |
| 4 | `hooks/useGame/survival/survivalTick.ts` | 新增 | 2 | ~250 |
| 5 | `hooks/useGame/survival/buildingSystem.ts` | 新增 | 2 | ~180 |
| 6 | `hooks/useGame/survival/craftingSystem.ts` | 新增 | 2 | ~150 |
| 7 | `hooks/useGame/survival/recruitingSystem.ts` | 新增 | 2 | ~250 |
| 8 | `hooks/useGame/survival/survivalNSFW.ts` | 新增 | 2 | ~200 |
| 9 | `hooks/useGame/engine/types.ts` | 修改 | 3 | +3 |
| 10 | `hooks/useGame/engine/survivalEngine.ts` | 新增 | 3 | ~300 |
| 11 | `hooks/useGame/survival/survivalStateBridge.ts` | 新增 | 4 | ~150 |
| 12 | `hooks/useGame/storyState.ts` | 修改 | 4 | +50 |
| 13 | `hooks/useGame/systemPromptBuilder.ts` | 修改 | 4 | +60 |
| 14 | `components/features/Survival/SurvivalStatusPanel.tsx` | 新增 | 5 | ~150 |
| 15 | `components/features/Survival/GatheringPanel.tsx` | 新增 | 5 | ~180 |
| 16 | `components/features/Survival/BuildingPanel.tsx` | 新增 | 5 | ~200 |
| 17 | `components/features/Survival/CraftingPanel.tsx` | 新增 | 5 | ~180 |
| 18 | `components/features/Survival/RecruitmentPanel.tsx` | 新增 | 5 | ~250 |
| 19 | `components/features/Survival/SurvivalModal.tsx` | 新增 | 5 | ~200 |
| 20 | `components/features/Survival/MobileSurvival.tsx` | 新增 | 6 | ~220 |
| 21 | `components/features/Survival/NightEventModal.tsx` | 新增 | 6 | ~120 |
| 22 | `components/features/Survival/IntimacyEventModal.tsx` | 新增 | 6 | ~150 |
| 23 | `App.tsx` | 修改 | 5 | +15 |
| 24 | `hooks/useGame/index.ts` | 修改 | 4 | +5 |

**总计**: 18个新文件 + 6个修改文件，预估 ~4200 行代码

---

## 十二、风险评估

| 风险 | 严重度 | 概率 | 缓解 |
|------|--------|------|------|
| 生存系统与AI叙事冲突 | 高 | 中 | NarrativeConstraint约束注入 |
| NPC行为过于可预测 | 中 | 高 | 人格类型+随机因子 |
| NSFW事件触发过于频繁 | 中 | 中 | 冷却天数和好感度门槛 |
| 移动端信息过载 | 高 | 中 | Tab分组，核心信息优先 |
| 存档兼容性 | 中 | 中 | 新字段带默认值，旧存档自动填充 |
| 多个NPC时性能问题 | 低 | 低 | NPC数量上限5人，纯函数计算 |
