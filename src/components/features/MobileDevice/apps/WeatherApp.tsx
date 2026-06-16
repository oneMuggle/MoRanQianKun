// 天气 App — 实时天气、未来预报

import React from 'react';
import { DeviceMode, MobileApp, DeviceGameContext } from '../../../../models/mobileDevice';
import { getDeviceConfig, getAppName } from '../../../../models/eraDevice';

interface AppProps {
    eraId: string;
    mode: DeviceMode;
    appId: MobileApp;
    onBack: () => void;
    gameContext?: DeviceGameContext;
}

const WeatherApp: React.FC<AppProps> = ({ eraId, mode, onBack }) => {
    const config = getDeviceConfig(eraId);
    const appName = getAppName(config, 'weather', mode);

    // 示例天气数据（后续由 AI/世界状态驱动）
    const forecast = [
        { day: '今天', icon: '🌤️', high: 28, low: 20 },
        { day: '明天', icon: '⛅', high: 26, low: 19 },
        { day: '后天', icon: '🌧️', high: 22, low: 17 },
    ];

    return (
        <div className="flex flex-col h-full bg-gradient-to-b from-blue-900/50 to-gray-900 text-white">
            {/* 顶部导航 */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700/50">
                <button onClick={onBack} className="text-blue-400 text-sm">返回</button>
                <h2 className="text-lg font-semibold">{appName}</h2>
                <div className="w-8" />
            </div>

            {/* 当前天气 */}
            <div className="flex-1 flex flex-col items-center justify-center p-6">
                <span className="text-6xl mb-4">🌤️</span>
                <h3 className="text-5xl font-light">24°</h3>
                <p className="text-gray-400 mt-2">多云转晴</p>
                <p className="text-sm text-gray-500 mt-1">体感温度 26°</p>

                {/* 详情 */}
                <div className="grid grid-cols-3 gap-6 mt-8 w-full max-w-[300px]">
                    <div className="text-center">
                        <p className="text-xs text-gray-500">湿度</p>
                        <p className="text-lg">65%</p>
                    </div>
                    <div className="text-center">
                        <p className="text-xs text-gray-500">风速</p>
                        <p className="text-lg">3级</p>
                    </div>
                    <div className="text-center">
                        <p className="text-xs text-gray-500">紫外线</p>
                        <p className="text-lg">中等</p>
                    </div>
                </div>
            </div>

            {/* 未来预报 */}
            <div className="px-4 pb-6">
                <h4 className="text-sm font-medium mb-3">未来三天</h4>
                <div className="flex justify-around bg-gray-800/50 rounded-xl p-3">
                    {forecast.map(f => (
                        <div key={f.day} className="text-center">
                            <p className="text-xs text-gray-400">{f.day}</p>
                            <span className="text-2xl my-1 block">{f.icon}</span>
                            <p className="text-sm">{f.high}°</p>
                            <p className="text-xs text-gray-500">{f.low}°</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default WeatherApp;
