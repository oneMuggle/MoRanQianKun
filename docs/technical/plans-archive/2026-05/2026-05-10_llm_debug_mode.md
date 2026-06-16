# LLM 调试模式

## 背景与目标

当前 LLM 请求/响应链路是一个黑盒：发送了什么提示词、哪些提示词被 LLM 采纳、回复中包含了哪些结构化字段，都无法直接观察。当功能异常时（如行动选项未出现、记忆未注入、世界状态未更新），开发者只能凭猜测排查。

**目标**：添加运行时调试模式，让用户能：
1. 查看每轮发送给 LLM 的完整消息链（系统提示词 + 用户消息）
2. 查看 LLM 原始回复及解析后的结构化字段
3. 追踪哪些提示词成功注入到回复中
4. 通过调试面板快速定位问题轮次，有效溯源

## 涉及的文件与模块

| 模块 | 文件 | 变更类型 |
|------|------|----------|
| 类型定义 | `types.ts` | 新增 DebugTurnLog / DebugPromptTrace / DebugResponseAnalysis |
| 系统模型 | `models/system.ts` | 新增 启用调试模式 / 调试日志保留条数 |
| 默认设置 | `utils/gameSettings.ts` | 补充调试设置默认值 |
| 调试核心 | `services/debug/turnLogger.ts` | 新增 — 环形缓冲区日志服务 |
| 追踪器 | `services/debug/promptTracer.ts` | 新增 — Prompt 注入检测 |
| React Hook | `hooks/useDebugLogger.ts` | 新增 — 桥接服务与 UI |
| 主流程接入 | `hooks/useGame/sendWorkflow/index.ts` | 修改 — 注入捕获点 |
| AI 服务接入 | `services/ai/text/storyCoreTasks.ts` | 修改 — 可选 debug 回调 |
| 设置面板 | `components/features/Settings/SettingsPanel.tsx` | 修改 — 添加开关和入口 |
| 调试面板 | `components/features/Settings/DebugPanel.tsx` | 新增 — 桌面端 UI |
| 调试面板 | `components/features/Settings/MobileDebugPanel.tsx` | 新增 — 移动端 UI |
| 聊天项 | `components/features/Chat/TurnItem.tsx` | 修改 — 调试徽标 |
| 聊天列表 | `components/features/Chat/ChatList.tsx` | 修改 — 透传 isDebugMode |
| 游戏视图 | `components/app/GameView.tsx` | 修改 — 注入 isDebugMode 到 ChatList |
| AI 服务 | `services/ai/text/storyCoreTasks.ts` | 修改 — DebugCaptureCallback 类型 + 4 个函数回调参数 |

## 技术方案

### 数据流

```
sendWorkflow → 构建系统提示词 → 捕获 orderedMessages + contextPieces + runtimePromptStates
            → API 调用 → 获取原始回复 → parseStoryRawText → 捕获 parsed GameResponse
            → promptTracer 分析 → recordTurn 写入环形缓冲区
            → DebugPanel 读取并展示
```

### 存储策略

- **默认**：内存环形缓冲区，最多保留 20 条轮次（可配置）
- **可选**：IndexedDB 持久化（通过 dbService.ts），支持跨会话查看
- **导出**：JSON 格式下载，用于离线分析

### 性能保障

- 调试模式默认关闭，关闭时零开销
- 开启时仅浅拷贝已在内存的对象
- 大提示词按需懒渲染（展开时才渲染）
- 所有调试代码用 try/catch 包裹，不影响正常游戏

## 实施步骤

- [x] 步骤 1：在 `types.ts` 添加调试日志类型定义
- [x] 步骤 2：在 `models/system.ts` 添加调试设置字段
- [x] 步骤 3：在 `utils/gameSettings.ts` 补充默认值
- [x] 步骤 4：创建 `services/debug/turnLogger.ts` 核心服务
- [x] 步骤 5：创建 `services/debug/promptTracer.ts` 注入追踪器
- [x] 步骤 6：创建 `hooks/useDebugLogger.ts` React hook
- [x] 步骤 7：在 `hooks/useGame/sendWorkflow/index.ts` 接入调试捕获
- [x] 步骤 8：在 `services/ai/text/storyCoreTasks.ts` 添加 debug 回调参数（记忆召回、正文润色、世界生成、同人境界生成）
- [x] 步骤 9：创建 `DebugPanel.tsx` 和 `MobileDebugPanel.tsx`
- [x] 步骤 10：在 `SettingsPanel.tsx` 添加开关和入口
- [x] 步骤 11：在 `TurnItem.tsx` 添加调试徽标（聊天项中显示「调试」标识）
- [ ] 步骤 12：端到端测试验证

## 风险评估与依赖

| 风险 | 等级 | 缓解措施 |
|------|------|----------|
| 调试数据泄露敏感信息 | 中 | turnLogger 剥离 API key；导出文件添加警告标签 |
| Prompt tracer 误报/漏报 | 中 | 使用较长、独特的子串匹配，UI 标注"近似匹配" |
| 大提示词渲染慢 | 低 | 懒渲染 + 字符数预览 |
| 修改 sendWorkflow 引入 bug | 低 | 纯新增调用，不改现有逻辑；try/catch 保护 |

**无外部依赖**。所有功能基于现有代码库。
