import React, { useState } from 'react';
import type { 后果记录 } from '../../../models/nsfwCore/types';
import type {
  应对策略,
  策略推荐,
} from '../../../models/nsfwCore/consequenceResolution';
import type {
  法律记录,
  道德记录,
  法律应对方式,
} from '../../../models/nsfwCore/legalEthicalSystem';

// ==================== Props ====================

interface ConsequenceManagerProps {
  活跃后果: 后果记录[];
  法律记录: 法律记录[];
  道德记录: 道德记录;
  on获取策略推荐: (后果: 后果记录) => 策略推荐[];
  on执行应对策略: (策略ID: 应对策略['id'], 后果ID: string) => void;
  on执行法律应对: (方式: 法律应对方式, 记录ID: string) => void;
  on道德修复: (方式: '善行' | '公开' | '补偿' | '时间') => void;
  on关闭?: () => void;
}

// ==================== 组件 ====================

export const ConsequenceManager: React.FC<ConsequenceManagerProps> = ({
  活跃后果,
  法律记录,
  道德记录,
  on获取策略推荐,
  on执行应对策略,
  on执行法律应对,
  on道德修复,
  on关闭,
}) => {
  const [活跃标签, set活跃标签] = useState<'后果' | '法律' | '道德'>('后果');
  const [选中后果ID, set选中后果ID] = useState<string | null>(null);
  const [选中法律ID, set选中法律ID] = useState<string | null>(null);

  const 选中后果 = 活跃后果.find(c => c.id === 选中后果ID);
  const 策略推荐列表 = 选中后果 ? on获取策略推荐(选中后果) : [];

  return (
    <div style={{ padding: 12, color: '#e2e8f0', fontSize: 13 }}>
      {/* 标签栏 */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 12, borderBottom: '1px solid #334155', paddingBottom: 8 }}>
        {(['后果', '法律', '道德'] as const).map(标签 => (
          <button
            key={标签}
            onClick={() => set活跃标签(标签)}
            style={{
              padding: '4px 12px',
              borderRadius: 4,
              border: 'none',
              background: 活跃标签 === 标签 ? '#ef4444' : '#1e293b',
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

      {/* 后果标签 */}
      {活跃标签 === '后果' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <后果列表
            后果列表={活跃后果}
            选中ID={选中后果ID}
            on选择={set选中后果ID}
          />
          {策略推荐列表.length > 0 && (
            <应对策略面板
              策略推荐={策略推荐列表}
              on执行={策略ID => on执行应对策略(策略ID, 选中后果ID!)}
            />
          )}
        </div>
      )}

      {/* 法律标签 */}
      {活跃标签 === '法律' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <法律记录列表
            记录列表={法律记录}
            选中ID={选中法律ID}
            on选择={set选中法律ID}
          />
          {选中法律ID && 法律记录.find(r => r.id === 选中法律ID) && (
            <法律应对面板
              记录={法律记录.find(r => r.id === 选中法律ID)!}
              on应对={方式 => on执行法律应对(方式, 选中法律ID!)}
            />
          )}
        </div>
      )}

      {/* 道德标签 */}
      {活跃标签 === '道德' && (
        <道德面板
          记录={道德记录}
          on修复={on道德修复}
        />
      )}
    </div>
  );
};

// ==================== 子组件 ====================

interface 后果列表Props {
  后果列表: 后果记录[];
  选中ID: string | null;
  on选择: (id: string) => void;
}

const 后果列表: React.FC<后果列表Props> = ({ 后果列表, 选中ID, on选择 }) => {
  const 严重程度颜色: Record<string, string> = {
    '轻微': '#22c55e', '中等': '#eab308', '严重': '#f97316', '毁灭': '#ef4444',
  };

  if (后果列表.length === 0) {
    return <div style={{ padding: 12, textAlign: 'center', color: '#64748b', fontSize: 12 }}>暂无活跃后果</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {后果列表.map(后果 => (
        <div
          key={后果.id}
          onClick={() => on选择(后果.id)}
          style={{
            padding: 6,
            background: 选中ID === 后果.id ? '#334155' : '#1e293b',
            borderRadius: 4,
            cursor: 'pointer',
            borderLeft: `3px solid ${严重程度颜色[后果.严重程度]}`,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
            <span style={{ fontWeight: 600 }}>{后果.类型}</span>
            <span style={{ color: 严重程度颜色[后果.严重程度] }}>{后果.严重程度}</span>
          </div>
          <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 2 }}>{后果.描述}</div>
          <div style={{ fontSize: 10, color: '#64748b', marginTop: 2 }}>
            剩余 {后果.持续回合} 回合
          </div>
        </div>
      ))}
    </div>
  );
};

interface 应对策略面板Props {
  策略推荐: 策略推荐[];
  on执行: (策略ID: 应对策略['id']) => void;
}

const 应对策略面板: React.FC<应对策略面板Props> = ({ 策略推荐, on执行 }) => (
  <div>
    <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 4 }}>应对策略</div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {策略推荐.map(({ 策略, 推荐度, 推荐理由 }) => (
        <div key={策略.id} style={{ padding: 6, background: '#1e293b', borderRadius: 4 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 2 }}>
            <span style={{ fontWeight: 600 }}>{策略.名称}</span>
            <span style={{ color: 推荐度 >= 50 ? '#22c55e' : '#ef4444' }}>{推荐度}%</span>
          </div>
          <div style={{ height: 3, background: '#334155', borderRadius: 2, marginBottom: 4, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${推荐度}%`, background: 推荐度 >= 50 ? '#22c55e' : '#ef4444' }} />
          </div>
          <div style={{ fontSize: 10, color: '#94a3b8', marginBottom: 4 }}>{策略.描述}</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 10, color: '#64748b' }}>{推荐理由}</span>
            <button
              onClick={() => on执行(策略.id)}
              style={{
                padding: '2px 10px',
                borderRadius: 3,
                border: 'none',
                background: '#ef4444',
                color: '#fff',
                cursor: 'pointer',
                fontSize: 10,
              }}
            >
              执行
            </button>
          </div>
        </div>
      ))}
    </div>
  </div>
);

interface 法律记录列表Props {
  记录列表: 法律记录[];
  选中ID: string | null;
  on选择: (id: string) => void;
}

const 法律记录列表: React.FC<法律记录列表Props> = ({ 记录列表, 选中ID, on选择 }) => {
  const 风险颜色: Record<string, string> = {
    '无': '#22c55e', '关注': '#3b82f6', '警告': '#eab308', '立案': '#f97316', '诉讼': '#ef4444',
  };

  if (记录列表.length === 0) {
    return <div style={{ padding: 12, textAlign: 'center', color: '#64748b', fontSize: 12 }}>无法律风险</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {记录列表.map(记录 => (
        <div
          key={记录.id}
          onClick={() => on选择(记录.id)}
          style={{
            padding: 6,
            background: 选中ID === 记录.id ? '#334155' : '#1e293b',
            borderRadius: 4,
            cursor: 'pointer',
            opacity: 记录.是否已解决 ? 0.5 : 1,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
            <span style={{ fontWeight: 600 }}>{记录.行为描述}</span>
            <span style={{ color: 风险颜色[记录.风险等级] }}>{记录.风险等级}</span>
          </div>
          <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 2 }}>
            {记录.是否已解决 ? `已解决（${记录.解决方式}）` : `剩余 ${记录.持续回合} 回合`}
          </div>
        </div>
      ))}
    </div>
  );
};

interface 法律应对面板Props {
  记录: 法律记录;
  on应对: (方式: 法律应对方式) => void;
}

const 法律应对面板: React.FC<法律应对面板Props> = ({ 记录, on应对 }) => {
  if (记录.是否已解决) return null;

  const 方式列表: { 方式: 法律应对方式; 颜色: string; 描述: string }[] = [
    { 方式: '聘请律师', 颜色: '#1e3a5f', 描述: '花费较多但成功率高' },
    { 方式: '私下和解', 颜色: '#451a03', 描述: '成本适中，成功率中等' },
    { 方式: '公开道歉', 颜色: '#064e3b', 描述: '免费但效果有限' },
    { 方式: '反击指控', 颜色: '#4a044e', 描述: '高风险高回报' },
    { 方式: '沉默应对', 颜色: '#334155', 描述: '被动等待，可能自然冷却' },
  ];

  return (
    <div>
      <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 4 }}>法律应对</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
        {方式列表.map(({ 方式, 颜色, 描述 }) => (
          <button
            key={方式}
            onClick={() => on应对(方式)}
            style={{
              padding: '4px 8px',
              borderRadius: 3,
              border: 'none',
              background: 颜色,
              color: '#e2e8f0',
              cursor: 'pointer',
              fontSize: 10,
            }}
            title={描述}
          >
            {方式}
          </button>
        ))}
      </div>
    </div>
  );
};

interface 道德面板Props {
  记录: 道德记录;
  on修复: (方式: '善行' | '公开' | '补偿' | '时间') => void;
}

const 道德面板: React.FC<道德面板Props> = ({ 记录, on修复 }) => {
  const 评判值 = 记录.社区声望;
  const 评判颜色 = 评判值 >= 80 ? '#22c55e' : 评判值 >= 60 ? '#3b82f6' : 评判值 >= 40 ? '#eab308' : 评判值 >= 20 ? '#f97316' : '#ef4444';

  const 修复方式: { 方式: '善行' | '公开' | '补偿' | '时间'; 颜色: string; 描述: string }[] = [
    { 方式: '善行', 颜色: '#064e3b', 描述: '消耗回合，恢复道德值' },
    { 方式: '公开', 颜色: '#1e3a5f', 描述: '需要声誉≥50' },
    { 方式: '补偿', 颜色: '#451a03', 描述: '消耗15代币' },
    { 方式: '时间', 颜色: '#334155', 描述: '被动恢复+3' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {/* 当前评判 */}
      <div style={{ padding: 8, background: '#1e293b', borderRadius: 6 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 4 }}>
          <span style={{ fontWeight: 600 }}>当前道德评判</span>
          <span style={{ color: 评判颜色, fontWeight: 600 }}>{记录.当前评判}</span>
        </div>
        <div style={{ height: 6, background: '#334155', borderRadius: 3, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${评判值}%`, background: 评判颜色, transition: 'width 0.3s' }} />
        </div>
        <div style={{ fontSize: 10, color: '#64748b', marginTop: 2 }}>社区声望: {评判值}/100</div>
      </div>

      {/* 修复方式 */}
      <div>
        <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 4 }}>道德修复</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {修复方式.map(({ 方式, 颜色, 描述 }) => (
            <button
              key={方式}
              onClick={() => on修复(方式)}
              style={{
                padding: '4px 8px',
                borderRadius: 3,
                border: 'none',
                background: 颜色,
                color: '#e2e8f0',
                cursor: 'pointer',
                fontSize: 10,
              }}
              title={描述}
            >
              {方式}
            </button>
          ))}
        </div>
      </div>

      {/* 历史事件 */}
      {记录.历史事件.length > 0 && (
        <div>
          <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 4 }}>历史事件 ({记录.历史事件.length})</div>
          <div style={{ maxHeight: 100, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
            {记录.历史事件.slice(-5).reverse().map((事件, i) => (
              <div key={i} style={{ fontSize: 10, color: '#64748b', padding: '2px 4px' }}>
                {事件.描述} <span style={{ color: 事件.影响值 > 0 ? '#22c55e' : '#ef4444' }}>
                  {事件.影响值 > 0 ? '+' : ''}{事件.影响值}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
