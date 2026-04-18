import { 词组转化器提示词预设结构 } from '../../../models/system';
import { transformer_nai_npc } from './transformer_nai_npc';
import { transformer_banana_npc } from './transformer_banana_npc';
import { transformer_grok_npc } from './transformer_grok_npc';

export const NPC词组转化器提示词预设列表: 词组转化器提示词预设结构[] = [
    transformer_nai_npc,
    transformer_banana_npc,
    transformer_grok_npc
];

export {
    transformer_nai_npc,
    transformer_banana_npc,
    transformer_grok_npc
};