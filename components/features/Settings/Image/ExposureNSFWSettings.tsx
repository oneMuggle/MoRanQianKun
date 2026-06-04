// 露出 NSFW 独立设置面板
// 提供露出系统的所有开关和强度控制

import React from 'react';
import type { ExposureNSFW设置 } from '../../../../models/exposureNSFW';
import { 默认ExposureNSFW设置 } from '../../../../models/exposureNSFW';
import { NsfwToggleSwitch, NsfwSelectOption, NsfwSectionHeader } from '../../NSFWCenter/NsfwSettingsForm';

export type { ExposureNSFW设置 };
export { 默认ExposureNSFW设置 };

// ==================== 主组件 ====================

interface Props {
  settings: ExposureNSFW设置;
  onChange: (settings: ExposureNSFW设置) => void;
}

export const ExposureNSFWSettings: React.FC<Props> = ({ settings, onChange }) => {
  const update = <K extends keyof ExposureNSFW设置>(key: K, value: ExposureNSFW设置[K]) => {
    onChange({ ...settings, [key]: value });
  };

  const masterEnabled = settings.启用露出系统;

  return (
    <div className="space-y-1">
      {/* 主开关 */}
      <div className="bg-wuxia-gold/5 border border-wuxia-gold/20 rounded-lg px-4 py-3 mb-2">
        <NsfwToggleSwitch
          label="启用露出 NSFW 系统"
          description="全时代可用露出系统：紧张度、旁观者、网络传播"
          checked={settings.启用露出系统}
          onChange={(v) => update('启用露出系统', v)}
        />
      </div>

      {/* 基础设置 */}
      <NsfwSectionHeader title="基础设置" />
      <NsfwSelectOption
        label="露出内容强度"
        description="关闭: 不生成 | 轻度: 私密半公开 | 中度: 半公共场所 | 深度: 公共场所"
        value={settings.露出内容强度}
        options={['关闭', '轻度', '中度', '深度']}
        onChange={(v) => update('露出内容强度', v as ExposureNSFW设置['露出内容强度'])}
        disabled={!masterEnabled}
      />

      {/* 公开隐秘 */}
      <NsfwSectionHeader title="公开隐秘" />
      <NsfwToggleSwitch
        label="启用公开隐秘侵犯"
        description="开启后在公共场合可能触发秘密互动"
        checked={settings.启用公开隐秘侵犯}
        onChange={(v) => update('启用公开隐秘侵犯', v)}
        disabled={!masterEnabled}
      />
      <NsfwToggleSwitch
        label="启用旁观者反应"
        description="开启后周围人可能注意到并触发流言/后果"
        checked={settings.启用旁观者反应}
        onChange={(v) => update('启用旁观者反应', v)}
        disabled={!masterEnabled || !settings.启用公开隐秘侵犯}
      />
      <NsfwToggleSwitch
        label="启用网络传播"
        description="开启后可能有偷拍、论坛讨论、社交媒传播"
        checked={settings.启用网络传播}
        onChange={(v) => update('启用网络传播', v)}
        disabled={!masterEnabled || !settings.启用旁观者反应}
      />

      {/* 频率控制 */}
      <NsfwSectionHeader title="频率控制" />
      <NsfwSelectOption
        label="活动 NSFW 频率"
        description="关闭: 活动不触发 NSFW | 低: 仅特殊活动 | 中: 中型活动 | 高: 所有活动"
        value={settings.活动NSFW频率}
        options={['关闭', '低', '中', '高']}
        onChange={(v) => update('活动NSFW频率', v as ExposureNSFW设置['活动NSFW频率'])}
        disabled={!masterEnabled}
      />
    </div>
  );
};

export default ExposureNSFWSettings;
