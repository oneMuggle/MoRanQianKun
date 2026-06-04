import React, { Profiler } from 'react';
import LandingPage from './components/layout/LandingPage';
import { useGame } from './hooks/useGame';
import { useResponsive } from './hooks/useResponsive';
import { useConfirmSystem } from './hooks/useConfirmSystem';
import { MusicProvider } from './components/features/Music/MusicProvider';
import { 懒加载边界, NewGameWizard, MobileNewGameWizard } from './components/features/lazyComponents';
import { useAppModalState } from './components/app/useAppModalState';
import { useAppEffects } from './components/app/useAppEffects';
import { GameView } from './components/app/GameView';
import { ModalLayer } from './components/app/ModalLayer';
import { MemoryModals } from './components/app/MemoryModals';
import { ModalRenderer, useModalManager } from './core/module-registry';
import './core/module-registry/bootstrap'; // 激活所有模块注册
import { getModuleLoader, PromptRegistry } from './core/engine';
import FPSDisplay from './components/features/Performance/FPSDisplay';
import PerformanceDashboard from './components/features/Performance/PerformanceDashboard';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { ToastManager } from './components/ui/ToastManager';

const App: React.FC = () => {
    const { state, meta, setters, actions } = useGame();
    const { isMobile } = useResponsive();
    const { requestConfirm, ConfirmModal } = useConfirmSystem();
    const modalManager = useModalManager();

    // --- 新架构：模块加载器初始化 ---
    React.useEffect(() => {
        const loader = getModuleLoader();

        // 注册核心提示词到 PromptRegistry（异步加载 prompts/core-prompts，避免拉入 entry chunk）
        void (async () => {
            const { 核心提示词 } = await import('./prompts/core-prompts');
            const promptTexts = 核心提示词.map(p => p.内容).filter(Boolean);
            PromptRegistry.registerCoreMany(promptTexts);
        })();

        // 注入运行时上下文
        loader.setContext({
            getState: () => state,
            getMeta: () => meta,
            set: (key, value) => { /* 由 useGame 统一管理 */ },
            action: (name, ...args) => (actions as any)[name]?.(...args),
            modalManager: {
                open: (id, payload) => window.dispatchEvent(new CustomEvent('modal:open', { detail: { id, payload } })),
                close: (id) => modalManager.close(id),
                replace: (closeId, openId, payload) => window.dispatchEvent(new CustomEvent('modal:replace', { detail: { closeId, openId, payload } })),
                closeAll: () => window.dispatchEvent(new CustomEvent('modal:closeAll')),
                toggle: (id) => window.dispatchEvent(new CustomEvent('modal:toggle', { detail: { id } })),
                isOpen: (id) => modalManager.isOpen(id),
                openModals: modalManager.openModals,
            },
            subscribe: () => () => {}, // 后续接入
            emitEvent: (event, payload) => loader.emitEvent(event, payload),
            onEvent: (event, callback) => loader.onEvent(event, callback),
            isMobile: () => isMobile,
        });

        // 预加载核心时代模块（古代时代作为默认）
        if (state.currentEra) {
            void (async () => {
                const { eraModules } = await import('./modules');
                const mod = eraModules[state.currentEra];
                if (mod) {
                    const { manifest } = await mod();
                    loader.register(manifest);
                    await loader.activate(manifest.id);
                }
            })();
        }

        // 根据 gameConfig 激活 NSFW 模块（按 gameConfig 异步加载，单个失败不影响其它）
        void (async () => {
            const cfg: any = state.gameConfig;
            if (!cfg) return;
            const { nsfwModules } = await import('./modules');
            const nsfwFlags: Array<[string, boolean]> = [
                ['nsfw-campus',       !!cfg.校园NSFW设置?.启用校园NSFW深化系统],
                ['nsfw-bdsm',         !!cfg.BDSM系统设置?.启用BDSM独立系统],
                ['nsfw-board-game',   !!cfg.桌游社交NSFW设置?.启用桌游社交NSFW系统],
                ['nsfw-exposure',     !!cfg.校园NSFW设置?.启用露出系统],
                ['nsfw-photography',  !!cfg.写真NSFW设置?.启用写真NSFW系统],
                ['nsfw-urban-driver', !!cfg.都市网约车NSFW设置?.启用都市网约车NSFW系统],
                ['nsfw-bar',          !!cfg.酒吧NSFW设置?.启用酒吧NSFW系统],
            ];
            for (const [id, enabled] of nsfwFlags) {
                if (!enabled) continue;
                const loaderFn = nsfwModules[id];
                if (!loaderFn) continue;
                try {
                    const { manifest } = await loaderFn();
                    loader.register(manifest);
                    await loader.activate(manifest.id);
                } catch (err) {
                    console.warn(`[NSFW模块] ${id} 激活失败：`, err);
                }
            }
        })();

        // 根据 gameConfig 激活业务域模块
        if (state.gameConfig?.启用修炼体系) {
            void (async () => {
                const { businessModules } = await import('./modules');
                const mod = businessModules['biz-rpg-battle'];
                if (mod) {
                    const { manifest } = await mod();
                    loader.register(manifest);
                    await loader.activate(manifest.id);
                }
            })();
        }
    }, []); // 仅初始化一次

    // --- 性能面板快捷键 Ctrl+Shift+P ---
    const [showPerfDashboard, setShowPerfDashboard] = React.useState(false);
    React.useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.ctrlKey && e.shiftKey && e.key === 'P') {
                e.preventDefault();
                setShowPerfDashboard(prev => !prev);
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, []);

    // 监听新系统弹窗事件（由 ModalRenderer 的 modalManager 派发）
    // eslint-disable-next-line react-hooks/exhaustive-deps
    React.useEffect(() => {
        const handleOpen = (e: Event) => {
            const detail = (e as CustomEvent).detail as { id: string; payload?: unknown };
            modalManager.open(detail.id, detail.payload);
        };
        const handleClose = (e: Event) => {
            const detail = (e as CustomEvent).detail as { id: string };
            modalManager.close(detail.id);
        };
        const handleReplace = (e: Event) => {
            const detail = (e as CustomEvent).detail as { closeId: string; openId: string; payload?: unknown };
            modalManager.replace(detail.closeId, detail.openId, detail.payload);
        };
        const handleCloseAll = () => modalManager.closeAll();
        const handleToggle = (e: Event) => {
            const detail = (e as CustomEvent).detail as { id: string };
            modalManager.toggle(detail.id);
        };
        window.addEventListener('modal:open', handleOpen);
        window.addEventListener('modal:close', handleClose);
        window.addEventListener('modal:replace', handleReplace);
        window.addEventListener('modal:closeAll', handleCloseAll);
        window.addEventListener('modal:toggle', handleToggle);
        return () => {
            window.removeEventListener('modal:open', handleOpen);
            window.removeEventListener('modal:close', handleClose);
            window.removeEventListener('modal:replace', handleReplace);
            window.removeEventListener('modal:closeAll', handleCloseAll);
            window.removeEventListener('modal:toggle', handleToggle);
        };
    }, []); // modalManager 方法全部是 useCallback，引用稳定，无需依赖

    // --- activeMobileWindow (needed for useAppModalState deps) ---
    const activeMobileWindow = React.useMemo(() => {
        // We compute this based on state — will be refined once modalState is wired
        return null;
    }, [state.view, state.showBattle, state.showEquipment, state.showInventory, state.showSocial, state.showKungfu, state.showWorld, state.showMap, state.showTeam, state.showSect, state.showTask, state.showAgreement, state.showStory, state.showHeroinePlan, state.showMemory, state.showSaveLoad, state.showSettings]);

    const {
        showCharacter,
        showNovelDecompositionWorkbench,
        showMobileMusic,
        chatContentHidden, setChatContentHidden,
        sceneQuickGenHint, setSceneQuickGenHint,
        sceneQuickGenToastVisible, setSceneQuickGenToastVisible,
        contextSnapshot, setContextSnapshot,
        galgameModeEnabled, toggleGalgameMode,
        galgameImmersion, toggleGalgameImmersion,
        rpgModeEnabled, toggleRpgMode,
        modalOpeners,
    } = useAppModalState({
        setters,
        actions,
        apiConfig: state.apiConfig,
        启用修炼体系: state.gameConfig?.启用修炼体系 !== false,
        activeMobileWindow,
        requestConfirm,
    });

    const appEffects = useAppEffects({
        state,
        meta,
        actions,
        setters,
        isMobile,
        modalState: {
            chatContentHidden,
            setChatContentHidden,
            sceneQuickGenHint,
            setSceneQuickGenHint,
            sceneQuickGenToastVisible,
            setSceneQuickGenToastVisible,
            contextSnapshot,
            setContextSnapshot,
        },
    });

    // activeMobileWindow — 使用 modalManager 追踪
    const isOpen = React.useCallback((id: string) => modalManager.isOpen(id), [modalManager]);
    const activeMobileWindowResolved =
        showCharacter ? '角色' :
        isOpen('battle') ? '战斗' :
        isOpen('equipment') ? '装备' :
        isOpen('inventory') ? '背包' :
        isOpen('social') ? '社交' :
        (appEffects.启用修炼体系 && isOpen('kungfu')) ? '功法' :
        isOpen('world') ? '世界' :
        isOpen('map') ? '地图' :
        isOpen('team') ? '队伍' :
        isOpen('sect') ? '门派' :
        isOpen('task') ? '任务' :
        isOpen('agreement') ? '约定' :
        isOpen('story') ? '剧情' :
        isOpen('heroinePlan') ? '规划' :
        isOpen('memory') ? '记忆' :
        showNovelDecompositionWorkbench ? '小说分解' :
        isOpen('saveLoad') ? (modalManager.openModals.get('saveLoad') as { mode?: string } | undefined)?.mode === 'load' ? '读取' : '保存' :
        isOpen('settings') ? '设置' :
        showMobileMusic ? '音乐' :
        null;

    const {
        openCharacter, openSettings, openInventory, openEquipment,
        openBattle, openTeam, openSocial, openKungfu,
        openWorld, openMap, openSect, openTask,
        openAgreement, openStory, openHeroinePlan, openMemory,
        openSave, openLoad,
        closeMobileMusic,
        openWorldbookManager, openNovelDecompositionWorkbench,
        openCGGallery, openRelationGraph, openMapExplorer, handleMobileMenuClick, handleStartFromLanding,
    } = modalOpeners;

    const {
        tickerEvents,
        renderTickerItems,
        启用修炼体系,
        当前背景图片地址,
        玩家头像地址,
        fontFaceStyleText,
        uiTextStyleVars,
        hideBottomTicker,
        runtimeStateSections,
        currentOptions,
    } = appEffects;

    return (
        <ErrorBoundary>
        <MusicProvider visualConfig={state.visualConfig} onSaveVisual={actions.saveVisualSettings}>
            <div className="h-screen w-screen overflow-hidden bg-ink-black relative flex flex-col p-3 transition-colors duration-500" style={uiTextStyleVars}>
                {fontFaceStyleText && <style>{fontFaceStyleText}</style>}

                {/* View Switching */}
                {state.view === 'home' && (
                    <LandingPage
                        onStart={handleStartFromLanding}
                        onLoad={openLoad}
                        onImageManager={() => { modalManager.open('imageManager'); }}
                        onWorldbookManager={openWorldbookManager}
                        onNovelDecomposition={() => { void openNovelDecompositionWorkbench(); }}
                        onNovelWriting={() => { modalManager.open('novelWritingWorkbench'); }}
                        onSettings={openSettings}
                        hasSave={state.hasSave}
                    />
                )}

                {state.view === 'new_game' && (
                    <懒加载边界>
                        {isMobile ? (
                            <MobileNewGameWizard
                                onComplete={actions.handleGenerateWorld}
                                onCancel={() => { state.setView('home'); }}
                                onEraSelect={actions.handleEraChange}
                                loading={state.loading}
                                currentEra={state.currentEra}
                                requestConfirm={requestConfirm}
                            />
                        ) : (
                            <NewGameWizard
                                onComplete={actions.handleGenerateWorld}
                                onCancel={() => { state.setView('home'); }}
                                onEraSelect={actions.handleEraChange}
                                loading={state.loading}
                                currentEra={state.currentEra}
                                requestConfirm={requestConfirm}
                            />
                        )}
                    </懒加载边界>
                )}

                {state.view === 'game' && (
                    (() => {
                        const gameViewContent = (
                            <GameView
                                state={state}
                                meta={meta}
                                actions={actions}
                                isMobile={isMobile}
                                currentOptions={currentOptions}
                                当前背景图片地址={当前背景图片地址}
                                玩家头像地址={玩家头像地址}
                                hideBottomTicker={hideBottomTicker}
                                启用修炼体系={启用修炼体系}
                                chatContentHidden={chatContentHidden}
                                setChatContentHidden={setChatContentHidden}
                                galgameModeEnabled={galgameModeEnabled}
                                toggleGalgameMode={toggleGalgameMode}
                                galgameImmersion={galgameImmersion}
                                toggleGalgameImmersion={toggleGalgameImmersion}
                                rpgModeEnabled={rpgModeEnabled}
                                toggleRpgMode={toggleRpgMode}
                                sceneQuickGenHint={sceneQuickGenHint}
                                sceneQuickGenToastVisible={sceneQuickGenToastVisible}
                                tickerEvents={tickerEvents}
                                fontFaceStyleText={fontFaceStyleText}
                                uiTextStyleVars={uiTextStyleVars}
                                openDevice={(actions as any).openDevice}
                                openCharacter={openCharacter}
                                openSettings={openSettings}
                                openInventory={openInventory}
                                openEquipment={openEquipment}
                                openBattle={openBattle}
                                openTeam={openTeam}
                                openSocial={openSocial}
                                openKungfu={openKungfu}
                                openWorld={openWorld}
                                openMap={openMap}
                                openSect={openSect}
                                openTask={openTask}
                                openAgreement={openAgreement}
                                openStory={openStory}
                                openHeroinePlan={openHeroinePlan}
                                openMemory={openMemory}
                                openCGGallery={openCGGallery}
                                openRelationGraph={openRelationGraph}
                                openMapExplorer={openMapExplorer}
                                openImageManagerWithCheck={() => { modalManager.open('imageManager'); }}
                                openNovelDecompositionWorkbench={openNovelDecompositionWorkbench}
                                openSave={openSave}
                                openLoad={openLoad}
                                openNsfwCenter={() => modalManager.open('nsfwCenter')}
                                togglePerfDashboard={() => setShowPerfDashboard(prev => !prev)}
                                perfDashboardOpen={showPerfDashboard}
                                openRpgBattle={() => modalManager.open('rpgBattle')}
                                openRpgEquipment={() => modalManager.open('rpgEquipment')}
                                openRpgKungfu={() => modalManager.open('rpgKungfu')}
                                openRpgTask={() => modalManager.open('rpgTask')}
                                closeMobileMusic={closeMobileMusic}
                                showMobileMusic={showMobileMusic}
                                activeMobileWindow={activeMobileWindowResolved}
                                handleMobileMenuClick={handleMobileMenuClick}
                                dismissNotification={(actions as any).dismissNotification}
                                renderTickerItems={renderTickerItems}
                                requestConfirm={requestConfirm}
                            />
                        );
                        const renderProfilingEnabled = state.gameConfig?.性能监控配置?.启用渲染分析;
                        if (renderProfilingEnabled && actions.renderProfilerRef?.current) {
                            return (
                                <Profiler id="GameView" onRender={actions.renderProfilerRef.current.onRender}>
                                    {gameViewContent}
                                </Profiler>
                            );
                        }
                        return gameViewContent;
                    })()
                )}

                {/* Modal Layer (global decorative frame only) */}
                <ModalLayer />

                {/* Memory Modals */}
                <MemoryModals
                    meta={meta}
                    actions={actions}
                    isMobile={isMobile}
                    gameView={state.view === 'game'}
                />

                {/* 新模块注册系统渲染器（Phase 2：与 ModalLayer 共存） */}
                <ModalRenderer
                    state={state}
                    meta={meta}
                    setters={setters}
                    actions={actions}
                    isMobile={isMobile}
                    openModals={modalManager.openModals}
                    onClose={modalManager.close}
                    requestConfirm={requestConfirm}
                    extraProps={{ runtimeStateSections, contextSnapshot }}
                />

                {ConfirmModal}

                {/* 性能监控 */}
                {state.view === 'game' && (state as any).performanceConfig?.启用性能监控 && (
                    <FPSDisplay
                        fps={actions.perfActions?.获取FPS?.() ?? 0}
                        memoryMB={actions.perfData?.当前内存MB}
                        enabled={(state as any).performanceConfig?.显示FPS}
                    />
                )}
                {state.view === 'game' && showPerfDashboard && (
                    <PerformanceDashboard
                        perfData={actions.perfData ?? { fps: 0 }}
                        aiQueueStats={actions.perfActions?.AI队列统计?.() ?? { activeCount: 0, pendingCount: 0, totalCount: 0, completedCount: 0, failedCount: 0, averageDurationMs: 0, longestPending: null }}
                        renderReport={actions.perfActions?.渲染报告 ?? []}
                        memoryAlerts={actions.perfActions?.内存告警 ?? []}
                        slowOps={actions.perfActions?.获取慢操作记录?.() ?? []}
                        maxSlowOps={(state as any).performanceConfig?.慢操作显示条数 ?? 10}
                        onClose={() => setShowPerfDashboard(false)}
                    />
                )}
            </div>
        </MusicProvider>
        <ToastManager />
        </ErrorBoundary>
    );
};

export default App;
