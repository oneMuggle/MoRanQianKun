# 安全策略

感谢你帮助 `墨染乾坤：万象纪元` 提升安全性。

## 支持范围

项目当前以持续迭代为主，默认只维护最新主线代码。若你发现安全问题，请基于最新代码或最新部署版本复现后再提交。

## 如何报告安全问题

请不要在公开 Issue 中直接披露高风险漏洞细节。

推荐顺序：

1. 优先使用 GitHub 的私密安全报告能力（如果仓库已启用）。
2. 如果仓库未启用私密报告，请通过仓库维护者主页私下联系，并说明问题影响范围。
3. 如果你只能先开公开 Issue，请仅描述现象与影响，不要附上可直接利用的 PoC、密钥、Token 或敏感数据。

## 建议包含的信息

- 漏洞类型与影响范围
- 复现步骤
- 触发条件
- 受影响的模块、文件或接口
- 是否涉及数据泄露、权限提升、远程执行或凭据暴露
- 你建议的修复方向（如果有）

## 响应目标

- 在 `72` 小时内确认收到报告
- 在 `14` 天内给出初步结论或修复进展
- 修复完成后，再协调是否公开细节

这些时间目标是尽力而为，不构成强保证，但维护者会尽量保持沟通。

## 典型关注点

以下问题特别值得优先报告：

- OAuth、Token、私有仓库同步相关的鉴权缺陷
- 可能导致存档、设置或图片资源泄露的问题
- 可被利用的任意请求转发、路径绕过或上传下载校验缺失
- 会影响用户本地数据安全或恢复流程完整性的漏洞

## 不建议公开提交的内容

- 真实 access token、client secret、个人仓库地址
- 含有用户私有存档内容的复现材料
- 能直接复现攻击的完整 exploit 代码

感谢你选择以负责任的方式披露问题。

---

## 贡献者与维护者：密钥管理规范

> 本节是给项目**自己**的规范，不是外部披露建议。

### ❌ 禁止行为

- **不要把任何 secrets 写进仓库目录**（含根目录的明文文件、子目录的 `.env*`、配置文件、注释、文档示例）
  - 这包括但不限于：Cloudflare Account ID / API Token、GitHub OAuth Client ID / Client Secret、AI Provider API Key、加密私钥、数据库连接串
- 不要把 secrets 写在 issue、PR 描述、commit message 中
- 不要把 secrets 截图发到 IM / Issue 评论区

### ✅ 正确做法

- 所有 secrets 写入仓库**根目录的 `.env.local` / `.env.production` 等已被 `.gitignore` 忽略的文件**
- 部署时通过 CI/CD 的 Secrets 功能注入（如 GitHub Actions Secrets、Cloudflare Pages Environment Variables）
- 在文档中需要引用时，用占位符：`cfut_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` / `Ov23liXXXXXXXXXXXXX`

### 🛡 若发现 secrets 已泄漏

1. **立即轮换**（不轮换等于继续暴露）
2. 删除本地明文文件
3. 检查 `.gitignore` 是否覆盖该路径
4. 若已被 commit 进 git 历史：`git filter-repo` 或 BFG 清理 + 强制 push
5. 在 PR / 文档中追加提示，提醒其他贡献者

### 历史事件

- **2026-06-09**：`canshu` 文件被发现含明文 CF Token + GitHub OAuth Secret，已删除；建议立即轮换相应凭证。详见 `docs/plans/2026-06-09_root-dir-cleanup.md` Phase 0。
