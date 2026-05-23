/**
 * 社交网络可视化组件
 * 展示NPC关系图、流言列表
 */

import type { 社交网络状态, NPC关系, 关系类型, 流言 } from '../../../models/npcNSFWEnhancement/socialNetwork';

interface SocialNetworkViewProps {
  社交网络: 社交网络状态;
  size?: 'sm' | 'md';
}

const 关系颜色: Record<关系类型, string> = {
  '友谊': 'text-green-400',
  '竞争': 'text-orange-400',
  '敌对': 'text-red-400',
  '暧昧': 'text-pink-400',
  '主从': 'text-amber-400',
  '师徒': 'text-blue-400',
  '血缘': 'text-purple-400',
  '同事': 'text-cyan-400',
  '陌生人': 'text-gray-400',
};

const 严重度颜色: Record<string, string> = {
  '轻微': 'text-gray-400',
  '中等': 'text-yellow-400',
  '严重': 'text-orange-400',
  '毁灭性': 'text-red-400',
};

export function SocialNetworkView({ 社交网络, size = 'md' }: SocialNetworkViewProps) {
  const isSmall = size === 'sm';

  return (
    <div className={`space-y-3 ${isSmall ? 'text-xs' : 'text-sm'}`}>
      {社交网络.关系列表.length > 0 && (
        <div>
          <div className="text-gray-500 mb-1">社交关系 ({社交网络.关系列表.length})</div>
          <div className="space-y-1">
            {社交网络.关系列表.map((关系: NPC关系, i: number) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={关系颜色[关系.关系类型]}>
                    {关系.关系类型}
                  </span>
                  <span className="text-gray-300">{关系.目标姓名}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-16 bg-gray-700 rounded-full h-1.5">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${关系.关系强度}%` }}
                    />
                  </div>
                  <span className="text-gray-500 text-xs">{关系.关系强度}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {社交网络.声誉记录.length > 0 && (
        <div>
          <div className="text-gray-500 mb-1">声誉</div>
          <div className="space-y-1">
            {社交网络.声誉记录.map((记录, i: number) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-gray-400">{记录.圈子}</span>
                <span className={记录.声誉值 >= 0 ? 'text-green-400' : 'text-red-400'}>
                  {记录.声誉值 > 0 ? '+' : ''}{记录.声誉值}
                </span>
                {记录.标签.length > 0 && (
                  <div className="flex gap-1">
                    {记录.标签.slice(0, 3).map((标签: string, j: number) => (
                      <span key={j} className="text-xs text-gray-500">#{标签}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {社交网络.流言列表.length > 0 && !isSmall && (
        <div>
          <div className="text-gray-500 mb-1">流言 ({社交网络.流言列表.length})</div>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {社交网络.流言列表.map((流言: 流言) => (
              <div key={流言.id} className="text-xs text-gray-400">
                <span className={严重度颜色[流言.严重度]}>[{流言.严重度}]</span>
                <span className="ml-1">{流言.内容.slice(0, 30)}{流言.内容.length > 30 ? '...' : ''}</span>
                <span className="ml-1 text-gray-600">
                  ({流言.传播范围.length}人知道)
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
