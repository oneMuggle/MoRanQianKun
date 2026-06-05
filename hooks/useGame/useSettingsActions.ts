import { useCallback } from 'react';
import * as dbService from '../../services/dbService';
import { 获取时代信息, 获取时代推荐主题, 获取时代主题方案 } from '../../models/system';
import { 应用时代主题到根元素 } from '../../styles/themes';
import { 设置时代UI文案 } from '../../utils/eraUIText';
import { 规范化视觉设置 } from '../../utils/visualSettings';
import { 默认图片管理设置, 规范化图片管理设置 } from '../../utils/imageManagerSettings';
import { 规范化场景图片档案 } from './image/sceneImageArchiveWorkflow';
import type { 视觉设置结构, 场景图片档案, 时代信息结构, 图片管理设置结构 } from '../../types';
import type { 右下角提示结构 } from './ui/notificationSystem';
import { 设置键 } from '../../utils/settingsSchema';

interface SettingsActionsDeps {
    visualConfigRef: React.MutableRefObject<视觉设置结构>;
    setVisualConfig: (config: 视觉设置结构) => void;
    场景图片档案Ref: React.MutableRefObject<场景图片档案>;
    set场景图片档案: (archive: 场景图片档案) => void;
    时代信息Ref: React.MutableRefObject<时代信息结构 | undefined>;
    set时代信息: (info: 时代信息结构 | undefined) => void;
    imageManagerConfigRef: React.MutableRefObject<图片管理设置结构>;
    setImageManagerConfig: (config: 图片管理设置结构) => void;
    setCurrentEra: (era: string) => void;
    setCurrentTheme: (theme: string) => void;
    set右下角提示列表: React.Dispatch<React.SetStateAction<右下角提示结构[]>>;
}

export function useSettingsActions(deps: SettingsActionsDeps) {
    const {
        visualConfigRef,
        setVisualConfig,
        场景图片档案Ref,
        set场景图片档案,
        时代信息Ref,
        set时代信息,
        imageManagerConfigRef,
        setImageManagerConfig,
        setCurrentEra,
        setCurrentTheme,
        set右下角提示列表,
    } = deps;

    const 深拷贝 = useCallback(<T,>(data: T): T => {
        if (data === undefined || data === null) {
            return data;
        }
        if (typeof structuredClone === 'function') {
            return structuredClone(data);
        }
        return JSON.parse(JSON.stringify(data)) as T;
    }, []);

    const 应用视觉设置到状态 = useCallback((value: Partial<视觉设置结构> | null | undefined) => {
        const normalized = 规范化视觉设置(value || {});
        visualConfigRef.current = normalized;
        setVisualConfig(normalized);
        void dbService.保存设置(设置键.视觉设置, normalized);
    }, [visualConfigRef, setVisualConfig]);

    const 应用场景图片档案到状态 = useCallback((value: 场景图片档案 | null | undefined) => {
        const normalized = 规范化场景图片档案(value || {});
        场景图片档案Ref.current = normalized;
        set场景图片档案(normalized);
        void dbService.保存设置(设置键.场景图片档案, normalized);
    }, [场景图片档案Ref, set场景图片档案]);

    const 应用时代信息到状态 = useCallback((value: 时代信息结构 | undefined) => {
        时代信息Ref.current = value;
        set时代信息(value);
    }, [时代信息Ref, set时代信息]);

    const 处理时代变更 = useCallback(async (eraId: string) => {
        setCurrentEra(eraId);
        void dbService.保存设置(设置键.应用时代, eraId);
        const eraInfo = 获取时代信息(eraId);
        应用时代信息到状态(eraInfo || undefined);
        const eraTheme = 获取时代主题方案(eraId);
        if (eraTheme) {
            应用时代主题到根元素(eraTheme);
            设置时代UI文案(eraTheme);
        }
        const recommendedTheme = 获取时代推荐主题(eraId);
        if (recommendedTheme) {
            setCurrentTheme(recommendedTheme);
        }
    }, [setCurrentEra, 应用时代信息到状态, setCurrentTheme]);

    const 应用图片管理设置到状态 = useCallback((value: Partial<图片管理设置结构> | null | undefined) => {
        const normalized = 规范化图片管理设置(value || 默认图片管理设置);
        imageManagerConfigRef.current = normalized;
        setImageManagerConfig(normalized);
        void dbService.保存设置(设置键.图片管理设置, normalized);
    }, [imageManagerConfigRef, setImageManagerConfig]);

    const 关闭右下角提示 = useCallback((toastId: string) => {
        if (!toastId) return;
        set右下角提示列表(prev => prev.filter(item => item.id !== toastId));
    }, [set右下角提示列表]);

    return {
        深拷贝,
        应用视觉设置到状态,
        应用场景图片档案到状态,
        应用时代信息到状态,
        处理时代变更,
        应用图片管理设置到状态,
        关闭右下角提示,
    };
}
