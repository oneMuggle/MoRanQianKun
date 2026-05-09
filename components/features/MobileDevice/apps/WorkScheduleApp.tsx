// 工作台 App — 工作日程、打卡、内部通讯

import React, { useState } from 'react';
import { DeviceMode, MobileApp, DeviceGameContext } from '../../../../models/mobileDevice';
import { getDeviceConfig, getAppName } from '../../../../models/eraDevice';

interface AppProps {
    eraId: string;
    mode: DeviceMode;
    appId: MobileApp;
    onBack: () => void;
    gameContext?: DeviceGameContext;
}

const WorkScheduleApp: React.FC<AppProps> = ({ eraId, mode, onBack }) => {
    const config = getDeviceConfig(eraId);
    const appName = getAppName(config, 'work_schedule', mode);
    const [activeTab, setActiveTab] = useState<'日程' | '打卡' | '消息'>('日程');

    const tasks = [
        { time: '09:00', title: '晨会', status: '已完成' },
        { time: '10:00', title: '项目评审', status: '进行中' },
        { time: '14:00', title: '代码 Review', status: '待开始' },
    ];

    const clockedIn = true;
    const clockInTime = '08:52';

    return (
        <div className="flex flex-col h-full bg-gray-900 text-white">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700/50">
                <button onClick={onBack} className="text-blue-400 text-sm">返回</button>
                <h2 className="text-lg font-semibold">{appName}</h2>
                <div className="w-8" />
            </div>

            <div className="flex border-b border-gray-700/50">
                {(['日程', '打卡', '消息'] as const).map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === tab ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400'}`}>
                        {tab}
                    </button>
                ))}
            </div>

            <div className="flex-1 overflow-y-auto">
                {activeTab === '日程' && (
                    <div className="p-3 space-y-2">
                        {tasks.map((t, i) => (
                            <div key={i} className="rounded-xl border border-gray-700/50 p-3 flex items-center gap-3">
                                <span className="text-sm text-gray-400 w-12">{t.time}</span>
                                <span className="flex-1 text-sm">{t.title}</span>
                                <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                                    t.status === '已完成' ? 'bg-green-500/20 text-green-400' :
                                    t.status === '进行中' ? 'bg-blue-500/20 text-blue-400' :
                                    'bg-gray-500/20 text-gray-400'
                                }`}>{t.status}</span>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === '打卡' && (
                    <div className="flex flex-col items-center justify-center p-8">
                        <div className="text-6xl mb-4">{clockedIn ? '✅' : '⏰'}</div>
                        <p className="text-lg font-medium">{clockedIn ? `已打卡 ${clockInTime}` : '尚未打卡'}</p>
                        <p className="text-sm text-gray-500 mt-2">上班时间 09:00</p>
                    </div>
                )}

                {activeTab === '消息' && (
                    <div className="p-8 text-center text-gray-500 text-sm">
                        <span className="text-4xl block mb-4">💬</span>
                        <p>暂无内部消息</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default WorkScheduleApp;
