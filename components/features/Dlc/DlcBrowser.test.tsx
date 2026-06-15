/**
 * DlcBrowser — DLC 浏览器组件测试
 *
 * TDD 来源：docs/plans/2026-06-15_yishijie-ui-gameplay-borrow-plan.md U18
 * 目标：DLC 列表展示 + 类型筛选 + 详情侧栏
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DlcBrowser, type DlcEntry } from './DlcBrowser';

const dlcs: DlcEntry[] = [
    { id: 'd1', 名称: '金庸江湖', 描述: '射雕三部曲综合', 类型: 'era-pack', 标签: ['金庸', '经典'], 作者: '官方' },
    { id: 'd2', 名称: '修仙世界', 描述: '高武世界', 类型: 'era-pack', 标签: ['修仙'], 作者: '社区' },
    { id: 'd3', 名称: '神族血统', 描述: '魔法种族', 类型: 'race-pack', 标签: ['魔法'], 作者: '官方' },
    { id: 'd4', 名称: '荒岛求生', 描述: '生存地图', 类型: 'map-pack', 标签: ['生存'], 作者: '社区' },
];

describe('DlcBrowser — 基础渲染', () => {
    it('渲染所有 DLC 卡片', () => {
        render(<DlcBrowser dlcs={dlcs} />);
        expect(screen.getByTestId('dlc-card-d1')).toBeInTheDocument();
        expect(screen.getByTestId('dlc-card-d2')).toBeInTheDocument();
        expect(screen.getByTestId('dlc-card-d3')).toBeInTheDocument();
        expect(screen.getByTestId('dlc-card-d4')).toBeInTheDocument();
    });

    it('显示 DLC 名称', () => {
        render(<DlcBrowser dlcs={dlcs} />);
        expect(screen.getByText('金庸江湖')).toBeInTheDocument();
        expect(screen.getByText('神族血统')).toBeInTheDocument();
    });
});

describe('DlcBrowser — 类型筛选', () => {
    it('点击类型筛选按钮筛选列表', () => {
        render(<DlcBrowser dlcs={dlcs} />);
        fireEvent.click(screen.getByTestId('filter-era-pack'));
        expect(screen.getByTestId('dlc-card-d1')).toBeInTheDocument();
        expect(screen.getByTestId('dlc-card-d2')).toBeInTheDocument();
        expect(screen.queryByTestId('dlc-card-d3')).not.toBeInTheDocument();
    });

    it('点击「全部」清除筛选', () => {
        render(<DlcBrowser dlcs={dlcs} />);
        fireEvent.click(screen.getByTestId('filter-era-pack'));
        fireEvent.click(screen.getByTestId('filter-all'));
        expect(screen.getByTestId('dlc-card-d3')).toBeInTheDocument();
    });
});

describe('DlcBrowser — 详情侧栏', () => {
    it('点击 DLC 卡片显示详情', () => {
        render(<DlcBrowser dlcs={dlcs} />);
        fireEvent.click(screen.getByTestId('dlc-card-d1'));
        expect(screen.getByTestId('dlc-detail-d1')).toBeInTheDocument();
        expect(screen.getByText('射雕三部曲综合')).toBeInTheDocument();
    });

    it('详情面板显示标签', () => {
        render(<DlcBrowser dlcs={dlcs} />);
        fireEvent.click(screen.getByTestId('dlc-card-d1'));
        const detail = screen.getByTestId('dlc-detail-d1');
        expect(detail.textContent).toContain('金庸');
    });

    it('点击关闭按钮关闭详情', () => {
        render(<DlcBrowser dlcs={dlcs} />);
        fireEvent.click(screen.getByTestId('dlc-card-d1'));
        expect(screen.getByTestId('dlc-detail-d1')).toBeInTheDocument();
        fireEvent.click(screen.getByTestId('dlc-detail-close'));
        expect(screen.queryByTestId('dlc-detail-d1')).not.toBeInTheDocument();
    });
});

describe('DlcBrowser — 边界处理', () => {
    it('空数组显示空态', () => {
        render(<DlcBrowser dlcs={[]} />);
        expect(screen.getByTestId('dlc-browser-empty')).toBeInTheDocument();
    });

    it('initialSelectedId 显示对应详情', () => {
        render(<DlcBrowser dlcs={dlcs} initialSelectedId="d3" />);
        expect(screen.getByTestId('dlc-detail-d3')).toBeInTheDocument();
    });
});
