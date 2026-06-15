/**
 * WorldMinimap — 世界地图缩略图组件
 *
 * 来源：docs/plans/2026-06-15_yishijie-ui-gameplay-borrow-plan.md U7
 * 目标：所有地图的缩略卡片网格 + 当前高亮 + 点击跳转
 *
 * 设计：
 * - 卡片网格布局（2-3 列），每张卡片显示地图名 + 归属层级 + 建筑数
 * - 当前 small place 匹配的卡片用 wuxia-gold 高亮边框
 * - 点击触发 onSelectMap 回调（父组件决定是否切换或跳转）
 * - 零外部依赖，纯 Tailwind + 数据驱动
 */
import React, { useMemo } from 'react';

export type MinimapEntry = {
    id: string;
    名称: string;
    归属: {
        大地点?: string;
        中地点?: string;
        小地点?: string;
    };
    建筑数: number;
};

export type WorldMinimapProps = {
    maps: MinimapEntry[];
    /** 当前大地点（用于归属匹配） */
    currentBig?: string;
    /** 当前中地点 */
    currentMid?: string;
    /** 当前小地点（用于高亮匹配） */
    currentSmall?: string;
    /** 选中地图 id（外部受控） */
    selectedMapId?: string;
    /** 点击地图卡片回调 */
    onSelectMap: (id: string) => void;
    /** 自定义 className */
    className?: string;
};

const 归一化 = (s?: string | null) => (s || '').trim();

/** 把 归属 字段拼成 `大 > 中 > 小` 字符串 */
const 归属字符串 = (entry: MinimapEntry): string => {
    const parts = [entry.归属.大地点, entry.归属.中地点, entry.归属.小地点]
        .map(归一化)
        .filter(Boolean);
    return parts.length > 0 ? parts.join(' › ') : '未归属';
};

export const WorldMinimap: React.FC<WorldMinimapProps> = ({
    maps,
    currentBig,
    currentMid,
    currentSmall,
    selectedMapId,
    onSelectMap,
    className = '',
}) => {
    const currentSmallNorm = useMemo(() => 归一化(currentSmall), [currentSmall]);

    /** 判断某个地图条目是否为当前位置 */
    const isCurrent = (entry: MinimapEntry): boolean => {
        if (!currentSmallNorm) return false;
        if (归一化(entry.归属.小地点) === currentSmallNorm) return true;
        if (归一化(entry.名称) === currentSmallNorm) return true;
        return false;
    };

    if (maps.length === 0) {
        return (
            <div
                data-testid="world-minimap-empty"
                className={`rounded-lg border border-dashed border-gray-700 bg-black/30 p-6 text-center text-sm text-gray-500 ${className}`}
            >
                当前世界暂无地图
            </div>
        );
    }

    return (
        <div
            data-testid="world-minimap"
            className={`grid grid-cols-2 md:grid-cols-3 gap-2 ${className}`}
        >
            {maps.map((entry) => {
                const isActive = isCurrent(entry);
                const isSelected = selectedMapId === entry.id;
                return (
                    <button
                        key={entry.id}
                        type="button"
                        data-testid={`minimap-card-${entry.id}`}
                        onClick={() => onSelectMap(entry.id)}
                        aria-current={isActive ? 'true' : undefined}
                        title={`${entry.名称 || '未命名地图'}（${归属字符串(entry)}）`}
                        className={`group relative flex flex-col items-start gap-1 rounded-lg border p-2.5 text-left transition-all ${
                            isActive
                                ? 'border-wuxia-gold bg-wuxia-gold/10 shadow-[0_0_12px_rgba(212,175,55,0.18)]'
                                : isSelected
                                    ? 'border-cyan-500/50 bg-cyan-500/10'
                                    : 'border-gray-700/60 bg-black/30 hover:border-wuxia-gold/40 hover:bg-black/40'
                        }`}
                    >
                        {/* 名称 */}
                        <div
                            className={`text-sm font-serif font-bold truncate w-full ${
                                isActive ? 'text-wuxia-gold' : 'text-gray-200 group-hover:text-wuxia-gold'
                            }`}
                        >
                            {entry.名称 || '未命名'}
                        </div>

                        {/* 归属层级 */}
                        <div className="text-[10px] text-gray-500 truncate w-full">
                            {归属字符串(entry)}
                        </div>

                        {/* 建筑数徽章 + 当前位置 */}
                        <div className="flex items-center gap-1 mt-0.5 flex-wrap">
                            <span
                                className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${
                                    entry.建筑数 > 0
                                        ? 'border-cyan-700/40 bg-cyan-900/20 text-cyan-300'
                                        : 'border-gray-700/40 bg-gray-800/40 text-gray-500'
                                }`}
                            >
                                {entry.建筑数 > 0 ? `${entry.建筑数} 建筑` : '无建筑'}
                            </span>
                            {isActive && (
                                <span
                                    data-testid="current-marker"
                                    className="text-[9px] font-mono px-1.5 py-0.5 rounded border border-wuxia-gold/60 bg-wuxia-gold/15 text-wuxia-gold"
                                >
                                    当前位置
                                </span>
                            )}
                        </div>
                    </button>
                );
            })}
        </div>
    );
};

export default WorldMinimap;
