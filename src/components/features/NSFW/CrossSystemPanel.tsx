import React, { useState } from 'react';
import type {
  事件链定义,
  事件链进度,
  事件链节点,
} from '../../../models/nsfwCore/crossSystemChains';
import type {
  多角关系网,
  平衡策略,
} from '../../../models/nsfwCore/multiCharacterNSFW';
import type {
  推荐组合,
} from '../../../models/nsfwCore/sceneCombination';

// ==================== Props ====================

interface CrossSystemPanelProps {
  活跃事件链: { 链: 事件链定义; 进度: 事件链进度; 当前节点: 事件链节点; 完成百分比: number }[];
  关系网: 多角关系网;
  推荐组合: 推荐组合[];
  on推进事件链: (链ID: string, 路径选择?: '安全' | '激进') => void;
  on执行平衡策略: (策略: 平衡策略, 专注角色ID?: string) => void;
  on执行组合: (组合ID: string) => void;
  on关闭?: () => void;
}

// ==================== 组件 ====================

export const CrossSystemPanel: React.FC<CrossSystemPanelProps> = ({
  活跃事件链,
  关系网,
  推荐组合,
  on推进事件链,
  on执行平衡策略,
  on执行组合,
  on关闭,
}) => {
  const [活跃标签, set活跃标签] = useState<'事件链' | '关系网' | '场景组合'>('事件链');

  return (
    <div style={{ padding: 12, color: '#e2e8f0', fontSize: 13 }}>
      {/* 标签栏 */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 12, borderBottom: '1px solid #334155', paddingBottom: 8 }}>
        {(['事件链', '关系网', '场景组合'] as const).map(标签 => (
          <button
            key={标签}
            onClick={() => set活跃标签(标签)}
            style={{
              padding: '4px 12px',
              borderRadius: 4,
              border: 'none',
              background: 活跃标签 === 标签 ? '#8b5cf6' : '#1e293b',
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

      {/* 事件链标签 */}
      {活跃标签 === '事件链' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {活跃事件链.length === 0 && (
            <div style={{ padding: 12, textAlign: 'center', color: '#64748b', fontSize: 12 }}>
              暂无活跃事件链
            </div>
          )}
          {活跃事件链.map(({ 链, 当前节点, 完成百分比 }) => (
            <事件链卡片
              key={链.id}
              链={链}
              当前节点={当前节点}
              完成百分比={完成百分比}
              on推进={路径选择 => on推进事件链(链.id, 路径选择)}
            />
          ))}
        </div>
      )}

      {/* 关系网标签 */}
      {活跃标签 === '关系网' && (
        <关系网视图
          关系网={关系网}
          on执行策略={on执行平衡策略}
        />
      )}

      {/* 场景组合标签 */}
      {活跃标签 === '场景组合' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {推荐组合.length === 0 && (
            <div style={{ padding: 12, textAlign: 'center', color: '#64748b', fontSize: 12 }}>
              暂无推荐组合
            </div>
          )}
          {推荐组合.map(({ 组合, 匹配度, 推荐理由 }) => (
            <场景组合卡片
              key={组合.id}
              组合={组合}
              匹配度={匹配度}
              推荐理由={推荐理由}
              on执行={() => on执行组合(组合.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// ==================== 子组件 ====================

interface 事件链卡片Props {
  链: 事件链定义;
  当前节点: 事件链节点;
  完成百分比: number;
  on推进: (路径选择?: '安全' | '激进') => void;
}

const 事件链卡片: React.FC<事件链卡片Props> = ({ 链, 当前节点, 完成百分比, on推进 }) => (
  <div style={{ padding: 8, background: '#1e293b', borderRadius: 6 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
      <span style={{ fontSize: 12, fontWeight: 600, color: '#a78bfa' }}>{链.名称}</span>
      <span style={{ fontSize: 10, color: '#94a3b8' }}>{完成百分比}%</span>
    </div>
    <div style={{ height: 3, background: '#334155', borderRadius: 2, marginBottom: 6, overflow: 'hidden' }}>
      <div style={{ height: '100%', width: `${完成百分比}%`, background: '#8b5cf6', transition: 'width 0.3s' }} />
    </div>
    <div style={{ fontSize: 11, marginBottom: 4 }}>
      <span style={{ color: '#94a3b8' }}>当前节点: </span>
      <span style={{ color: '#e2e8f0' }}>{当前节点.名称}</span>
    </div>
    <div style={{ fontSize: 10, color: '#64748b', marginBottom: 6 }}>{当前节点.描述}</div>
    <div style={{ display: 'flex', gap: 4 }}>
      {当前节点.分支选项 ? (
        <>
          <button
            onClick={() => on推进('安全')}
            style={{
              flex: 1,
              padding: '3px 8px',
              borderRadius: 3,
              border: 'none',
              background: '#065f46',
              color: '#6ee7b7',
              cursor: 'pointer',
              fontSize: 10,
            }}
          >
            安全: {当前节点.分支选项.安全路径}
          </button>
          <button
            onClick={() => on推进('激进')}
            style={{
              flex: 1,
              padding: '3px 8px',
              borderRadius: 3,
              border: 'none',
              background: '#7f1d1d',
              color: '#fca5a5',
              cursor: 'pointer',
              fontSize: 10,
            }}
          >
            激进: {当前节点.分支选项.激进路径}
          </button>
        </>
      ) : (
        <button
          onClick={() => on推进()}
          style={{
            flex: 1,
            padding: '3px 8px',
            borderRadius: 3,
            border: 'none',
            background: '#3b82f6',
            color: '#fff',
            cursor: 'pointer',
            fontSize: 11,
          }}
        >
          继续推进
        </button>
      )}
    </div>
  </div>
);

interface 关系网视图Props {
  关系网: 多角关系网;
  on执行策略: (策略: 平衡策略, 专注角色ID?: string) => void;
}

const 关系网视图: React.FC<关系网视图Props> = ({ 关系网, on执行策略 }) => {
  const [专注角色ID, set专注角色ID] = useState<string | undefined>();

  const 策略按钮: { 策略: 平衡策略; 颜色: string; 描述: string }[] = [
    { 策略: '隐瞒关系', 颜色: '#451a03', 描述: '降低嫉妒，消耗信任' },
    { 策略: '公开协商', 颜色: '#1e1b4b', 描述: '高信任角色嫉妒大幅降低' },
    { 策略: '时间分配', 颜色: '#064e3b', 描述: '平均减少嫉妒，小幅消耗亲密' },
    { 策略: '专注一人', 颜色: '#4a044e', 描述: '指定角色+15，其他+10嫉妒' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {/* 角色列表 */}
      <div>
        <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 4 }}>角色关系网 ({关系网.角色列表.length} 人)</div>
        {关系网.角色列表.length === 0 && (
          <div style={{ padding: 8, textAlign: 'center', color: '#64748b', fontSize: 11 }}>
            暂无角色关系
          </div>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {关系网.角色列表.map(角色 => (
            <div
              key={角色.角色ID}
              style={{
                padding: 6,
                background: '#1e293b',
                borderRadius: 4,
                cursor: 专注角色ID === 角色.角色ID ? 'pointer' : 'default',
                outline: 专注角色ID === 角色.角色ID ? '1px solid #8b5cf6' : undefined,
              }}
              onClick={() => set专注角色ID(角色.角色ID)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 2 }}>
                <span style={{ fontWeight: 600 }}>{角色.角色名称}</span>
                <span style={{ color: '#94a3b8' }}>{角色.关系状态}</span>
              </div>
              <div style={{ display: 'flex', gap: 8, fontSize: 10, color: '#94a3b8' }}>
                <span>亲密 {角色.亲密度}</span>
                <span>信任 {角色.信任度}</span>
                <span style={{ color: 角色.嫉妒值 >= 70 ? '#ef4444' : 角色.嫉妒值 >= 40 ? '#eab308' : '#22c55e' }}>
                  嫉妒 {角色.嫉妒值}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 策略按钮 */}
      <div>
        <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 4 }}>平衡策略</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {策略按钮.map(({ 策略, 颜色, 描述 }) => (
            <button
              key={策略}
              onClick={() => on执行策略(策略, 策略 === '专注一人' ? 专注角色ID : undefined)}
              disabled={策略 === '专注一人' && !专注角色ID}
              style={{
                padding: '4px 8px',
                borderRadius: 3,
                border: 'none',
                background: 策略 === '专注一人' && !专注角色ID ? '#334155' : 颜色,
                color: '#e2e8f0',
                cursor: 策略 === '专注一人' && !专注角色ID ? 'not-allowed' : 'pointer',
                fontSize: 10,
                opacity: 策略 === '专注一人' && !专注角色ID ? 0.5 : 1,
              }}
              title={描述}
            >
              {策略}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

interface 场景组合卡片Props {
  组合: {
    名称: string;
    描述: string;
    组合场景: { 来源: string; 标签: string }[];
    协同倍率: number;
    风险协同系数: number;
    额外奖励?: { 代币?: number; 声誉变化?: number };
  };
  匹配度: number;
  推荐理由: string;
  on执行: () => void;
}

const 场景组合卡片: React.FC<场景组合卡片Props> = ({ 组合, 匹配度, 推荐理由, on执行 }) => {
  const 匹配度颜色 = 匹配度 >= 80 ? '#22c55e' : 匹配度 >= 60 ? '#eab308' : 匹配度 >= 40 ? '#f97316' : '#ef4444';

  return (
    <div style={{ padding: 8, background: '#1e293b', borderRadius: 6 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: 12, fontWeight: 600 }}>{组合.名称}</span>
        <span style={{ fontSize: 10, color: 匹配度颜色 }}>{匹配度}%</span>
      </div>
      <div style={{ height: 3, background: '#334155', borderRadius: 2, marginBottom: 4, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${匹配度}%`, background: 匹配度颜色, transition: 'width 0.3s' }} />
      </div>
      <div style={{ fontSize: 10, color: '#94a3b8', marginBottom: 4 }}>{组合.描述}</div>
      <div style={{ display: 'flex', gap: 4, marginBottom: 4, flexWrap: 'wrap' }}>
        {组合.组合场景.map((cs, i) => (
          <span key={i} style={{ padding: '1px 6px', background: '#334155', borderRadius: 3, fontSize: 10 }}>
            {cs.来源} · {cs.标签}
          </span>
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 10 }}>
        <div style={{ display: 'flex', gap: 8, color: '#64748b' }}>
          <span>协同×{组合.协同倍率.toFixed(1)}</span>
          <span>风险×{组合.风险协同系数.toFixed(1)}</span>
          {组合.额外奖励?.代币 && <span style={{ color: '#fbbf24' }}>+{组合.额外奖励.代币}🪙</span>}
        </div>
        <button
          onClick={on执行}
          style={{
            padding: '2px 10px',
            borderRadius: 3,
            border: 'none',
            background: '#8b5cf6',
            color: '#fff',
            cursor: 'pointer',
            fontSize: 10,
          }}
        >
          执行组合
        </button>
      </div>
      <div style={{ fontSize: 10, color: '#64748b', marginTop: 2 }}>{推荐理由}</div>
    </div>
  );
};
