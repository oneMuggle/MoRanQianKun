// 私密空间 App — 内容订阅、创作者发布

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

const NsfwGalleryApp: React.FC<AppProps> = ({ eraId, mode, onBack }) => {
    const config = getDeviceConfig(eraId);
    const appName = getAppName(config, 'nsfw_gallery', mode);
    const [activeTab, setActiveTab] = useState<'推荐' | '订阅' | '我的'>('推荐');

    const creators = [
        { name: '秘密花园', followers: 2300, icon: '🌹', locked: false },
        { name: '暗夜摄影师', followers: 890, icon: '📸', locked: true },
        { name: '月光画师', followers: 1560, icon: '🎨', locked: true },
    ];

    return (
        <div className="flex flex-col h-full bg-gradient-to-b from-gray-800 to-gray-900 text-white">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700/50">
                <button onClick={onBack} className="text-blue-400 text-sm">返回</button>
                <h2 className="text-lg font-semibold">{appName}</h2>
                <div className="w-8" />
            </div>

            <div className="flex border-b border-gray-700/50">
                {(['推荐', '订阅', '我的'] as const).map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === tab ? 'text-gray-300 border-b-2 border-gray-300' : 'text-gray-400'}`}>
                        {tab}
                    </button>
                ))}
            </div>

            <div className="flex-1 overflow-y-auto">
                {activeTab === '推荐' && (
                    <div className="p-3 space-y-3">
                        {creators.map((c, i) => (
                            <div key={i} className="rounded-xl border border-gray-700/50 p-4 flex items-center gap-3">
                                <div className="w-14 h-14 rounded-full bg-gray-700 flex items-center justify-center text-2xl relative">
                                    {c.icon}
                                    {c.locked && <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center"><span className="text-sm">🔒</span></div>}
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium">{c.name}</p>
                                    <p className="text-xs text-gray-500">{c.followers} 粉丝</p>
                                </div>
                                <button className={`px-3 py-1 rounded-full text-xs ${c.locked ? 'bg-gray-700 text-gray-400' : 'bg-white/10 text-white hover:bg-white/20'} transition-colors`}>
                                    {c.locked ? '订阅解锁' : '已订阅'}
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === '订阅' && (
                    <div className="p-8 text-center text-gray-500 text-sm"><span className="text-4xl block mb-4">🔒</span><p>尚未订阅任何创作者</p></div>
                )}

                {activeTab === '我的' && (
                    <div className="p-4 text-center">
                        <div className="w-20 h-20 rounded-full bg-gray-700 mx-auto flex items-center justify-center text-4xl mb-4">👤</div>
                        <p className="text-sm">我的私密空间</p>
                        <p className="text-xs text-gray-500 mt-1">订阅解锁更多专属内容</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NsfwGalleryApp;
