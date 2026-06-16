/**
 * MemoryModals.tsx
 *
 * 提取 App 中的记忆总结流程弹窗渲染逻辑。
 * 包含：MemorySummaryFlow、NpcMemorySummaryFlow（桌面和移动端）。
 */

import * as React from 'react';
import {
    懒加载边界,
    MemorySummaryFlowModal,
    MemorySummaryFlowMobileModal,
    NpcMemorySummaryFlowModal,
    NpcMemorySummaryFlowMobileModal,
} from '../features/lazyComponents';
import BackgroundSummaryBanner from '../features/Memory/BackgroundSummaryBanner';

// ============================================================================
// 类型
// ============================================================================

interface MemoryModalsProps {
    meta: Record<string, unknown>;
    actions: Record<string, unknown>;
    isMobile: boolean;
    gameView: boolean;
}

// ============================================================================
// Component
// ============================================================================

export function MemoryModals({
    meta,
    actions,
    isMobile,
    gameView,
}: MemoryModalsProps) {
    return (
        <>
            {gameView && (
                <BackgroundSummaryBanner
                    status={((meta as any).backgroundMemorySummaryStatus || 'idle') as 'idle' | 'running' | 'done' | 'error'}
                    error={(meta as any).backgroundMemorySummaryError || ''}
                    onView={(actions as any).handleViewBackgroundSummary}
                    onDismiss={(actions as any).handleDismissBackgroundNotification}
                    onApply={(actions as any).handleApplyBackgroundMemorySummary}
                />
            )}

            {gameView && (meta as any).memorySummaryOpen && (
                <懒加载边界>
                    {isMobile ? (
                        <MemorySummaryFlowMobileModal
                            open={true}
                            stage={((meta as any).memorySummaryStage || 'remind') as 'remind' | 'processing' | 'review'}
                            task={(meta as any).memorySummaryTask || null}
                            draft={(meta as any).memorySummaryDraft || ''}
                            error={(meta as any).memorySummaryError || ''}
                            onStart={() => { void (actions as any).handleStartMemorySummary(); }}
                            onCancel={(actions as any).handleCancelMemorySummary}
                            onBack={(actions as any).handleBackToMemorySummaryRemind}
                            onDraftChange={(actions as any).handleUpdateMemorySummaryDraft}
                            onApply={(actions as any).handleApplyMemorySummary}
                        />
                    ) : (
                        <MemorySummaryFlowModal
                            open={true}
                            stage={((meta as any).memorySummaryStage || 'remind') as 'remind' | 'processing' | 'review'}
                            task={(meta as any).memorySummaryTask || null}
                            draft={(meta as any).memorySummaryDraft || ''}
                            error={(meta as any).memorySummaryError || ''}
                            onStart={() => { void (actions as any).handleStartMemorySummary(); }}
                            onCancel={(actions as any).handleCancelMemorySummary}
                            onBack={(actions as any).handleBackToMemorySummaryRemind}
                            onDraftChange={(actions as any).handleUpdateMemorySummaryDraft}
                            onApply={(actions as any).handleApplyMemorySummary}
                        />
                    )}
                </懒加载边界>
            )}

            {gameView && !(meta as any).memorySummaryOpen && (meta as any).npcMemorySummaryOpen && (
                <懒加载边界>
                    {isMobile ? (
                        <NpcMemorySummaryFlowMobileModal
                            open={true}
                            stage={((meta as any).npcMemorySummaryStage || 'remind') as 'remind' | 'processing' | 'review'}
                            task={(meta as any).npcMemorySummaryTask || null}
                            queueLength={(meta as any).npcMemorySummaryQueueLength || 0}
                            draft={(meta as any).npcMemorySummaryDraft || ''}
                            error={(meta as any).npcMemorySummaryError || ''}
                            onStart={() => { void (actions as any).handleStartNpcMemorySummary(); }}
                            onCancel={(actions as any).handleCancelNpcMemorySummary}
                            onBack={(actions as any).handleBackToNpcMemorySummaryRemind}
                            onDraftChange={(actions as any).handleUpdateNpcMemorySummaryDraft}
                            onApply={(actions as any).handleApplyNpcMemorySummary}
                        />
                    ) : (
                        <NpcMemorySummaryFlowModal
                            open={true}
                            stage={((meta as any).npcMemorySummaryStage || 'remind') as 'remind' | 'processing' | 'review'}
                            task={(meta as any).npcMemorySummaryTask || null}
                            queueLength={(meta as any).npcMemorySummaryQueueLength || 0}
                            draft={(meta as any).npcMemorySummaryDraft || ''}
                            error={(meta as any).npcMemorySummaryError || ''}
                            onStart={() => { void (actions as any).handleStartNpcMemorySummary(); }}
                            onCancel={(actions as any).handleCancelNpcMemorySummary}
                            onBack={(actions as any).handleBackToNpcMemorySummaryRemind}
                            onDraftChange={(actions as any).handleUpdateNpcMemorySummaryDraft}
                            onApply={(actions as any).handleApplyNpcMemorySummary}
                        />
                    )}
                </懒加载边界>
            )}
        </>
    );
}
