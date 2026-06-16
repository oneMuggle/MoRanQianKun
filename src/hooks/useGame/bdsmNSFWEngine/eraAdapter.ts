/**
 * BDSM 独立系统引擎 — 时代适配层
 */

import type { BDSM时代场景 } from '../../../models/bdsmNSFW';
import { 获取BDSM时代场景, 通用BDSM场景 } from '../../../models/bdsmNSFW';

export function 获取BDSM场景For时代(时代: string): BDSM时代场景[] {
  const 特定场景 = 获取BDSM时代场景(时代);
  if (特定场景.length > 0) return 特定场景;
  return 通用BDSM场景;
}

export function 获取BDSM场景修正值(时代: string, 场景类型: string): { 权力修正: number; 服从修正: number } {
  const 场景列表 = 获取BDSM场景For时代(时代);
  const 匹配场景 = 场景列表.find(s => s.场景类型 === 场景类型);
  if (匹配场景) {
    return { 权力修正: 匹配场景.权力天平修正, 服从修正: 匹配场景.服从度修正 };
  }
  return { 权力修正: 0, 服从修正: 0 };
}
