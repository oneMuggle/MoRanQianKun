import React, { useMemo } from 'react';
import { DeviceMode, MobileApp, DeviceGameContext } from '../../../../models/mobileDevice';
import { getDeviceConfig, getAppName } from '../../../../models/eraDevice';
import type { 社团活动 } from '../../../../models/campusPhone';

interface AppProps {
    eraId: string;
    mode: DeviceMode;
    appId: MobileApp;
    onBack: () => void;
    gameContext?: DeviceGameContext;
}

const CampusClubApp: React.FC<AppProps> = ({ eraId, mode, appId, onBack, gameContext }) => {
    const config = getDeviceConfig(eraId);
    const appName = config ? getAppName(config, appId, mode) : '社团活动';

    const activities: 社团活动[] = useMemo(() => {
        const systemActivities = gameContext?.校园系统?.社团活动列表;
        if (systemActivities && systemActivities.length > 0) return systemActivities;
        return [];
    }, [gameContext?.校园系统?.社团活动列表]);

    return (
        <div className="flex flex-col h-full">
            <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-700/50">
                <button onClick={onBack} className="text-gray-400 hover:text-white transition-colors">&larr;</button>
                <h3 className="font-semibold text-white">{appName}</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
                {activities.length > 0 ? (
                    <div className="grid gap-3">
                        {activities.map(activity => (
                            <div key={activity.id} className="rounded-lg bg-gray-800/40 border border-gray-700/30 p-3 hover:bg-gray-800/60 transition-colors">
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex-1">
                                        <span className="text-[10px] text-purple-400/60 bg-purple-400/10 px-1.5 py-0.5 rounded">{activity.社团名称}</span>
                                        <h4 className="text-sm text-white font-medium mt-1">{activity.活动名称}</h4>
                                    </div>
                                    <span className="text-[10px] text-gray-500 ml-2">{activity.参与人数}人参与</span>
                                </div>
                                <p className="text-xs text-gray-400 mb-2">{activity.描述}</p>
                                <div className="flex items-center gap-4 text-[10px] text-gray-500">
                                    <span>时间：{activity.时间}</span>
                                    <span>地点：{activity.地点}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center p-8">
                        <span className="text-4xl text-gray-600 mb-3">&#127919;</span>
                        <p className="text-sm text-gray-400">暂无活动</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CampusClubApp;
