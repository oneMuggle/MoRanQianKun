// 写真约拍 NSFW 模块 — 桶导出 + 设置 + 默认值

export type {
  写真类型, 拍摄场所, 拍摄风格,
  模特类型, 模特职业状态, 模特保护意识, 拍摄经历类型,
  摄影师类型, 摄影师动机, 摄影师信誉,
  服装类型, 拍摄尺度, 后期处理,
  越界行为类型, 泄露类型, 传播范围,
  玩法层类型, 写真玩法配置,
  药物酒精等级, 把柄分级, 操控行为类型,
  行业潜规则类型, 依赖类型, 定制需求等级,
} from './types';

export { 默认写真玩法配置 } from './types';

// ==================== Phase 3: 玩法增强 ====================

export type {
  回合决策, 情绪调节方式, 拍摄技巧,
  回合结果, 技巧解锁状态,
} from './shootDecisionSystem';

export {
  拍摄回合决策,
  模特情绪管理,
  信任度博弈评估,
  拍摄技巧解锁,
  计算回合收益,
} from './shootDecisionSystem';

export type {
  后期风格, 修图决策,
  作品评级结果, 后期处理结果,
} from './postProcessing';

export {
  选择后期风格,
  修图决策 as 执行修图决策,
  作品评级,
  执行后期处理,
} from './postProcessing';

export type {
  应急响应,
  泄露检测结果, 应急响应结果,
} from './leakResponse';

export {
  泄露检测,
  执行应急响应,
  泄露后果最小化,
} from './leakResponse';

// ==================== Phase 8: 多人场景 ====================

export type {
  模特拍摄状态, 多人拍摄会话, 模特间事件, 拍摄回合结果,
} from './multiModelShoot';

export {
  创建多人拍摄会话,
  计算群体动态,
  执行拍摄回合,
  结算多人拍摄,
} from './multiModelShoot';

export type {
  模特核心状态, 摄影师核心状态,
  拍摄项目状态, 泄露事件状态,
} from './states';

// ==================== 设置接口 ====================

export interface 写真NSFW设置 {
  启用写真NSFW系统: boolean;
  NSFW内容强度: '微暗' | '暧昧' | '露骨';
  主要玩法层: '经营管理' | '人际关系' | '灰色地带';
  次要玩法权重: number;
  启用道德选择: boolean;
  启用尺度递进: boolean;
  启用摄影师筛选: boolean;
  启用越界识别: boolean;
  启用安全词系统: boolean;
  启用照片交付: boolean;
  启用泄露事件: boolean;
  泄露事件频率: '低' | '中' | '高';
  涉及BDSM模块: boolean;
}

export const 默认写真NSFW设置: 写真NSFW设置 = {
  启用写真NSFW系统: false,
  NSFW内容强度: '微暗',
  主要玩法层: '灰色地带',
  次要玩法权重: 30,
  启用道德选择: false,
  启用尺度递进: false,
  启用摄影师筛选: false,
  启用越界识别: false,
  启用安全词系统: false,
  启用照片交付: false,
  启用泄露事件: false,
  泄露事件频率: '低',
  涉及BDSM模块: false,
};

// ==================== 系统扩展接口（state mount） ====================

export interface 写真系统扩展 {
  模特档案?: Record<string, import('./states').模特核心状态>;
  摄影师档案?: Record<string, import('./states').摄影师核心状态>;
  进行中的拍摄项目?: import('./states').拍摄项目状态[];
  历史拍摄记录?: import('./states').拍摄项目状态[];
  泄露事件列表?: import('./states').泄露事件状态[];

  // 新增：关系网络（key: "模特Id-摄影师Id"）
  关系网络?: Record<string, {
    信任度: number;
    亲密度: number;
    默契度: number;
    合作次数: number;
    关系等级: string;
    里程碑: string[];
  }>;

  // 新增：摄影集索引（key: 模特Id 或 摄影师Id）
  摄影集索引?: Record<string, {
    作品总数: number;
    发布数量: number;
    代表作?: string[];  // 项目ID列表
  }>;

  // 新增：声望系统
  摄影师声望?: Record<string, {
    业内声望: number;
    圈内声誉: number;
    风评: '优秀' | '良好' | '一般' | '争议' | '恶劣';
    标签: string[];
    粉丝数量: number;
    合作意向: number;
  }>;

  模特声望?: Record<string, {
    知名度: number;
    风评: string;
    标签: string[];
    黑料风险: number;
  }>;
}
