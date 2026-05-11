import type { NPC结构, 服饰部位分类, 道具部位分类, 服装部位, 道具条目 } from '../models/social';

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
