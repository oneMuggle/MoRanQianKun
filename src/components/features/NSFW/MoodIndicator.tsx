/**
 * 情绪指示器
 * Emoji + 强度条展示主导情绪
 */

interface MoodIndicatorProps {
  emotion: string;
  intensity: number; // 0-100
  size?: 'sm' | 'md' | 'lg';
}

const 情绪Emoji: Record<string, string> = {
  '羞耻': '😳',
  '兴奋': '🔥',
  '后悔': '😔',
  '依恋': '🥰',
  '恐惧': '😨',
  '安心': '😌',
  '麻木': '😶',
  '空虚': '🫥',
  '好奇': '🤔',
  '疏离': '😐',
  '厌恶': '🤢',
  '亲近': '❤️',
};

function 情绪颜色(intensity: number): string {
  if (intensity >= 80) return 'text-red-400';
  if (intensity >= 50) return 'text-orange-400';
  if (intensity >= 30) return 'text-yellow-400';
  return 'text-gray-400';
}

const 尺寸映射 = { sm: 'text-xs', md: 'text-sm', lg: 'text-base' };

export function MoodIndicator({ emotion, intensity, size = 'md' }: MoodIndicatorProps) {
  const emoji = 情绪Emoji[emotion] ?? '❓';
  const color = 情绪颜色(intensity);
  const sizeClass = 尺寸映射[size];

  return (
    <div className={`flex items-center gap-2 ${sizeClass}`}>
      <span className="text-lg">{emoji}</span>
      <span className={color}>{emotion}</span>
      <div className="flex-1 bg-gray-700 rounded-full h-1.5 overflow-hidden max-w-[100px]">
        <div
          className={`h-full rounded-full ${intensity >= 50 ? 'bg-orange-500' : 'bg-gray-500'} transition-all duration-300`}
          style={{ width: `${intensity}%` }}
        />
      </div>
    </div>
  );
}
