/**
 * AttributeRadar — 6 维属性雷达图（SVG）测试
 *
 * TDD 来源：docs/plans/2026-06-15_yishijie-ui-gameplay-borrow-plan.md U3
 * 目标：纯 SVG + Tailwind 颜色，零外部依赖，6 维属性多边形
 */
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AttributeRadar, type AttributeRadarProps, type 属性结构 } from './AttributeRadar';

const 平均属性: 属性结构 = {
    力量: 5,
    敏捷: 5,
    体质: 5,
    根骨: 5,
    悟性: 5,
    福源: 5,
};

const 极端属性: 属性结构 = {
    力量: 10,
    敏捷: 3,
    体质: 3,
    根骨: 3,
    悟性: 3,
    福源: 3,
};

const baseProps: AttributeRadarProps = {
    stats: 平均属性,
    maxValue: 10,
};

describe('AttributeRadar — 基础渲染', () => {
    it('渲染一个 SVG 元素', () => {
        const { container } = render(<AttributeRadar {...baseProps} />);
        const svg = container.querySelector('svg');
        expect(svg).toBeInTheDocument();
    });

    it('显示 6 个属性标签', () => {
        render(<AttributeRadar {...baseProps} />);
        expect(screen.getByText('力量')).toBeInTheDocument();
        expect(screen.getByText('敏捷')).toBeInTheDocument();
        expect(screen.getByText('体质')).toBeInTheDocument();
        expect(screen.getByText('根骨')).toBeInTheDocument();
        expect(screen.getByText('悟性')).toBeInTheDocument();
        expect(screen.getByText('福源')).toBeInTheDocument();
    });

    it('显示中心 6 边网格层（背景）', () => {
        const { container } = render(<AttributeRadar {...baseProps} />);
        // 至少 3 层同心六边形网格（25%/50%/75% 环）
        const polygons = container.querySelectorAll('svg polygon');
        expect(polygons.length).toBeGreaterThanOrEqual(3);
    });

    it('显示数据多边形（前景）', () => {
        const { container } = render(<AttributeRadar {...baseProps} />);
        // 数据多边形是带填充颜色的 polygon
        const filledPolygons = Array.from(container.querySelectorAll('svg polygon')).filter(
            p => p.getAttribute('fill') && p.getAttribute('fill') !== 'none'
        );
        expect(filledPolygons.length).toBeGreaterThanOrEqual(1);
    });
});

describe('AttributeRadar — 数值缩放', () => {
    it('平均属性时数据多边形有 6 个数据点', () => {
        const { container } = render(<AttributeRadar {...baseProps} stats={平均属性} />);
        const dataPolygon = container.querySelector('svg polygon[data-testid="radar-data"]');
        expect(dataPolygon).toBeInTheDocument();
        const points = dataPolygon?.getAttribute('points') || '';
        const pointList = points.split(' ').filter(Boolean);
        expect(pointList.length).toBe(6);
    });

    it('极端属性时数据多边形有非平凡坐标', () => {
        const { container } = render(<AttributeRadar {...baseProps} stats={极端属性} />);
        const dataPolygon = container.querySelector('svg polygon[data-testid="radar-data"]');
        const points = dataPolygon?.getAttribute('points') || '';
        expect(points).toMatch(/\d+\.\d+/);
    });

    it('所有属性=0 时数据多边形退化为点', () => {
        const 零属性: 属性结构 = { 力量: 0, 敏捷: 0, 体质: 0, 根骨: 0, 悟性: 0, 福源: 0 };
        const { container } = render(<AttributeRadar {...baseProps} stats={零属性} maxValue={10} />);
        const dataPolygon = container.querySelector('svg polygon[data-testid="radar-data"]');
        const points = dataPolygon?.getAttribute('points') || '';
        const pointList = points.split(' ').filter(Boolean);
        pointList.forEach(p => expect(p).toBe('120,120'));
    });
});

describe('AttributeRadar — 可定制性', () => {
    it('支持自定义 size（px）', () => {
        const { container } = render(<AttributeRadar {...baseProps} size={300} />);
        const svg = container.querySelector('svg');
        expect(svg?.getAttribute('width')).toBe('300');
        expect(svg?.getAttribute('height')).toBe('300');
    });

    it('支持自定义 className', () => {
        const { container } = render(<AttributeRadar {...baseProps} className="custom-radar" />);
        const svg = container.querySelector('svg');
        expect(svg?.classList.contains('custom-radar')).toBe(true);
    });

    it('默认显示数值标签', () => {
        render(<AttributeRadar {...baseProps} />);
        // showValues 默认 true，5 应该出现 6 次
        const fives = screen.getAllByText('5');
        expect(fives.length).toBeGreaterThanOrEqual(6);
    });
});
