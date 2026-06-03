# 03 - 提示词架构

> 归档来源：`docs/plans/2026-06-01-systemPromptBuilder-migration.md`（全部步骤已完成）
> 创建：2026-06-03

## 分层结构

```
prompts/
├── core/                    # 核心规则、格式约束、共享 CoT
├── runtime/                 # 开局、世界生成/演变、变量生成、图像提取、NSFW、亲密、气运等
├── writing/                 # 文风、视角、散文约束
├── stats/                   # 经验、战斗、角色、掉落、世界统计
├── difficulty/              # 难度与判定规则
├── shared/                  # 跨工作流共享默认值
└── intimacy/                # 亲密系统规则
```

## systemPromptBuilder 重构（2026-06-01 完成）

### 改造前

`hooks/useGame/systemPromptBuilder.ts` 中 8 个分散的条件性 `import()` 散落各处，触发 TDZ 风险。

### 改造后

- 新建 `hooks/useGame/systemPromptBuilder/promptBuilders.ts` 作为**条件提示词预加载层**
- 8 个分散条件性导入合并为从预加载层导入
- 减少静态依赖，为后续按需加载做准备

## 关键设计原则

1. **静态部分提前注入**：core 提示词随首屏加载
2. **动态部分按需加载**：runtime 中的时代、NSFW 子系统提示词随对应模块 chunk 加载
3. **入口集中**：所有提示词都通过 `构建系统提示词()` 统一入口
