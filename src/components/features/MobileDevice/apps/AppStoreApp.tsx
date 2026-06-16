// 应用市场 App — 分类浏览、搜索、下载管理

import React, { useState, useMemo } from 'react';
import { DeviceMode, MobileApp, DeviceGameContext } from '../../../../models/mobileDevice';
import { getDeviceConfig } from '../../../../models/eraDevice';
import { allAppDefinitions, AppCategory, NsfwLevel } from '../../../../models/appRegistry';
import type { AppInstallState } from '../../../../models/installedApps';
import { isInstalled } from '../../../../models/installedApps';
import { isAppDownloadable } from '../../../../models/nsfwApps';

interface AppProps {
    eraId: string;
    mode: DeviceMode;
    appId: MobileApp;
    onBack: () => void;
    gameContext?: DeviceGameContext;
    installedApps?: AppInstallState;
    nsfwEnabled?: boolean;
    onInstall?: (appId: string) => void;
    onUninstall?: (appId: string) => void;
}

const categoryLabels: { key: AppCategory | 'all'; label: string; icon: string }[] = [
    { key: 'all', label: '全部', icon: '🏪' },
    { key: 'universal', label: '通用', icon: '📱' },
    { key: 'background', label: '工作', icon: '💼' },
    { key: 'optional', label: '生活', icon: '🎮' },
    { key: 'nsfw', label: '成人', icon: '🔞' },
];

const AppStoreApp: React.FC<AppProps> = ({ eraId, mode, onBack, installedApps, nsfwEnabled, onInstall, onUninstall }) => {
    void getDeviceConfig(eraId); // eraId used for future localization
    const [activeCategory, setActiveCategory] = useState<AppCategory | 'all'>('all');
    const [searchQuery, setSearchQuery] = useState('');

    const availableApps = useMemo(() => {
        return allAppDefinitions.filter(app => {
            if (!isAppDownloadable(app, nsfwEnabled ?? false)) return false;
            if (activeCategory !== 'all' && app.category !== activeCategory) return false;
            if (searchQuery && !app.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
            return true;
        });
    }, [activeCategory, searchQuery, nsfwEnabled]);

    return (
        <div className="flex flex-col h-full bg-gray-900 text-white">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700/50">
                <button onClick={onBack} className="text-blue-400 text-sm">返回</button>
                <h2 className="text-lg font-semibold">应用市场</h2>
                <div className="w-8" />
            </div>

            {/* 搜索栏 */}
            <div className="px-4 py-2">
                <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="搜索应用..."
                    className="w-full bg-gray-800 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-blue-400 placeholder-gray-500"
                />
            </div>

            {/* 分类标签 */}
            <div className="flex gap-2 px-4 py-2 overflow-x-auto">
                {categoryLabels.map(cat => (
                    <button
                        key={cat.key}
                        onClick={() => setActiveCategory(cat.key)}
                        className={`px-3 py-1 rounded-full text-xs whitespace-nowrap transition-colors ${
                            activeCategory === cat.key ? 'bg-blue-500 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                        }`}
                    >
                        {cat.icon} {cat.label}
                    </button>
                ))}
            </div>

            {/* App 列表 */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {availableApps.map(app => {
                    const installed = installedApps ? isInstalled(installedApps, app.id) : false;
                    const isSystem = app.isSystem ?? false;

                    return (
                        <div key={app.id} className="rounded-xl border border-gray-700/50 p-3 flex items-center gap-3">
                            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0" style={{ background: `${app.color}30` }}>
                                {app.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <p className="text-sm font-medium truncate">{app.name}</p>
                                    {app.nsfwLevel && app.nsfwLevel > NsfwLevel.Clean && (
                                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/20 text-red-400">18+</span>
                                    )}
                                    {isSystem && (
                                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-500/20 text-gray-400">系统</span>
                                    )}
                                </div>
                                <p className="text-xs text-gray-500 truncate">{app.description}</p>
                                <p className="text-[10px] text-gray-600">v{app.version}</p>
                            </div>
                            <div className="flex-shrink-0">
                                {installed ? (
                                    isSystem ? (
                                        <span className="text-xs text-gray-500 px-3 py-1">内置</span>
                                    ) : (
                                        <button onClick={() => onUninstall?.(app.id)} className="text-xs text-red-400 px-3 py-1 rounded-full border border-red-400/30 hover:bg-red-500/10 transition-colors">卸载</button>
                                    )
                                ) : (
                                    <button onClick={() => onInstall?.(app.id)} className="text-xs text-blue-400 px-3 py-1 rounded-full border border-blue-400/30 hover:bg-blue-500/10 transition-colors">获取</button>
                                )}
                            </div>
                        </div>
                    );
                })}

                {availableApps.length === 0 && (
                    <div className="text-center text-gray-500 text-sm mt-20">
                        <span className="text-4xl block mb-4">🔍</span><p>没有找到相关应用</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AppStoreApp;
