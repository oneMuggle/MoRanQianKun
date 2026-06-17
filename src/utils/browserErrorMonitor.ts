/**
 * BrowserErrorMonitor — 浏览器全局错误监控
 *
 * 来源：docs/plans/2026-06-15_yishijie-borrow-plan.md B1
 * 借鉴 yishijie 的 bindBrowserErrorMonitor 设计：
 * - 捕获 window error / unhandledrejection / 资源加载错误
 * - 30 条 FIFO 队列
 * - 暴露 window.__MRQK_ERROR_LOG__ 供 DevTools 调试
 */
import { useEffect } from 'react';

/** 单条错误条目 */
export type BrowserErrorEntry = {
    id: string;
    type: 'window_error' | 'unhandledrejection' | 'resource_error' | 'react_error';
    message: string;
    stack: string;
    filename: string;
    lineno: number;
    colno: number;
    createdAt: number;
};

const MAX_ENTRIES = 30;
let installed = false;

function pushEntry(entry: Omit<BrowserErrorEntry, 'id' | 'createdAt'>): void {
    if (typeof window === 'undefined') return;
    const w = window as unknown as { __MRQK_ERROR_LOG__?: BrowserErrorEntry[] };
    if (!Array.isArray(w.__MRQK_ERROR_LOG__)) {
        w.__MRQK_ERROR_LOG__ = [];
    }
    const fullEntry: BrowserErrorEntry = {
        ...entry,
        id: `err-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        createdAt: Date.now(),
    };
    w.__MRQK_ERROR_LOG__.push(fullEntry);
    if (w.__MRQK_ERROR_LOG__.length > MAX_ENTRIES) {
        w.__MRQK_ERROR_LOG__.splice(0, w.__MRQK_ERROR_LOG__.length - MAX_ENTRIES);
    }
}

/** 获取当前错误日志（副本） */
export function getBrowserErrorLog(): BrowserErrorEntry[] {
    if (typeof window === 'undefined') return [];
    const w = window as unknown as { __MRQK_ERROR_LOG__?: BrowserErrorEntry[] };
    return Array.isArray(w.__MRQK_ERROR_LOG__) ? [...w.__MRQK_ERROR_LOG__] : [];
}

/** 清空错误日志 */
export function clearBrowserErrorLog(): void {
    if (typeof window === 'undefined') return;
    const w = window as unknown as { __MRQK_ERROR_LOG__?: BrowserErrorEntry[] };
    if (Array.isArray(w.__MRQK_ERROR_LOG__)) {
        w.__MRQK_ERROR_LOG__ = [];
    }
}

/**
 * 安装全局错误监控（幂等）
 * 在应用启动时调用一次，早于 ReactDOM.createRoot
 */
export function bindBrowserErrorMonitor(): void {
    if (typeof window === 'undefined') return;
    if (installed) return;
    installed = true;

    const w = window as unknown as { __MRQK_ERROR_LOG__?: BrowserErrorEntry[] };
    if (!Array.isArray(w.__MRQK_ERROR_LOG__)) {
        w.__MRQK_ERROR_LOG__ = [];
    }

    window.addEventListener('error', (event) => {
        const target = event.target as HTMLElement | undefined;
        const isResource = target && (
            target.tagName === 'IMG'
            || target.tagName === 'SCRIPT'
            || target.tagName === 'LINK'
            || target.tagName === 'AUDIO'
            || target.tagName === 'VIDEO'
        );
        pushEntry({
            type: isResource ? 'resource_error' : 'window_error',
            message: isResource
                ? `资源加载失败: ${target?.tagName || 'unknown'} (${(target as any)?.src || (target as any)?.href || ''})`
                : String(event.message || event.error || '未知错误'),
            stack: event.error instanceof Error ? (event.error.stack || '') : '',
            filename: isResource
                ? String((target as any)?.src || (target as any)?.href || '')
                : String(event.filename || ''),
            lineno: event.lineno || 0,
            colno: event.colno || 0,
        });
    }, true);

    window.addEventListener('unhandledrejection', (event) => {
        const reason = event.reason;
        pushEntry({
            type: 'unhandledrejection',
            message: reason instanceof Error
                ? reason.message
                : typeof reason === 'string'
                    ? reason
                    : (() => {
                        try { return JSON.stringify(reason); } catch { return 'Promise rejected'; }
                    })(),
            stack: reason instanceof Error ? (reason.stack || '') : '',
            filename: '',
            lineno: 0,
            colno: 0,
        });
    });
}

/** React Hook：在组件树顶层使用，自动安装监控（仅一次） */
export function useBrowserErrorMonitor(): void {
    useEffect(() => {
        bindBrowserErrorMonitor();
    }, []);
}
