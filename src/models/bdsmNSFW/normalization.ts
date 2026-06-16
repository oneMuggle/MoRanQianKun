/**
 * BDSM 独立系统 — 设置规范化
 *
 * 2026-06-03：BDSM系统设置 接口与 默认BDSM系统设置 常量从 ./index 移入此处，
 * 解决 index.ts ↔ normalization.ts 循环依赖。
 */

// === 系统设置（2026-06-03 从 index.ts 移入）===

export interface BDSM系统设置 {
  启用BDSM独立系统: boolean;
  BDSM内容强度: '关闭' | '轻度' | '中度' | '深度';
  启用BDSM论坛: boolean;
  启用BDSM调教任务: boolean;
  启用BDSM契约系统: boolean;
  启用BDSM见面预约: boolean;
  启用BDSM关系管线: boolean;
  启用BDSM多角色关系: boolean;
  启用BDSM时代场景包: boolean;
  启用BDSM信誉系统: boolean;
  启用BDSM安全词历史: boolean;
  启用BDSM契约模板库: boolean;
}

export const 默认BDSM系统设置: BDSM系统设置 = {
  启用BDSM独立系统: false,
  BDSM内容强度: '轻度',
  启用BDSM论坛: true,
  启用BDSM调教任务: true,
  启用BDSM契约系统: true,
  启用BDSM见面预约: true,
  启用BDSM关系管线: true,
  启用BDSM多角色关系: false,
  启用BDSM时代场景包: true,
  启用BDSM信誉系统: false,
  启用BDSM安全词历史: false,
  启用BDSM契约模板库: false,
};

const 读取布尔 = (value: unknown, fallback: boolean): boolean =>
  typeof value === 'boolean' ? value : fallback;

const 合法BDSM强度 = ['关闭', '轻度', '中度', '深度'] as const;

function 枚举校验<T extends string>(value: unknown, 合法值: readonly T[], fallback: T): T {
  return (合法值 as readonly string[]).includes(typeof value === 'string' ? value : '')
    ? (value as T)
    : fallback;
}

/**
 * 规范化 BDSM 系统设置
 */
export function 规范化BDSM系统设置(raw: Partial<BDSM系统设置>): BDSM系统设置 {
  const s = 默认BDSM系统设置;
  return {
    启用BDSM独立系统: 读取布尔(raw.启用BDSM独立系统, s.启用BDSM独立系统),
    BDSM内容强度: 枚举校验(raw.BDSM内容强度, 合法BDSM强度, s.BDSM内容强度),
    启用BDSM论坛: 读取布尔(raw.启用BDSM论坛, s.启用BDSM论坛),
    启用BDSM调教任务: 读取布尔(raw.启用BDSM调教任务, s.启用BDSM调教任务),
    启用BDSM契约系统: 读取布尔(raw.启用BDSM契约系统, s.启用BDSM契约系统),
    启用BDSM见面预约: 读取布尔(raw.启用BDSM见面预约, s.启用BDSM见面预约),
    启用BDSM关系管线: 读取布尔(raw.启用BDSM关系管线, s.启用BDSM关系管线),
    启用BDSM多角色关系: 读取布尔(raw.启用BDSM多角色关系, s.启用BDSM多角色关系),
    启用BDSM时代场景包: 读取布尔(raw.启用BDSM时代场景包, s.启用BDSM时代场景包),
    启用BDSM信誉系统: 读取布尔(raw.启用BDSM信誉系统, s.启用BDSM信誉系统),
    启用BDSM安全词历史: 读取布尔(raw.启用BDSM安全词历史, s.启用BDSM安全词历史),
    启用BDSM契约模板库: 读取布尔(raw.启用BDSM契约模板库, s.启用BDSM契约模板库),
  };
}
