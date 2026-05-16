/**
 * BDSM 独立系统 — 论坛子系统
 *
 * 从 campusNSFW/bdsm-forum.ts 迁移，去校园化
 */

/** 通用基础帖子类型，不依赖校园手机模块 */
export interface 基础帖子 {
  id: string;
  作者: string;
  标题: string;
  内容: string;
  分类: string;
  发布时间: string;
  回复数: number;
  浏览数: number;
  点赞数: number;
  是否置顶: boolean;
  是否精华: boolean;
}

export type BDSM帖子分类 =
  | '匿名讨论'
  | '经验交流'
  | '物品话题'
  | '心理探索'
  | '安全科普'
  | '寻主召奴';

export type 招募方角色 = '寻主' | '召奴' | '不限';

export type 联系状态 = '未联系' | '沟通中' | '已确认' | '已拒绝' | '关系建立';

export type 影响等级 = '轻微' | '中等' | '严重';

export interface 寻主召奴信息 {
  招募方角色: 招募方角色;
  期望关系类型: string;
  接头暗号?: string;
  '关联NPC ID'?: string;
  是否已联系: boolean;
  联系状态: 联系状态;
  解锁NPC姓名?: string;
}

export interface BDSM论坛帖子 extends 基础帖子 {
  子分类: BDSM帖子分类;
  影响等级: 影响等级;
  寻主召奴信息?: 寻主召奴信息;
}

export interface BDSM影响记录 {
  id: string;
  帖子ID: string;
  '关联NPC ID'?: string;
  关联NPC姓名: string;
  影响类型: '欲望推进' | '流言传播' | '暴露风险' | '角色解锁';
  影响描述: string;
  时间: string;
}

export interface 联系对话 {
  发送者: '玩家' | 'NPC';
  内容: string;
  时间: string;
}

export interface 寻主召奴联系会话 {
  帖子ID: string;
  对话记录: 联系对话[];
  开始时间: string;
  结果: 联系状态;
  '解锁NPC ID'?: string;
  解锁NPC姓名?: string;
}

export interface BDSM论坛设置 {
  启用BDSM论坛: boolean;
  BDSM内容强度: '关闭' | '轻度' | '中度' | '深度';
  启用NPC影响: boolean;
  启用流言传播: boolean;
}

export const 默认BDSM论坛设置: BDSM论坛设置 = {
  启用BDSM论坛: false,
  BDSM内容强度: '轻度',
  启用NPC影响: true,
  启用流言传播: true,
};

export const BDSM子分类列表: BDSM帖子分类[] = [
  '匿名讨论',
  '经验交流',
  '物品话题',
  '心理探索',
  '安全科普',
  '寻主召奴',
];
