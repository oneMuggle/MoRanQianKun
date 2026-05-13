/**
 * avgDialogueEngine.ts
 *
 * AVG 对话树引擎 — 管理对话树的解析、执行、条件分支和动态节点插入。
 */

import { BaseEngine } from '../engine/baseEngine';
import type {
  GameEvent,
  GameStateSnapshot,
  NarrativeConstraint,
  TurnResult,
  PlayerAction,
  ActionResult,
  EngineType,
} from '../engine/types';
import type {
  DialogueTree,
  DialogueNode,
  DialogueState,
  DialogueHistoryEntry,
  DialogueChoice,
  DialogueAction,
} from '../../../models/avg/dialogueTree';
import { NodeResolver, createNodeResolver } from '../avg/dialogue/nodeResolver';
import type { GameContext } from '../avg/dialogue/conditionEvaluator';
import { ConditionEvaluator } from '../avg/dialogue/conditionEvaluator';

export interface AvgDialogueState {
  currentTreeId: string | null;
  dialogueState: DialogueState | null;
  gameContext: GameContext;
  treeCount: number;
}

export class AvgDialogueEngine extends BaseEngine {
  private _trees: Map<string, DialogueTree>;
  private _currentTreeId: string | null = null;
  private _dialogueState: DialogueState | null = null;
  private _gameContext: GameContext;
  private _resolver: NodeResolver;
  private _turnNumber = 0;

  constructor(initialContext?: Partial<GameContext>) {
    super('avgDialogue' as EngineType);

    this._trees = new Map();
    this._gameContext = {
      stats: {},
      intimacy: {},
      tasks: {},
      items: [],
      flags: {},
      ...initialContext,
    };
    this._resolver = createNodeResolver(this._gameContext);
  }

  // ==================== 公开 getter ====================

  get currentTreeId(): string | null {
    return this._currentTreeId;
  }

  get dialogueState(): DialogueState | null {
    return this._dialogueState;
  }

  get turnNumber(): number {
    return this._turnNumber;
  }

  get trees(): ReadonlyMap<string, DialogueTree> {
    return this._trees;
  }

  // ==================== 树管理 ====================

  registerTree(tree: DialogueTree): void {
    this._trees.set(tree.id, { ...tree });
  }

  removeTree(treeId: string): void {
    this._trees.delete(treeId);
    if (this._currentTreeId === treeId) {
      this._currentTreeId = null;
      this._dialogueState = null;
    }
  }

  getTree(treeId: string): DialogueTree | undefined {
    return this._trees.get(treeId);
  }

  getAllTreeIds(): string[] {
    return Array.from(this._trees.keys());
  }

  // ==================== 上下文管理 ====================

  updateContext(context: Partial<GameContext>): void {
    this._gameContext = {
      ...this._gameContext,
      ...context,
      stats: { ...this._gameContext.stats, ...(context.stats ?? {}) },
      intimacy: { ...this._gameContext.intimacy, ...(context.intimacy ?? {}) },
      tasks: { ...this._gameContext.tasks, ...(context.tasks ?? {}) },
      items: context.items
        ? [...new Set([...this._gameContext.items, ...context.items])]
        : this._gameContext.items,
      flags: { ...this._gameContext.flags, ...(context.flags ?? {}) },
    };
    this._resolver.updateContext(context);
  }

  getContext(): GameContext {
    return { ...this._gameContext };
  }

  // ==================== 对话执行 ====================

  startTree(treeId: string): boolean {
    const tree = this._trees.get(treeId);
    if (!tree) return false;

    const root = tree.nodes.find((n) => n.id === tree.rootNodeId);
    if (!root) return false;

    this._currentTreeId = treeId;
    this._dialogueState = {
      treeId,
      currentNodeId: tree.rootNodeId,
      visitedNodeIds: [],
      history: [],
      isComplete: false,
    };

    this._publishEvent('DIALOGUE_START', `开始对话: ${tree.name}`);
    return true;
  }

  advance(): ActionResult {
    if (!this._currentTreeId || !this._dialogueState) {
      return this._failResult('没有正在进行的对话');
    }

    const tree = this._trees.get(this._currentTreeId);
    if (!tree) return this._failResult('对话树不存在');

    const result = this._resolver.resolve(tree.nodes, this._dialogueState);
    if (!result) {
      return this._failResult('节点解析失败（条件不满足或节点不存在）');
    }

    this._dialogueState = result.state;
    this._turnNumber++;

    if (result.state.isComplete) {
      this._publishEvent('DIALOGUE_END', `对话结束: ${tree.name}`);
    }

    const narrativeText = this._buildNarrative(result);

    return {
      success: true,
      stateUpdates: {
        currentNodeId: result.state.currentNodeId,
        isComplete: result.state.isComplete,
      },
      narrativeConstraint: narrativeText,
      keyStep: result.state.isComplete,
      sideEffects: [],
    };
  }

  choose(choiceId: string): ActionResult {
    if (!this._currentTreeId || !this._dialogueState) {
      return this._failResult('没有正在进行的对话');
    }

    const tree = this._trees.get(this._currentTreeId);
    if (!tree) return this._failResult('对话树不存在');

    const result = this._resolver.resolve(tree.nodes, this._dialogueState, choiceId);
    if (!result) {
      return this._failResult('选项不可用或条件不满足');
    }

    this._dialogueState = result.state;
    this._turnNumber++;

    const narrativeText = this._buildNarrative(result);

    return {
      success: true,
      stateUpdates: {
        currentNodeId: result.state.currentNodeId,
        chosenChoiceId: choiceId,
      },
      narrativeConstraint: narrativeText,
      keyStep: false,
      sideEffects: [],
    };
  }

  end(): void {
    if (this._currentTreeId) {
      const tree = this._trees.get(this._currentTreeId);
      if (tree) {
        this._publishEvent('DIALOGUE_END', `提前结束对话: ${tree.name}`);
      }
    }
    this._currentTreeId = null;
    this._dialogueState = null;
  }

  // ==================== 查询 ====================

  getAvailableChoices(): { id: string; text: string; consequenceHint?: string }[] {
    if (!this._currentTreeId || !this._dialogueState) return [];

    const tree = this._trees.get(this._currentTreeId);
    if (!tree) return [];

    const node = tree.nodes.find((n) => n.id === this._dialogueState?.currentNodeId);
    if (!node || !node.choices) return [];

    const evaluator = new ConditionEvaluator(this._gameContext);
    return evaluator.evaluateChoices(node.choices).map((c) => ({
      id: c.id,
      text: c.text,
      consequenceHint: c.consequenceHint,
    }));
  }

  getCurrentNode(): DialogueNode | null {
    if (!this._currentTreeId || !this._dialogueState) return null;

    const tree = this._trees.get(this._currentTreeId);
    if (!tree) return null;

    return tree.nodes.find((n) => n.id === this._dialogueState?.currentNodeId) ?? null;
  }

  getHistory(): DialogueHistoryEntry[] {
    return this._dialogueState?.history ?? [];
  }

  getState(): AvgDialogueState {
    return {
      currentTreeId: this._currentTreeId,
      dialogueState: this._dialogueState ? { ...this._dialogueState } : null,
      gameContext: this.getContext(),
      treeCount: this._trees.size,
    };
  }

  // ==================== 动态节点（AI 生成支持） ====================

  /**
   * 在指定节点后插入新节点（支持链式插入）
   */
  insertNode(treeId: string, node: DialogueNode, afterNodeId?: string): boolean {
    const tree = this._trees.get(treeId);
    if (!tree) return false;

    const existingIndex = tree.nodes.findIndex((n) => n.id === node.id);
    if (existingIndex >= 0) return false;

    const updatedNodes = [...tree.nodes, { ...node }];

    if (afterNodeId) {
      const target = updatedNodes.find((n) => n.id === afterNodeId);
      if (target) {
        node.nextNodeId = target.nextNodeId;
        target.nextNodeId = node.id;
      }
    }

    this._trees.set(treeId, { ...tree, nodes: updatedNodes });
    return true;
  }

  /**
   * 批量插入 AI 生成的节点链
   * 节点按数组顺序自动连接（nodes[0]→nodes[1]→...），首节点连接到 afterNodeId
   */
  insertNodes(treeId: string, nodes: DialogueNode[], afterNodeId?: string): boolean {
    if (nodes.length === 0) return false;

    const tree = this._trees.get(treeId);
    if (!tree) return false;

    const existingIds = new Set(tree.nodes.map((n) => n.id));
    const newIds = nodes.map((n) => n.id);
    if (newIds.some((id) => existingIds.has(id))) return false;

    // 自动链接节点链
    for (let i = 0; i < nodes.length - 1; i++) {
      if (!nodes[i].nextNodeId) {
        nodes[i].nextNodeId = nodes[i + 1].id;
      }
    }

    // 连接到目标节点
    if (afterNodeId) {
      const target = tree.nodes.find((n) => n.id === afterNodeId);
      if (target) {
        nodes[nodes.length - 1].nextNodeId = target.nextNodeId;
        target.nextNodeId = nodes[0].id;
      }
    }

    this._trees.set(treeId, {
      ...tree,
      nodes: [...tree.nodes, ...nodes.map((n) => ({ ...n }))],
    });
    return true;
  }

  /**
   * 创建 AI 生成的对话节点（从 AI 返回的结构化数据）
   */
  static createAiNode(params: {
    id: string;
    speaker?: string;
    text: string;
    type?: 'text' | 'choice' | 'action';
    choices?: { id: string; text: string; targetNodeId: string; consequenceHint?: string; actions?: DialogueAction[] }[];
    tags?: string[];
    actions?: DialogueAction[];
  }): DialogueNode {
    return {
      id: params.id,
      type: params.type ?? 'text',
      speaker: params.speaker,
      text: params.text,
      choices: params.choices?.map((c) => ({
        id: c.id,
        text: c.text,
        targetNodeId: c.targetNodeId,
        consequenceHint: c.consequenceHint,
        actions: c.actions ?? [],
      })),
      tags: params.tags,
      actions: params.actions ?? [],
    };
  }

  /**
   * 向已有 choice 节点动态添加选项分支（用于 AI 运行时生成新选项）
   */
  addChoice(treeId: string, nodeId: string, choice: {
    id: string;
    text: string;
    targetNodeId: string;
    consequenceHint?: string;
    actions?: DialogueAction[];
  }): boolean {
    const tree = this._trees.get(treeId);
    if (!tree) return false;

    const node = tree.nodes.find((n) => n.id === nodeId);
    if (!node) return false;
    if (node.type !== 'choice') return false;
    if (node.choices?.some((c) => c.id === choice.id)) return false;

    const newChoice: DialogueChoice = {
      id: choice.id,
      text: choice.text,
      targetNodeId: choice.targetNodeId,
      consequenceHint: choice.consequenceHint,
      actions: choice.actions ?? [],
    };

    const updatedChoices = [...(node.choices ?? []), newChoice];
    const updatedNode = { ...node, choices: updatedChoices };
    const updatedNodes = tree.nodes.map((n) => (n.id === nodeId ? updatedNode : n));

    this._trees.set(treeId, { ...tree, nodes: updatedNodes });
    return true;
  }

  /**
   * 删除指定节点（自动重连 nextNodeId）
   */
  removeNode(treeId: string, nodeId: string): boolean {
    const tree = this._trees.get(treeId);
    if (!tree) return false;
    if (nodeId === tree.rootNodeId) return false;

    const target = tree.nodes.find((n) => n.id === nodeId);
    if (!target) return false;

    // 重连所有指向被删除节点的 nextNodeId
    const updatedNodes = tree.nodes
      .filter((n) => n.id !== nodeId)
      .map((n) => {
        if (n.nextNodeId === nodeId) {
          return { ...n, nextNodeId: target.nextNodeId };
        }
        return n;
      });

    this._trees.set(treeId, { ...tree, nodes: updatedNodes });
    return true;
  }

  // ==================== SLGEngine 接口实现 ====================

  advanceTurn(): TurnResult {
    this._turnNumber++;

    const events = this.resolvePendingEvents();

    return {
      turnNumber: this._turnNumber,
      phase: 'narrative',
      eventsTriggered: events.map((e) => e.event),
      stateChanges: [],
    };
  }

  executePlayerAction(action: PlayerAction): ActionResult {
    if (action.type === 'start') {
      const treeId = action.payload.treeId as string | undefined;
      if (!treeId) return this._failResult('缺少对话树 ID');
      const success = this.startTree(treeId);
      return success
        ? {
            success: true,
            stateUpdates: { treeId },
            narrativeConstraint: '<叙事>你开始了新的对话</叙事>',
            keyStep: true,
            sideEffects: [],
          }
        : this._failResult('对话树不存在');
    }

    if (action.type === 'advance') {
      return this.advance();
    }

    if (action.type === 'choose') {
      const choiceId = action.payload.choiceId as string | undefined;
      if (!choiceId) return this._failResult('缺少选项 ID');
      return this.choose(choiceId);
    }

    if (action.type === 'end') {
      this.end();
      return {
        success: true,
        stateUpdates: {},
        narrativeConstraint: '<叙事>你结束了对话</叙事>',
        keyStep: false,
        sideEffects: [],
      };
    }

    return this._failResult(`不支持的操作: ${action.type}`);
  }

  canExecuteAction(action: PlayerAction): boolean {
    if (action.type === 'start') {
      const treeId = action.payload.treeId as string | undefined;
      return !!treeId && this._trees.has(treeId);
    }
    if (action.type === 'advance') return this._currentTreeId !== null;
    if (action.type === 'choose') return this._currentTreeId !== null;
    if (action.type === 'end') return this._currentTreeId !== null;
    return false;
  }

  getSnapshot(): GameStateSnapshot {
    return {
      turnNumber: this._turnNumber,
      timestamp: Date.now(),
      engineStates: {
        avgDialogue: this.getState() as unknown as Record<string, unknown>,
      },
    };
  }

  getNarrativeConstraints(): NarrativeConstraint {
    const currentNode = this.getCurrentNode();
    const speakerName = currentNode?.speaker ?? '旁白';
    const scene = this._currentTreeId
      ? `${speakerName}: ${currentNode?.text ?? '...'}`
      : '当前没有正在进行的对话';

    return {
      scene,
      turn: this._turnNumber,
      tension: 0,
      playerAction: `AVG 对话 — ${this._currentTreeId ?? '无'}`,
      keyStep: this._dialogueState?.isComplete ?? false,
      nsfwTriggered: false,
      participants: [],
      nextEvent: this._dialogueState?.isComplete ? '对话已结束' : '等待玩家选择',
    };
  }

  reset(): void {
    this._currentTreeId = null;
    this._dialogueState = null;
    this._turnNumber = 0;
    this._pendingEvents = [];
    this._trees.clear();
    this._gameContext = { stats: {}, intimacy: {}, tasks: {}, items: [], flags: {} };
  }

  // ==================== 序列化 ====================

  serialize(): Record<string, unknown> {
    return {
      engineType: this.getEngineType(),
      turnNumber: this._turnNumber,
      currentTreeId: this._currentTreeId,
      dialogueState: this._dialogueState,
      treeCount: this._trees.size,
    };
  }

  static fromJSON(state: Record<string, unknown>): AvgDialogueEngine {
    const engine = new AvgDialogueEngine();
    if (typeof state.turnNumber === 'number') engine._turnNumber = state.turnNumber;
    if (typeof state.currentTreeId === 'string') engine._currentTreeId = state.currentTreeId;
    if (state.dialogueState) engine._dialogueState = state.dialogueState as DialogueState;
    return engine;
  }

  // ==================== 内部辅助 ====================

  private _failResult(reason: string): ActionResult {
    return {
      success: false,
      stateUpdates: {},
      narrativeConstraint: `<错误>${reason}</错误>`,
      keyStep: false,
      sideEffects: [],
    };
  }

  private _buildNarrative(result: Awaited<ReturnType<typeof this._resolver.resolve>>): string {
    if (!result) return '<叙事>...</叙事>';

    const { node, availableChoices, historyEntry } = result;
    let text = '';

    if (node.speaker) {
      text += `${node.speaker}: "${node.text}"`;
    } else {
      text += node.text;
    }

    if (availableChoices.length > 0) {
      text += `\n选项: ${availableChoices.map((c) => c.text).join(' | ')}`;
    }

    if (historyEntry.chosenChoiceId) {
      const chosen = availableChoices.find((c) => c.id === historyEntry.chosenChoiceId);
      if (chosen) {
        text += `\n你选择了: ${chosen.text}`;
      }
    }

    return `<叙事>${text}</叙事>`;
  }

  private _publishEvent(type: string, description: string): void {
    const event: GameEvent = {
      id: `avgDialogue-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      engineType: 'avgDialogue' as EngineType,
      type,
      description,
      status: 'pending',
      payload: { treeId: this._currentTreeId, turnNumber: this._turnNumber },
      createdAt: Date.now(),
    };
    this.enqueueEvent(event);
  }
}

export function createAvgDialogueEngine(
  initialContext?: Partial<GameContext>
): AvgDialogueEngine {
  return new AvgDialogueEngine(initialContext);
}
