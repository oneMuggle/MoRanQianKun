# 提案：添加 GitHub Actions 自动部署

## Why

目前项目没有自动化部署流程，每次发布需要手动执行 `npm run build` 并通过命令行创建 gh-pages 分支推送。手动部署容易出错且无法实现版本追溯。通过 GitHub Actions 实现自动化部署，可以确保每次提交到 main 分支都能自动构建并发布到 GitHub Pages，减少人为操作失误。

## What Changes

- 添加 `.github/workflows/deploy.yml`：main 分支推送时自动构建并部署到 GitHub Pages
- 添加 `.github/workflows/release.yml`：创建 Release 时自动打包并上传附件
- 配置工作流使用 Node.js 20 和 Ubuntu latest 运行器

## Capabilities

### New Capabilities
- `github-pages-deploy`: 当 main 分支有新提交时，自动构建项目并部署到 gh-pages 分支
- `release-assets`: 创建 GitHub Release 时，自动打包构建产物作为附件上传

### Modified Capabilities
- 无

## Impact

- 新增 `.github/workflows/` 目录
- 无需修改现有代码
- 不影响本地开发流程

## 变更范围

- 添加自动化构建和部署工作流
- 支持 GitHub Pages 部署
- 支持 Release 附件打包

## 非目标

- 不包含 Cloudflare Workers 部署
- 不实现 npm 包发布
- 不添加代码质量检查工作流

## 验收标准

- [ ] push 到 main 分支时自动触发构建
- [ ] 构建产物成功部署到 gh-pages 分支
- [ ] GitHub Pages 可以访问部署后的网站
- [ ] 创建 Release 时自动上传构建产物作为附件