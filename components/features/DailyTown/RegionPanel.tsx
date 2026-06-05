import React, { useMemo } from 'react';
import type { 游戏物品 } from '../../../models/item';
import { WeaponShopPanel } from './regionPanels/WeaponShopPanel';
import { TavernPanel, type MenuItem } from './regionPanels/TavernPanel';
import { TeaHousePanel } from './regionPanels/TeaHousePanel';
import { MarketPanel, type MarketStall } from './regionPanels/MarketPanel';
import { NpcResidencePanel } from './regionPanels/NpcResidencePanel';

export type RegionType = '武器铺' | '酒楼' | '茶楼' | 'NPC居所' | '市集';

interface BaseRegionData {
  type: RegionType;
  name: string;
}

interface WeaponShopData extends BaseRegionData {
  type: '武器铺';
  items: 游戏物品[];
}

interface TavernData extends BaseRegionData {
  type: '酒楼';
  menu: MenuItem[];
}

interface TeaHouseData extends BaseRegionData {
  type: '茶楼';
  npcs: Array<{ id: string; name: string; title?: string; isPresent: boolean; isAvailable: boolean; intimacy?: number }>;
}

interface MarketData extends BaseRegionData {
  type: '市集';
  stalls: MarketStall[];
}

interface NpcResidenceData extends BaseRegionData {
  type: 'NPC居所';
  npcs: Array<{ id: string; name: string; title?: string; isAtHome: boolean; intimacy?: number; hasEvent: boolean }>;
}

export type RegionData = WeaponShopData | TavernData | TeaHouseData | MarketData | NpcResidenceData;

interface Props {
  region: RegionData;
  playerCopper: number;
  onBuyItem: (item: 游戏物品 | MarketStall) => void;
  onOrderFood: (item: MenuItem) => void;
  onChat: (npcId: string) => void;
  onVisitNpc: (npcId: string) => void;
  onClose: () => void;
}

export const RegionPanel: React.FC<Props> = ({ region, playerCopper, onBuyItem, onOrderFood, onChat, onVisitNpc, onClose }) => {
  const priceFn = useMemo(() => (item: 游戏物品) => item.价值, []);

  switch (region.type) {
    case '武器铺':
      return (
        <WeaponShopPanel
          shopName={region.name}
          items={region.items}
          getPrice={priceFn}
          playerCopper={playerCopper}
          onBuy={onBuyItem as (item: 游戏物品) => void}
          onClose={onClose}
        />
      );
    case '酒楼':
      return (
        <TavernPanel
          shopName={region.name}
          menu={region.menu}
          playerCopper={playerCopper}
          onOrder={onOrderFood}
          onClose={onClose}
        />
      );
    case '茶楼':
      return (
        <TeaHousePanel
          shopName={region.name}
          npcs={region.npcs}
          onChat={onChat}
          onClose={onClose}
        />
      );
    case '市集':
      return (
        <MarketPanel
          shopName={region.name}
          stalls={region.stalls}
          playerCopper={playerCopper}
          onBuy={onBuyItem as (stall: MarketStall) => void}
          onClose={onClose}
        />
      );
    case 'NPC居所':
      return (
        <NpcResidencePanel
          regionName={region.name}
          npcs={region.npcs}
          onVisit={onVisitNpc}
          onClose={onClose}
        />
      );
    default:
      return null;
  }
};
