// 约会交友 App — AI 配对、聊天、约会事件

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

const DatingApp: React.FC<AppProps> = ({ eraId, mode, onBack }) => {
    const config = getDeviceConfig(eraId);
    const appName = getAppName(config, 'dating', mode);
    const [activeTab, setActiveTab] = useState<'配对' | '消息' | '资料'>('配对');

    const matches = [
        { name: '小夜', age: 24, distance: '2.3km', icon: '👩', bio: '喜欢咖啡和书店' },
        { name: '林子', age: 26, distance: '5.1km', icon: '👨', bio: '程序员，养猫' },
        { name: '薇薇', age: 23, distance: '1.8km', icon: '💃', bio: '设计师，旅行爱好者' },
    ];

    return (
        <div className="flex flex-col h-full bg-gradient-to-b from-pink-900/30 to-gray-900 text-white">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700/50">
                <button onClick={onBack} className="text-blue-400 text-sm">返回</button>
                <h2 className="text-lg font-semibold">{appName}</h2>
                <div className="w-8" />
            </div>

            <div className="flex border-b border-gray-700/50">
                {(['配对', '消息', '资料'] as const).map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === tab ? 'text-pink-400 border-b-2 border-pink-400' : 'text-gray-400'}`}>
                        {tab}
                    </button>
                ))}
            </div>

            <div className="flex-1 overflow-y-auto">
                {activeTab === '配对' && (
                    <div className="p-4 space-y-4">
                        <div className="text-center text-xs text-gray-500 mb-4">发现附近有缘人</div>
                        {matches.map((m, i) => (
                            <div key={i} className="rounded-xl border border-pink-700/30 p-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 rounded-full bg-pink-500/20 flex items-center justify-center text-4xl">{m.icon}</div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium">{m.name}</span>
                                            <span className="text-xs text-gray-500">{m.age}岁</span>
                                        </div>
                                        <p className="text-sm text-gray-400 mt-1">{m.bio}</p>
                                        <p className="text-xs text-gray-600 mt-1">📍 {m.distance}</p>
                                    </div>
                                </div>
                                <div className="flex gap-3 mt-4">
                                    <button className="flex-1 py-2 rounded-full border border-gray-600 text-sm hover:bg-gray-800 transition-colors">跳过</button>
                                    <button className="flex-1 py-2 rounded-full bg-pink-500 text-sm font-medium hover:bg-pink-400 transition-colors">喜欢</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === '消息' && (
                    <div className="p-8 text-center text-gray-500 text-sm">
                        <span className="text-4xl block mb-4">💬</span><p>暂无消息</p>
                    </div>
                )}

                {activeTab === '资料' && (
                    <div className="p-4 text-center">
                        <div className="w-24 h-24 rounded-full bg-gray-700 mx-auto flex items-center justify-center text-5xl mb-4">👤</div>
                        <p className="text-lg font-medium">编辑个人资料</p>
                        <p className="text-sm text-gray-500 mt-2">完善资料获得更多匹配</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DatingApp;
