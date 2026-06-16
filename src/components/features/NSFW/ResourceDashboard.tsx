import React, { useState } from 'react';
import type {
  NSFW资源状态,
  商店道具,
  玩家库存,
} from '../../../models/nsfwCore';
import {
  获取可购买商品,
  购买道具,
} from '../../../models/nsfwCore';
import { 默认精力消耗配置 } from '../../../models/nsfwCore/resources';
import {
  获取精力惩罚,
  精力规划建议,
} from '../../../hooks/useGame/nsfw/energyManagement';

// ==================== Props ====================

interface ResourceDashboardProps {
  资源状态: NSFW资源状态;
  库存: 玩家库存;
  已解锁技能?: string[];
  on资源变化: (新状态: NSFW资源状态) => void;
  on库存变化: (新库存: 玩家库存) => void;
  on关闭?: () => void;
}

// ==================== 组件 ====================

export const ResourceDashboard: React.FC<ResourceDashboardProps> = ({
  资源状态,
  库存,
  已解锁技能 = [],
  on资源变化,
  on库存变化,
  on关闭,
}) => {
  const [活跃标签, set活跃标签] = useState<'资源' | '商店' | '建议'>('资源');

  const 精力指示 = 获取精力惩罚(资源状态.精力值);
  const 可购买商品 = 获取可购买商品(库存);
  const 规划 = 精力规划建议(资源状态, 默认精力消耗配置);

  const 购买处理 = (道具ID: string) => {
    const 结果 = 购买道具(资源状态, 库存, 道具ID);
    if (结果.成功) {
      on资源变化(结果.新资源状态);
      const 新库存 = {
        ...库存,
        已购道具: [...库存.已购道具, 道具ID],
        已购数量: { ...库存.已购数量, [道具ID]: (库存.已购数量[道具ID] ?? 0) + 1 },
      };
      if (结果.道具.效果.场景解锁) {
        新库存.已解锁场景 = [...库存.已解锁场景, 结果.道具.效果.场景解锁!];
      }
      if (结果.道具.效果.技能解锁) {
        新库存.已解锁技能 = [...库存.已解锁技能, 结果.道具.效果.技能解锁!];
      }
      on库存变化(新库存);
    }
  };

  return (
    <div style={{ padding: 12, color: '#e2e8f0', fontSize: 13 }}>
      {/* 标签栏 */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 12, borderBottom: '1px solid #334155', paddingBottom: 8 }}>
        {(['资源', '商店', '建议'] as const).map(标签 => (
          <button
            key={标签}
            onClick={() => set活跃标签(标签)}
            style={{
              padding: '4px 12px',
              borderRadius: 4,
              border: 'none',
              background: 活跃标签 === 标签 ? '#3b82f6' : '#1e293b',
              color: '#e2e8f0',
              cursor: 'pointer',
              fontSize: 12,
            }}
          >
            {标签}
          </button>
        ))}
        {on关闭 && (
          <button onClick={on关闭} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
            ✕
          </button>
        )}
      </div>

      {/* 资源标签 */}
      {活跃标签 === '资源' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <资源条
            标签="精力"
            值={资源状态.精力值}
            最大值={100}
            颜色={精力指示.颜色}
            副标签={精力指示.等级}
          />
          <资源条
            标签="声誉"
            值={资源状态.声誉值}
            最大值={100}
            颜色={资源状态.声誉值 >= 60 ? '#22c55e' : 资源状态.声誉值 >= 30 ? '#eab308' : '#ef4444'}
            副标签={资源状态.声誉值 >= 60 ? '良好' : 资源状态.声誉值 >= 30 ? '一般' : '危机'}
          />
          <资源条
            标签="风险预算"
            值={资源状态.风险预算}
            最大值={100}
            颜色={资源状态.风险预算 >= 60 ? '#22c55e' : 资源状态.风险预算 >= 30 ? '#eab308' : '#ef4444'}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 8px', background: '#1e293b', borderRadius: 4 }}>
            <span>亲密度代币</span>
            <span style={{ color: '#fbbf24', fontWeight: 'bold' }}>{资源状态.亲密度代币}</span>
          </div>

          {精力指示.判断力惩罚 > 0 && (
            <div style={{ padding: '6px 8px', background: '#451a03', borderRadius: 4, fontSize: 11, color: '#fbbf24' }}>
              ⚠️ 精力不足惩罚：判断力↓{精力指示.判断力惩罚}% | 风险↑{精力指示.风险增加}% | NPC反应↓{精力指示.NPC反应惩罚}%
            </div>
          )}
        </div>
      )}

      {/* 商店标签 */}
      {活跃标签 === '商店' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 4 }}>
            当前代币: <span style={{ color: '#fbbf24' }}>{资源状态.亲密度代币}</span>
          </div>
          {可购买商品.map(道具 => (
            <商店道具行
              key={道具.id}
              道具={道具}
              可购买={资源状态.亲密度代币 >= 道具.价格}
              on购买={() => 购买处理(道具.id)}
            />
          ))}
        </div>
      )}

      {/* 建议标签 */}
      {活跃标签 === '建议' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div>
            <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 4 }}>可执行行为 ({规划.可执行行为.length})</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {规划.可执行行为.map(行为 => (
                <span key={行为} style={{ padding: '2px 8px', background: '#064e3b', borderRadius: 3, fontSize: 11 }}>
                  {行为}
                </span>
              ))}
            </div>
          </div>
          {规划.不可执行行为.length > 0 && (
            <div>
              <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 4 }}>精力不足</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {规划.不可执行行为.map(行为 => (
                  <span key={行为} style={{ padding: '2px 8px', background: '#451a03', borderRadius: 3, fontSize: 11, color: '#fbbf24' }}>
                    {行为}
                  </span>
                ))}
              </div>
            </div>
          )}
          {规划.建议恢复 && (
            <div style={{ padding: '6px 8px', background: '#1e293b', borderRadius: 4, fontSize: 11 }}>
              建议先恢复精力，预计 {规划.预计恢复回合} 回合后可执行更多行为
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ==================== 子组件 ====================

interface 资源条Props {
  标签: string;
  值: number;
  最大值: number;
  颜色: string;
  副标签?: string;
}

const 资源条: React.FC<资源条Props> = ({ 标签, 值, 最大值, 颜色, 副标签 }) => {
  const 百分比 = (值 / 最大值) * 100;
  return (
    <div style={{ padding: '4px 8px', background: '#1e293b', borderRadius: 4 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 2 }}>
        <span>{标签}</span>
        <span>{值}/{最大值}{副标签 ? ` (${副标签})` : ''}</span>
      </div>
      <div style={{ height: 4, background: '#334155', borderRadius: 2, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${百分比}%`, background: 颜色, borderRadius: 2, transition: 'width 0.3s' }} />
      </div>
    </div>
  );
};

interface 商店道具行Props {
  道具: 商店道具;
  可购买: boolean;
  on购买: () => void;
}

const 商店道具行: React.FC<商店道具行Props> = ({ 道具, 可购买, on购买 }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px', background: '#1e293b', borderRadius: 4 }}>
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: 12, fontWeight: 500 }}>{道具.名称}</div>
      <div style={{ fontSize: 10, color: '#94a3b8' }}>{道具.描述}</div>
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      <span style={{ fontSize: 11, color: '#fbbf24' }}>{道具.价格}🪙</span>
      <button
        onClick={on购买}
        disabled={!可购买}
        style={{
          padding: '2px 8px',
          borderRadius: 3,
          border: 'none',
          background: 可购买 ? '#3b82f6' : '#334155',
          color: 可购买 ? '#fff' : '#64748b',
          cursor: 可购买 ? 'pointer' : 'not-allowed',
          fontSize: 11,
        }}
      >
        购买
      </button>
    </div>
  </div>
);
