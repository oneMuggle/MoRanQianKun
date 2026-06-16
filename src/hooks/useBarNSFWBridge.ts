/**
 * useBarNSFWBridge.ts
 *
 * 酒吧 NSFW 叙事桥接层 — 负责：
 * 1. 持有 BarNSFWEngine 实例 ref
 * 2. 发消息时自动暂停酒吧引擎，AI 回复后恢复
 * 3. 引擎状态变更自动同步到 Zustand
 * 4. 生成叙事约束注入 AI prompt
 */

import * as React from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useGameStore } from './useGame/subsystems/zustandStore';
import { BarNSFWEngine } from '../models/contemporary/barNSFW/engine';
import type { 酒吧NSFW设置, 酒吧场景模板 } from '../models/contemporary/barNSFW/types';
import type { NPC结构 } from '../models/social';

export interface UseBarNSFWBridgeReturn {
  engineRef: React.MutableRefObject<BarNSFWEngine | null>;
  enterBar: (sceneTemplate: 酒吧场景模板, npcList: NPC结构[]) => void;
  leaveBar: () => void;
  executeAction: (actionType: string, payload?: Record<string, unknown>) => void;
  onChatMessageSent: () => void;
  onAIReplyReceived: () => void;
  getNarrativeConstraints: () => string | null;
  syncStateToZustand: () => void;
  isPaused: boolean;
  isActive: boolean;
}

interface BridgeExtras {
  apiConfig: any;
}

export function useBarNSFWBridge(_extras?: BridgeExtras): UseBarNSFWBridgeReturn {
  const engineRef = React.useRef<BarNSFWEngine | null>(null);

  const {
    barNSFWActive,
    barNSFWState,
    barNSFWSettings,
    setBarNSFWActive,
    setBarNSFWState,
    setBarNSFWSettings,
    setShowBarNSFWPanel,
    showBarNSFWPanel,
  } = useGameStore(useShallow((s) => ({
    barNSFWActive: s.barNSFWActive,
    barNSFWState: s.barNSFWState,
    barNSFWSettings: s.barNSFWSettings,
    setBarNSFWActive: s.setBarNSFWActive,
    setBarNSFWState: s.setBarNSFWState,
    setBarNSFWSettings: s.setBarNSFWSettings,
    setShowBarNSFWPanel: s.setShowBarNSFWPanel,
    showBarNSFWPanel: s.showBarNSFWPanel,
  })));

  const syncStateToZustand = React.useCallback(() => {
    const engine = engineRef.current;
    if (!engine) return;
    setBarNSFWState({ ...engine.state });
  }, [setBarNSFWState]);

  const enterBar = React.useCallback((sceneTemplate: 酒吧场景模板, npcList: NPC结构[]) => {
    if (!engineRef.current) {
      engineRef.current = new BarNSFWEngine(barNSFWSettings);
    }

    engineRef.current.activate(sceneTemplate, npcList);
    setBarNSFWActive(true);
    setShowBarNSFWPanel(true);
    syncStateToZustand();
  }, [barNSFWSettings, setBarNSFWActive, setShowBarNSFWPanel, syncStateToZustand]);

  const leaveBar = React.useCallback(() => {
    const engine = engineRef.current;
    if (!engine) return;
    engine.deactivate();
    setBarNSFWActive(false);
    setShowBarNSFWPanel(false);
    setBarNSFWState(null);
  }, [setBarNSFWActive, setShowBarNSFWPanel, setBarNSFWState]);

  const executeAction = React.useCallback((actionType: string, payload?: Record<string, unknown>) => {
    const engine = engineRef.current;
    if (!engine || !barNSFWActive) return;

    const action = {
      id: `bar_action_${Date.now()}`,
      engineType: 'barNSFW' as const,
      type: actionType,
      payload: payload || {},
      timestamp: Date.now(),
    };

    const result = engine.executePlayerAction(action);
    syncStateToZustand();

    if (actionType === '离开酒吧') {
      leaveBar();
    }
  }, [barNSFWActive, syncStateToZustand, leaveBar]);

  const onChatMessageSent = React.useCallback(() => {
    const engine = engineRef.current;
    if (engine && !engine.isPaused()) {
      engine.pause('chat-sent');
    }
  }, []);

  const onAIReplyReceived = React.useCallback(() => {
    const engine = engineRef.current;
    if (engine && engine.isPaused() && engine.getPauseReason() === 'chat-sent') {
      engine.resume();
    }
  }, []);

  const getNarrativeConstraints = React.useCallback(() => {
    const engine = engineRef.current;
    if (!engine || !barNSFWActive) return null;
    const constraint = engine.getNarrativeConstraints();

    return `<酒吧NSFW叙事约束>
  场景: ${constraint.scene}
  回合: ${constraint.turn}
  张力: ${constraint.tension}
  玩家行动: ${constraint.playerAction}
  关键步骤: ${constraint.keyStep}
  NSFW触发: ${constraint.nsfwTriggered}
  参与者: ${constraint.participants.map(p => p.name).join(', ') || '无'}
  下一事件: ${constraint.nextEvent}
</酒吧NSFW叙事约束>`;
  }, [barNSFWActive]);

  return {
    engineRef,
    enterBar,
    leaveBar,
    executeAction,
    onChatMessageSent,
    onAIReplyReceived,
    getNarrativeConstraints,
    syncStateToZustand,
    isPaused: engineRef.current?.isPaused() ?? false,
    isActive: barNSFWActive,
  };
}
