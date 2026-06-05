import React, { useMemo } from 'react';
import type { 游戏物品 } from '../../../models/item';
import type { RegionData } from './RegionPanel';
import { WeaponShopPanel } from './regionPanels/WeaponShopPanel';
import { TavernPanel } from './regionPanels/TavernPanel';
import type { MenuItem } from './regionPanels/TavernPanel';
import { TeaHousePanel } from './regionPanels/TeaHousePanel';
import { MarketPanel, type MarketStall } from './regionPanels/MarketPanel';
import { NpcResidencePanel } from './regionPanels/NpcResidencePanel';

interface Props {
  region: RegionData;
  playerCopper: number;
  onBuyItem: (item: 游戏物品 | MarketStall) => void;
  onOrderFood: (item: MenuItem) => void;
  onChat: (npcId: string) => void;
  onVisitNpc: (npcId: string) => void;
  onClose: () => void;
}

export const MobileRegionPanel: React.FC<Props> = ({ region, playerCopper, onBuyItem, onOrderFood, onChat, onVisitNpc, onClose }) => {
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
