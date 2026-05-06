import { useState, useCallback } from 'react';
import type { MobileApp } from '../../models/mobileDevice';

/**
 * 管理 App 内导航状态、返回栈
 */
export function useDeviceNavigation(onReturnHome: () => void) {
    const [activeApp, setActiveApp] = useState<MobileApp | null>(null);
    const [history, setHistory] = useState<MobileApp[]>([]);

    const navigateTo = useCallback((app: MobileApp) => {
        setActiveApp(app);
        setHistory((prev) => [...prev, app]);
    }, []);

    const goBack = useCallback(() => {
        setHistory((prev) => {
            const newHistory = prev.slice(0, -1);
            if (newHistory.length === 0) {
                setActiveApp(null);
                onReturnHome();
            } else {
                setActiveApp(newHistory[newHistory.length - 1]);
            }
            return newHistory;
        });
    }, [onReturnHome]);

    const returnHome = useCallback(() => {
        setActiveApp(null);
        setHistory([]);
        onReturnHome();
    }, [onReturnHome]);

    return { activeApp, navigateTo, goBack, returnHome, history };
}
