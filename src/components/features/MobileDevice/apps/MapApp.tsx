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
    icon: React.ReactNode;
    description: string;
    distance?: string;
}

const typeIconMap: Record<string, { label: string; icon: React.ReactNode }> = {
    '城池': { label: '城池', icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2 22V6a2 2 0 012-2h4l2 2h8l2-2h4v18H2zm4-8h4v4H6v-4zm8-4h4v4h-4V10z" /></svg> },
    '门派': { label: '门派', icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 2L2 7v15h20V7L12 2zm0 3l7 3.5V20H5V8.5L12 5z" /><path strokeLinecap="round" strokeLinejoin="round" d="M9 22v-6h6v6" /></svg> },
    '山': { label: '名山', icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8 21l4-10 4 10M3 21l3-7 2 3m6-3l3-7 2 7" /></svg> },
    '客栈': { label: '客栈', icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 21v-5a1 1 0 00-1-1h-5a1 1 0 00-1 1v5H5v-4a1 1 0 00-.5-.87L3 18V4l9-2 9 2v14l-1.5-2.13A1 1 0 0019 14v3h-4z" /></svg> },
    '村': { label: '村镇', icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-4h6v4" /></svg> },
    '寺': { label: '寺庙', icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 2v4m0 0a8 8 0 008 8H4a8 8 0 008-8z" /><path strokeLinecap="round" strokeLinejoin="round" d="M6 21h12M8 17h8" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v11" /></svg> },
    '观': { label: '道观', icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 2v6m-2 0h4M4 21l8-13 8 13H4z" /></svg> },
    '湖': { label: '水域', icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2 12c2-2 4-2 6 0s4 2 6 0 4-2 6 0M2 17c2-2 4-2 6 0s4 2 6 0 4-2 6 0" /></svg> },
    '关': { label: '关隘', icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4 21V7l8-4 8 4v14M8 21v-6h8v6" /></svg> },
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

function pickIcon(type: string): React.ReactNode {
    for (const [, value] of Object.entries(typeIconMap)) {
        if (type.includes(value.label)) return value.icon;
    }
    return <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" /></svg>;
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
                    icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
                    description: `${npc.当前行动}\n所在位置：${npc.当前位置}`,
                });
            }
        }
        return result;
    }, [gameContext?.世界]);

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
                                        <div className="w-8 h-8 rounded-full bg-wuxia-gold/10 border border-wuxia-gold/20 flex items-center justify-center text-wuxia-gold flex-shrink-0">
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
                            <svg className="w-10 h-10 text-gray-600 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>
                            <p className="text-sm text-gray-400">暂无地图数据</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MapApp;
