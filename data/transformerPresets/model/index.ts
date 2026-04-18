import { 模型词组转化器预设结构 } from '../../../models/system';
import { transformer_model_bundle_nai } from './transformer_model_bundle_nai';
import { transformer_model_bundle_banana } from './transformer_model_bundle_banana';
import { transformer_model_bundle_grok } from './transformer_model_bundle_grok';

export const 模型词组转化器预设列表: 模型词组转化器预设结构[] = [
    transformer_model_bundle_nai,
    transformer_model_bundle_banana,
    transformer_model_bundle_grok
];

export {
    transformer_model_bundle_nai,
    transformer_model_bundle_banana,
    transformer_model_bundle_grok
};