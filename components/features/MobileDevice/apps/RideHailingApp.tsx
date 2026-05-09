// 司机端 App — 订单列表、导航、收入统计

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

interface OrderItem {
    id: string;
    pickup: string;
    destination: string;
    distance: string;
    fare: string;
    status: '待接' | '进行中' | '已完成';
}

const RideHailingApp: React.FC<AppProps> = ({ eraId, mode, onBack }) => {
    const config = getDeviceConfig(eraId);
    const appName = getAppName(config, 'ride_hailing', mode);
    const [activeTab, setActiveTab] = useState<'接单' | '收入' | '统计'>('接单');

    // 示例订单（后续由 AI 剧情驱动）
    const orders: OrderItem[] = [
        { id: '1', pickup: '朝阳区建国路88号', destination: '海淀区中关村大街15号', distance: '12.5km', fare: '¥38.50', status: '待接' },
        { id: '2', pickup: '西城区金融街7号', destination: '东城区王府井大街', distance: '5.2km', fare: '¥18.00', status: '进行中' },
    ];

    const todayIncome = { completed: 8, total: '¥256.80', online: '4h32m' };

    return (
        <div className="flex flex-col h-full bg-gray-900 text-white">
            {/* 顶部导航 */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700/50">
                <button onClick={onBack} className="text-blue-400 text-sm">返回</button>
                <h2 className="text-lg font-semibold">{appName}</h2>
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-xs text-green-400">在线</span>
                </div>
            </div>

            {/* Tab 切换 */}
            <div className="flex border-b border-gray-700/50">
                {(['接单', '收入', '统计'] as const).map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`flex-1 py-3 text-sm font-medium transition-colors ${
                            activeTab === tab
                                ? 'text-orange-400 border-b-2 border-orange-400'
                                : 'text-gray-400'
                        }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* 内容区 */}
            <div className="flex-1 overflow-y-auto">
                {activeTab === '接单' && (
                    <div className="p-3 space-y-3">
                        {orders.map(order => (
                            <div key={order.id} className="rounded-xl border border-gray-700/50 p-4">
                                <div className="flex justify-between items-center mb-3">
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                                        order.status === '待接' ? 'bg-green-500/20 text-green-400' :
                                        order.status === '进行中' ? 'bg-blue-500/20 text-blue-400' :
                                        'bg-gray-500/20 text-gray-400'
                                    }`}>{order.status}</span>
                                    <span className="text-lg font-bold text-green-400">{order.fare}</span>
                                </div>
                                <div className="space-y-2 text-sm">
                                    <div className="flex items-start gap-2">
                                        <span className="text-green-400 mt-0.5">●</span>
                                        <div>
                                            <p className="text-gray-400 text-xs">起点</p>
                                            <p>{order.pickup}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <span className="text-red-400 mt-0.5">●</span>
                                        <div>
                                            <p className="text-gray-400 text-xs">终点</p>
                                            <p>{order.destination}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-700/30">
                                    <span className="text-xs text-gray-500">{order.distance}</span>
                                    {order.status === '待接' && (
                                        <button className="px-4 py-1.5 rounded-full bg-orange-500 text-sm font-medium hover:bg-orange-400 transition-colors">
                                            接单
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === '收入' && (
                    <div className="p-4 space-y-4">
                        <div className="rounded-xl bg-gradient-to-r from-green-900/40 to-emerald-900/40 p-4 border border-green-700/30">
                            <p className="text-sm text-gray-400">今日收入</p>
                            <p className="text-3xl font-bold text-green-400 mt-1">{todayIncome.total}</p>
                            <div className="flex justify-between mt-3 text-xs text-gray-500">
                                <span>完成 {todayIncome.completed} 单</span>
                                <span>在线 {todayIncome.online}</span>
                            </div>
                        </div>
                        <div className="text-center text-gray-500 text-sm mt-8">
                            <p>暂无更多收入记录</p>
                        </div>
                    </div>
                )}

                {activeTab === '统计' && (
                    <div className="p-4 text-center text-gray-500 text-sm">
                        <span className="text-4xl block mb-4">📊</span>
                        <p>统计功能开发中</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RideHailingApp;
