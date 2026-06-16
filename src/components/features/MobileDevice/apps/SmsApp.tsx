// 短信 App — 会话列表、消息收发

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

interface SmsThread {
    id: string;
    name: string;
    lastMessage: string;
    time: string;
    unread: number;
}

const SmsApp: React.FC<AppProps> = ({ eraId, mode, onBack }) => {
    const config = getDeviceConfig(eraId);
    const appName = getAppName(config, 'sms', mode);
    const [activeThread, setActiveThread] = useState<string | null>(null);
    const [messageInput, setMessageInput] = useState('');

    // 示例会话（后续由 AI 剧情驱动）
    const threads: SmsThread[] = [
        { id: '1', name: '系统通知', lastMessage: '欢迎使用短信功能', time: '12:00', unread: 1 },
    ];

    const handleSend = () => {
        if (!messageInput.trim()) return;
        // TODO: 触发AI生成短信剧情
        setMessageInput('');
    };

    return (
        <div className="flex flex-col h-full bg-gray-900 text-white">
            {/* 顶部导航 */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700/50">
                <button onClick={onBack} className="text-blue-400 text-sm">返回</button>
                <h2 className="text-lg font-semibold">{appName}</h2>
                <div className="w-8" />
            </div>

            {/* 会话列表 */}
            {!activeThread && (
                <div className="flex-1 overflow-y-auto">
                    {threads.map(thread => (
                        <button
                            key={thread.id}
                            onClick={() => setActiveThread(thread.id)}
                            className="w-full flex items-center gap-3 px-4 py-3 border-b border-gray-700/30 hover:bg-gray-800/50 transition-colors"
                        >
                            <div className="w-10 h-10 rounded-full bg-blue-500/30 flex items-center justify-center text-lg">
                                💬
                            </div>
                            <div className="flex-1 text-left">
                                <div className="flex justify-between items-center">
                                    <span className="font-medium text-sm">{thread.name}</span>
                                    <span className="text-xs text-gray-500">{thread.time}</span>
                                </div>
                                <div className="flex justify-between items-center mt-1">
                                    <span className="text-xs text-gray-400 truncate max-w-[200px]">
                                        {thread.lastMessage}
                                    </span>
                                    {thread.unread > 0 && (
                                        <span className="bg-blue-500 text-white text-[10px] rounded-full w-5 h-5 flex items-center justify-center">
                                            {thread.unread}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </button>
                    ))}
                    {threads.length === 0 && (
                        <div className="p-8 text-center text-gray-500 text-sm">
                            暂无短信会话
                        </div>
                    )}
                </div>
            )}

            {/* 会话详情 */}
            {activeThread && (
                <>
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        <div className="flex justify-start">
                            <div className="bg-gray-700 rounded-2xl rounded-tl-sm px-4 py-2 max-w-[80%]">
                                <p className="text-sm">欢迎使用短信功能！</p>
                                <span className="text-[10px] text-gray-400 mt-1 block text-right">12:00</span>
                            </div>
                        </div>
                    </div>

                    {/* 输入框 */}
                    <div className="flex items-center gap-2 px-3 py-2 border-t border-gray-700/50">
                        <input
                            type="text"
                            value={messageInput}
                            onChange={e => setMessageInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleSend()}
                            placeholder="输入短信内容..."
                            className="flex-1 bg-gray-700/50 rounded-full px-4 py-2 text-sm outline-none focus:ring-1 focus:ring-blue-400 placeholder-gray-500"
                        />
                        <button
                            onClick={handleSend}
                            className="w-9 h-9 rounded-full bg-blue-500 flex items-center justify-center text-sm hover:bg-blue-400 transition-colors"
                        >
                            ↑
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default SmsApp;
