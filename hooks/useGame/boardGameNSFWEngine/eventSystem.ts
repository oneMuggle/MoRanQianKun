/**
 * 桌游社交 NSFW 引擎 — 事件系统
 */

import type { 桌游类型 } from '../../../models/boardGameNSFW';

export interface 桌游NSFW事件 {
  id: string;
  桌游类型: 桌游类型;
  事件描述: string;
  紧张度: number;
  参与者: string[];
  时间: string;
}

export function 生成桌游NSFW事件(参数: {
  桌游类型: 桌游类型;
  紧张度: number;
  参与者: string[];
  时间: string;
}): 桌游NSFW事件 {
  const { 桌游类型, 紧张度, 参与者, 时间 } = 参数;
  const 事件描述 = `在${桌游类型}中，紧张氛围达到${紧张度}%`;
  return {
    id: `bg_event_${Date.now()}`,
    桌游类型,
    事件描述,
    紧张度,
    参与者,
    时间,
  };
}
