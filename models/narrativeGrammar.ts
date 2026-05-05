/**
 * narrativeGrammar.ts
 * 叙事语法引擎类型定义
 *
 * 定义叙事输出的结构化类型，包括：
 * - 叙事行类型（旁白、角色台词、判定）
 * - 叙事块结构
 * - 验证结果类型
 */

/**
 * 判定行判定类型枚举
 */
export type 判定类型 =
    | '通用'
    | '对抗'
    | '洞察'
    | '先机'
    | '瞄准'
    | '接战'
    | '防御'
    | '伤害'
    | '态势'
    | '反击'
    | '反馈'
    | '消耗'
    | '衰退';

/**
 * 判定结果枚举
 */
export type 判定结果 = '成功' | '失败' | '大成功' | '大失败';

/**
 * 旁白行
 */
export interface 旁白行 {
    类型: '旁白';
    内容: string;
    原始行: string;
}

/**
 * 角色台词行
 */
export interface 角色台词行 {
    类型: '角色台词';
    角色名: string;
    内容: string;
    原始行: string;
}

/**
 * 判定行
 */
export interface 判定行 {
    类型: '判定';
    判定类型: 判定类型;
    行动名: string;
    触发对象: string;
    玩家?: string;
    角色名?: string;
    判定值: number;
    难度: number;
    基础: number;
    环境: number;
    状态: number;
    幸运?: number;
    装备?: string;
    结果: 判定结果;
    原始行: string;
}

/**
 * 叙事块结构
 */
export interface 叙事块 {
    正文: (旁白行 | 角色台词行 | 判定行)[];
    变量规划?: string;
    剧情规划?: string;
    短期记忆?: string;
    thinking?: string;
    行动选项?: string;
    disclaimer?: string;
}

/**
 * 验证错误项
 */
export interface 验证错误 {
    行号: number;
    原始行: string;
    错误类型: '格式错误' | '缺少必填字段' | '值类型错误' | '标签错误';
    错误信息: string;
}

/**
 * 验证结果
 */
export interface 验证结果 {
    有效: boolean;
    错误列表: 验证错误[];
}

/**
 * 解析选项
 */
export interface 解析选项 {
    严格模式?: boolean;
    允许不完整?: boolean;
}
