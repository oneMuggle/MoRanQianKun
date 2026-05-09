// 手机顶部状态栏 — 信号、电量、时间

import React, { useEffect, useState } from 'react';

interface PhoneStatusBarProps {
  _eraId: string;
  deviceMode?: 'normal' | 'li';
  themeColor?: string;
  _onNotificationToggle?: () => void;
}

const PhoneStatusBar: React.FC<PhoneStatusBarProps> = ({
  _eraId,
  deviceMode,
  themeColor,
  _onNotificationToggle,
}) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 60_000);
    return () => clearInterval(timer);
  }, []);

  const timeStr = `${String(time.getHours()).padStart(2, '0')}:${String(time.getMinutes()).padStart(2, '0')}`;
  const isLiMode = deviceMode === 'li';
  const signalBars = 4;
  const batteryLevel = 85;

  return (
    <div
      className="flex items-center justify-between px-3 py-1.5 text-xs select-none"
      data-device-mode={deviceMode}
      style={{
        backgroundColor: isLiMode ? `${themeColor}15` : 'rgba(0,0,0,0.3)',
        color: isLiMode ? themeColor : '#e5e5e5',
      }}
    >
      {/* 左侧：时间 */}
      <span className="font-medium">{timeStr}</span>

      {/* 中间：设备名称 */}
      <span className="text-[10px] opacity-60 truncate max-w-[120px] text-center">
        墨色江湖
      </span>

      {/* 右侧：信号 + 电量 */}
      <div className="flex items-center gap-2">
        {/* 信号格 */}
        <div className="flex items-end gap-px h-3">
          {Array.from({ length: signalBars }).map((_, i) => (
            <div
              key={i}
              style={{
                height: `${(i + 1) * 3}px`,
                width: '2px',
                backgroundColor: i < 3 ? (isLiMode ? themeColor : '#e5e5e5') : 'rgba(255,255,255,0.2)',
                borderRadius: '1px',
              }}
            />
          ))}
        </div>

        {/* WiFi 图标 */}
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="opacity-70">
          <path d="M1 4.5C2.5 2.5 4.5 1.5 6 1.5C7.5 1.5 9.5 2.5 11 4.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          <path d="M3 6.5C3.8 5.5 4.8 5 6 5C7.2 5 8.2 5.5 9 6.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          <circle cx="6" cy="8.5" r="1" fill="currentColor" />
        </svg>

        {/* 电量 */}
        <div className="flex items-center gap-1">
          <span className="text-[10px] opacity-70">{batteryLevel}%</span>
          <div className="w-5 h-2.5 border border-current rounded-sm relative">
            <div
              style={{
                width: `${batteryLevel}%`,
                backgroundColor: batteryLevel > 20 ? (isLiMode ? themeColor : '#34C759') : '#FF3B30',
                borderRadius: '1px',
                height: '100%',
              }}
            />
          </div>
          <div className="w-px h-1.5 bg-current rounded-r" />
        </div>
      </div>
    </div>
  );
};

export default PhoneStatusBar;
