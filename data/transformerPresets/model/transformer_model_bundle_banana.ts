import { 模型词组转化器预设结构 } from '../../../models/system';

export const transformer_model_bundle_banana: 模型词组转化器预设结构 = {
    id: 'transformer_model_bundle_banana',
    名称: 'GeminiBanana',
    是否启用: false,
    模型专属提示词: [
        '目标模型为 Gemini Banana。',
        '输出更适合清晰、具体、可执行的英文描述式提示词，而不是纯 Danbooru 标签堆叠。',
        '请优先使用短英文短语或短句，不要使用 NovelAI 权重语法，不要堆砌过碎标签。',
        '若输入没有明确要求，不要擅自锁定二次元、写实、国风或摄影风格；只整理已有风格线索。',
        '描述要明确主体、服装、动作、镜头和环境，保持具体、可执行。',
        '基础段负责整体场景和镜头，角色段负责每个角色的完整可执行短语，并保持单镜头、单主动作、单主光源。',
        '若 NPC 资料较少，可以根据身份、境界、年龄、性别做保守补全，但补全内容必须长期稳定、低冲突、易复用。'
    ].join('\n'),
    锚定模式模型提示词: [
        '目标模型为 Gemini Banana。',
        '请沿用锚点中的稳定外观，把输出重点放在镜头、动作、姿态、表情、场景、气氛和临时变化补充。',
        '不要把锚点已确定的外观再次膨胀成大段重复描述。'
    ].join('\n'),
    词组序列化策略: 'gemini_structured',
    NPC词组转化器提示词预设ID: 'transformer_banana_npc',
    场景词组转化器提示词预设ID: 'transformer_banana_scene',
    场景判定提示词预设ID: 'transformer_banana_scene_judge',
    createdAt: 11,
    updatedAt: 11
};