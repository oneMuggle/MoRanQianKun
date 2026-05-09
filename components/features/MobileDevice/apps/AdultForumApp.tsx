// 成人论坛 App — 匿名发帖、分区浏览、回复互动

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

const AdultForumApp: React.FC<AppProps> = ({ eraId, mode, onBack }) => {
    const config = getDeviceConfig(eraId);
    const appName = getAppName(config, 'adult_forum', mode);
    const [activeSection, setActiveSection] = useState<'热门' | '匿名' | '情感'>('热门');

    const posts = [
        { id: '1', author: '匿名用户', title: '大家觉得什么样的关系最舒服？', replies: 42, views: 1200, tag: '情感' },
        { id: '2', author: '夜猫子', title: '分享一个有趣的约会经历', replies: 18, views: 560, tag: '热门' },
        { id: '3', author: '匿名用户', title: '第一次来这里，请多关照', replies: 7, views: 230, tag: '新人' },
    ];

    return (
        <div className="flex flex-col h-full bg-gradient-to-b from-indigo-900/30 to-gray-900 text-white">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700/50">
                <button onClick={onBack} className="text-blue-400 text-sm">返回</button>
                <h2 className="text-lg font-semibold">{appName}</h2>
                <button className="text-sm text-indigo-400">发帖</button>
            </div>

            <div className="flex border-b border-gray-700/50">
                {(['热门', '匿名', '情感'] as const).map(tab => (
                    <button key={tab} onClick={() => setActiveSection(tab)} className={`flex-1 py-3 text-sm font-medium transition-colors ${activeSection === tab ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-gray-400'}`}>
                        {tab}
                    </button>
                ))}
            </div>

            <div className="flex-1 overflow-y-auto">
                <div className="p-3 space-y-3">
                    {posts.map(post => (
                        <div key={post.id} className="rounded-xl border border-gray-700/50 p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400">{post.tag}</span>
                                <span className="text-xs text-gray-500">{post.author}</span>
                            </div>
                            <p className="text-sm font-medium">{post.title}</p>
                            <div className="flex gap-4 mt-2 text-xs text-gray-500">
                                <span>💬 {post.replies}</span>
                                <span>👁️ {post.views}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AdultForumApp;
