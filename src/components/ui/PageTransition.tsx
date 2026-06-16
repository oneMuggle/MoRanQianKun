/**
 * PageTransition — 页面切换过渡包装组件
 *
 * 来源：docs/plans/2026-06-15_yishijie-ui-gameplay-borrow-plan.md U16
 * 目标：统一项目中散落的 fadeIn/slide-in 动画为统一包装
 *
 * 设计：
 * - 简单 wrapper，children mount 时自动应用入场动画
 * - 3 种 variant：fade（默认）/ slide / none
 * - 可选 duration prop 自定义动画时长
 * - 与 tailwind.config.ts 中已有的 `fadeIn` / `slideIn` keyframes 兼容
 *
 * 注意：
 * - 不替代现有分散的 animate-fadeIn / animate-slide-in（渐进式迁移）
 * - 不引入 React Transition Group 等外部库（保持零依赖）
 * - 性能考虑：单纯 CSS animation，无 JS 动画循环
 */
import React from 'react';

export type PageTransitionVariant = 'fade' | 'slide' | 'none';

export type PageTransitionProps = {
    children: React.ReactNode;
    /** 动画变体，默认 fade */
    variant?: PageTransitionVariant;
    /** 动画时长（毫秒），默认 300 */
    duration?: number;
    /** 测试用 */
    testId?: string;
    /** 自定义 className */
    className?: string;
    /** 渲染的 HTML 标签，默认 div */
    as?: keyof React.JSX.IntrinsicElements;
};

const variantClass: Record<PageTransitionVariant, string> = {
    // 复用 tailwind.config.cjs 中已有的 fadeIn / slide-in keyframes
    fade: 'animate-fadeIn',
    slide: 'animate-slide-in',
    none: '',
};

export const PageTransition: React.FC<PageTransitionProps> = ({
    children,
    variant = 'fade',
    duration = 300,
    testId,
    className = '',
    as: Component = 'div',
}) => {
    const classes = [
        variantClass[variant],
        className,
    ].filter(Boolean).join(' ');

    return (
        <Component
            data-testid={testId}
            className={classes}
            style={duration !== undefined ? { animationDuration: `${duration}ms` } : undefined}
        >
            {children}
        </Component>
    );
};

export default PageTransition;
