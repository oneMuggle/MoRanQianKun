/**
 * App 组件路由测试
 *
 * 2026-06-08 Phase 5 Day 57：T4 关键组件测试
 * - App.tsx 通过 state.view 路由（'home' / 'new_game' / 'game'）
 * - 不使用 react-router-dom，所有依赖通过 vi.mock 隔离
 * - 目标：覆盖 App.tsx 视图分发逻辑
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

// ========== Mock 顶层 hooks ==========
// App.tsx 顶层消费 7 个 hook；除 useGame 之外全部 stub 成空实现。
let mockState: any = {};

vi.mock('./hooks/useGame', () => ({
    useGame: () => ({
        state: mockState,
        meta: {},
        setters: {},
        actions: {
            handleGenerateWorld: vi.fn(),
            handleEraChange: vi.fn(),
            saveVisualSettings: vi.fn(),
            openDevice: vi.fn(),
            dismissNotification: vi.fn(),
            renderProfilerRef: { current: null },
        },
    }),
}));

vi.mock('./hooks/useResponsive', () => ({
    useResponsive: () => ({ isMobile: false }),
}));

vi.mock('./hooks/useConfirmSystem', () => ({
    useConfirmSystem: () => ({
        requestConfirm: vi.fn().mockResolvedValue(true),
        ConfirmModal: null,
    }),
}));

vi.mock('./hooks/useIdlePreload', () => ({
    useIdlePreload: vi.fn(),
}));

vi.mock('./components/app/ModalLayer', () => ({
    ModalLayer: () => <div data-testid="modal-layer" />,
}));
vi.mock('./components/app/MemoryModals', () => ({
    MemoryModals: () => <div data-testid="memory-modals" />,
}));
vi.mock('./core/module-registry', () => ({
    ModalRenderer: () => <div data-testid="modal-renderer" />,
    useModalManager: () => ({
        open: vi.fn(),
        close: vi.fn(),
        replace: vi.fn(),
        closeAll: vi.fn(),
        toggle: vi.fn(),
        isOpen: vi.fn().mockReturnValue(false),
        openModals: new Map(),
    }),
}));

vi.mock('./components/app/useAppModalState', () => ({
    useAppModalState: () => ({
        showCharacter: false,
        showNovelDecompositionWorkbench: false,
        showMobileMusic: false,
        chatContentHidden: false,
        setChatContentHidden: vi.fn(),
        sceneQuickGenHint: '',
        setSceneQuickGenHint: vi.fn(),
        sceneQuickGenToastVisible: false,
        setSceneQuickGenToastVisible: vi.fn(),
        contextSnapshot: null,
        setContextSnapshot: vi.fn(),
        galgameModeEnabled: false,
        toggleGalgameMode: vi.fn(),
        galgameImmersion: false,
        toggleGalgameImmersion: vi.fn(),
        rpgModeEnabled: false,
        toggleRpgMode: vi.fn(),
        modalOpeners: {
            openCharacter: vi.fn(),
            openSettings: vi.fn(),
            openInventory: vi.fn(),
            openEquipment: vi.fn(),
            openBattle: vi.fn(),
            openTeam: vi.fn(),
            openSocial: vi.fn(),
            openKungfu: vi.fn(),
            openWorld: vi.fn(),
            openMap: vi.fn(),
            openSect: vi.fn(),
            openTask: vi.fn(),
            openAgreement: vi.fn(),
            openStory: vi.fn(),
            openHeroinePlan: vi.fn(),
            openMemory: vi.fn(),
            openSave: vi.fn(),
            openLoad: vi.fn(),
            closeMobileMusic: vi.fn(),
            openWorldbookManager: vi.fn(),
            openNovelDecompositionWorkbench: vi.fn().mockResolvedValue(undefined),
            openCGGallery: vi.fn(),
            openRelationGraph: vi.fn(),
            openMapExplorer: vi.fn(),
            handleMobileMenuClick: vi.fn(),
            handleStartFromLanding: vi.fn(),
        },
    }),
}));

vi.mock('./components/app/useAppEffects', () => ({
    useAppEffects: () => ({
        tickerEvents: [],
        renderTickerItems: () => null,
        启用修炼体系: false,
        当前背景图片地址: '',
        玩家头像地址: '',
        fontFaceStyleText: '',
        uiTextStyleVars: {},
        hideBottomTicker: false,
        runtimeStateSections: {},
        currentOptions: [],
    }),
}));

vi.mock('./components/features/lazyComponents', () => ({
    懒加载边界: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    LandingPage: (props: any) => <div data-testid="landing-page">LandingPage:{props.hasSave ? 'has-save' : 'no-save'}</div>,
    NewGameWizard: () => <div data-testid="new-game-wizard">NewGameWizard</div>,
    MobileNewGameWizard: () => <div data-testid="mobile-new-game-wizard">MobileNewGameWizard</div>,
    GameView: () => <div data-testid="game-view">GameView</div>,
}));

vi.mock('./components/features/Music/MusicProvider', () => ({
    MusicProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('./components/features/Performance/FPSDisplay', () => ({
    default: () => <div data-testid="fps-display" />,
}));
vi.mock('./components/features/Performance/PerformanceDashboard', () => ({
    default: () => <div data-testid="perf-dashboard" />,
}));
vi.mock('./components/ui/ErrorBoundary', () => ({
    ErrorBoundary: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));
vi.mock('./components/ui/ToastManager', () => ({
    ToastManager: () => <div data-testid="toast-manager" />,
}));

vi.mock('./core/module-registry/bootstrap', () => ({}));
vi.mock('./core/engine', () => ({
    getModuleLoader: () => ({
        setContext: vi.fn(),
        register: vi.fn(),
        activate: vi.fn().mockResolvedValue(undefined),
        emitEvent: vi.fn(),
        onEvent: vi.fn(),
    }),
    PromptRegistry: { registerCoreMany: vi.fn() },
}));

import App from './App';

describe('App routing', () => {
    beforeEach(() => {
        mockState = {};
    });

    it('view=home 时渲染 LandingPage', () => {
        mockState = { view: 'home', hasSave: false };
        render(<App />);
        expect(screen.getByTestId('landing-page')).toBeInTheDocument();
        expect(screen.queryByTestId('new-game-wizard')).toBeNull();
        expect(screen.queryByTestId('game-view')).toBeNull();
    });

    it('view=home + hasSave=true 时 LandingPage 反映 hasSave', () => {
        mockState = { view: 'home', hasSave: true };
        render(<App />);
        expect(screen.getByTestId('landing-page')).toHaveTextContent('has-save');
    });

    it('view=new_game 时渲染 NewGameWizard（桌面端）', () => {
        mockState = { view: 'new_game', loading: false, currentEra: 'ancient_eastern_wuxia' };
        render(<App />);
        expect(screen.getByTestId('new-game-wizard')).toBeInTheDocument();
        expect(screen.queryByTestId('mobile-new-game-wizard')).toBeNull();
        expect(screen.queryByTestId('landing-page')).toBeNull();
    });

    it('view=game 时渲染 GameView', () => {
        mockState = { view: 'game', hasSave: true };
        render(<App />);
        expect(screen.getByTestId('game-view')).toBeInTheDocument();
        expect(screen.queryByTestId('landing-page')).toBeNull();
        expect(screen.queryByTestId('new-game-wizard')).toBeNull();
    });

    it('始终渲染全局层（ModalLayer / MemoryModals / ModalRenderer / ToastManager）', () => {
        mockState = { view: 'home', hasSave: false };
        render(<App />);
        expect(screen.getByTestId('modal-layer')).toBeInTheDocument();
        expect(screen.getByTestId('memory-modals')).toBeInTheDocument();
        expect(screen.getByTestId('modal-renderer')).toBeInTheDocument();
        expect(screen.getByTestId('toast-manager')).toBeInTheDocument();
    });

    it('view=game 不渲染性能面板（默认未开启 Ctrl+Shift+P）', () => {
        mockState = { view: 'game', hasSave: true };
        render(<App />);
        expect(screen.queryByTestId('perf-dashboard')).toBeNull();
    });
});
