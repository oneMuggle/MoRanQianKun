/**
 * CrystalStatPanel — 水晶拨点属性分配面板
 *
 * 来源：docs/plans/2026-06-15_yishijie-ui-gameplay-borrow-plan.md U2
 * 替代 NewGameWizardContent.tsx 中原 - / + 按钮的简单属性分配 UI
 *
 * 设计：
 * - 6 维属性（力量/敏捷/体质/根骨/悟性/福源）以「水晶」方式呈现
 * - 水晶大小/亮度随数值缩放（3=暗小，10=亮大）
 * - 顶部徽章实时显示剩余点数（负数时变红）
 * - 「自动均衡」+「重置」两个快捷操作
 * - 完全受控：父组件提供 stats + onChange，无内部状态
 */
import React, { useMemo } from 'react';

/** 6 维属性类型，与 useNewGameWizardState 中的 属性结构 保持一致 */
export type 属性结构 = {
    力量: number;
    敏捷: number;
    体质: number;
    根骨: number;
    悟性: number;
    福源: number;
};

export type 属性键 = keyof 属性结构;

export const 属性键列表: readonly 属性键[] = ['力量', '敏捷', '体质', '根骨', '悟性', '福源'] as const;

export type CrystalStatPanelProps = {
    stats: 属性结构;
    minValue: number;
    maxValue: number;
    totalBudget: number;
    difficulty: 'relaxed' | 'easy' | 'normal' | 'hard' | 'extreme';
    /** 单值变化：父组件根据 (key, value) 更新 stats */
    onChange: (key: 属性键, value: number) => void;
    /** 批量变化：用于「自动均衡」和「重置」 */
    onBatchChange?: (next: 属性结构) => void;
};

const 难度标签映射: Record<CrystalStatPanelProps['difficulty'], string> = {
    relaxed: 'RELAXED',
    easy: 'EASY',
    normal: 'NORMAL',
    hard: 'HARD',
    extreme: 'EXTREME',
};

const 难度配色映射: Record<CrystalStatPanelProps['difficulty'], string> = {
    relaxed: 'text-emerald-300 border-emerald-500/40 bg-emerald-500/10',
    easy: 'text-sky-300 border-sky-500/40 bg-sky-500/10',
    normal: 'text-wuxia-gold border-wuxia-gold/40 bg-wuxia-gold/10',
    hard: 'text-orange-300 border-orange-500/40 bg-orange-500/10',
    extreme: 'text-red-300 border-red-500/40 bg-red-500/10',
};

/** 水晶的视觉缩放：值 → 0..1 范围（基于 min/max） */
function valueToRatio(value: number, minValue: number, maxValue: number): number {
    if (maxValue <= minValue) return 0;
    return Math.max(0, Math.min(1, (value - minValue) / (maxValue - minValue)));
}

/** 计算水晶尺寸（px）：基础 56px，每加 1 个 ratio 加 24px，最高 80px */
function crystalSize(value: number, minValue: number, maxValue: number): number {
    const ratio = valueToRatio(value, minValue, maxValue);
    return 56 + Math.round(ratio * 24);
}

/** 水晶的发光强度：0..1 */
function crystalGlow(value: number, minValue: number, maxValue: number): number {
    return valueToRatio(value, minValue, maxValue);
}

export const CrystalStatPanel: React.FC<CrystalStatPanelProps> = ({
    stats,
    minValue,
    maxValue,
    totalBudget,
    difficulty,
    onChange,
    onBatchChange,
}) => {
    const usedPoints = useMemo(
        () => 属性键列表.reduce((sum, k) => sum + stats[k], 0),
        [stats]
    );
    const remainingPoints = totalBudget - usedPoints;

    const handleIncrement = (key: 属性键) => {
        if (remainingPoints <= 0) return;
        if (stats[key] >= maxValue) return;
        onChange(key, stats[key] + 1);
    };

    const handleDecrement = (key: 属性键) => {
        if (stats[key] <= minValue) return;
        onChange(key, stats[key] - 1);
    };

    const 自动均衡 = () => {
        if (!onBatchChange) return;
        const keys = 属性键列表;
        const perKey = Math.floor(totalBudget / keys.length);
        let remainder = totalBudget - perKey * keys.length;
        const next: 属性结构 = { ...stats };
        keys.forEach((k) => {
            let v = Math.max(minValue, Math.min(maxValue, perKey));
            if (remainder > 0 && v < maxValue) {
                v += 1;
                remainder -= 1;
            }
            next[k] = v;
        });
        onBatchChange(next);
    };

    const 重置默认 = () => {
        if (!onBatchChange) return;
        const next: 属性结构 = 属性键列表.reduce(
            (acc, k) => ({ ...acc, [k]: minValue }),
            {} as 属性结构
        );
        onBatchChange(next);
    };

    return (
        <div className="space-y-5">
            {/* Header：难度 + 总预算 + 剩余 + 快捷操作 */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div className="flex items-center gap-3">
                    <span
                        className={`text-[11px] tracking-[0.25em] font-mono px-2.5 py-1 rounded border ${难度配色映射[difficulty]}`}
                    >
                        {难度标签映射[difficulty]}
                    </span>
                    <span className="text-xs text-gray-400">
                        总预算 <span className="text-wuxia-gold font-mono">{totalBudget}</span> 点
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <span
                        data-testid="remaining-points"
                        className={`text-sm font-mono px-3 py-1.5 rounded-lg ${
                            remainingPoints < 0
                                ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                                : remainingPoints === 0
                                    ? 'bg-wuxia-gold/20 text-wuxia-gold border border-wuxia-gold/30'
                                    : 'bg-gray-800/60 text-gray-300 border border-gray-700/40'
                        }`}
                    >
                        剩余 {remainingPoints} 点
                    </span>
                    {onBatchChange && (
                        <>
                            <button
                                type="button"
                                data-testid="crystal-auto-balance"
                                onClick={自动均衡}
                                className="text-[11px] tracking-wider px-3 py-1.5 rounded-lg border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20 transition-colors"
                            >
                                自动均衡
                            </button>
                            <button
                                type="button"
                                data-testid="crystal-reset"
                                onClick={重置默认}
                                className="text-[11px] tracking-wider px-3 py-1.5 rounded-lg border border-gray-700 bg-black/40 text-gray-300 hover:border-gray-500 transition-colors"
                            >
                                重置
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* 6 维水晶网格 */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {属性键列表.map((key) => {
                    const value = stats[key];
                    const size = crystalSize(value, minValue, maxValue);
                    const glow = crystalGlow(value, minValue, maxValue);
                    const atMax = value >= maxValue;
                    const atMin = value <= minValue;
                    const noBudget = remainingPoints <= 0;
                    const plusDisabled = atMax || noBudget;
                    const minusDisabled = atMin;

                    return (
                        <div
                            key={key}
                            data-testid={`crystal-${key}`}
                            className="group relative rounded-xl border border-gray-800 bg-black/30 p-4 flex flex-col items-center gap-3 transition-all hover:border-wuxia-gold/30"
                        >
                            <div className="text-xs text-gray-400 tracking-wider">{key}</div>

                            {/* 水晶：CSS 渐变 + 阴影模拟 */}
                            <div
                                className="relative flex items-center justify-center rounded-full transition-all duration-300"
                                style={{
                                    width: `${size}px`,
                                    height: `${size}px`,
                                    background: `radial-gradient(circle at 30% 30%, rgba(255,255,255,${0.3 + glow * 0.4}) 0%, rgba(212,175,55,${0.4 + glow * 0.5}) 35%, rgba(120,53,15,${0.5 + glow * 0.4}) 70%, rgba(20,8,0,0.9) 100%)`,
                                    boxShadow: `0 0 ${20 + glow * 30}px rgba(212,175,55,${0.2 + glow * 0.5}), inset 0 0 ${10 + glow * 15}px rgba(255,255,255,${0.1 + glow * 0.2})`,
                                }}
                                aria-label={`${key} 水晶`}
                            >
                                <span className="text-white font-mono font-bold text-base drop-shadow-[0_0_4px_rgba(0,0,0,0.8)]">
                                    {value}
                                </span>
                            </div>

                            {/* - / + 按钮 */}
                            <div className="flex gap-1">
                                <button
                                    type="button"
                                    data-testid="crystal-minus"
                                    onClick={() => handleDecrement(key)}
                                    disabled={minusDisabled}
                                    aria-label={`减少 ${key}`}
                                    className="w-8 h-8 rounded-lg border border-gray-700 bg-black/40 text-gray-300 hover:border-wuxia-gold/40 hover:text-wuxia-gold disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                >
                                    −
                                </button>
                                <button
                                    type="button"
                                    data-testid="crystal-plus"
                                    onClick={() => handleIncrement(key)}
                                    disabled={plusDisabled}
                                    aria-label={`增加 ${key}`}
                                    className="w-8 h-8 rounded-lg border border-gray-700 bg-black/40 text-gray-300 hover:border-wuxia-gold/40 hover:text-wuxia-gold disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                >
                                    +
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default CrystalStatPanel;
