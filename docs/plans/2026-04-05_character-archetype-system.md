# 角色原型系统 (Character Archetype System)

## 状态
- 状态：已实现
- 实现时间：2026-04-05
- 最后更新：已集成到时代主题系统

## 概述
角色原型系统用于定义各时代/子纪元的典型人物特征，为 NPC 生成和开局提供参考。

## 数据结构

### EraCharacterArchetype 接口
```typescript
interface EraCharacterArchetype {
    id: string;           // 唯一标识
    name: string;         // 原型名称
    description: string; // 原型描述
    appearance: string;   // 外观特征描述
    abilities: string[];  // 能力列表
    /** 对外展现的性格 */
    表人格?: string;
    /** 隐藏的真实性格 */
    里人格?: string;
}
```

## 实现位置

### 1. 类型定义
- `models/eraTheme/types.ts` - EraCharacterArchetype 接口定义

### 2. 时代数据
各时代 epoch 文件中的 characterArchetypes 字段：
- `models/eraTheme/epoch-ancient.ts` - 武侠时代角色原型
- `models/eraTheme/epoch-modern.ts` - 都市时代角色原型
- `models/eraTheme/epoch-contemporary.ts` - 当代时代角色原型
- `models/eraTheme/epoch-near-future.ts` - 近未来时代角色原型
- `models/eraTheme/epoch-far-future.ts` - 远未来时代角色原型
- `models/eraTheme/epoch-post-human.ts` - 后人类时代角色原型
- `models/eraTheme/epoch-primordial.ts` - 混沌初开时代角色原型

### 3. 提示词集成
- `prompts/runtime/eraTheme.ts` - `构建时代角色原型注入()` 函数
- `prompts/runtime/opening.ts` - 开局时注入角色原型提示词

### 4. UI 集成
- `components/features/NewGame/NewGameWizardContent.tsx` - 新游戏向导显示已选角色原型
- `components/features/NewGame/useNewGameWizardState.ts` - 获取当前纪元的角色原型列表

## 使用方式

### 提示词注入
```typescript
import { 构建时代角色原型注入 } from '@/prompts/runtime/eraTheme';

const archetypePrompt = 构建时代角色原型注入(eraId);
// 返回格式化的角色原型参考提示词
```

### UI 获取
```typescript
import { useNewGameWizardState } from '@/components/features/NewGame/useNewGameWizardState';

const { getCurrentSubEraData } = useNewGameWizardState();
const { characterArchetypes } = getCurrentSubEraData();
```

## 示例数据 (武侠时代)
```typescript
characterArchetypes: [
    { 
        id: 'wuxia_wandering_swordsman', 
        name: '流浪剑客', 
        description: '江湖独行侠，剑术高超却不求名利', 
        appearance: '一袭青衫，腰间佩剑，面容冷峻', 
        abilities: ['快剑', '轻功', '酒量过人'] 
    },
    { 
        id: 'wuxia_sect_leader', 
        name: '掌门人', 
        description: '名门正派的领袖，德高望重', 
        appearance: '身着门派服饰，手持拂尘，仙风道骨', 
        abilities: ['镇派绝学', '门派威望', '内力深厚'] 
    },
    { 
        id: 'wuxia_poison_master', 
        name: '毒医双修', 
        description: '精通毒药与医术的神秘人物', 
        appearance: '面色苍白，手指常年染着药草之色', 
        abilities: ['毒术', '医术', '药物辨识'] 
    }
]
```

## 集成点

### 1. 开局生成 (opening.ts)
角色原型在开局初始化时被注入到提示词中，为 AI 提供时代人物参考。

### 2. 新游戏向导 (NewGameWizardContent.tsx)
玩家在创建新游戏时可以：
- 查看当前子纪元可用的角色原型列表
- 选择感兴趣的角色原型倾向
- 选中的原型名称会显示在确认界面

### 3. 时代主题继承 (assembly.ts)
`resolveEraNode` 函数会合并继承链上的 characterArchetypes，子纪元继承父纪元的角色原型。

## 扩展计划
- [ ] 为角色原型添加更多维度（背景故事、人物关系）
- [ ] 实现角色原型选择对 NPC 生成的影响
- [ ] 添加角色原型搜索和筛选功能
