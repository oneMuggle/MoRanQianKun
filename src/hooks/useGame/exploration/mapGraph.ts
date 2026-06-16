/**
 * 地图探索 — 地图节点图
 *
 * 管理节点和路径的增删改查，提供可达节点查询、最短路径等能力。
 */

import type { MapNode, MapPath, MapGraphData, MapNodeType } from '../../../models/exploration/mapNode';

export class MapGraph {
  private _nodes: Map<string, MapNode>;
  private _paths: MapPath[];

  constructor() {
    this._nodes = new Map();
    this._paths = [];
  }

  // ==================== 节点管理 ====================

  addNode(node: MapNode): void {
    this._nodes.set(node.id, { ...node });
  }

  removeNode(nodeId: string): void {
    this._nodes.delete(nodeId);
    this._paths = this._paths.filter((p) => p.from !== nodeId && p.to !== nodeId);
  }

  getNode(nodeId: string): MapNode | undefined {
    return this._nodes.get(nodeId);
  }

  getAllNodes(): MapNode[] {
    return Array.from(this._nodes.values());
  }

  getNodesByType(type: MapNodeType): MapNode[] {
    return this.getAllNodes().filter((n) => n.type === type);
  }

  // ==================== 路径管理 ====================

  addPath(path: MapPath): void {
    this._paths.push({ ...path });
  }

  removePath(from: string, to: string): void {
    this._paths = this._paths.filter((p) => !(p.from === from && p.to === to));
  }

  getPathsFrom(nodeId: string): MapPath[] {
    return this._paths.filter((p) => p.from === nodeId);
  }

  getPathsTo(nodeId: string): MapPath[] {
    return this._paths.filter((p) => p.to === nodeId);
  }

  getAdjacentNodes(nodeId: string): { node: MapNode; path: MapPath }[] {
    const paths = this.getPathsFrom(nodeId);
    return paths
      .map((path) => {
        const node = this._nodes.get(path.to);
        return node ? { node, path } : null;
      })
      .filter((item): item is { node: MapNode; path: MapPath } => item !== null);
  }

  hasPath(from: string, to: string): boolean {
    return this._paths.some((p) => p.from === from && p.to === to);
  }

  // ==================== 迷雾管理 ====================

  revealNode(nodeId: string): void {
    const node = this._nodes.get(nodeId);
    if (node && node.fowState === 'hidden') {
      this._nodes.set(nodeId, { ...node, fowState: 'revealed' });
    }
  }

  markExplored(nodeId: string): void {
    const node = this._nodes.get(nodeId);
    if (node) {
      this._nodes.set(nodeId, { ...node, fowState: 'explored' });
    }
  }

  getAdjacentHiddenNodes(nodeId: string): MapNode[] {
    const adjacent = this.getAdjacentNodes(nodeId);
    return adjacent.filter(({ node }) => node.fowState === 'hidden').map(({ node }) => node);
  }

  // ==================== 路径查询 ====================

  findPath(from: string, to: string): string[] | null {
    if (from === to) return [from];
    if (!this._nodes.has(from) || !this._nodes.has(to)) return null;

    const visited = new Set<string>();
    const queue: Array<{ nodeId: string; path: string[] }> = [{ nodeId: from, path: [from] }];

    while (queue.length > 0) {
      const { nodeId, path } = queue.shift()!;
      if (visited.has(nodeId)) continue;
      visited.add(nodeId);

      const adjacent = this.getAdjacentNodes(nodeId);
      for (const { node } of adjacent) {
        if (node.id === to) return [...path, node.id];
        if (!visited.has(node.id)) {
          queue.push({ nodeId: node.id, path: [...path, node.id] });
        }
      }
    }

    return null;
  }

  // ==================== 序列化 ====================

  getData(): MapGraphData {
    return {
      nodes: this.getAllNodes(),
      paths: [...this._paths],
      currentNodeId: null,
      currentAp: 0,
      maxAp: 0,
    };
  }

  toJSON(): { nodes: MapNode[]; paths: MapPath[] } {
    return {
      nodes: this.getAllNodes().map((n) => ({ ...n })),
      paths: this._paths.map((p) => ({ ...p })),
    };
  }

  static fromJSON(data: { nodes: MapNode[]; paths: MapPath[] }): MapGraph {
    const graph = new MapGraph();
    for (const node of data.nodes) {
      graph.addNode(node);
    }
    for (const path of data.paths) {
      graph.addPath(path);
    }
    return graph;
  }
}

export function createMapGraph(): MapGraph {
  return new MapGraph();
}
