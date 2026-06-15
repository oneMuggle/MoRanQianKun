/**
 * PageTransition — 页面切换过渡包装组件测试
 *
 * TDD 来源：docs/plans/2026-06-15_yishijie-ui-gameplay-borrow-plan.md U16
 * 目标：统一项目中散落的 fadeIn/slide-in 动画为统一包装
 * 设计：mount 时自动应用入场动画，支持 fade/slide 两种变体
 */
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PageTransition } from './PageTransition';

describe('PageTransition — 基础渲染', () => {
    it('渲染 children', () => {
        render(<PageTransition>页面内容</PageTransition>);
        expect(screen.getByText('页面内容')).toBeInTheDocument();
    });

    it('默认应用 fade 入场动画', () => {
        const { container } = render(<PageTransition>content</PageTransition>);
        const wrapper = container.firstChild as HTMLElement;
        expect(wrapper.className).toMatch(/animate-fadeIn/);
    });

    it('带 testId 渲染', () => {
        render(<PageTransition testId="page-1">x</PageTransition>);
        expect(screen.getByTestId('page-1')).toBeInTheDocument();
    });
});

describe('PageTransition — 变体', () => {
    it('variant="fade" 使用 fade 动画', () => {
        const { container } = render(
            <PageTransition variant="fade">x</PageTransition>
        );
        const wrapper = container.firstChild as HTMLElement;
        expect(wrapper.className).toMatch(/animate-fadeIn/);
    });

    it('variant="slide" 使用 slide 动画', () => {
        const { container } = render(
            <PageTransition variant="slide">x</PageTransition>
        );
        const wrapper = container.firstChild as HTMLElement;
        expect(wrapper.className).toMatch(/animate-slide-in/);
    });

    it('variant="none" 不应用动画', () => {
        const { container } = render(
            <PageTransition variant="none">x</PageTransition>
        );
        const wrapper = container.firstChild as HTMLElement;
        expect(wrapper.className).not.toMatch(/animate-/);
    });
});

describe('PageTransition — 可定制性', () => {
    it('支持自定义 className', () => {
        const { container } = render(
            <PageTransition className="my-page">x</PageTransition>
        );
        const wrapper = container.firstChild as HTMLElement;
        expect(wrapper.className).toContain('my-page');
    });

    it('支持 duration prop（毫秒）', () => {
        const { container } = render(
            <PageTransition duration={500}>x</PageTransition>
        );
        const wrapper = container.firstChild as HTMLElement;
        expect(wrapper.style.animationDuration).toBe('500ms');
    });
});
