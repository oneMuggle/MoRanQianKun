import type { 气运数据 } from '../index';

export { 真气运 } from './zhen-qiyun';
export { 限制版气运 } from './xianzhi';
export { 因果律 } from './causality';
export { 天道规则 } from './heavenly-rules';
export { 绝对无敌 } from './absolute-inv';
export { 脑洞破防 } from './brain-hole';
export { 法则扭曲 } from './law-twist';
export { 白嫖躺赢 } from './white-free';
export { 怠惰降维 } from './lazy-dim';
export { 精神暴击 } from './mental-crit';
export { 合欢秘辛 } from './hehuan';

export const 气运数据列表: 气运数据[] = [
    ...真气运,
    ...限制版气运,
    ...因果律,
    ...天道规则,
    ...绝对无敌,
    ...脑洞破防,
    ...法则扭曲,
    ...白嫖躺赢,
    ...怠惰降维,
    ...精神暴击,
    ...合欢秘辛,
];
