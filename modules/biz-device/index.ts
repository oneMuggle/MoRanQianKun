/**
 * 移动设备模块入口
 *
 * 包含：手机消息、APP、通知系统。
 */

import type { ModuleManifest } from '../../core/types/module';

export const manifest: ModuleManifest = {
  id: 'biz-device',
  name: '移动设备',
  version: '1.0.0',
  category: 'business',
  description: '移动设备系统：手机消息、APP、通知推送',
  dependencies: [],
  promptBlock: () => {
    return '<移动设备系统>\n移动设备系统已激活。支持手机消息、APP 交互和通知推送。\n</移动设备系统>';
  },
};

export type { DeviceForm, MobileApp, DeviceMode, NotificationType } from '../../models/mobileDevice';
