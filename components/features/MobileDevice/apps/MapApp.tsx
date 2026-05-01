import React from 'react';
import { DeviceMode, MobileApp } from '../../../../models/mobileDevice';
import { getDeviceConfig, getAppName } from '../../../../models/eraDevice';

interface AppProps {
    eraId: string;
    mode: DeviceMode;
    appId: MobileApp;
    onBack: () => void;
}

const MapApp: React.FC<AppProps> = ({ eraId, mode, appId, onBack }) => {
    const config = getDeviceConfig(eraId);
    const appName = config ? getAppName(config, appId, mode) : '地图';

    return (
        <div className="flex flex-col h-full">
            <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-700/50">
                <button onClick={onBack} className="text-gray-400 hover:text-white">←</button>
                <h3 className="font-semibold">{appName}</h3>
            </div>
            <div className="flex-1 flex items-center justify-center text-gray-500">
                <p>地图功能开发中...</p>
            </div>
        </div>
    );
};

export default MapApp;
