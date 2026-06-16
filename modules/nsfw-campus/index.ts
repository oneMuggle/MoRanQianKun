/**
 * 校园 NSFW 模块入口
 *
 * 包含：欲望状态机、关系轨道、露出、SM、桌游、校园祭、BDSM 论坛等子系统。
 * 属于现代时代（contemporary）的子模块。
 */

import type { ModuleManifest } from '../../core/types/module';
import { 构建校园NSFW完整叙事约束 } from '../../src/prompts/runtime/campusNSFW';

/** 模块清单 */
export const manifest: ModuleManifest = {
  id: 'nsfw-campus',
  name: '校园 NSFW',
  version: '2.0.0',
  category: 'nsfw',
  eraId: 'contemporary',
  description: '校园纪元 NSFW 深化系统：欲望状态机、关系轨道、露出、SM、桌游、校园祭、BDSM 论坛',
  configKey: '启用校园NSFW深化系统',
  configValue: true,
  dependencies: [],
  promptBlock: () => {
    return 构建校园NSFW完整叙事约束({
      欲望阶段: '克制',
      关系轨道: '纯爱',
      暴露风险: 0,
      流言等级: 0,
      已解锁SM场景: [],
      紧张度: 0,
      权力倾向: '偏服从',
      服从度: 0,
      露出偏好等级: 0,
      桌游类型: '真心话大冒险',
      密室主题: '古宅惊魂',
    });
  },
};

// 导出供外部使用的类型和常量
export { 默认校园NSFW设置 } from '../../src/models/campusNSFW';
export { 规范化校园NSFW设置 } from '../../src/models/campusNSFW/normalization';
export type { 校园NSFW设置, 露出偏好等级, 权力倾向, SM场景类型 } from '../../src/models/campusNSFW';
