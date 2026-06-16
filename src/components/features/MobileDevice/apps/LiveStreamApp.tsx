// 直播 App — 正常/NSFW 分区切换、弹幕互动

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

const LiveStreamApp: React.FC<AppProps> = ({ eraId, mode, onBack }) => {
    const config = getDeviceConfig(eraId);
    const appName = getAppName(config, 'live_stream', mode);
    const [activeTab, setActiveTab] = useState<'推荐' | '热门' | '关注'>('推荐');

    const streams = [
        { title: '深夜聊天室', viewer: 1230, host: '小夜', tag: '聊天', icon: '🎙️' },
        { title: '音乐Live', viewer: 5600, host: '音乐人阿杰', tag: '音乐', icon: '🎤' },
        { title: '游戏实况', viewer: 8900, host: '游戏达人', tag: '游戏', icon: '🎮' },
    ];

    return (
        <div className="flex flex-col h-full bg-gradient-to-b from-orange-900/20 to-gray-900 text-white">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700/50">
                <button onClick={onBack} className="text-blue-400 text-sm">返回</button>
                <h2 className="text-lg font-semibold">{appName}</h2>
                <div className="w-8" />
            </div>

            <div className="flex border-b border-gray-700/50">
                {(['推荐', '热门', '关注'] as const).map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === tab ? 'text-orange-400 border-b-2 border-orange-400' : 'text-gray-400'}`}>
                        {tab}
                    </button>
                ))}
            </div>

            <div className="flex-1 overflow-y-auto">
                <div className="p-3 grid grid-cols-2 gap-3">
                    {streams.map((s, i) => (
                        <div key={i} className="rounded-xl border border-gray-700/50 overflow-hidden">
                            <div className="h-28 bg-gray-800 flex items-center justify-center text-4xl relative">
                                {s.icon}
                                <div className="absolute top-2 left-2 bg-red-500 text-[10px] px-1.5 py-0.5 rounded-full flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> LIVE
                                </div>
                            </div>
                            <div className="p-2">
                                <p className="text-xs font-medium truncate">{s.title}</p>
                                <div className="flex items-center justify-between mt-1">
                                    <span className="text-[10px] text-gray-500">{s.host}</span>
                                    <span className="text-[10px] text-gray-500">{s.viewer}观看</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default LiveStreamApp;
