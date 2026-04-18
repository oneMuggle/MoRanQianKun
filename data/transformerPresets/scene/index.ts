import { 词组转化器提示词预设结构 } from '../../../models/system';
import { transformer_nai_scene } from './transformer_nai_scene';
import { transformer_banana_scene } from './transformer_banana_scene';
import { transformer_grok_scene } from './transformer_grok_scene';
import { transformer_nai_scene_judge } from './transformer_nai_scene_judge';
import { transformer_banana_scene_judge } from './transformer_banana_scene_judge';
import { transformer_grok_scene_judge } from './transformer_grok_scene_judge';

export const 场景词组转化器提示词预设列表: 词组转化器提示词预设结构[] = [
    transformer_nai_scene,
    transformer_banana_scene,
    transformer_grok_scene,
    transformer_nai_scene_judge,
    transformer_banana_scene_judge,
    transformer_grok_scene_judge
];

export {
    transformer_nai_scene,
    transformer_banana_scene,
    transformer_grok_scene,
    transformer_nai_scene_judge,
    transformer_banana_scene_judge,
    transformer_grok_scene_judge
};