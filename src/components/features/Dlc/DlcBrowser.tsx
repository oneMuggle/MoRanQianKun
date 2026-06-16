/**
 * DlcBrowser — DLC 浏览器组件
 *
 * 来源：docs/plans/2026-06-15_yishijie-ui-gameplay-borrow-plan.md U18
 * 目标：DLC 列表展示 + 类型筛选 + 详情侧栏
 *
 * 设计：
 * - 顶部类型筛选（全部 + 6 种类型）
 * - 左侧 DLC 卡片列表（点击显示详情）
 * - 右侧详情面板（显示完整描述、标签、作者）
 * - 零外部依赖
 */
import React, { useState } from 'react';

export type DlcType = 'era-pack' | 'race-pack' | 'worldbook' | 'preset' | 'map-pack' | 'scenario';

export const 全部Dlc类型: DlcType[] = [
    'era-pack', 'race-pack', 'worldbook', 'preset', 'map-pack', 'scenario',
];

export const Dlc类型标签: Record<DlcType, string> = {
    'era-pack': '时代包',
    'race-pack': '种族包',
    'worldbook': '世界书',
    'preset': '预设',
    'map-pack': '地图包',
    'scenario': '剧本',
};

export type DlcEntry = {
    id: string;
    名称: string;
    描述: string;
    类型: DlcType;
    标签?: string[];
    作者?: string;
};

export type DlcBrowserProps = {
    dlcs: DlcEntry[];
    /** 初始选中的 DLC id */
    initialSelectedId?: string;
    /** 安装/使用回调 */
    onInstall?: (dlc: DlcEntry) => void;
    /** 自定义 className */
    className?: string;
};

type Filter = 'all' | DlcType;

const filterLabel: Record<Filter, string> = {
    all: '全部',
    ...Dlc类型标签,
};

export const DlcBrowser: React.FC<DlcBrowserProps> = ({
    dlcs,
    initialSelectedId,
    onInstall,
    className = '',
}) => {
    const [filter, setFilter] = useState<Filter>('all');
    const [selectedId, setSelectedId] = useState<string | undefined>(initialSelectedId);

    const filteredDlcs = filter === 'all'
        ? dlcs
        : dlcs.filter((d) => d.类型 === filter);

    const selected = selectedId ? dlcs.find((d) => d.id === selectedId) : null;

    if (dlcs.length === 0) {
        return (
            <div
                data-testid="dlc-browser-empty"
                className={`rounded-2xl border border-dashed border-gray-700 bg-black/30 p-12 text-center text-sm text-gray-500 ${className}`}
            >
                暂无 DLC
            </div>
        );
    }

    return (
        <div
            data-testid="dlc-browser"
            className={`grid grid-cols-1 md:grid-cols-[1fr_400px] gap-4 ${className}`}
        >
            <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                    {(['all', ...全部Dlc类型] as Filter[]).map((f) => (
                        <button
                            key={f}
                            type="button"
                            data-testid={`filter-${f}`}
                            onClick={() => setFilter(f)}
                            className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                                filter === f
                                    ? 'border-wuxia-gold bg-wuxia-gold/15 text-wuxia-gold'
                                    : 'border-gray-700 bg-black/30 text-gray-400 hover:border-wuxia-gold/40 hover:text-wuxia-gold'
                            }`}
                        >
                            {filterLabel[f]}
                        </button>
                    ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {filteredDlcs.length === 0 ? (
                        <div className="col-span-full text-center py-8 text-sm text-gray-500">
                            该类型暂无 DLC
                        </div>
                    ) : (
                        filteredDlcs.map((dlc) => (
                            <button
                                key={dlc.id}
                                type="button"
                                data-testid={`dlc-card-${dlc.id}`}
                                onClick={() => setSelectedId(dlc.id)}
                                className={`group text-left p-3 rounded-lg border transition-all ${
                                    selectedId === dlc.id
                                        ? 'border-wuxia-gold bg-wuxia-gold/10'
                                        : 'border-gray-700 bg-black/30 hover:border-wuxia-gold/40 hover:bg-black/40'
                                }`}
                            >
                                <div className="flex items-start justify-between gap-2">
                                    <div className="font-serif font-bold text-sm text-gray-100 group-hover:text-wuxia-gold">
                                        {dlc.名称}
                                    </div>
                                    <span className="text-[10px] px-1.5 py-0.5 rounded border border-cyan-700/40 bg-cyan-900/20 text-cyan-300 shrink-0">
                                        {Dlc类型标签[dlc.类型]}
                                    </span>
                                </div>
                                {dlc.作者 && (
                                    <div className="text-[10px] text-gray-500 mt-1">by {dlc.作者}</div>
                                )}
                            </button>
                        ))
                    )}
                </div>
            </div>

            <div className="rounded-2xl border border-wuxia-gold/20 bg-black/40 p-5 sticky top-4 self-start">
                {selected ? (
                    <div data-testid={`dlc-detail-${selected.id}`}>
                        <div className="flex items-start justify-between gap-2 mb-3">
                            <div>
                                <h3 className="text-xl font-serif font-bold text-wuxia-gold">{selected.名称}</h3>
                                <div className="text-xs text-gray-400 mt-1">{Dlc类型标签[selected.类型]} · by {selected.作者 || '未知'}</div>
                            </div>
                            <button
                                type="button"
                                data-testid="dlc-detail-close"
                                onClick={() => setSelectedId(undefined)}
                                className="text-gray-500 hover:text-wuxia-red text-xl leading-none w-6 h-6 flex items-center justify-center"
                                aria-label="关闭"
                            >
                                ×
                            </button>
                        </div>
                        <p className="text-sm text-gray-300 leading-7 mb-4">{selected.描述}</p>
                        {selected.标签 && selected.标签.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mb-4">
                                {selected.标签.map((tag) => (
                                    <span
                                        key={tag}
                                        className="text-[10px] px-2 py-0.5 rounded border border-wuxia-gold/30 bg-wuxia-gold/10 text-wuxia-gold font-mono"
                                    >
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        )}
                        {onInstall && (
                            <button
                                type="button"
                                onClick={() => onInstall(selected)}
                                className="w-full py-2.5 rounded-lg bg-wuxia-gold/15 border border-wuxia-gold/40 text-wuxia-gold hover:bg-wuxia-gold/25 hover:border-wuxia-gold/60 transition-all text-sm tracking-wider"
                            >
                                安装 / 启用
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="text-center py-12 text-sm text-gray-500">
                        选择左侧的 DLC 查看详情
                    </div>
                )}
            </div>
        </div>
    );
};

export default DlcBrowser;
