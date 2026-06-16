# NSFW 叙事质量升级系统

> 创建日期：2026-05-20
> 状态：待审批

## 一、背景与目标

当前 NSFW 约束是静态 prompt，缺乏动态调节。增加动态强度调节、NPC 个性化叙事、场景分支叙事、多角色欲望摘要，大幅提升叙事质量。

## 二、涉及文件

### 新增
| 文件 | 说明 |
|------|------|
| `models/nsfw/narrative/types.ts` | 叙事类型定义 |
| `models/nsfw/narrative/dynamicIntensity.ts` | 动态强度调节 |
| `models/nsfw/narrative/npcNarrativeProfile.ts` | NPC 叙事档案 |
| `models/nsfw/narrative/branchingScenarios.ts` | 分支场景定义 |
| `models/nsfw/narrative/multiNPCDesire.ts` | 多 NPC 欲望摘要 |
| `models/nsfw/narrative/narrativeEngine.ts` | 叙事引擎 |
| `prompts/runtime/narrativeQualityNSFW.ts` | 叙事质量提示词 |
| `hooks/useGame/engine/narrativeEngine.ts` | 引擎适配器 |

### 修改
| 文件 | 修改内容 |
|------|----------|
| `models/system.ts` | 添加 `叙事质量设置` |
| `prompts/runtime/nsfw.ts` | 注入叙事约束 |
| `hooks/useGame/engine/types.ts` | 添加 `'nsfwNarrative'` |
| `hooks/useGame.ts` | 注册引擎 |
| `models/social.ts` | NPC 添加 `叙事特征` |

## 三、技术方案

### NPC 叙事特征

```typescript
interface NPC叙事特征 {
  叙事风格: '含蓄委婉' | '直接大胆' | '情感主导' | '感官主导';
  主动程度: number;     // 0-100
  语言表达: string[];   // 特有口癖
  身体反应模式: string[];
  情感触发词: string[];
  抗拒触发词: string[];
  叙事视角偏好: '第一人称内心' | '第三人称' | '对话主导' | '动作主导';
}
```

### 分支场景示例

| 场景 | 分支 A | 分支 B | 分支 C |
|------|--------|--------|--------|
| 酒吧搭讪 | 浪漫路线 | 激情路线 | 危机路线 |
| 写真约拍 | 专业路线 | 灰色路线 | 泄露路线 |
| 校园互动 | 青春路线 | 权力路线 | 暴露路线 |

### 多 NPC 欲望摘要

```
【在场 NPC 欲望状态】
- 张三：欲望 75，好感 82，倾向：主动接近
- 李四：欲望 45，好感 60，倾向：观察犹豫
- 王五：欲望 30，好感 40，倾向：保持距离
焦点 NPC：张三，叙事建议：以张三为主，李四旁观
```

## 四、实施步骤

- [ ] Phase 1: 类型 + NPC 叙事档案
- [ ] Phase 2: 核心引擎（动态强度/分支场景/多NPC欲望/叙事引擎）
- [ ] Phase 3: AI 叙事质量约束集成
- [ ] Phase 4: 引擎注册 + 设置 + NPC 结构扩展
- [ ] Phase 5: 各 NSFW 子系统接入 + 分支逻辑 + 摘要生成
- [ ] Phase 6: 验证动态强度/NPC风格差异/分支效果/摘要质量

## 五、复杂度评估

总工时 ~14h（6个阶段）
