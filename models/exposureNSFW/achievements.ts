/**
 * 露出 NSFW 独立系统 — 成就类型定义
 */

/** 成就分类 */
export type 露出成就分类 = '首次' | '里程碑' | '极限挑战' | '社交大师' | '全身而退';

/** 成就达成条件类型 */
export type 露出成就条件类型 =
  | '首次露出'
  | '首次成功'
  | '首次失败'
  | '等级达到'
  | '紧张度超过'
  | '旁观者数量'
  | '网络流言等级'
  | '社会性死亡'
  | '完美脱身'
  | '连续成功';

/** 露出成就记录 */
export interface 露出成就 {
  id: string;
  名称: string;
  描述: string;
  分类: 露出成就分类;
  条件: 露出成就条件类型;
  条件值: number;
  图标: string;
  已达成: boolean;
  达成时间?: string;
}

/** 成就检查上下文 */
export interface 成就检查上下文 {
  当前露出等级: number;
  当前紧张度: number;
  旁观者数量: number;
  网络流言等级: number;
  是否首次: boolean;
  是否首次成功: boolean;
  是否首次失败: boolean;
  是否社会性死亡: boolean;
  是否完美脱身: boolean;
  连续成功次数: number;
  历史总成功次数: number;
  历史总失败次数: number;
}

/** 新达成的成就 */
export interface 新达成成就 {
  成就: 露出成就;
  原因: string;
}
