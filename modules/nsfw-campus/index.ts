/**
 * 校园 NSFW 模块入口
 *
 * 包含：欲望状态机、关系轨道、露出、SM、桌游、校园祭、BDSM 论坛等子系统。
 * 属于现代时代（contemporary）的子模块。
 */

import type { ModuleManifest } from '../../core/types/module';
import { 构建校园NSFW完整叙事约束 } from '../../prompts/runtime/campusNSFW';

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
      关系轨道: '未定义',
      暴露风险: 0,
      流言等级: 0,
      已解锁SM场景: [],
      内容强度: '微暗',
      启用BDSM论坛: false,
      BDSM内容强度: '关闭',
    });
  },
};

// 导出供外部使用的类型和常量
export { 默认校园NSFW设置, 规范化校园NSFW设置 } from '../../models/campusNSFW';
export type { 校园NSFW设置, 露出偏好等级, 权力倾向, SM场景类型 } from '../../models/campusNSFW';
