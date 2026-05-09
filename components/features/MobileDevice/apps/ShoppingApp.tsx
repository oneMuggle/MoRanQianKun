// 购物 App — 商品列表、详情、购物车、订单

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

const ShoppingApp: React.FC<AppProps> = ({ eraId, mode, onBack }) => {
    const config = getDeviceConfig(eraId);
    const appName = getAppName(config, 'shopping', mode);
    const [activeTab, setActiveTab] = useState<'商品' | '购物车' | '订单'>('商品');

    const products = [
        { id: '1', name: '无线蓝牙耳机', price: '¥199', icon: '🎧', sold: 1200 },
        { id: '2', name: '智能手环', price: '¥299', icon: '⌚', sold: 856 },
        { id: '3', name: '便携充电宝', price: '¥89', icon: '🔋', sold: 2340 },
        { id: '4', name: '机械键盘', price: '¥399', icon: '⌨️', sold: 567 },
    ];

    const cartItems = [
        { name: '无线蓝牙耳机', qty: 1, price: '¥199' },
    ];

    return (
        <div className="flex flex-col h-full bg-gray-900 text-white">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700/50">
                <button onClick={onBack} className="text-blue-400 text-sm">返回</button>
                <h2 className="text-lg font-semibold">{appName}</h2>
                <button className="text-sm text-gray-400">🔍</button>
            </div>

            <div className="flex border-b border-gray-700/50">
                {(['商品', '购物车', '订单'] as const).map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === tab ? 'text-pink-400 border-b-2 border-pink-400' : 'text-gray-400'}`}>
                        {tab}
                    </button>
                ))}
            </div>

            <div className="flex-1 overflow-y-auto">
                {activeTab === '商品' && (
                    <div className="p-3 grid grid-cols-2 gap-3">
                        {products.map(p => (
                            <div key={p.id} className="rounded-xl border border-gray-700/50 p-3">
                                <div className="h-20 bg-gray-800 rounded-lg flex items-center justify-center text-3xl mb-2">{p.icon}</div>
                                <p className="text-sm font-medium truncate">{p.name}</p>
                                <div className="flex items-center justify-between mt-1">
                                    <span className="text-pink-400 font-bold">{p.price}</span>
                                    <span className="text-[10px] text-gray-500">已售 {p.sold}</span>
                                </div>
                                <button className="w-full mt-2 py-1 rounded-full bg-pink-500/20 text-pink-400 text-xs hover:bg-pink-500/30 transition-colors">加入购物车</button>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === '购物车' && (
                    <div className="p-4">
                        {cartItems.length > 0 ? (
                            <>
                                <div className="space-y-3">
                                    {cartItems.map((item, i) => (
                                        <div key={i} className="flex items-center justify-between py-2 border-b border-gray-800">
                                            <div><p className="text-sm">{item.name}</p><p className="text-xs text-gray-500">x{item.qty}</p></div>
                                            <span className="text-pink-400 font-medium">{item.price}</span>
                                        </div>
                                    ))}
                                </div>
                                <button className="w-full mt-6 py-3 rounded-xl bg-pink-500 text-sm font-medium hover:bg-pink-400 transition-colors">结算</button>
                            </>
                        ) : (
                            <div className="text-center text-gray-500 text-sm mt-20">
                                <span className="text-4xl block mb-4">🛒</span><p>购物车为空</p>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === '订单' && (
                    <div className="p-8 text-center text-gray-500 text-sm">
                        <span className="text-4xl block mb-4">📦</span><p>暂无订单记录</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ShoppingApp;
