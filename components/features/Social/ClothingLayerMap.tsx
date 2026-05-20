/**
 * 服装层次图主组件
 * 左侧人体热力图 + 右侧选中区域服装层次详情
 */

import { useState, useCallback, useMemo } from 'react';
import type { NPC结构, 服饰部位分类, 服装状态值 } from '../../../models/social';
import { MeridianBodySVG } from './MeridianBodySVG';
import {
  获取服装层次列表,
  获取部位层次摘要,
} from '../../../utils/clothingHelpers';

interface ClothingLayerMapProps {
  npc: NPC结构;
}

const 部位显示名称: Record<服饰部位分类, string> = {
  '上衣': '上衣',
  '下着': '下着',
  '鞋子': '鞋子',
  '袜子': '袜子',
  '内衣': '内衣',
  '内裤': '内裤',
  '配饰': '配饰',
  '头饰': '头饰',
  '外套': '外套',
  '特殊': '特殊',
};

const 状态图标: Record<服装状态值, string> = {
  '穿着': '✓',
  '半敞': '◑',
  '褪下': '▽',
  '移除': '✗',
};

const 部位对应热区: Record<服饰部位分类, string[]> = {
  '上衣': ['胸胸区', '腰腹区'],
  '下着': ['腰腹区', '四肢区'],
  '鞋子': ['四肢区'],
  '袜子': ['四肢区'],
  '内衣': ['胸胸区'],
  '内裤': ['私密区'],
  '配饰': ['头颈区', '胸胸区'],
  '头饰': ['头颈区'],
  '外套': ['头颈区', '胸胸区', '腰腹区'],
  '特殊': ['胸胸区', '腰腹区', '四肢区'],
};

export const ClothingLayerMap = ({ npc }: ClothingLayerMapProps) => {
  const [选中部位, set选中部位] = useState<服饰部位分类 | null>(null);

  const 层次列表 = useMemo(() => 获取服装层次列表(npc), [npc]);
  const 部位摘要 = useMemo(() => 获取部位层次摘要(npc), [npc]);

  const 已装备部位 = useMemo(
    () => 层次列表.map(item => item.部位),
    [层次列表]
  );

  const highlightedRegions = useMemo(() => {
    if (!选中部位) return [];
    return 部位对应热区[选中部位] || [];
  }, [选中部位]);

  const handleRegionClick = useCallback((区域: string) => {
    const matchingPart = 已装备部位.find(部位 =>
      部位对应热区[部位].includes(区域)
    );
    if (matchingPart) {
      set选中部位(matchingPart);
    }
  }, [已装备部位]);

  const 选中层次 = useMemo(
    () => 选中部位
      ? 层次列表.filter(item => item.部位 === 选中部位)
      : 层次列表,
    [选中部位, 层次列表]
  );

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-3 py-2 border-b border-wuxia-gold/20">
        <span className="text-sm font-bold text-wuxia-gold">服装层次图</span>
        {选中部位 && (
          <button
            onClick={() => set选中部位(null)}
            className="px-2 py-0.5 text-xs rounded border border-gray-600 text-gray-400 hover:text-gray-300"
          >
            显示全部
          </button>
        )}
      </div>

      <div className="flex flex-1 min-h-0">
        {/* 左侧：人体热力图 */}
        <div className="w-1/2 relative p-4">
          <MeridianBodySVG
            视图="正面"
            onRegionClick={handleRegionClick}
            highlightedRegions={highlightedRegions}
          />

          <div className="absolute bottom-2 left-2 right-2">
            <div className="flex flex-wrap gap-1 justify-center">
              {已装备部位.map(部位 => (
                <button
                  key={部位}
                  onClick={() => set选中部位(部位 === 选中部位 ? null : 部位)}
                  className={`px-1.5 py-0.5 text-[10px] rounded transition-colors ${
                    选中部位 === 部位
                      ? 'bg-wuxia-gold/30 text-wuxia-gold border border-wuxia-gold/50'
                      : 'bg-black/40 text-gray-400 border border-gray-700/50 hover:text-gray-300'
                  }`}
                >
                  {部位显示名称[部位]}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 右侧：服装层次详情 */}
        <div className="w-1/2 border-l border-gray-700/30 overflow-y-auto">
          {选中层次.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-500 text-sm">
              未装备任何服装
            </div>
          ) : (
            <div className="p-3 space-y-2">
              {选中层次.map((item, index) => (
                <div
                  key={`${item.部位}-${index}`}
                  className="rounded border border-gray-700/40 bg-black/20 p-2"
                >
                  <div className="flex items-center gap-2">
                    {item.状态 && (
                      <span className={`text-sm ${item.颜色标识}`} title={item.状态}>
                        {状态图标[item.状态]}
                      </span>
                    )}
                    <span className="text-sm font-medium text-gray-200">
                      {item.名称}
                    </span>
                    <span className="text-xs text-gray-500 ml-auto">
                      第 {item.层次深度 + 1} 层
                    </span>
                  </div>

                  {item.描述 && (
                    <div className="text-xs text-gray-400 mt-1 leading-relaxed">
                      {item.描述}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 底部：层次深度指示条 */}
      <div className="border-t border-gray-700/30 px-3 py-2">
        <div className="text-xs text-gray-500 mb-1">层次深度</div>
        <div className="flex items-center gap-1">
          {(['外套', '上衣', '下着', '鞋子', '袜子', '配饰', '头饰', '内衣', '内裤'] as 服饰部位分类[]).map(部位 => {
            const summary = 部位摘要[部位];
            if (!summary.有无服装) return null;

            const hasStatus = !!summary.状态;
            const statusColor = hasStatus
              ? {
                  '穿着': 'bg-green-500',
                  '半敞': 'bg-yellow-500',
                  '褪下': 'bg-orange-500',
                  '移除': 'bg-red-500',
                }[summary.状态!]
              : 'bg-gray-500';

            return (
              <button
                key={部位}
                onClick={() => set选中部位(部位 === 选中部位 ? null : 部位)}
                className={`flex-1 h-5 rounded text-[9px] flex items-center justify-center transition-all ${
                  选中部位 === 部位
                    ? `${statusColor} text-white font-bold`
                    : `${statusColor}/60 text-gray-300 hover:opacity-80`
                }`}
                title={`${部位}: ${summary.名称 || '无'}`}
              >
                {部位显示名称[部位].slice(0, 1)}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ClothingLayerMap;
