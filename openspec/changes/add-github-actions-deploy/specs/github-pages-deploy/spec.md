# github-pages-deploy

## ADDED Requirements

### Requirement: main 分支推送触发自动部署

当代码推送到 main 分支时，GitHub Actions SHALL 自动执行构建并部署到 gh-pages 分支。

#### Scenario: 推送代码到 main 分支
- **WHEN** 开发者执行 `git push origin main`
- **THEN** GitHub Actions 自动触发构建流程
- **AND** 构建产物推送到 gh-pages 分支

#### Scenario: 构建失败时通知
- **WHEN** 构建过程中发生错误
- **THEN** GitHub Actions 显示失败状态
- **AND** 错误日志可供查看

### Requirement: GitHub Pages 可访问

部署完成后，GitHub Pages SHALL可以通过 `https://oneMuggle.github.io/MoRanJiangHu/` 访问。

#### Scenario: 部署后网站可访问
- **WHEN** 部署流程完成
- **THEN** 网站在上述 URL 可访问
- **AND** 包含最新构建的静态资源

### Requirement: 部署消息包含版本信息

提交到 gh-pages 的 commit message SHALL 包含部署时间戳。

#### Scenario: 提交消息格式
- **WHEN** 自动部署执行
- **THEN** commit message 格式为 "Deploy YYYY-MM-DD HH:mm:ss"