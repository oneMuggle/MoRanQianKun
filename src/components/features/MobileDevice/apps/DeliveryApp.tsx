// 配送端 App — 抢单、路线、配送记录、收入统计

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

interface DeliveryOrder {
    id: string;
    restaurant: string;
    address: string;
    fee: string;
    eta: string;
    status: '待抢' | '取餐中' | '配送中' | '已完成';
}

const DeliveryApp: React.FC<AppProps> = ({ eraId, mode, onBack }) => {
    const config = getDeviceConfig(eraId);
    const appName = getAppName(config, 'delivery', mode);
    const [activeTab, setActiveTab] = useState<'订单' | '路线' | '收入'>('订单');

    const orders: DeliveryOrder[] = [
        { id: 'D001', restaurant: '麦当劳（王府井店）', address: '东城区金鱼胡同15号 3号楼 1202', fee: '¥6.50', eta: '25分钟', status: '待抢' },
        { id: 'D002', restaurant: '星巴克（国贸店）', address: '朝阳区建国门外大街1号 28层', fee: '¥8.00', eta: '18分钟', status: '取餐中' },
    ];

    const todayStats = { delivered: 15, earned: '¥128.50', km: '32.6km' };

    return (
        <div className="flex flex-col h-full bg-gray-900 text-white">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700/50">
                <button onClick={onBack} className="text-blue-400 text-sm">返回</button>
                <h2 className="text-lg font-semibold">{appName}</h2>
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                    <span className="text-xs text-blue-400">接单中</span>
                </div>
            </div>

            <div className="flex border-b border-gray-700/50">
                {(['订单', '路线', '收入'] as const).map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`flex-1 py-3 text-sm font-medium transition-colors ${
                            activeTab === tab ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400'
                        }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            <div className="flex-1 overflow-y-auto">
                {activeTab === '订单' && (
                    <div className="p-3 space-y-3">
                        {orders.map(order => (
                            <div key={order.id} className="rounded-xl border border-gray-700/50 p-4">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="font-medium text-sm">{order.restaurant}</span>
                                    <span className="text-base font-bold text-blue-400">{order.fee}</span>
                                </div>
                                <p className="text-xs text-gray-400 mb-2">📍 {order.address}</p>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-gray-500">预计 {order.eta}</span>
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                                        order.status === '待抢' ? 'bg-yellow-500/20 text-yellow-400' :
                                        order.status === '取餐中' ? 'bg-blue-500/20 text-blue-400' :
                                        order.status === '配送中' ? 'bg-purple-500/20 text-purple-400' :
                                        'bg-gray-500/20 text-gray-400'
                                    }`}>{order.status}</span>
                                </div>
                                {order.status === '待抢' && (
                                    <button className="w-full mt-3 py-2 rounded-lg bg-blue-500 text-sm font-medium hover:bg-blue-400 transition-colors">
                                        抢单
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === '路线' && (
                    <div className="flex-1 flex items-center justify-center text-center text-gray-500">
                        <div>
                            <span className="text-5xl block mb-4">🗺️</span>
                            <p className="text-sm">导航功能（待接入地图）</p>
                        </div>
                    </div>
                )}

                {activeTab === '收入' && (
                    <div className="p-4 space-y-4">
                        <div className="rounded-xl bg-gradient-to-r from-blue-900/40 to-cyan-900/40 p-4 border border-blue-700/30">
                            <p className="text-sm text-gray-400">今日配送</p>
                            <p className="text-3xl font-bold text-blue-400 mt-1">{todayStats.earned}</p>
                            <div className="flex justify-between mt-3 text-xs text-gray-500">
                                <span>完成 {todayStats.delivered} 单</span>
                                <span>骑行 {todayStats.km}</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DeliveryApp;
