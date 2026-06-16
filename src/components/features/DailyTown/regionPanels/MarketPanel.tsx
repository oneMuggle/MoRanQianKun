import React from 'react';

export interface MarketStall {
  id: string;
  vendorName: string;
  itemName: string;
  description: string;
  price: number;
  isDiscount?: boolean;
  isSpecial?: boolean;
}

interface Props {
  shopName: string;
  stalls: MarketStall[];
  playerCopper: number;
  onBuy: (stall: MarketStall) => void;
  onClose: () => void;
}

export const MarketPanel: React.FC<Props> = ({ shopName, stalls, playerCopper, onBuy, onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70" onClick={onClose}>
    <div className="max-w-lg w-full mx-4 bg-gray-900 rounded-lg p-6 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-wuxia-gold">{shopName}</h2>
        <button className="text-gray-400 hover:text-white text-xl" onClick={onClose}>×</button>
      </div>
      <p className="text-sm text-gray-400 mb-2">铜钱: <span className="text-amber-400 font-bold">{playerCopper}</span></p>
      <div className="space-y-2">
        {stalls.length === 0 ? (
          <p className="text-center text-gray-500 py-8">今日市集无人摆摊</p>
        ) : (
          stalls.map((stall) => {
            const canBuy = playerCopper >= stall.price;
            return (
              <button
                key={stall.id}
                className={`w-full flex items-center justify-between p-3 rounded border ${canBuy ? 'border-gray-600 hover:border-wuxia-gold cursor-pointer' : 'border-gray-800 opacity-50 cursor-not-allowed'}`}
                onClick={() => canBuy && onBuy(stall)}
              >
                <div className="text-left flex-1">
                  <p className="text-white font-medium">
                    {stall.itemName}
                    {stall.isDiscount && <span className="ml-2 text-xs text-red-400">限时折扣</span>}
                    {stall.isSpecial && <span className="ml-2 text-xs text-purple-400">特殊客人</span>}
                  </p>
                  <p className="text-xs text-gray-500">摊主: {stall.vendorName}</p>
                  <p className="text-xs text-gray-500">{stall.description}</p>
                </div>
                <span className={`text-sm whitespace-nowrap ml-2 ${stall.isDiscount ? 'text-red-400 line-through' : 'text-amber-400'}`}>
                  {stall.price} 铜
                </span>
              </button>
            );
          })
        )}
      </div>
    </div>
  </div>
);
