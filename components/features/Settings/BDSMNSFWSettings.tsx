// BDSM 独立 NSFW 设置组件（占位，后续完善）

import React from 'react';

interface Props {
  settings?: Record<string, unknown>;
  onChange?: (settings: Record<string, unknown>) => void;
}

export const BDSMNSFWSettings: React.FC<Props> = () => (
  <div className="p-6 text-gray-400 text-sm">
    <p>BDSM 独立系统设置面板 — 开发中</p>
  </div>
);

export default BDSMNSFWSettings;
