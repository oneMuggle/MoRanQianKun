/**
 * 敏感点经络图主组件
 * 整合 MeridianBodySVG + BodyPointTooltip + 区域筛选 + 视图切换
 */

import { useState, useCallback, useMemo } from 'react';
import type { NPC结构 } from '../../../models/social';
import type { 身体区域分类, 敏感点条目 } from '../../../models/npcNSFWEnhancement/types';
import { 全时代通用敏感点 } from '../../../models/npcNSFWEnhancement/sensitiveZones';
import { MeridianBodySVG } from './MeridianBodySVG';
import { BodyPointTooltip } from './BodyPointTooltip';
import {
  获取敏感点坐标,
} from '../../../models/npcNSFWEnhancement/bodyMap';

interface SensitivePointMeridianMapProps {
  npc: NPC结构;
  eraId?: string;
}

const 区域筛选选项: (身体区域分类 | '全部')[] = ['全部', '头颈区', '胸胸区', '腰腹区', '四肢区', '背部区', '私密区', '特殊区'];

/** 敏感点标记大小映射 (基于敏感度 1-5) */
const pointRadiusMap: Record<number, number> = { 1: 1.5, 2: 2, 3: 2.5, 4: 3, 5: 3.5 };

/** 敏感点颜色映射 (基于发现状态) */
const pointColorMap = {
  '未发觉': { fill: '#4a4a5a', stroke: '#666688' },
  '已发现': { fill: '#3b82f6', stroke: '#60a5fa' },
  '已开发': { fill: '#ec4899', stroke: '#f472b6' },
};

export const SensitivePointMeridianMap = ({ npc, eraId }: SensitivePointMeridianMapProps) => {
  const [当前视图, set当前视图] = useState<'正面' | '背面'>('正面');
  const [选中敏感点, set选中敏感点] = useState<敏感点条目 | null>(null);
  const [筛选区域, set筛选区域] = useState<身体区域分类 | '全部'>('全部');

  // 收集 NPC 的所有敏感点
  const allPoints = useMemo(() => {
    const points: 敏感点条目[] = [];
    const 档案 = npc.敏感点档案;
    if (档案) {
      points.push(...档案.主要敏感点);
      points.push(...档案.隐藏敏感点);
    }
    if (points.length === 0) {
      points.push(...全时代通用敏感点);
    }
    return points;
  }, [npc.敏感点档案]);

  // 根据筛选区域过滤
  const filteredPoints = useMemo(() => {
    if (筛选区域 === '全部') return allPoints;
    return allPoints.filter(p => p.区域 === 筛选区域);
  }, [allPoints, 筛选区域]);

  const handlePointClick = useCallback((point: 敏感点条目) => {
    set选中敏感点(prev => prev?.名称 === point.名称 ? null : point);
  }, []);

  const handleViewToggle = useCallback(() => {
    set当前视图(prev => prev === '正面' ? '背面' : '正面');
    set选中敏感点(null);
  }, []);

  return (
    <div className="flex flex-col h-full">
      {/* 顶部控制栏 */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-wuxia-gold/20">
        <span className="text-sm font-bold text-wuxia-gold">敏感点经络图</span>
        <button
          onClick={handleViewToggle}
          className="px-2.5 py-1 text-xs rounded border border-wuxia-gold/30 text-wuxia-gold hover:bg-wuxia-gold/10 transition-colors"
        >
          {当前视图 === '正面' ? '正面' : '背面'}
        </button>
      </div>

      {/* 区域筛选 */}
      <div className="flex items-center gap-1 px-3 py-1.5 overflow-x-auto border-b border-gray-700/30">
        {区域筛选选项.map(区域 => (
          <button
            key={区域}
            onClick={() => set筛选区域(区域)}
            className={`px-2 py-0.5 text-xs rounded whitespace-nowrap transition-colors ${
              筛选区域 === 区域
                ? 'bg-wuxia-gold/20 text-wuxia-gold border border-wuxia-gold/40'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            {区域}
          </button>
        ))}
      </div>

      {/* 人体轮廓 + 敏感点标注 */}
      <div className="flex-1 relative p-4">
        <MeridianBodySVG 视图={当前视图}>
          {filteredPoints.map(point => {
            const coords = 获取敏感点坐标(point.名称, 当前视图);
            if (!coords) return null;

            const colors = pointColorMap[point.发现状态];
            const radius = pointRadiusMap[point.敏感度] ?? 2;
            const isSelected = 选中敏感点?.名称 === point.名称;

            return (
              <g key={point.名称}>
                {/* 脉冲动画圈（已开发） */}
                {point.发现状态 === '已开发' && (
                  <circle
                    cx={coords.x}
                    cy={coords.y}
                    r={radius + 1.5}
                    fill="none"
                    stroke={colors.stroke}
                    strokeWidth={0.2}
                    opacity={0.4}
                  />
                )}

                {/* 敏感点标记 */}
                <circle
                  cx={coords.x}
                  cy={coords.y}
                  r={isSelected ? radius + 0.8 : radius}
                  fill={colors.fill}
                  stroke={isSelected ? '#fff' : colors.stroke}
                  strokeWidth={isSelected ? 0.5 : 0.3}
                  className="cursor-pointer transition-all duration-150"
                  onClick={() => handlePointClick(point)}
                />

                {/* 名称标签（仅选中时显示） */}
                {isSelected && (
                  <text
                    x={coords.x + 4}
                    y={coords.y - 2}
                    fill="#e0e0e0"
                    fontSize={2.5}
                    className="pointer-events-none select-none"
                  >
                    {point.时代名称 || point.名称}
                  </text>
                )}

                {/* Tooltip（仅选中时显示） */}
                {isSelected && (
                  <foreignObject
                    x={coords.x - 40}
                    y={Math.max(0, coords.y - 50)}
                    width={80}
                    height={50}
                    className="overflow-visible"
                  >
                    <BodyPointTooltip
                      point={point}
                      eraId={eraId}
                      onClose={() => set选中敏感点(null)}
                    />
                  </foreignObject>
                )}
              </g>
            );
          })}
        </MeridianBodySVG>
      </div>

      {/* 底部图例 */}
      <div className="flex items-center justify-center gap-4 px-3 py-2 border-t border-gray-700/30 text-xs text-gray-400">
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-gray-600 inline-block" /> 未发觉
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" /> 已发现
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-pink-500 inline-block" /> 已开发
        </span>
        <span className="text-gray-500">大小 = 敏感度</span>
      </div>

      {/* 底部详情面板 */}
      {选中敏感点 && (
        <div className="px-3 py-2 border-t border-wuxia-gold/20 bg-black/20">
          <div className="text-sm">
            <span className="text-pink-400 font-bold">
              {选中敏感点.时代名称 || 选中敏感点.名称}
            </span>
            <span className="text-gray-400 ml-2 text-xs">{选中敏感点.区域}</span>
          </div>
          <div className="text-xs text-gray-300 mt-1 leading-relaxed">
            {选中敏感点.反应描述}
          </div>
          {选中敏感点.开发程度 && (
            <div className="text-xs text-gray-500 mt-1">
              开发程度：{选中敏感点.开发程度}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SensitivePointMeridianMap;
