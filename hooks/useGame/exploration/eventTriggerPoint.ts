/**
 * 地图探索 — 事件触发点
 */

import type { MapNode } from '../../../models/exploration/mapNode';

export interface EventTrigger {
  id: string;
  nodeId: string;
  conditionType: 'always' | 'first_visit' | 'random' | 'stat_check' | 'relationship_check';
  chance?: number;
  statRequirement?: { stat: string; threshold: number };
  relationshipRequirement?: { npcId: string; threshold: number };
  eventId: string;
  oneTime: boolean;
}

export class EventTriggerManager {
  private _triggers: Map<string, EventTrigger[]>;
  private _triggeredIds: Set<string>;

  constructor() {
    this._triggers = new Map();
    this._triggeredIds = new Set();
  }

  addTrigger(trigger: EventTrigger): void {
    const list = this._triggers.get(trigger.nodeId) ?? [];
    list.push({ ...trigger });
    this._triggers.set(trigger.nodeId, list);
  }

  removeTrigger(triggerId: string): void {
    for (const [nodeId, triggers] of this._triggers.entries()) {
      const filtered = triggers.filter((t) => t.id !== triggerId);
      if (filtered.length !== triggers.length) {
        this._triggers.set(nodeId, filtered);
      }
    }
  }

  checkTriggers(
    node: MapNode,
    isFirstVisit: boolean,
    stats: Record<string, number>,
    relationships: Record<string, number>,
  ): EventTrigger[] {
    const triggers = this._triggers.get(node.id) ?? [];
    const triggered: EventTrigger[] = [];

    for (const trigger of triggers) {
      if (this._shouldTrigger(trigger, isFirstVisit, stats, relationships)) {
        triggered.push(trigger);
        if (trigger.oneTime) {
          this._triggeredIds.add(trigger.id);
        }
      }
    }

    return triggered;
  }

  isTriggered(triggerId: string): boolean {
    return this._triggeredIds.has(triggerId);
  }

  private _shouldTrigger(
    trigger: EventTrigger,
    isFirstVisit: boolean,
    stats: Record<string, number>,
    relationships: Record<string, number>,
  ): boolean {
    if (trigger.oneTime && this._triggeredIds.has(trigger.id)) return false;

    switch (trigger.conditionType) {
      case 'always':
        return true;
      case 'first_visit':
        return isFirstVisit;
      case 'random':
        return Math.random() < (trigger.chance ?? 0.1);
      case 'stat_check':
        if (!trigger.statRequirement) return false;
        return (stats[trigger.statRequirement.stat] ?? 0) >= trigger.statRequirement.threshold;
      case 'relationship_check':
        if (!trigger.relationshipRequirement) return false;
        return (relationships[trigger.relationshipRequirement.npcId] ?? 0) >= trigger.relationshipRequirement.threshold;
      default:
        return false;
    }
  }

  getTriggersForNode(nodeId: string): EventTrigger[] {
    return this._triggers.get(nodeId) ?? [];
  }

  toJSON(): { triggers: Record<string, EventTrigger[]>; triggeredIds: string[] } {
    return {
      triggers: Object.fromEntries(this._triggers.entries()),
      triggeredIds: Array.from(this._triggeredIds),
    };
  }

  static fromJSON(data: { triggers: Record<string, EventTrigger[]>; triggeredIds: string[] }): EventTriggerManager {
    const manager = new EventTriggerManager();
    for (const [nodeId, triggers] of Object.entries(data.triggers)) {
      manager._triggers.set(nodeId, triggers);
    }
    for (const id of data.triggeredIds) {
      manager._triggeredIds.add(id);
    }
    return manager;
  }
}

export function createEventTriggerManager(): EventTriggerManager {
  return new EventTriggerManager();
}
