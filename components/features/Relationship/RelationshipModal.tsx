import React, { useMemo, useState } from 'react';
import type { NPC结构 } from '../../../models/social';
import type { 关系网络数据 } from '../../../models/relationship';
import { 关系分类颜色, 关系分类图标 } from '../../../models/relationship';
import RelationshipDetailPanel from './RelationshipDetailPanel';
import RelationshipGraph from './RelationshipGraph';

interface Props {
  socialList: NPC结构[];
  关系谱: 关系网络数据;
  playerName: string;
  onClose: () => void;
}

const RelationshipModal: React.FC<Props> = ({ socialList, 关系谱, playerName, onClose }) => {
  const [selectedName, setSelectedName] = useState<string>(playerName);
  const [activeTab, setActiveTab] = useState<'detail' | 'graph'>('detail');
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | undefined>(undefined);
  const [searchText, setSearchText] = useState('');

  // 所有人物列表：主角 + NPC
  const allPeople = useMemo(() => {
    const list = [{ 姓名: playerName, id: 'player', 是主角: true }];
    for (const npc of socialList) {
      list.push({ 姓名: npc.姓名, id: npc.id, 是主角: false });
    }
    return list;
  }, [socialList, playerName]);

  // 过滤后的人物列表
  const filteredPeople = useMemo(() => {
    if (!searchText.trim()) return allPeople;
    const keyword = searchText.toLowerCase();
    return allPeople.filter(p => p.姓名.toLowerCase().includes(keyword));
  }, [allPeople, searchText]);

  // 选中人物的主角向关系边
  const selectedEdge = useMemo(() => {
    return 关系谱.关系边列表.find(
      b => (b.主体姓名 === playerName && b.客体姓名 === selectedName) ||
        (b.客体姓名 === playerName && b.主体姓名 === selectedName),
    );
  }, [关系谱, playerName, selectedName]);

  // 所有关系边（用于关联查找）
  const allEdges = 关系谱.关系边列表;

  // 图谱边点击同步
  const handleEdgeClick = (id: string) => {
    setSelectedEdgeId(id);
    const edge = allEdges.find(b => b.id === id);
    if (edge) {
      if (edge.主体姓名 === playerName) {
        setSelectedName(edge.客体姓名);
      } else if (edge.客体姓名 === playerName) {
        setSelectedName(edge.主体姓名);
      }
      setActiveTab('detail');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[200] flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-ink-black/95 w-full max-w-7xl max-h-[90vh] flex flex-col rounded-2xl border border-wuxia-gold/20 shadow-[0_0_80px_rgba(0,0,0,0.9)] shadow-wuxia-gold/10 relative overflow-hidden">

        {/* Header */}
        <div className="h-14 shrink-0 border-b border-white/10 bg-gradient-to-r from-black/80 to-black/40 flex items-center justify-between px-6 relative z-50">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-wuxia-gold animate-pulse shadow-[0_0_10px_rgba(212,175,55,0.8)]"></div>
            <h3 className="text-wuxia-gold font-serif font-bold text-xl tracking-[0.4em] drop-shadow-md">
              人物关系谱
              <span className="text-[10px] text-wuxia-gold/50 ml-2 font-mono tracking-widest border border-wuxia-gold/20 px-2 py-0.5 rounded-full">RELATIONSHIP NETWORK</span>
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-black/50 border border-gray-700 text-gray-400 hover:text-red-400 hover:border-red-400 hover:bg-red-400/10 transition-all hover:rotate-90"
            title="关闭"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 flex overflow-hidden relative">
          {/* 左侧：角色列表 */}
          <div className="w-[280px] shrink-0 border-r border-white/5 bg-gradient-to-b from-black/80 to-black/90 overflow-y-auto custom-scrollbar p-3 relative z-10">
            <div className="mb-3">
              <input
                type="text"
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
                placeholder="搜索角色..."
                className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-gray-300 placeholder-gray-600 focus:border-wuxia-gold/40 focus:outline-none"
              />
            </div>

            <div className="text-[10px] text-wuxia-gold/50 tracking-[0.3em] uppercase mb-3 px-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded bg-wuxia-gold/30 rotate-45"></span>
              角色列表
            </div>

            {/* 主角 */}
            <button
              onClick={() => { setSelectedName(playerName); setSelectedEdgeId(undefined); }}
              className={`w-full text-left p-2 rounded-xl transition-all relative group overflow-hidden flex items-center gap-3 mb-1 ${selectedName === playerName
                ? 'bg-gradient-to-r from-wuxia-gold/20 to-wuxia-gold/5 border border-wuxia-gold/40 shadow-[0_0_15px_rgba(212,175,55,0.15)]'
                : 'border border-transparent hover:border-white/10 hover:bg-white/[0.03]'
                }`}
            >
              {selectedName === playerName && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-wuxia-gold shadow-[0_0_10px_rgba(212,175,55,0.8)] z-10"></div>
              )}
              <div className="w-10 h-10 rounded-lg overflow-hidden border border-wuxia-gold/30 bg-black/50 flex items-center justify-center">
                <span className="font-serif font-bold text-lg text-wuxia-gold/60">{playerName[0]}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className={`font-serif font-bold text-base truncate ${selectedName === playerName ? 'text-wuxia-gold' : 'text-gray-200'}`}>
                  {playerName}
                </div>
                <div className="text-[10px] text-wuxia-gold/50">主角</div>
              </div>
            </button>

            {/* NPC */}
            {filteredPeople.filter(p => !p.是主角).map(person => {
              const edge = 关系谱.关系边列表.find(
                b => b.客体姓名 === person.姓名 || b.主体姓名 === person.姓名,
              );
              const 分类色 = edge ? 关系分类颜色[edge.关系分类] : '#95A5A6';

              return (
                <button
                  key={person.id}
                  onClick={() => { setSelectedName(person.姓名); setSelectedEdgeId(undefined); }}
                  className={`w-full text-left p-2 rounded-xl transition-all relative group overflow-hidden flex items-center gap-3 mb-1 ${selectedName === person.姓名
                    ? 'bg-gradient-to-r from-wuxia-gold/20 to-wuxia-gold/5 border border-wuxia-gold/40 shadow-[0_0_15px_rgba(212,175,55,0.15)]'
                    : 'border border-transparent hover:border-white/10 hover:bg-white/[0.03]'
                    }`}
                >
                  {selectedName === person.姓名 && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-wuxia-gold shadow-[0_0_10px_rgba(212,175,55,0.8)] z-10"></div>
                  )}
                  <div
                    className="w-10 h-10 rounded-lg overflow-hidden border flex items-center justify-center shrink-0"
                    style={{ borderColor: `${分类色}40`, backgroundColor: `${分类色}15` }}
                  >
                    <span className="font-serif font-bold text-lg" style={{ color: 分类色 }}>
                      {person.姓名[0]}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`font-serif font-bold text-base truncate ${selectedName === person.姓名 ? 'text-wuxia-gold' : 'text-gray-200'}`}>
                      {person.姓名}
                    </div>
                    <div className="text-[10px] truncate" style={{ color: 分类色 }}>
                      {edge ? `${edge.关系分类} · ${edge.关系阶段}` : '陌路'}
                    </div>
                  </div>
                </button>
              );
            })}

            {filteredPeople.filter(p => !p.是主角).length === 0 && (
              <div className="text-center text-gray-600 text-xs py-8 font-mono">
                {searchText ? '未找到匹配角色' : '暂无结识之人'}
              </div>
            )}
          </div>

          {/* 右侧：标签页 */}
          <div className="flex-1 flex flex-col relative bg-black shrink-0 w-0 z-10">
            <div className="h-10 shrink-0 border-b border-white/10 bg-black/60 flex items-center px-4 gap-1">
              <button
                onClick={() => setActiveTab('detail')}
                className={`px-3 py-1 text-xs rounded transition-all ${activeTab === 'detail'
                  ? 'bg-wuxia-gold/15 text-wuxia-gold border border-wuxia-gold/30'
                  : 'text-gray-500 hover:text-gray-300'
                  }`}
              >
                关系详情
              </button>
              <button
                onClick={() => setActiveTab('graph')}
                className={`px-3 py-1 text-xs rounded transition-all ${activeTab === 'graph'
                  ? 'bg-wuxia-gold/15 text-wuxia-gold border border-wuxia-gold/30'
                  : 'text-gray-500 hover:text-gray-300'
                  }`}
              >
                关系图谱
              </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-5">
              {activeTab === 'detail' ? (
                selectedName === playerName ? (
                  <div className="space-y-4">
                    <h3 className="text-lg font-serif font-bold text-wuxia-gold tracking-wider">{playerName}</h3>
                    <div className="text-sm text-gray-400">
                      共与 {关系谱.关系边列表.filter(b => b.主体姓名 === playerName || b.客体姓名 === playerName).length} 人建立关系
                    </div>
                    <div className="flex flex-wrap gap-2">
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
                            className="text-[10px] px-2 py-1 rounded-full border font-mono"
                            style={{
                              backgroundColor: `${关系分类颜色[分类]}15`,
                              color: 关系分类颜色[分类],
                              borderColor: `${关系分类颜色[分类]}30`,
                            }}
                          >
                            {关系分类图标[分类]} {分类} {数量}人
                          </span>
                        ));
                      })()}
                    </div>
                    <div className="space-y-2 mt-4">
                      {关系谱.关系边列表
                        .filter(b => b.主体姓名 === playerName || b.客体姓名 === playerName)
                        .map(b => {
                          const 对方 = b.主体姓名 === playerName ? b.客体姓名 : b.主体姓名;
                          const 分类色 = 关系分类颜色[b.关系分类];
                          return (
                            <button
                              key={b.id}
                              onClick={() => setSelectedName(对方)}
                              className="w-full flex items-center justify-between bg-black/30 p-3 rounded-lg border border-white/5 hover:border-wuxia-gold/20 transition-colors text-left"
                            >
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-8 h-8 rounded-full flex items-center justify-center border"
                                  style={{ borderColor: `${分类色}40`, color: 分类色, backgroundColor: `${分类色}10` }}
                                >
                                  {对方[0]}
                                </div>
                                <span className="text-sm text-gray-200 font-serif">{对方}</span>
                              </div>
                              <div className="text-[10px] font-mono" style={{ color: 分类色 }}>
                                {b.关系分类} · {b.关系阶段}
                              </div>
                            </button>
                          );
                        })}
                    </div>
                  </div>
                ) : selectedEdge ? (
                  <RelationshipDetailPanel 关系边={selectedEdge} 关联关系边={allEdges} />
                ) : (
                  <div className="text-center text-gray-500 py-12">
                    <div className="text-4xl mb-3 opacity-30">{selectedName[0]}</div>
                    <div className="text-sm font-serif">{selectedName}暂无与{playerName}的直接关系记录</div>
                  </div>
                )
              ) : (
                <RelationshipGraph
                  网络={关系谱}
                  选中边={selectedEdgeId}
                  on边Click={handleEdgeClick}
                  社交列表={socialList}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RelationshipModal;
