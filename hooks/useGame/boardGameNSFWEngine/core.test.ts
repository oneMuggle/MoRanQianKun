/**
 * boardGameNSFWEngine 核心逻辑测试
 *
 * 覆盖 executePlayerAction 各操作类型的结算结果。
 */

import { describe, it, expect } from 'vitest';
import { executePlayerAction } from './core';

describe('executePlayerAction', () => {
  const baseState = {
    紧张度: 40,
    当前回合: 3,
    总回合数: 12,
  };

  it('掷骰操作应返回有效结果', () => {
    for (let i = 0; i < 20; i++) {
      const result = executePlayerAction(
        { type: '掷骰', payload: {}, 游戏类型: '骰子游戏' },
        baseState,
      );
      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('tensionDelta');
      expect(typeof result.tensionDelta).toBe('number');
      expect(result.tensionDelta).toBeGreaterThan(0);
      expect(result).toHaveProperty('narrativeConstraint');
      expect(result.narrativeConstraint).toContain('骰子游戏');
    }
  });

  it('选择路径操作应根据 payload 计算成功率', () => {
    const result = executePlayerAction(
      { type: '选择路径', payload: { 需求属性值: 5 }, 游戏类型: '密室逃脱' },
      baseState,
    );
    expect(result).toHaveProperty('success');
    expect(result).toHaveProperty('tensionDelta');
    expect(result.narrativeConstraint).toContain('密室逃脱');
  });

  it('投票操作应增加固定紧张度', () => {
    const result = executePlayerAction(
      { type: '投票', payload: {}, 游戏类型: '狼人杀' },
      baseState,
    );
    expect(result.success).toBe(true);
    expect(result.tensionDelta).toBeGreaterThanOrEqual(8);
    expect(result.narrativeConstraint).toContain('狼人杀');
  });

  it('搜索操作应返回有效描述', () => {
    const result = executePlayerAction(
      { type: '搜索', payload: {}, 游戏类型: '剧本杀' },
      baseState,
    );
    expect(result).toHaveProperty('description');
    expect(typeof result.description).toBe('string');
  });

  it('选择真心话大冒险: 大冒险应有更高紧张度', () => {
    const result = executePlayerAction(
      { type: '选择真心话大冒险', payload: { 选择: '大冒险' }, 游戏类型: '真心话大冒险' },
      baseState,
    );
    expect(result.tensionDelta).toBeGreaterThanOrEqual(15);
  });

  it('选择真心话大冒险: 真心话紧张度较低', () => {
    const result = executePlayerAction(
      { type: '选择真心话大冒险', payload: { 选择: '真心话' }, 游戏类型: '真心话大冒险' },
      baseState,
    );
    expect(result.tensionDelta).toBeGreaterThanOrEqual(8);
    expect(result.tensionDelta).toBeLessThan(15);
  });

  it('回应命令: 反抗应标记 keyStep', () => {
    const result = executePlayerAction(
      { type: '回应命令', payload: { 回应: '反抗' }, 游戏类型: '国王游戏' },
      baseState,
    );
    expect(result.keyStep).toBe(true);
    expect(result.tensionDelta).toBeGreaterThanOrEqual(20);
  });

  it('回应命令: 服从应降低紧张度增长', () => {
    const result = executePlayerAction(
      { type: '回应命令', payload: { 回应: '服从' }, 游戏类型: '国王游戏' },
      baseState,
    );
    expect(result.keyStep).toBe(false);
    expect(result.tensionDelta).toBeLessThan(10);
  });

  it('购买地块操作应增加少量紧张度', () => {
    const result = executePlayerAction(
      { type: '购买地块', payload: {}, 游戏类型: '大富翁' },
      baseState,
    );
    expect(result.tensionDelta).toBeGreaterThanOrEqual(3);
  });

  it('出牌操作应增加中等紧张度', () => {
    const result = executePlayerAction(
      { type: '出牌', payload: {}, 游戏类型: '棋牌游戏' },
      baseState,
    );
    expect(result.tensionDelta).toBeGreaterThanOrEqual(5);
  });

  it('自定义操作应返回默认结果', () => {
    const result = executePlayerAction(
      { type: '自定义', payload: { custom: 'data' }, 游戏类型: '骰子游戏' },
      baseState,
    );
    expect(result.success).toBe(true);
    expect(result.tensionDelta).toBeGreaterThanOrEqual(5);
  });

  it('高回合数应有额外回合加成', () => {
    const highTurnState = { ...baseState, 当前回合: 10 };
    const result = executePlayerAction(
      { type: '掷骰', payload: {}, 游戏类型: '骰子游戏' },
      highTurnState,
    );
    expect(result.tensionDelta).toBeGreaterThan(1);
  });

  it('叙事约束应包含游戏类型和操作信息', () => {
    const result = executePlayerAction(
      { type: '掷骰', payload: {}, 游戏类型: '骰子游戏' },
      baseState,
    );
    expect(result.narrativeConstraint).toContain('桌游叙事约束');
    expect(result.narrativeConstraint).toContain('骰子游戏');
    expect(result.narrativeConstraint).toContain('掷骰');
  });
});
