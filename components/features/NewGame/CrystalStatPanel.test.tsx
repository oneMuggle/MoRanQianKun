/**
 * CrystalStatPanel 组件测试
 *
 * TDD 来源：docs/plans/2026-06-15_yishijie-ui-gameplay-borrow-plan.md U2
 * 目标：用水晶拨点 UI 替代 NewGameWizard 中简单的 -/+ 按钮
 * 行为约束：
 * 1. 渲染 6 个属性水晶（力量/敏捷/体质/根骨/悟性/福源）
 * 2. -/+ 按钮可调整数值，受 min/max 限制
 * 3. 剩余点数为 0 时 + 按钮禁用
 * 4. 剩余点数为负时显示警告
 * 5. 显示当前难度 + 总预算 + 剩余
 * 6. 提供「自动均衡」和「重置默认」两个快捷操作
 * 7. 数值变化时通过 onChange 回调
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CrystalStatPanel, type 属性结构, type CrystalStatPanelProps } from './CrystalStatPanel';

const 默认属性: 属性结构 = {
    力量: 5,
    敏捷: 5,
    体质: 5,
    根骨: 5,
    悟性: 5,
    福源: 5,
};

const baseProps: CrystalStatPanelProps = {
    stats: 默认属性,
    minValue: 3,
    maxValue: 10,
    totalBudget: 30,
    onChange: vi.fn(),
    difficulty: 'normal',
};

describe('CrystalStatPanel — 基础渲染', () => {
    it('渲染 6 个属性水晶', () => {
        render(<CrystalStatPanel {...baseProps} />);
        expect(screen.getByTestId('crystal-力量')).toBeInTheDocument();
        expect(screen.getByTestId('crystal-敏捷')).toBeInTheDocument();
        expect(screen.getByTestId('crystal-体质')).toBeInTheDocument();
        expect(screen.getByTestId('crystal-根骨')).toBeInTheDocument();
        expect(screen.getByTestId('crystal-悟性')).toBeInTheDocument();
        expect(screen.getByTestId('crystal-福源')).toBeInTheDocument();
    });

    it('显示当前难度标签', () => {
        render(<CrystalStatPanel {...baseProps} difficulty="hard" />);
        expect(screen.getByText(/HARD/)).toBeInTheDocument();
    });

    it('显示总预算与剩余点', () => {
        render(<CrystalStatPanel {...baseProps} totalBudget={30} stats={{ ...默认属性 }} />);
        // 6 × 5 = 30 已用，剩余 0
        expect(screen.getByTestId('remaining-points')).toHaveTextContent('0');
    });

    it('剩余点为负时显示负值', () => {
        render(
            <CrystalStatPanel
                {...baseProps}
                stats={{ ...默认属性, 力量: 9 }}
                totalBudget={30}
            />
        );
        // 5+5+5+5+5+9 = 34 > 30，剩余 -4
        const badge = screen.getByTestId('remaining-points');
        expect(badge.textContent).toContain('-4');
    });
});

describe('CrystalStatPanel — +/- 交互', () => {
    it('+ 按钮触发 onChange 增加数值', () => {
        const onChange = vi.fn();
        render(
            <CrystalStatPanel
                {...baseProps}
                stats={{ ...默认属性, 力量: 5 }}
                totalBudget={36}  // 6×5=30, +6 空间可用
                onChange={onChange}
            />
        );
        const plusBtn = screen.getByTestId('crystal-力量').querySelector('[data-testid="crystal-plus"]') as HTMLElement;
        fireEvent.click(plusBtn);
        expect(onChange).toHaveBeenCalledWith('力量', 6);
    });

    it('- 按钮触发 onChange 减少数值', () => {
        const onChange = vi.fn();
        render(
            <CrystalStatPanel
                {...baseProps}
                stats={{ ...默认属性, 力量: 5 }}
                onChange={onChange}
            />
        );
        const minusBtn = screen.getByTestId('crystal-力量').querySelector('[data-testid="crystal-minus"]') as HTMLElement;
        fireEvent.click(minusBtn);
        expect(onChange).toHaveBeenCalledWith('力量', 4);
    });

    it('已达最大值时 + 按钮禁用', () => {
        const onChange = vi.fn();
        render(
            <CrystalStatPanel
                {...baseProps}
                stats={{ ...默认属性, 力量: 10 }}
                onChange={onChange}
            />
        );
        const plusBtn = screen.getByTestId('crystal-力量').querySelector('[data-testid="crystal-plus"]') as HTMLButtonElement;
        expect(plusBtn).toBeDisabled();
    });

    it('已达最小值时 - 按钮禁用', () => {
        const onChange = vi.fn();
        render(
            <CrystalStatPanel
                {...baseProps}
                stats={{ ...默认属性, 力量: 3 }}
                onChange={onChange}
            />
        );
        const minusBtn = screen.getByTestId('crystal-力量').querySelector('[data-testid="crystal-minus"]') as HTMLButtonElement;
        expect(minusBtn).toBeDisabled();
    });

    it('剩余点为 0 时所有 + 按钮禁用', () => {
        const onChange = vi.fn();
        render(
            <CrystalStatPanel
                {...baseProps}
                stats={{ ...默认属性 }}  // 6×5=30, total=30
                totalBudget={30}
                onChange={onChange}
            />
        );
        const plusBtns = screen.getAllByTestId('crystal-plus');
        plusBtns.forEach(btn => expect(btn).toBeDisabled());
    });
});

describe('CrystalStatPanel — 快捷操作', () => {
    it('「自动均衡」按钮：剩余点平摊到 6 个属性', () => {
        const onBatchChange = vi.fn();
        render(
            <CrystalStatPanel
                {...baseProps}
                stats={{ ...默认属性, 力量: 5, 敏捷: 5, 体质: 5, 根骨: 5, 悟性: 5, 福源: 5 }}
                totalBudget={36}
                onBatchChange={onBatchChange}
            />
        );
        fireEvent.click(screen.getByTestId('crystal-auto-balance'));
        expect(onBatchChange).toHaveBeenCalledTimes(1);
        // 期望平摊：36 / 6 = 6, 0 余数
        const next = onBatchChange.mock.calls[0][0];
        const total = Object.values(next as Record<string, number>).reduce((a, b) => a + b, 0);
        expect(total).toBe(36);
        Object.values(next as Record<string, number>).forEach(v => expect(v).toBe(6));
    });

    it('「重置」按钮：触发 onBatchChange 重置分配', () => {
        const onBatchChange = vi.fn();
        render(
            <CrystalStatPanel
                {...baseProps}
                stats={{ 力量: 8, 敏捷: 8, 体质: 8, 根骨: 8, 悟性: 8, 福源: 8 }}
                onBatchChange={onBatchChange}
            />
        );
        fireEvent.click(screen.getByTestId('crystal-reset'));
        expect(onBatchChange).toHaveBeenCalledTimes(1);
        // 期望所有属性 = minValue (3)
        const next = onBatchChange.mock.calls[0][0];
        Object.values(next as Record<string, number>).forEach(v => expect(v).toBe(3));
    });
});
