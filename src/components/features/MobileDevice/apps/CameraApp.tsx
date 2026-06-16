// 相机 App — 拍照模式切换、快门

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

const CameraApp: React.FC<AppProps> = ({ eraId, mode, onBack }) => {
    const config = getDeviceConfig(eraId);
    const appName = getAppName(config, 'camera', mode);

    return (
        <div className="flex flex-col h-full bg-black text-white">
            {/* 顶部导航 */}
            <div className="flex items-center justify-between px-4 py-3">
                <button onClick={onBack} className="text-blue-400 text-sm">返回</button>
                <h2 className="text-lg font-semibold">{appName}</h2>
                <button className="text-sm">
                    <span className="text-gray-400">相册</span>
                </button>
            </div>

            {/* 取景框 */}
            <div className="flex-1 flex items-center justify-center">
                <div className="text-center text-gray-500">
                    <span className="text-5xl">📷</span>
                    <p className="mt-4 text-sm">相机预览（待接入摄像头/生图）</p>
                </div>
            </div>

            {/* 模式切换 */}
            <div className="flex justify-center gap-6 py-3 text-xs">
                {['拍照', '录像', '夜景'].map(m => (
                    <button key={m} className={`px-3 py-1 rounded-full ${m === '拍照' ? 'bg-yellow-500/30 text-yellow-300' : 'text-gray-400'}`}>
                        {m}
                    </button>
                ))}
            </div>

            {/* 快门按钮 */}
            <div className="flex justify-center items-center py-6">
                <button className="w-16 h-16 rounded-full border-4 border-white flex items-center justify-center hover:bg-white/20 transition-colors">
                    <div className="w-12 h-12 rounded-full bg-white" />
                </button>
            </div>
        </div>
    );
};

export default CameraApp;
