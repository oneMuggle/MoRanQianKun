import React from 'react';
import { 接口设置结构 } from '../../../types';
import NovelDecompositionSettings from '../Settings/NovelDecompositionSettings';

interface Props {
    open: boolean;
    settings: 接口设置结构;
    onSave: (settings: 接口设置结构) => void;
    onClose: () => void;
    requestConfirm?: (options: { title?: string; message: string; confirmText?: string; cancelText?: string; danger?: boolean }) => Promise<boolean>;
    onNotify?: (toast: { title: string; message: string; tone?: 'info' | 'success' | 'error' }) => void;
}

const MobileNovelDecompositionWorkbenchModal: React.FC<Props> = ({ open, settings, onSave, onClose, requestConfirm, onNotify }) => {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[320] bg-black/95 overflow-y-auto animate-fadeIn">
            <div className="flex items-center justify-between gap-4 border-b border-wuxia-gold/10 bg-black/60 px-4 py-3 sticky top-0">
                <div>
                    <h2 className="text-base font-bold text-wuxia-gold">小说分解</h2>
                    <div className="text-[10px] text-gray-500">导入、拆章、管理</div>
                </div>
                <button
                    type="button"
                    onClick={onClose}
                    className="rounded-full border border-gray-700 bg-black/50 px-3 py-2 text-xs text-gray-300"
                >
                    关闭
                </button>
            </div>

            <div className="p-2">
                <NovelDecompositionSettings settings={settings} onSave={onSave} requestConfirm={requestConfirm} onNotify={onNotify} />
            </div>
        </div>
    );
};

export default MobileNovelDecompositionWorkbenchModal;