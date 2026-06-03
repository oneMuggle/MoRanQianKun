/**
 * components/ui/ToastManager.tsx
 *
 * 统一 Toast 管理器（2026-06-03 Phase 6 P6-2 引入）
 * 三类提示：info / warn / error
 * 移动端：顶部下拉；桌面：右下角浮窗
 *
 * 使用：
 *   1. App.tsx 中挂载 <ToastManager />
 *   2. 业务代码通过 `useToastStore.getState().push('error', '保存失败')` 调用
 */

import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';

export type ToastLevel = 'info' | 'warn' | 'error';

export interface ToastItem {
    id: string;
    level: ToastLevel;
    message: string;
    /** 自动消失毫秒，0 表示不自动消失（默认 error=8000, warn=5000, info=3000）*/
    duration?: number;
    createdAt: number;
}

interface ToastStore {
    items: ToastItem[];
    push: (level: ToastLevel, message: string, duration?: number) => string;
    dismiss: (id: string) => void;
    clear: () => void;
}

const ToastContext = createContext<ToastStore | null>(null);

/** 全局 store（用于非组件代码访问） */
let globalStore: ToastStore | null = null;
export const useToastStore = (): ToastStore => {
    if (!globalStore) {
        throw new Error('ToastManager 尚未挂载');
    }
    return globalStore;
};

/** 模块级便捷调用 */
export const toast = {
    info: (message: string, duration?: number) => globalStore?.push('info', message, duration),
    warn: (message: string, duration?: number) => globalStore?.push('warn', message, duration),
    error: (message: string, duration?: number) => globalStore?.push('error', message, duration),
};

const DEFAULT_DURATIONS: Record<ToastLevel, number> = {
    info: 3000,
    warn: 5000,
    error: 8000,
};

const LEVEL_STYLES: Record<ToastLevel, { bg: string; icon: string; border: string }> = {
    info: { bg: 'bg-blue-50 dark:bg-blue-950/30', icon: 'ℹ', border: 'border-blue-200 dark:border-blue-800' },
    warn: { bg: 'bg-amber-50 dark:bg-amber-950/30', icon: '⚠', border: 'border-amber-200 dark:border-amber-800' },
    error: { bg: 'bg-red-50 dark:bg-red-950/30', icon: '✕', border: 'border-red-200 dark:border-red-800' },
};

export const ToastManager: React.FC = () => {
    const [items, setItems] = useState<ToastItem[]>([]);
    const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

    const dismiss = useCallback((id: string) => {
        setItems(prev => prev.filter(item => item.id !== id));
        const timer = timersRef.current.get(id);
        if (timer) {
            clearTimeout(timer);
            timersRef.current.delete(id);
        }
    }, []);

    const push = useCallback((level: ToastLevel, message: string, duration?: number) => {
        const id = `toast_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
        const finalDuration = duration ?? DEFAULT_DURATIONS[level];
        const item: ToastItem = {
            id,
            level,
            message,
            duration: finalDuration,
            createdAt: Date.now(),
        };
        setItems(prev => [...prev, item]);
        if (finalDuration > 0) {
            const timer = setTimeout(() => dismiss(id), finalDuration);
            timersRef.current.set(id, timer);
        }
        return id;
    }, [dismiss]);

    const clear = useCallback(() => {
        setItems([]);
        timersRef.current.forEach(t => clearTimeout(t));
        timersRef.current.clear();
    }, []);

    // 设置全局 store（用于非组件调用）
    useEffect(() => {
        globalStore = { items, push, dismiss, clear };
        return () => {
            timersRef.current.forEach(t => clearTimeout(t));
            timersRef.current.clear();
            if (globalStore && globalStore.push === push) {
                globalStore = null;
            }
        };
    }, [items, push, dismiss, clear]);

    return (
        <ToastContext.Provider value={{ items, push, dismiss, clear }}>
            <div className="fixed top-3 right-3 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
                {items.map(item => {
                    const style = LEVEL_STYLES[item.level];
                    return (
                        <div
                            key={item.id}
                            role={item.level === 'error' ? 'alert' : 'status'}
                            className={`pointer-events-auto ${style.bg} ${style.border} border rounded-lg shadow-lg p-3 flex items-start gap-2 animate-toast-slide-in`}
                        >
                            <span className="text-lg flex-shrink-0" aria-hidden="true">{style.icon}</span>
                            <div className="flex-1 text-sm text-gray-800 dark:text-gray-200 break-words">
                                {item.message}
                            </div>
                            <button
                                onClick={() => dismiss(item.id)}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-lg leading-none flex-shrink-0"
                                aria-label="关闭"
                            >
                                ×
                            </button>
                        </div>
                    );
                })}
            </div>
        </ToastContext.Provider>
    );
};

export const useToast = (): ToastStore => {
    const ctx = useContext(ToastContext);
    if (!ctx) {
        // 降级到全局 store
        return useToastStore();
    }
    return ctx;
};
