# 写真约拍系统优化计划

**日期：** 2026-05-11
**状态：** 待审批

---

## 问题分析

### 问题一：项目名称显示为 "模特名称 x unknown"

**根因：** 项目数据模型 `拍摄项目状态` 中没有 `项目名称` 字段。UI 中项目名称由 `模特姓名 × 摄影师姓名` 拼接而成（`PhotographyDashboard.tsx:156`）。当 LLM 输出的项目状态中 `摄影师Id` 不是 `"player"` 也不是已知摄影师档案中的 ID 时，`摄影师姓名映射` 查找失败，回退显示 ID 原始值，出现 "unknown"。

此外，LLM 提示词（`photographyNSFW.ts:401`）要求输出的格式是：
```json
{"项目ID":{"实际尺度":"尺度","拍摄阶段":"阶段"}}
```
没有要求 LLM 输出 `摄影师Id`，导致新建项目的 `摄影师Id` 默认为 `"unknown"`（`photographyNSFWIntegration.ts:202`）。

### 问题二：项目缺少阶段性展示

**根因：** 数据模型已有 `拍摄阶段` 字段（`'未开始' | '化妆造型' | '第一组拍摄' | '换装' | '第二组拍摄' | '休息' | '收尾' | '已完成' | '已取消' | '已投诉'`），但 UI 仅在标题行简单显示当前阶段文字，没有子 panel 可视化各阶段的完成情况。

### 问题三：模特被多次解析，出现 "模特id"、"姓名"、"安全感" 等作为模特名称

**根因：** LLM 输出状态更新时，`构建状态输出要求`（`photographyNSFW.ts:401`）要求的格式是：
```json
{"更新模特档案":{"模特ID":{"姓名":"真实姓名",...}}}
```
但 LLM 可能输出不规范的 JSON，例如将字段名（如 "姓名"、"安全感"）误当作模型 ID 的 key，或者将嵌套结构扁平化。`解析写真系统状态更新` 函数对 `更新模特档案` 没有任何校验——直接 `Object.entries` 遍历，把每个 key 都当作模特 ID。

当 LLM 输出类似以下结构时：
```json
{"更新模特档案":{"姓名":"张三","安全感":60}}
```
解析器会将 `"姓名"` 和 `"安全感"` 作为模特 ID 创建假模特。

---

## 优化方案

### 阶段一：数据模型增强

**复杂度：Low**

1. **为 `拍摄项目状态` 添加 `项目名称` 字段**
   - 文件：`models/photographyNSFW/states.ts`
   - 新增 `项目名称: string` 字段
   - 用途：存储具体的拍摄项目名称（如 "春日外景写真"、"职场形象照拍摄"）

2. **为 `拍摄项目状态` 添加 `阶段明细` 字段**
   - 文件：`models/photographyNSFW/states.ts`
   - 新增 `阶段明细: { 阶段名称: string; 状态: '未开始' | '进行中' | '已完成' | '已跳过'; 备注?: string }[]`
   - 用途：追踪每个阶段的完成情况，供 UI 子 panel 展示

### 阶段二：解析器强化

**复杂度：Medium**

3. **增加模特档案解析校验**
   - 文件：`hooks/useGame/photographyNSFWIntegration.ts`
   - 在 `解析写真系统状态更新` 中，对 `更新模特档案` 的每个 entry 进行校验：
     - 只接受 value 为 object 且包含至少一个已知模特字段（如 `姓名`、`安全感`、`信任度`、`当前底线` 等）的 entry
     - 拒绝 key 为已知字段名（如 "姓名"、"安全感"、"信任度"、"模特id"、"ID"）的 entry
   - 定义 `VALID_MODEL_FIELDS` 常量列表用于校验

4. **增加摄影师档案解析校验**
   - 同理，对 `更新摄影师档案` 进行同样的校验

5. **增加项目状态解析校验**
   - 确保 `摄影师Id` 字段在新建项目时不会默认为 `"unknown"`
   - 如果 LLM 未提供 `摄影师Id`，尝试从上下文推断或使用 `"player"`

### 阶段三：提示词优化

**复杂度：Low**

6. **更新 `构建状态输出要求`**
   - 文件：`prompts/runtime/photographyNSFW.ts`
   - 要求 LLM 输出 `项目名称` 字段（具体名词，如 "春日外景写真"）
   - 明确模特 ID 必须是数字或字母 ID，不能是中文字段名
   - 提供正确的输出示例和错误示例

7. **新增项目创建提示词约束**
   - 要求新项目必须包含 `摄影师Id` 字段
   - 如果是玩家摄影师，使用 `"player"` 作为 ID

### 阶段四：UI 升级

**复杂度：Medium**

8. **ProjectCard 显示项目名称**
   - 文件：`components/features/PhotographyDashboard.tsx` 和 `MobilePhotographyDashboard.tsx`
   - 将项目标题从 `模特姓名 × 摄影师姓名` 改为 `项目名称`
   - 在展开详情中显示模特和摄影师姓名

9. **ProjectCard 新增阶段子 Panel**
   - 在项目展开区域，添加阶段进度可视化
   - 使用步骤条（stepper）或进度列表展示每个阶段的名称和状态
   - 已完成阶段标记 ✓，进行中阶段高亮，未开始阶段灰色

10. **移除调试日志**
    - 删除 `PhotographyDashboard.tsx:357` 的 `console.log`

---

## 涉及文件清单

| 文件 | 变更类型 | 说明 |
|------|----------|------|
| `models/photographyNSFW/states.ts` | 修改 | 新增 `项目名称` 和 `阶段明细` 字段 |
| `hooks/useGame/photographyNSFWIntegration.ts` | 修改 | 增强解析校验逻辑 |
| `prompts/runtime/photographyNSFW.ts` | 修改 | 优化状态输出提示词 |
| `components/features/PhotographyDashboard.tsx` | 修改 | 项目名称显示 + 阶段子 Panel |
| `components/features/MobilePhotographyDashboard.tsx` | 修改 | 同上，移动端适配 |
| `hooks/useGame/photographyNSFWEngine.ts` | 修改（可选） | 默认项目工厂函数更新 |

## 风险评估

| 风险 | 级别 | 应对 |
|------|------|------|
| 已有项目的 `项目名称` 为空 | Low | 迁移时自动生成默认名称 "写真拍摄项目" |
| LLM 不遵循新的输出格式 | Medium | 提示词中提供正反示例 + 解析器双重校验 |
| 阶段明细与现有 `拍摄阶段` 字段不一致 | Low | 保持 `拍摄阶段` 为主状态，`阶段明细` 仅用于 UI 展示 |

## 实施顺序

- [x] 阶段一：数据模型增强（`states.ts` 新增 `项目名称` + `阶段明细`；`photographyNSFWEngine.ts` 更新工厂函数）
- [x] 阶段二：解析器强化（`photographyNSFWIntegration.ts` 增加白名单校验 + 双重过滤；项目默认摄影师 ID 改为 `player`）
- [x] 阶段三：提示词优化（`photographyNSFW.ts` 更新输出格式要求，增加 `项目名称` 字段和 ID 格式约束）
- [x] 阶段四：UI 升级（桌面端和移动端 ProjectCard 显示项目名称 + 阶段子 Panel；移除 console.log）
