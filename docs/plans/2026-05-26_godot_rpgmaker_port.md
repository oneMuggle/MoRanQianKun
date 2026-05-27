# 实施计划：从 React/TypeScript 文字 RPG 移植到 Godot RPG Maker 风格游戏

## 概述

将当前的浏览器端文字 RPG「墨染乾坤：万象纪元」重新设计为基于 Godot 引擎的 2D 像素风 RPG 游戏，采用类似 RPG Maker 的玩法结构。核心转变是从纯文字对话驱动转变为视觉化地图探索 + 事件驱动 + AI 辅助叙事混合模式。保留现有的 AI 生成故事能力，同时添加传统 RPG 的地图探索、回合制战斗、NPC 交互等视觉玩法。

## 需求分析

### 核心需求
- Godot 4.x 引擎实现 2D 像素风 RPG
- 保留 7 纪元叙事结构和 AI 驱动故事生成
- 实现 RPG Maker 风格的地图探索、事件触发、回合制战斗
- 保留 NSFW 内容系统（多级分级：0-3）
- 像素风美术素材需求分析
- 保留多 AI 供应商后端集成

### 成功标准
- 完整的游戏循环：地图探索 → 事件触发 → 对话/战斗 → 奖励 → 存读档
- AI 叙事系统正常工作
- 7 个纪元各有独特的视觉主题
- NSFW 内容正确分级和解锁
- 存读档系统完整

## 当前架构分析

### 现有可复用资产
| 资产 | 类型 | 可复用性 |
|------|------|----------|
| 数据模型 (models/) | TypeScript 类型定义 | 高 - 需转换为 GDScript 结构 |
| 业务逻辑 (hooks/useGame/) | 游戏工作流 | 高 - 核心逻辑可移植 |
| AI 服务层 (services/ai/) | API 调用封装 | 高 - 可重写为 GDScript/HTTP 请求 |
| Prompt 系统 (prompts/) | 提示词模板 | 高 - 纯文本可复用 |
| NSFW 引擎 (models/bdsmNSFW, campusNSFW 等) | 业务逻辑 | 高 - 逻辑可移植 |
| 存读档 (dbService.ts, saveArchiveService.ts) | 数据持久化 | 中 - 需适配 Godot 文件系统 |
| Galgame 组件 | UI 组件 | 低 - 需用 Godot 控件重写 |

### 需要重写的部分
| 部分 | 原因 |
|------|------|
| React UI 组件 | Godot 使用完全不同的 UI 系统 |
| 渲染管线 | Godot 2D 渲染器替代 Canvas/DOM |
| 地图系统 | 需要 TileMap 实现 |
| 动画系统 | Godot AnimationPlayer/AnimatedSprite2D |
| 音频系统 | Godot AudioStreamPlayer |

## 技术可行性分析

### 可行因素
1. **Godot 原生支持 2D 像素风** - 内置像素完美渲染、TileMap、AnimatedSprite2D
2. **HTTP 客户端** - Godot 的 HTTPRequest 节点可直接调用现有 AI API
3. **JSON 序列化** - 与现有数据结构兼容
4. **文件系统** - Godot 支持本地存档
5. **事件系统** - Signal 机制天然适合事件驱动设计
6. **GDScript 类似 Python** - 学习曲线低，逻辑移植相对容易

### 风险因素
1. **AI 响应延迟** - 网络请求可能阻塞游戏，需异步处理
2. **素材工作量** - 7 纪元 + 多场景 + 多角色 + 多表情 = 大量像素素材
3. **NSFW 内容管理** - 需要分级解锁和资源动态加载
4. **复杂状态同步** - 文字 RPG 的复杂状态需映射到视觉元素

## RPG Maker 风格游戏特点分析

### 核心玩法系统
1. **地图探索** - TileMap 地图 + 碰撞检测 + 事件触发
2. **事件系统** - 触发器（触碰/交互/条件）→ 对话/战斗/过场
3. **回合制战斗** - 菜单驱动，技能/物品/逃跑选择
4. **对话系统** - 文字框 + 角色立绘 + 选项分支
5. **菜单系统** - 角色状态、物品、装备、技能、存档
6. **NPC 调度** - NPC 在地图上按时间表移动

### NSFW 内容实现参考
1. **分级解锁** - 根据亲密度/剧情进度解锁不同级别内容
2. **CG 画廊** - 收集的 CG 图片可在画廊查看（已有 CGGallery 组件）
3. **场景事件** - 特定地点触发特殊场景
4. **分支叙事** - 选项导致不同路线（已有 branchNarrative 系统）

### RPG Maker NSFW 游戏常见模式
1. **事件触发型** - 通过地图事件触发 NSFW 场景（常见于 RPG Maker 黄油）
2. **亲密度解锁** - 与 NPC 互动提升亲密度后解锁特殊事件
3. **任务驱动** - 完成特定任务后触发奖励场景
4. **分支选择** - 对话选项导致不同路线（包含 NSFW 路线）
5. **CG 收集** - 通过不同选择收集 CG 图片

## Godot 架构设计

### 项目结构
```
moranjg/
├── addons/                    # 第三方插件
│   ├── dialogue_manager/      # 对话管理器插件
│   └── pixel_perfect_camera/  # 像素完美渲染
├── assets/                    # 所有素材
│   ├── characters/            # 角色素材
│   │   ├── sprites/           # 行走图 (4方向×3帧 = 12帧/角色)
│   │   ├── faces/             # 表情头像 (每个角色 5-8 表情)
│   │   └── battlers/          # 战斗立绘
│   ├── tilesets/              # 瓦片素材
│   │   ├── ancient/           # 古代纪元
│   │   ├── medieval/          # 中世纪纪元
│   │   ├── modern/            # 现代纪元
│   │   ├── cyberpunk/         # 赛博朋克纪元
│   │   └── scifi/             # 科幻纪元
│   ├── backgrounds/           # 背景图（对话/战斗）
│   ├── ui/                    # UI 元素
│   ├── music/                 # 背景音乐
│   └── sfx/                   # 音效
├── scenes/                    # 场景文件 (.tscn)
│   ├── main/
│   │   ├── main_menu.tscn     # 主菜单
│   │   ├── game_world.tscn    # 游戏主世界
│   │   └── loading.tscn       # 加载画面
│   ├── gameplay/
│   │   ├── player.tscn        # 玩家角色
│   │   ├── npc.tscn           # NPC 模板
│   │   ├── event_trigger.tscn # 事件触发器
│   │   ├── battle.tscn        # 战斗场景
│   │   └── dialogue_box.tscn  # 对话框
│   ├── menus/
│   │   ├── character_menu.tscn
│   │   ├── inventory_menu.tscn
│   │   ├── equipment_menu.tscn
│   │   ├── skill_menu.tscn
│   │   ├── save_load_menu.tscn
│   │   └── settings_menu.tscn
│   ├── galgame/
│   │   ├── galgame_scene.tscn # Galgame 模式场景
│   │   └── cg_gallery.tscn    # CG 画廊
│   └── nsfw/
│       ├── nsfw_scene.tscn    # NSFW 场景
│       └── nsfw_gallery.tscn  # NSFW 画廊
├── scripts/                   # GDScript 脚本
│   ├── core/                  # 核心系统
│   │   ├── game_state.gd      # 全局游戏状态
│   │   ├── save_system.gd     # 存读档
│   │   ├── event_manager.gd   # 事件管理
│   │   └── ai_service.gd      # AI 服务
│   ├── gameplay/              # 玩法系统
│   │   ├── player_controller.gd
│   │   ├── npc_controller.gd
│   │   ├── battle_system.gd
│   │   ├── dialogue_system.gd
│   │   └── inventory_system.gd
│   ├── nsfw/                  # NSFW 系统
│   │   ├── nsfw_manager.gd
│   │   ├── intimacy_system.gd
│   │   └── scene_unlock.gd
│   ├── ai/                    # AI 集成
│   │   ├── text_generation.gd
│   │   ├── image_generation.gd
│   │   └── prompt_builder.gd
│   └── ui/                    # UI 脚本
│       ├── hud.gd
│       ├── menu_base.gd
│       └── ...
├── resources/                 # 资源文件 (.tres/.res)
│   ├── data/                  # 数据资源
│   │   ├── characters.tres    # 角色数据
│   │   ├── items.tres         # 物品数据
│   │   ├── skills.tres        # 技能数据
│   │   └── maps.tres          # 地图配置
│   └── config/                # 配置文件
│       ├── api_config.tres    # API 配置
│       └── game_settings.tres # 游戏设置
└── exports/                   # 导出配置
```

### 核心系统映射

| 现有 React 系统 | Godot 对应 | 实现方式 |
|-----------------|------------|----------|
| `useGame.ts` 状态管理 | `GameState` 单例 (Autoload) | 全局单例存储所有游戏状态 |
| `chatCompletionClient.ts` | `AIService.gd` | HTTPRequest 节点调用 AI API |
| `dbService.ts` (IndexedDB) | `SaveSystem.gd` | JSON 文件序列化到 user:// |
| TileMap + 事件触发器 | 地图探索 | Godot TileMap + Area2D 触发器 |
| `BattleModal.tsx` | `battle.tscn` | 独立战斗场景 |
| `GalgameMode.tsx` | `galgame_scene.tscn` | Galgame 专用场景 |
| `GalgameDialogueBox.tsx` | `dialogue_box.tscn` | 可复用的对话框预制体 |
| 亲密度系统 | `IntimacySystem.gd` | 数据驱动的亲密度管理 |
| NSFW 分级系统 | `NSFWManager.gd` | 内容分级和资源管理 |
| Prompt 系统 | `prompt_builder.gd` + JSON 文件 | 提示词模板存储为 JSON/文本资源 |

## 素材需求清单

### 角色素材（像素风，32x32 或 48x48 基础单位）

#### 行走图 (Character Sprites)
| 类型 | 数量估算 | 规格 | 说明 |
|------|----------|------|------|
| 主角行走图 | 1-3 套/纪元 × 7 纪元 = 7-21 套 | 4方向×3帧，每帧 32x48px | 根据性别/身份变化 |
| NPC 行走图 | 20-50 个通用 + 每纪元 5-10 个专属 | 同上 | 可使用换色 + 部件替换减少工作量 |
| Boss 行走图 | 每纪元 2-3 个 | 同上，可能需要更大尺寸 | 重要战斗敌人 |

#### 表情头像 (Face Graphics)
| 类型 | 数量估算 | 规格 | 说明 |
|------|----------|------|------|
| 主角表情 | 5-8 表情 × 1-3 套 = 5-24 张 | 96x96px 或 144x144px | 通常/高兴/愤怒/悲伤/惊讶/害羞/诱惑等 |
| NPC 表情 | 3-5 表情 × 30-60 角色 = 90-300 张 | 同上 | 关键 NPC 需要更多表情 |

#### 战斗立绘 (Battler Graphics)
| 类型 | 数量估算 | 规格 | 说明 |
|------|----------|------|------|
| 主角战斗立绘 | 1-3 套 × 7 纪元 = 7-21 张 | 100x150px ~ 150x200px | 静态或简单动画 |
| 敌人战斗立绘 | 30-50 种 | 同上 | 包含普通敌人和 Boss |
| NSFW 战斗立绘 | 根据内容需求 | 同上或更大 | 特殊场景用 |

#### CG 图片
| 类型 | 数量估算 | 规格 | 说明 |
|------|----------|------|------|
| 剧情 CG | 每纪元 5-15 张 = 35-105 张 | 400x300px ~ 800x600px | 关键剧情插画 |
| NSFW CG | 根据内容需求 | 同上 | 分级解锁内容 |
| 结局 CG | 每结局 1 张 × 多结局 | 同上 | 不同路线结局 |

### 场景素材

#### TileSet（瓦片集）
| 类型 | 数量估算 | 规格 | 说明 |
|------|----------|------|------|
| 户外地形 | 7 纪元 × 3-5 套 = 21-35 套 | 32x32px 或 48x48px 每瓦片 | 草地/沙漠/雪地/城市等 |
| 室内建筑 | 10-20 套 | 同上 | 房屋/商店/酒馆/寺庙等 |
| 特殊场景 | 5-10 套 | 同上 | 战斗场景/NSFW 场景/特殊地点 |
| UI 瓦片 | 2-3 套 | 16x16px 或 32x32px | 对话框边框/菜单背景等 |

#### 背景图（对话/战斗用）
| 类型 | 数量估算 | 规格 | 说明 |
|------|----------|------|------|
| 场景背景 | 20-40 张 | 400x300px ~ 800x600px | 对话时的背景 |
| 战斗背景 | 7-15 张 | 同上 | 战斗场景背景 |
| NSFW 背景 | 根据需求 | 同上 | 特殊场景背景 |

### UI 素材
| 类型 | 数量估算 | 规格 | 说明 |
|------|----------|------|------|
| 按钮 | 10-20 种状态 | 可缩放 9-patch | 普通/悬停/按下/禁用 |
| 窗口框 | 7 纪元 × 1 套 = 7 套 | 可缩放 9-patch | 每个纪元独特风格 |
| 图标 | 50-100 个 | 32x32px | 物品/技能/状态等图标 |
| 光标/选择器 | 3-5 种 | 16x16px ~ 32x32px | 菜单选择光标 |
| 进度条 | 5-10 种 | 可拉伸 | HP/MP/经验/亲密度等 |

### 音频素材
| 类型 | 数量估算 | 格式 | 说明 |
|------|----------|------|------|
| BGM | 7 纪元 × 3-5 首 + 通用 = 25-40 首 | OGG/Vorbis | 探索/战斗/事件等 |
| SE（音效） | 20-40 个 | OGG/WAV | 选择/移动/攻击/升级等 |
| 语音（可选） | 根据预算 | OGG | 关键角色语音 |

### 素材来源建议
1. **OpenGameArt.org** - 免费像素素材，注意许可证
2. **itch.io 素材包** - 大量付费/免费像素素材包（推荐 SrLuisi, Anokolisa 等作者）
3. **RPG Maker 素材转换** - 部分素材可转换格式使用（注意许可证）
4. **AI 生成 + 手动修正** - 使用 AI 生成基础像素图，手动修正细节
5. **外包** - 找像素美术师定制关键角色和场景
6. **NSFW 素材** - 考虑专门的 NSFW 像素美术师或 AI 生成

### 素材优先级（MVP 阶段）
1. 主角行走图（1 套）
2. 基础 TileSet（1-2 套）
3. 基础 UI 框和按钮
4. NPC 行走图（3-5 个）
5. 表情头像（主角 + 关键 NPC）
6. 战斗背景（1-2 张）
7. BGM（3-5 首）

## 实施阶段

### Phase 1: 项目基础与技术验证（2-3 周）

**目标**: 建立 Godot 项目基础架构，验证 AI 集成可行性

1. **创建 Godot 项目** (文件: moranjg/project.godot)
   - 配置像素完美渲染（Viewport 设置）
   - 设置渲染分辨率（推荐 320x240 或 640x480 整数缩放）
   - 配置输入映射（移动/交互/菜单/取消）
   - 依赖: 无
   - 风险: 低

2. **创建全局单例 GameState** (文件: scripts/core/game_state.gd)
   - 实现全局游戏状态管理（对应 useGame.ts 的核心状态）
   - 定义角色、环境、世界、战斗等核心数据结构
   - 实现状态初始化和规范化函数
   - 依赖: 步骤 1
   - 风险: 低

3. **实现 AI 服务层** (文件: scripts/ai/ai_service.gd)
   - 封装 HTTPRequest 调用现有 AI API
   - 支持多供应商（Gemini, Claude, OpenAI 等）
   - 实现流式响应处理
   - 实现错误重试和超时处理
   - 依赖: 步骤 1
   - 风险: 中 - 网络请求异步处理需要仔细设计

4. **实现 Prompt 构建器** (文件: scripts/ai/prompt_builder.gd + resources/prompts/)
   - 将现有 prompts/ 目录的提示词转换为 Godot 可用格式
   - 实现动态 prompt 组装（根据纪元/场景/NPC）
   - 依赖: 步骤 3
   - 风险: 低 - 主要是文本资源迁移

5. **验证 AI 集成** (测试脚本: scripts/test_ai_integration.gd)
   - 测试 AI 文本生成流程
   - 验证响应解析
   - 验证多供应商切换
   - 依赖: 步骤 3-4
   - 风险: 中 - 取决于 AI API 响应格式

### Phase 2: 核心玩法循环（3-4 周）

**目标**: 实现地图探索、事件触发、对话系统

6. **实现玩家控制器** (文件: scripts/gameplay/player_controller.gd, scenes/gameplay/player.tscn)
   - AnimatedSprite2D 行走动画
   - 4方向移动（键盘/手柄）
   - 碰撞检测和边界检查
   - 依赖: Phase 1
   - 风险: 低

7. **实现 TileMap 地图系统** (文件: scenes/maps/ 和 assets/tilesets/)
   - 创建第一纪元示例地图
   - 实现碰撞层配置
   - 实现图层管理（地面/建筑/装饰）
   - 依赖: Phase 1 + 基础素材
   - 风险: 中 - 素材需求

8. **实现事件触发器系统** (文件: scripts/gameplay/event_trigger.gd, scenes/gameplay/event_trigger.tscn)
   - Area2D 触发器（触碰触发）
   - 交互触发（按键触发）
   - 条件触发（亲密度/时间/物品）
   - 事件链执行
   - 依赖: 步骤 6-7
   - 风险: 低

9. **实现对话系统** (文件: scripts/gameplay/dialogue_system.gd, scenes/gameplay/dialogue_box.tscn)
   - 文字框 UI（角色名 + 文本 + 选项）
   - 打字机效果
   - 选项分支
   - 集成 AI 生成的对话
   - 依赖: 步骤 8
   - 风险: 低 - 已有 GalgameDialogueBox 可参考

10. **实现 NPC 控制器** (文件: scripts/gameplay/npc_controller.gd, scenes/gameplay/npc.tscn)
    - NPC 行走图展示
    - NPC 交互触发事件
    - NPC 调度（按时间表移动）
    - 依赖: 步骤 7-9
    - 风险: 低

### Phase 3: 战斗系统（2-3 周）

**目标**: 实现回合制战斗系统

11. **实现战斗场景** (文件: scenes/gameplay/battle.tscn, scripts/gameplay/battle_system.gd)
    - 战斗场景布局（背景 + 角色 + 菜单）
    - 回合制战斗流程（选择行动 → 计算 → 结果）
    - 战斗 UI（HP/MP 条、技能列表、物品列表）
    - 依赖: Phase 2
    - 风险: 中 - 战斗逻辑复杂度

12. **实现战斗计算引擎** (文件: scripts/gameplay/combat_calculation.gd)
    - 移植现有 combatCalculation.ts 逻辑
    - 技能/攻击/防御计算
    - 状态效果（BUFF/DEBUFF）
    - 依赖: 步骤 11
    - 风险: 低 - 纯逻辑移植

13. **实现战斗与探索的切换** (文件: scripts/gameplay/battle_transition.gd)
    - 随机遇敌
    - 剧情触发战斗
    - 战斗胜利/失败处理
    - 依赖: 步骤 11-12
    - 风险: 低

### Phase 4: 菜单与数据系统（2-3 周）

**目标**: 实现游戏菜单、存读档、物品装备系统

14. **实现主菜单和游戏内菜单** (文件: scenes/menus/)
    - 主菜单（开始/继续/设置）
    - 游戏内菜单（角色/物品、装备、技能、存档、设置）
    - HUD（小地图/状态/快捷操作）
    - 依赖: Phase 2
    - 风险: 低

15. **实现存读档系统** (文件: scripts/core/save_system.gd)
    - 游戏状态序列化/反序列化
    - 存档槽管理
    - 自动存档
    - 依赖: Phase 1-2
    - 风险: 中 - 复杂状态序列化

16. **实现物品和装备系统** (文件: scripts/gameplay/inventory_system.gd, scripts/gameplay/equipment_system.gd)
    - 背包管理
    - 装备槽位
    - 物品使用效果
    - 依赖: 步骤 14
    - 风险: 低

### Phase 5: NSFW 与亲密度系统（2-3 周）

**目标**: 实现 NSFW 内容分级和亲密度系统

17. **实现 NSFW 管理器** (文件: scripts/nsfw/nsfw_manager.gd)
    - NSFW 分级控制（0-3 级）
    - 内容解锁逻辑
    - 动态资源加载（根据分级）
    - 依赖: Phase 1-4
    - 风险: 中 - 内容管理复杂度

18. **实现亲密度系统** (文件: scripts/nsfw/intimacy_system.gd)
    - NPC 亲密度追踪
    - 亲密度等级和事件
    - 亲密度影响对话和剧情
    - 依赖: 步骤 9-10
    - 风险: 低

19. **实现 NSFW 场景和 CG 画廊** (文件: scenes/nsfw/, scripts/nsfw/scene_unlock.gd)
    - NSFW 场景触发
    - CG 收集系统
    - 画廊查看功能
    - 依赖: 步骤 17-18 + NSFW 素材
    - 风险: 中 - 素材需求

### Phase 6: 多纪元与世界演变（2-3 周）

**目标**: 实现 7 纪元切换和世界演变系统

20. **实现纪元切换** (文件: scripts/core/era_manager.gd)
    - 纪元状态管理
    - UI 主题切换（每个纪元独特风格）
    - 纪元特定规则和事件
    - 依赖: Phase 1-5
    - 风险: 中 - 多纪元内容管理

21. **实现世界演变系统** (文件: scripts/ai/world_evolution.gd)
    - AI 驱动的世界状态更新
    - 事件影响追踪
    - 历史事件记录
    - 依赖: 步骤 3-4, 20
    - 风险: 中 - AI 状态同步

22. **实现地图加载和切换** (文件: scripts/gameplay/map_transition.gd)
    - 地图间移动
    - 加载画面
    - 地图事件状态保持
    - 依赖: 步骤 7
    - 风险: 低

### Phase 7: Galgame 模式（2-3 周）

**目标**: 实现 Galgame 模式（分支叙事、CG 画廊）

23. **实现 Galgame 场景** (文件: scenes/galgame/galgame_scene.tscn)
    - 背景展示
    - 角色立绘（表情切换、位置、动画）
    - 对话框和选项
    - 依赖: 步骤 9
    - 风险: 低

24. **实现分支叙事系统** (文件: scripts/gameplay/branch_narrative.gd)
    - 分支追踪
    - 选项影响
    - 路线解析
    - 依赖: 步骤 23
    - 风险: 中 - 分支逻辑复杂度

25. **实现 CG 画廊** (文件: scenes/galgame/cg_gallery.tscn)
    - CG 收集
    - 画廊查看
    - 解锁条件
    - 依赖: 步骤 23 + CG 素材
    - 风险: 低

### Phase 8: 内容填充与优化（持续）

**目标**: 填充内容、优化性能、修复 bug

26. **创建 7 纪元内容** (文件: scenes/maps/, resources/data/)
    - 每个纪元的地图、NPC、事件
    - 每个纪元的敌人和战斗
    - 每个纪元的特有物品和技能
    - 依赖: Phase 1-7
    - 风险: 高 - 内容工作量巨大

27. **集成 AI 图像生成** (文件: scripts/ai/image_generation.gd)
    - NPC 头像生成
    - 场景背景生成
    - CG 生成
    - 依赖: 步骤 3
    - 风险: 高 - 图像生成质量和一致性

28. **性能优化**
    - 资源预加载和缓存
    - 内存管理
    - 渲染优化
    - 依赖: Phase 1-7
    - 风险: 中

29. **音频集成**
    - BGM 播放和切换
    - 音效触发
    - 音量控制
    - 依赖: Phase 1-7
    - 风险: 低

## 测试策略

### 单元测试
- 战斗计算逻辑
- AI 服务层（mock HTTP 响应）
- 状态序列化/反序列化
- Prompt 构建器

### 集成测试
- AI 文本生成完整流程
- 存读档流程
- 战斗流程（探索 → 战斗 → 返回）
- 事件触发链

### 玩法测试
- 地图探索循环
- 对话和选项分支
- NSFW 内容分级和解锁
- 纪元切换
- 多周目流程

## 风险与缓解

- **风险**: 素材工作量巨大（7 纪元 × 多场景 × 多角色）
  - **缓解**: 使用可复用素材库（换色、部件替换）、AI 辅助生成、优先完成 MVP 再扩展

- **风险**: AI 响应延迟影响游戏体验
  - **缓解**: 异步预加载、流式显示、本地缓存常用响应、优雅降级

- **风险**: NSFW 内容管理复杂度
  - **缓解**: 严格的分级系统、动态资源加载、独立的 NSFW 模块

- **风险**: 复杂状态同步（AI 生成状态 vs 游戏运行时状态）
  - **缓解**: 明确的状态边界、校验和修复机制、详细的日志记录

- **风险**: Godot 学习曲线
  - **缓解**: 从简单原型开始、参考 RPG Maker 教程、逐步深入

- **风险**: 从文字 RPG 到视觉 RPG 的设计转变
  - **缓解**: 保留文字 RPG 的核心体验（AI 叙事、复杂系统），视觉化作为增强而非替代

## 素材获取策略

### 短期（MVP 阶段，1-2 个月）
1. 使用免费素材包（OpenGameArt, itch.io 免费资源）
2. 主角和关键 NPC 使用 AI 生成 + 手动修正
3. 基础 TileSet 使用素材包
4. 通用 UI 元素

### 中期（3-6 个月）
1. 购买高质量素材包（itch.io 付费资源）
2. 关键角色定制（外包或 AI 生成）
3. 纪元特定素材
4. NSFW 素材专门制作

### 长期（6 个月+）
1. 完整的美术团队或稳定的外包渠道
2. AI 辅助内容生成管线
3. 玩家社区贡献素材
4. DLC 扩展素材

## AI 集成架构详细设计

### 异步 AI 调用模式
```
玩家触发事件
    ↓
EventTrigger 发送信号到 EventManager
    ↓
EventManager 判断是否需要 AI 生成
    ↓
如果是:
    - 构建 Prompt
    - 发送 HTTP 请求（非阻塞）
    - 显示"思考中..."UI
    ↓
AI 响应到达
    ↓
解析响应
    ↓
更新 GameState
    ↓
触发 UI 更新（对话/状态/选项）
```

### AI 响应处理
- 使用 JSON 格式响应（与现有系统一致）
- 实现响应验证和修复（JSON 解析失败时尝试修复）
- 缓存常用响应减少请求
- 支持离线模式（使用预生成内容）

## 复杂度评估

| 模块 | 复杂度 | 原因 |
|------|--------|------|
| 项目基础 | 低 | Godot 入门简单，文档丰富 |
| 状态管理 | 中 | 需映射现有复杂状态结构 |
| AI 服务层 | 中 | 异步处理和错误处理需要仔细设计 |
| 地图系统 | 中 | 需要素材 + TileMap 配置 |
| 对话系统 | 低 | 已有 Galgame 组件可参考 |
| 战斗系统 | 中 | 逻辑复杂但可复用现有计算 |
| NSFW 系统 | 中 | 分级管理和内容解锁 |
| 多纪元 | 高 | 内容工作量巨大 |
| Galgame 模式 | 低 | 主要是 UI 实现 |
| AI 图像生成 | 高 | 质量一致性和管线设计 |

## 建议与决策点

### 是否需要保留所有现有功能？
**建议**：MVP 阶段只保留核心功能（探索、对话、战斗、存读档），其他功能（NSFW、多纪元、AI 图像生成）后续迭代添加。

### 素材制作 vs 素材购买？
**建议**：早期使用购买/免费素材验证玩法，核心角色和关键场景定制。AI 生成可用于原型和辅助。

### AI 生成 vs 预设内容？
**建议**：混合模式。核心剧情使用预设内容保证质量，分支和次要内容使用 AI 生成增加变化。

### 是否使用现有 RPG Maker 插件思路？
**建议**：参考 RPG Maker 的事件系统设计触发器，但使用 Godot 原生节点实现，不直接移植 RPG Maker 插件。

## 与《这是我的战争》风格方案的对比

| 维度 | RPG Maker 风格方案 | TWoM 风格方案 |
|------|-------------------|---------------|
| 视角 | 俯视角（2D top-down） | 横截面侧视（2D side-view） |
| 核心玩法 | 地图探索 + 事件触发 + 回合制战斗 | 基地管理 + 昼夜循环 + 外出探索 |
| 素材需求 | 行走图 + TileSet + 战斗立绘 | 横版场景 + 角色动画 + 建筑剖切 |
| AI 集成 | 事件触发 AI 叙事 | AI 描述驱动场景动画 |
| NSFW 实现 | 事件触发 + CG 画廊 | 场景动画 + 交互式内容 |
| 开发难度 | 中（RPG Maker 模式成熟） | 中高（横版物理 + 动画复杂） |
| 适合内容 | 传统 RPG 叙事 + 多纪元 | 生存压力 + 道德抉择 |

**推荐**：如果目标是制作类似 RPG Maker 黄油的游戏，RPG Maker 风格方案更合适。如果目标是创新玩法结合现有文字 RPG 特色，TWoM 风格方案更有特色。

## 下一步

1. 确认项目范围和优先级（MVP 包含哪些功能）
2. 确认素材预算和来源
3. 确认 AI API 预算和供应商
4. 创建 Godot 项目原型
5. 开始 Phase 1 实施

---

*计划版本: v1.0 | 创建日期: 2026-05-26*
