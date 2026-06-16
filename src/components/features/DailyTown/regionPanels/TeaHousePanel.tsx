import React from 'react';

interface NpcEntry {
  id: string;
  name: string;
  title?: string;
  isPresent: boolean;
  isAvailable: boolean;
  intimacy?: number;
}

interface Props {
  shopName: string;
  npcs: NpcEntry[];
  onChat: (npcId: string) => void;
  onClose: () => void;
}

export const TeaHousePanel: React.FC<Props> = ({ shopName, npcs, onChat, onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70" onClick={onClose}>
    <div className="max-w-lg w-full mx-4 bg-gray-900 rounded-lg p-6 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-wuxia-gold">{shopName}</h2>
        <button className="text-gray-400 hover:text-white text-xl" onClick={onClose}>×</button>
      </div>
      <p className="text-sm text-gray-400 mb-2">在此饮茶闲聊的客官</p>
      <div className="space-y-2">
        {npcs.length === 0 ? (
          <p className="text-center text-gray-500 py-8">今日茶楼空无一人</p>
        ) : (
          npcs.map((npc) => (
            <button
              key={npc.id}
              className={`w-full flex items-center justify-between p-3 rounded border ${npc.isPresent && npc.isAvailable ? 'border-gray-600 hover:border-wuxia-gold cursor-pointer' : 'border-gray-800 opacity-50 cursor-not-allowed'}`}
              onClick={() => npc.isPresent && npc.isAvailable && onChat(npc.id)}
            >
              <div className="text-left">
                <p className="text-white font-medium">{npc.name}</p>
                {npc.title && <p className="text-xs text-gray-500">{npc.title}</p>}
              </div>
              <div className="text-right">
                {npc.isPresent ? (
                  npc.isAvailable ? (
                    <span className="text-emerald-400 text-sm">可闲聊</span>
                  ) : (
                    <span className="text-yellow-400 text-sm">忙碌中</span>
                  )
                ) : (
                  <span className="text-gray-600 text-sm">不在</span>
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
