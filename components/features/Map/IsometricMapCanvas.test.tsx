/**
 * IsometricMapCanvas — 2.5D Canvas 等距投影地图组件测试
 *
 * TDD 来源：docs/plans/2026-06-15_yishijie-ui-gameplay-borrow-plan.md U11
 * 目标：用 Canvas 2D 实现 2.5D 倾斜地图（替代 Three.js，零外部依赖）
 * 设计：N×M tile 网格 + 等距投影 + 当前位置高亮
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { IsometricMapCanvas, type MapTile } from './IsometricMapCanvas';

const tiles: MapTile[] = [
    { x: 0, y: 0, height: 0, color: '#444' },
    { x: 1, y: 0, height: 1, color: '#666' },
    { x: 0, y: 1, height: 1, color: '#666' },
    { x: 1, y: 1, height: 2, color: '#888' },
];

const baseProps = {
    tiles,
    cols: 2,
    rows: 2,
    currentPosition: { x: 1, y: 1 },
    onTileClick: vi.fn(),
};

describe('IsometricMapCanvas — 基础渲染', () => {
    it('渲染 canvas 元素', () => {
        const { container } = render(<IsometricMapCanvas {...baseProps} />);
        const canvas = container.querySelector('canvas');
        expect(canvas).toBeInTheDocument();
    });

    it('canvas 有正确的 width/height 属性', () => {
        const { container } = render(
            <IsometricMapCanvas {...baseProps} width={400} height={300} />
        );
        const canvas = container.querySelector('canvas')!;
        expect(canvas).toHaveAttribute('width', '400');
        expect(canvas).toHaveAttribute('height', '300');
    });
});

describe('IsometricMapCanvas — 可点击交互', () => {
    it('点击 canvas 有效 tile 区域触发 onTileClick 回调', () => {
        const onTileClick = vi.fn();
        const { container } = render(
            <IsometricMapCanvas
                {...baseProps}
                width={400}
                height={300}
                tileWidth={80}
                tileHeight={40}
                onTileClick={onTileClick}
            />
        );
        const canvas = container.querySelector('canvas')!;
        // 点击 canvas 中心（接近 (1,1) 位置）
        fireEvent.click(canvas, { clientX: 200, clientY: 150 });
        expect(onTileClick).toHaveBeenCalled();
    });

    it('点击 canvas 越界区域不触发回调', () => {
        const onTileClick = vi.fn();
        const { container } = render(
            <IsometricMapCanvas
                {...baseProps}
                onTileClick={onTileClick}
            />
        );
        const canvas = container.querySelector('canvas')!;
        // 点击 canvas 左上角（必然越界）
        fireEvent.click(canvas, { clientX: 0, clientY: 0 });
        expect(onTileClick).not.toHaveBeenCalled();
    });
});

describe('IsometricMapCanvas — 当前位置', () => {
    it('显示当前位置指示器（data-current-x/y）', () => {
        const { container } = render(
            <IsometricMapCanvas {...baseProps} currentPosition={{ x: 1, y: 1 }} />
        );
        const canvas = container.querySelector('canvas')!;
        expect(canvas.getAttribute('data-current-x')).toBe('1');
        expect(canvas.getAttribute('data-current-y')).toBe('1');
    });

    it('不传 currentPosition 时无当前位置属性', () => {
        const { container } = render(
            <IsometricMapCanvas {...baseProps} currentPosition={undefined} />
        );
        const canvas = container.querySelector('canvas')!;
        expect(canvas.getAttribute('data-current-x')).toBeNull();
    });
});

describe('IsometricMapCanvas — 边界处理', () => {
    it('空 tiles 数组不崩溃', () => {
        const { container } = render(
            <IsometricMapCanvas tiles={[]} cols={0} rows={0} />
        );
        const canvas = container.querySelector('canvas');
        expect(canvas).toBeInTheDocument();
    });

    it('支持自定义 className', () => {
        const { container } = render(
            <IsometricMapCanvas {...baseProps} className="my-canvas" />
        );
        const canvas = container.querySelector('canvas.my-canvas');
        expect(canvas).toBeInTheDocument();
    });
});
