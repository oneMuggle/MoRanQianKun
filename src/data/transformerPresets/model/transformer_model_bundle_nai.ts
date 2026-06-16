import { 模型词组转化器预设结构 } from '../../../models/system';

export const transformer_model_bundle_nai: 模型词组转化器预设结构 = {
    id: 'transformer_model_bundle_nai',
    名称: 'NAI',
    是否启用: true,
    模型专属提示词: [
        '目标模型为 NovelAI V4/V4.5。',
        '输出采用 NovelAI 常用的英文 tags 习惯。',
        '若任务要求单角色图，则直接输出单个角色最终 tags；若任务要求场景图，则按基础段 + [序号]角色段组织。',
        '质量串、画风串、主体身份可以使用权重分组；动作、镜头、环境和临时状态保持自然标签表达，让画面更稳。',
        '若输入没有明确要求，不要擅自锁定二次元、写实、国风或摄影风格；只整理并强化已有风格线索。',
        '标签顺序保持稳定，信息容量均衡，避免同义重复，以及把多个镜头语法堆到一起。',
        '必须严格跟随任务要求给出的输出标签结构，不要自行改成带属性的 XML 角色标签。',
        '若 NPC 资料较少，可以根据身份、境界、年龄、性别做保守补全，但补全内容必须长期稳定、低冲突、易复用。'
    ].join('\n'),
    锚定模式模型提示词: [
        '目标模型为 NovelAI V4/V4.5。',
        '请沿用锚点中的稳定外观，把输出重点放在镜头、动作、姿态、构图、光影、环境和临时状态补充。',
        '不要把锚点已经固定的稳定外观重复展开成冗长角色段。'
    ].join('\n'),
    词组序列化策略: 'nai_character_segments',
    NPC词组转化器提示词预设ID: 'transformer_nai_npc',
    场景词组转化器提示词预设ID: 'transformer_nai_scene',
    场景判定提示词预设ID: 'transformer_nai_scene_judge',
    createdAt: 10,
    updatedAt: 10
};