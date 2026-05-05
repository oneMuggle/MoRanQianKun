// 都市网约车 NSFW 设置面板
// 提供所有网约车 NSFW 子系统的独立开关和强度控制

import React from 'react';
import type { 都市网约车NSFW设置 } from '../../../models/urbanDriverNSFW';
import { 默认都市网约车NSFW设置 } from '../../../models/urbanDriverNSFW';

export type { 都市网约车NSFW设置 };
export { 默认都市网约车NSFW设置 };

// ==================== 子组件 ====================

interface ToggleSwitchProps {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ label, description, checked, onChange, disabled = false }) => (
  <div className={`flex items-center justify-between py-3 px-4 rounded-lg transition-colors ${disabled ? 'opacity-40 cursor-not-allowed' : 'hover:bg-white/5'}`}>
    <div className="flex-1 mr-4">
      <label className={`text-sm font-serif ${disabled ? 'text-gray-600' : 'text-gray-200'}`}>{label}</label>
      {description && <p className="text-[11px] text-gray-500 mt-0.5">{description}</p>}
    </div>
    <button
      type="button"
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
        checked ? 'bg-wuxia-gold/60' : 'bg-gray-700'
      } ${disabled ? 'cursor-not-allowed' : ''}`}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition-transform ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  </div>
);

interface SelectOptionProps {
  label: string;
  description?: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
  disabled?: boolean;
}

const SelectOption: React.FC<SelectOptionProps> = ({ label, description, value, options, onChange, disabled = false }) => (
  <div className={`flex items-center justify-between py-3 px-4 rounded-lg transition-colors ${disabled ? 'opacity-40 cursor-not-allowed' : 'hover:bg-white/5'}`}>
    <div className="flex-1 mr-4">
      <label className={`text-sm font-serif ${disabled ? 'text-gray-600' : 'text-gray-200'}`}>{label}</label>
      {description && <p className="text-[11px] text-gray-500 mt-0.5">{description}</p>}
    </div>
    <select
      disabled={disabled}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="bg-black/50 border border-white/10 rounded px-3 py-1.5 text-sm text-gray-200 disabled:cursor-not-allowed"
    >
      {options.map(opt => (
        <option key={opt} value={opt}>{opt}</option>
      ))}
    </select>
  </div>
);

interface SectionHeaderProps {
  title: string;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ title }) => (
  <div className="flex items-center gap-2 px-4 pt-6 pb-2 border-b border-white/5">
    <h3 className="text-wuxia-gold/70 font-serif font-bold text-sm tracking-[0.2em]">{title}</h3>
  </div>
);

// ==================== 主组件 ====================

interface Props {
  settings: 都市网约车NSFW设置;
  onChange: (settings: 都市网约车NSFW设置) => void;
}

export const UrbanDriverNSFWSettings: React.FC<Props> = ({ settings, onChange }) => {
  const update = <K extends keyof 都市网约车NSFW设置>(key: K, value: 都市网约车NSFW设置[K]) => {
    onChange({ ...settings, [key]: value });
  };

  const masterEnabled = settings.启用都市网约车NSFW系统;

  return (
    <div className="space-y-1">
      {/* 主开关 */}
      <div className="bg-wuxia-gold/5 border border-wuxia-gold/20 rounded-lg px-4 py-3 mb-2">
        <ToggleSwitch
          label="启用都市网约车 NSFW 系统"
          description="为网约车司机职业路径增加深度 NSFW 强化（仅 contemporary_urban 时代生效）"
          checked={settings.启用都市网约车NSFW系统}
          onChange={(v) => update('启用都市网约车NSFW系统', v)}
        />
      </div>

      {/* 基础设置 */}
      <SectionHeader title="基础设置" />
      <SelectOption
        label="NSFW 内容强度"
        value={settings.NSFW内容强度}
        options={['微暗', '暧昧', '露骨']}
        onChange={(v) => update('NSFW内容强度', v as 都市网约车NSFW设置['NSFW内容强度'])}
        disabled={!masterEnabled}
      />

      {/* 醉酒场景 */}
      <SectionHeader title="醉酒场景" />
      <ToggleSwitch
        label="启用醉酒乘客场景"
        description="深夜接到醉酒状态的女性乘客，在密闭车厢内产生暧昧互动"
        checked={settings.启用醉酒乘客场景}
        onChange={(v) => update('启用醉酒乘客场景', v)}
        disabled={!masterEnabled}
      />
      <SelectOption
        label="醉酒场景强度"
        value={settings.醉酒场景强度}
        options={['关闭', '轻度', '中度', '深度']}
        onChange={(v) => update('醉酒场景强度', v as 都市网约车NSFW设置['醉酒场景强度'])}
        disabled={!masterEnabled || !settings.启用醉酒乘客场景}
      />

      {/* 下药场景 */}
      <SectionHeader title="下药场景" />
      <ToggleSwitch
        label="启用饮料下药场景"
        description="乘客或司机在车内饮料中被下药导致意识模糊的场景"
        checked={settings.启用饮料下药场景}
        onChange={(v) => update('启用饮料下药场景', v)}
        disabled={!masterEnabled}
      />
      <SelectOption
        label="下药场景强度"
        value={settings.下药场景强度}
        options={['关闭', '轻度', '中度', '深度']}
        onChange={(v) => update('下药场景强度', v as 都市网约车NSFW设置['下药场景强度'])}
        disabled={!masterEnabled || !settings.启用饮料下药场景}
      />

      {/* 场景系统 */}
      <SectionHeader title="场景系统" />
      <ToggleSwitch
        label="启用深夜独处场景"
        description="凌晨空旷街道上的单独相处"
        checked={settings.启用深夜独处场景}
        onChange={(v) => update('启用深夜独处场景', v)}
        disabled={!masterEnabled}
      />
      <ToggleSwitch
        label="启用后座暗示场景"
        description="乘客在后座做出的暗示行为"
        checked={settings.启用后座暗示场景}
        onChange={(v) => update('启用后座暗示场景', v)}
        disabled={!masterEnabled}
      />
      <ToggleSwitch
        label="启用停车场秘密场景"
        description="到达目的地后在停车场的延伸故事"
        checked={settings.启用停车场秘密场景}
        onChange={(v) => update('启用停车场秘密场景', v)}
        disabled={!masterEnabled}
      />
      <ToggleSwitch
        label="启用拼车暧昧场景"
        description="拼车时的多人互动"
        checked={settings.启用拼车暧昧场景}
        onChange={(v) => update('启用拼车暧昧场景', v)}
        disabled={!masterEnabled}
      />
      <ToggleSwitch
        label="启用常客关系系统"
        description="固定乘客的渐进关系发展"
        checked={settings.启用常客关系系统}
        onChange={(v) => update('启用常客关系系统', v)}
        disabled={!masterEnabled}
      />
      <ToggleSwitch
        label="启用行车记录仪系统"
        description="记录仪相关的紧张场景和泄露风险"
        checked={settings.启用行车记录仪系统}
        onChange={(v) => update('启用行车记录仪系统', v)}
        disabled={!masterEnabled}
      />

      {/* 后果系统 */}
      <SectionHeader title="后果系统" />
      <ToggleSwitch
        label="启用后果系统"
        description="每个 NSFW 场景都伴随可能的后果"
        checked={settings.启用后果系统}
        onChange={(v) => update('启用后果系统', v)}
        disabled={!masterEnabled}
      />
      <SelectOption
        label="后果严重程度"
        value={settings.后果严重程度}
        options={['轻微', '中等', '严重', '毁灭']}
        onChange={(v) => update('后果严重程度', v as 都市网约车NSFW设置['后果严重程度'])}
        disabled={!masterEnabled || !settings.启用后果系统}
      />
      <ToggleSwitch
        label="启用平台处罚"
        description="平台投诉、差评降权、封号等处罚"
        checked={settings.启用平台处罚}
        onChange={(v) => update('启用平台处罚', v)}
        disabled={!masterEnabled || !settings.启用后果系统}
      />
      <ToggleSwitch
        label="启用网络传播"
        description="事件在社交媒体发酵"
        checked={settings.启用网络传播}
        onChange={(v) => update('启用网络传播', v)}
        disabled={!masterEnabled || !settings.启用后果系统}
      />
      <ToggleSwitch
        label="启用警察盘查"
        description="路遇临检发现异常"
        checked={settings.启用警察盘查}
        onChange={(v) => update('启用警察盘查', v)}
        disabled={!masterEnabled || !settings.启用后果系统}
      />
      <ToggleSwitch
        label="启用勒索威胁"
        description="被乘客或第三方勒索"
        checked={settings.启用勒索威胁}
        onChange={(v) => update('启用勒索威胁', v)}
        disabled={!masterEnabled || !settings.启用后果系统}
      />

      {/* 频率控制 */}
      <SectionHeader title="频率控制" />
      <SelectOption
        label="NSFW 行程触发频率"
        value={settings.NSFW行程触发频率}
        options={['低', '中', '高']}
        onChange={(v) => update('NSFW行程触发频率', v as 都市网约车NSFW设置['NSFW行程触发频率'])}
        disabled={!masterEnabled}
      />
    </div>
  );
};

export default UrbanDriverNSFWSettings;