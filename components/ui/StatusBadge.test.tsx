/**
 * StatusBadge — 通用状态徽章组件测试
 *
 * TDD 来源：docs/plans/2026-06-15_yishijie-ui-gameplay-borrow-plan.md U5
 * 目标：统一项目中散落的徽章样式（NSFW/性别/稀有度/状态等）
 *       支持 7 种 tone × 3 种 size × 可选 icon + value
 */
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatusBadge, type StatusBadgeTone } from './StatusBadge';

describe('StatusBadge — 基础渲染', () => {
    it('渲染文本子元素', () => {
        render(<StatusBadge tone="info">测试徽章</StatusBadge>);
        expect(screen.getByText('测试徽章')).toBeInTheDocument();
    });

    it('带 test id 渲染', () => {
        render(<StatusBadge tone="warning" testId="badge-warn">警告</StatusBadge>);
        expect(screen.getByTestId('badge-warn')).toBeInTheDocument();
    });

    it('默认是 span 元素', () => {
        render(<StatusBadge tone="info">x</StatusBadge>);
        const badge = screen.getByText('x');
        expect(badge.tagName.toLowerCase()).toBe('span');
    });
});

describe('StatusBadge — tone 配色', () => {
    const tones: StatusBadgeTone[] = [
        'neutral', 'info', 'success', 'warning', 'danger', 'primary', 'rarity'
    ];

    it.each(tones)('tone=%s 不报错且渲染', (tone) => {
        render(<StatusBadge tone={tone}>x</StatusBadge>);
        expect(screen.getByText('x')).toBeInTheDocument();
    });

    it('tone=danger 包含 danger 颜色 class', () => {
        const { container } = render(<StatusBadge tone="danger">x</StatusBadge>);
        const badge = container.querySelector('[class*="red"]');
        expect(badge).toBeInTheDocument();
    });

    it('tone=success 包含 success 颜色 class', () => {
        const { container } = render(<StatusBadge tone="success">x</StatusBadge>);
        const badge = container.querySelector('[class*="emerald"]') || container.querySelector('[class*="green"]');
        expect(badge).toBeInTheDocument();
    });
});

describe('StatusBadge — size', () => {
    it('size=sm 使用更小字号', () => {
        const { container } = render(<StatusBadge tone="info" size="sm">x</StatusBadge>);
        const badge = container.querySelector('span');
        expect(badge?.className).toMatch(/text-\[9px\]|text-\[10px\]/);
    });

    it('size=lg 使用更大字号', () => {
        const { container } = render(<StatusBadge tone="info" size="lg">x</StatusBadge>);
        const badge = container.querySelector('span');
        expect(badge?.className).toMatch(/text-sm|text-base/);
    });
});

describe('StatusBadge — icon + value', () => {
    it('渲染 icon prop', () => {
        render(<StatusBadge tone="warning" icon="⚠️">警告</StatusBadge>);
        expect(screen.getByText('⚠️')).toBeInTheDocument();
        expect(screen.getByText('警告')).toBeInTheDocument();
    });

    it('渲染 value prop（数字徽章）', () => {
        render(<StatusBadge tone="info" value={42}>消息</StatusBadge>);
        expect(screen.getByText('42')).toBeInTheDocument();
        expect(screen.getByText('消息')).toBeInTheDocument();
    });

    it('icon + value + children 同时渲染', () => {
        render(<StatusBadge tone="success" icon="✓" value={3}>已完成</StatusBadge>);
        expect(screen.getByText('✓')).toBeInTheDocument();
        expect(screen.getByText('3')).toBeInTheDocument();
        expect(screen.getByText('已完成')).toBeInTheDocument();
    });

    it('value=0 不应渲染（避免零值徽章）', () => {
        render(<StatusBadge tone="info" value={0}>x</StatusBadge>);
        expect(screen.queryByText('0')).not.toBeInTheDocument();
    });
});

describe('StatusBadge — 可定制性', () => {
    it('支持自定义 className', () => {
        const { container } = render(<StatusBadge tone="info" className="my-custom">x</StatusBadge>);
        const badge = container.querySelector('span');
        expect(badge?.className).toContain('my-custom');
    });

    it('支持 title 属性', () => {
        render(<StatusBadge tone="warning" title="hover me">x</StatusBadge>);
        expect(screen.getByTitle('hover me')).toBeInTheDocument();
    });
});
