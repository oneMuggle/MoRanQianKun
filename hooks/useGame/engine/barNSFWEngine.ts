/**
 * 酒吧 NSFW 引擎适配器
 *
 * 将 models/contemporary/barNSFW/BarNSFWEngine 桥接到游戏引擎层，
 * 提供工厂函数和状态类型导出。
 */

export { BarNSFWEngine } from '../../../models/contemporary/barNSFW/engine';
export type {
  酒吧NSFW状态,
  酒吧NSFW设置,
  酒吧场景模板,
  酒吧NSFW叙事约束参数,
  酒吧NSFW内容强度,
  酒吧操作类型,
  默认酒吧场景,
} from '../../../models/contemporary/barNSFW/types';

import type { 酒吧NSFW设置 } from '../../../models/contemporary/barNSFW/types';
import { BarNSFWEngine } from '../../../models/contemporary/barNSFW/engine';

export function createBarNSFWEngine(settings: 酒吧NSFW设置): BarNSFWEngine {
  return new BarNSFWEngine(settings);
}
