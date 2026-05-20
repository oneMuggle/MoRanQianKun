/**
 * 经络图 SVG 人体轮廓组件
 * 提供正面/背面两种视图的身体轮廓路径
 */

import { memo } from 'react';

export interface MeridianBodySVGProps {
  视图: '正面' | '背面';
  className?: string;
  /** 点击身体区域时触发 */
  onRegionClick?: (区域: string) => void;
  /** 高亮的区域列表 */
  highlightedRegions?: string[];
  /** 敏感点标注的子元素容器 */
  children?: React.ReactNode;
}

export const MeridianBodySVG = memo(({
  视图,
  className = '',
  onRegionClick,
  highlightedRegions = [],
  children,
}: MeridianBodySVGProps) => {
  const viewBox = '0 0 100 100';
  const isFront = 视图 === '正面';

  // 武侠风描边颜色
  const strokeColor = '#d4a017';
  const fillColor = '#1e1e3a';
  const regionStroke = '#4a4a6a';

  // 区域热区路径
  const regionPaths = isFront ? [
    { id: '头颈区', d: 'M 42 5 Q 50 0 58 5 L 56 18 Q 50 20 44 18 Z' },
    { id: '胸胸区', d: 'M 38 20 Q 50 18 62 20 L 64 38 Q 50 42 36 38 Z' },
    { id: '腰腹区', d: 'M 36 38 Q 50 42 64 38 L 62 56 Q 50 58 38 56 Z' },
    { id: '四肢区', d: 'M 34 56 L 66 56 L 64 80 L 54 92 L 46 92 L 36 80 Z' },
    { id: '私密区', d: 'M 44 52 L 56 52 L 54 58 L 46 58 Z' },
    { id: '特殊区', d: 'M 40 0 Q 50 -2 60 0 L 58 6 Q 50 8 42 6 Z' },
  ] : [
    { id: '头颈区', d: 'M 42 5 Q 50 0 58 5 L 56 18 Q 50 20 44 18 Z' },
    { id: '背部区', d: 'M 36 18 L 64 18 L 66 44 Q 50 48 34 44 Z' },
    { id: '四肢区', d: 'M 34 56 L 66 56 L 64 80 L 54 92 L 46 92 L 36 80 Z' },
    { id: '私密区', d: 'M 44 52 L 56 52 L 54 58 L 46 58 Z' },
    { id: '特殊区', d: 'M 40 0 Q 50 -2 60 0 L 58 6 Q 50 8 42 6 Z' },
  ];

  // 人体外轮廓
  const bodyOutline = isFront
    ? 'M 50 0 C 42 0, 40 6, 42 12 C 40 14, 38 16, 36 18 ' +
      'C 30 18, 24 22, 22 28 C 20 34, 22 40, 28 44 ' +
      'C 32 48, 34 56, 36 64 C 38 72, 40 80, 42 88 ' +
      'C 44 94, 46 98, 48 98 C 49 98, 50 96, 50 96 ' +
      'C 50 96, 51 98, 52 98 C 54 98, 56 94, 58 88 ' +
      'C 60 80, 62 72, 64 64 C 66 56, 68 48, 72 44 ' +
      'C 78 40, 80 34, 78 28 C 76 22, 70 18, 64 18 ' +
      'C 62 16, 60 14, 58 12 C 60 6, 58 0, 50 0 Z'
    : 'M 50 0 C 42 0, 40 6, 42 12 C 40 14, 38 16, 36 18 ' +
      'C 30 18, 24 22, 22 28 C 20 34, 22 40, 28 44 ' +
      'C 32 48, 34 56, 36 64 C 38 72, 40 80, 42 88 ' +
      'C 44 94, 46 98, 48 98 C 49 98, 50 96, 50 96 ' +
      'C 50 96, 51 98, 52 98 C 54 98, 56 94, 58 88 ' +
      'C 60 80, 62 72, 64 64 C 66 56, 68 48, 72 44 ' +
      'C 78 40, 80 34, 78 28 C 76 22, 70 18, 64 18 ' +
      'C 62 16, 60 14, 58 12 C 60 6, 58 0, 50 0 Z';

  // 脊柱线（仅背面）
  const spineLine = !isFront ? 'M 50 16 L 50 56' : '';

  return (
    <svg
      viewBox={viewBox}
      className={`w-full h-full ${className}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* 背景层 */}
      <rect x="0" y="0" width="100" height="100" fill="#12122a" rx="4" />

      {/* 区域热区 */}
      {regionPaths.map(region => {
        const isHighlighted = highlightedRegions.includes(region.id);
        return (
          <path
            key={region.id}
            d={region.d}
            fill={isHighlighted ? '#d4a01722' : 'transparent'}
            stroke={isHighlighted ? '#d4a017' : regionStroke}
            strokeWidth={isHighlighted ? 1.0 : 0.5}
            className={onRegionClick ? 'cursor-pointer' : ''}
            onClick={() => onRegionClick?.(region.id)}
          />
        );
      })}

      {/* 人体外轮廓 */}
      <path
        d={bodyOutline}
        fill={fillColor}
        stroke={strokeColor}
        strokeWidth={1.0}
        strokeLinejoin="round"
        filter="drop-shadow(0 0 2px #d4a01744)"
      />

      {/* 脊柱线（背面） */}
      {spineLine && (
        <path
          d={spineLine}
          fill="none"
          stroke="#666688"
          strokeWidth={0.3}
          strokeDasharray="1 1"
        />
      )}

      {/* 手臂中线（正面） */}
      {isFront && (
        <>
          <line x1={28} y1={28} x2={22} y2={42} stroke={regionStroke} strokeWidth={0.3} />
          <line x1={72} y1={28} x2={78} y2={42} stroke={regionStroke} strokeWidth={0.3} />
        </>
      )}

      {children}
    </svg>
  );
});

MeridianBodySVG.displayName = 'MeridianBodySVG';

export default MeridianBodySVG;
