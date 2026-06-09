# Image Generation Retry Config - Specification

## ADDED Requirements

### Requirement: 用户可以配置提示词生成重试次数

用户 SHALL be able to set the number of retry attempts for prompt generation when it fails.

#### Scenario: 设置重试次数为 3
- **WHEN** 用户在设置页面的重试设置中，将「提示词生成重试次数」设置为 3
- **THEN** 系统 SHALL 保存配置到 IndexedDB，并在后续提示词生成失败时最多重试 3 次

#### Scenario: 重试次数超出范围时被拒绝
- **WHEN** 用户输入的重试次数超出 0-5 的范围
- **THEN** 系统 SHALL 拒绝输入并显示错误提示

#### Scenario: 使用默认值
- **WHEN** 用户未配置重试次数
- **THEN** 系统 SHALL 使用默认值 1 次重试

### Requirement: 用户可以配置图片生成重试次数

用户 SHALL be able to set the number of retry attempts for image generation when it fails.

#### Scenario: 设置图片重试次数为 5
- **WHEN** 用户在设置页面的重试设置中，将「图片生成重试次数」设置为 5
- **THEN** 系统 SHALL 保存配置到 IndexedDB，并在后续图片生成失败时最多重试 5 次

#### Scenario: 重试次数超出范围时被拒绝
- **WHEN** 用户输入的图片重试次数超出 0-5 的范围
- **THEN** 系统 SHALL 拒绝输入并显示错误提示

### Requirement: 重试配置在所有生图场景中生效

配置 SHALL apply to NPC 生图、场景生图、NPC 秘档部位生图所有场景。

#### Scenario: NPC 生图使用配置的重试次数
- **WHEN** NPC 生图时图片生成失败
- **THEN** 系统 SHALL 根据配置的重试次数进行重试

#### Scenario: 场景生图使用配置的重试次数
- **WHEN** 场景生图时图片生成失败
- **THEN** 系统 SHALL 根据配置的重试次数进行重试