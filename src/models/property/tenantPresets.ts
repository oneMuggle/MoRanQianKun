// 房产 SLG 经营系统 - 房客类型预设

import type { 房客类型预设 } from './types';

export const 房客类型预设列表: 房客类型预设[] = [
    {
        类型: '江湖客',
        基础租金倍率: 1.0,
        偏好设施: ['bed_wood_simple', 'wash_basin', 'wine_jar', 'fireplace'],
        厌恶设施: ['guqin', 'tea_set', 'go_board'],
        性格标签池: ['豪爽', '直率', '好斗', '仗义', '不拘小节'],
        特殊需求池: ['需要练功场所', '喜欢喝酒', '不喜吵闹'],
        满意度衰减率: 2,
        退租阈值: 20
    },
    {
        类型: '商人',
        基础租金倍率: 1.5,
        偏好设施: ['bed_golden_phoenix', 'tea_set', 'coffee_machine', 'wifi_router', 'smart_lock'],
        厌恶设施: ['mat_straw', 'meditation_mat', 'training_room'],
        性格标签池: ['精明', '圆滑', '慷慨', '谨慎', '善于交际'],
        特殊需求池: ['需要网络', '讲究品质', '需要安全'],
        满意度衰减率: 1,
        退租阈值: 30
    },
    {
        类型: '文人',
        基础租金倍率: 0.8,
        偏好设施: ['go_board', 'guqin', 'tea_set', 'decoration_painting', 'garden_small', 'bath_hot_spring'],
        厌恶设施: ['training_room', 'guard_tower', 'tv_flat'],
        性格标签池: ['清高', '风雅', '敏感', '孤傲', '浪漫'],
        特殊需求池: ['需要安静', '需要灵感空间', '喜好雅致'],
        满意度衰减率: 3,
        退租阈值: 25
    },
    {
        类型: '侠客',
        基础租金倍率: 1.2,
        偏好设施: ['training_room', 'training_room_deluxe', 'bed_wood_carved', 'meditation_mat'],
        厌恶设施: ['tv_projector', 'guqin', 'decoration_lantern'],
        性格标签池: ['正义', '沉默', '自律', '果断', '重诺'],
        特殊需求池: ['需要练武场', '需要清净', '不喜奢华'],
        满意度衰减率: 1,
        退租阈值: 15
    },
    {
        类型: '隐士',
        基础租金倍率: 0.6,
        偏好设施: ['meditation_mat', 'garden_small', 'tea_set', 'bath_hot_spring'],
        厌恶设施: ['tv_flat', 'wifi_router', 'security_camera', 'guard_tower'],
        性格标签池: ['淡泊', '沉默', '神秘', '随和', '独来独往'],
        特殊需求池: ['需要独处', '不喜被打扰', '远离喧嚣'],
        满意度衰减率: 2,
        退租阈值: 35
    },
    {
        类型: '官差',
        基础租金倍率: 1.3,
        偏好设施: ['guard_post', 'guard_tower', 'wall_high', 'bed_spring_double', 'smart_lock'],
        厌恶设施: ['mat_straw', 'wine_jar', 'training_room'],
        性格标签池: ['严肃', '守规', '多疑', '忠诚', '谨慎'],
        特殊需求池: ['需要安全', '讲究秩序', '不喜混乱'],
        满意度衰减率: 1,
        退租阈值: 25
    },
    {
        类型: '游医',
        基础租金倍率: 0.9,
        偏好设施: ['wash_basin', 'bath_wood_tub', 'garden_small', 'storage_cabinet', 'washer'],
        厌恶设施: ['training_room', 'wine_jar', 'tv_projector'],
        性格标签池: ['和善', '耐心', '细心', '谨慎', '博爱'],
        特殊需求池: ['需要洁净', '需要储药空间', '不喜吵闹'],
        满意度衰减率: 2,
        退租阈值: 30
    },
    {
        类型: '艺伎',
        基础租金倍率: 1.8,
        偏好设施: ['guqin', 'decoration_painting', 'decoration_screen', 'bed_golden_phoenix', 'bath_jacuzzi'],
        厌恶设施: ['mat_straw', 'training_room', 'guard_post'],
        性格标签池: ['优雅', '妩媚', '聪慧', '善解人意', '多愁善感'],
        特殊需求池: ['需要雅致环境', '需要隐私', '讲究生活品质'],
        满意度衰减率: 3,
        退租阈值: 20
    }
];

// ─── 按类型查找房客预设 ───

export const 按类型查找房客预设 = (类型: string): 房客类型预设 | undefined => {
    return 房客类型预设列表.find(p => p.类型 === 类型);
};

// ─── 随机选择房客类型（基于吸引力加权） ───

export const 随机选择房客类型 = (吸引力: number, 时代: string = '古代'): string => {
    const pool = 房客类型预设列表;

    if (吸引力 >= 80) {
        const idx = Math.floor(Math.random() * pool.length);
        return pool[idx].类型;
    } else if (吸引力 >= 50) {
        const midPool = pool.filter(p => p.基础租金倍率 <= 1.3);
        const idx = Math.floor(Math.random() * midPool.length);
        return midPool[idx].类型;
    } else {
        const lowPool = pool.filter(p => p.基础租金倍率 <= 1.0);
        const idx = Math.floor(Math.random() * lowPool.length);
        return lowPool[idx].类型;
    }
};
