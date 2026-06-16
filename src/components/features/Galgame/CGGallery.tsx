import React, { useMemo, useState } from 'react';
import type { GalgameCG } from '../../../models/avg/galgame';

interface Props {
  allCGs: GalgameCG[];
  onClose: () => void;
}

type RouteFilter = '全部' | '已解锁' | '未解锁';

const filterTabs: RouteFilter[] = ['全部', '已解锁', '未解锁'];

export const CGGallery: React.FC<Props> = ({ allCGs, onClose }) => {
  const [filter, setFilter] = useState<RouteFilter>('全部');
  const [selectedRoute, setSelectedRoute] = useState<string | null>(null);
  const [selectedCG, setSelectedCG] = useState<GalgameCG | null>(null);

  const routeIds = useMemo(
    () => [...new Set(allCGs.map((cg) => cg.routeId))],
    [allCGs]
  );

  const filteredCGs = useMemo(() => {
    let result = allCGs;
    if (selectedRoute) {
      result = result.filter((cg) => cg.routeId === selectedRoute);
    }
    switch (filter) {
      case '已解锁':
        return result.filter((cg) => cg.unlocked);
      case '未解锁':
        return result.filter((cg) => !cg.unlocked);
      default:
        return result;
    }
  }, [allCGs, filter, selectedRoute]);

  const stats = useMemo(() => {
    const unlocked = allCGs.filter((cg) => cg.unlocked).length;
    return { total: allCGs.length, unlocked, locked: allCGs.length - unlocked };
  }, [allCGs]);

  const getUnlockConditionText = (cg: GalgameCG): string => {
    const c = cg.unlockCondition;
    switch (c.type) {
      case 'intimacy_reached':
        return `好感度达到 ${c.value}`;
      case 'event_triggered':
        return `触发事件: ${c.field}`;
      case 'ending_reached':
        return `达成结局: ${c.field}`;
      case 'flag_set':
        return `条件: ${c.field}`;
      default:
        return '未知条件';
    }
  };

  if (selectedCG) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80" onClick={() => setSelectedCG(null)}>
        <div className="max-w-2xl w-full mx-4 bg-gray-900 rounded-lg p-6" onClick={(e) => e.stopPropagation()}>
          <h3 className="text-xl font-bold text-wuxia-gold mb-2">{selectedCG.title}</h3>
          <p className="text-sm text-gray-400 mb-4">{selectedCG.description}</p>
          {selectedCG.unlocked ? (
            <div>
              {selectedCG.imageUrl ? (
                <img src={selectedCG.imageUrl} alt={selectedCG.title} className="w-full rounded-lg mb-4" />
              ) : (
                <div className="w-full h-64 bg-gray-800 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-gray-500 text-lg">CG 图片未加载</span>
                </div>
              )}
              <p className="text-xs text-gray-500">
                解锁时间: {selectedCG.unlockedAt ? new Date(selectedCG.unlockedAt).toLocaleString() : '未知'}
              </p>
            </div>
          ) : (
            <div className="w-full h-64 bg-gray-800 rounded-lg flex items-center justify-center mb-4">
              <div className="text-center">
                <svg className="w-16 h-16 mx-auto text-gray-600 mb-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM12 17c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zM15.1 8H8.9V6c0-1.71 1.39-3.1 3.1-3.1s3.1 1.39 3.1 3.1v2z" />
                </svg>
                <p className="text-gray-500">未解锁</p>
                <p className="text-gray-600 text-xs mt-1">条件: {getUnlockConditionText(selectedCG)}</p>
              </div>
            </div>
          )}
          <button
            className="mt-4 px-4 py-2 bg-gray-700 text-gray-200 rounded hover:bg-gray-600"
            onClick={() => setSelectedCG(null)}
          >
            返回图鉴
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70" onClick={onClose}>
      <div className="max-w-4xl w-full mx-4 bg-gray-900 rounded-lg p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-wuxia-gold">CG 图鉴</h2>
          <button className="text-gray-400 hover:text-white text-xl" onClick={onClose}>×</button>
        </div>

        <div className="flex gap-4 mb-4 text-sm">
          <span className="text-gray-400">总计: <span className="text-white font-bold">{stats.total}</span></span>
          <span className="text-emerald-400">已解锁: <span className="font-bold">{stats.unlocked}</span></span>
          <span className="text-gray-500">未解锁: <span className="font-bold">{stats.locked}</span></span>
        </div>

        {routeIds.length > 1 && (
          <div className="flex gap-2 mb-3 flex-wrap">
            <button
              className={`px-3 py-1 rounded text-sm ${!selectedRoute ? 'bg-wuxia-gold text-gray-900' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
              onClick={() => setSelectedRoute(null)}
            >
              全部路线
            </button>
            {routeIds.map((id) => (
              <button
                key={id}
                className={`px-3 py-1 rounded text-sm ${selectedRoute === id ? 'bg-wuxia-gold text-gray-900' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                onClick={() => setSelectedRoute(selectedRoute === id ? null : id)}
              >
                {id}
              </button>
            ))}
          </div>
        )}

        <div className="flex gap-2 mb-4">
          {filterTabs.map((tab) => (
            <button
              key={tab}
              className={`px-3 py-1 rounded text-sm ${filter === tab ? 'bg-wuxia-gold text-gray-900' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
              onClick={() => setFilter(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        {filteredCGs.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>没有符合条件的 CG</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {filteredCGs.map((cg) => (
              <button
                key={cg.id}
                className={`relative rounded-lg overflow-hidden border-2 ${cg.unlocked ? 'border-wuxia-gold/50 hover:border-wuxia-gold cursor-pointer' : 'border-gray-700 opacity-60 cursor-default'}`}
                onClick={() => cg.unlocked && setSelectedCG(cg)}
              >
                {cg.unlocked ? (
                  cg.imageUrl ? (
                    <img src={cg.imageUrl} alt={cg.title} className="w-full h-32 object-cover" />
                  ) : (
                    <div className="w-full h-32 bg-gray-800 flex items-center justify-center">
                      <svg className="w-8 h-8 text-gray-600" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
                      </svg>
                    </div>
                  )
                ) : (
                  <div className="w-full h-32 bg-gray-800 flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-600" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM12 17c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zM15.1 8H8.9V6c0-1.71 1.39-3.1 3.1-3.1s3.1 1.39 3.1 3.1v2z" />
                    </svg>
                  </div>
                )}
                <div className="p-2 bg-gray-900">
                  <p className="text-sm text-white truncate">{cg.unlocked ? cg.title : '???'}</p>
                  <p className="text-xs text-gray-500 truncate">
                    {cg.unlocked ? cg.description : getUnlockConditionText(cg)}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
