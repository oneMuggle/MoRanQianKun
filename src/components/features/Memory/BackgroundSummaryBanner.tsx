/**
 * BackgroundSummaryBanner.tsx
 * 后台记忆总结状态横幅 — 显示在游戏界面顶部
 */

import * as React from 'react';

interface Props {
    status: 'idle' | 'running' | 'done' | 'error';
    error?: string;
    onView: () => void;
    onDismiss: () => void;
    onApply: () => void;
}

const BackgroundSummaryBanner: React.FC<Props> = ({
    status,
    error,
    onView,
    onDismiss,
    onApply,
}) => {
    if (status === 'idle') return null;

    return (
        <div className="fixed top-0 left-0 right-0 z-[250] flex justify-center pointer-events-none">
            <div className={`pointer-events-auto px-4 py-2 rounded-b-xl shadow-lg border text-xs flex items-center gap-3 transition-all duration-300 ${
                status === 'running'
                    ? 'bg-ink-black/90 border-wuxia-gold/30 text-wuxia-gold'
                    : status === 'done'
                    ? 'bg-ink-black/90 border-green-500/30 text-green-300'
                    : 'bg-ink-black/90 border-red-500/30 text-red-300'
            }`}>
                {status === 'running' && (
                    <>
                        <div className="w-4 h-4 border-2 border-wuxia-gold/40 border-t-wuxia-gold rounded-full animate-spin" />
                        <span>正在整理记忆...</span>
                    </>
                )}
                {status === 'done' && (
                    <>
                        <span className="font-bold">✓</span>
                        <span>记忆总结完成</span>
                        <button
                            type="button"
                            onClick={onView}
                            className="underline hover:text-white"
                        >
                            查看
                        </button>
                        <button
                            type="button"
                            onClick={onApply}
                            className="px-2 py-0.5 rounded border border-green-500/30 hover:bg-green-500/10"
                        >
                            直接写入
                        </button>
                        <button
                            type="button"
                            onClick={onDismiss}
                            className="text-gray-500 hover:text-gray-300"
                        >
                            ✕
                        </button>
                    </>
                )}
                {status === 'error' && (
                    <>
                        <span className="font-bold">✕</span>
                        <span className="max-w-[200px] truncate">{error || '总结失败'}</span>
                        <button
                            type="button"
                            onClick={onDismiss}
                            className="text-gray-500 hover:text-gray-300"
                        >
                            ✕
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default BackgroundSummaryBanner;
