import React from 'react';
import type { 图片管理筛选条件 } from '@/types';
import { ImageFilterBar } from './ImageFilterBar';

interface ImageManagerShellProps {
    activeTab: 'manual' | 'library' | 'scene' | 'queue' | 'history' | 'presets' | 'rules';
    setActiveTab: (tab: 'manual' | 'library' | 'scene' | 'queue' | 'history' | 'presets' | 'rules') => void;
    onClose: () => void;
    filters: 图片管理筛选条件;
    setFilters: React.Dispatch<React.SetStateAction<图片管理筛选条件>>;
    图片统计: { total: number; success: number; failed: number; pending: number };
    队列统计: { total: number; queued: number; running: number; failed: number };
    npcLibraryGroups: { npc: { 姓名?: string } }[];
    filteredCombinedQueue: unknown[];
    combinedHistoryRecords: unknown[];
    actionError: string | null;
    标签按钮样式: (isActive: boolean) => string;
    children: React.ReactNode;
}

/**
 * 图像工作台外壳 — 侧边栏导航 + 筛选栏 + 内容区
 */
export function ImageManagerShell({
    activeTab,
    setActiveTab,
    onClose,
    filters,
    setFilters,
    图片统计,
    队列统计,
    npcLibraryGroups,
    filteredCombinedQueue,
    combinedHistoryRecords,
    actionError,
    标签按钮样式,
    children,
}: ImageManagerShellProps) {
    return (
        <div
            className="w-full h-full flex overflow-hidden rounded-lg border border-wuxia-gold/20 shadow-[0_0_60px_rgba(0,0,0,0.6)] backdrop-blur-md"
            onClick={(event) => {
                const target = event.target as HTMLElement;
                const tagName = target.tagName;
                const isEditable = tagName === 'INPUT' || tagName === 'TEXTAREA' || tagName === 'SELECT' || target.isContentEditable;
                if (isEditable) {
                    event.stopPropagation();
                }
            }}
        >
            {/* 侧边栏 */}
            <div className="w-20 md:w-56 shrink-0 border-r border-wuxia-gold/20 bg-black/60 flex flex-col items-center md:items-stretch py-6 space-y-8 z-20">
                <div className="hidden md:block px-6">
                    <div className="text-wuxia-gold font-serif font-bold text-2xl tracking-[0.2em] text-shadow-glow drop-shadow-lg">图像工作台</div>
                    <div className="text-[10px] text-gray-500 mt-2 uppercase tracking-widest">Image Matrix</div>
                </div>
                <div className="flex-1 space-y-1 mt-4 md:mt-0 w-full overflow-y-auto custom-scrollbar">
                    <button type="button" onClick={() => setActiveTab('manual')} className={标签按钮样式(activeTab === 'manual')}>
                        <span className="md:hidden text-lg w-full text-center">推</span>
                        <span className="hidden md:inline">手动生成</span>
                    </button>
                    <button type="button" onClick={() => setActiveTab('library')} className={标签按钮样式(activeTab === 'library')}>
                        <span className="md:hidden text-lg w-full text-center">库</span>
                        <span className="hidden md:inline">图库资源</span>
                    </button>
                    <button type="button" onClick={() => setActiveTab('scene')} className={标签按钮样式(activeTab === 'scene')}>
                        <span className="md:hidden text-lg w-full text-center">景</span>
                        <span className="hidden md:inline">场景壁纸</span>
                    </button>
                    <button type="button" onClick={() => setActiveTab('queue')} className={标签按钮样式(activeTab === 'queue')}>
                        <span className="md:hidden text-lg w-full text-center">队</span>
                        <span className="hidden md:inline">生成队列</span>
                    </button>
                    <button type="button" onClick={() => setActiveTab('history')} className={标签按钮样式(activeTab === 'history')}>
                        <span className="md:hidden text-lg w-full text-center">史</span>
                        <span className="hidden md:inline">生成历史</span>
                    </button>
                    <button type="button" onClick={() => setActiveTab('presets')} className={标签按钮样式(activeTab === 'presets')}>
                        <span className="md:hidden text-lg w-full text-center">设</span>
                        <span className="hidden md:inline">资源配置</span>
                    </button>
                    <button type="button" onClick={() => setActiveTab('rules')} className={标签按钮样式(activeTab === 'rules')}>
                        <span className="md:hidden text-lg w-full text-center">规</span>
                        <span className="hidden md:inline">规则中心</span>
                    </button>
                </div>
            </div>

            {/* 主区 */}
            <div className="flex-1 flex flex-col min-w-0 bg-[#070708]/80 relative overflow-hidden">
                <button
                    type="button"
                    onClick={onClose}
                    className="absolute right-4 top-4 z-50 w-10 h-10 flex items-center justify-center rounded border border-gray-700 bg-black/50 text-gray-300 hover:text-red-400 hover:border-red-800 transition-colors shadow-lg"
                    title="关闭"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col">
                    <ImageFilterBar
                        activeTab={activeTab}
                        filters={filters}
                        setFilters={setFilters}
                        图片统计={图片统计}
                        队列统计={队列统计}
                        npcLibraryGroups={npcLibraryGroups}
                        filteredCombinedQueue={filteredCombinedQueue}
                        combinedHistoryRecords={combinedHistoryRecords}
                    />

                    {actionError && activeTab !== 'manual' && (
                        <div className="mx-6 mt-6 rounded border border-red-900/40 bg-red-950/20 px-4 py-3 text-sm text-red-200 whitespace-pre-wrap break-words shadow-inner">
                            {actionError}
                        </div>
                    )}

                    <div className="flex-1 p-4 md:p-6 lg:p-8 relative z-0">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
