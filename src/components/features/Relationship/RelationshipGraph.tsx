import React, { useCallback, useMemo, useRef, useState } from 'react';
import type { 关系网络数据, 人物关系边, 关系分类, 关系谱阶段 } from '../../../models/relationship';
import { 关系分类颜色, 关系分类图标, 关系谱阶段顺序, 将关系网络转为图谱数据 } from '../../../models/relationship';

interface Props {
  网络: 关系网络数据;
  选中边?: string;
  on边Click: (id: string) => void;
  社交列表?: Array<{ 姓名: string; 性别: '男' | '女' }>;
}

const RelationshipGraph: React.FC<Props> = ({ 网络, 选中边, on边Click, 社交列表 }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [hoveredEdge, setHoveredEdge] = useState<string | null>(null);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // 构建图谱数据（径向布局）
  const 图谱数据 = useMemo(() => {
    const 性别映射 = new Map<string, '男' | '女'>();
    if (社交列表) {
      for (const npc of 社交列表) {
        性别映射.set(npc.姓名, npc.性别);
      }
    }
    return 将关系网络转为图谱数据(网络, 性别映射);
  }, [网络, 社交列表]);

  // 限制显示的节点数
  const MAX_NODES = 20;
  const nodes = useMemo(() => {
    const 非主角 = 图谱数据.nodes.filter(n => !n.是主角);
    const selected = 非主角.slice(0, MAX_NODES);
    return [{ ...图谱数据.nodes.find(n => n.是主角)!, x: 0, y: 0 }, ...selected];
  }, [图谱数据]);

  const edges = useMemo(() => {
    const nodeNames = new Set(nodes.map(n => n.姓名));
    return 图谱数据.edges.filter(e => nodeNames.has(e.source) && nodeNames.has(e.target));
  }, [图谱数据, nodes]);

  // 高亮连接的节点
  const connectedNodes = useMemo(() => {
    if (!hoveredEdge) return null;
    const edge = edges.find(e => e.id === hoveredEdge);
    if (!edge) return null;
    return new Set([edge.source, edge.target]);
  }, [hoveredEdge, edges]);

  // 关系摘要统计
  const 关系摘要 = useMemo(() => {
    const 分类统计: Record<string, number> = {};
    const 阶段统计: Record<string, number> = {};
    for (const edge of 网络.关系边列表) {
      分类统计[edge.关系分类] = (分类统计[edge.关系分类] || 0) + 1;
      阶段统计[edge.关系阶段] = (阶段统计[edge.关系阶段] || 0) + 1;
    }
    return { 分类统计, 阶段统计, 总数: 网络.关系边列表.length };
  }, [网络.关系边列表]);

  // 选中边的详情
  const 选中边详情 = useMemo(() => {
    if (!选中边) return null;
    return 网络.关系边列表.find(e => e.id === 选中边) || null;
  }, [选中边, 网络.关系边列表]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  }, [pan]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragging) return;
    setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  }, [dragging, dragStart]);

  const handleMouseUp = useCallback(() => {
    setDragging(false);
  }, []);

  const svgWidth = 700;
  const svgHeight = 500;
  const centerX = svgWidth / 2;
  const centerY = svgHeight / 2;

  return (
    <div className="flex flex-col h-full gap-4">
      {/* 顶部统计栏 */}
      <div className="flex items-center gap-4 shrink-0">
        <div className="text-xs text-wuxia-gold/70 font-serif tracking-wider">
          关系边 <span className="text-wuxia-gold font-bold text-base">{关系摘要.总数}</span>
        </div>
        <div className="flex-1 h-px bg-white/5" />
        {Object.entries(关系摘要.分类统计).slice(0, 6).map(([分类, count]) => {
          const 颜色 = 关系分类颜色[分类 as 关系分类];
          const 图标 = 关系分类图标[分类 as 关系分类];
          return (
            <div key={分类} className="flex items-center gap-1 text-[11px]">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: 颜色 }} />
              <span className="text-gray-400">{图标}{分类}</span>
              <span className="text-wuxia-gold/80 font-mono">{count}</span>
            </div>
          );
        })}
      </div>

      {/* 图谱 + 详情双栏 */}
      <div className="flex-1 flex min-h-0 gap-4">
        {/* 图谱区域 */}
        <div className="flex-1 relative bg-gradient-to-b from-black to-ink-black rounded-xl border border-white/5 overflow-hidden">
          <div className="absolute top-3 right-3 z-10 text-[9px] text-gray-600 font-mono bg-black/60 px-2 py-1 rounded border border-white/5">
            拖拽平移 · 悬停查看详情
          </div>

          <svg
            ref={svgRef}
            width={svgWidth}
            height={svgHeight}
            className="cursor-grab active:cursor-grabbing w-full h-full"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <g transform={`translate(${centerX + pan.x}, ${centerY + pan.y})`}>
              {/* 边 */}
              {edges.map(edge => {
                const sourceNode = nodes.find(n => n.姓名 === edge.source);
                const targetNode = nodes.find(n => n.姓名 === edge.target);
                if (!sourceNode || !targetNode) return null;

                const isHovered = hoveredEdge === edge.id;
                const isSelected = 选中边 === edge.id;
                const isDimmed = connectedNodes !== null && !connectedNodes.has(edge.source) && !connectedNodes.has(edge.target);
                const 颜色 = 关系分类颜色[edge.关系分类];
                const opacity = isDimmed ? 0.1 : isHovered || isSelected ? 1 : 0.6;

                return (
                  <g key={edge.id}>
                    <line
                      x1={sourceNode.x}
                      y1={sourceNode.y}
                      x2={targetNode.x}
                      y2={targetNode.y}
                      stroke={颜色}
                      strokeWidth={isHovered || isSelected ? 3 : 1.5}
                      opacity={opacity}
                      className="transition-opacity duration-200 cursor-pointer"
                      onMouseEnter={() => setHoveredEdge(edge.id)}
                      onMouseLeave={() => setHoveredEdge(null)}
                      onClick={() => on边Click(edge.id)}
                    />
                    {isHovered && (
                      <circle
                        cx={(sourceNode.x + targetNode.x) / 2}
                        cy={(sourceNode.y + targetNode.y) / 2}
                        r={4}
                        fill={颜色}
                        opacity={0.8}
                      />
                    )}
                  </g>
                );
              })}

              {/* 节点 */}
              {nodes.map(node => {
                const is主角 = node.是主角;
                const isHovered = hoveredNode === node.姓名;
                const isConnected = connectedNodes?.has(node.姓名);
                const isDimmed = connectedNodes !== null && !isConnected && !is主角;
                const radius = is主角 ? 28 : 18;

                let nodeColor: string;
                if (is主角) {
                  nodeColor = '#D4AF37';
                } else if (node.性别 === '女') {
                  nodeColor = '#FFB6C1';
                } else {
                  nodeColor = '#4A90D9';
                }

                return (
                  <g
                    key={node.id}
                    transform={`translate(${node.x}, ${node.y})`}
                    opacity={isDimmed ? 0.15 : 1}
                    className="transition-opacity duration-200"
                    onMouseEnter={() => setHoveredNode(node.姓名)}
                    onMouseLeave={() => setHoveredNode(null)}
                  >
                    {isHovered && (
                      <circle r={radius + 6} fill="none" stroke={nodeColor} strokeWidth={2} opacity={0.4} />
                    )}
                    <circle
                      r={radius}
                      fill={is主角 ? '#1a1a2e' : '#0d0d1a'}
                      stroke={nodeColor}
                      strokeWidth={isHovered ? 3 : 2}
                      className="cursor-pointer"
                    />
                    <text
                      textAnchor="middle"
                      dominantBaseline="central"
                      fill={nodeColor}
                      fontSize={is主角 ? 16 : 12}
                      fontFamily="serif"
                      fontWeight="bold"
                      pointerEvents="none"
                    >
                      {node.姓名[0]}
                    </text>
                    <text
                      y={radius + 14}
                      textAnchor="middle"
                      fill={isHovered ? '#fff' : '#aaa'}
                      fontSize={10}
                      fontFamily="sans-serif"
                      pointerEvents="none"
                    >
                      {node.姓名}
                    </text>
                  </g>
                );
              })}
            </g>
          </svg>

          {/* 悬停工具提示 */}
          {(hoveredEdge || hoveredNode) && (
            <div className="absolute bottom-3 left-3 z-10 bg-black/80 border border-wuxia-gold/20 rounded-lg px-3 py-2 text-xs backdrop-blur-sm">
              {hoveredNode && (() => {
                const node = nodes.find(n => n.姓名 === hoveredNode);
                if (!node) return null;
                return (
                  <div>
                    <div className="font-serif font-bold text-wuxia-gold">{node.姓名}</div>
                    {node.是主角 && <div className="text-[10px] text-gray-500">（主角）</div>}
                  </div>
                );
              })()}
              {hoveredEdge && (() => {
                const edge = edges.find(e => e.id === hoveredEdge);
                if (!edge) return null;
                return (
                  <div className="mt-1 pt-1 border-t border-white/10">
                    <div className="text-gray-300">{edge.source} → {edge.target}</div>
                    <div className="text-[10px] text-gray-500">
                      {edge.关系分类} · {edge.关系阶段}
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>

        {/* 右侧详情面板 */}
        <div className="w-64 shrink-0 flex flex-col gap-3 overflow-y-auto custom-scrollbar">
          {/* 图例 */}
          <div className="bg-black/60 rounded-lg border border-white/10 p-3">
            <div className="text-[10px] text-wuxia-gold/60 uppercase tracking-wider mb-2">关系分类</div>
            <div className="grid grid-cols-3 gap-1.5">
              {(['亲情', '友情', '爱情', '敌对', '师徒', '同门', '主从', '恩仇', '陌路'] as 关系分类[]).map(分类 => (
                <div key={分类} className="flex items-center gap-1 text-[10px]">
                  <span className="w-2 h-2 rounded shrink-0" style={{ backgroundColor: 关系分类颜色[分类] }} />
                  <span className="text-gray-400 truncate">{关系分类图标[分类]}{分类}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 关系阶段 */}
          <div className="bg-black/60 rounded-lg border border-white/10 p-3">
            <div className="text-[10px] text-wuxia-gold/60 uppercase tracking-wider mb-2">关系阶段</div>
            <div className="space-y-1">
              {关系谱阶段顺序.map((阶段, idx) => {
                const count = 关系摘要.阶段统计[阶段] || 0;
                return (
                  <div key={阶段} className="flex items-center gap-2 text-[10px]">
                    <div className="flex-1 flex items-center gap-1">
                      <span className={`w-1.5 h-1.5 rounded ${count > 0 ? 'bg-wuxia-gold/60' : 'bg-gray-700'}`} />
                      <span className={count > 0 ? 'text-gray-300' : 'text-gray-600'}>{阶段}</span>
                    </div>
                    {count > 0 && <span className="text-wuxia-gold/70 font-mono">{count}</span>}
                  </div>
                );
              })}
            </div>
          </div>

          {/* 选中边详情 */}
          {选中边详情 ? (
            <div className="bg-black/60 rounded-lg border border-wuxia-gold/20 p-3">
              <div className="text-[10px] text-wuxia-gold/60 uppercase tracking-wider mb-2">关系详情</div>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">{选中边详情.主体姓名}</span>
                  <span className="text-wuxia-gold/40">→</span>
                  <span className="text-gray-400">{选中边详情.客体姓名}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded" style={{ backgroundColor: 关系分类颜色[选中边详情.关系分类] }} />
                  <span className="text-gray-300">{选中边详情.关系分类}</span>
                </div>
                <div className="text-[11px] text-gray-400">阶段: <span className="text-wuxia-gold/80">{选中边详情.关系阶段}</span></div>
                <div className="text-[11px] text-gray-400">好感度: <span className="text-wuxia-gold/80">{选中边详情.好感度}</span></div>
                <div className="text-[11px] text-gray-400">亲密度: <span className="text-wuxia-gold/80">{选中边详情.亲密度}</span></div>
                <div className="text-[11px] text-gray-400">信任度: <span className="text-wuxia-gold/80">{选中边详情.信任度}</span></div>
                <div className="text-[11px] text-gray-400">互动次数: <span className="text-wuxia-gold/80">{选中边详情.互动次数}</span></div>
                {选中边详情.关系描述 && (
                  <div className="text-[11px] text-gray-400 pt-1 border-t border-white/5">
                    <span className="text-gray-500">描述:</span>
                    <p className="text-gray-300 leading-relaxed mt-1">{选中边详情.关系描述}</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-black/40 rounded-lg border border-dashed border-white/10 p-3 text-center">
              <div className="text-[10px] text-gray-600">点击关系线查看详情</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RelationshipGraph;
