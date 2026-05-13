/**
 * AVG 分支叙事 — 数据模型
 */

/** 分支点类型 */
export type BranchPointType =
  | 'dialogue_choice'    // 对话选项
  | 'action_choice'      // 行动选择
  | 'moral_choice'       // 道德选择
  | 'relationship_choice' // 关系选择
  | 'plot_critical';     // 关键剧情

/** 分支后果类型 */
export type ConsequenceType =
  | 'stat_change'        // 属性变化
  | 'intimacy_change'    // 好感度变化
  | 'flag_set'           // 标记设置
  | 'item_change'        // 物品变化
  | 'task_change'        // 任务变化
  | 'route_change'       // 路线变更
  | 'ending_modifier';   // 结局影响

/** 分支选择记录 */
export interface BranchChoice {
  id: string;
  branchPointId: string;
  choiceText: string;
  targetNodeId: string;
  timestamp: number;
  turnNumber: number;
}

/** 后果定义 */
export interface Consequence {
  type: ConsequenceType;
  field: string;
  value: number | string | boolean;
  /** 延迟应用的回合数（0=立即） */
  delayTurns: number;
}

/** 分支点定义 */
export interface BranchPoint {
  id: string;
  type: BranchPointType;
  title: string;
  context?: string;
  choices: { id: string; text: string; description?: string; consequences: Consequence[]; targetNodeId?: string }[];
  storyChapterId?: string;
  isCritical: boolean;
}

/** 分支历史条目 */
export interface BranchHistoryEntry {
  branchPointId: string;
  choice: BranchChoice;
  appliedConsequences: string[];
  isCritical: boolean;
  isReverted: boolean;
}

/** 分支叙事状态 */
export interface BranchNarrativeState {
  history: BranchHistoryEntry[];
  activeRouteId: string | null;
  criticalBranchIds: string[];
  triggeredConsequenceIds: string[];
  narrativeTension: number;
}

/** 后果解析结果 */
export interface ConsequenceResolution {
  applied: Consequence[];
  pending: Consequence[];
  tensionDelta: number;
}

/** 分支影响分析 */
export interface BranchImpactAnalysis {
  criticalChoicesCount: number;
  routeLocked: boolean;
  tensionLevel: number;
  affectedNpcs: string[];
  storyAdjustments: string[];
}
