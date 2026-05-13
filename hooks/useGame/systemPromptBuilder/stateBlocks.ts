import { 规范化环境信息 } from '../stateTransforms';
import { normalizeCanonicalGameTime, 环境时间转标准串, 结构化时间转标准串 } from '../time/timeUtils';
import { 规范化游戏设置 } from '../../../utils/gameSettings';
import { 规范化世界状态, 规范化战斗状态 } from '../storyState';
import { 裁剪修炼体系上下文数据, 裁剪里武侠上下文数据, 裁剪里志怪上下文数据 } from '../../../utils/promptFeatureToggles';
import { 计算气运属性修正 } from '../../../data/qiyun';
import { 包装树状上下文 } from './coreBlocks';

export const 构建环境状态文本 = (payload: any): string => {
    const source = payload || {};
    const env = 规范化环境信息(source?.环境);
    const role = source?.角色 && typeof source.角色 === 'object' ? source.角色 : {};
    const 取文本 = (value: any) => (typeof value === 'string' ? value : '');
    const 取数值 = (value: any, fallback: number = 0) => (
        typeof value === 'number' && Number.isFinite(value) ? value : fallback
    );
    const 当前坐标X = typeof role?.当前坐标X === 'number' && Number.isFinite(role.当前坐标X) ? role.当前坐标X : 0;
    const 当前坐标Y = typeof role?.当前坐标Y === 'number' && Number.isFinite(role.当前坐标Y) ? role.当前坐标Y : 0;
    const 节日原始 = env?.节日 && typeof env.节日 === 'object' ? env.节日 : null;
    const 天气原始: any = env?.天气 && typeof env.天气 === 'object' ? env.天气 : {};
    const 环境变量列表原始 = Array.isArray(env?.环境变量)
        ? env.环境变量
        : (env?.环境变量 && typeof env.环境变量 === 'object' ? [env.环境变量] : []);
    const 天气结束日期 = (() => {
        if (typeof 天气原始?.结束日期 === 'string') {
            const canonical = normalizeCanonicalGameTime(天气原始.结束日期);
            return canonical || 天气原始.结束日期;
        }
        const structured = 结构化时间转标准串(天气原始?.结束日期);
        if (structured) {
            const canonical = normalizeCanonicalGameTime(structured);
            return canonical || structured;
        }
        const fallback = 环境时间转标准串(env);
        return fallback || '';
    })();
    const orderedEnv = {
        时间: 环境时间转标准串(env) || '',
        大地点: 取文本(env?.大地点),
        中地点: 取文本(env?.中地点),
        小地点: 取文本(env?.小地点),
        具体地点: 取文本(env?.具体地点),
        当前坐标: `[${当前坐标X},${当前坐标Y}]`,
        节日: 节日原始
            ? {
                名称: 取文本(节日原始?.名称),
                简介: 取文本(节日原始?.简介),
                效果: 取文本(节日原始?.效果)
            }
            : null,
        天气: {
            天气: 取文本(天气原始?.天气),
            结束日期: 天气结束日期
        },
        环境变量: 环境变量列表原始
            .map((item: any, idx: number) => ({
                索引: idx,
                名称: 取文本(item?.名称),
                描述: 取文本(item?.描述),
                效果: 取文本(item?.效果)
            }))
            .filter((item: any) => item.名称 || item.描述 || item.效果)
    };
    return 包装树状上下文('当前环境', orderedEnv);
};

export const 构建角色状态文本 = (payload: any, gameConfig: any): string => {
    const source = payload || {};
    const role = source?.角色 && typeof source.角色 === 'object' ? source.角色 : {};
    const 启用饱腹口渴系统 = 规范化游戏设置(gameConfig).启用饱腹口渴系统 !== false;
    const 取文本 = (value: any) => (typeof value === 'string' ? value : '');
    const 取数值 = (value: any, fallback: number = 0) => (
        typeof value === 'number' && Number.isFinite(value) ? value : fallback
    );
    const 取数组 = (value: any) => (Array.isArray(value) ? value : []);
    const 天赋列表 = 取数组(role?.天赋列表).map((item: any) => ({
        名称: 取文本(item?.名称),
        描述: 取文本(item?.描述),
        效果: 取文本(item?.效果)
    }));
    const 气运列表 = 取数组(role?.气运列表);
    const 出身背景原始 = role?.出身背景 && typeof role.出身背景 === 'object' ? role.出身背景 : {};
    const 出身背景 = {
        名称: 取文本(出身背景原始?.名称),
        描述: 取文本(出身背景原始?.描述),
        效果: 取文本(出身背景原始?.效果)
    };
    const 金钱原始 = role?.金钱 && typeof role.金钱 === 'object' ? role.金钱 : {};
    const 金钱 = {
        金元宝: 取数值(金钱原始?.金元宝),
        银子: 取数值(金钱原始?.银子),
        铜钱: 取数值(金钱原始?.铜钱)
    };
    const 装备原始 = role?.装备 && typeof role.装备 === 'object' ? role.装备 : {};
    const 装备 = {
        头部: 取文本(装备原始?.头部),
        胸部: 取文本(装备原始?.胸部),
        盔甲: 取文本(装备原始?.盔甲),
        内衬: 取文本(装备原始?.内衬),
        腿部: 取文本(装备原始?.腿部),
        手部: 取文本(装备原始?.手部),
        足部: 取文本(装备原始?.足部),
        主武器: 取文本(装备原始?.主武器),
        副武器: 取文本(装备原始?.副武器),
        暗器: 取文本(装备原始?.暗器),
        背部: 取文本(装备原始?.背部),
        腰部: 取文本(装备原始?.腰部),
        坐骑: 取文本(装备原始?.坐骑)
    };
    const 玩家BUFF列表 = 取数组(role?.玩家BUFF).map((item: any) => {
        const raw = item && typeof item === 'object' ? item : {};
        return {
            名称: 取文本(raw?.名称),
            描述: 取文本(raw?.描述),
            效果: 取文本(raw?.效果),
            结束时间: 取文本(raw?.结束时间)
        };
    });
    const 突破条件列表 = 取数组(role?.突破条件).map((item: any) => {
        const raw = item && typeof item === 'object' ? item : {};
        return {
            名称: 取文本(raw?.名称),
            描述: 取文本(raw?.描述),
            要求: 取文本(raw?.要求),
            当前进度: 取文本(raw?.当前进度)
        };
    });
    const 功法列表 = 取数组(role?.功法列表).map((item: any) => {
        const raw = item && typeof item === 'object' ? item : {};
        const 附带效果 = 取数组(raw?.附带效果).map((effect: any) => ({
            名称: 取文本(effect?.名称),
            触发概率: 取文本(effect?.触发概率),
            持续时间: 取文本(effect?.持续时间),
            数值参数: 取文本(effect?.数值参数),
            生效间隔: 取文本(effect?.生效间隔)
        }));
        const 被动修正 = 取数组(raw?.被动修正).map((passive: any) => ({
            属性名: 取文本(passive?.属性名),
            数值: 取数值(passive?.数值),
            类型: 取文本(passive?.类型)
        }));
        const 重数描述映射 = 取数组(raw?.重数描述映射).map((stage: any) => ({
            重数: 取数值(stage?.重数),
            描述: 取文本(stage?.描述)
        }));
        const 境界特效 = 取数组(raw?.境界特效).map((feature: any) => ({
            解锁重数: 取数值(feature?.解锁重数),
            描述: 取文本(feature?.描述)
        }));
        return {
            ID: 取文本(raw?.ID),
            名称: 取文本(raw?.名称),
            描述: 取文本(raw?.描述),
            类型: 取文本(raw?.类型),
            品质: 取文本(raw?.品质),
            来源: 取文本(raw?.来源),
            当前重数: 取数值(raw?.当前重数),
            最高重数: 取数值(raw?.最高重数),
            当前熟练度: 取数值(raw?.当前熟练度),
            升级经验: 取数值(raw?.升级经验),
            突破条件: 取文本(raw?.突破条件),
            境界限制: 取文本(raw?.境界限制),
            大成方向: 取文本(raw?.大成方向),
            圆满效果: 取文本(raw?.圆满效果),
            武器限制: 取数组(raw?.武器限制),
            消耗类型: 取文本(raw?.消耗类型),
            消耗数值: 取数值(raw?.消耗数值),
            施展耗时: 取文本(raw?.施展耗时),
            冷却时间: 取文本(raw?.冷却时间),
            基础伤害: 取数值(raw?.基础伤害),
            加成属性: 取文本(raw?.加成属性),
            加成系数: 取数值(raw?.加成系数),
            内力系数: 取数值(raw?.内力系数),
            伤害类型: 取文本(raw?.伤害类型),
            目标类型: 取文本(raw?.目标类型),
            最大目标数: 取数值(raw?.最大目标数),
            重数描述映射,
            附带效果,
            被动修正,
            境界特效
        };
    });

    const orderedRole = {
        姓名: 取文本(role?.姓名),
        性别: 取文本(role?.性别),
        年龄: 取数值(role?.年龄),
        出生日期: 取文本(role?.出生日期),
        外貌: 取文本(role?.外貌),
        性格: 取文本(role?.性格),
        称号: 取文本(role?.称号),
        境界: 取文本(role?.境界),
        境界层级: 取数值(role?.境界层级, 1),
        天赋列表,
        出身背景,
        所属门派ID: 取文本(role?.所属门派ID),
        门派职位: 取文本(role?.门派职位),
        门派贡献: 取数值(role?.门派贡献),
        金钱,
        当前精力: 取数值(role?.当前精力),
        最大精力: 取数值(role?.最大精力),
        当前内力: 取数值(role?.当前内力),
        最大内力: 取数值(role?.最大内力),
        ...(启用饱腹口渴系统 ? {
            当前饱腹: 取数值(role?.当前饱腹),
            最大饱腹: 取数值(role?.最大饱腹),
            当前口渴: 取数值(role?.当前口渴),
            最大口渴: 取数值(role?.最大口渴)
        } : {}),
        当前负重: 取数值(role?.当前负重),
        最大负重: 取数值(role?.最大负重),
        当前坐标X: 取数值(role?.当前坐标X),
        当前坐标Y: 取数值(role?.当前坐标Y),
        力量: 计算气运属性修正(取数值(role?.力量), 气运列表),
        敏捷: 计算气运属性修正(取数值(role?.敏捷), 气运列表),
        体质: 计算气运属性修正(取数值(role?.体质), 气运列表),
        根骨: 计算气运属性修正(取数值(role?.根骨), 气运列表),
        悟性: 计算气运属性修正(取数值(role?.悟性), 气运列表),
        福源: 计算气运属性修正(取数值(role?.福源), 气运列表),
        头部当前血量: 取数值(role?.头部当前血量),
        头部最大血量: 取数值(role?.头部最大血量),
        头部状态: 取文本(role?.头部状态),
        胸部当前血量: 取数值(role?.胸部当前血量),
        胸部最大血量: 取数值(role?.胸部最大血量),
        胸部状态: 取文本(role?.胸部状态),
        腹部当前血量: 取数值(role?.腹部当前血量),
        腹部最大血量: 取数值(role?.腹部最大血量),
        腹部状态: 取文本(role?.腹部状态),
        左手当前血量: 取数值(role?.左手当前血量),
        左手最大血量: 取数值(role?.左手最大血量),
        左手状态: 取文本(role?.左手状态),
        右手当前血量: 取数值(role?.右手当前血量),
        右手最大血量: 取数值(role?.右手最大血量),
        右手状态: 取文本(role?.右手状态),
        左腿当前血量: 取数值(role?.左腿当前血量),
        左腿最大血量: 取数值(role?.左腿最大血量),
        左腿状态: 取文本(role?.左腿状态),
        右腿当前血量: 取数值(role?.右腿当前血量),
        右腿最大血量: 取数值(role?.右腿最大血量),
        右腿状态: 取文本(role?.右腿状态),
        装备,
        物品列表: 取数组(role?.物品列表).map((item: any) => (
            item && typeof item === 'object'
                ? { ...item }
                : { 名称: 取文本(item) }
        )),
        功法列表,
        当前经验: 取数值(role?.当前经验),
        升级经验: 取数值(role?.升级经验),
        玩家BUFF: 玩家BUFF列表,
        突破条件: 突破条件列表
    };
    const normalizedGameConfig = 规范化游戏设置(gameConfig);

    return 包装树状上下文('用户角色数据', 裁剪里志怪上下文数据(裁剪里武侠上下文数据(裁剪修炼体系上下文数据(orderedRole, normalizedGameConfig), normalizedGameConfig), normalizedGameConfig));
};

export const 构建世界状态文本 = (payload: any, gameConfig: any): string => {
    const world = 规范化世界状态(payload?.世界);
    const 取文本 = (value: any) => (typeof value === 'string' ? value : '');
    const 取数组 = (value: any) => (Array.isArray(value) ? value : []);
    const orderedWorld = {
        活跃NPC列表: 取数组(world?.活跃NPC列表).map((npc: any, idx: number) => ({
            索引: idx,
            姓名: 取文本(npc?.姓名),
            所属势力: 取文本(npc?.所属势力),
            当前位置: 取文本(npc?.当前位置),
            当前状态: 取文本(npc?.当前状态),
            当前行动: 取文本(npc?.当前行动),
            行动开始时间: 取文本(npc?.行动开始时间),
            行动结束时间: 取文本(npc?.行动结束时间)
        })),
        待执行事件: 取数组(world?.待执行事件).map((event: any, idx: number) => ({
            索引: idx,
            事件名: 取文本(event?.事件名),
            类型: 取文本(event?.类型),
            事件说明: 取文本(event?.事件说明),
            计划执行时间: 取文本(event?.计划执行时间),
            最早执行时间: 取文本(event?.最早执行时间),
            最晚执行时间: 取文本(event?.最晚执行时间),
            前置条件: 取数组(event?.前置条件),
            触发条件: 取数组(event?.触发条件),
            阻断条件: 取数组(event?.阻断条件),
            执行后影响: 取数组(event?.执行后影响),
            错过后影响: 取数组(event?.错过后影响),
            关联人物: 取数组(event?.关联人物),
            关联势力: 取数组(event?.关联势力),
            关联地点: 取数组(event?.关联地点),
            关联分解组: 取数组(event?.关联分解组),
            关联分歧线: 取数组(event?.关联分歧线),
            当前状态: 取文本(event?.当前状态)
        })),
        进行中事件: 取数组(world?.进行中事件).map((event: any, idx: number) => ({
            索引: idx,
            事件名: 取文本(event?.事件名),
            类型: 取文本(event?.类型),
            事件说明: 取文本(event?.事件说明),
            开始时间: 取文本(event?.开始时间),
            预计结束时间: 取文本(event?.预计结束时间),
            当前进展: 取文本(event?.当前进展),
            已产生影响: 取数组(event?.已产生影响),
            关联人物: 取数组(event?.关联人物),
            关联势力: 取数组(event?.关联势力),
            关联地点: 取数组(event?.关联地点),
            关联分解组: 取数组(event?.关联分解组),
            关联分歧线: 取数组(event?.关联分歧线)
        })),
        已结算事件: 取数组(world?.已结算事件).map((event: any, idx: number) => ({
            索引: idx,
            事件名: 取文本(event?.事件名),
            类型: 取文本(event?.类型),
            事件说明: 取文本(event?.事件说明),
            结算时间: 取文本(event?.结算时间),
            事件结果: 取数组(event?.事件结果),
            长期影响: 取数组(event?.长期影响),
            是否进入史册: typeof event?.是否进入史册 === 'boolean' ? event.是否进入史册 : false,
            关联人物: 取数组(event?.关联人物),
            关联势力: 取数组(event?.关联势力),
            关联地点: 取数组(event?.关联地点),
            关联分解组: 取数组(event?.关联分解组),
            关联分歧线: 取数组(event?.关联分歧线)
        })),
        世界镜头规划: 取数组(world?.世界镜头规划).map((item: any, idx: number) => ({
            索引: idx,
            镜头标题: 取文本(item?.镜头标题),
            镜头内容: 取文本(item?.镜头内容),
            触发时间: 取文本(item?.触发时间),
            触发条件: 取数组(item?.触发条件),
            关联人物: 取数组(item?.关联人物),
            关联地点: 取数组(item?.关联地点),
            关联分解组: 取数组(item?.关联分解组),
            关联分歧线: 取数组(item?.关联分歧线),
            沉淀内容: 取数组(item?.沉淀内容),
            当前状态: 取文本(item?.当前状态)
        })),
        江湖史册: 取数组(world?.江湖史册).map((event: any, idx: number) => ({
            索引: idx,
            标题: 取文本(event?.标题),
            归档时间: 取文本(event?.归档时间),
            归档内容: 取数组(event?.归档内容),
            长期影响: 取数组(event?.长期影响),
            关联人物: 取数组(event?.关联人物),
            关联势力: 取数组(event?.关联势力),
            关联地点: 取数组(event?.关联地点),
            关联分歧线: 取数组(event?.关联分歧线)
        }))
    };
    const normalizedGameConfig = 规范化游戏设置(gameConfig);

    return 包装树状上下文('世界', 裁剪修炼体系上下文数据(orderedWorld, normalizedGameConfig));
};

export const 构建战斗状态文本 = (payload: any): string => {
    const battle = 规范化战斗状态(payload?.战斗);
    const 取文本 = (value: any) => (typeof value === 'string' ? value : '');
    const 取数组 = (value: any) => (Array.isArray(value) ? value : []);
    const 取数值 = (value: any, fallback: number = 0) => (
        typeof value === 'number' && Number.isFinite(value) ? value : fallback
    );
    const enemyRawList = Array.isArray(battle?.敌方) ? battle.敌方 : [];
    const orderedEnemy = enemyRawList.map((enemyRaw: any, index: number) => ({
        索引: index,
        名字: 取文本(enemyRaw?.名字),
        境界: 取文本(enemyRaw?.境界),
        简介: 取文本(enemyRaw?.简介),
        技能: 取数组(enemyRaw?.技能),
        战斗力: 取数值(enemyRaw?.战斗力),
        防御力: 取数值(enemyRaw?.防御力),
        当前血量: 取数值(enemyRaw?.当前血量),
        最大血量: 取数值(enemyRaw?.最大血量),
        当前精力: 取数值(enemyRaw?.当前精力),
        最大精力: 取数值(enemyRaw?.最大精力)
    }));
    const orderedBattle = {
        是否战斗中: battle?.是否战斗中 === true,
        敌方: orderedEnemy
    };
    return 包装树状上下文('战斗', orderedBattle);
};

export const 构建门派状态文本 = (payload: any, gameConfig: any): string => {
    const sect = payload?.玩家门派 && typeof payload.玩家门派 === 'object' ? payload.玩家门派 : {};
    const 取文本 = (value: any) => (typeof value === 'string' ? value : '');
    const 取数组 = (value: any) => (Array.isArray(value) ? value : []);
    const 取数值 = (value: any, fallback: number = 0) => (
        typeof value === 'number' && Number.isFinite(value) ? value : fallback
    );
    const 任务列表 = 取数组(sect?.任务列表).map((task: any) => ({
        id: 取文本(task?.id),
        标题: 取文本(task?.标题),
        描述: 取文本(task?.描述),
        类型: 取文本(task?.类型),
        难度: 取数值(task?.难度),
        发布日期: 取文本(task?.发布日期),
        截止日期: 取文本(task?.截止日期),
        刷新日期: 取文本(task?.刷新日期),
        奖励贡献: 取数值(task?.奖励贡献),
        奖励资金: 取数值(task?.奖励资金),
        奖励物品: 取数组(task?.奖励物品),
        当前状态: 取文本(task?.当前状态)
    }));
    const 兑换列表 = 取数组(sect?.兑换列表).map((item: any) => ({
        id: 取文本(item?.id),
        物品名称: 取文本(item?.物品名称),
        类型: 取文本(item?.类型),
        兑换价格: 取数值(item?.兑换价格),
        库存: 取数值(item?.库存),
        要求职位: 取文本(item?.要求职位)
    }));
    const 重要成员 = 取数组(sect?.重要成员).map((member: any) => ({
        id: 取文本(member?.id),
        姓名: 取文本(member?.姓名),
        性别: 取文本(member?.性别),
        年龄: 取数值(member?.年龄),
        境界: 取文本(member?.境界),
        身份: 取文本(member?.身份),
        简介: 取文本(member?.简介)
    }));
    const orderedSect = {
        ID: 取文本(sect?.ID),
        名称: 取文本(sect?.名称),
        简介: 取文本(sect?.简介),
        门规: 取数组(sect?.门规),
        门派资金: 取数值(sect?.门派资金),
        门派物资: 取数值(sect?.门派物资),
        建设度: 取数值(sect?.建设度),
        玩家职位: 取文本(sect?.玩家职位),
        玩家贡献: 取数值(sect?.玩家贡献),
        任务列表,
        兑换列表,
        重要成员
    };
    const normalizedGameConfig = 规范化游戏设置(gameConfig);

    return 包装树状上下文('玩家门派', 裁剪修炼体系上下文数据(orderedSect, normalizedGameConfig));
};

export const 构建任务列表文本 = (payload: any, gameConfig: any): string => {
    const tasks = Array.isArray(payload?.任务列表) ? payload.任务列表 : [];
    const 取文本 = (value: any) => (typeof value === 'string' ? value : '');
    const 取数组 = (value: any) => (Array.isArray(value) ? value : []);
    const 取数值 = (value: any, fallback: number = 0) => (
        typeof value === 'number' && Number.isFinite(value) ? value : fallback
    );
    const 取布尔 = (value: any) => (typeof value === 'boolean' ? value : false);
    const orderedTasks = tasks.map((task: any) => ({
        标题: 取文本(task?.标题),
        描述: 取文本(task?.描述),
        类型: 取文本(task?.类型),
        发布人: 取文本(task?.发布人),
        发布地点: 取文本(task?.发布地点),
        推荐境界: 取文本(task?.推荐境界),
        截止时间: 取文本(task?.截止时间),
        当前状态: 取文本(task?.当前状态),
        目标列表: 取数组(task?.目标列表).map((goal: any) => ({
            描述: 取文本(goal?.描述),
            当前进度: 取数值(goal?.当前进度),
            总需进度: 取数值(goal?.总需进度),
            完成状态: 取布尔(goal?.完成状态)
        })),
        奖励描述: 取数组(task?.奖励描述),
        剧情暗线: 取文本(task?.剧情暗线)
    }));
    const normalizedGameConfig = 规范化游戏设置(gameConfig);

    return 包装树状上下文('任务列表', 裁剪修炼体系上下文数据(orderedTasks, normalizedGameConfig));
};

export const 构建约定列表文本 = (payload: any): string => {
    const agreements = Array.isArray(payload?.约定列表) ? payload.约定列表 : [];
    const 取文本 = (value: any) => (typeof value === 'string' ? value : '');
    const 取数值 = (value: any, fallback: number = 0) => (
        typeof value === 'number' && Number.isFinite(value) ? value : fallback
    );
    const orderedAgreements = agreements.map((item: any) => ({
        对象: 取文本(item?.对象),
        头衔: 取文本(item?.头衔),
        性质: 取文本(item?.性质),
        标题: 取文本(item?.标题),
        誓言内容: 取文本(item?.誓言内容),
        约定地点: 取文本(item?.约定地点),
        约定时间: 取文本(item?.约定时间),
        有效时段: 取数值(item?.有效时段),
        当前状态: 取文本(item?.当前状态),
        履行后果: 取文本(item?.履行后果),
        违约后果: 取文本(item?.违约后果),
        背景故事: 取文本(item?.背景故事)
    }));
    return 包装树状上下文('约定列表', orderedAgreements);
};

const 归一化文本 = (value: any) => (
    typeof value === 'string'
        ? value.trim().replace(/\s+/g, '').toLowerCase()
        : ''
);

export const 构建地图建筑状态文本 = (payload: any): string => {
    const source = payload || {};
    const env = 规范化环境信息(source?.环境);
    const world = 规范化世界状态(source?.世界);

    const 当前具体地点 = typeof env?.具体地点 === 'string' ? env.具体地点.trim() : '';
    const 地图列表 = Array.isArray(world.地图) ? world.地图 : [];
    const 建筑列表 = Array.isArray(world.建筑) ? world.建筑 : [];

    const 地图文本 = 地图列表.length > 0
        ? 地图列表.map((mapItem: any) => {
            const name = typeof mapItem?.名称 === 'string' ? mapItem.名称.trim() : '未命名地图';
            const coord = typeof mapItem?.坐标 === 'string' ? mapItem.坐标.trim() : '未知坐标';
            const desc = typeof mapItem?.描述 === 'string' ? mapItem.描述.trim() : '无描述';
            const ownership = mapItem?.归属 && typeof mapItem.归属 === 'object'
                ? [
                    mapItem.归属?.大地点 || '未知大地点',
                    mapItem.归属?.中地点 || '未知中地点',
                    mapItem.归属?.小地点 || '未知小地点'
                ].join(' > ')
                : '未知归属';
            const interiors = Array.isArray(mapItem?.内部建筑)
                ? mapItem.内部建筑.filter((n: any) => typeof n === 'string' && n.trim().length > 0).join('、')
                : '';
            return `- 名称: ${name} | 坐标: ${coord} | 归属: ${ownership}\n  描述: ${desc}\n  内部建筑: ${interiors || '无'}`;
        }).join('\n')
        : '- 暂无地图数据';

    const 当前地点归一 = 归一化文本(当前具体地点);
    const 命中建筑 = 建筑列表.filter((building: any) => {
        const 名称归一 = 归一化文本(building?.名称);
        if (!当前地点归一 || !名称归一) return false;
        return 当前地点归一 === 名称归一
            || 当前地点归一.startsWith(名称归一)
            || 当前地点归一.includes(名称归一);
    });

    const 建筑文本 = 命中建筑.length > 0
        ? 命中建筑.map((building: any) => {
            const name = typeof building?.名称 === 'string' ? building.名称.trim() : '未命名建筑';
            const desc = typeof building?.描述 === 'string' ? building.描述.trim() : '无描述';
            const ownership = building?.归属 && typeof building.归属 === 'object'
                ? [
                    building.归属?.大地点 || '未知大地点',
                    building.归属?.中地点 || '未知中地点',
                    building.归属?.小地点 || '未知小地点'
                ].join(' > ')
                : '未知归属';
            return `- 名称: ${name} | 归属: ${ownership}\n  描述: ${desc}`;
        }).join('\n')
        : `- 当前具体地点「${当前具体地点 || '未知'}」未命中建筑变量数据（仅注入地图摘要）`;

    return [
        '【地图与建筑】',
        `当前具体地点: ${当前具体地点 || '未知'}`,
        '地图列表:',
        地图文本,
        '',
        '当前地点建筑数据（仅在具体地点命中对应建筑时注入）:',
        建筑文本
    ].join('\n');
};
