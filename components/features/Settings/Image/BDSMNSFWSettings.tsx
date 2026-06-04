// BDSM 独立 NSFW 设置面板
// 提供所有 BDSM 独立 NSFW 子系统的开关和强度控制

import React from 'react';
import type { BDSM系统设置 } from '../../../../models/bdsmNSFW';
import { 默认BDSM系统设置 } from '../../../../models/bdsmNSFW';
import { NsfwToggleSwitch, NsfwSelectOption, NsfwSectionHeader } from '../../NSFWCenter/NsfwSettingsForm';

export type { BDSM系统设置 };
export { 默认BDSM系统设置 };

// ==================== 主组件 ====================

interface Props {
  settings: BDSM系统设置;
  onChange: (settings: BDSM系统设置) => void;
}

export const BDSMNSFWSettings: React.FC<Props> = ({ settings, onChange }) => {
  const update = <K extends keyof BDSM系统设置>(key: K, value: BDSM系统设置[K]) => {
    onChange({ ...settings, [key]: value });
  };

  const masterEnabled = settings.启用BDSM独立系统;

  return (
    <div className="space-y-1">
      {/* 主开关 */}
      <div className="bg-wuxia-gold/5 border border-wuxia-gold/20 rounded-lg px-4 py-3 mb-2">
        <NsfwToggleSwitch
          label="启用 BDSM 独立系统"
          description="全时代可用 BDSM 系统：权力天平、服从度、契约、调教任务"
          checked={settings.启用BDSM独立系统}
          onChange={(v) => update('启用BDSM独立系统', v)}
        />
      </div>

      {/* 基础设置 */}
      <NsfwSectionHeader title="基础设置" />
      <NsfwSelectOption
        label="BDSM 内容强度"
        description="关闭: 不生成 | 轻度: 心理暗示 | 中度: 明确行为 | 深度: 详细场景"
        value={settings.BDSM内容强度}
        options={['关闭', '轻度', '中度', '深度']}
        onChange={(v) => update('BDSM内容强度', v as BDSM系统设置['BDSM内容强度'])}
        disabled={!masterEnabled}
      />

      {/* 论坛系统 */}
      <NsfwSectionHeader title="BDSM 论坛系统" />
      <NsfwToggleSwitch
        label="启用 BDSM 论坛"
        description="开启后包含匿名讨论、经验交流、寻主召奴等子分类"
        checked={settings.启用BDSM论坛}
        onChange={(v) => update('启用BDSM论坛', v)}
        disabled={!masterEnabled}
      />

      {/* 关系管线 */}
      <NsfwSectionHeader title="BDSM 关系管线" />
      <NsfwToggleSwitch
        label="启用 BDSM 关系管线"
        description="开启后追踪 BDSM 关系状态、服从度、权力天平等"
        checked={settings.启用BDSM关系管线}
        onChange={(v) => update('启用BDSM关系管线', v)}
        disabled={!masterEnabled}
      />
      <NsfwToggleSwitch
        label="启用 BDSM 调教任务"
        description="开启后 AI 每回合生成调教任务/日常指令"
        checked={settings.启用BDSM调教任务}
        onChange={(v) => update('启用BDSM调教任务', v)}
        disabled={!masterEnabled || !settings.启用BDSM关系管线}
      />
      <NsfwToggleSwitch
        label="启用 BDSM 契约系统"
        description="开启后可与 NPC 协商并缔结 BDSM 契约"
        checked={settings.启用BDSM契约系统}
        onChange={(v) => update('启用BDSM契约系统', v)}
        disabled={!masterEnabled || !settings.启用BDSM关系管线}
      />
      <NsfwToggleSwitch
        label="启用 BDSM 见面预约"
        description="开启后可与 NPC 预约见面时间与地点"
        checked={settings.启用BDSM见面预约}
        onChange={(v) => update('启用BDSM见面预约', v)}
        disabled={!masterEnabled || !settings.启用BDSM关系管线}
      />

      {/* 高级选项 */}
      <NsfwSectionHeader title="高级选项" />
      <NsfwToggleSwitch
        label="启用 BDSM 多角色关系"
        description="开启后支持多 NPC 之间的 BDSM 关系网络"
        checked={settings.启用BDSM多角色关系}
        onChange={(v) => update('启用BDSM多角色关系', v)}
        disabled={!masterEnabled}
      />
      <NsfwToggleSwitch
        label="启用 BDSM 时代场景包"
        description="开启后根据当前时代自动匹配场景和修正值"
        checked={settings.启用BDSM时代场景包}
        onChange={(v) => update('启用BDSM时代场景包', v)}
        disabled={!masterEnabled}
      />
      <NsfwToggleSwitch
        label="启用 BDSM 信誉系统"
        description="开启后在论坛中积累信誉影响寻主/召奴效果"
        checked={settings.启用BDSM信誉系统}
        onChange={(v) => update('启用BDSM信誉系统', v)}
        disabled={!masterEnabled}
      />
      <NsfwToggleSwitch
        label="启用 BDSM 安全词历史"
        description="开启后记录每次使用安全词的场景和原因"
        checked={settings.启用BDSM安全词历史}
        onChange={(v) => update('启用BDSM安全词历史', v)}
        disabled={!masterEnabled}
      />
      <NsfwToggleSwitch
        label="启用 BDSM 契约模板库"
        description="开启后提供预设契约模板供快速缔结"
        checked={settings.启用BDSM契约模板库}
        onChange={(v) => update('启用BDSM契约模板库', v)}
        disabled={!masterEnabled}
      />
    </div>
  );
};

export default BDSMNSFWSettings;
