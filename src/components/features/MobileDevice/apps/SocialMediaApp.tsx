// 社交媒体 App — 动态流、点赞评论、个人主页

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

interface Post {
    id: string;
    author: string;
    avatar: string;
    content: string;
    likes: number;
    comments: number;
    time: string;
}

const SocialMediaApp: React.FC<AppProps> = ({ eraId, mode, onBack }) => {
    const config = getDeviceConfig(eraId);
    const appName = getAppName(config, 'social_media', mode);
    const [activeTab, setActiveTab] = useState<'动态' | '发现' | '我的'>('动态');

    const posts: Post[] = [
        { id: '1', author: '小明', avatar: '😊', content: '今天天气真不错，出去走走~', likes: 12, comments: 3, time: '10分钟前' },
        { id: '2', author: '小红', avatar: '👧', content: '新做的蛋糕，卖相还可以吧？', likes: 28, comments: 8, time: '30分钟前' },
        { id: '3', author: '路人甲', avatar: '🧑', content: '有没有推荐的美食？', likes: 5, comments: 12, time: '1小时前' },
    ];

    return (
        <div className="flex flex-col h-full bg-gray-900 text-white">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700/50">
                <button onClick={onBack} className="text-blue-400 text-sm">返回</button>
                <h2 className="text-lg font-semibold">{appName}</h2>
                <button className="text-sm text-gray-400">✏️</button>
            </div>

            <div className="flex border-b border-gray-700/50">
                {(['动态', '发现', '我的'] as const).map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === tab ? 'text-purple-400 border-b-2 border-purple-400' : 'text-gray-400'}`}>
                        {tab}
                    </button>
                ))}
            </div>

            <div className="flex-1 overflow-y-auto">
                {activeTab === '动态' && (
                    <div className="p-3 space-y-4">
                        {posts.map(post => (
                            <div key={post.id} className="rounded-xl border border-gray-700/50 p-4">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-xl">{post.avatar}</div>
                                    <div>
                                        <p className="text-sm font-medium">{post.author}</p>
                                        <p className="text-xs text-gray-500">{post.time}</p>
                                    </div>
                                </div>
                                <p className="text-sm mb-3">{post.content}</p>
                                <div className="flex items-center gap-6 text-gray-400 text-xs">
                                    <button className="flex items-center gap-1 hover:text-red-400 transition-colors">❤️ {post.likes}</button>
                                    <button className="flex items-center gap-1 hover:text-blue-400 transition-colors">💬 {post.comments}</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === '发现' && (
                    <div className="p-8 text-center text-gray-500 text-sm">
                        <span className="text-4xl block mb-4">🔍</span><p>发现功能开发中</p>
                    </div>
                )}

                {activeTab === '我的' && (
                    <div className="p-4">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-16 h-16 rounded-full bg-purple-500/30 flex items-center justify-center text-3xl">👤</div>
                            <div>
                                <p className="text-lg font-medium">我的主页</p>
                                <p className="text-xs text-gray-500">发布 3 条动态</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-center">
                            <div><p className="text-lg font-bold">28</p><p className="text-xs text-gray-500">关注</p></div>
                            <div><p className="text-lg font-bold">156</p><p className="text-xs text-gray-500">粉丝</p></div>
                            <div><p className="text-lg font-bold">312</p><p className="text-xs text-gray-500">获赞</p></div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SocialMediaApp;
