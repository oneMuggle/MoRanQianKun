# 根目录整理方案（Root Directory Cleanup）

**日期**: 2026-06-09
**状态**: ✅ 已完成（PR: https://github.com/oneMuggle/MoRanJiangHu/pull/2）
**目标分支**: `chore/root-dir-cleanup`
**预计耗时**: 4-5 小时（不含凭证轮换）
**实际耗时**: ~3 小时（含一次 GitHub secret scanning 修复 + rebase 救回）

---

## 背景与目标

用户反馈根目录杂乱。扫描后发现 90+ 条目混杂 6 类内容：

1. **🔴 安全隐患**：`canshu` 文件含明文 Cloudflare 账号/Token + GitHub OAuth 凭证
2. **🟡 临时/调试残留**：8 个一次性文件（测试脚本、调试快照、临时图片）
3. **🟠 规范目录重叠**：`plans/`/`openspec/`/`docs/phase-decisions/` 三套规范流程并存
4. **🔵 构建缓存未归位**：`tsconfig.*.tsbuildinfo` 3 个 + `.ruff_cache/`
5. **🟣 大型资源待定**：`videos/` 演示视频
6. **✅ 保留**：`App.tsx`, `index.tsx`, `types.ts`, 源码目录（`components/` 等）, 工具配置

**目标**：`ls` 根目录从 90+ 降到 ~50，每条都有明确归属；规范流程统一到 `docs/plans/` 一条线。

---

## 涉及的文件与模块

### 删除/移动的文件

| 路径 | 动作 | 阶段 |
|---|---|---|
| `canshu` | rm | Phase 0 |
| `image_001.jpg` | rm | Phase 1 |
| `.t` | rm | Phase 1 |
| `tsc-error-trend.txt` | rm | Phase 1 |
| `playwright-initial-state.yml` | rm | Phase 1 |
| `.page-snapshot-landing.yml` | rm | Phase 1 |
| `PreviewPage.tsx` | rm | Phase 1 |
| `test_bdsm_full_journey.ts` | rm | Phase 1 |
| `test_bdsm_workflow.ts` | rm | Phase 1 |
| `App.test.tsx` | mv → `src/__tests__/App.test.tsx` | Phase 1 |
| `setupTests.ts` | mv → `src/test-utils/setup.ts` | Phase 1 |
| `plans/` (4 文件) | rm | Phase 2 |
| `openspec/` (整树) | rm | Phase 2 |
| `.opencode/` (整树) | rm | Phase 2 |
| `docs/phase-decisions/` (5 文件) | mv → `docs/technical/plans-archive/` | Phase 2 |
| `DEPLOY.md` | 内容并入 `docs/technical/16-deployment.md` 后 rm | Phase 2 |
| `GITHUB-DEPLOY.md` | 内容并入 `docs/technical/16-deployment.md` 后 rm | Phase 2 |
| `services/AGENTS.md` | rm | Phase 2 |
| `videos/` | mv → `resources/videos/` | Phase 3 |
| `tsconfig.app.tsbuildinfo` 等 3 个 | 移动到 `node_modules/.cache/tsc/` | Phase 3 |

### 修改的文件

| 路径 | 改动 |
|---|---|
| `.gitignore` | 加固临时文件 + `*.tsbuildinfo` + `/.ruff_cache/` |
| `package.json` 各 tsconfig 配 `tsBuildInfoFile` | Phase 3 |
| `SECURITY.md` | 加 secrets 管理条款 |
| `docs/technical/README.md` | 加 phase-decisions 章节目录 |
| `docs/technical/16-deployment.md` | 合并两个部署文档 |
| `CLAUDE.md` | 移除 OpenSpec 流程描述（若有） |
| `README.md` / `PROJECT_STRUCTURE.md` | 引用新的部署文档位置 |

---

## 实施步骤

### Phase 0：安全止血 🔴

> **为什么最先做**：避免后续操作（git add、截图工具、备份）扩大明文凭证扩散。

- [ ] **用户操作**：登 Cloudflare Dashboard 撤销被泄漏的 API Token（值已不再 commit history 中，参考 `canshu` 文件本地副本）
- [ ] **用户操作**：登 GitHub 撤销 OAuth App `Ov23liXXXXXXXXXXXXX` 的 client secret（参考 `canshu` 文件本地副本）
- [ ] **用户操作**：生成新凭证，写入 `.env.local` 和 `.env.production`（已 gitignore）
- [ ] `rm /home/fz/project/MoRanJiangHu/canshu`
- [ ] 保留 `.gitignore` 中 `canshu` 行（防御性）
- [ ] 更新 `SECURITY.md`，加"禁止把 secrets 写进仓库目录"条款
- [ ] 验证：`npm run build` 通过（新凭证生效）

**commit**: `chore(security): 删除 canshu 明文凭证文件 + 更新 SECURITY.md`

### Phase 1：根目录临时文件清理 🟡

- [ ] `git rm` 8 个临时文件（直接删）
- [ ] `git mv App.test.tsx src/__tests__/App.test.tsx`
- [ ] `git mv setupTests.ts src/test-utils/setup.ts`（与已有 setup.ts 合并）
- [ ] 编辑 `.gitignore` 追加：
  ```gitignore
  # 根目录临时文件
  /image_*.jpg
  /.t
  /tsc-error-trend.txt
  /PreviewPage.tsx
  /test_*.ts
  /playwright-initial-state.yml
  /.page-snapshot-*.yml
  ```
- [ ] 验证：`npm run build` + `npm run test:run` 通过

**commits**:
- `chore: 清理根目录临时文件 + 加固 .gitignore`
- `refactor: 移动 App.test.tsx 和 setupTests.ts 到 src/`

### Phase 2：规范目录消歧 🟠

#### 2.1 根 `plans/` 删除

- [ ] `git rm -r plans/`
- 4 个文件状态全部为"已完成"或"进度追踪"，按 feature-development.md 规则**直接删**

#### 2.2 OpenSpec 废弃

- [ ] 7 个未完成 change 转 `docs/plans/2026-MM-DD_<name>.md`（取最新一次 commit 时间）
- [ ] `git rm -r openspec/`
- [ ] `git rm -r .opencode/`
- [ ] 验证 `package.json` 无 OpenSpec 依赖
- [ ] 更新 `CLAUDE.md` 移除 OpenSpec 流程描述（若有）

#### 2.3 `docs/phase-decisions/` 并入归档

- [ ] `git mv docs/phase-decisions/*.md docs/technical/plans-archive/`
- [ ] `rmdir docs/phase-decisions`
- [ ] 编辑 `docs/technical/README.md` 加 phase-decisions 章节目录

#### 2.4 合并部署文档

- [ ] 读 `DEPLOY.md` 和 `GITHUB-DEPLOY.md` 完整内容
- [ ] 合并到 `docs/technical/16-deployment.md`（若不存在则新建）
- [ ] `git rm DEPLOY.md GITHUB-DEPLOY.md`
- [ ] 更新 `README.md` 和 `PROJECT_STRUCTURE.md` 引用

#### 2.5 `services/AGENTS.md` 删除

- [ ] `git rm services/AGENTS.md`（与根 AGENTS.md 重复且冲突）

**commits**:
- `chore: 删除根 plans/ 孤儿目录`
- `refactor(docs): 废弃 OpenSpec 合并到 docs/plans/ + 删除 openspec/ 和 .opencode/`
- `refactor(docs): phase-decisions 并入 plans-archive`
- `docs: 合并 DEPLOY.md 和 GITHUB-DEPLOY.md`
- `chore: 删除 services/AGENTS.md 重复文件`

### Phase 3：资源与缓存归位 🔵

#### 3.1 videos/ → resources/videos/

- [ ] `mkdir -p resources/videos`
- [ ] `git mv videos/*.mp4 resources/videos/`
- [ ] `rmdir videos`
- [ ] 在 `docs/technical/16-deployment.md` 备注演示资源位置

#### 3.2 tsbuildinfo 归位

- [ ] 给 `tsconfig.app.json` / `tsconfig.core.json` / `tsconfig.vitest.json` 加 `tsBuildInfoFile` 字段
- [ ] 目标：`node_modules/.cache/tsc/<name>.tsbuildinfo`
- [ ] `.gitignore` 追加 `*.tsbuildinfo` 兜底（替换 `tsconfig.app.tsbuildinfo` 单条）

#### 3.3 .ruff_cache gitignore

- [ ] `.gitignore` 追加 `/.ruff_cache/`

**commit**: `chore: videos/ 移入 resources/ + tsbuildinfo 归位 + .ruff_cache 兜底`

### 验证 + 收尾

- [ ] `git status` 干净
- [ ] `ls` 根目录条目数 < 55
- [ ] `npm run build` 通过
- [ ] `npm run test:run` 通过
- [ ] `npm run lint` 无新增 error
- [ ] `git push -u origin chore/root-dir-cleanup`
- [ ] `gh pr create` 关联此计划
- [ ] 计划文档归档：功能点并入 `docs/technical/`，原文件删除

---

## 风险评估

| 风险 | 等级 | 缓解 |
|---|---|---|
| `canshu` 凭据泄漏 | 🔴 CRITICAL | 立即轮换 + 删文件 + 文档化禁止规则 |
| 移动 `App.test.tsx` 误改 vitest 入口 | 🟠 HIGH | 移动前 grep 引用；移动后跑 test:run |
| OpenSpec 工具链残留引用 | 🟠 HIGH | 删除前 grep `openspec` 关键字确认无引用 |
| 部署文档合并丢内容 | 🟡 MEDIUM | 合并前先 read 两个文件全文；保留所有章节 |
| tsbuildinfo 路径变更引起缓存失效 | 🟢 LOW | 只影响构建性能，不影响正确性；CI 首次构建会重新生成 |

## 验收清单

- [ ] `ls` 根目录输出 < 55 条目
- [ ] 工作区 `git status` 干净
- [ ] `npm run build` + `npm run test:run` + `npm run lint` 全过
- [ ] `canshu` 不存在
- [ ] `plans/`, `openspec/`, `.opencode/`, `docs/phase-decisions/`, `videos/`, `services/AGENTS.md` 全部消失
- [ ] `DEPLOY.md` 和 `GITHUB-DEPLOY.md` 消失，内容合并到 `docs/technical/`
- [ ] `*.tsbuildinfo` 全部在 `node_modules/.cache/tsc/` 下
- [ ] PR 已开 + CI 绿 + AI 检阅通过
