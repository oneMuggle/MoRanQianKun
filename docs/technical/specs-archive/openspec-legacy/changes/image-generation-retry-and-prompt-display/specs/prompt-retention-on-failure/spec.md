# Prompt Retention On Failure - Specification

## ADDED Requirements

### Requirement: 图片生成失败时保留提示词数据

当图片生成失败时，系统 SHALL 将已生成的提示词数据保留在生图结果记录中。

#### Scenario: 失败后提示词被保留
- **WHEN** 图片生成过程中抛出异常
- **THEN** 系统 SHALL 将 `生图词组`、`最终正向提示词`、`最终负向提示词` 保存到最近生图结果中

#### Scenario: 失败记录包含完整提示词信息
- **WHEN** 用户查看失败的生图记录
- **THEN** 系统 SHALL 显示：
  - 生图词组（AI 生成的原始提示词）
  - 最终正向提示词（包含画师串等附加内容）
  - 最终负向提示词

#### Scenario: 失败记录包含错误信息
- **WHEN** 图片生成失败
- **THEN** 系统 SHALL 将错误信息保存到 `错误信息` 字段，供后续排查

### Requirement: 保留的提示词可用于后续重试

保留的提示词数据 SHALL be usable for retry operations.

#### Scenario: 复用提示词时使用保留的数据
- **WHEN** 用户选择「复用提示词重试」
- **THEN** 系统 SHALL 使用上次保存的 `生图词组`、`最终正向提示词`、`最终负向提示词` 进行图片生成

### Requirement: 提示词保留不受配置影响

提示词保留 SHALL occur regardless of retry configuration.

#### Scenario: 重试次数为 0 时仍保留提示词
- **WHEN** 用户将重试次数设为 0，图片生成仍然失败
- **THEN** 系统 SHALL 仍然保留提示词数据，供用户手动重试