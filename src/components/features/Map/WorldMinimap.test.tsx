/**
 * WorldMinimap — 世界地图缩略图组件测试
 *
 * TDD 来源：docs/plans/2026-06-15_yishijie-ui-gameplay-borrow-plan.md U7
 * 目标：所有地图的缩略卡片网格 + 当前高亮 + 点击跳转
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { WorldMinimap, type WorldMinimapProps, type MinimapEntry } from './WorldMinimap';

const maps: MinimapEntry[] = [
    { id: 'm1', 名称: '青云镇', 归属: { 大地点: '九州', 中地点: '中原', 小地点: '青云镇' }, 建筑数: 5 },
    { id: 'm2', 名称: '青峰山', 归属: { 大地点: '九州', 中地点: '中原', 小地点: '青峰山' }, 建筑数: 3 },
    { id: 'm3', 名称: '东海之滨', 归属: { 大地点: '九州', 中地点: '东海', 小地点: '东海之滨' }, 建筑数: 2 },
    { id: 'm4', 名称: '无主之地', 归属: { 大地点: '九州', 中地点: '西域', 小地点: '无主之地' }, 建筑数: 0 },
];

const baseProps: WorldMinimapProps = {
    maps,
    currentBig: '九州',
    currentMid: '中原',
    currentSmall: '青云镇',
    onSelectMap: vi.fn(),
};

describe('WorldMinimap — 基础渲染', () => {
    it('渲染所有地图卡片', () => {
        render(<WorldMinimap {...baseProps} />);
        expect(screen.getByTestId('minimap-card-m1')).toBeInTheDocument();
        expect(screen.getByTestId('minimap-card-m2')).toBeInTheDocument();
        expect(screen.getByTestId('minimap-card-m3')).toBeInTheDocument();
        expect(screen.getByTestId('minimap-card-m4')).toBeInTheDocument();
    });

    it('每张卡片显示名称和建筑数', () => {
        render(<WorldMinimap {...baseProps} />);
        expect(screen.getByText('青云镇')).toBeInTheDocument();
        expect(screen.getByText('青峰山')).toBeInTheDocument();
        expect(screen.getByText('5 建筑')).toBeInTheDocument();
        expect(screen.getByText('3 建筑')).toBeInTheDocument();
        expect(screen.getByText('无建筑')).toBeInTheDocument();
    });
});

describe('WorldMinimap — 当前高亮', () => {
    it('当前 small place 匹配的卡片高亮（含「当前位置」徽章）', () => {
        render(<WorldMinimap {...baseProps} currentSmall="青云镇" />);
        const card = screen.getByTestId('minimap-card-m1');
        // active 卡片特有 bg-wuxia-gold/10 class
        expect(card.className).toMatch(/border-wuxia-gold\b/);
        expect(card.className).toMatch(/bg-wuxia-gold\/10/);
        // 同时显示「当前位置」徽章
        const markers = screen.getAllByTestId('current-marker');
        expect(markers).toHaveLength(1);
    });

    it('当前 place 不匹配时无卡片显示「当前位置」', () => {
        render(<WorldMinimap {...baseProps} currentSmall="不存在的地点" />);
        expect(screen.queryByTestId('current-marker')).not.toBeInTheDocument();
    });
});

describe('WorldMinimap — 点击交互', () => {
    it('点击地图卡片触发 onSelectMap 回调', () => {
        const onSelectMap = vi.fn();
        render(<WorldMinimap {...baseProps} onSelectMap={onSelectMap} />);
        fireEvent.click(screen.getByTestId('minimap-card-m2'));
        expect(onSelectMap).toHaveBeenCalledWith('m2');
    });
});

describe('WorldMinimap — 边界处理', () => {
    it('空 maps 数组显示空态', () => {
        render(<WorldMinimap {...baseProps} maps={[]} />);
        expect(screen.getByTestId('world-minimap-empty')).toBeInTheDocument();
    });

    it('所有字段缺失的地图也能渲染', () => {
        const incompleteMaps: MinimapEntry[] = [
            { id: 'x', 名称: '', 归属: { 大地点: '', 中地点: '', 小地点: '' }, 建筑数: 0 }
        ];
        render(<WorldMinimap {...baseProps} maps={incompleteMaps} />);
        expect(screen.getByTestId('minimap-card-x')).toBeInTheDocument();
    });
});
