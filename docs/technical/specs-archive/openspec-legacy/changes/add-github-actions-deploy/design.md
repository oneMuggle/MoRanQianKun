# 设计文档：GitHub Actions 自动部署

## Context

项目当前没有自动化部署流程。每次发布需要：
1. 本地执行 `npm run build`
2. 手动切换到 gh-pages 分支
3. 复制 dist/ 文件内容
4. 提交并推送

这种手动流程容易出错，无法实现版本追溯。

## Goals / Non-Goals

**Goals:**
- 实现 main 分支推送时自动构建并部署到 GitHub Pages
- 实现创建 Release 时自动上传构建产物附件

**Non-Goals:**
- Cloudflare Workers 部署（需单独配置）
- npm 包发布
- 代码质量检查（ESLint、类型检查等）

## Decisions

### 1. 使用 GitHub Actions 而非第三方 CI

**选择理由：**
- GitHub Actions 与 GitHub 仓库深度集成，无需额外授权
- 免费额度充足（2000 分钟/月）
- 工作流配置文件与代码同仓库，便于版本管理

**替代方案考虑：**
- Vercel/Netlify：需要额外注册账号
- Travis CI：免费额度有限

### 2. 使用 peaceiris/actions-gh-pages 部署

**选择理由：**
- 成熟稳定，广泛使用
- 配置简单，自动处理 Git 认证
- 支持自定义 commit message

### 3. 使用 actions/create-release 和 actions/upload-release-asset 管理 Release

**选择理由：**
- 官方 Actions，可靠性高
- 支持分卷上传大文件

## 技术方案

### Workflow 1: deploy.yml

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run build
      - uses: peaceiris/actions-gh-pages@v4
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

### Workflow 2: release.yml

```yaml
name: Release

on:
  release:
    types: [created]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-release-asset@v1
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          upload_url: ${{ github.event.release.upload_url }}
          asset_path: ./dist
          asset_name: MoRanJiangHu-dist.zip
          asset_content_type: application/zip
```

## 数据结构

无需新增数据结构。

## 影响评估

### 功能影响
- 新增 2 个 GitHub Actions workflow 文件
- 部署流程自动化，无需手动操作

### 兼容性影响
- 无影响，不涉及代码修改

### 性能影响
- 构建时间约 2-3 分钟（首次）
- 增量构建可利用缓存更快

## 风险与权衡

- **风险**：GitHub Pages 部署有延迟（通常 1-2 分钟）
  - **缓解**：工作流完成后在 Actions 页面查看状态

- **风险**：大文件上传超时
  - **缓解**：Release 附件仅上传 dist 目录，不含 node_modules

## Open Questions

- 是否需要在部署前运行测试？建议稳定后再添加
- 是否需要部署预览环境（PR 自动部署）？当前不需要
