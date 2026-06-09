# Retry With Prompt Options - Specification

## ADDED Requirements

### Requirement: 用户可选择完全重新生成

当图片生成失败时，用户 SHALL be able to trigger a complete regeneration of both prompt and image.

#### Scenario: 用户选择完全重新生成
- **WHEN** 用户点击失败记录上的「完全重试」按钮
- **THEN** 系统 SHALL：
  1. 清除之前保存的提示词数据
  2. 重新执行提示词生成流程
  3. 使用新生成的提示词执行图片生成

#### Scenario: 完全重试使用配置的重试次数
- **WHEN** 用户选择完全重试
- **THEN** 系统 SHALL 根据配置的重试次数执行重试逻辑

### Requirement: 用户可选择复用提示词重试

当图片生成失败时，用户 SHALL be able to retry image generation using the retained prompt.

#### Scenario: 用户选择复用提示词重试
- **WHEN** 用户点击失败记录上的「复用提示词重试」按钮
- **THEN** 系统 SHALL：
  1. 使用上次保留的提示词数据
  2. 重新执行图片生成流程

#### Scenario: 复用提示词时提示词数据存在
- **WHEN** 用户选择复用提示词重试，且提示词数据存在
- **THEN** 系统 SHALL 直接使用 `最终正向提示词` 和 `最终负向提示词` 调用图片生成服务

#### Scenario: 复用提示词时提示词数据不存在
- **WHEN** 用户选择复用提示词重试，但提示词数据已被清除或不存在
- **THEN** 系统 SHALL 显示错误提示「提示词数据已丢失，请选择完全重新生成」

### Requirement: 重试模式区分来源

系统 SHALL distinguish between retry from queue and retry from history.

#### Scenario: 从队列重试
- **WHEN** 用户从生图队列中选择重试
- **THEN** 系统 SHALL 执行完整的重试流程，包括根据配置的重试次数

#### Scenario: 从历史记录重试
- **WHEN** 用户从生图历史记录中选择重试
- **THEN** 系统 SHALL 允许用户选择重试模式（完全重试或复用提示词）

### Requirement: 两种重试方式的结果独立记录

重试生成的结果 SHALL be recorded as new entries in the history.

#### Scenario: 重新生成的新结果
- **WHEN** 完全重试完成并成功
- **THEN** 系统 SHALL 创建新的生图历史记录，覆盖或追加到最近生图结果

#### Scenario: 复用提示词重试的新结果
- **WHEN** 复用提示词重试完成并成功
- **THEN** 系统 SHALL 创建新的生图历史记录，记录中使用来源标识表明是「重试」