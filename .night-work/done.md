# 2026-05-14 Night Work

## Task: Fix broken openingStoryWorkflow module split

### Problem
The `index.ts` in `hooks/useGame/opening/openingStoryWorkflow/` was trying to re-export from a non-existent `./openingStoryWorkflow` (same directory). The actual file is at `../openingStoryWorkflow.ts` (one level up).

### Solution
Fixed `index.ts` to:
1. Re-export from `../openingStoryWorkflow` (correct relative path to original file)
2. Re-export all extracted modules: `openingNarrative`, `planningInitPhase`, `worldGenPhase`, `variableInitPhase`, `utils`, `types`

### Files Modified
- `hooks/useGame/opening/openingStoryWorkflow/index.ts` - Fixed re-export paths

### Verification
- `npm run build` passes (build output matches original)
- Import path `./opening/openingStoryWorkflow` continues to work for consumers like `sessionLifecycleWorkflow.ts`
