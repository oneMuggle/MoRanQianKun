# 文生图重试机制与提示词显示增强

## Why

当前项目的文生图功能在图片生成失败时，缺乏合理的重试机制和提示词保留功能。用户在图片生成失败后，无法查看已生成的提示词，也无法选择是重新生成提示词还是复用已有提示词再试。此外，也没有提供可配置的默认重试次数设置。这影响了用户体验和生图效率。

## What Changes

### 新增功能

1. **提示词保留与显示**
   - 图片生成失败后，保留已生成的提示词（生图词组、最终正向提示词、最终负向提示词）
   - 在图片管理界面中显示失败记录的提示词内容，供用户核对

2. **失败后重试选项**
   - 提供「完全重新生成」选项：重新生成提示词和图片
   - 提供「复用提示词重试」选项：使用保留的提示词重新生成图片
   - 在图片管理界面的失败记录中提供重试操作入口

3. **可配置重试次数**
   - 在设置页面添加「提示词生成默认重试次数」配置项
   - 在设置页面添加「图片生成默认重试次数」配置项
   - 自动重试逻辑根据配置执行

### 修改功能

4. **NPC生图工作流改造** (`hooks/useGame/npcImageWorkflow.ts`)
   - 添加重试次数参数支持
   - 失败时保存提示词到状态

5. **场景生图工作流改造** (`hooks/useGame/sceneImageWorkflow.ts`)
   - 添加重试次数参数支持
   - 失败时保存提示词到状态

6. **NPC秘档部位生图工作流改造** (`hooks/useGame/npcSecretImageWorkflow.ts`)
   - 添加重试次数参数支持
   - 失败时保存提示词到状态

7. **设置界面扩展** (`components/features/Settings/ImageGenerationSettings.tsx`)
   - 新增「重试设置」页签
   - 添加重试次数配置项

## Capabilities

### New Capabilities
- `image-generation-retry-config`: 可配置的提示词生成和图片生成重试次数
- `prompt-retention-on-failure`: 失败时保留提示词数据
- `retry-with-prompt-options`: 失败后提供完全重试和复用提示词重试两个选项
- `prompt-display-in-ui`: 在图片管理界面显示提示词内容

### Modified Capabilities
- `image-generation`: 新增重试参数和提示词保留逻辑

## Impact

- **核心文件改动**：
  - `hooks/useGame/npcImageWorkflow.ts`
  - `hooks/useGame/sceneImageWorkflow.ts`
  - `hooks/useGame/npcSecretImageWorkflow.ts`
  - `components/features/Settings/ImageGenerationSettings.tsx`
  - `components/features/Social/ImageManagerModal.tsx`
  - `models/imageGeneration.ts` (类型扩展)
  - `utils/apiConfig.ts` (配置结构扩展)

- **配置持久化**：通过 IndexedDB 存储新增的重试配置
- **用户界面**：图片管理模态框增加提示词显示和重试选项