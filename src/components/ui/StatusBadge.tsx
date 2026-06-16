/**
 * StatusBadge — 通用状态徽章组件
 *
 * 来源：docs/plans/2026-06-15_yishijie-ui-gameplay-borrow-plan.md U5
 * 目标：统一项目中散落的徽章样式（NSFW/性别/稀有度/状态/资源条等）
 *
 * 设计：
 * - 7 种 tone：neutral / info / success / warning / danger / primary / rarity
 * - 3 种 size：sm (9-10px) / md (10-11px) / lg (sm-base)
 * - 可选 icon（emoji/字符）+ 可选 value（数字徽章，0 不渲染）
 * - 与 components/ui/rarityStyles.ts 风格兼容（tone=rarity 走金/紫/红系）
 *
 * 注意：与 components/features/BoardGame/shared/StatusBadge.tsx 同名但用途不同：
 * - 本组件是通用 tone-based 徽章
 * - BoardGame 版本是游戏状态指示器（running/paused/ended）
 * - 路径不同不冲突，但语义不同，未来可考虑命名区分
 */
import React from 'react';

export type StatusBadgeTone =
    | 'neutral'
    | 'info'
    | 'success'
    | 'warning'
    | 'danger'
    | 'primary'
    | 'rarity';

export type StatusBadgeSize = 'sm' | 'md' | 'lg';

/** tone → Tailwind className 映射（背景 + 边框 + 文字） */
const toneClasses: Record<StatusBadgeTone, string> = {
    neutral: 'bg-gray-800/60 border-gray-700/40 text-gray-300',
    info: 'bg-cyan-900/20 border-cyan-700/40 text-cyan-300',
    success: 'bg-emerald-900/20 border-emerald-700/40 text-emerald-300',
    warning: 'bg-amber-900/25 border-amber-700/40 text-amber-300',
    danger: 'bg-red-900/25 border-red-700/40 text-red-300',
    primary: 'bg-wuxia-gold/15 border-wuxia-gold/40 text-wuxia-gold',
    rarity: 'bg-amber-900/35 border-amber-600/60 text-amber-200',
};

/** size → 字号 className */
const sizeClasses: Record<StatusBadgeSize, string> = {
    sm: 'text-[9px] px-1.5 py-0.5',
    md: 'text-[10px] px-2 py-0.5',
    lg: 'text-sm px-3 py-1',
};

export type StatusBadgeProps = {
    /** 配色 tone */
    tone: StatusBadgeTone;
    /** 文本内容 */
    children: React.ReactNode;
    /** 可选 icon（emoji 或字符），渲染在 children 之前 */
    icon?: React.ReactNode;
    /** 可选 value（数字），渲染在 children 之后；0 不渲染 */
    value?: number;
    /** 尺寸，默认 md */
    size?: StatusBadgeSize;
    /** 自定义 className 覆盖 */
    className?: string;
    /** 测试用 */
    testId?: string;
    /** hover tooltip */
    title?: string;
    /** ARIA label 覆盖（默认从 children 推导） */
    ariaLabel?: string;
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({
    tone,
    children,
    icon,
    value,
    size = 'md',
    className = '',
    testId,
    title,
    ariaLabel,
}) => {
    const showValue = value !== undefined && value !== null && value !== 0;
    const classes = [
        'inline-flex items-center gap-1 rounded border font-mono font-medium tracking-wide whitespace-nowrap',
        toneClasses[tone],
        sizeClasses[size],
        className,
    ].filter(Boolean).join(' ');

    return (
        <span
            className={classes}
            data-testid={testId}
            title={title}
            aria-label={ariaLabel}
        >
            {icon !== undefined && icon !== null && <span aria-hidden="true">{icon}</span>}
            {children}
            {showValue && <span className="ml-0.5 font-bold">{value}</span>}
        </span>
    );
};

export default StatusBadge;
