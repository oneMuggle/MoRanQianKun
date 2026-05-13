import React from 'react';
import { useGameStore } from '../../../hooks/useGame/subsystems/zustandStore';
import { useShallow } from 'zustand/react/shallow';
import { MobileMapExplorer } from './MobileMapExplorer';
import { adaptMapData } from '../../../hooks/useGame/exploration/mapNodeAdapter';

interface Props {
  onClose: () => void;
  onMove: (nodeId: string) => void;
}

const MobileMapExplorerModal: React.FC<Props> = ({ onClose, onMove }) => {
  const {
    explorationNodes,
    explorationPaths,
    explorationCurrentAp,
    explorationMaxAp,
    explorationCurrentNodeId,
  } = useGameStore(useShallow((s) => ({
    explorationNodes: s.explorationNodes,
    explorationPaths: s.explorationPaths,
    explorationCurrentAp: s.explorationCurrentAp,
    explorationMaxAp: s.explorationMaxAp,
    explorationCurrentNodeId: s.explorationCurrentNodeId,
  })));

  const adapted = adaptMapData(
    explorationNodes as any[],
    explorationPaths as Array<{ from: string; to: string; actionCost: number }>,
    explorationCurrentNodeId,
  );

  const handleMove = React.useCallback((nodeId: string) => {
    onMove(nodeId);
  }, [onMove]);

  if (adapted.nodes.length === 0) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80" onClick={onClose}>
        <div className="w-full bg-gray-900 p-8 text-center" onClick={(e) => e.stopPropagation()}>
          <p className="text-gray-400">当前没有探索数据</p>
          <button className="mt-4 px-4 py-2 bg-wuxia-gold text-gray-900 rounded" onClick={onClose}>关闭</button>
        </div>
      </div>
    );
  }

  return (
    <MobileMapExplorer
      nodes={adapted.nodes}
      paths={adapted.paths}
      currentActionPoints={explorationCurrentAp}
      maxActionPoints={explorationMaxAp}
      timeOfDay="未知"
      playerSilver={0}
      onMove={handleMove}
      onClose={onClose}
    />
  );
};

export default MobileMapExplorerModal;
