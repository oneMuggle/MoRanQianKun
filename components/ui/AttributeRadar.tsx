/**
 * AttributeRadar — 6 维属性雷达图（SVG）
 *
 * 来源：docs/plans/2026-06-15_yishijie-ui-gameplay-borrow-plan.md U3
 * 借鉴 yishijie 的 AttributeRadar 视觉模式，但：
 * - 零外部依赖（纯 SVG + Tailwind 颜色）
 * - React 组件，零 props 必填
 * - 6 顶点默认顺序：力量(顶) → 敏捷 → 体质 → 根骨 → 悟性 → 福源（顺时针）
 */
import React, { useMemo } from 'react';

/** 6 维属性结构，与 character.ts 中的 气运属性类型 对应 */
export type 属性结构 = {
    力量: number;
    敏捷: number;
    体质: number;
    根骨: number;
    悟性: number;
    福源: number;
};

/** 雷达顶点顺序（顺时针，从顶部开始） */
export const 属性键列表: readonly (keyof 属性结构)[] = [
    '力量', '敏捷', '体质', '根骨', '悟性', '福源',
] as const;

export type AttributeRadarProps = {
    stats: 属性结构;
    /** 最大值（用于缩放），默认 10 */
    maxValue?: number;
    /** SVG 尺寸（px），默认 240 */
    size?: number;
    /** 额外 className，会应用到 svg 根元素 */
    className?: string;
    /** 是否在每个顶点显示数值，默认 true */
    showValues?: boolean;
    /** 数据多边形填充色（hex），默认 emerald */
    fillColor?: string;
    /** 网格线颜色（hex），默认 gray */
    gridColor?: string;
};

// 几何常量（基于 viewBox 240×240）
const VIEWBOX_SIZE = 240;
const CENTER = VIEWBOX_SIZE / 2;
const MAX_RADIUS = 80;          // 数据点最远距离
const LABEL_RADIUS = 96;        // 标签距离
const GRID_LEVELS = [0.33, 0.66, 1.0] as const; // 背景环比例

/**
 * 角度 → viewBox 坐标
 * 角度 0 = 顶部（正北），顺时针递增
 */
function angleToCoord(angleDeg: number, radius: number): { x: number; y: number } {
    const rad = ((angleDeg - 90) * Math.PI) / 180;
    return {
        x: CENTER + radius * Math.cos(rad),
        y: CENTER + radius * Math.sin(rad),
    };
}

/** 给定属性键索引，返回该顶点的角度（度数） */
function vertexAngle(index: number, total: number): number {
    return (360 / total) * index;
}

/** 把坐标数组拼接为 SVG polygon 的 points 字符串（整数省略小数） */
function pointsToString(points: { x: number; y: number }[]): string {
    const fmt = (n: number) => Number.isInteger(n) ? n.toString() : n.toFixed(2);
    return points.map(p => `${fmt(p.x)},${fmt(p.y)}`).join(' ');
}

export const AttributeRadar: React.FC<AttributeRadarProps> = ({
    stats,
    maxValue = 10,
    size = 240,
    className,
    showValues = true,
    fillColor = '#10b981',
    gridColor = '#4b5563',
}) => {
    const total = 属性键列表.length;

    const gridLayers = useMemo(() => {
        return GRID_LEVELS.map((ratio) => {
            const points = 属性键列表.map((_, i) =>
                angleToCoord(vertexAngle(i, total), MAX_RADIUS * ratio)
            );
            return pointsToString(points);
        });
    }, [total]);

    const dataPoints = useMemo(() => {
        return 属性键列表.map((key, i) => {
            const ratio = Math.max(0, Math.min(1, stats[key] / maxValue));
            return angleToCoord(vertexAngle(i, total), MAX_RADIUS * ratio);
        });
    }, [stats, maxValue, total]);

    const labelPoints = useMemo(() => {
        return 属性键列表.map((_, i) => angleToCoord(vertexAngle(i, total), LABEL_RADIUS));
    }, [total]);

    return (
        <svg
            data-testid="attribute-radar"
            width={size}
            height={size}
            viewBox={`0 0 ${VIEWBOX_SIZE} ${VIEWBOX_SIZE}`}
            className={className}
            role="img"
            aria-label="六维属性雷达图"
        >
            {/* 背景网格：3 层六边形 */}
            {gridLayers.map((points, i) => (
                <polygon
                    key={`grid-${i}`}
                    points={points}
                    fill="none"
                    stroke={gridColor}
                    strokeOpacity={0.35 - i * 0.08}
                    strokeWidth={1}
                />
            ))}

            {/* 6 条轴线（中心到各顶点） */}
            {属性键列表.map((_, i) => {
                const tip = angleToCoord(vertexAngle(i, total), MAX_RADIUS);
                return (
                    <line
                        key={`axis-${i}`}
                        x1={CENTER}
                        y1={CENTER}
                        x2={tip.x}
                        y2={tip.y}
                        stroke={gridColor}
                        strokeOpacity={0.2}
                        strokeWidth={1}
                    />
                );
            })}

            {/* 数据多边形（带填充） */}
            <polygon
                data-testid="radar-data"
                points={pointsToString(dataPoints)}
                fill={fillColor}
                fillOpacity={0.25}
                stroke={fillColor}
                strokeWidth={2}
            />

            {/* 6 个顶点圆点 */}
            {dataPoints.map((p, i) => (
                <circle
                    key={`vertex-${i}`}
                    cx={p.x}
                    cy={p.y}
                    r={3.5}
                    fill={fillColor}
                    stroke="#fff"
                    strokeWidth={1.5}
                />
            ))}

            {/* 6 个属性标签 + 可选数值 */}
            {labelPoints.map((p, i) => {
                const key = 属性键列表[i];
                const value = stats[key];
                return (
                    <g key={`label-${i}`}>
                        <text
                            x={p.x}
                            y={p.y}
                            textAnchor="middle"
                            dominantBaseline="central"
                            className="fill-gray-200"
                            fontSize={11}
                            fontFamily="serif"
                            style={{ fontWeight: 600 }}
                        >
                            {key}
                        </text>
                        {showValues && (
                            <text
                                x={p.x}
                                y={p.y + 12}
                                textAnchor="middle"
                                dominantBaseline="central"
                                className="fill-emerald-300"
                                fontSize={10}
                                fontFamily="monospace"
                            >
                                {value}
                            </text>
                        )}
                    </g>
                );
            })}
        </svg>
    );
};

export default AttributeRadar;
