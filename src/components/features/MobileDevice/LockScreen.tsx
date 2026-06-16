// 锁屏页面 — 显示时间、日期、通知预览

import React from 'react';

interface LockScreenProps {
  onUnlock: () => void;
  deviceMode?: 'normal' | 'li';
  themeColor?: string;
  notifications?: Array<{ title: string; body: string; timestamp: number }>;
}

const LockScreen: React.FC<LockScreenProps> = ({
  onUnlock,
  deviceMode,
  themeColor,
  notifications = [],
}) => {
  const isLiMode = deviceMode === 'li';
  const accentColor = isLiMode ? themeColor : '#60A5FA';

  const now = new Date();
  const dateStr = now.toLocaleDateString('zh-CN', {
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  });
  const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  return (
    <div
      className="flex flex-col h-full items-center justify-between py-12 select-none"
      style={{
        background: isLiMode
          ? `linear-gradient(135deg, ${themeColor}20 0%, #0a0a0a 100%)`
          : 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      }}
    >
      {/* 顶部：日期时间 */}
      <div className="text-center mt-8">
        <p className="text-sm opacity-50 mb-1">{dateStr}</p>
        <h1 className="text-5xl font-light tracking-tight" style={{ color: accentColor }}>
          {timeStr}
        </h1>
      </div>

      {/* 中部：通知预览 */}
      {notifications.length > 0 && (
        <div className="w-full px-4 max-h-[200px] overflow-y-auto">
          <div className="space-y-2">
            {notifications.slice(0, 3).map((n, i) => (
              <div
                key={i}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-3"
              >
                <p className="text-xs font-medium opacity-70">{n.title}</p>
                <p className="text-sm opacity-90">{n.body}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 底部：解锁提示 */}
      <div className="text-center">
        <button
          onClick={onUnlock}
          className="px-8 py-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-sm hover:bg-white/20 transition-all active:scale-95"
          style={{
            color: accentColor,
            borderColor: `${accentColor}40`,
          }}
        >
          解锁
        </button>
        <div className="mt-4 w-8 h-1 bg-white/20 rounded-full mx-auto" />
      </div>
    </div>
  );
};

export default LockScreen;
