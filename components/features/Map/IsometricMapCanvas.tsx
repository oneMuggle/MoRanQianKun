/**
 * IsometricMapCanvas — 2.5D Canvas 等距投影地图组件
 *
 * 来源：docs/plans/2026-06-15_yishijie-ui-gameplay-borrow-plan.md U11
 * 目标：用 Canvas 2D 实现 2.5D 倾斜地图（替代 Three.js，零外部依赖）
 *
 * 设计：
 * - N×M tile 网格，每个 tile 有 (x, y, height, color)
 * - 等距投影：每个 tile 渲染为菱形（diamond），高度差表现为垂直偏移
 * - 渲染顺序：back-to-front（按 x+y 从小到大）
 * - 当前位置用金色环标记
 * - 点击 canvas 反向投影回 tile 坐标，触发 onTileClick 回调
 */
import React, { useEffect, useRef } from 'react';

export type MapTile = {
    x: number;
    y: number;
    height: number;
    color: string;
};

export type MapPosition = {
    x: number;
    y: number;
};

export type IsometricMapCanvasProps = {
    tiles: MapTile[];
    cols: number;
    rows: number;
    /** 当前位置（高亮 + 标记） */
    currentPosition?: MapPosition;
    /** 点击 tile 回调 */
    onTileClick?: (pos: MapPosition) => void;
    /** canvas width（px） */
    width?: number;
    /** canvas height（px） */
    height?: number;
    /** 单个 tile 菱形宽度（px） */
    tileWidth?: number;
    /** 单个 tile 菱形高度（px） */
    tileHeight?: number;
    /** 每层高度的像素偏移（px） */
    heightUnit?: number;
    /** 自定义 className */
    className?: string;
};

const DEFAULTS = {
    width: 480,
    height: 320,
    tileWidth: 48,
    tileHeight: 24,
    heightUnit: 12,
};

function tileToScreen(
    x: number,
    y: number,
    height: number,
    tileWidth: number,
    tileHeight: number,
    heightUnit: number,
): { sx: number; sy: number } {
    return {
        sx: (x - y) * (tileWidth / 2),
        sy: (x + y) * (tileHeight / 2) - height * heightUnit,
    };
}

function screenToTile(
    sx: number,
    sy: number,
    tileWidth: number,
    tileHeight: number,
): { x: number; y: number } {
    return {
        x: (sx / (tileWidth / 2) + sy / (tileHeight / 2)) / 2,
        y: (sy / (tileHeight / 2) - sx / (tileWidth / 2)) / 2,
    };
}

export const IsometricMapCanvas: React.FC<IsometricMapCanvasProps> = ({
    tiles,
    cols,
    rows,
    currentPosition,
    onTileClick,
    width = DEFAULTS.width,
    height = DEFAULTS.height,
    tileWidth = DEFAULTS.tileWidth,
    tileHeight = DEFAULTS.tileHeight,
    heightUnit = DEFAULTS.heightUnit,
    className = '',
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = '#0a0a0a';
        ctx.fillRect(0, 0, width, height);

        const centerX = width / 2;
        const centerY = height / 2 - (rows * tileHeight) / 4;

        const sorted = [...tiles].sort((a, b) => (a.x + a.y) - (b.x + b.y));

        for (const tile of sorted) {
            const { sx, sy } = tileToScreen(tile.x, tile.y, tile.height, tileWidth, tileHeight, heightUnit);
            const cx = centerX + sx;
            const cy = centerY + sy;

            ctx.beginPath();
            ctx.moveTo(cx, cy - tileHeight / 2);
            ctx.lineTo(cx + tileWidth / 2, cy);
            ctx.lineTo(cx, cy + tileHeight / 2);
            ctx.lineTo(cx - tileWidth / 2, cy);
            ctx.closePath();
            ctx.fillStyle = tile.color;
            ctx.fill();
            ctx.strokeStyle = 'rgba(0,0,0,0.4)';
            ctx.stroke();

            if (tile.height > 0) {
                const baseY = cy + tileHeight / 2;
                const hPx = tile.height * heightUnit;
                ctx.beginPath();
                ctx.moveTo(cx - tileWidth / 2, cy);
                ctx.lineTo(cx, cy + tileHeight / 2);
                ctx.lineTo(cx, baseY + hPx);
                ctx.lineTo(cx - tileWidth / 2, cy + hPx);
                ctx.closePath();
                ctx.fillStyle = shadeColor(tile.color, -0.3);
                ctx.fill();
                ctx.strokeStyle = 'rgba(0,0,0,0.5)';
                ctx.stroke();

                ctx.beginPath();
                ctx.moveTo(cx + tileWidth / 2, cy);
                ctx.lineTo(cx, cy + tileHeight / 2);
                ctx.lineTo(cx, baseY + hPx);
                ctx.lineTo(cx + tileWidth / 2, cy + hPx);
                ctx.closePath();
                ctx.fillStyle = shadeColor(tile.color, -0.5);
                ctx.fill();
                ctx.stroke();
            }
        }

        if (currentPosition) {
            const { sx, sy } = tileToScreen(
                currentPosition.x,
                currentPosition.y,
                tiles.find(t => t.x === currentPosition.x && t.y === currentPosition.y)?.height || 0,
                tileWidth,
                tileHeight,
                heightUnit,
            );
            const cx = centerX + sx;
            const cy = centerY + sy;

            ctx.beginPath();
            ctx.arc(cx, cy, tileWidth / 3, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(212,175,55,0.25)';
            ctx.fill();

            ctx.beginPath();
            ctx.arc(cx, cy, tileWidth / 6, 0, Math.PI * 2);
            ctx.fillStyle = '#d4af37';
            ctx.fill();
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 1.5;
            ctx.stroke();
        }
    }, [tiles, cols, rows, currentPosition, width, height, tileWidth, tileHeight, heightUnit]);

    const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!onTileClick) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        const sx = e.clientX - rect.left - width / 2;
        const sy = e.clientY - rect.top - height / 2 + (rows * tileHeight) / 4;
        const { x, y } = screenToTile(sx, sy, tileWidth, tileHeight);
        const tx = Math.round(x);
        const ty = Math.round(y);
        if (tx >= 0 && tx < cols && ty >= 0 && ty < rows) {
            onTileClick({ x: tx, y: ty });
        }
    };

    return (
        <canvas
            ref={canvasRef}
            data-testid="isometric-map-canvas"
            data-current-x={currentPosition?.x}
            data-current-y={currentPosition?.y}
            width={width}
            height={height}
            onClick={handleClick}
            className={`block ${className}`}
            style={{ imageRendering: 'pixelated' }}
            aria-label="等距投影地图"
        />
    );
};

function shadeColor(hex: string, factor: number): string {
    const c = hex.replace('#', '');
    const r = parseInt(c.substring(0, 2), 16);
    const g = parseInt(c.substring(2, 4), 16);
    const b = parseInt(c.substring(4, 6), 16);
    const adjust = (v: number) => {
        const nv = Math.round(v + (factor > 0 ? (255 - v) * factor : v * factor));
        return Math.max(0, Math.min(255, nv));
    };
    return `rgb(${adjust(r)}, ${adjust(g)}, ${adjust(b)})`;
}

export default IsometricMapCanvas;
