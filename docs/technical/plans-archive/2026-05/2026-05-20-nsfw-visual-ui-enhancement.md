# NSFW 视觉/UI 增强系统

> 创建日期：2026-05-20
> 状态：待审批

## 一、背景与目标

当前 NSFW 完全是纯文本叙事层，缺乏视觉反馈。增加状态可视化、服装动态变化、敏感点图谱激活、情绪指示器和亲密氛围面板。

## 二、涉及文件

### 新增
| 文件 | 说明 |
|------|------|
| `components/features/NSFW/NSFWStatusBar.tsx` | 状态栏（醉酒/兴奋/关系） |
| `components/features/NSFW/ClothingStatePanel.tsx` | 服装可视化 |
| `components/features/NSFW/IntimacyMeter.tsx` | 亲密度仪表盘 |
| `components/features/NSFW/MoodIndicator.tsx` | NPC 情绪指示器 |
| `components/features/NSFW/RiskWarning.tsx` | 风险警告 |
| `components/features/NSFW/MobileNSFWPanel.tsx` | 移动端聚合面板 |
| `hooks/useNSFWState.ts` | NSFW UI 状态 Hook |

### 修改
| 文件 | 修改内容 |
|------|----------|
| `SocialModal.tsx` | 集成 NSFW 状态栏 |
| `MobileSocial.tsx` | 集成移动端面板 |
| `SensitivePointMeridianMap.tsx` | 激活 NSFW 模式 |
| `MeridianBodySVG.tsx` | 增强 NSFW 使用 |
| `BodyPointTooltip.tsx` | 增强提示 |
| `App.tsx` | 注册组件 |
| `models/social.ts` | NPC 添加情绪字段 |

## 三、技术方案

### 状态栏

```
🍺 醉酒: ████░░░░░░ 40% 微醺
🔥 兴奋: ███████░░░ 70%
💕 关系: ██████████░ 暧昧阶段
⚠️  风险: ███░░░░░░ 低
```

### 情绪指示器

| 情绪 | 标识 | 颜色 | 触发 |
|------|------|------|------|
| 紧张 | 😰 | 黄 | 初次/高风险 |
| 兴奋 | 😍 | 粉 | 高兴奋+高好感 |
| 羞涩 | 😳 | 红 | 低经验值 |
| 抗拒 | 😤 | 橙 | 低好感+被迫 |
| 依恋 | 🥰 | 紫 | 高好感+高关系 |
| 恐惧 | 😨 | 深红 | 危机事件 |

## 四、实施步骤

- [ ] Phase 1: 基础 Hook 与状态类型
- [ ] Phase 2: 核心 UI 组件（5个组件）
- [ ] Phase 3: 敏感点图谱集成（激活已有组件）
- [ ] Phase 4: 移动端适配
- [ ] Phase 5: 集成 SocialModal + App.tsx 注册
- [ ] Phase 6: 验证状态同步/服装变化/情绪准确性

## 五、复杂度评估

总工时 ~11h（6个阶段）
