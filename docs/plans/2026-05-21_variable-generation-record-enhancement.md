# 变量生成记录增强方案

## 日期：2026-05-21

## 背景与目标

当前"查看变量生成记录"功能存在三个问题：
1. 非最新回合的 `tavern_commands` 不可查看
2. 按钮仅在校准数据存在时显示，忽略了仅有主命令的回合
3. 两个独立面板需要点两次才能看全

目标：在一个统一面板中展示所有回合的完整变量变更信息。

## 涉及文件

- `components/features/Chat/TurnItem.tsx` — 唯一需要修改的文件

## 技术方案

### 数据源（已全部就绪）

| 字段 | 来源 | 含义 |
|------|------|------|
| `tavern_commands` | 主AI | 变量变更命令 |
| `variable_calibration_report` | 校准模型 | 文字报告 |
| `variable_calibration_commands` | 校准模型 | 补充命令 |

### 三步实施

1. **统一按钮触发** — `hasCalibrationRecord` 加入 `commands.length > 0`
2. **解除最新限制** — 移除命令面板的 `isLatest` 条件
3. **合并统一面板** — 一个按钮 + 分区展示所有变量变更

## 实施步骤

- [x] 步骤 1：修改 hasCalibrationRecord 判断逻辑 → 改为 `hasAnyVariableChange`，加入 `commands.length > 0`
- [x] 步骤 2：移除命令面板 isLatest 限制 → 统一面板不再需要此限制
- [x] 步骤 3：合并按钮为统一入口 → 单按钮 `showVariableDetails`，任一数据源有值即显示
- [x] 步骤 4：重构面板为统一分区展示 → 三个分区：主命令（标注来源）、校准补充命令、变量生成报告
- [x] 步骤 5：验证构建通过 → `npm run build` 成功，无新增错误

## 风险评估

- 低风险：纯 UI 展示层变更，不涉及数据流修改
- 依赖：无外部依赖，所有数据已在 GameResponse 中
