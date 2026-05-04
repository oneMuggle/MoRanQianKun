import React, { useMemo } from 'react';
import { DeviceMode, MobileApp, DeviceGameContext } from '../../../../models/mobileDevice';
import { getDeviceConfig, getAppName } from '../../../../models/eraDevice';
import type { 消费记录 } from '../../../../models/campusPhone';

interface AppProps {
    eraId: string;
    mode: DeviceMode;
    appId: MobileApp;
    onBack: () => void;
    gameContext?: DeviceGameContext;
}

const CampusCardApp: React.FC<AppProps> = ({ eraId, mode, appId, onBack, gameContext }) => {
    const config = getDeviceConfig(eraId);
    const appName = config ? getAppName(config, appId, mode) : '校园卡';

    const balance = useMemo(() => {
        const systemCard = gameContext?.校园系统?.校园卡;
        if (systemCard && typeof systemCard.余额 === 'number') return systemCard.余额;

        const 金钱 = gameContext?.角色?.金钱;
        if (!金钱) return 0;
        const 金元宝 = typeof 金钱.金元宝 === 'number' ? 金钱.金元宝 : 0;
        const 银子 = typeof 金钱.银子 === 'number' ? 金钱.银子 : 0;
        const 铜钱 = typeof 金钱.铜钱 === 'number' ? 金钱.铜钱 : 0;
        return 金元宝 + 银子 + 铜钱;
    }, [gameContext?.校园系统?.校园卡?.余额, gameContext?.角色?.金钱]);

    const records: 消费记录[] = useMemo(() => {
        const systemRecords = gameContext?.校园系统?.校园卡?.消费记录;
        if (systemRecords && systemRecords.length > 0) return systemRecords;
        return [];
    }, [gameContext?.校园系统?.校园卡?.消费记录]);

    return (
        <div className="flex flex-col h-full">
            <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-700/50">
                <button onClick={onBack} className="text-gray-400 hover:text-white transition-colors">&larr;</button>
                <h3 className="font-semibold text-white">{appName}</h3>
            </div>
            <div className="flex-1 overflow-y-auto">
                <div className="mx-4 mt-4 rounded-xl bg-gradient-to-br from-green-600 to-emerald-800 p-4 text-white shadow-lg">
                    <div className="text-xs text-green-200 mb-1">校园卡余额</div>
                    <div className="text-2xl font-bold mb-2">&yen; {balance.toFixed(2)}</div>
                    <div className="text-[10px] text-green-200/70">
                        {gameContext?.角色?.姓名 || '未命名'} &middot; 校园一卡通
                    </div>
                </div>
                <div className="px-4 mt-6">
                    <h4 className="text-xs font-semibold text-gray-400 mb-3">近期消费</h4>
                    {records.length > 0 ? (
                        <ul className="space-y-2">
                            {records.map((record, idx) => (
                                <li key={idx} className="flex items-center justify-between py-2 border-b border-gray-800/30">
                                    <div className="flex-1">
                                        <div className="text-sm text-white">{record.地点}</div>
                                        <div className="text-[10px] text-gray-500">{record.时间} &middot; {record.类型}</div>
                                    </div>
                                    <span className="text-sm text-red-400 font-medium">-&yen;{record.金额}</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-sm text-gray-500 text-center py-8">暂无消费记录</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CampusCardApp;
