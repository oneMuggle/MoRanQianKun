// 记账本 App — 收支记录、库存管理

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

const LedgerApp: React.FC<AppProps> = ({ eraId, mode, onBack }) => {
    const config = getDeviceConfig(eraId);
    const appName = getAppName(config, 'ledger', mode);
    const [activeTab, setActiveTab] = useState<'收支' | '库存'>('收支');

    const records = [
        { type: '收入', desc: '今日营业额', amount: '+¥856.00', time: '21:30' },
        { type: '支出', desc: '进货 - 饮料零食', amount: '-¥320.00', time: '14:00' },
        { type: '支出', desc: '摊位费', amount: '-¥50.00', time: '08:00' },
    ];

    const inventory = [
        { name: '可乐', stock: 24, unit: '瓶', low: false },
        { name: '方便面', stock: 3, unit: '箱', low: true },
        { name: '薯片', stock: 18, unit: '包', low: false },
    ];

    return (
        <div className="flex flex-col h-full bg-gray-900 text-white">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700/50">
                <button onClick={onBack} className="text-blue-400 text-sm">返回</button>
                <h2 className="text-lg font-semibold">{appName}</h2>
                <div className="w-8" />
            </div>

            <div className="flex border-b border-gray-700/50">
                {(['收支', '库存'] as const).map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === tab ? 'text-red-400 border-b-2 border-red-400' : 'text-gray-400'}`}>
                        {tab}
                    </button>
                ))}
            </div>

            <div className="flex-1 overflow-y-auto">
                {activeTab === '收支' && (
                    <div className="p-4 space-y-4">
                        <div className="rounded-xl bg-gradient-to-r from-green-900/40 to-gray-900/40 p-4 border border-green-700/30">
                            <p className="text-sm text-gray-400">今日净收入</p>
                            <p className="text-3xl font-bold text-green-400 mt-1">¥486.00</p>
                        </div>
                        <div className="space-y-2">
                            {records.map((r, i) => (
                                <div key={i} className="flex items-center justify-between py-2 border-b border-gray-800">
                                    <div>
                                        <p className="text-sm">{r.desc}</p>
                                        <p className="text-xs text-gray-500">{r.time}</p>
                                    </div>
                                    <span className={`font-medium ${r.type === '收入' ? 'text-green-400' : 'text-red-400'}`}>{r.amount}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === '库存' && (
                    <div className="p-4 space-y-2">
                        {inventory.map((item, i) => (
                            <div key={i} className="flex items-center justify-between py-2 border-b border-gray-800">
                                <div className="flex items-center gap-2">
                                    <span className={`w-2 h-2 rounded-full ${item.low ? 'bg-red-500' : 'bg-green-500'}`} />
                                    <span className="text-sm">{item.name}</span>
                                </div>
                                <span className={`text-sm ${item.low ? 'text-red-400' : ''}`}>{item.stock}{item.unit}{item.low && ' (不足)'}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default LedgerApp;
