/**
 * 露出 NSFW 独立系统 — 设置类型
 */

export interface ExposureNSFW设置 {
  启用露出系统: boolean;
  露出内容强度: '关闭' | '轻度' | '中度' | '深度';
  启用公开隐秘侵犯: boolean;
  启用旁观者反应: boolean;
  启用网络传播: boolean;
  校园活动NSFW频率: '关闭' | '低' | '中' | '高';
}

export const 默认ExposureNSFW设置: ExposureNSFW设置 = {
  启用露出系统: false,
  露出内容强度: '关闭',
  启用公开隐秘侵犯: false,
  启用旁观者反应: false,
  启用网络传播: false,
  校园活动NSFW频率: '关闭',
};
