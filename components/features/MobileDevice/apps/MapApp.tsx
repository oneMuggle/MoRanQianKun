import React, { useMemo } from 'react';
import { DeviceMode, MobileApp, DeviceGameContext } from '../../../../models/mobileDevice';
import { getDeviceConfig, getAppName } from '../../../../models/eraDevice';

interface AppProps {
    eraId: string;
    mode: DeviceMode;
    appId: MobileApp;
    onBack: () => void;
    gameContext?: DeviceGameContext;
}

interface LocationItem {
    id: string;
    name: string;
    type: string;
    icon: string;
    description: string;
    distance?: string;
}

const typeIconMap: Record<string, string> = {
    '城池': '🏯',
    '门派': '🏛️',
    '山': '⛰️',
    '客栈': '🍶',
    '村': '🏘️',
    '寺': '🛕',
    '观': '🏚️',
    '湖': '🌊',
    '关': '🚪',
};

function inferLocationType(归属: { 大地点: string; 中地点: string; 小地点: string }): string {
    const all = `${归属.大地点}${归属.中地点}${归属.小地点}`;
    if (all.includes('山')) return '名山大川';
    if (all.includes('城') || all.includes('都') || all.includes('京')) return '城池';
    if (all.includes('寺') || all.includes('观') || all.includes('庙') || all.includes('庵')) return '门派道观';
    if (all.includes('客栈') || all.includes('酒') || all.includes('茶')) return '客栈酒肆';
    if (all.includes('村') || all.includes('镇') || all.includes('庄')) return '村镇';
    if (all.includes('关') || all.includes('隘')) return '关隘';
    if (all.includes('湖') || all.includes('江') || all.includes('河')) return '水域';
    return '地点';
}

function pickIcon(type: string): string {
    for (const [key, icon] of Object.entries(typeIconMap)) {
        if (type.includes(key)) return icon;
    }
    return '📍';
}

const MapApp: React.FC<AppProps> = ({ eraId, mode, appId, onBack, gameContext }) => {
    const config = getDeviceConfig(eraId);
    const appName = config ? getAppName(config, appId, mode) : '地图';
    const hasGPS = config?.capabilities.hasGPS;

    const locations: LocationItem[] = useMemo(() => {
        const result: LocationItem[] = [];
        if (gameContext?.世界?.地图) {
            for (const map of gameContext.世界.地图) {
                const type = inferLocationType(map.归属);
                result.push({
                    id: `map-${map.名称}`,
                    name: map.名称,
                    type,
                    icon: pickIcon(type),
                    description: map.描述 || '',
                });
            }
        }
        // 活跃NPC 作为特殊标记点
        if (gameContext?.世界?.活跃NPC列表) {
            for (const npc of gameContext.世界.活跃NPC列表) {
                result.push({
                    id: `npc-${npc.姓名}-${npc.当前位置}`,
                    name: `${npc.姓名}`,
                    type: `活跃NPC · ${npc.当前状态}`,
                    icon: '🧑',
                    description: `${npc.当前行动}\n所在位置：${npc.当前位置}`,
                });
            }
        }
        return result;
    }, [gameContext?.世界]);

    // Simple ASCII-style directional map display
    const directionMap = `
        北
        ↑
    西 ← · → 东
        ↓
        南
    `.trim();

    const charPos = gameContext?.角色;
    const currentLocation = charPos?.当前坐标X != null && charPos?.当前坐标Y != null
        ? `(${charPos.当前坐标X}, ${charPos.当前坐标Y})`
        : '未知';

    return (
        <div className="flex flex-col h-full">
            <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-700/50">
                <button onClick={onBack} className="text-gray-400 hover:text-white transition-colors">←</button>
                <h3 className="font-semibold text-white">{appName}</h3>
                {hasGPS && (
                    <span className="ml-auto text-[10px] text-green-400 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
                        定位中
                    </span>
                )}
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Directional compass */}
                <div className="rounded-lg border border-gray-700/40 bg-gray-800/30 p-4">
                    <h4 className="text-xs font-semibold text-wuxia-gold/80 mb-2 text-center">方位</h4>
                    <div className="flex items-center justify-center">
                        <pre className="text-sm text-gray-300 font-mono whitespace-pre text-center leading-relaxed">
                            {directionMap}
                        </pre>
                    </div>
                    <p className="text-[10px] text-gray-500 text-center mt-2">当前位置：{currentLocation}</p>
                </div>

                {/* Nearby locations */}
                <div>
                    <h4 className="text-xs font-semibold text-wuxia-gold/80 mb-2">附近位置 ({locations.length})</h4>
                    {locations.length > 0 ? (
                        <ul className="space-y-2">
                            {locations.map((loc) => (
                                <li key={loc.id} className="rounded-lg border border-gray-700/30 bg-gray-800/40 p-3 hover:border-wuxia-gold/30 transition-colors cursor-pointer">
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 rounded-full bg-wuxia-gold/10 border border-wuxia-gold/20 flex items-center justify-center text-base flex-shrink-0">
                                            {loc.icon}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-white font-medium">{loc.name}</span>
                                            </div>
                                            <span className="text-[10px] text-gray-500 bg-gray-700/40 px-1.5 py-0.5 rounded mt-0.5 inline-block">{loc.type}</span>
                                            {loc.description && (
                                                <p className="text-xs text-gray-400 mt-1 line-clamp-2">{loc.description}</p>
                                            )}
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                            <span className="text-4xl text-gray-600 mb-3">🗺️</span>
                            <p className="text-sm text-gray-400">暂无地图数据</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MapApp;
