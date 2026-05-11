import React, { useMemo, useState } from 'react';
import type { NPC结构 } from '../../../models/social';
import type { 关系网络数据 } from '../../../models/relationship';
import { 关系分类颜色 } from '../../../models/relationship';
import RelationshipDetailPanel from './RelationshipDetailPanel';
import RelationshipGraph from './RelationshipGraph';

interface Props {
  socialList: NPC结构[];
  关系谱: 关系网络数据;
  playerName: string;
  onClose: () => void;
}

const MobileRelationship: React.FC<Props> = ({ socialList, 关系谱, playerName, onClose }) => {
  const [selectedName, setSelectedName] = useState<string>(playerName);
  const [activeTab, setActiveTab] = useState<'list' | 'graph'>('list');
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | undefined>(undefined);
  const [searchText, setSearchText] = useState('');

  const allPeople = useMemo(() => {
    const list = [{ 姓名: playerName, id: 'player', 是主角: true }];
    for (const npc of socialList) {
      list.push({ 姓名: npc.姓名, id: npc.id, 是主角: false });
    }
    return list;
  }, [socialList, playerName]);

  const filteredPeople = useMemo(() => {
    if (!searchText.trim()) return allPeople;
    const keyword = searchText.toLowerCase();
    return allPeople.filter(p => p.姓名.toLowerCase().includes(keyword));
  }, [allPeople, searchText]);

  const selectedEdge = useMemo(() => {
    return 关系谱.关系边列表.find(
      b => (b.主体姓名 === playerName && b.客体姓名 === selectedName) ||
        (b.客体姓名 === playerName && b.主体姓名 === selectedName),
    );
  }, [关系谱, playerName, selectedName]);

  const allEdges = 关系谱.关系边列表;

  const handleEdgeClick = (id: string) => {
    setSelectedEdgeId(id);
    const edge = allEdges.find(b => b.id === id);
    if (edge) {
      if (edge.主体姓名 === playerName) {
        setSelectedName(edge.客体姓名);
      } else if (edge.客体姓名 === playerName) {
        setSelectedName(edge.主体姓名);
      }
      setActiveTab('list');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[200] flex items-end sm:items-center md:hidden animate-fadeIn">
      <div className="bg-ink-black/95 w-full h-full sm:h-[90vh] sm:rounded-2xl border-0 sm:border border-wuxia-gold/20 shadow-[0_0_80px_rgba(0,0,0,0.9)] shadow-wuxia-gold/10 flex flex-col relative overflow-hidden">

        {/* Header */}
        <div className="h-12 shrink-0 border-b border-white/10 bg-gradient-to-r from-black/80 to-black/40 flex items-center justify-between px-4 relative z-50">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-wuxia-gold animate-pulse shadow-[0_0_10px_rgba(212,175,55,0.8)]"></div>
            <h3 className="text-wuxia-gold font-serif font-bold text-lg tracking-[0.2em] drop-shadow-md">
              人物关系谱
              <span className="text-[8px] text-wuxia-gold/50 ml-1.5 font-mono tracking-widest border border-wuxia-gold/20 px-1 py-0.5 rounded-full">RELATIONSHIP</span>
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-full bg-black/50 border border-gray-700 text-gray-400 active:text-red-400 active:border-red-400 active:bg-red-400/10 transition-all active:rotate-90"
            title="关闭"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tab bar */}
        <div className="h-9 shrink-0 border-b border-white/10 bg-black/60 flex items-center px-3 gap-1">
          <button
            onClick={() => setActiveTab('list')}
            className={`px-3 py-1 text-[10px] rounded transition-all ${activeTab === 'list'
              ? 'bg-wuxia-gold/15 text-wuxia-gold border border-wuxia-gold/30'
              : 'text-gray-500'
              }`}
          >
            角色列表
          </button>
          <button
            onClick={() => setActiveTab('graph')}
            className={`px-3 py-1 text-[10px] rounded transition-all ${activeTab === 'graph'
              ? 'bg-wuxia-gold/15 text-wuxia-gold border border-wuxia-gold/30'
              : 'text-gray-500'
              }`}
          >
            关系图谱
          </button>
        </div>

        {/* Content */}
        {activeTab === 'graph' ? (
          <div className="flex-1 overflow-hidden p-2">
            <RelationshipGraph
              网络={关系谱}
              选中边={selectedEdgeId}
              on边Click={handleEdgeClick}
              社交列表={socialList}
            />
          </div>
        ) : (
          <div className="flex-1 flex flex-col overflow-hidden">
            {selectedName === playerName && (
              <>
                <div className="p-2">
                  <input
                    type="text"
                    value={searchText}
                    onChange={e => setSearchText(e.target.value)}
                    placeholder="搜索角色..."
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-gray-300 placeholder-gray-600 focus:border-wuxia-gold/40 focus:outline-none"
                  />
                </div>
                <div className="flex-1 overflow-y-auto no-scrollbar px-2 pb-2">
                  <div className="mb-3 p-3 bg-black/30 rounded-lg border border-white/5">
                    <h4 className="text-sm font-serif font-bold text-wuxia-gold mb-1">{playerName}</h4>
                    <div className="text-[10px] text-gray-500 mb-2">
                      共 {关系谱.关系边列表.filter(b => b.主体姓名 === playerName || b.客体姓名 === playerName).length} 人
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {(() => {
                        const stats: Record<string, number> = {};
                        for (const b of 关系谱.关系边列表) {
                          if (b.主体姓名 === playerName || b.客体姓名 === playerName) {
                            stats[b.关系分类] = (stats[b.关系分类] || 0) + 1;
                          }
                        }
                        return Object.entries(stats).map(([分类, 数量]) => (
                          <span
                            key={分类}
                            className="text-[9px] px-1.5 py-0.5 rounded border font-mono"
                            style={{
                              backgroundColor: `${关系分类颜色[分类]}15`,
                              color: 关系分类颜色[分类],
                              borderColor: `${关系分类颜色[分类]}30`,
                            }}
                          >
                            {分类} {数量}人
                          </span>
                        ));
                      })()}
                    </div>
                  </div>

                  {关系谱.关系边列表
                    .filter(b => b.主体姓名 === playerName || b.客体姓名 === playerName)
                    .map(b => {
                      const 对方 = b.主体姓名 === playerName ? b.客体姓名 : b.主体姓名;
                      const 分类色 = 关系分类颜色[b.关系分类];
                      return (
                        <button
                          key={b.id}
                          onClick={() => setSelectedName(对方)}
                          className="w-full flex items-center justify-between bg-black/20 p-2.5 rounded-lg border border-white/5 mb-1 active:border-wuxia-gold/20"
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className="w-8 h-8 rounded-full flex items-center justify-center border text-xs"
                              style={{ borderColor: `${分类色}40`, color: 分类色, backgroundColor: `${分类色}10` }}
                            >
                              {对方[0]}
                            </div>
                            <span className="text-xs text-gray-200 font-serif">{对方}</span>
                          </div>
                          <div className="text-[9px] font-mono" style={{ color: 分类色 }}>
                            {b.关系分类} · {b.关系阶段}
                          </div>
                        </button>
                      );
                    })}

                  <div className="mt-3 mb-2 text-[9px] text-wuxia-gold/50 tracking-[0.2em] uppercase px-1">
                    全部角色
                  </div>
                  {filteredPeople.filter(p => !p.是主角).map(person => {
                    const edge = 关系谱.关系边列表.find(
                      b => b.客体姓名 === person.姓名 || b.主体姓名 === person.姓名,
                    );
                    const 分类色 = edge ? 关系分类颜色[edge.关系分类] : '#95A5A6';
                    return (
                      <button
                        key={person.id}
                        onClick={() => setSelectedName(person.姓名)}
                        className="w-full flex items-center justify-between bg-black/20 p-2.5 rounded-lg border border-white/5 mb-1 active:border-wuxia-gold/20"
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center border text-xs"
                            style={{ borderColor: `${分类色}40`, color: 分类色, backgroundColor: `${分类色}10` }}
                          >
                            {person.姓名[0]}
                          </div>
                          <span className="text-xs text-gray-200 font-serif">{person.姓名}</span>
                        </div>
                        <div className="text-[9px] font-mono" style={{ color: 分类色 }}>
                          {edge ? `${edge.关系分类} · ${edge.关系阶段}` : '陌路'}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            {selectedName !== playerName && (
              <div className="flex-1 overflow-y-auto no-scrollbar p-3">
                <button
                  onClick={() => setSelectedName(playerName)}
                  className="flex items-center gap-1 text-xs text-wuxia-gold/70 mb-3 active:text-wuxia-gold"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                  </svg>
                  返回
                </button>

                {selectedEdge ? (
                  <RelationshipDetailPanel 关系边={selectedEdge} 关联关系边={allEdges} />
                ) : (
                  <div className="text-center text-gray-500 py-12">
                    <div className="text-4xl mb-3 opacity-30">{selectedName[0]}</div>
                    <div className="text-xs font-serif">{selectedName}暂无与{playerName}的直接关系记录</div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MobileRelationship;
