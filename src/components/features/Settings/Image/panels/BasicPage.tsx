/**
 * ImageGenerationSettings — 基础页 panel
 *
 * v3 路线图 Phase B1 PR3：从主文件抽出 renderBasicPage。
 */

import React from 'react';
import ToggleSwitch from '../../../../ui/ToggleSwitch';
import type { useImageGenSettings } from '../useImageGenSettings';
import { 文生图后端选项, 页面容器样式, 卡片样式 } from '../helpers';

type HookReturn = ReturnType<typeof useImageGenSettings>;

interface BasicPageProps {
    form: HookReturn['form'];
    updatePlaceholder: HookReturn['updatePlaceholder'];
    当前文生图配置: HookReturn['当前文生图配置'];
}

export const BasicPage: React.FC<BasicPageProps> = ({ form, updatePlaceholder, 当前文生图配置 }) => (
    <div className={页面容器样式}>
        <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
            <div className={卡片样式}>
                <div className="flex items-center justify-between gap-3">
                    <div>
                        <div className="text-base font-bold text-fuchsia-200">文生图总开关</div>
                    </div>
                    <ToggleSwitch
                        checked={form.功能模型占位.文生图功能启用}
                        onChange={(next) => updatePlaceholder('文生图功能启用', next)}
                        ariaLabel="切换文生图总开关"
                    />
                </div>
            </div>
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-950/10 p-4">
                <div className="text-base font-bold text-emerald-200">当前后端</div>
                <div className="mt-2 text-xl font-serif text-white">
                    {当前文生图配置 ? 文生图后端选项.find((item) => item.value === 当前文生图配置.后端类型)?.label : '请在接口设置中配置'}
                </div>
            </div>
        </div>
    </div>
);

export default BasicPage;
