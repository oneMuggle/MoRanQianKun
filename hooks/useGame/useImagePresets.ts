import { useCallback, useMemo } from 'react';
import { 创建图片预设工作流, 主角角色锚点标识 } from './image/imagePresetWorkflow';
import * as dbService from '../../services/dbService';
import type { 接口设置结构, 角色数据结构 } from '../../types';

interface UseImagePresetsDeps {
    apiConfigRef: React.MutableRefObject<接口设置结构>;
    updateApiConfig: (updater: (config: 接口设置结构) => 接口设置结构) => Promise<unknown> | unknown;
    加载图片AI服务: () => Promise<any>;
    set右下角提示列表: React.Dispatch<React.SetStateAction<any[]>>;
    社交: any[];
    角色: 角色数据结构 | null;
    isCultivationSystemEnabled: () => boolean;
}

export function useImagePresets(deps: UseImagePresetsDeps) {
    const {
        apiConfigRef,
        updateApiConfig,
        加载图片AI服务,
        set右下角提示列表,
        社交,
        角色,
        isCultivationSystemEnabled,
    } = deps;

    const 获取接口配置 = useCallback((): 接口设置结构 => apiConfigRef.current, [apiConfigRef]);

    const 推送右下角提示 = useCallback((toast: { title: string; message: string; tone?: 'info' | 'success' | 'error' }) => {
        set右下角提示列表(prev => [...prev, { id: crypto.randomUUID(), ...toast }]);
    }, [set右下角提示列表]);

    const 保存图片资源 = useCallback(async (dataUrl: string): Promise<string> => {
        return dbService.保存图片资源(dataUrl);
    }, []);

    const imagePresetWorkflow = useMemo(() => 创建图片预设工作流({
        获取接口配置,
        更新接口配置: updateApiConfig,
        加载图片AI服务,
        推送右下角提示,
        保存图片资源,
        获取社交列表: () => 社交,
        获取角色: () => 角色,
        isCultivationSystemEnabled
    }), [
        获取接口配置,
        updateApiConfig,
        加载图片AI服务,
        推送右下角提示,
        保存图片资源,
        社交,
        角色,
        isCultivationSystemEnabled
    ]);

    return {
        ...imagePresetWorkflow,
        主角角色锚点标识
    };
}
