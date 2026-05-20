import type { NPC结构, 服饰部位分类, 道具部位分类, 服装部位, 道具条目, 服装状态值, 服装状态结构 } from '../models/social';

/**
 * 统一读取 NPC 衣着文本（向后兼容）
 */
export const 获取NPC衣着文本 = (npc: NPC结构): string => {
    const 档案 = npc.服饰档案;
    if (档案) {
        const parts: string[] = [];
        if (档案.上衣?.名称) parts.push(档案.上衣.名称);
        if (档案.外套?.名称) parts.push(档案.外套.名称);
        if (档案.下着?.名称) parts.push(档案.下着.名称);
        if (档案.鞋子?.名称) parts.push(档案.鞋子.名称);
        if (档案.配饰?.名称) parts.push(档案.配饰.名称);
        if (parts.length > 0) return parts.join('，');
    }
    return npc.衣着风格 || '';
};

/**
 * 获取特定部位的服装信息
 */
export const 获取服装部位 = (
    npc: NPC结构,
    部位: 服饰部位分类
): 服装部位 | undefined => {
    return npc.服饰档案?.[部位];
};

/**
 * 获取特定类别的道具信息
 */
export const 获取道具类别 = (
    npc: NPC结构,
    类别: 道具部位分类
): 道具条目 | undefined => {
    return npc.道具档案?.[类别];
};

/**
 * 获取 NPC 道具摘要文本
 */
export const 获取NPC道具摘要 = (npc: NPC结构): string => {
    const 档案 = npc.道具档案;
    if (!档案) return '';
    const parts: string[] = [];
    if (档案.束缚器具?.名称) parts.push(档案.束缚器具.名称);
    if (档案.刺激器具?.名称) parts.push(档案.刺激器具.名称);
    if (档案.穿戴器具?.名称) parts.push(档案.穿戴器具.名称);
    if (档案.遥控设备?.名称) parts.push(档案.遥控设备.名称);
    if (档案.消耗品?.名称) parts.push(档案.消耗品.名称);
    if (档案.特殊?.名称) parts.push(档案.特殊.名称);
    if (parts.length > 0) return parts.join('，');
    return '';
};

/**
 * 获取服饰档案中已填写的部位列表
 */
export const 获取已装备部位 = (npc: NPC结构): 服饰部位分类[] => {
    const 档案 = npc.服饰档案;
    if (!档案) return [];
    const 部位列表: 服饰部位分类[] = ['上衣', '下着', '鞋子', '袜子', '内衣', '内裤', '配饰', '头饰', '外套', '特殊'];
    return 部位列表.filter(部位 => 档案[部位] !== undefined);
};

/**
 * 获取道具档案中已填写的类别列表
 */
export const 获取已装备道具 = (npc: NPC结构): 道具部位分类[] => {
    const 档案 = npc.道具档案;
    if (!档案) return [];
    const 类别列表: 道具部位分类[] = ['束缚器具', '刺激器具', '穿戴器具', '消耗品', '遥控设备', '特殊'];
    return 类别列表.filter(类别 => 档案[类别] !== undefined);
};

// ==================== 服装层次可视化 ====================

/** 服装状态的视觉颜色标识 */
export const 服装状态颜色映射: Record<服装状态值, string> = {
    '穿着': 'text-green-400',
    '半敞': 'text-yellow-400',
    '褪下': 'text-orange-400',
    '移除': 'text-red-400',
};

/** 服装状态的热度值 (0-1) */
export const 服装状态热度映射: Record<服装状态值, number> = {
    '穿着': 1,
    '半敞': 0.6,
    '褪下': 0.3,
    '移除': 0,
};

/** 服装层次视觉条目 */
export interface 服装层次视觉条目 {
    部位: 服饰部位分类;
    名称: string;
    描述: string;
    状态: 服装状态值 | undefined;
    层次深度: number;
    颜色标识: string;
    热度值: number;
}

/** 获取指定部位的服装状态值 */
function 获取部位状态(部位: 服饰部位分类, 状态结构?: 服装状态结构): 服装状态值 | undefined {
    if (!状态结构) return undefined;
    switch (部位) {
        case '上衣': return 状态结构.上衣状态;
        case '下着': return 状态结构.下装状态;
        case '内衣': return 状态结构.内衣状态;
        case '内裤': return 状态结构.内裤状态;
        case '袜子': return 状态结构.袜饰状态;
        default: return undefined;
    }
}

/**
 * 服装层次深度排序（从外到内）
 * 外套 > 上衣 > 下着 > 鞋子 > 袜子 > 配饰 > 头饰 > 内衣 > 内裤 > 特殊
 */
const 层次排序: 服饰部位分类[] = ['外套', '上衣', '下着', '鞋子', '袜子', '配饰', '头饰', '内衣', '内裤', '特殊'];

/**
 * 获取 NPC 的服装层次列表（用于可视化展示）
 * 返回按层次深度排序的服装条目数组
 */
export const 获取服装层次列表 = (npc: NPC结构): 服装层次视觉条目[] => {
    const 档案 = npc.服饰档案;
    if (!档案) return [];

    const 结果: 服装层次视觉条目[] = [];

    for (const 部位 of 层次排序) {
        const 服装 = 档案[部位];
        if (!服装 || !服装.名称) continue;

        const 状态 = 获取部位状态(部位, npc.当前服装状态);
        const 深度 = 层次排序.indexOf(部位);
        const 颜色标识 = 状态 ? (服装状态颜色映射[状态] ?? 'text-gray-400') : 'text-gray-400';
        const 热度值 = 状态 ? (服装状态热度映射[状态] ?? 1) : 1;

        结果.push({
            部位,
            名称: 服装.名称,
            描述: 服装.描述,
            状态,
            层次深度: 深度,
            颜色标识,
            热度值,
        });
    }

    return 结果;
};

/**
 * 获取各部位的层次深度摘要（用于热力图显示）
 */
export const 获取部位层次摘要 = (npc: NPC结构): Record<服饰部位分类, { 有无服装: boolean; 状态: 服装状态值 | undefined; 名称?: string }> => {
    const 档案 = npc.服饰档案;
    const 摘要: Record<服饰部位分类, { 有无服装: boolean; 状态: 服装状态值 | undefined; 名称?: string }> = {} as any;

    const 部位列表: 服饰部位分类[] = ['上衣', '下着', '鞋子', '袜子', '内衣', '内裤', '配饰', '头饰', '外套', '特殊'];
    for (const 部位 of 部位列表) {
        const 服装 = 档案?.[部位];
        摘要[部位] = {
            有无服装: !!服装 && !!服装.名称,
            状态: 获取部位状态(部位, npc.当前服装状态),
            名称: 服装?.名称,
        };
    }

    return 摘要;
};
