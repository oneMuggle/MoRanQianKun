import { 规范化剧情状态, 规范化剧情规划状态, 规范化女主剧情规划状态, 规范化同人剧情规划状态, 规范化同人女主剧情规划状态 } from '../storyState';
import { 包装树状上下文 } from './coreBlocks';

export const 构建剧情安排 = (payload: any): string => {
    const normalizedStory = 规范化剧情状态(payload?.剧情);
    const fandomEnabled = payload?.开局配置?.同人融合?.enabled === true && payload?.开局配置?.同人融合?.启用附加小说 === true;
    const normalizedStoryPlan = fandomEnabled
        ? 规范化同人剧情规划状态(payload?.同人剧情规划)
        : 规范化剧情规划状态(payload?.剧情规划);
    const chapter = normalizedStory?.当前章节;

    const orderedStory = {
        当前章节: {
            标题: chapter?.标题 ?? '',
            当前分解组: chapter?.当前分解组 ?? 1,
            原著章节标题: chapter?.原著章节标题 ?? '',
            原著推进状态: chapter?.原著推进状态 ?? '未开始',
            原著换章条件: Array.isArray(chapter?.原著换章条件) ? chapter.原著换章条件 : [],
            原著切换说明: Array.isArray(chapter?.原著切换说明) ? chapter.原著切换说明 : [],
            已完成摘要: Array.isArray(chapter?.已完成摘要) ? chapter.已完成摘要 : [],
            当前待解问题: Array.isArray(chapter?.当前待解问题) ? chapter.当前待解问题 : [],
            切章后沉淀要点: Array.isArray(chapter?.切章后沉淀要点) ? chapter.切章后沉淀要点 : []
        },
        下一章预告: {
            标题: normalizedStory?.下一章预告?.标题 ?? '',
            大纲: Array.isArray(normalizedStory?.下一章预告?.大纲) ? normalizedStory.下一章预告.大纲 : [],
            进入条件: Array.isArray(normalizedStory?.下一章预告?.进入条件) ? normalizedStory.下一章预告.进入条件 : [],
            风险提示: Array.isArray(normalizedStory?.下一章预告?.风险提示) ? normalizedStory.下一章预告.风险提示 : []
        },
        历史卷宗: Array.isArray(normalizedStory?.历史卷宗)
            ? normalizedStory.历史卷宗.map((item: any, idx: number) => ({
                索引: idx,
                标题: item?.标题 ?? '',
                所属章节范围: item?.所属章节范围 ?? '',
                所属分解组: item?.所属分解组 ?? 1,
                章节总结: Array.isArray(item?.章节总结) ? item.章节总结 : [],
                延续事项: Array.isArray(item?.延续事项) ? item.延续事项 : [],
                分歧线变化: Array.isArray(item?.分歧线变化) ? item.分歧线变化 : [],
                记录时间: item?.记录时间 ?? ''
            }))
            : [],
        当前规划: normalizedStoryPlan
            ? (
                fandomEnabled
                    ? {
                        当前对齐信息: (normalizedStoryPlan as any).当前对齐信息 ?? {},
                        当前章目标: Array.isArray((normalizedStoryPlan as any).当前章目标) ? (normalizedStoryPlan as any).当前章目标 : [],
                        当前章任务: Array.isArray((normalizedStoryPlan as any).当前章任务) ? (normalizedStoryPlan as any).当前章任务.map((item: any, idx: number) => ({
                            索引: idx,
                            标题: item?.标题 ?? '',
                            任务说明: item?.任务说明 ?? '',
                            关联分解组: Array.isArray(item?.关联分解组) ? item.关联分解组 : [],
                            关联原著事件: Array.isArray(item?.关联原著事件) ? item.关联原著事件 : [],
                            保持不变的原著基线: Array.isArray(item?.保持不变的原著基线) ? item.保持不变的原著基线 : [],
                            当前偏转点: Array.isArray(item?.当前偏转点) ? item.当前偏转点 : [],
                            计划执行时间: item?.计划执行时间 ?? '',
                            最早执行时间: item?.最早执行时间 ?? '',
                            最晚执行时间: item?.最晚执行时间 ?? '',
                            前置条件: Array.isArray(item?.前置条件) ? item.前置条件 : [],
                            触发条件: Array.isArray(item?.触发条件) ? item.触发条件 : [],
                            阻断条件: Array.isArray(item?.阻断条件) ? item.阻断条件 : [],
                            执行动作: Array.isArray(item?.执行动作) ? item.执行动作 : [],
                            完成判定: Array.isArray(item?.完成判定) ? item.完成判定 : [],
                            偏转后果: Array.isArray(item?.偏转后果) ? item.偏转后果 : [],
                            未偏转后果: Array.isArray(item?.未偏转后果) ? item.未偏转后果 : [],
                            完成后沉淀: Array.isArray(item?.完成后沉淀) ? item.完成后沉淀 : [],
                            当前状态: item?.当前状态 ?? ''
                        })) : [],
                        分歧线: Array.isArray((normalizedStoryPlan as any).分歧线) ? (normalizedStoryPlan as any).分歧线.map((item: any, idx: number) => ({
                            索引: idx,
                            分歧线名: item?.分歧线名 ?? '',
                            起点事件: item?.起点事件 ?? '',
                            关联分解组: Array.isArray(item?.关联分解组) ? item.关联分解组 : [],
                            偏转原因: Array.isArray(item?.偏转原因) ? item.偏转原因 : [],
                            与原著不同之处: Array.isArray(item?.与原著不同之处) ? item.与原著不同之处 : [],
                            当前阶段: item?.当前阶段 ?? '',
                            影响范围: Array.isArray(item?.影响范围) ? item.影响范围 : [],
                            下一步扩大条件: Array.isArray(item?.下一步扩大条件) ? item.下一步扩大条件 : [],
                            回收条件: Array.isArray(item?.回收条件) ? item.回收条件 : [],
                            当前状态: item?.当前状态 ?? ''
                        })) : [],
                        待触发事件: Array.isArray((normalizedStoryPlan as any).待触发事件) ? (normalizedStoryPlan as any).待触发事件.map((item: any, idx: number) => ({
                            索引: idx,
                            事件名: item?.事件名 ?? '',
                            事件说明: item?.事件说明 ?? '',
                            关联分解组: Array.isArray(item?.关联分解组) ? item.关联分解组 : [],
                            关联原著事件: Array.isArray(item?.关联原著事件) ? item.关联原著事件 : [],
                            计划触发时间: item?.计划触发时间 ?? '',
                            最早触发时间: item?.最早触发时间 ?? '',
                            最晚触发时间: item?.最晚触发时间 ?? '',
                            前置条件: Array.isArray(item?.前置条件) ? item.前置条件 : [],
                            触发条件: Array.isArray(item?.触发条件) ? item.触发条件 : [],
                            阻断条件: Array.isArray(item?.阻断条件) ? item.阻断条件 : [],
                            触发后影响: Array.isArray(item?.触发后影响) ? item.触发后影响 : [],
                            错过后影响: Array.isArray(item?.错过后影响) ? item.错过后影响 : [],
                            若偏转则转入哪条分歧线: Array.isArray(item?.若偏转则转入哪条分歧线) ? item.若偏转则转入哪条分歧线 : [],
                            当前状态: item?.当前状态 ?? ''
                        })) : [],
                        镜头规划: Array.isArray((normalizedStoryPlan as any).镜头规划) ? (normalizedStoryPlan as any).镜头规划.map((item: any, idx: number) => ({
                            索引: idx,
                            镜头标题: item?.镜头标题 ?? '',
                            关联分解组: Array.isArray(item?.关联分解组) ? item.关联分解组 : [],
                            镜头内容: item?.镜头内容 ?? '',
                            触发时间: item?.触发时间 ?? '',
                            触发条件: Array.isArray(item?.触发条件) ? item.触发条件 : [],
                            关联人物: Array.isArray(item?.关联人物) ? item.关联人物 : [],
                            关联地点: Array.isArray(item?.关联地点) ? item.关联地点 : [],
                            关联分歧线: Array.isArray(item?.关联分歧线) ? item.关联分歧线 : [],
                            作用: Array.isArray(item?.作用) ? item.作用 : [],
                            当前状态: item?.当前状态 ?? ''
                        })) : [],
                        换组规则: (normalizedStoryPlan as any).换组规则 ?? {}
                    }
                    : {
                        当前章目标: Array.isArray((normalizedStoryPlan as any).当前章目标) ? (normalizedStoryPlan as any).当前章目标 : [],
                        当前章任务: Array.isArray((normalizedStoryPlan as any).当前章任务) ? (normalizedStoryPlan as any).当前章任务.map((item: any, idx: number) => ({
                            索引: idx,
                            标题: item?.标题 ?? '',
                            任务说明: item?.任务说明 ?? '',
                            计划执行时间: item?.计划执行时间 ?? '',
                            前置条件: Array.isArray(item?.前置条件) ? item.前置条件 : [],
                            触发条件: Array.isArray(item?.触发条件) ? item.触发条件 : [],
                            当前状态: item?.当前状态 ?? ''
                        })) : [],
                        跨章延续事项: Array.isArray((normalizedStoryPlan as any).跨章延续事项) ? (normalizedStoryPlan as any).跨章延续事项.map((item: any, idx: number) => ({
                            索引: idx,
                            标题: item?.标题 ?? '',
                            当前状态: Array.isArray(item?.当前状态) ? item.当前状态 : [],
                            延续到何时: item?.延续到何时 ?? '',
                            后续接续条件: Array.isArray(item?.后续接续条件) ? item.后续接续条件 : []
                        })) : [],
                        待触发事件: Array.isArray((normalizedStoryPlan as any).待触发事件) ? (normalizedStoryPlan as any).待触发事件.map((item: any, idx: number) => ({
                            索引: idx,
                            事件名: item?.事件名 ?? '',
                            事件说明: item?.事件说明 ?? '',
                            计划触发时间: item?.计划触发时间 ?? '',
                            前置条件: Array.isArray(item?.前置条件) ? item.前置条件 : [],
                            触发条件: Array.isArray(item?.触发条件) ? item.触发条件 : [],
                            当前状态: item?.当前状态 ?? ''
                        })) : [],
                        镜头规划: Array.isArray((normalizedStoryPlan as any).镜头规划) ? (normalizedStoryPlan as any).镜头规划.map((item: any, idx: number) => ({
                            索引: idx,
                            镜头标题: item?.镜头标题 ?? '',
                            镜头内容: item?.镜头内容 ?? '',
                            触发时间: item?.触发时间 ?? '',
                            关联任务: Array.isArray(item?.关联任务) ? item.关联任务 : [],
                            当前状态: item?.当前状态 ?? ''
                        })) : [],
                        换章规则: (normalizedStoryPlan as any).换章规则 ?? {}
                    }
            )
            : {}
    };

    return 包装树状上下文('剧情安排', orderedStory);
};

export const 构建女主剧情规划文本 = (payload: any): string => {
    const fandomEnabled = payload?.开局配置?.同人融合?.enabled === true && payload?.开局配置?.同人融合?.启用附加小说 === true;
    const normalizedPlan = fandomEnabled
        ? 规范化同人女主剧情规划状态(payload?.同人女主剧情规划)
        : 规范化女主剧情规划状态(payload?.女主剧情规划);
    if (!normalizedPlan) {
        return '【女主剧情规划】\n无';
    }
    const orderedPlan = fandomEnabled
        ? {
            阶段推进: Array.isArray((normalizedPlan as any).阶段推进) ? (normalizedPlan as any).阶段推进.map((item: any, idx: number) => ({
                索引: idx,
                阶段名: item?.阶段名 ?? '',
                关联分解组: Array.isArray(item?.关联分解组) ? item.关联分解组 : [],
                主推女主: Array.isArray(item?.主推女主) ? item.主推女主 : [],
                次推女主: Array.isArray(item?.次推女主) ? item.次推女主 : [],
                关联分歧线: Array.isArray(item?.关联分歧线) ? item.关联分歧线 : [],
                阶段目标: Array.isArray(item?.阶段目标) ? item.阶段目标 : [],
                禁止越级对象: Array.isArray(item?.禁止越级对象) ? item.禁止越级对象 : [],
                完成判定: Array.isArray(item?.完成判定) ? item.完成判定 : [],
                切换条件: Array.isArray(item?.切换条件) ? item.切换条件 : []
            })) : [],
            女主条目: Array.isArray((normalizedPlan as any).女主条目) ? (normalizedPlan as any).女主条目.map((item: any, idx: number) => ({
                索引: idx,
                女主姓名: item?.女主姓名 ?? '',
                类型: item?.类型 ?? '',
                关联分解组: Array.isArray(item?.关联分解组) ? item.关联分解组 : [],
                关联原著关系线: Array.isArray(item?.关联原著关系线) ? item.关联原著关系线 : [],
                保持不变的原著基线: Array.isArray(item?.保持不变的原著基线) ? item.保持不变的原著基线 : [],
                当前偏转点: Array.isArray(item?.当前偏转点) ? item.当前偏转点 : [],
                所属分歧线: Array.isArray(item?.所属分歧线) ? item.所属分歧线 : [],
                当前关系状态: item?.当前关系状态 ?? '',
                当前阶段: item?.当前阶段 ?? '',
                已成立事实: Array.isArray(item?.已成立事实) ? item.已成立事实 : [],
                阶段目标: Array.isArray(item?.阶段目标) ? item.阶段目标 : [],
                推进方式: Array.isArray(item?.推进方式) ? item.推进方式 : [],
                阻断因素: Array.isArray(item?.阻断因素) ? item.阻断因素 : [],
                允许突破条件: Array.isArray(item?.允许突破条件) ? item.允许突破条件 : [],
                失败后回退: Array.isArray(item?.失败后回退) ? item.失败后回退 : []
            })) : [],
            女主互动事件: Array.isArray((normalizedPlan as any).女主互动事件) ? (normalizedPlan as any).女主互动事件.map((item: any, idx: number) => ({
                索引: idx,
                女主姓名: item?.女主姓名 ?? '',
                事件名: item?.事件名 ?? '',
                事件说明: item?.事件说明 ?? '',
                关联分解组: Array.isArray(item?.关联分解组) ? item.关联分解组 : [],
                关联原著事件: Array.isArray(item?.关联原著事件) ? item.关联原著事件 : [],
                关联分歧线: Array.isArray(item?.关联分歧线) ? item.关联分歧线 : [],
                计划触发时间: item?.计划触发时间 ?? '',
                最早触发时间: item?.最早触发时间 ?? '',
                最晚触发时间: item?.最晚触发时间 ?? '',
                前置条件: Array.isArray(item?.前置条件) ? item.前置条件 : [],
                触发条件: Array.isArray(item?.触发条件) ? item.触发条件 : [],
                阻断条件: Array.isArray(item?.阻断条件) ? item.阻断条件 : [],
                成功结果: Array.isArray(item?.成功结果) ? item.成功结果 : [],
                失败结果: Array.isArray(item?.失败结果) ? item.失败结果 : [],
                与主剧情联动: Array.isArray(item?.与主剧情联动) ? item.与主剧情联动 : [],
                当前状态: item?.当前状态 ?? ''
            })) : [],
            女主镜头规划: Array.isArray((normalizedPlan as any).女主镜头规划) ? (normalizedPlan as any).女主镜头规划.map((item: any, idx: number) => ({
                索引: idx,
                女主姓名: item?.女主姓名 ?? '',
                关联分解组: Array.isArray(item?.关联分解组) ? item.关联分解组 : [],
                镜头标题: item?.镜头标题 ?? '',
                镜头内容: item?.镜头内容 ?? '',
                触发时间: item?.触发时间 ?? '',
                触发条件: Array.isArray(item?.触发条件) ? item.触发条件 : [],
                关联事件: Array.isArray(item?.关联事件) ? item.关联事件 : [],
                关联分歧线: Array.isArray(item?.关联分歧线) ? item.关联分歧线 : [],
                沉淀内容: Array.isArray(item?.沉淀内容) ? item.沉淀内容 : [],
                当前状态: item?.当前状态 ?? ''
            })) : []
        }
        : {
            阶段推进: Array.isArray((normalizedPlan as any).阶段推进) ? (normalizedPlan as any).阶段推进.map((item: any, idx: number) => ({
                索引: idx,
                阶段名: item?.阶段名 ?? '',
                主推女主: Array.isArray(item?.主推女主) ? item.主推女主 : [],
                次推女主: Array.isArray(item?.次推女主) ? item.次推女主 : [],
                阶段目标: Array.isArray(item?.阶段目标) ? item.阶段目标 : [],
                禁止越级对象: Array.isArray(item?.禁止越级对象) ? item.禁止越级对象 : [],
                关联剧情任务: Array.isArray(item?.关联剧情任务) ? item.关联剧情任务 : [],
                阶段完成判定: Array.isArray(item?.阶段完成判定) ? item.阶段完成判定 : [],
                切换条件: Array.isArray(item?.切换条件) ? item.切换条件 : []
            })) : [],
            女主条目: Array.isArray((normalizedPlan as any).女主条目) ? (normalizedPlan as any).女主条目.map((item: any, idx: number) => ({
                索引: idx,
                女主姓名: item?.女主姓名 ?? '',
                类型: item?.类型 ?? '',
                当前关系状态: item?.当前关系状态 ?? '',
                当前阶段: item?.当前阶段 ?? '',
                已成立事实: Array.isArray(item?.已成立事实) ? item.已成立事实 : [],
                阶段目标: Array.isArray(item?.阶段目标) ? item.阶段目标 : [],
                推进方式: Array.isArray(item?.推进方式) ? item.推进方式 : [],
                阻断因素: Array.isArray(item?.阻断因素) ? item.阻断因素 : [],
                允许突破条件: Array.isArray(item?.允许突破条件) ? item.允许突破条件 : [],
                失败后回退: Array.isArray(item?.失败后回退) ? item.失败后回退 : []
            })) : [],
            女主互动事件: Array.isArray((normalizedPlan as any).女主互动事件) ? (normalizedPlan as any).女主互动事件.map((item: any, idx: number) => ({
                索引: idx,
                女主姓名: item?.女主姓名 ?? '',
                事件名: item?.事件名 ?? '',
                事件说明: item?.事件说明 ?? '',
                计划触发时间: item?.计划触发时间 ?? '',
                最早触发时间: item?.最早触发时间 ?? '',
                最晚触发时间: item?.最晚触发时间 ?? '',
                前置条件: Array.isArray(item?.前置条件) ? item.前置条件 : [],
                触发条件: Array.isArray(item?.触发条件) ? item.触发条件 : [],
                阻断条件: Array.isArray(item?.阻断条件) ? item.阻断条件 : [],
                成功结果: Array.isArray(item?.成功结果) ? item.成功结果 : [],
                失败结果: Array.isArray(item?.失败结果) ? item.失败结果 : [],
                关联剧情任务: Array.isArray(item?.关联剧情任务) ? item.关联剧情任务 : [],
                当前状态: item?.当前状态 ?? ''
            })) : [],
            女主镜头规划: Array.isArray((normalizedPlan as any).女主镜头规划) ? (normalizedPlan as any).女主镜头规划.map((item: any, idx: number) => ({
                索引: idx,
                女主姓名: item?.女主姓名 ?? '',
                镜头标题: item?.镜头标题 ?? '',
                镜头内容: item?.镜头内容 ?? '',
                触发时间: item?.触发时间 ?? '',
                触发条件: Array.isArray(item?.触发条件) ? item.触发条件 : [],
                关联事件: Array.isArray(item?.关联事件) ? item.关联事件 : [],
                关联剧情任务: Array.isArray(item?.关联剧情任务) ? item.关联剧情任务 : [],
                沉淀内容: Array.isArray(item?.沉淀内容) ? item.沉淀内容 : [],
                当前状态: item?.当前状态 ?? ''
            })) : []
        };

    return 包装树状上下文('女主剧情规划', orderedPlan);
};
