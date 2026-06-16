import React, { useState } from 'react';

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  energyRestore?: number;
  内力Restore?: number;
  buffId?: string;
}

interface Props {
  shopName: string;
  menu: MenuItem[];
  playerCopper: number;
  onOrder: (item: MenuItem) => void;
  onClose: () => void;
}

export const TavernPanel: React.FC<Props> = ({ shopName, menu, playerCopper, onOrder, onClose }) => {
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70" onClick={onClose}>
      <div className="max-w-lg w-full mx-4 bg-gray-900 rounded-lg p-6 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-wuxia-gold">{shopName}</h2>
          <button className="text-gray-400 hover:text-white text-xl" onClick={onClose}>×</button>
        </div>
        <p className="text-sm text-gray-400 mb-2">铜钱: <span className="text-amber-400 font-bold">{playerCopper}</span></p>

        {selectedItem ? (
          <div className="bg-gray-800 rounded-lg p-4 mb-4">
            <h3 className="text-lg font-bold text-white mb-2">{selectedItem.name}</h3>
            <p className="text-sm text-gray-400 mb-3">{selectedItem.description}</p>
            <div className="flex gap-4 text-sm mb-4">
              {selectedItem.energyRestore && (
                <span className="text-emerald-400">精力 +{selectedItem.energyRestore}</span>
              )}
              {selectedItem.内力Restore && (
                <span className="text-blue-400">内力 +{selectedItem.内力Restore}</span>
              )}
              {selectedItem.buffId && (
                <span className="text-purple-400">获得增益</span>
              )}
            </div>
            <div className="flex gap-2">
              <button
                className="px-4 py-2 bg-wuxia-gold text-gray-900 rounded font-bold hover:bg-amber-400 disabled:opacity-50"
                disabled={playerCopper < selectedItem.price}
                onClick={() => { onOrder(selectedItem); setSelectedItem(null); }}
              >
                点餐 ({selectedItem.price} 铜钱)
              </button>
              <button
                className="px-4 py-2 bg-gray-700 text-gray-300 rounded hover:bg-gray-600"
                onClick={() => setSelectedItem(null)}
              >
                返回菜单
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {menu.map((item) => {
              const canOrder = playerCopper >= item.price;
              return (
                <button
                  key={item.id}
                  className={`w-full flex items-center justify-between p-3 rounded border ${canOrder ? 'border-gray-600 hover:border-wuxia-gold cursor-pointer' : 'border-gray-800 opacity-50 cursor-not-allowed'}`}
                  onClick={() => canOrder && setSelectedItem(item)}
                >
                  <div className="text-left">
                    <p className="text-white font-medium">{item.name}</p>
                    <p className="text-xs text-gray-500">{item.description}</p>
                  </div>
                  <span className="text-amber-400 text-sm whitespace-nowrap ml-2">{item.price} 铜</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
