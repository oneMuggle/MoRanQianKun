// hooks/useGame/index.ts — 统一导出入口
// 所有模块通过 from './useGame' 导入，而非深路径 from './useGame/xxx'

// 核心工作流
export { 执行主剧情发送工作流 } from './sendWorkflow';

// 系统提示词
export { 构建系统提示词 } from './systemPromptBuilder';
export type { 运行时提示词状态 } from './systemPromptBuilder';

// 状态与规范化
export {
    创建开场基础状态,
    创建开场命令基态,
    构建前端清空开场状态,
    创建开场空白剧情,
    创建开场空白环境,
    创建开场空白世界,
    创建开场空白战斗,
    创建空剧情规划,
    创建空门派状态,
    创建空记忆系统,
    规范化世界状态,
    规范化战斗状态,
    规范化门派状态,
    规范化剧情状态,
    规范化剧情规划状态,
    规范化女主剧情规划状态,
    规范化同人剧情规划状态,
    规范化同人女主剧情规划状态,
    战斗结束自动清空,
    按回合窗口裁剪历史,
} from './storyState';
export type { 开场命令基态 } from './storyState';
export {
    规范化环境信息,
    构建完整地点文本,
    规范化角色物品容器映射,
    规范化社交列表,
} from './stateTransforms';

// 记忆系统
export {
    规范化记忆系统,
    规范化记忆配置,
    构建即时记忆条目,
    构建短期记忆条目,
    写入四段记忆,
    构建待处理记忆压缩任务,
    构建手动记忆压缩任务,
    应用记忆压缩结果,
} from './memory/memoryUtils';
export type { 记忆压缩任务结构 } from './memory/memoryUtils';

// NPC
export {
    提取NPC生图基础数据,
    提取NPC香闺秘档部位生图数据,
    提取主角生图基础数据,
} from './npc/npcContext';

// 响应处理
export { 执行响应命令处理 } from './npc/responseCommandProcessor';
export { 按世界演变分流净化响应 } from './response/storyResponseGuards';

// 会话生命周期
export { 创建会话生命周期工作流 } from './sessionLifecycleWorkflow';

// 上下文快照
export { 构建上下文快照数据 } from './ui/contextSnapshot';

// 润色
export { 执行正文润色 } from './opening/bodyPolish';

// 世界演变
export { 执行世界演变更新工作流 } from './world/worldEvolutionWorkflow';
export { useWorldEvolutionControl } from './world/worldEvolutionControl';

// 图片预设
export { 创建图片预设工作流, 提取NPC生图基础数据附带私密描述 } from './image/imagePresetWorkflow';

// 设置持久化
export { 创建设置持久化工作流 } from './config/settingsPersistenceWorkflow';

// 历史回合
export { 创建历史回合工作流 } from './time/historyTurnWorkflow';

// 存读档
export { 创建存读档工作流 } from './saveLoad/saveLoadWorkflow';

// 规划更新
export { 创建规划更新工作流 } from './planning/planningUpdateWorkflow';

// NPC 图片状态
export { 创建NPC图片状态工作流, 合并NPC图片档案, 生成NPC生图记录ID } from './image/npcImageStateWorkflow';

// 场景图片档案
export { 创建场景图片档案工作流, 按场景图上限裁剪档案, 生成场景生图记录ID, 规范化场景图片档案 } from './image/sceneImageArchiveWorkflow';

// 场景生图触发
export { 创建场景生图触发工作流 } from './image/sceneImageTriggerWorkflow';

// 手动图片动作
export { 创建手动图片动作工作流 } from './image/manualImageActionsWorkflow';

// 手动 NPC
export { 创建手动NPC工作流 } from './npc/manualNpcWorkflow';

// 主角图片
export { 创建主角图片工作流 } from './image/playerImageWorkflow';

// 运行时变量
export { 创建运行时变量工作流 } from './runtimeVariableWorkflow';

// 变量校准
export { 创建变量校准协调器 } from './planning/variableCalibrationCoordinator';
export { 执行变量自动校准 } from './planning/variableCalibration';
export { 合并变量校准结果到响应 } from './planning/variableCalibrationMerge';
export { 执行变量模型校准工作流 } from './planning/variableModelWorkflow';
export { 创建变量生成进度系统 } from './planning/variableGenerationProgress';

// 时间工具
export { normalizeCanonicalGameTime, 环境时间转标准串, 提取环境月日 } from './time/timeUtils';

// 运行时提示词
export { 构建COT伪装提示词, 规范化比较文本, 酒馆预设模式可用 } from './promptRuntime';

// 通知系统
export { 创建通知系统 } from './ui/notificationSystem';
export type { 右下角提示结构 } from './ui/notificationSystem';

// 记忆总结
export { 创建记忆总结处理器 } from './memory/memorySummaryHandlers';
export type { NPC记忆总结任务结构, 记忆总结阶段类型 } from './memory/memorySummaryHandlers';

// NPC 记忆总结
export { 应用NPC记忆总结, 构建手动NPC记忆总结候选, 构建自动NPC记忆总结候选, 构建NPC记忆总结回退文案 } from './memory/npcMemorySummary';

// 回档快照
export { 创建回档快照系统 } from './ui/rollbackSnapshot';
export type { 回合快照结构 } from './ui/rollbackSnapshot';

// 错误格式化
export { 提取原始报错详情, 格式化错误详情, 提取解析失败原始信息 } from './quality/errorFormatting';

// 文本辅助
export {
    获取原始AI消息,
    计算回复耗时秒,
    估算消息Token,
    估算AI输出Token,
    游戏时间转排序值,
    提取文本中的游戏时间列表,
    当前时间已达到,
} from './response/responseTextHelpers';

// 自动重试
export {
    自动重试最大次数,
    替换流式草稿为失败提示,
    更新流式草稿为自动重试提示,
    游戏设置启用自动重试,
    提取自动重试原因,
    是否可自动重试错误,
    执行带自动重试的生成请求,
} from './quality/autoRetry';

// 规划原因收集
export {
    去重文本数组,
    收集剧情规划时间触发原因,
    收集女主规划时间触发原因,
    收集剧情正文命中原因,
    收集女主正文命中原因,
    过滤规划补丁命令,
} from './planning/planningReasonCollector';

// 后台图片监控
export { useBackgroundImageMonitor } from './quality/backgroundImageMonitor';

// 设备消息
export { 触发设备消息生成 } from './device/triggerDeviceMessageWorkflow';

// 设备刷新监控
export { useDeviceRefreshMonitor } from './device/deviceRefreshMonitor';
export type { 设备刷新任务 } from './device/deviceRefreshMonitor';

// BDSM 工作流
export { 构建见面场景提示词, 解析见面结果, 生成任务摘要 } from './bdsmMeetingWorkflow';
export type { 见面场景上下文, 日常指令 } from './bdsmMeetingWorkflow';
export { 生成调教任务, 生成日常指令, 评价任务完成, 生成契约条款, 判定关系阶段推进 } from './bdsmTaskWorkflow';
export { 触发任务生成, 触发日常指令刷新 } from './bdsmTaskTrigger';

// 校园 NSFW
export { 从NPC创建欲望档案, 创建默认欲望档案 } from './campusNSFWEngine';

// 房产 SLG 经营系统
export { 创建空房产状态, 创建初始房产 } from './storyState';
export {
    计算房产吸引力, 计算舒适度, 计算安全性, 计算房客满意度,
    计算应付租金, 计算维护费用, 计算经验值获取,
    推进经营回合, 检查房客退租, 生成经营摘要
} from './property/propertyEngine';
export {
    开始建造设施, 完成建造设施, 升级设施, 拆除设施,
    扩建房间, 升级房间, 处理建造队列, 检查建造资金
} from './property/facilityWorkflow';
export {
    招揽房客, 处理房客退租, 自动退租检查, 更新房客满意度,
    获取房客满意度报告, 驱逐房客, 分配房间
} from './property/tenantWorkflow';
