import { useState, useCallback } from 'react';
import type { DeviceMessage, DeviceMode, MobileApp } from '../../models/mobileDevice';

/**
 * 管理设备消息状态、触发 AI 生成
 */
export function useDeviceMessages(eraId: string, mode: DeviceMode) {
    const [messages, setMessages] = useState<Record<string, DeviceMessage[]>>({});
    const [loading, setLoading] = useState(false);

    const addMessage = useCallback((appId: string, msg: DeviceMessage) => {
        setMessages((prev) => ({
            ...prev,
            [appId]: [...(prev[appId] || []), msg],
        }));
    }, []);

    const clearMessages = useCallback((appId: string) => {
        setMessages((prev) => ({ ...prev, [appId]: [] }));
    }, []);

    return { messages, addMessage, clearMessages, loading };
}
