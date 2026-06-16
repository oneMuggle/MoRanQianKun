import React from 'react';
import type { 游戏物品 } from '../../../../models/item';

interface Props {
  shopName: string;
  items: 游戏物品[];
  /** 获取商品售价（铜钱），支持动态定价 */
  getPrice: (item: 游戏物品) => number;
  playerCopper: number;
  onBuy: (item: 游戏物品) => void;
  onClose: () => void;
}

export const WeaponShopPanel: React.FC<Props> = ({ shopName, items, getPrice, playerCopper, onBuy, onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70" onClick={onClose}>
    <div className="max-w-lg w-full mx-4 bg-gray-900 rounded-lg p-6 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-wuxia-gold">{shopName}</h2>
        <button className="text-gray-400 hover:text-white text-xl" onClick={onClose}>×</button>
      </div>
      <p className="text-sm text-gray-400 mb-2">铜钱: <span className="text-amber-400 font-bold">{playerCopper}</span></p>
      <div className="space-y-2">
        {items.map((item) => {
          const price = getPrice(item);
          const canBuy = playerCopper >= price;
          return (
            <button
              key={item.ID}
              className={`w-full flex items-center justify-between p-3 rounded border ${canBuy ? 'border-gray-600 hover:border-wuxia-gold cursor-pointer' : 'border-gray-800 opacity-50 cursor-not-allowed'}`}
              onClick={() => canBuy && onBuy(item)}
            >
              <div className="text-left">
                <p className="text-white font-medium">{item.名称}</p>
                <p className="text-xs text-gray-500">{item.描述 ?? ''}</p>
              </div>
              <span className="text-amber-400 text-sm whitespace-nowrap ml-2">{price} 铜</span>
            </button>
          );
        })}
      </div>
    </div>
  </div>
);
