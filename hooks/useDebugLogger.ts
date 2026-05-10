import { useState, useEffect, useCallback } from 'react';
import { turnLogger } from '../services/debug/turnLogger';
import type { DebugTurnLog } from '../types';

export function useDebugLogger(isDebugMode: boolean) {
    const [turnLogs, setTurnLogs] = useState<DebugTurnLog[]>([]);

    useEffect(() => {
        if (!isDebugMode) {
            setTurnLogs([]);
            return;
        }
        setTurnLogs(turnLogger.getTurns());
        return turnLogger.subscribe(() => {
            setTurnLogs(turnLogger.getTurns());
        });
    }, [isDebugMode]);

    const clearLogs = useCallback(() => {
        turnLogger.clear();
    }, []);

    const exportLogs = useCallback(() => {
        const json = turnLogger.exportJson();
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `debug-logs-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }, []);

    return {
        isDebugMode,
        turnLogs,
        clearLogs,
        exportLogs,
    };
}
