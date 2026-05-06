// hooks/useConfirmSystem.ts
// 确认对话框逻辑 — 从 App.tsx 提取

import * as React from 'react';
import type { ConfirmOptions } from '../components/ui/InAppConfirmModal';
import InAppConfirmModal from '../components/ui/InAppConfirmModal';

export function useConfirmSystem() {
    const confirmResolverRef = React.useRef<((value: boolean) => void) | null>(null);
    const [confirmState, setConfirmState] = React.useState<ConfirmOptions & { open: boolean }>({
        open: false,
        title: '请确认',
        message: '',
        confirmText: '确认',
        cancelText: '取消',
        danger: false
    });

    const requestConfirm = React.useCallback((options: ConfirmOptions) => {
        return new Promise<boolean>((resolve) => {
            confirmResolverRef.current = resolve;
            setConfirmState({
                open: true,
                title: options.title || '请确认',
                message: options.message,
                confirmText: options.confirmText || '确认',
                cancelText: options.cancelText || '取消',
                danger: options.danger || false
            });
        });
    }, []);

    const resolveConfirm = React.useCallback((accepted: boolean) => {
        if (confirmResolverRef.current) {
            confirmResolverRef.current(accepted);
            confirmResolverRef.current = null;
        }
        setConfirmState((prev) => ({ ...prev, open: false }));
    }, []);

    const ConfirmModal = React.useMemo(() => (
        <InAppConfirmModal
            open={confirmState.open}
            title={confirmState.title}
            message={confirmState.message}
            confirmText={confirmState.confirmText}
            cancelText={confirmState.cancelText}
            danger={confirmState.danger}
            onConfirm={() => resolveConfirm(true)}
            onCancel={() => resolveConfirm(false)}
        />
    ), [confirmState, resolveConfirm]);

    return { confirmState, requestConfirm, resolveConfirm, ConfirmModal };
}

export type { ConfirmOptions };
