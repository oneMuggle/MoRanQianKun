# hooks/useGame/ 散列文件领域重组映射表

> 阶段 3.1 任务：把根目录散列的工作流文件按领域归入子目录。

## 设计原则

1. **保留所有已有子目录**（image/, memory/, nsfw/, planning/, world/, time/, event/, engine/, core/, coordinators/, domains/, config/, harem/, subsystems/, npc/, sendWorkflow/, opening/, quality/, response/, saveLoad/, state/, systemPromptBuilder/, travel/, transform/, ui/, avg/, bdsmNSFWEngine/, boardGameNSFWEngine/, campusNSFW/, dailytown/, device/, eventTrigger/, events/, exploration/, exposureNSFWEngine/, narrative/, narrativeGrammar/, npcContext/, property/, rpg/, urbanDriver/）。
2. **新建一级子目录**（combat/, intimacy/, academic/, session/）用于散列文件。
3. **根目录只保留**：`index.ts`（barrel 导出）、`AGENTS.md`、`types.ts`（如需要可挪到 core/）、少量通用 hook（按需）。

## 目标子目录速查

| 子目录 | 用途 |
|--------|------|
| `nsfw/` | NSFW 相关：bdsm/campus/exposure/photography/urbanDriver/devicetNotification |
| `session/` | 会话生命周期、saveCoordinator |
| `engine/` | 主剧情发送编排、orchestrator、modeManager、systemPromptBuilder、promptRuntime、mainStoryRequest、sendWorkflow/ |
| `core/` | 状态/规范化/命令处理/类型/returnMapper |
| `memory/` | memoryRecall（recallWorkflow） |
| `event/eventTrigger/` | eventTrigger、eventTriggerManager |
| `event/` | difficultyAdjustmentWorkflow、clubWorkflow、forgeWorkflow |
| `time/` | scheduleWorkflow、semesterCalendarWorkflow |
| `npc/` | relationshipNetworkWorkflow、useNPCWorkflow、私聊等 |
| `planning/` | runtimeVariableWorkflow |
| `combat/` | combatCalculation |
| `intimacy/` | intimacyUtils |
| `academic/` | academicWorkflow |
| `harem/` | （保留） |
| `engine/sendWorkflow/` | sendWorkflow.test.ts |
| `engine/systemPromptBuilder/` | systemPromptBuilder.test.ts |
| `image/` | useSceneImageArchive、useImagePresets |
| `config/` | useSettingsActions |
| `core/` | useFeatureFlags、useHistoryAndMemory、useOpeningAndSession |
| `engine/sendWorkflow/` | useSend |
| `world/` | useWorldAndPlanning |
| `device/` | useDevice |
| `travel/` | useTravelAndTrade |
| `npc/` | useNPCWorkflow |
| `opening/` | useOpeningAndSession |
| `state/` | （保留）stateTransforms、storyState、types（如果归并到此） |

## 散列文件迁移表

### 1. NSFW 散列文件 → `nsfw/`（24 个）

| 原路径 | 新路径 |
|--------|--------|
| `bdsmForumEngine.ts` | `nsfw/bdsmForumEngine.ts` |
| `bdsmMeetingTrigger.ts` | `nsfw/bdsmMeetingTrigger.ts` |
| `bdsmMeetingWorkflow.ts` | `nsfw/bdsmMeetingWorkflow.ts` |
| `bdsmRelationshipOperations.ts` | `nsfw/bdsmRelationshipOperations.ts` |
| `bdsmStateIntegration.ts` | `nsfw/bdsmStateIntegration.ts` |
| `bdsmStateParser.ts` | `nsfw/bdsmStateParser.ts` |
| `bdsmStateValidation.ts` | `nsfw/bdsmStateValidation.ts` |
| `bdsmTaskTrigger.ts` | `nsfw/bdsmTaskTrigger.ts` |
| `bdsmTaskWorkflow.ts` | `nsfw/bdsmTaskWorkflow.ts` |
| `campusForumWorkflow.ts` | `nsfw/campusForumWorkflow.ts` |
| `campusNSFWEngine.ts` | `nsfw/campusNSFWEngine.ts` |
| `campusPromptInjector.ts` | `nsfw/campusPromptInjector.ts` |
| `campusRelationshipEngine.ts` | `nsfw/campusRelationshipEngine.ts` |
| `campusRelationshipWorkflow.ts` | `nsfw/campusRelationshipWorkflow.ts` |
| `campusRumorWorkflow.ts` | `nsfw/campusRumorWorkflow.ts` |
| `deviceNotificationWorkflow.ts` | `nsfw/deviceNotificationWorkflow.ts` |
| `outdoorNSFWEngine.ts` | `nsfw/outdoorNSFWEngine.ts` |
| `photographyLeakWorkflow.ts` | `nsfw/photographyLeakWorkflow.ts` |
| `photographyNSFWEngine.ts` | `nsfw/photographyNSFWEngine.ts` |
| `photographyNSFWIntegration.ts` | `nsfw/photographyNSFWIntegration.ts` |
| `photographyShootWorkflow.ts` | `nsfw/photographyShootWorkflow.ts` |
| `urbanDriverNSFWEngine.ts` | `nsfw/urbanDriverNSFWEngine.ts` |
| `urbanDriverNSFWEngine.test.ts` | `nsfw/urbanDriverNSFWEngine.test.ts` |
| `urbanDriverNSFWIntegration.ts` | `nsfw/urbanDriverNSFWIntegration.ts` |

### 2. Session 散列文件 → `session/`（4 个）

| 原路径 | 新路径 |
|--------|--------|
| `sessionLifecycleWorkflow.ts` | `session/sessionLifecycleWorkflow.ts` |
| `sessionLifecycleWorkflow.test.ts` | `session/sessionLifecycleWorkflow.test.ts` |
| `saveCoordinator.ts` | `session/saveCoordinator.ts` |
| `saveCoordinator.test.ts` | `session/saveCoordinator.test.ts` |

### 3. Engine 散列文件 → `engine/`（7 个）

| 原路径 | 新路径 |
|--------|--------|
| `mainStoryRequest.ts` | `engine/mainStoryRequest.ts` |
| `mainStoryRequest.test.ts` | `engine/mainStoryRequest.test.ts` |
| `gameOrchestrator.ts` | `engine/gameOrchestrator.ts` |
| `modeManager.ts` | `engine/modeManager.ts` |
| `sendWorkflow.test.ts` | `engine/sendWorkflow.test.ts` |
| `promptRuntime.ts` | `engine/promptRuntime.ts` |
| `promptRuntime.test.ts` | `engine/promptRuntime.test.ts` |

> 注：`systemPromptBuilder.ts` 太大（98K）暂留根目录 + 同级 `systemPromptBuilder/` 子目录（已存在），特殊处理。

### 4. Core/State 散列文件 → `core/`（4 个）

| 原路径 | 新路径 |
|--------|--------|
| `stateTransforms.ts` | `core/stateTransforms.ts` |
| `stateTransforms.test.ts` | `core/stateTransforms.test.ts` |
| `storyState.ts` | `core/storyState.ts` |
| `storyState.test.ts` | `core/storyState.test.ts` |

> `types.ts` 暂留根目录（特殊处理）。`narrativeGrammar.ts` 已存在 narrativeGrammar/ 子目录，保留。

### 5. Memory 散列文件 → `memory/`（2 个）

| 原路径 | 新路径 |
|--------|--------|
| `recallWorkflow.ts` | `memory/recallWorkflow.ts` |
| `recallWorkflow.test.ts` | `memory/recallWorkflow.test.ts` |

### 6. Event 散列文件 → `event/eventTrigger/`（3 个）

| 原路径 | 新路径 |
|--------|--------|
| `eventTrigger.ts` | `event/eventTrigger/eventTrigger.ts` |
| `eventTrigger.test.ts` | `event/eventTrigger/eventTrigger.test.ts` |
| `eventTriggerManager.ts` | `event/eventTrigger/eventTriggerManager.ts` |

### 7. Event 散列文件 → `event/`（4 个）

| 原路径 | 新路径 |
|--------|--------|
| `clubWorkflow.ts` | `event/clubWorkflow.ts` |
| `forgeWorkflow.ts` | `event/forgeWorkflow.ts` |
| `difficultyAdjustmentWorkflow.ts` | `event/difficultyAdjustmentWorkflow.ts` |
| `progressionWorkflow.ts` | `event/progressionWorkflow.ts` |

### 8. Time 散列文件 → `time/`（2 个）

| 原路径 | 新路径 |
|--------|--------|
| `scheduleWorkflow.ts` | `time/scheduleWorkflow.ts` |
| `semesterCalendarWorkflow.ts` | `time/semesterCalendarWorkflow.ts` |

### 9. NPC 散列文件 → `npc/`（3 个）

| 原路径 | 新路径 |
|--------|--------|
| `relationshipNetworkWorkflow.ts` | `npc/relationshipNetworkWorkflow.ts` |
| `useNPCWorkflow.ts` | `npc/useNPCWorkflow.ts` |
| `privateChatWorkflow.ts` | `npc/privateChatWorkflow.ts` |

### 10. Planning 散列文件 → `planning/`（2 个）

| 原路径 | 新路径 |
|--------|--------|
| `runtimeVariableWorkflow.ts` | `planning/runtimeVariableWorkflow.ts` |
| `runtimeVariableWorkflow.test.ts` | `planning/runtimeVariableWorkflow.test.ts` |

### 11. World 散列文件 → `world/`（1 个）

| 原路径 | 新路径 |
|--------|--------|
| `worldStateIntegrity.test.ts` | `world/worldStateIntegrity.test.ts` |

### 12. Combat 散列文件 → `combat/`（新建，1 个）

| 原路径 | 新路径 |
|--------|--------|
| `combatCalculation.ts` | `combat/combatCalculation.ts` |

### 13. Intimacy 散列文件 → `intimacy/`（新建，2 个）

| 原路径 | 新路径 |
|--------|--------|
| `intimacyUtils.ts` | `intimacy/intimacyUtils.ts` |
| `intimacyUtils.test.ts` | `intimacy/intimacyUtils.test.ts` |

### 14. Academic 散列文件 → `academic/`（新建，1 个）

| 原路径 | 新路径 |
|--------|--------|
| `academicWorkflow.ts` | `academic/academicWorkflow.ts` |

### 15. Setting/Config Hook 散列文件

| 原路径 | 新路径 |
|--------|--------|
| `useSettingsActions.ts` | `config/useSettingsActions.ts` |
| `useImagePresets.ts` | `image/useImagePresets.ts` |
| `useTravelAndTrade.ts` | `travel/useTravelAndTrade.ts` |
| `useSceneImageArchive.ts` | `image/useSceneImageArchive.ts` |

### 16. Engine/Send 散列文件

| 原路径 | 新路径 |
|--------|--------|
| `useSend.ts` | `engine/sendWorkflow/useSend.ts` |

### 17. Core 散列文件

| 原路径 | 新路径 |
|--------|--------|
| `useFeatureFlags.ts` | `core/useFeatureFlags.ts` |
| `useHistoryAndMemory.ts` | `memory/useHistoryAndMemory.ts` |
| `useOpeningAndSession.ts` | `opening/useOpeningAndSession.ts` |
| `useWorldAndPlanning.ts` | `world/useWorldAndPlanning.ts` |
| `useDevice.ts` | `device/useDevice.ts` |

### 18. Phase 测试文件 → `engine/phase-tests/`（新建，11 个）

| 原路径 | 新路径 |
|--------|--------|
| `phase3.test.ts` | `engine/phase-tests/phase3.test.ts` |
| `phase4.test.ts` | `engine/phase-tests/phase4.test.ts` |
| `phase5.test.ts` | `engine/phase-tests/phase5.test.ts` |
| `phase10.test.ts` | `engine/phase-tests/phase10.test.ts` |
| `phase11.test.ts` | `engine/phase-tests/phase11.test.ts` |
| `phase12.test.ts` | `engine/phase-tests/phase12.test.ts` |
| `phase13.test.ts` | `engine/phase-tests/phase13.test.ts` |
| `phase14.test.ts` | `engine/phase-tests/phase14.test.ts` |
| `phase15.test.ts` | `engine/phase-tests/phase15.test.ts` |
| `phase15.integration.test.ts` | `engine/phase-tests/phase15.integration.test.ts` |
| `phaseD3.rpg-integration.test.ts` | `engine/phase-tests/phaseD3.rpg-integration.test.ts` |

## 保留在根目录

- `index.ts` — barrel 导出（更新以反映新路径）
- `AGENTS.md` — 模块说明
- `systemPromptBuilder.ts` — 98K 太大，暂保留根（特殊处理）
- `systemPromptBuilder.test.ts` — 随父文件保留根
- `types.ts` — 暂留根（避免大范围改 import）

## 进度跟踪

- [x] 设计映射表
- [ ] Batch 1: NSFW (24 files)
- [ ] Batch 2: session + engine + core (15 files)
- [ ] Batch 3: memory + event + time + npc + planning (12 files)
- [ ] Batch 4: combat + intimacy + academic + hooks (10 files)
- [ ] Batch 5: phase tests (11 files)
- [ ] 更新 index.ts barrel
- [ ] 最终 tsc/build/dev 验证

## 执行结果（2026-06-04）

### 移动统计

| 目标子目录 | 移动文件数 |
|----------|----------|
| nsfw/ | 24 |
| engine/ | 19 (含 engine/sendWorkflow/useSend.ts → 移回 engine/) |
| event/ | 7 (含 event/eventTrigger/ 3 个) |
| core/ | 5 |
| session/ | 4 |
| npc/ | 4 |
| memory/ | 3 |
| world/ | 2 |
| time/ | 2 |
| planning/ | 2 |
| intimacy/ | 2 |
| image/ | 2 |
| travel/ | 1 |
| response/ | 1 |
| opening/ | 1 |
| device/ | 1 |
| config/ | 1 |
| combat/ | 1 |
| academic/ | 1 |
| **合计** | **83** |

### 验证结果

- `npx tsc --noEmit`：597 errors（基线 631，净减 34 errors）
- `npm run build`：成功（17.60s）
- 根目录残留：仅 `index.ts`（barrel）、`AGENTS.md`、`systemPromptBuilder.ts`（98K 特殊保留）、`systemPromptBuilder.test.ts`、`types.ts`、`narrativeGrammar.ts`
- 移动全部用 `git mv` 保留历史
- 所有 import 路径已更新（动态 import 和静态 from）

### 未移动/特殊处理

- `systemPromptBuilder.ts`（98K 太大）暂留根目录，子目录 `systemPromptBuilder/` 保留
- `types.ts` 暂留根（避免大范围类型路径更新）
- `narrativeGrammar.ts`（shim）暂留根
- `eventTrigger/` 子目录保留（与 `event/eventTrigger/` 并存，原文件有 core/factories/index 等）
