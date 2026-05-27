# 实现计划：Godot 2D横版动作RPG（学校纪元优先）

**日期：** 2026-05-26
**状态：** 待审核
**分支：** 独立Godot项目（非当前React项目内修改）

---

## 一、需求概述

将当前 React 浏览器端文字冒险游戏「墨染乾坤：万象纪元」移植为 Godot 4.x 引擎开发的 **2D横版动作RPG**，玩法类似冒险岛（MapleStory），核心特征：

1. **纪元选择系统** — 启动画面提供多纪元选择卡片
2. **学校纪元优先实现** — 校园地图横版探索 + 实时战斗 + NPC社交 + 学业/社团系统
3. **保留原有游戏系统** — 角色六属性、装备、技能、好感度、AI叙事等从现有代码迁移

---

## 二、现有项目调研结论

### 可直接复用的资产

| 资产 | 位置 | 复用方式 |
|------|------|----------|
| 角色数据结构 | `models/character.ts` | 六属性(力量/敏捷/体质/根骨/悟性/福源)、HP/MP/耐力、装备槽、BUFF — GDScript重写 |
| 物品系统 | `models/item.ts` | 武器/防具/消耗品/秘籍、品质阶梯、词缀、耐久、堆叠 — GDScript重写 |
| 技能系统 | `models/kungfu.ts` | 伤害类型、冷却、被动修正、境界效果 — GDScript重写 |
| NPC/社交 | `models/social.ts` | 好感度、关系、记忆、服装库存 — GDScript重写 |
| 好感度系统 | `models/intimacy.ts` | 好感等级(0-5)、互动解锁逻辑 — 纯函数，可直接翻译 |
| 学校纪元数据 | `models/campusNSFW/types.ts` | 社团(6种)、学业(GPA/考试)、传闻(4级传播)、学期日历、宿舍 — **高度匹配学校纪元** |
| 纪元配置 | `models/system.ts` | 42个纪元配置、纪元树结构、UI主题 |
| Prompt模板 | `prompts/` (90+文件) | 纯文本，可直接作为JSON资源载入 |
| 世界/地图数据 | `data/world.ts` | 地点、传送门、NPC分布 |

### 需要完全重写的部分

| 原模块 | 原因 |
|--------|------|
| React UI组件(22个功能模块) | 浏览器DOM渲染 → Godot 2D渲染器 |
| IndexedDB持久化 | 浏览器API → Godot FileAccess文件序列化 |
| 角色移动/战斗 | 点击式交互 → CharacterBody2D平台物理+FSM |
| AI客户端层 | fetch/axios → Godot HTTPRequest |

---

## 三、游戏设计（冒险岛风格）

### 3.1 核心循环

```
探索（横版平台移动，穿越校园地图）
  → 交互（NPC对话、物品拾取、传送门）
    → 战斗（实时攻击、技能释放、敌人AI）
      → 掉落（货币、物品、装备）
        → 成长（升级、好感提升、学期推进）
          → 循环
```

### 3.2 学校纪元地图（9个可探索区域）

| 区域 | 类型 | 说明 |
|------|------|------|
| 教学楼走廊 | Hub中心 | 连接所有区域的枢纽，有储物柜和公告板 |
| 教室 | 主线剧情 | 上课、考试、课间事件 |
| 天台 | 隐藏区域 | 秘密对话、特殊事件 |
| 社团大楼 | 社团活动 | 加入/退出社团、社团活动、资源管理 |
| 宿舍 | 夜间事件 | 房间装饰、室友NPC、夜晚特殊事件 |
| 食堂 | 日常交互 | 购买食物、社交偶遇 |
| 图书馆 | 学业系统 | 自习提升学业、查阅资料 |
| 运动场 | 体育课程/PVP | 跑步、社团比赛 |
| 校门口 | 进出校园 | 连接外部地图（后期纪元） |

### 3.3 学校纪元子系统

全部映射自 `models/campusNSFW/types.ts`：

1. **学业系统** — 课程表、GPA、考试、奖学金、挂科后果
2. **社团系统** — 6种社团(学术/艺术/体育/社交/神秘/综合)，加入后参与活动、积累社团资源、升级社团等级
3. **传闻系统** — 根据玩家/NPC行为自动生成，传播范围：小圈子→班级→年级→全校
4. **学期日历** — 90-120天/学期，固定事件(开学/期中/期末/文化节/运动会)
5. **宿舍系统** — 房间类型、室友NPC、装饰度、夜间事件

### 3.4 战斗系统

- **实时横版战斗** — 类似冒险岛的普通攻击(3段连击) + 技能释放
- **技能系统** — 从 `kungfu.ts` 迁移，支持近战/远程/被动/BUFF
- **伤害计算** — 基于六属性 + 装备 + 技能倍率
- **敌人AI** — 巡逻 → 追击 → 攻击 → 撤退(低血量) → 死亡掉落
- **敌人类型** — 不良学生、校外混混、Boss(期末考试的"压力具现化"等)

---

## 四、Godot项目架构

### 4.1 项目目录结构

```
school_rpg/
├── autoload/                     # 全局单例(AutoLoad)
│   ├── game_manager.gd           # 全局游戏状态(映射useGame.ts)
│   ├── event_bus.gd              # 信号中心(30+信号)
│   ├── save_manager.gd           # 文件序列化JSON存档
│   ├── ai_manager.gd             # HTTP异步AI调用
│   ├── era_manager.gd            # 纪元数据加载与切换
│   └── time_manager.gd           # 游戏时间推进
├── core/                         # 核心数据类
│   ├── character.gd              # 角色数据(Resource)
│   ├── item.gd                   # 物品数据(Resource)
│   ├── skill.gd                  # 技能数据(Resource)
│   ├── npc_data.gd               # NPC数据(Resource)
│   └── quest.gd                  # 任务数据(Resource)
├── systems/                      # 游戏逻辑系统
│   ├── combat_system.gd          # 战斗计算
│   ├── inventory_system.gd       # 背包管理
│   ├── intimacy_system.gd        # 好感度(纯函数)
│   ├── school_system.gd          # 学校纪元子系统
│   ├── skill_system.gd           # 技能释放
│   └── drop_system.gd            # 掉落计算
├── scenes/                       # 场景文件(.tscn)
│   ├── main.tscn                 # 主游戏场景
│   ├── player/
│   │   ├── player.tscn           # 玩家角色
│   │   └── player_fsm.gd         # 玩家状态机
│   ├── enemies/
│   │   ├── enemy_base.tscn       # 敌人基类
│   │   └── enemy_fsm.gd          # 敌人状态机
│   ├── npcs/
│   │   └── npc.tscn              # NPC基类
│   ├── ui/
│   │   ├── hud.tscn              # HUD(血量/经验/时间)
│   │   ├── dialogue_box.tscn     # 对话框
│   │   ├── inventory.tscn        # 背包界面
│   │   ├── equipment.tscn        # 装备界面
│   │   ├── character_panel.tscn  # 角色面板
│   │   ├── skill_menu.tscn       # 技能菜单
│   │   ├── npc_profile.tscn      # NPC资料
│   │   ├── intimacy_panel.tscn   # 好感度面板
│   │   ├── calendar.tscn         # 学期日历
│   │   ├── quest_tracker.tscn    # 任务追踪
│   │   ├── save_load.tscn        # 存档读档
│   │   └── settings.tscn         # 设置菜单
│   ├── maps/                     # 地图场景
│   │   ├── corridor.tscn         # 教学楼走廊
│   │   ├── classroom.tscn        # 教室
│   │   ├── rooftop.tscn          # 天台
│   │   ├── club_building.tscn    # 社团大楼
│   │   ├── dormitory.tscn        # 宿舍
│   │   ├── cafeteria.tscn        # 食堂
│   │   ├── library.tscn          # 图书馆
│   │   ├── sports_field.tscn     # 运动场
│   │   └── school_gate.tscn      # 校门口
│   ├── portals/
│   │   └── portal.tscn           # 传送门
│   └── title/
│       ├── title_screen.tscn     # 标题画面
│       └── era_select.tscn       # 纪元选择
├── data/                         # 数据文件
│   ├── presets.json              # 开局预设
│   ├── prompts/                  # Prompt模板(JSON)
│   ├── era_configs.json          # 纪元配置
│   └── npc_templates.json        # NPC模板
├── assets/                       # 美术资源
│   ├── sprites/                  # 角色精灵
│   ├── tilesets/                 # 瓦片集
│   ├── ui/                       # UI素材
│   ├── audio/                    # 音频
│   └── fonts/                    # 字体
├── shaders/                      # 着色器
│   ├── hit_flash.gdshader        # 受击闪白
│   ├── damage_number.gdshader    # 伤害数字
│   └── transition.gdshader       # 场景切换过渡
└── export_presets.cfg            # 导出配置
```

### 4.2 场景树结构

```
Node2D (主游戏场景)
├── ParallaxBackground (远景)
├── TileMapLayer (地面/平台/装饰/可交互)
├── YSort (Y轴排序容器)
│   ├── Player (CharacterBody2D)
│   │   ├── AnimatedSprite2D (动画精灵)
│   │   ├── CollisionShape2D
│   │   ├── AttackHitbox (Area2D, 攻击判定)
│   │   └── Camera2D (跟随)
│   ├── NPCGroup (Node2D)
│   │   └── NPC x N (CharacterBody2D + AnimatedSprite2D)
│   ├── EnemyGroup (Node2D)
│   │   └── Enemy x N (CharacterBody2D + FSM + AnimatedSprite2D)
│   ├── PickupGroup (Node2D)
│   │   └── Pickup x N (Area2D + AnimatedSprite2D)
│   └── PortalGroup (Node2D)
│       └── Portal x N (Area2D + 过渡动画)
├── CanvasLayer (UI层, z=10)
│   ├── HUD
│   ├── DialogueBox
│   └── MenuOverlay (各种弹窗)
└── AudioStreamPlayer (BGM/SFX)
```

### 4.3 玩家状态机(FSM)

```
IDLE → WALK → RUN → JUMP → FALL → LADDER → ROPE → SIT
     → ATTACK(3段连击) → SKILL → HURT → DEAD
```

### 4.4 敌人状态机(FSM)

```
IDLE → PATROL → CHASE → ATTACK → HURT → RETREAT(低血量) → DEAD(掉落)
```

### 4.5 React模块到Godot映射表

| React模块 | Godot等价物 | 实现方式 |
|-----------|------------|----------|
| `hooks/useGame.ts` | `autoload/game_manager.gd` | 全局单例，Signal通信 |
| `models/character.ts` | `core/character.gd` | 继承Resource的GDScript类 |
| `models/item.ts` | `core/item.gd` | 继承Resource的GDScript类 |
| `models/kungfu.ts` | `core/skill.gd` | 继承Resource的GDScript类 |
| `models/social.ts` | `core/npc_data.gd` | 继承Resource的GDScript类 |
| `models/campusNSFW/types.ts` | `systems/school_system.gd` | GDScript + Resource数据 |
| `models/intimacy.ts` | `systems/intimacy_system.gd` | 纯函数重写 |
| `services/ai/` | `autoload/ai_manager.gd` | HTTPRequest + JSON |
| `services/dbService.ts` | `autoload/save_manager.gd` | FileAccess JSON序列化 |
| `prompts/` | `data/prompts/` | JSON格式直接复用 |
| `data/presets.ts` | `data/presets.json` | JSON序列化 |

---

## 五、素材需求清单

### 5.1 最高优先级（MVP必需）

| 素材 | 规格 | 数量 | 备注 |
|------|------|------|------|
| 玩家行走精灵表 | 48x64px, 4方向(左右上下), 每个方向idle/walk/run/jump/attack | 2套(男女校服) | 可用CC0素材暂代 |
| 基础瓦片集 | 32x32px | 教室/走廊/室外各1套 | 推荐LimeZu或Kenney |
| UI基础元素 | 9-patch可缩放 | 按钮/边框/血条/经验条/对话框 | 可AI生成或CC0 |
| NPC行走精灵 | 48x64px, idle/walk | 3-5个学生NPC | 可复用玩家精灵换色 |
| NPC立绘/表情 | 200x300px | 每个NPC 3+表情 | 可用AI生成(复用现有管线) |
| 敌人精灵 | 48x64px, idle/walk/attack/hurt/dead | 2-3种(不良学生) | CC0暂代 |
| 战斗特效 | 各种尺寸 | 命中闪光+伤害数字弹出 | 可使用Godot粒子系统 |
| BGM | 循环loop | 日间校园+战斗各1首 | CC0或AI生成 |

### 5.2 第二阶段素材

| 素材 | 规格 | 数量 |
|------|------|------|
| 装备图标 | 32x32px或48x48px | 30+(武器/防具/饰品/消耗品) |
| 技能特效 | 各技能对应 | 10+(近战挥砍/远程弹道/BUFF光效) |
| 掉落物精灵 | 24x24px | 金币/药水/钥匙等 |
| Boss精灵 | 96x96px或更大 | 2-3个 |
| 环境装饰 | 32x32px tile | 桌椅/黑板/储物柜/公告板等 |
| 天气效果 | 粒子/动画 | 晴天/雨天/黄昏 |
| SE音效 | 短音效 | 跳跃/攻击/命中/拾取/对话/升级等 |

### 5.3 推荐素材来源

| 来源 | 类型 | 价格 | 用途 |
|------|------|------|------|
| **Kenney.nl** | CC0免费 | 免费 | 原型验证瓦片/UI |
| **Pixel Frog (itch.io)** | 高质量像素精灵 | $5-15 | 玩家/NPC/敌人 |
| **LimeZu (itch.io)** | 现代风瓦片集 | $5-10 | 校园建筑 |
| **AI生成** | 立绘/图标 | 模型费用 | 角色立绘(复用现有AI管线) |
| **思源黑体** | 中文字体 | 免费 | UI文字显示 |
| **Freesound.org** | CC0音效 | 免费 | SE音效 |
| **OpenGameArt.org** | 混合授权 | 免费 | BGM/音效 |

---

## 六、实施阶段

### 第一阶段：项目基础（2-3周）

- [ ] 创建Godot 4.x项目，配置基础设置
- [ ] 实现 `game_manager.gd` 全局状态单例
- [ ] 实现 `event_bus.gd` 信号中心
- [ ] 实现 `save_manager.gd` 文件序列化存档
- [ ] 实现 `ai_manager.gd` AI服务层(HTTPRequest)
- [ ] 迁移 Prompt 模板为JSON资源
- [ ] 迁移基础数据模型(presets/纪元配置)
- [ ] 实现 `era_manager.gd` 纪元数据加载

**里程碑：** 可以启动项目，加载纪元数据，保存/读取存档

### 第二阶段：横版探索（3-4周）

- [ ] 实现玩家控制器(CharacterBody2D + FSM)
  - 移动/跳跃/下落/平台站立
  - 动画状态机(AnimatedSprite2D)
  - 相机跟随(Camera2D)
- [ ] 实现瓦片地图(TileMapLayer)
  - 创建第一个测试地图(教学楼走廊)
  - 碰撞层配置
  - 装饰性图层
- [ ] 实现传送门系统(Portal + 场景过渡动画)
- [ ] 实现NPC控制器
  - NPC站立/简单移动
  - 交互检测(Area2D)
- [ ] 实现对话系统
  - 对话框UI(DialogueBox)
  - 文字逐字显示效果
  - 选项分支
- [ ] 实现HUD(血量/经验/货币/时间)

**里程碑：** 可以在校园走廊中行走，与NPC对话，切换场景

### 第三阶段：实时战斗（2-3周）

- [ ] 实现攻击系统
  - 近战攻击判定(Area2D hitbox)
  - 远程技能弹道
  - 3段连击
- [ ] 实现伤害计算器(从现有逻辑迁移)
- [ ] 实现技能系统
  - 技能释放/冷却
  - BUFF/DEBUFF系统
  - 技能UI菜单
- [ ] 实现敌人AI
  - 巡逻路径
  - 追击/攻击/撤退逻辑
  - 受击反应
- [ ] 实现掉落系统
  - 掉落表计算
  - 掉落物拾取
  - 金币显示

**里程碑：** 可以与敌人战斗，释放技能，拾取掉落

### 第四阶段：菜单与背包（2-3周）

- [ ] 实现背包系统
  - 物品堆叠
  - 分类筛选
  - 使用/装备/丢弃
- [ ] 实现装备系统
  - 装备槽管理
  - 装备属性加成计算
  - 换装预览
- [ ] 实现角色面板(六属性展示)
- [ ] 实现技能菜单
- [ ] 实现任务系统
- [ ] 实现商店系统(食堂购买)

**里程碑：** 完整的RPG菜单体验，可以管理装备和物品

### 第五阶段：学校纪元子系统（3-4周）

- [ ] 实现学校管理器(时间推进/行动消耗)
- [ ] 实现学业系统(课程/GPA/考试)
- [ ] 实现社团系统(加入/活动/资源/升级)
- [ ] 实现传闻系统(生成/传播/衰减)
- [ ] 实现学期日历(事件/效果)
- [ ] 实现宿舍系统(房间/室友/夜间事件)
- [ ] 实现好感度系统(好感追踪/等级解锁)

**里程碑：** 完整的学校纪元玩法循环

### 第六阶段：纪元选择与AI叙事（2-3周）

- [ ] 实现纪元管理器(数据加载/切换)
- [ ] 实现标题画面与纪元选择卡片(7个纪元)
- [ ] 实现AI叙事系统
  - 触发条件判断
  - Prompt组装
  - 响应解析
  - 状态联动
- [ ] 实现过场动画系统

**里程碑：** 可以选择不同纪元，AI驱动叙事

### 第七阶段：内容完善与打磨（持续）

- [ ] 填充学校纪元全部内容(所有地图/NPC/敌人/任务/事件)
- [ ] 存档/读档UI
- [ ] 设置菜单(音量/画质/控制)
- [ ] NSFW分级(后期阶段)
- [ ] 音频集成(BGM/SE切换)
- [ ] 性能优化
- [ ] 多平台导出(Windows/Linux/Web)

---

## 七、时间估算

| 阶段 | 时间 | 压缩建议 |
|------|------|----------|
| 项目基础 | 2-3周 | 可压缩到1-2周，先做核心单例 |
| 横版探索 | 3-4周 | 可压缩到2周，先做移动+1张地图 |
| 实时战斗 | 2-3周 | 可压缩到1.5周，先做普攻+1种敌人 |
| 菜单与背包 | 2-3周 | 可压缩到1.5周，先做背包+装备 |
| 学校子系统 | 3-4周 | 可压缩到2周，先做学业+社团核心循环 |
| 纪元与AI | 2-3周 | 可压缩到1.5周，先做基础AI调用 |
| 内容打磨 | 持续 | MVP阶段跳过 |

**MVP可玩版本：10-14周**（聚焦"横版探索+基础战斗+NPC对话+学业/社团核心循环"）

---

## 八、风险与缓解

| 风险 | 等级 | 缓解措施 |
|------|------|----------|
| 素材工作量巨大 | 高 | 先用免费CC0包做原型，AI生成占位符，后期替换 |
| AI响应延迟影响体验 | 高 | 异步处理+加载动画+结果缓存+离线降级方案 |
| 平台跳跃手感调优 | 中 | 参考冒险岛/铲子骑士参数，反复迭代调优 |
| 范围过大导致无法完成 | 高 | 严格按阶段推进，MVP优先，后续迭代 |
| Godot学习曲线 | 中 | 从简单原型开始，跟随官方教程，利用Godot文档 |
| AI与运行时状态同步 | 中 | 明确边界，数据校验，日志记录 |

---

## 九、技术决策

### 为什么选择 Godot 4.x

1. **免费开源** — 无版税，MIT许可
2. **GDScript简洁** — Python-like语法，快速迭代
3. **2D原生支持** — 专用2D引擎，像素完美
4. **场景系统** — .tscn场景文件+节点树，天然适合游戏组件化
5. **多平台导出** — Windows/Linux/Mac/Web/Android/iOS一键导出
6. **社区活跃** — 大量教程和插件

### 为什么不留在React项目

1. 浏览器DOM不适合实时动作游戏
2. Canvas 2D在React中性能受限且开发体验差
3. 横版平台跳跃需要物理引擎和帧循环，React生态缺乏成熟方案
4. Godot提供完整的游戏开发工具链（编辑器、动画编辑器、粒子编辑器等）

### 数据共享策略

两个项目(React版和Godot版)共享：
- Prompt模板(纯文本)
- 数据模型定义(结构一致，语言不同)
- AI服务接口(逻辑一致)
- 游戏数值平衡(属性/伤害/好感)

不共享：
- UI实现(完全不同的渲染系统)
- 输入处理(鼠标点击 vs 键盘手柄)
- 持久化(IndexedDB vs FileAccess)

---

## 十、下一步行动

1. **确认方案** — 审核本计划，确认方向
2. **安装Godot 4.x** — 下载并安装Godot Engine 4.x
3. **创建原型** — 实现最简可玩原型(玩家移动+1张地图+1个NPC对话)
4. **素材收集** — 下载CC0素材包用于原型验证
5. **迭代开发** — 按阶段推进
