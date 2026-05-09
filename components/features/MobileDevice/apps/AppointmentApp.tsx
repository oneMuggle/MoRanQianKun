// 预约管理 App — 客户预约、排期管理

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

const AppointmentApp: React.FC<AppProps> = ({ eraId, mode, onBack }) => {
    const config = getDeviceConfig(eraId);
    const appName = getAppName(config, 'appointment', mode);
    const today = new Date().toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'short' });

    const appointments = [
        { time: '09:00', client: '张女士', service: '剪发+造型', status: '已确认' },
        { time: '10:30', client: '李先生', service: '染发', status: '已确认' },
        { time: '14:00', client: '王女士', service: '美甲设计', status: '待确认' },
    ];

    return (
        <div className="flex flex-col h-full bg-gray-900 text-white">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700/50">
                <button onClick={onBack} className="text-blue-400 text-sm">返回</button>
                <h2 className="text-lg font-semibold">{appName}</h2>
                <div className="w-8" />
            </div>

            <div className="px-4 py-3 bg-gray-800/50">
                <p className="text-sm text-gray-400">今日排期</p>
                <p className="text-lg font-medium">{today}</p>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {appointments.map((apt, i) => (
                    <div key={i} className="rounded-xl border border-gray-700/50 p-3 flex items-center gap-3">
                        <div className="text-center w-14">
                            <p className="text-sm font-medium">{apt.time}</p>
                        </div>
                        <div className="w-px h-10 bg-gray-700" />
                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium">{apt.client}</span>
                                <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                                    apt.status === '已确认' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                                }`}>{apt.status}</span>
                            </div>
                            <p className="text-xs text-gray-400 mt-1">{apt.service}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AppointmentApp;
