/**
 * game-settings.ts — 类型桥（Type Bridge）
 *
 * 历史背景：该文件曾与 `models/system.ts` 并存，定义了一套"重叠但不完全一致"的游戏设置类型，
 * 导致：
 *   1. `游戏设置结构` 字段在两份定义间漂移（如 system.ts 缺 ExposureNSFW设置，
 *      game-settings.ts 缺 启用动态难度/启用调试模式/酒馆预设6字段/变量生成2字段）
 *   2. 同一概念字段命名分歧（system.ts: `BDSM系统设置` vs game-settings.ts: `BDSMNSFW设置`）
 *   3. `types.ts` 不得不混合 `export *` 与显式 `export type` 来回避冲突
 *
 * 现在的做法（2026-06-05 重构）：
 *   - `models/system.ts` 为 **唯一权威定义源**，承载完整的 `游戏设置结构`、`最近开局配置结构`
 *     等运行期类型；并同时声明 `BDSM系统设置?` 与 `BDSMNSFW设置?`（互为别名）兼容旧字段名。
 *   - 本文件保留为薄薄的 re-export 层，仅供历史 import 路径继续可用：
 *       data/recommendations.ts  →  import { NSFW场景类型 } from '../models/game-settings'
 *       types.ts                 →  export type { 最近开局配置结构 } from './models/game-settings'
 *       models/index.ts          →  export type { 游戏设置结构, ... } from './game-settings'
 *
 * 维护规则：
 *   - 任何 `游戏设置结构` 字段变更必须在 `models/system.ts` 内进行
 *   - 本文件除 re-export 外不要新增类型定义
 */

export type {
    // 游戏配置相关
    剧情风格类型,
    NTL后宫档位,
    酒馆提示词后处理类型,
    武力等级,
    NSFW场景类型,
    剧情推进速度,
    行动选项增强档位,
    // 能力系统
    能力类型,
    超能力分类,
    觉醒程度,
    // 难度与统计
    游戏难度,
    难度调整记录,
    游戏统计,
    // 开局与同人
    初始关系模板类型,
    关系侧重类型,
    开局切入偏好类型,
    同人来源类型,
    同人融合强度类型,
    酒馆预设消息角色类型,
    同人角色替换规则结构,
    同人融合配置结构,
    OpeningConfig,
    WorldGenConfig,
    最近开局配置结构,
    SaveType,
    // 酒馆预设
    酒馆预设提示词结构,
    酒馆预设顺序项结构,
    酒馆预设顺序结构,
    酒馆预设结构,
    酒馆预设条目结构,
    // 游戏设置
    行动选项输入模式类型,
    游戏设置结构,
    // 记忆系统
    记忆配置结构,
    记忆系统结构,
    回忆条目结构,
    // 聊天与存档
    聊天记录结构,
    存档元数据结构,
    核心提示词快照结构,
    存档结构,
    // 提示词与节日
    PromptCategory,
    提示词结构,
    节日结构,
    // 时代信息
    时代信息结构,
} from './system';

export {
    武力等级描述映射,
    NSFW场景描述映射,
    剧情推进速度描述映射,
    超能力分类描述,
    觉醒程度描述,
    能力类型描述映射,
    默认游戏统计,
} from './system';
