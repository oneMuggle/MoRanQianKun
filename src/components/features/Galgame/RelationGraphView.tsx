/**
 * RelationGraphView.tsx
 *
 * AVG/Galgame 关系网络可视化组件 — 基于 SVG 渲染 NPC 关系图谱。
 * 支持缩放、拖拽、点击节点查看详情，关系变化时实时更新。
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { NpcRelationSummary, RelationType } from '../../../models/avg/relationGraph';
import { INTIMACY_LEVEL_LABELS } from '../../../models/avg/relationGraph';

// ── 颜色映射 ──

const RELATION_TYPE_COLORS: Record<RelationType, string> = {
  stranger: '#95A5A6',
  acquaintance: '#BDC3C7',
  familiar: '#4A90D9',
  friend: '#50C878',
  close_friend: '#2ECC71',
  lover: '#E74C3C',
  rival: '#E67E22',
  enemy: '#8B0000',
  master: '#F5A623',
  sect_member: '#9B59B6',
};

const RELATION_TYPE_LABELS: Record<RelationType, string> = {
  stranger: '陌生人',
  acquaintance: '认识',
  familiar: '熟悉',
  friend: '好友',
  close_friend: '挚友',
  lover: '恋人',
  rival: '对手',
  enemy: '敌人',
  master: '师徒',
  sect_member: '同门',
};

// ── 内部类型 ──

interface LayoutNode {
  id: string;
  label: string;
  x: number;
  y: number;
  isPlayer: boolean;
  intimacy: number;
  level: number;
  relationType: RelationType;
}

interface LayoutEdge {
  id: string;
  source: string;
  target: string;
  relationType: RelationType;
  intimacy: number;
}

interface RelationGraphViewProps {
  /** NPC 关系摘要列表 */
  npcRelations: NpcRelationSummary[];
  /** 玩家角色名称 */
  playerName?: string;
  /** 选中 NPC */
  selectedNpcId?: string | null;
  /** 选中回调 */
  onNpcSelect?: (npcId: string) => void;
  /** 画布宽度 */
  width?: number;
  /** 画布高度 */
  height?: number;
}

export const RelationGraphView: React.FC<RelationGraphViewProps> = ({
  npcRelations,
  playerName = '主角',
  selectedNpcId,
  onNpcSelect,
  width = 700,
  height = 500,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [hoveredEdge, setHoveredEdge] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  // ── 径向布局计算 ──

  const { nodes, edges } = useMemo(() => {
    const radius = Math.min(width, height) * 0.35;

    const playerNode: LayoutNode = {
      id: 'player',
      label: playerName,
      x: 0,
      y: 0,
      isPlayer: true,
      intimacy: 0,
      level: 0,
      relationType: 'stranger',
    };

    const npcNodes: LayoutNode[] = npcRelations.map((rel, i) => {
      const angle = (2 * Math.PI * i) / Math.max(npcRelations.length, 1) - Math.PI / 2;
      return {
        id: rel.npcId,
        label: rel.npcId,
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius,
        isPlayer: false,
        intimacy: rel.intimacy,
        level: rel.level,
        relationType: rel.relationType,
      };
    });

    const relationEdges: LayoutEdge[] = npcRelations.map((rel) => ({
      id: `player->${rel.npcId}`,
      source: 'player',
      target: rel.npcId,
      relationType: rel.relationType,
      intimacy: rel.intimacy,
    }));

    return {
      nodes: [playerNode, ...npcNodes],
      edges: relationEdges,
    };
  }, [npcRelations, playerName, width, height]);

  // ── 高亮逻辑 ──

  const connectedNodes = useMemo(() => {
    const targetId = hoveredEdge
      ? edges.find((e) => e.id === hoveredEdge)?.target
      : selectedNode;
    if (!targetId) return null;
    return new Set(['player', targetId]);
  }, [hoveredEdge, selectedNode, edges]);

  // ── 拖拽 ──

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  }, [pan]);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!dragging) return;
      setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
    },
    [dragging, dragStart]
  );

  const handleMouseUp = useCallback(() => {
    setDragging(false);
  }, []);

  // ── 缩放 ──

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoom((z) => Math.max(0.3, Math.min(3, z + delta)));
  }, []);

  // ── 节点点击 ──

  const handleNodeClick = useCallback(
    (nodeId: string) => {
      if (nodeId === 'player') return;
      setSelectedNode((prev) => (prev === nodeId ? null : nodeId));
      onNpcSelect?.(nodeId);
    },
    [onNpcSelect]
  );

  // ── 键盘关闭选中 ──

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedNode(null);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const centerX = width / 2;
  const centerY = height / 2;

  // ── 渲染 ──

  return (
    <div className="relative w-full h-full flex flex-col">
      {/* 顶部工具栏 */}
      <div className="flex items-center justify-between px-3 py-2 shrink-0 border-b border-white/5">
        <div className="text-xs text-wuxia-gold/70 font-serif tracking-wider">
          关系图谱 · <span className="text-wuxia-gold font-bold">{npcRelations.length}</span> 位角色
        </div>
        <div className="flex items-center gap-2 text-[10px] text-gray-500">
          <span>滚轮缩放</span>
          <span>·</span>
          <span>拖拽平移</span>
          <span>·</span>
          <span>点击查看详情</span>
        </div>
      </div>

      {/* 图谱区域 */}
      <div className="flex-1 relative bg-gradient-to-b from-black/80 to-ink-black overflow-hidden">
        <svg
          ref={svgRef}
          width={width}
          height={height}
          className="cursor-grab active:cursor-grabbing w-full h-full"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
        >
          <g transform={`translate(${centerX + pan.x}, ${centerY + pan.y}) scale(${zoom})`}>
            {/* 边 */}
            {edges.map((edge) => {
              const sourceNode = nodes.find((n) => n.id === edge.source);
              const targetNode = nodes.find((n) => n.id === edge.target);
              if (!sourceNode || !targetNode) return null;

              const isHovered = hoveredEdge === edge.id;
              const isDimmed =
                connectedNodes !== null &&
                !connectedNodes.has(edge.source) &&
                !connectedNodes.has(edge.target);
              const color = RELATION_TYPE_COLORS[edge.relationType];
              const opacity = isDimmed ? 0.08 : isHovered ? 1 : 0.5;

              return (
                <g key={edge.id}>
                  <line
                    x1={sourceNode.x}
                    y1={sourceNode.y}
                    x2={targetNode.x}
                    y2={targetNode.y}
                    stroke={color}
                    strokeWidth={isHovered ? 3 : 1.5}
                    opacity={opacity}
                    className="transition-opacity duration-200 cursor-pointer"
                    onMouseEnter={() => setHoveredEdge(edge.id)}
                    onMouseLeave={() => setHoveredEdge(null)}
                  />
                  {/* 好感度标签 */}
                  {isHovered && (
                    <>
                      <circle
                        cx={(sourceNode.x + targetNode.x) / 2}
                        cy={(sourceNode.y + targetNode.y) / 2}
                        r={14}
                        fill="rgba(0,0,0,0.7)"
                        stroke={color}
                        strokeWidth={1}
                      />
                      <text
                        x={(sourceNode.x + targetNode.x) / 2}
                        y={(sourceNode.y + targetNode.y) / 2}
                        textAnchor="middle"
                        dominantBaseline="central"
                        fill={color}
                        fontSize={9}
                        fontFamily="monospace"
                        fontWeight="bold"
                        pointerEvents="none"
                      >
                        {edge.intimacy}
                      </text>
                    </>
                  )}
                </g>
              );
            })}

            {/* 节点 */}
            {nodes.map((node) => {
              const isPlayer = node.isPlayer;
              const isHovered = hoveredNode === node.id;
              const isSelected = selectedNode === node.id || selectedNpcId === node.id;
              const isConnected = connectedNodes?.has(node.id);
              const isDimmed = connectedNodes !== null && !isConnected && !isPlayer;
              const radius = isPlayer ? 30 : 20;

              const nodeColor = isPlayer
                ? '#D4AF37'
                : RELATION_TYPE_COLORS[node.relationType];

              return (
                <g
                  key={node.id}
                  transform={`translate(${node.x}, ${node.y})`}
                  opacity={isDimmed ? 0.15 : 1}
                  className="transition-opacity duration-200"
                  onMouseEnter={() => setHoveredNode(node.id)}
                  onMouseLeave={() => setHoveredNode(null)}
                  onClick={() => handleNodeClick(node.id)}
                >
                  {/* 外圈光晕 */}
                  {(isHovered || isSelected) && (
                    <circle
                      r={radius + 8}
                      fill="none"
                      stroke={nodeColor}
                      strokeWidth={2}
                      opacity={0.4}
                    />
                  )}
                  {/* 节点圆 */}
                  <circle
                    r={radius}
                    fill={isPlayer ? '#1a1a2e' : '#0d0d1a'}
                    stroke={nodeColor}
                    strokeWidth={isSelected ? 3 : isHovered ? 2.5 : 1.5}
                    className={isPlayer ? '' : 'cursor-pointer'}
                  />
                  {/* 首字 */}
                  <text
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill={nodeColor}
                    fontSize={isPlayer ? 16 : 13}
                    fontFamily="serif"
                    fontWeight="bold"
                    pointerEvents="none"
                  >
                    {node.label[0]}
                  </text>
                  {/* 名称标签 */}
                  <text
                    y={radius + 14}
                    textAnchor="middle"
                    fill={isHovered || isSelected ? '#fff' : '#aaa'}
                    fontSize={10}
                    fontFamily="sans-serif"
                    pointerEvents="none"
                  >
                    {node.label}
                  </text>
                  {/* 好感度等级 */}
                  {!isPlayer && (
                    <text
                      y={radius + 26}
                      textAnchor="middle"
                      fill={nodeColor}
                      fontSize={8}
                      fontFamily="sans-serif"
                      opacity={0.7}
                      pointerEvents="none"
                    >
                      {INTIMACY_LEVEL_LABELS[node.level as keyof typeof INTIMACY_LEVEL_LABELS] ?? ''}
                    </text>
                  )}
                </g>
              );
            })}
          </g>
        </svg>

        {/* 左下角：悬停提示 */}
        {(hoveredNode || hoveredEdge) && (
          <div className="absolute bottom-3 left-3 z-10 bg-black/80 border border-wuxia-gold/20 rounded-lg px-3 py-2 text-xs backdrop-blur-sm max-w-[220px]">
            {hoveredNode && (() => {
              const node = nodes.find((n) => n.id === hoveredNode);
              if (!node) return null;
              return (
                <div>
                  <div className="font-serif font-bold text-wuxia-gold">
                    {node.label}
                    {node.isPlayer && <span className="text-[10px] text-gray-500 ml-1">（主角）</span>}
                  </div>
                  {!node.isPlayer && (
                    <div className="text-[10px] text-gray-400 mt-0.5">
                      {RELATION_TYPE_LABELS[node.relationType]} · 好感度 {node.intimacy}
                    </div>
                  )}
                </div>
              );
            })()}
            {hoveredEdge && !hoveredNode && (() => {
              const edge = edges.find((e) => e.id === hoveredEdge);
              const target = nodes.find((n) => n.id === edge?.target);
              if (!edge || !target) return null;
              return (
                <div>
                  <div className="text-gray-300">
                    {playerName} → {target.label}
                  </div>
                  <div className="text-[10px] text-gray-500 mt-0.5">
                    {RELATION_TYPE_LABELS[edge.relationType]} · 好感度 {edge.intimacy}
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* 右下角：缩放指示 */}
        <div className="absolute bottom-3 right-3 z-10 bg-black/60 border border-white/10 rounded px-2 py-1 text-[10px] text-gray-500 font-mono">
          {Math.round(zoom * 100)}%
        </div>
      </div>

      {/* 底部：选中 NPC 详情 */}
      {selectedNode && selectedNode !== 'player' && (() => {
        const node = nodes.find((n) => n.id === selectedNode);
        if (!node) return null;

        return (
          <div className="shrink-0 border-t border-white/5 bg-black/60 px-4 py-3">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold font-serif"
                  style={{
                    backgroundColor: RELATION_TYPE_COLORS[node.relationType] + '22',
                    color: RELATION_TYPE_COLORS[node.relationType],
                    border: `1.5px solid ${RELATION_TYPE_COLORS[node.relationType]}`,
                  }}
                >
                  {node.label[0]}
                </div>
                <div>
                  <div className="text-sm font-bold text-wuxia-gold font-serif">{node.label}</div>
                  <div className="text-[10px] text-gray-500">
                    {RELATION_TYPE_LABELS[node.relationType]}
                  </div>
                </div>
              </div>
              <div className="flex-1" />
              <div className="flex items-center gap-4 text-xs">
                <div>
                  <span className="text-gray-500">好感度</span>
                  <span className="text-wuxia-gold font-mono ml-1 font-bold">{node.intimacy}</span>
                </div>
                <div>
                  <span className="text-gray-500">等级</span>
                  <span className="ml-1" style={{ color: RELATION_TYPE_COLORS[node.relationType] }}>
                    {INTIMACY_LEVEL_LABELS[node.level as keyof typeof INTIMACY_LEVEL_LABELS] ?? '—'}
                  </span>
                </div>
                <div className="w-24">
                  <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.min(100, (node.intimacy / 200) * 100)}%`,
                        backgroundColor: RELATION_TYPE_COLORS[node.relationType],
                      }}
                    />
                  </div>
                </div>
              </div>
              <button
                className="text-[10px] text-gray-500 hover:text-gray-300 ml-2 transition-colors"
                onClick={() => setSelectedNode(null)}
              >
                关闭
              </button>
            </div>
          </div>
        );
      })()}

      {/* 空状态 */}
      {npcRelations.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-gray-600">
            <div className="text-lg font-serif mb-1">暂无关系数据</div>
            <div className="text-xs">与 NPC 互动后将自动生成关系图谱</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RelationGraphView;
