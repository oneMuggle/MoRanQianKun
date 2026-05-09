import React, { useState, useEffect, useMemo } from 'react';
import { getDeviceConfig, getAppName, getLiModeThemeColor } from '../../../models/eraDevice';
import { DeviceState, MobileApp, DeviceConfig, DeviceGameContext } from '../../../models/mobileDevice';
import { resolveEraNode } from '../../../models/eraTheme';
import type { 当前可用接口结构 } from '../../../utils/apiConfig';
import { getDockApps, findAppById } from '../../../models/appRegistry';
import type { AppInstallState } from '../../../models/installedApps';
import type { NsfwLevel } from '../../../models/appRegistry';
import { isAppVisible } from '../../../models/nsfwApps';

type ApiConfigLike = 当前可用接口结构 | Record<string, unknown>;
import MapApp from './apps/MapApp';
import ContactsApp from './apps/ContactsApp';
import NewsApp from './apps/NewsApp';
import AlbumApp from './apps/AlbumApp';
import ToolsApp from './apps/ToolsApp';
import CampusForumApp from './apps/CampusForumApp';
import CampusChatApp from './apps/CampusChatApp';
import CampusScheduleApp from './apps/CampusScheduleApp';
import CampusCardApp from './apps/CampusCardApp';
import CampusClubApp from './apps/CampusClubApp';
import CampusRulesApp from './apps/CampusRulesApp';
import CampusHypnosisApp from './apps/CampusHypnosisApp';
import BDSMRelationshipDashboard from './apps/BDSMRelationshipDashboard';
import BDSMTaskPanel from './apps/BDSMTaskPanel';
import BDSMContractPanel from './apps/BDSMContractPanel';
import BDSMSafetySettings from './apps/BDSMSafetySettings';
import PhoneStatusBar from './PhoneStatusBar';
import LockScreen from './LockScreen';
import PhoneApp from './apps/PhoneApp';
import SmsApp from './apps/SmsApp';
import CameraApp from './apps/CameraApp';
import SettingsApp from './apps/SettingsApp';
import WeatherApp from './apps/WeatherApp';
import RideHailingApp from './apps/RideHailingApp';
import DeliveryApp from './apps/DeliveryApp';
import AppointmentApp from './apps/AppointmentApp';
import LedgerApp from './apps/LedgerApp';
import WorkScheduleApp from './apps/WorkScheduleApp';
import PropertyApp from './apps/PropertyApp';
import ShoppingApp from './apps/ShoppingApp';
import SocialMediaApp from './apps/SocialMediaApp';
import AppStoreApp from './apps/AppStoreApp';
import DatingApp from './apps/DatingApp';
import AdultForumApp from './apps/AdultForumApp';
import NsfwGalleryApp from './apps/NsfwGalleryApp';
import LiveStreamApp from './apps/LiveStreamApp';

import type { 校规条目, 校规影响日志, 催眠记录, 催眠App等级 } from '../../../types';
import type { NPC结构 } from '../../../models/social';
import type { BDSM论坛帖子 } from '../../../models/campusNSFW/bdsm-forum';

interface AppProps {
    eraId: string;
    mode: DeviceState['mode'];
    appId: MobileApp;
    onBack: () => void;
    gameContext?: DeviceGameContext;
    // 校园系统回调（可选）
    onRulesChange?: (updater: (prev: { 校规列表: 校规条目[]; 影响日志: 校规影响日志[] }) => { 校规列表: 校规条目[]; 影响日志: 校规影响日志[] }) => void;
    onHypnosisChange?: (updater: (prev: { 催眠记录列表: 催眠记录[]; app等级: 催眠App等级; 累计使用次数: number }) => { 催眠记录列表: 催眠记录[]; app等级: 催眠App等级; 累计使用次数: number }) => void;
    onRefresh?: (board?: 'bdsn') => void;
    isRefreshing?: boolean;
    onSendMessage?: (npcId: string, npcName: string, content: string) => Promise<{ npcReply: string }>;
    onUnlockNPC?: (npc: NPC结构) => void;
    onBDSM帖子更新?: (帖子ID: string, updater: (post: BDSM论坛帖子) => BDSM论坛帖子) => void;
    onCreateChatSession?: (npcId: string, npcName: string, 关系标签: string, 初始消息: string) => void;
    onConfirmNegotiation?: (npcId: string, npcName: string, 协商结果: { 见面回合偏移: number; 见面地点: string; 安全词: string; 玩家底线: string[] }) => void;
    onBDSM保存安全设置?: (npcId: string, 安全词: string, 底线: string[]) => void;
    apiConfig?: ApiConfigLike;
    onInstallApp?: (appId: string) => void;
    onUninstallApp?: (appId: string) => void;
}

interface MobileHomeProps {
    eraId: string;
    deviceState: DeviceState;
    onAppClick: (app: MobileApp) => void;
    onReturnHome: () => void;
    onClose: () => void;
    gameContext?: DeviceGameContext;
    // 校园系统回调
    onRulesChange?: (updater: (prev: { 校规列表: 校规条目[]; 影响日志: 校规影响日志[] }) => { 校规列表: 校规条目[]; 影响日志: 校规影响日志[] }) => void;
    onHypnosisChange?: (updater: (prev: { 催眠记录列表: 催眠记录[]; app等级: 催眠App等级; 累计使用次数: number }) => { 催眠记录列表: 催眠记录[]; app等级: 催眠App等级; 累计使用次数: number }) => void;
    onRefresh?: (board?: 'bdsn') => void;
    isRefreshing?: boolean;
    onSendMessage?: (npcId: string, npcName: string, content: string) => Promise<{ npcReply: string }>;
    onUnlockNPC?: (npc: NPC结构) => void;
    onBDSM帖子更新?: (帖子ID: string, updater: (post: BDSM论坛帖子) => BDSM论坛帖子) => void;
    // BDSM 任务操作
    onBDSM任务操作?: (npcId: string, 操作: '接受' | '报告完成' | '放弃', 任务ID: string, 执行描述?: string) => void;
    onCreateChatSession?: (npcId: string, npcName: string, 关系标签: string, 初始消息: string) => void;
    onConfirmNegotiation?: (npcId: string, npcName: string, 协商结果: { 见面回合偏移: number; 见面地点: string; 安全词: string; 玩家底线: string[] }) => void;
    onBDSM保存安全设置?: (npcId: string, 安全词: string, 底线: string[]) => void;
    apiConfig?: ApiConfigLike;
    installedApps?: AppInstallState;
    nsfwEnabled?: boolean;
    maxNsfwLevel?: NsfwLevel;
    onInstallApp?: (appId: string) => void;
    onUninstallApp?: (appId: string) => void;
}

const appIcons: Record<MobileApp, string> = {
    map: '🗺️',
    contacts: '👥',
    chat: '💬',
    forum: '📋',
    news: '📰',
    album: '🖼️',
    tools: '🔧',
    schedule: '📅',
    campus_card: '💳',
    club: '🎯',
    confession: '💌',
    rules: '📜',
    hypnosis: '🌀',
    bdsn: '🌙',
    // 现代纪元
    phone: '📞',
    sms: '💬',
    camera: '📷',
    settings: '⚙️',
    weather: '🌤️',
    calendar: '📅',
    clock: '⏰',
    files: '📁',
    ride_hailing: '🚗',
    delivery: '🛵',
    appointment: '📋',
    ledger: '📒',
    work_schedule: '💼',
    property: '🏠',
    shopping: '🛒',
    social_media: '📱',
    music: '🎵',
    video: '🎬',
    fitness: '🏃',
    map_app: '🗺️',
    dating: '❤️',
    adult_forum: '🌙',
    nsfw_gallery: '🔒',
    live_stream: '📺',
    app_store: '🏪',
};

const MobileHome: React.FC<MobileHomeProps> = ({
    eraId,
    deviceState,
    onAppClick,
    onReturnHome,
    onClose: _onClose,
    gameContext,
    onRulesChange,
    onHypnosisChange,
    onRefresh,
    isRefreshing,
    onSendMessage,
    onUnlockNPC,
    onBDSM帖子更新,
    onBDSM任务操作,
    onCreateChatSession,
    onConfirmNegotiation,
    onBDSM保存安全设置,
    apiConfig,
    installedApps,
    nsfwEnabled = false,
    maxNsfwLevel = 0,
    onInstallApp,
    onUninstallApp,
}) => {
    const [config, setConfig] = useState<DeviceConfig | null>(null);
    const [liModeName, setLiModeName] = useState<string | undefined>();
    const [bdsmPanel, setBdsmPanel] = useState<'none' | '总览' | '任务' | '契约' | '安全设置'>('none');
    const [isLocked, setIsLocked] = useState(true);

    // 提至 Hook 区顶部（早于 config 空检查），避免条件渲染破坏 Hook 顺序
    const isLiMode = deviceState.mode === 'li';
    const themeColor = isLiMode ? getLiModeThemeColor(config, '#6B2D8B') : undefined;
    const isLockedState = isLocked;

    const visibleApps = useMemo(() => {
        if (!config) return [];
        if (!installedApps) return config.apps;
        const installedIds = new Set(installedApps.installedApps.map(i => i.appId));
        return config.apps.filter(app => {
            if (!installedIds.has(app)) return false;
            const appDef = findAppById(app);
            if (!appDef) return true;
            return isAppVisible(appDef, nsfwEnabled, maxNsfwLevel);
        });
    }, [config, installedApps, nsfwEnabled, maxNsfwLevel]);

    const dockApps = useMemo(() => {
        if (!config) return [];
        return getDockApps()
            .map(app => app.id as MobileApp)
            .filter(app => config.apps.includes(app));
    }, [config]);

    const wallpaperGradient = isLiMode
        ? `linear-gradient(135deg, ${themeColor}20 0%, #0a0a0a 60%, #1a0a2e 100%)`
        : 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)';

    // 检测是否有 BDSM 关系（用于快捷入口，预留）
    // const 有BDSM关系 = useMemo(() => {
    //     const 欲望系统 = gameContext?.校园系统?.欲望系统;
    //     if (!欲望系统?.NPC欲望档案) return false;
    //     return Object.values(欲望系统.NPC欲望档案).some((a: any) => a?.BDSM关系 && a.BDSM关系.阶段 !== '初识');
    // }, [gameContext?.校园系统?.欲望系统]);

    useEffect(() => {
        const resolved = resolveEraNode(eraId);
        if (resolved?.inherited.liMode) {
            setLiModeName(resolved.inherited.liMode.name);
        }
        const deviceConfig = getDeviceConfig(eraId);
        setConfig(deviceConfig);
    }, [eraId]);

    if (!config) {
        return (
            <div className="flex items-center justify-center h-full text-gray-400">
                <p>未找到对应时代的设备</p>
            </div>
        );
    }

    void liModeName;

    const renderActiveApp = () => {
        const appProps: AppProps = {
            eraId,
            mode: deviceState.mode,
            appId: deviceState.activeApp!,
            onBack: onReturnHome,
            gameContext,
            onRulesChange,
            onHypnosisChange,
            onRefresh,
            isRefreshing,
            onSendMessage,
            onUnlockNPC,
            onBDSM帖子更新,
            onCreateChatSession,
            onConfirmNegotiation,
            apiConfig,
        };
        switch (deviceState.activeApp) {
            case 'chat': return <CampusChatApp {...appProps} />;
            case 'map': return <MapApp {...appProps} />;
            case 'contacts': return <ContactsApp {...appProps} />;
            case 'forum': return <CampusForumApp {...appProps} />;
            case 'news': return <NewsApp {...appProps} />;
            case 'album': return <AlbumApp {...appProps} />;
            case 'tools': return <ToolsApp {...appProps} />;
            case 'schedule': return <CampusScheduleApp {...appProps} />;
            case 'campus_card': return <CampusCardApp {...appProps} />;
            case 'club': return <CampusClubApp {...appProps} />;
            case 'confession': return <CampusForumApp {...appProps} />;
            case 'rules': return <CampusRulesApp {...appProps} />;
            case 'hypnosis': return <CampusHypnosisApp {...appProps} />;
            case 'bdsn': return <CampusForumApp {...appProps} />;
            case 'phone': return <PhoneApp {...appProps} />;
            case 'sms': return <SmsApp {...appProps} />;
            case 'camera': return <CameraApp {...appProps} />;
            case 'settings': return <SettingsApp {...appProps} />;
            case 'weather': return <WeatherApp {...appProps} />;
            case 'ride_hailing': return <RideHailingApp {...appProps} />;
            case 'delivery': return <DeliveryApp {...appProps} />;
            case 'appointment': return <AppointmentApp {...appProps} />;
            case 'ledger': return <LedgerApp {...appProps} />;
            case 'work_schedule': return <WorkScheduleApp {...appProps} />;
            case 'property': return <PropertyApp {...appProps} />;
            case 'shopping': return <ShoppingApp {...appProps} />;
            case 'social_media': return <SocialMediaApp {...appProps} />;
            case 'app_store': return <AppStoreApp {...appProps} installedApps={installedApps} nsfwEnabled={nsfwEnabled} onInstall={onInstallApp} onUninstall={onUninstallApp} />;
            case 'dating': return <DatingApp {...appProps} />;
            case 'adult_forum': return <AdultForumApp {...appProps} />;
            case 'nsfw_gallery': return <NsfwGalleryApp {...appProps} />;
            case 'live_stream': return <LiveStreamApp {...appProps} />;
            default: return null;
        }
    };

    // BDSM 关系面板（作为子应用渲染）
    if (bdsmPanel !== 'none' && gameContext) {
        const 欲望系统 = gameContext.校园系统?.欲望系统;
        let 目标档案: any = null;
        let 目标NpcId: string | null = null;
        if (欲望系统?.NPC欲望档案) {
            for (const [k, v] of Object.entries(欲望系统.NPC欲望档案)) {
                if ((v as any)?.BDSM关系 && (v as any).BDSM关系.阶段 !== '初识') {
                    目标档案 = v;
                    目标NpcId = k;
                    break;
                }
            }
        }
        if (目标档案?.BDSM关系 && 目标NpcId) {
            const bRel = 目标档案.BDSM关系;
            const npcName = 目标档案._npcName || '未知';
            return (
                <div
                    className="flex flex-col h-full transition-colors duration-300"
                    data-device-mode={deviceState.mode}
                >
                    {bdsmPanel === '总览' && (
                        <BDSMRelationshipDashboard
                            关系状态={bRel}
                            npcName={npcName}
                            onGoToTasks={() => setBdsmPanel('任务')}
                            onGoToContract={() => setBdsmPanel('契约')}
                            onEditSafety={() => setBdsmPanel('安全设置')}
                        />
                    )}
                    {bdsmPanel === '任务' && (
                        <BDSMTaskPanel
                            关系状态={bRel}
                            日常指令={bRel.日常指令 || []}
                            onAcceptTask={(任务ID) => onBDSM任务操作?.(目标NpcId, '接受', 任务ID)}
                            onReportComplete={(任务ID, 执行描述) => onBDSM任务操作?.(目标NpcId, '报告完成', 任务ID, 执行描述)}
                            onAbandonTask={(任务ID) => onBDSM任务操作?.(目标NpcId, '放弃', 任务ID)}
                        />
                    )}
                    {bdsmPanel === '契约' && (
                        <BDSMContractPanel 关系状态={bRel} />
                    )}
                    {bdsmPanel === '安全设置' && (
                        <BDSMSafetySettings
                            关系状态={bRel}
                            npcName={npcName}
                            onSave={(安全词, 底线) => {
                                onBDSM保存安全设置?.(目标NpcId!, 安全词, 底线);
                                setBdsmPanel('总览');
                            }}
                            onCancel={() => setBdsmPanel('总览')}
                        />
                    )}
                </div>
            );
        }
    }

    const handleUnlock = () => setIsLocked(false);

    if (isLockedState) {
        return (
            <LockScreen
                onUnlock={handleUnlock}
                deviceMode={deviceState.mode}
                themeColor={themeColor}
                notifications={deviceState.notifications.slice(0, 3)}
            />
        );
    }

    return (
        <div
            className="flex flex-col h-full"
            data-device-mode={deviceState.mode}
            style={{ background: wallpaperGradient }}
        >
            {/* 状态栏 */}
            <PhoneStatusBar
                _eraId={eraId}
                deviceMode={deviceState.mode}
                themeColor={themeColor}
            />

            {/* 应用网格 */}
            <div className="flex-1 overflow-y-auto px-3 pt-4 pb-2">
                <div className="grid grid-cols-4 gap-y-5 gap-x-3">
                    {visibleApps.map((app) => {
                        const appDef = findAppById(app);
                        const appName = appDef
                            ? getAppName(config, app, deviceState.mode)
                            : getAppName(config, app, deviceState.mode);
                        const icon = appDef?.icon ?? appIcons[app] ?? '📱';
                        const appColor = appDef?.color;

                        return (
                            <button
                                key={app}
                                onClick={() => onAppClick(app)}
                                className="flex flex-col items-center gap-1 group"
                            >
                                <div
                                    className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl transition-transform group-hover:scale-105 group-active:scale-95"
                                    style={{
                                        background: appColor
                                            ? `linear-gradient(135deg, ${appColor}30, ${appColor}60)`
                                            : 'rgba(255,255,255,0.08)',
                                        boxShadow: appColor ? `0 2px 8px ${appColor}30` : undefined,
                                    }}
                                >
                                    {icon}
                                </div>
                                <span className="text-[10px] text-gray-300 text-center leading-tight line-clamp-2">
                                    {appName}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Dock 栏 */}
            {dockApps.length > 0 && (
                <div className="px-3 pb-1">
                    <div
                        className="rounded-2xl px-3 py-2 grid grid-cols-4 gap-3"
                        style={{ backgroundColor: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(20px)' }}
                    >
                        {dockApps.map((app) => {
                            const appDef = findAppById(app);
                            const icon = appDef?.icon ?? appIcons[app] ?? '📱';
                            return (
                                <button
                                    key={app}
                                    onClick={() => onAppClick(app)}
                                    className="flex items-center justify-center h-12 rounded-xl text-xl transition-transform hover:scale-105 active:scale-95"
                                    style={{
                                        background: appDef?.color
                                            ? `linear-gradient(135deg, ${appDef.color}40, ${appDef.color}70)`
                                            : 'rgba(255,255,255,0.06)',
                                    }}
                                >
                                    {icon}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Home Indicator */}
            <div className="flex justify-center pb-2">
                <div className="w-32 h-1 bg-white/20 rounded-full" />
            </div>

            {/* Active App overlay */}
            {deviceState.activeApp && (
                <div className="absolute inset-0 z-10 bg-black/90">
                    {renderActiveApp()}
                </div>
            )}
        </div>
    );
};

export default MobileHome;
