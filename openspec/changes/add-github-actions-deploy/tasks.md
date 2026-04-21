# 任务清单：GitHub Actions 自动部署

## 1. 创建 GitHub Pages 部署工作流

- [x] 1.1 创建 `.github/workflows/deploy.yml` 文件
- [x] 1.2 配置 checkout、setup-node、build 步骤
- [x] 1.3 配置 peaceiris/actions-gh-pages 部署步骤
- [x] 1.4 设置 Node.js 版本为 20

**完成标准**: deploy.yml 文件存在于 .github/workflows/ 目录

## 2. 创建 Release 附件上传工作流

- [x] 2.1 创建 `.github/workflows/release.yml` 文件
- [x] 2.2 配置触发条件为 release created
- [x] 2.3 配置构建步骤
- [x] 2.4 配置 actions/upload-release-asset 上传附件

**完成标准**: release.yml 文件存在于 .github/workflows/ 目录

## 3. 验证工作流

- [x] 3.1 本地测试 `npm run build` 确保构建成功
- [ ] 3.2 将工作流文件推送到 main 分支
- [ ] 3.3 验证 GitHub Actions 自动触发
- [ ] 3.4 验证 GitHub Pages 访问正常

**完成标准**: 访问 https://oneMuggle.github.io/MoRanJiangHu 正常显示

## 4. Release 功能验证（可选）

- [ ] 4.1 创建测试 Release
- [ ] 4.2 验证附件自动上传
- [ ] 4.3 验证附件可下载

**完成标准**: Release 页面包含 dist.zip 附件
