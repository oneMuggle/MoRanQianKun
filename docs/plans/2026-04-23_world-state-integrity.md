# World State Integrity - 世界状态完整性

## Status: Implemented

## Motivation

The world state (世界状态) tracks NPCs, events, locations, and historical records. Over time, the following integrity issues can accumulate:

1. **Orphaned NPC references**: Events reference NPCs by name, but the NPC may have been removed or renamed
2. **Invalid location references**: NPC locations may reference non-existent places
3. **Event state inconsistency**: Events may be stuck in invalid states (e.g., 进行中 without a proper start time)
4. **Temporal anomalies**: Event end times may precede start times
5. **Duplicate NPCs**: Multiple NPCs with the same name causing ambiguous references

## Implementation

Add a world state integrity module at `hooks/useGame/worldStateIntegrity.ts` with the following functions:

### `校验世界状态完整性(world: 世界数据结构): 世界状态校验结果`

Validates the complete world state and returns:
```typescript
type 世界状态校验结果 = {
  有效: boolean;
  问题列表: 世界状态问题[];
  修复数: number;
};

type 世界状态问题 = {
  类型: '孤立NPC引用' | '无效地点' | '事件状态异常' | '时间悖论' | '重复实体';
  严重程度: 'error' | 'warning' | 'info';
  描述: string;
  路径?: string;
};
```

### `修复世界状态孤立引用(world: 世界数据结构): 世界数据结构`

Removes or corrects orphaned references:
- Removes NPC names from event 关联人物 if NPC doesn't exist in 活跃NPC列表
- Removes NPC names from event 关联势力 if NPC doesn't exist
- Clears invalid 当前位置 values

### `校验NPC位置完整性(world: 世界数据结构): 世界状态问题[]`

Checks that all NPC 当前位置 values reference valid locations:
- Checks against 地图 and 建筑 lists
- Reports NPCs at non-existent locations

### `校验事件状态一致性(world: 世界数据结构): 世界状态问题[]`

Validates event state transitions:
- 待执行事件: must have 计划执行时间 and valid 前置条件
- 进行中事件: must have 开始时间, must not have 结算时间
- 已结算事件: must have 结算时间

### `修复事件时间悖论(world: 世界数据结构): 世界数据结构`

Fixes temporal anomalies:
- If 预计结束时间 < 开始时间, adjusts 预计结束时间 to be after 开始时间
- If 计划执行时间 < 当前时间 for 待执行事件, marks for review

## Integration Points

The integrity checks should be called from:

1. **`规范化世界状态`** - Run integrity validation after normalization, auto-fix minor issues
2. **`世界演变工作流`** - Validate before and after world evolution updates  
3. **`存档加载`** - Validate world state when loading saves
4. **`开局流程`** - Validate world state after initial generation

## Files to Modify

- `hooks/useGame/storyState.ts` - Add integrity validation to 规范化世界状态
- `hooks/useGame/worldEvolutionWorkflow.ts` - Add pre/post validation calls
- `hooks/useGame/saveLoad/saveLoadWorkflow.ts` - Add validation on load

## Test Coverage

Add tests in `hooks/useGame/worldStateIntegrity.test.ts`:
- 孤立NPC引用 detection and repair
- 无效地点 detection  
- 事件状态异常 detection
- 时间悖论 detection and repair
- Integration with 规范化世界状态
