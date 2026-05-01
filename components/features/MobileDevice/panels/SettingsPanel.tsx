import React from 'react';
import { DeviceMode } from '../../../../models/mobileDevice';
import { getDeviceConfig, getLiModeThemeColor } from '../../../../models/eraDevice';

interface SettingsPanelProps {
    eraId: string;
    mode: DeviceMode;
    onBack: () => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ eraId, mode, onBack }) => {
    const config = getDeviceConfig(eraId);
    const isLiMode = mode === 'li';
    const themeColor = config && isLiMode ? getLiModeThemeColor(config, '#6B2D8B') : undefined;

    if (!config) {
        return (
            <div className="flex flex-col h-full">
                <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-700/50">
                    <button onClick={onBack} className="text-gray-400 hover:text-white transition-colors">←</button>
                    <h3 className="font-semibold text-white">设置</h3>
                </div>
                <div className="flex-1 flex items-center justify-center text-gray-500">
                    <p>未找到设备配置</p>
                </div>
            </div>
        );
    }

    const capabilities = Object.entries(config.capabilities)
        .filter(([key]) => !['通讯范围', '能源类型'].includes(key))
        .map(([key, value]) => ({ key, value }));

    return (
        <div className="flex flex-col h-full">
            <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-700/50">
                <button onClick={onBack} className="text-gray-400 hover:text-white transition-colors">←</button>
                <h3 className="font-semibold text-white">设置</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <div className="rounded-lg border border-gray-700/40 bg-gray-800/30 p-4">
                    <h4 className="text-sm font-semibold text-wuxia-gold/80 mb-3">设备信息</h4>
                    <dl className="space-y-2 text-xs">
                        <div className="flex justify-between">
                            <dt className="text-gray-400">名称</dt>
                            <dd className="text-white">{config.deviceName}</dd>
                        </div>
                        <div className="flex justify-between">
                            <dt className="text-gray-400">形态</dt>
                            <dd className="text-white">{config.deviceForm}</dd>
                        </div>
                        <div className="flex justify-between">
                            <dt className="text-gray-400">UI 风格</dt>
                            <dd className="text-white">{config.uiStyle}</dd>
                        </div>
                    </dl>
                </div>

                <div className="rounded-lg border border-gray-700/40 bg-gray-800/30 p-4">
                    <h4 className="text-sm font-semibold text-wuxia-gold/80 mb-3">设备能力</h4>
                    <dl className="space-y-2 text-xs">
                        <div className="flex justify-between">
                            <dt className="text-gray-400">通讯范围</dt>
                            <dd className="text-white">{config.capabilities.通讯范围}</dd>
                        </div>
                        <div className="flex justify-between">
                            <dt className="text-gray-400">能源类型</dt>
                            <dd className="text-white">{config.capabilities.能源类型}</dd>
                        </div>
                        {capabilities.map(({ key, value }) => (
                            <div key={key} className="flex justify-between">
                                <dt className="text-gray-400">{key}</dt>
                                <dd className={typeof value === 'boolean' ? (value ? 'text-green-400' : 'text-red-400') : 'text-white'}>
                                    {typeof value === 'boolean' ? (value ? '已支持' : '不支持') : String(value)}
                                </dd>
                            </div>
                        ))}
                    </dl>
                </div>

                <div className="rounded-lg border border-gray-700/40 bg-gray-800/30 p-4">
                    <h4 className="text-sm font-semibold text-wuxia-gold/80 mb-3">模式信息</h4>
                    <dl className="space-y-2 text-xs">
                        <div className="flex justify-between">
                            <dt className="text-gray-400">当前模式</dt>
                            <dd className={isLiMode ? 'text-purple-400' : 'text-green-400'}>
                                {isLiMode ? '里模式' : '表模式'}
                            </dd>
                        </div>
                        {isLiMode && themeColor && (
                            <div className="flex justify-between items-center">
                                <dt className="text-gray-400">主题色</dt>
                                <dd className="flex items-center gap-2">
                                    <span className="w-4 h-4 rounded-full border border-gray-600" style={{ backgroundColor: themeColor }}></span>
                                    <span className="text-white font-mono text-[10px]">{themeColor}</span>
                                </dd>
                            </div>
                        )}
                    </dl>
                </div>
            </div>
        </div>
    );
};

export default SettingsPanel;
