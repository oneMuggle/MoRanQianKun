import React from 'react';

interface ResidentNpc {
  id: string;
  name: string;
  title?: string;
  isAtHome: boolean;
  intimacy?: number;
  hasEvent: boolean;
}

interface Props {
  regionName: string;
  npcs: ResidentNpc[];
  onVisit: (npcId: string) => void;
  onClose: () => void;
}

export const NpcResidencePanel: React.FC<Props> = ({ regionName, npcs, onVisit, onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70" onClick={onClose}>
    <div className="max-w-lg w-full mx-4 bg-gray-900 rounded-lg p-6 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-wuxia-gold">{regionName}</h2>
        <button className="text-gray-400 hover:text-white text-xl" onClick={onClose}>×</button>
      </div>
      <div className="space-y-2">
        {npcs.length === 0 ? (
          <p className="text-center text-gray-500 py-8">此处暂无居住者</p>
        ) : (
          npcs.map((npc) => (
            <button
              key={npc.id}
              className={`w-full flex items-center justify-between p-3 rounded border ${npc.isAtHome ? 'border-gray-600 hover:border-wuxia-gold cursor-pointer' : 'border-gray-800 opacity-50 cursor-not-allowed'}`}
              onClick={() => npc.isAtHome && onVisit(npc.id)}
            >
              <div className="text-left">
                <p className="text-white font-medium">{npc.name}</p>
                {npc.title && <p className="text-xs text-gray-500">{npc.title}</p>}
              </div>
              <div className="text-right">
                {npc.isAtHome ? (
                  npc.hasEvent ? (
                    <span className="text-purple-400 text-sm">有新事件</span>
                  ) : (
                    <span className="text-emerald-400 text-sm">在家</span>
                  )
                ) : (
                  <span className="text-gray-600 text-sm">外出中</span>
                )}
                {npc.intimacy !== undefined && (
                  <p className="text-xs text-pink-400">好感: {npc.intimacy}</p>
                )}
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  </div>
);
