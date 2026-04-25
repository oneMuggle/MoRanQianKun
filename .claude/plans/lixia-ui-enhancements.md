# 里武侠模式 UI 主题增强方案

## 需求概述

开启"里武侠世界"模式后，UI 需要在视觉和动效层面呈现出更符合武侠+情色主题的氛围感变化，包括配色、动态效果、装饰元素等。

**核心约束：**
- 不破坏现有 8 套主题预设的独立性（里武侠是模式，不是主题替换）
- 效果叠加在用户当前选择的主题之上（如 ink + 里武侠效果）
- 性能友好，动画使用 CSS 实现，不引入新依赖
- 关闭里武侠模式后，所有增强效果完全消失，恢复到普通主题

---

## 实现方案

### 架构思路

里武侠模式目前只影响 AI prompt 注入和数据裁剪，不影响 UI。我们将添加一个 **"里武侠视觉增强层"**，以 `data-lixia="true"` 属性挂在 `<html>` 上，通过 CSS 选择器 `[data-lixia="true"]` 来覆盖/增强现有样式。

这样做的好处：
- 与现有主题系统解耦，不干扰主题切换
- 关闭即消失，不需要还原逻辑
- CSS 层叠天然处理优先级

---

### Phase 1: 数据层与主题引擎扩展（~1h）

#### 1.1 修改 `hooks/useGameState.ts` — 里武侠状态传递到 DOM

在 `useGameState` hook 中，将 `gameConfig.启用里武侠模式` 的状态同步到 `<html>` 元素的 `data-lixia` 属性。

#### 1.2 修改 `styles/themes.ts` — 应用主题时同步保留里武侠属性

确保 `应用主题到根元素` 函数不会覆盖已设置的 `data-lixia` 属性。

---

### Phase 2: CSS 里武侠增强层（~2h）

#### 2.1 新建 `styles/lixia-enhancements.css`

创建里武侠专属的 CSS 增强层，包含以下效果：

**A. 全局暗红光晕背景** — 固定在页面顶部的径向渐变，8秒脉动呼吸

**B. 金色文字微光** — `text-wuxia-gold` 类添加周期性 glow

**C. 消息边框装饰** — AI 消息左侧红色细线，玩家消息右侧紫红渐变

**D. 面板边框 + 内阴影** — 所有卡片面板出现暗红边框和微弱内发光

**E. 花瓣飘落动效** — 纯 CSS 实现的半透明花瓣从顶部落下

**F. 输入框脉动** — AI 思考时输入框边框出现红色呼吸光

**G. 武根卡片装饰** — 武根统计卡片背景渐变加深红边框

---

### Phase 3: 组件层里武侠装饰（~1.5h）

#### 3.1 App.tsx — 添加花瓣装饰层

在 game 视图中条件渲染 `<div className="lixia-petals" />`

#### 3.2 确认现有组件 className

检查聊天消息、面板卡片的现有 className，确保 CSS 选择器能正确命中。

---

### Phase 4: 设置面板增强（~0.5h）

#### 4.1 GameSettings.tsx — 里武侠开关视觉反馈

开关开启时，ToggleSwitch 周围出现红色脉动光晕。

---

## 文件变更清单

| 文件 | 变更类型 | 说明 |
|------|----------|------|
| `styles/lixia-enhancements.css` | **新建** | 里武侠 CSS 增强层（核心文件） |
| `styles/global.css` | 修改 | 引入 lixia-enhancements.css |
| `hooks/useGameState.ts` | 修改 | DOM 属性设置 |
| `styles/themes.ts` | 修改 | 保留 data-lixia 不被主题覆盖 |
| `App.tsx` | 修改 | 添加花瓣装饰层 |
| `components/features/Settings/GameSettings.tsx` | 修改 | 开关光晕反馈 |

---

## 效果预览清单

| 效果 | 类型 | CSS Only |
|------|------|----------|
| 全局暗红光晕背景 | 氛围 | 是 |
| 金色文字微光 | 装饰 | 是 |
| 消息边框装饰 | 结构 | 是 |
| 面板边框 + 内阴影 | 结构 | 是 |
| 花瓣飘落 | 动效 | 是 |
| 输入框脉动 | 状态反馈 | 是 |
| 武根卡片装饰 | 结构 | 是 |
| 设置开关光晕 | 反馈 | 是 |

---

## 预估工时：约 5.5 小时

---

**WAITING FOR CONFIRMATION**: Proceed with this plan? (yes/no/modify)
