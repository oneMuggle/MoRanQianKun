// 房源管理 App — 房源信息、客户跟进

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

const PropertyApp: React.FC<AppProps> = ({ eraId, mode, onBack }) => {
    const config = getDeviceConfig(eraId);
    const appName = getAppName(config, 'property', mode);
    const [activeTab, setActiveTab] = useState<'房源' | '客户'>('房源');

    const properties = [
        { title: '朝阳区两居室', area: '85㎡', price: '6500/月', tags: ['近地铁', '精装'] },
        { title: '海淀区一居室', area: '45㎡', price: '4200/月', tags: ['学区房'] },
        { title: '通州区三居室', area: '120㎡', price: '5800/月', tags: ['新盘', '大阳台'] },
    ];

    const clients = [
        { name: '刘先生', budget: '5000-7000', need: '两居近地铁', status: '带看中' },
        { name: '陈女士', budget: '3000-4500', need: '一居', status: '已签约' },
    ];

    return (
        <div className="flex flex-col h-full bg-gray-900 text-white">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700/50">
                <button onClick={onBack} className="text-blue-400 text-sm">返回</button>
                <h2 className="text-lg font-semibold">{appName}</h2>
                <div className="w-8" />
            </div>

            <div className="flex border-b border-gray-700/50">
                {(['房源', '客户'] as const).map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === tab ? 'text-green-400 border-b-2 border-green-400' : 'text-gray-400'}`}>
                        {tab}
                    </button>
                ))}
            </div>

            <div className="flex-1 overflow-y-auto">
                {activeTab === '房源' && (
                    <div className="p-3 space-y-3">
                        {properties.map((p, i) => (
                            <div key={i} className="rounded-xl border border-gray-700/50 overflow-hidden">
                                <div className="h-24 bg-gray-800 flex items-center justify-center text-3xl">🏠</div>
                                <div className="p-3">
                                    <p className="text-sm font-medium">{p.title}</p>
                                    <p className="text-xs text-gray-400 mt-1">{p.area} · {p.price}</p>
                                    <div className="flex gap-2 mt-2">
                                        {p.tags.map(tag => (
                                            <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-green-500/20 text-green-400">{tag}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === '客户' && (
                    <div className="p-3 space-y-2">
                        {clients.map((c, i) => (
                            <div key={i} className="rounded-xl border border-gray-700/50 p-3">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-sm font-medium">{c.name}</span>
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                                        c.status === '已签约' ? 'bg-green-500/20 text-green-400' : 'bg-orange-500/20 text-orange-400'
                                    }`}>{c.status}</span>
                                </div>
                                <p className="text-xs text-gray-400">预算: {c.budget}</p>
                                <p className="text-xs text-gray-400">需求: {c.need}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PropertyApp;
