// 写真 NSFW 设置面板
// 提供写真约拍 NSFW 子系统的独立开关和强度控制

import React from 'react';
import { 写真NSFW设置, 默认写真NSFW设置 } from '../../../models/photographyNSFW';

export type { 写真NSFW设置 };
export { 默认写真NSFW设置 };

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

interface SliderOptionProps {
  label: string;
  description?: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}

const SliderOption: React.FC<SliderOptionProps> = ({ label, description, value, min, max, onChange, disabled = false }) => (
  <div className={`py-3 px-4 rounded-lg transition-colors ${disabled ? 'opacity-40 cursor-not-allowed' : 'hover:bg-white/5'}`}>
    <div className="flex items-center justify-between mb-2">
      <div className="flex-1 mr-4">
        <label className={`text-sm font-serif ${disabled ? 'text-gray-600' : 'text-gray-200'}`}>{label}</label>
        {description && <p className="text-[11px] text-gray-500 mt-0.5">{description}</p>}
      </div>
      <span className="text-sm text-wuxia-gold/70 font-mono">{value}%</span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-full h-1.5 bg-gray-700 rounded-full appearance-none cursor-pointer disabled:cursor-not-allowed [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-wuxia-gold/60"
    />
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
  settings: 写真NSFW设置;
  onChange: (settings: 写真NSFW设置) => void;
}

export const PhotographyNSFWSettings: React.FC<Props> = ({ settings, onChange }) => {
  const update = <K extends keyof 写真NSFW设置>(key: K, value: 写真NSFW设置[K]) => {
    onChange({ ...settings, [key]: value });
  };

  const masterEnabled = settings.启用写真NSFW系统;

  return (
    <div className="space-y-1">
      {/* 主开关 */}
      <div className="bg-wuxia-gold/5 border border-wuxia-gold/20 rounded-lg px-4 py-3 mb-2">
        <ToggleSwitch
          label="启用写真 NSFW 系统"
          description="关闭时所有写真约拍 NSFW 功能不生效，仅在现代纪元下可用"
          checked={settings.启用写真NSFW系统}
          onChange={(v) => update('启用写真NSFW系统', v)}
        />
      </div>

      {!masterEnabled && (
        <div className="text-center text-gray-600 text-xs py-8 font-serif">
          开启主开关以配置写真约拍 NSFW 子系统
        </div>
      )}

      {masterEnabled && (
        <>
          {/* 基础设置 */}
          <SectionHeader title="基础设置" />
          <SelectOption
            label="NSFW 内容强度"
            description="影响 AI prompt 约束和生成内容的详细程度"
            value={settings.NSFW内容强度}
            options={['微暗', '暧昧', '露骨']}
            onChange={(v) => update('NSFW内容强度', v as any)}
          />
          <SelectOption
            label="主要玩法层"
            description="经营管理: 商业运营视角 | 人际关系: 模特互动视角 | 灰色地带: 越界行为视角"
            value={settings.主要玩法层}
            options={['经营管理', '人际关系', '灰色地带']}
            onChange={(v) => update('主要玩法层', v as any)}
          />
          <SliderOption
            label="次要玩法权重"
            description="灰色地带内容在叙事中的占比"
            value={settings.次要玩法权重}
            min={0}
            max={100}
            onChange={(v) => update('次要玩法权重', v)}
          />
          <ToggleSwitch
            label="启用道德选择"
            description="开启后在关键节点要求玩家做出道德抉择"
            checked={settings.启用道德选择}
            onChange={(v) => update('启用道德选择', v)}
          />

          {/* 尺度递进 */}
          <SectionHeader title="尺度递进系统" />
          <ToggleSwitch
            label="启用尺度递进"
            description="开启后拍摄尺度随关系发展逐步递进"
            checked={settings.启用尺度递进}
            onChange={(v) => update('启用尺度递进', v)}
          />

          {/* 摄影师系统 */}
          <SectionHeader title="摄影师系统" />
          <ToggleSwitch
            label="启用摄影师筛选"
            description="开启后可筛选摄影师类型和信誉"
            checked={settings.启用摄影师筛选}
            onChange={(v) => update('启用摄影师筛选', v)}
          />

          {/* 越界识别 */}
          <SectionHeader title="越界识别系统" />
          <ToggleSwitch
            label="启用越界识别"
            description="开启后 AI 会识别并标记越界行为"
            checked={settings.启用越界识别}
            onChange={(v) => update('启用越界识别', v)}
          />

          {/* 安全词 */}
          <SectionHeader title="模特保护机制" />
          <ToggleSwitch
            label="启用安全词系统"
            description="开启后模特可使用安全词终止拍摄"
            checked={settings.启用安全词系统}
            onChange={(v) => update('启用安全词系统', v)}
          />
          <ToggleSwitch
            label="启用照片交付"
            description="开启后照片需经模特确认后交付"
            checked={settings.启用照片交付}
            onChange={(v) => update('启用照片交付', v)}
          />

          {/* 泄露事件 */}
          <SectionHeader title="泄露事件系统" />
          <ToggleSwitch
            label="启用泄露事件"
            description="开启后可能触发照片泄露事件"
            checked={settings.启用泄露事件}
            onChange={(v) => update('启用泄露事件', v)}
          />
          <SelectOption
            label="泄露事件频率"
            description="低: 偶发 | 中: 定期 | 高: 频繁"
            value={settings.泄露事件频率}
            options={['低', '中', '高']}
            onChange={(v) => update('泄露事件频率', v as any)}
            disabled={!settings.启用泄露事件}
          />
        </>
      )}
    </div>
  );
};

export default PhotographyNSFWSettings;
