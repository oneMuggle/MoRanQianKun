/**
 * NPC NSFW 增强模块 — 核心类型定义
 * 性癖分类、敏感点区域、增强版表里人格、联动系统
 */

// ==================== 性癖分类体系 ====================

export type 性癖大类 =
  | '主导控制'     // 支配/服从/指令
  | '角色扮演'     // 职业/身份扮演
  | '感官刺激'     // 轻咬/抚摸/温度
  | '暴露窥视'     // 露出/偷窥/被拍
  | '拘束限制'     // 束缚/蒙眼/噤声
  | '语言调教'     // 羞辱/称赞/命令
  | '公共冒险'     // 半公开/险些暴露
  | '情感依赖'     // 占有/嫉妒/专属
  | '特殊偏好';    // 恋物/特定服装/特定场景

export type 性癖强度 = 1 | 2 | 3 | 4 | 5;

export type 解锁条件类型 = '亲密度阈值' | '事件触发' | '行为累积' | '场景触发' | '人格切换';

export interface 解锁条件 {
  类型: 解锁条件类型;
  值: number | string;
  描述?: string;
}

export type 性癖条目来源 = '人格模板' | '事件觉醒' | '行为演化' | 'AI叙事';

export interface 性癖觉醒记录 {
  触发事件: string;
  触发时间: string;
  初始强度: number;
  累积次数: number;
}

export interface 性癖条目 {
  类别: 性癖大类;
  子类型: string;
  强度: 性癖强度;
  解锁条件?: 解锁条件;
  描述: string;
  时代适配?: string[];
  来源?: 性癖条目来源;
  觉醒事件?: 性癖觉醒记录;
  衰减率?: number;
  最近活跃时间?: string;
}

export interface 性癖档案 {
  核心偏好: 性癖条目[];
  隐藏偏好: 性癖条目[];
  绝对禁忌: string[];
  可协商: string[];
  倾向摘要: string;
}

// ==================== 敏感点身体区域模型 ====================

export type 身体区域分类 =
  | '头颈区'   // 耳垂/后颈/发丝/太阳穴
  | '胸胸区'   // 胸部/乳头/乳沟
  | '腰腹区'   // 腰侧/肚脐/小腹
  | '四肢区'   // 大腿内侧/手心/脚踝/膝盖后
  | '背部区'   // 脊柱线/肩胛骨/后腰
  | '私密区'   // 核心私密区域
  | '特殊区';  // 个体专属敏感点（需发现）

export type 敏感点发现状态 = '未发觉' | '已发现' | '已开发';

export type 敏感点开发程度 = '未开发' | '初步探索' | '渐入佳境' | '深度开发' | '完全开发';

export interface 敏感点条目 {
  区域: 身体区域分类;
  名称: string;
  敏感度: 性癖强度;
  时代名称?: string;
  反应描述: string;
  发现状态: 敏感点发现状态;
  描写提示词: string;
  开发程度?: 敏感点开发程度;
}

export interface 敏感点档案 {
  主要敏感点: 敏感点条目[];
  隐藏敏感点: 敏感点条目[];
  弱点摘要: string;
}

// ==================== 增强版表里人格 ====================

export interface 人格激活条件 {
  亲密度阈值?: number;
  关系状态?: string[];
  时间条件?: string;
  地点条件?: string;
  事件条件?: string;
}

export interface 表人格表现 {
  性格描述: string;
  行为特征: string[];
  对话风格: string;
  服饰偏好: string;
  社交面具: string;
}

export interface 里人格表现 {
  性格描述: string;
  行为特征: string[];
  对话风格: string;
  欲望驱动: string[];
  反差触发器: string;
}

export interface 表里人格档案 {
  名称: string;
  身份标签: string[];
  表: 表人格表现;
  里: 里人格表现;
  关联偏好: 性癖条目[];
  关联敏感点: 敏感点条目[];
  推荐场景: string[];
  激活条件: 人格激活条件;
}

// ==================== 联动系统 ====================

export interface NPCNSFW画像 {
  人格: 表里人格档案 | null;
  性癖: 性癖档案;
  敏感点: 敏感点档案;
  推荐场景: string[];
}

// ==================== 查询接口 ====================

export interface 性癖查询参数 {
  eraId?: string;
  人格标签?: string[];
  年龄层?: '少女' | '青年' | '成熟' | '中年';
  最大条目数?: number;
}

export interface 敏感点查询参数 {
  eraId?: string;
  年龄层?: '少女' | '青年' | '成熟' | '中年';
  最大条目数?: number;
}

// ==================== 性癖动态变化（演化系统） ====================

export type 性癖变化类型 =
  | '强度提升'
  | '强度降低'
  | '新性癖觉醒'
  | '禁忌软化'
  | '偏好升级'
  | '衰减淡化';

export interface 性癖变化日志 {
  时间: string;
  变化类型: 性癖变化类型;
  性癖类别: 性癖大类;
  性癖子类型: string;
  旧值: number;
  新值: number;
  触发原因: string;
  关联事件: string;
}

export interface 性癖演化状态 {
  演化日志: 性癖变化日志[];
  事件计数器: Record<string, number>;
  最后演化时间: string;
}

// ==================== 心理防线系统 ====================

export type 心理防线等级 = '保守' | '传统' | '开放' | '放纵';

export interface 心理防线状态 {
  当前等级: 心理防线等级;
  防线值: number;         // 0-100, 内部数值, 跨等级平滑过渡
  历史最低值: number;     // 记录最彻底的突破
  恢复速率: number;       // 每回合恢复量, 默认0.5
  最近变化时间: string;
  变化日志: 防线变化日志[];
}

export interface 防线变化日志 {
  时间: string;
  旧等级: 心理防线等级;
  新等级: 心理防线等级;
  旧防线值: number;
  新防线值: number;
  触发原因: string;
}

// ==================== 性癖潜能/觉醒系统 ====================

export interface 性癖潜能值 {
  类别: 性癖大类;
  子类型: string;
  潜能值: number;         // 0-10, 隐藏潜能, 越高越容易觉醒
  已觉醒: boolean;
  觉醒条件: string[];     // 需要触发的具体事件类型
  觉醒阈值: number;       // 达到多少累积次数后觉醒
  当前累积: number;       // 当前已累积的次数
}

// ==================== 偏好漂移系统 ====================

export interface 偏好漂移状态 {
  事件频率统计: Record<string, number>;  // 各事件发生次数
  最近事件序列: string[];                // 最近N个事件(滑动窗口, 默认20)
  漂移方向: 性癖大类 | null;             // 当前漂移趋势
  漂移强度: number;                      // 0-1, 漂移置信度
  最后计算时间: string;
}

// ==================== 人格演化系统 ====================

export type 人格翻转类型 = '表里互换' | '欲望觉醒' | '创伤封闭' | '解放突破';

export interface 人格演化状态 {
  当前表人格: 表人格表现 | null;
  当前里人格: 里人格表现 | null;
  人格偏离度: number;        // 0-100, 从原始模板的偏离程度
  人格翻转历史: 人格翻转日志[];
  最后演化时间: string;
}

export interface 人格翻转日志 {
  时间: string;
  翻转类型: 人格翻转类型;
  触发事件: string;
  旧表人格描述: string;
  新表人格描述: string;
  旧里人格描述: string;
  新里人格描述: string;
}

// ==================== 敏感点演化系统 ====================

export interface 敏感点演化状态 {
  开发记录: 敏感点开发日志[];
  新发现记录: 敏感点发现日志[];
  最后演化时间: string;
}

export interface 敏感点开发日志 {
  时间: string;
  敏感点名称: string;
  旧开发程度: 敏感点开发程度;
  新开发程度: 敏感点开发程度;
  触发事件: string;
}

export interface 敏感点发现日志 {
  时间: string;
  敏感点名称: string;
  区域: 身体区域分类;
  触发事件: string;
}

// ==================== 孕产系统 ====================

export type 妊娠阶段 =
  | '未受孕'
  | '受孕判定中'
  | '妊娠一月'
  | '妊娠二月'
  | '妊娠三月'
  | '妊娠四月'
  | '妊娠五月'
  | '妊娠六月'
  | '妊娠七月'
  | '妊娠八月'
  | '妊娠九月'
  | '分娩中'
  | '产后恢复';

export type 孕产变化类型 =
  | '受孕成功'
  | '妊娠推进'
  | '分娩完成'
  | '产后恢复'
  | '受孕失败';

export interface 孕产变化日志 {
  时间: string;
  变化类型: 孕产变化类型;
  旧阶段: 妊娠阶段;
  新阶段: 妊娠阶段;
  触发原因: string;
  备注?: string;
}

export interface 孕产演化状态 {
  当前阶段: 妊娠阶段;
  妊娠开始时间?: string;
  预产期?: string;
  受孕率?: number;     // 0-100, 受孕判定概率
  变化日志: 孕产变化日志[];
}

// ==================== 事后护理系统 ====================

export type 事后情绪类型 =
  | '羞耻'
  | '依恋'
  | '后悔'
  | '安心'
  | '空虚'
  | '兴奋'
  | '恐惧'
  | '麻木';

export interface 事后情绪条目 {
  情绪类型: 事后情绪类型;
  强度: number;         // 0-100
  衰减速率: number;     // 每回合衰减量
}

export interface 事后护理状态 {
  当前情绪: 事后情绪条目[];
  护理质量: '无视' | '敷衍' | '温柔' | '用心';  // 玩家事后行为
  关系影响值: number;   // -100 到 +100, 对本次关系的影响
  恢复速率: number;     // 每回合情绪恢复量, 默认 5
  最后护理时间: string;
  护理日志: 情感余波日志[];
}

export interface 情感余波日志 {
  时间: string;
  触发事件: string;
  情绪变化: { 类型: 事后情绪类型; 旧强度: number; 新强度: number }[];
  护理质量: string;
  备注?: string;
}

// ==================== 服装层次系统 ====================

import type { 服饰部位分类 } from '../social';

export type 服装损坏程度 = '完好' | '褶皱' | '凌乱' | '破损' | '撕裂' | '移除';

export interface 服装层次条目 {
  部位: 服饰部位分类;
  名称: string;
  损坏程度: 服装损坏程度;
  污渍: boolean;
  移除顺序: number;
}

export interface 服装层次结构 {
  层次: 服装层次条目[];
  变更日志: 服装变更日志[];
  最后变更时间: string;
}

export interface 服装变更日志 {
  时间: string;
  部位: 服饰部位分类;
  变更类型: '移除' | '损坏' | '污渍' | '重新穿着';
  旧状态: string;
  新状态: string;
  触发原因: string;
}

// ==================== 统一演化状态 ====================

export interface 完整演化状态 {
  // 原有字段
  演化日志: 性癖变化日志[];
  事件计数器: Record<string, number>;
  最后演化时间: string;
  // 新增字段
  心理防线?: 心理防线状态;
  潜能池?: 性癖潜能值[];
  偏好漂移?: 偏好漂移状态;
  人格演化?: 人格演化状态;
  敏感点演化?: 敏感点演化状态;
  孕产演化?: 孕产演化状态;
  事后护理?: 事后护理状态;
  服装层次?: 服装层次结构;
  后果系统?: import('./consequences/types').后果系统状态;
  跨模块联动?: import('./linker/types').跨模块联动状态;
  性癖发现?: import('./discovery/fetishDiscovery').性癖发现状态;
  敏感点探索?: import('./discovery/sensitivePointDiscovery').敏感点探索状态;
  人格演化触发?: import('./discovery/personalityTrigger').人格演化触发状态;
}

// ==================== 扩展 NPCNSFW画像 ====================

import type { 后果条目 } from './consequences/types';
import type { 已激活联动 } from './linker/types';

export interface NPCNSFW画像 {
  人格: 表里人格档案 | null;
  性癖: 性癖档案;
  敏感点: 敏感点档案;
  推荐场景: string[];
  心理防线?: 心理防线状态;
  偏好漂移?: 偏好漂移状态;
  人格翻转历史?: 人格翻转日志[];
  孕产状态?: 孕产演化状态;
  事后护理?: 事后护理状态;
  后果?: 后果条目[];
  待执行联动?: 已激活联动[];
}

// ==================== 玩家 NSFW 偏好档案 ====================

export type 偏好强度等级 = '反感' | '中立' | '喜欢' | '痴迷';

export interface 玩家NSFW偏好条目 {
  偏好类型: string;          // 如"暴露窥视"、"拘束限制"等
  强度等级: 偏好强度等级;
  解锁时间?: string;
  累积次数: number;           // 玩家选择/触发该偏好的次数
}

export interface NPC契合度条目 {
  npcId: string;
  npc姓名: string;
  契合度评分: number;         // 0-100, 基于性癖/敏感点/人格匹配
  互动次数: number;
  最近互动时间: string;
  契合原因: string[];         // 如"性癖高度匹配"、"人格互补"等
}

export interface 玩家NSFW偏好档案 {
  偏好列表: 玩家NSFW偏好条目[];
  npc契合度: NPC契合度条目[];
  总NSFW互动次数: number;
  偏好最后更新时间: string;
  变化日志: 玩家偏好变化日志[];
}

export interface 玩家偏好变化日志 {
  时间: string;
  变化类型: '新增偏好' | '偏好升级' | '偏好降级' | '契合度更新';
  描述: string;
}

// ==================== NSFW 里程碑系统 ====================

export type 里程碑类别 =
  | '首次'           // 首次体验类
  | '关系进展'       // 关系里程碑
  | '性癖发现'       // 性癖相关
  | '场景成就'       // 场景相关
  | '特殊事件'       // 孕产/人格翻转等
  | '收集';          // CG/回忆收集

export type 里程碑稀有度 = '普通' | '稀有' | '史诗' | '传说';

export interface 里程碑定义 {
  id: string;
  名称: string;
  类别: 里程碑类别;
  稀有度: 里程碑稀有度;
  描述: string;
  触发条件: (npc: import('../social').NPC结构, 上下文: 里程碑触发上下文) => boolean;
  图标?: string;
}

export interface 里程碑触发上下文 {
  事件类型: string;
  事件描述: string;
  游戏时间: string;
  关联NpcId?: string;
}

export interface 已解锁里程碑 {
  里程碑Id: string;
  解锁时间: string;
  关联NpcId?: string;
  关联Npc姓名?: string;
  备注?: string;
}

export interface 里程碑追踪状态 {
  已解锁: 已解锁里程碑[];
  进度: Record<string, number>;  // 里程碑id → 当前进度(0-100)
  最后检查时间: string;
}
