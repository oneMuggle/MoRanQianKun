import { 模型词组转化器预设结构 } from '../../../models/system';

export const transformer_model_bundle_grok: 模型词组转化器预设结构 = {
    id: 'transformer_model_bundle_grok',
    名称: 'Grok',
    是否启用: false,
    模型专属提示词: [
        '目标模型为 Grok 的 2D cinematic 风格图像模型。',
        '允许更强的电影镜头感，但成图仍需保持单帧稳定、可执行、主体清晰。',
        '提示词需要兼顾叙事张力与可执行性，保持 cinematic illustration 的组织方式，而不是杂乱堆叠。',
        '若输入没有明确要求，不要擅自锁定二次元、写实、国风或摄影风格；只整理已有风格线索。',
        '在构图、光影和环境上可以更大胆，但仍要保持一个主镜头、一个主动作、一个主光源结构。',
        '让气势服务于主体识别度和镜头稳定性。',
        '基础段负责整体调度与光影，角色段负责每个角色的姿态、动作和镜头关系。',
        '若 NPC 资料较少，可以根据身份、境界、年龄、性别做保守补全，但补全内容必须长期稳定、低冲突、易复用。'
    ].join('\n'),
    锚定模式模型提示词: [
        '目标模型为 Grok 的 2D cinematic 风格图像模型。',
        '请沿用锚点中的稳定外观，把输出重点放在电影镜头、动作调度、姿态、光影和环境叙事。',
        '不要重复扩写锚点已经固定的核心外观。'
    ].join('\n'),
    词组序列化策略: 'grok_structured',
    NPC词组转化器提示词预设ID: 'transformer_grok_npc',
    场景词组转化器提示词预设ID: 'transformer_grok_scene',
    场景判定提示词预设ID: 'transformer_grok_scene_judge',
    createdAt: 12,
    updatedAt: 12
};