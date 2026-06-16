// 电话 App — 拨号键盘、通话记录、联系人快速拨号

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

const PhoneApp: React.FC<AppProps> = ({ eraId, mode, onBack }) => {
    const config = getDeviceConfig(eraId);
    const appName = getAppName(config, 'phone', mode);
    const [phoneNumber, setPhoneNumber] = useState('');
    const [activeTab, setActiveTab] = useState<'拨号' | '通话记录' | '联系人'>('拨号');

    const dialPad = [
        ['1', '2', '3'],
        ['4', '5', '6'],
        ['7', '8', '9'],
        ['*', '0', '#'],
    ];

    const handleDial = (digit: string) => {
        setPhoneNumber(prev => prev + digit);
    };

    const handleCall = () => {
        if (!phoneNumber) return;
        // TODO: 触发AI生成通话剧情
        alert(`正在拨打 ${phoneNumber}...`);
    };

    const handleDelete = () => {
        setPhoneNumber(prev => prev.slice(0, -1));
    };

    return (
        <div className="flex flex-col h-full bg-gray-900 text-white">
            {/* 顶部导航 */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700/50">
                <button onClick={onBack} className="text-blue-400 text-sm">返回</button>
                <h2 className="text-lg font-semibold">{appName}</h2>
                <div className="w-8" />
            </div>

            {/* Tab 切换 */}
            <div className="flex border-b border-gray-700/50">
                {(['拨号', '通话记录', '联系人'] as const).map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`flex-1 py-3 text-sm font-medium transition-colors ${
                            activeTab === tab
                                ? 'text-blue-400 border-b-2 border-blue-400'
                                : 'text-gray-400'
                        }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* 内容区 */}
            <div className="flex-1 overflow-y-auto">
                {activeTab === '拨号' && (
                    <div className="flex flex-col items-center justify-end p-4">
                        {/* 号码显示 */}
                        <div className="w-full text-center mb-6">
                            <span className="text-3xl font-light tracking-wider">
                                {phoneNumber || '输入号码'}
                            </span>
                        </div>

                        {/* 拨号键盘 */}
                        <div className="grid grid-cols-3 gap-4 w-full max-w-[280px] mb-6">
                            {dialPad.flat().map(digit => (
                                <button
                                    key={digit}
                                    onClick={() => handleDial(digit)}
                                    className="w-16 h-16 mx-auto rounded-full bg-gray-700/50 text-2xl font-medium hover:bg-gray-600/50 active:bg-gray-500/50 transition-colors flex flex-col items-center justify-center"
                                >
                                    {digit}
                                    {digit !== '*' && digit !== '#' && digit !== '1' && (
                                        <span className="text-[8px] text-gray-400 -mt-1">
                                            {digit === '2' ? 'ABC' : digit === '3' ? 'DEF' :
                                             digit === '4' ? 'GHI' : digit === '5' ? 'JKL' :
                                             digit === '6' ? 'MNO' : digit === '7' ? 'PQRS' :
                                             digit === '8' ? 'TUV' : digit === '9' ? 'WXYZ' :
                                             digit === '0' ? '+' : ''}
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* 拨号按钮 */}
                        <button
                            onClick={handleCall}
                            className="w-16 h-16 rounded-full bg-green-500 text-2xl font-bold hover:bg-green-400 active:bg-green-600 transition-colors flex items-center justify-center"
                        >
                            📞
                        </button>

                        {/* 删除按钮 */}
                        {phoneNumber && (
                            <button
                                onClick={handleDelete}
                                className="mt-2 text-gray-400 text-sm hover:text-white transition-colors"
                            >
                                删除
                            </button>
                        )}
                    </div>
                )}

                {activeTab === '通话记录' && (
                    <div className="p-4 text-center text-gray-500 text-sm">
                        <p>暂无通话记录</p>
                    </div>
                )}

                {activeTab === '联系人' && (
                    <div className="p-4 text-center text-gray-500 text-sm">
                        <p>从通讯录选择联系人</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PhoneApp;
