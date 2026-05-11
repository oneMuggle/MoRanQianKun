// 桌游社交 NSFW 设置组件（占位，后续完善）

import React from 'react';

interface Props {
  settings?: Record<string, unknown>;
  onChange?: (settings: Record<string, unknown>) => void;
}

export const BoardGameNSFWSettings: React.FC<Props> = () => (
  <div className="p-6 text-gray-400 text-sm">
    <p>桌游社交 NSFW 设置面板 — 开发中</p>
  </div>
);

export default BoardGameNSFWSettings;
