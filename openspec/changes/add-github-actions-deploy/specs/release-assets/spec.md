# release-assets

## ADDED Requirements

### Requirement: 创建 Release 时自动上传构建产物

当创建 GitHub Release 时，GitHub Actions SHALL 自动打包构建产物并上传为附件。

#### Scenario: 创建新 Release
- **WHEN** 仓库管理员在 GitHub 创建新 Release
- **AND** 设置了 tag 版本
- **THEN** 自动构建项目
- **AND**打包为 zip 文件上传为 Release 附件

#### Scenario: Release 附件可下载
- **WHEN** Release 创建完成
- **THEN** 构建产物作为 zip 文件可从 Release 页面下载

### Requirement: 使用稳定版本 Actions

部署过程 SHALL 使用稳定的 GitHub Actions 版本以确保可靠性。

#### Scenario: Actions 版本指定
- **WHEN** 配置工作流
- **THEN** 使用明确的版本号（如 @v4）而非分支名
- **AND** 避免使用 latest 标签

### Requirement: 只包含构建产物

Release 附件 SHALL 只包含 dist/ 目录内容，不包含源代码或其他文件。

#### Scenario: 打包内容
- **WHEN** 构建执行
- **THEN** 只打包 ./dist 目录
- **AND** 不包含源代码、node_modules 等