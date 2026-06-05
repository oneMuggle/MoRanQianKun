// 酒吧 NSFW 设置面板
// 提供酒吧 NSFW 子系统的独立开关和强度控制

import React from 'react';
import type { 酒吧NSFW设置 } from '../../../../models/contemporary/barNSFW/types';
import { NsfwToggleSwitch, NsfwSelectOption, NsfwSectionHeader } from '../../NSFWCenter/NsfwSettingsForm';

interface Props {
  settings: 酒吧NSFW设置;
  onChange: (settings: 酒吧NSFW设置) => void;
}

export const BarNSFWSettings: React.FC<Props> = ({ settings, onChange }) => {
  const update = <K extends keyof 酒吧NSFW设置>(key: K, value: 酒吧NSFW设置[K]) => {
    onChange({ ...settings, [key]: value });
  };

  const masterEnabled = settings.启用;

  return (
    <div className="space-y-1">
      {/* 主开关 */}
      <div className="bg-wuxia-gold/5 border border-wuxia-gold/20 rounded-lg px-4 py-3 mb-2">
        <NsfwToggleSwitch
          label="启用酒吧 NSFW 系统"
          description="关闭时酒吧场景不触发 NSFW 内容、醉酒系统和危机事件"
          checked={settings.启用}
          onChange={(v) => update('启用', v)}
        />
      </div>

      {!masterEnabled && (
        <div className="text-center text-gray-600 text-xs py-8 font-serif">
          开启主开关以配置酒吧 NSFW 子系统
        </div>
      )}

      {masterEnabled && (
        <>
          {/* 基础设置 */}
          <NsfwSectionHeader title="基础设置" />
          <NsfwSelectOption
            label="NSFW 内容强度"
            description="微暗: 暗示性描写 | 暧昧: 肢体接触/氛围描写 | 露骨: 详细 NSFW 场景"
            value={settings.内容强度}
            options={['微暗', '暧昧', '露骨']}
            onChange={(v) => update('内容强度', v as any)}
          />
          <NsfwSelectOption
            label="NSFW 尺度上限"
            description="控制 AI 生成内容的最大展开程度"
            value={settings.尺度上限}
            options={['无', '点到为止', '适度展开', '完全展开']}
            onChange={(v) => update('尺度上限', v as any)}
          />

          {/* 子系统开关 */}
          <NsfwSectionHeader title="子系统" />
          <NsfwToggleSwitch
            label="启用醉酒系统"
            description="开启后点酒/喝酒会增加醉酒值，影响判断力和冲动程度"
            checked={settings.启用醉酒系统}
            onChange={(v) => update('启用醉酒系统', v)}
          />
          <NsfwToggleSwitch
            label="启用危机事件"
            description="开启后可能触发醉酒受伤、被占便宜、冲突、仙人跳等危机"
            checked={settings.启用危机事件}
            onChange={(v) => update('启用危机事件', v)}
          />
          <NsfwToggleSwitch
            label="启用陪酒服务"
            description="开启后商务会所等场所有陪酒/佳丽服务"
            checked={settings.启用陪酒服务}
            onChange={(v) => update('启用陪酒服务', v)}
          />
        </>
      )}
    </div>
  );
};

export default BarNSFWSettings;
