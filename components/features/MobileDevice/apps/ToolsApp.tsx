import React from 'react';
import { DeviceMode, MobileApp } from '../../../../models/mobileDevice';
import { getDeviceConfig, getAppName, getLiModeThemeColor } from '../../../../models/eraDevice';

interface AppProps {
    eraId: string;
    mode: DeviceMode;
    appId: MobileApp;
    onBack: () => void;
}

const ToolsApp: React.FC<AppProps> = ({ eraId, mode, appId, onBack }) => {
    const config = getDeviceConfig(eraId);
    const appName = config ? getAppName(config, appId, mode) : '工具';
    const isLiMode = mode === 'li';
    const themeColor = config && isLiMode ? getLiModeThemeColor(config, '#6B2D8B') : undefined;

    const eraInfo = config ? {
        deviceName: config.deviceName,
        deviceForm: config.deviceForm,
        capabilities: config.capabilities,
        uiStyle: config.uiStyle,
        appCount: config.apps.length,
    } : null;

    return (
        <div className="flex flex-col h-full">
            <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-700/50">
                <button onClick={onBack} className="text-gray-400 hover:text-white transition-colors">←</button>
                <h3 className="font-semibold text-white">{appName}</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {eraInfo && (
                    <div className="rounded-lg border border-gray-700/40 bg-gray-800/30 p-4">
                        <h4 className="text-sm font-semibold text-wuxia-gold/80 mb-3">设备信息</h4>
                        <dl className="space-y-2 text-xs">
                            <div className="flex justify-between">
                                <dt className="text-gray-400">设备名称</dt>
                                <dd className="text-white">{eraInfo.deviceName}</dd>
                            </div>
                            <div className="flex justify-between">
                                <dt className="text-gray-400">设备形态</dt>
                                <dd className="text-white">{eraInfo.deviceForm}</dd>
                            </div>
                            <div className="flex justify-between">
                                <dt className="text-gray-400">UI 风格</dt>
                                <dd className="text-white">{eraInfo.uiStyle}</dd>
                            </div>
                            <div className="flex justify-between">
                                <dt className="text-gray-400">应用数量</dt>
                                <dd className="text-white">{eraInfo.appCount}</dd>
                            </div>
                        </dl>
                    </div>
                )}
                {eraInfo && (
                    <div className="rounded-lg border border-gray-700/40 bg-gray-800/30 p-4">
                        <h4 className="text-sm font-semibold text-wuxia-gold/80 mb-3">设备能力</h4>
                        <dl className="space-y-2 text-xs">
                            <div className="flex justify-between">
                                <dt className="text-gray-400">通讯范围</dt>
                                <dd className="text-white">{eraInfo.capabilities.通讯范围}</dd>
                            </div>
                            <div className="flex justify-between">
                                <dt className="text-gray-400">能源类型</dt>
                                <dd className="text-white">{eraInfo.capabilities.能源类型}</dd>
                            </div>
                            <div className="flex justify-between">
                                <dt className="text-gray-400">GPS 定位</dt>
                                <dd className={eraInfo.capabilities.hasGPS ? 'text-green-400' : 'text-red-400'}>{eraInfo.capabilities.hasGPS ? '已支持' : '不支持'}</dd>
                            </div>
                            <div className="flex justify-between">
                                <dt className="text-gray-400">语音输入</dt>
                                <dd className={eraInfo.capabilities.hasVocalInput ? 'text-green-400' : 'text-red-400'}>{eraInfo.capabilities.hasVocalInput ? '已支持' : '不支持'}</dd>
                            </div>
                            <div className="flex justify-between">
                                <dt className="text-gray-400">神经链接</dt>
                                <dd className={eraInfo.capabilities.hasNeuralLink ? 'text-green-400' : 'text-red-400'}>{eraInfo.capabilities.hasNeuralLink ? '已支持' : '不支持'}</dd>
                            </div>
                            <div className="flex justify-between">
                                <dt className="text-gray-400">全息投影</dt>
                                <dd className={eraInfo.capabilities.hasProjection ? 'text-green-400' : 'text-red-400'}>{eraInfo.capabilities.hasProjection ? '已支持' : '不支持'}</dd>
                            </div>
                            <div className="flex justify-between">
                                <dt className="text-gray-400">AR 叠加</dt>
                                <dd className={eraInfo.capabilities.hasAR ? 'text-green-400' : 'text-red-400'}>{eraInfo.capabilities.hasAR ? '已支持' : '不支持'}</dd>
                            </div>
                        </dl>
                    </div>
                )}
                <div className="rounded-lg border border-gray-700/40 bg-gray-800/30 p-4">
                    <h4 className="text-sm font-semibold text-wuxia-gold/80 mb-2">
                        {isLiMode ? '暗面工具' : '可用工具'}
                    </h4>
                    <ul className="space-y-2 text-xs">
                        <li className="flex items-center gap-2 text-gray-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-wuxia-gold/60"></span>
                            设备状态监测
                        </li>
                        <li className="flex items-center gap-2 text-gray-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-wuxia-gold/60"></span>
                            信号强度检测
                        </li>
                        {eraInfo?.capabilities.hasNeuralLink && (
                            <li className="flex items-center gap-2 text-gray-300">
                                <span className="w-1.5 h-1.5 rounded-full bg-wuxia-gold/60"></span>
                                神经校准
                            </li>
                        )}
                        {eraInfo?.capabilities.hasProjection && (
                            <li className="flex items-center gap-2 text-gray-300">
                                <span className="w-1.5 h-1.5 rounded-full bg-wuxia-gold/60"></span>
                                投影调试
                            </li>
                        )}
                        {isLiMode && (
                            <li className="flex items-center gap-2" style={{ color: themeColor }}>
                                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: themeColor }}></span>
                                暗面信号追踪
                            </li>
                        )}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default ToolsApp;
