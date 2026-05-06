import { useMemo } from 'react';
import type { DeviceMode } from '../../../models/mobileDevice';
import { getDeviceConfig, getLiModeThemeColor } from '../../../models/eraDevice';
import { getEraCategory } from '../../../components/features/MobileDevice/eraStyles/EraStyleSelector';

/**
 * 根据 eraId + mode 计算主题变量
 */
export function useDeviceTheme(eraId: string, mode: DeviceMode) {
    return useMemo(() => {
        const config = getDeviceConfig(eraId);
        const isLiMode = mode === 'li';
        const eraCategory = getEraCategory(eraId);
        const themeColor = config && isLiMode ? getLiModeThemeColor(config, '#6B2D8B') : undefined;

        return {
            config,
            isLiMode,
            eraCategory,
            themeColor,
            deviceName: config?.deviceName || '未知设备',
            deviceForm: config?.deviceForm || 'unknown',
        };
    }, [eraId, mode]);
}
