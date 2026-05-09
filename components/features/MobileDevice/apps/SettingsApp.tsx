// 设置 App — 显示设备信息、里模式信息

import React, { useMemo } from 'react';
import { DeviceMode, MobileApp, DeviceGameContext } from '../../../../models/mobileDevice';
import { getDeviceConfig, getAppName } from '../../../../models/eraDevice';
import { resolveEraNode } from '../../../../models/eraTheme';

interface AppProps {
    eraId: string;
    mode: DeviceMode;
    appId: MobileApp;
    onBack: () => void;
    gameContext?: DeviceGameContext;
}

const SettingsApp: React.FC<AppProps> = ({ eraId, mode, onBack }) => {
    const config = getDeviceConfig(eraId);
    const appName = getAppName(config, 'settings', mode);
    const eraNode = useMemo(() => resolveEraNode(eraId), [eraId]);

    const settingItems = [
        { icon: '📱', label: '设备型号', value: config.deviceName },
        { icon: '🌐', label: '当前纪元', value: config.eraId },
        { icon: '🔋', label: '能源', value: config.capabilities.能源类型 },
        { icon: '📡', label: '通讯范围', value: config.capabilities.通讯范围 },
    ];

    return (
        <div className="flex flex-col h-full bg-gray-900 text-white">
            {/* 顶部导航 */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700/50">
                <button onClick={onBack} className="text-blue-400 text-sm">返回</button>
                <h2 className="text-lg font-semibold">{appName}</h2>
                <div className="w-8" />
            </div>

            {/* 设置列表 */}
            <div className="flex-1 overflow-y-auto p-4">
                <div className="rounded-xl overflow-hidden border border-gray-700/50">
                    {settingItems.map((item, i) => (
                        <div
                            key={item.label}
                            className={`flex items-center gap-3 px-4 py-3 ${
                                i > 0 ? 'border-t border-gray-700/30' : ''
                            }`}
                        >
                            <span className="text-lg">{item.icon}</span>
                            <div className="flex-1">
                                <span className="text-sm">{item.label}</span>
                                <p className="text-xs text-gray-500">{item.value}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* 关于 */}
                <div className="mt-6 text-center text-xs text-gray-600">
                    <p>墨色江湖 v1.0.0</p>
                    <p className="mt-1">里模式: {eraNode?.inherited.liMode?.name ?? '未启用'}</p>
                </div>
            </div>
        </div>
    );
};

export default SettingsApp;
