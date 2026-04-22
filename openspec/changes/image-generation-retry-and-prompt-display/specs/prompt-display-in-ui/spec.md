# Prompt Display In UI - Specification

## ADDED Requirements

### Requirement: 失败记录显示提示词内容

在图片管理界面中，失败的生图记录 SHALL display the retained prompt content.

#### Scenario: 查看失败记录的提示词
- **WHEN** 用户在图片管理界面点击失败记录的「查看提示词」按钮
- **THEN** 系统 SHALL 显示提示词展示弹窗，包含：
  - 生图词组
  - 最终正向提示词
  - 最终负向提示词
  - 错误信息（如有）

#### Scenario: 失败记录提示词为空
- **WHEN** 失败记录的提示词数据为空（从未成功生成提示词）
- **THEN** 系统 SHALL 显示「提示词数据不可用」而非空内容

### Requirement: 提示词展示弹窗支持复制

用户 SHALL be able to copy the prompt content from the display modal.

#### Scenario: 复制正向提示词
- **WHEN** 用户点击正向提示词的「复制」按钮
- **THEN** 系统 SHALL 将内容复制到剪贴板，并显示「已复制」反馈

#### Scenario: 复制负向提示词
- **WHEN** 用户点击负向提示词的「复制」按钮
- **THEN** 系统 SHALL 将内容复制到剪贴板，并显示「已复制」反馈

### Requirement: 失败记录显示重试选项

失败的生图记录 SHALL display retry action buttons.

#### Scenario: 失败记录显示两个重试按钮
- **WHEN** 用户查看失败的生图记录
- **THEN** 系统 SHALL 显示：
  - 「完全重试」按钮
  - 「复用提示词重试」按钮（仅当提示词数据存在时可用）

#### Scenario: 提示词不存在时禁用复用按钮
- **WHEN** 失败记录没有保留提示词数据
- **THEN** 系统 SHALL 禁用「复用提示词重试」按钮，并显示 tooltip「无提示词数据，请使用完全重试」

### Requirement: 设置界面显示重试配置

用户 SHALL be able to configure retry settings in the settings page.

#### Scenario: 访问重试设置页签
- **WHEN** 用户在图片生成设置中点击「重试设置」页签
- **THEN** 系统 SHALL 显示：
  - 「提示词生成重试次数」输入框（范围 0-5）
  - 「图片生成重试次数」输入框（范围 0-5）

#### Scenario: 保存重试设置
- **WHEN** 用户调整重试次数后点击保存
- **THEN** 系统 SHALL 将配置保存到 IndexedDB，并在界面上显示保存成功提示

#### Scenario: 重试设置使用默认值
- **WHEN** 首次访问设置页面
- **THEN** 系统 SHALL 显示默认值为 1 次重试