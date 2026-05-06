// prompts/runtime/index.ts — Runtime prompts barrel
//
// Note: Most consumers use deep imports (e.g., from './runtime/defaults').
// This barrel is provided for discoverability and future convenience.
// New consumers should prefer deep imports to avoid bundling unused prompts.

// Core runtime
export { 默认短期转中期提示词, 默认中期转长期提示词, 默认NPC记忆总结提示词, 默认额外系统提示词, 旧版默认额外系统提示词, 默认COT伪装历史消息提示词, 默认文章优化提示词 } from './defaults';
export { 构建开局配置提示词 } from './openingConfig';

// Era theme
export { 构建时代主题注入, 构建时代角色原型注入, 构建时代文风注入 } from './eraTheme';
export { 构建子纪元里模式注入, 构建里模式NPC原型注入, 构建NPC表里切换注入 } from './eraLiMode';
export type { LiModeIntensity } from './eraLiMode';
export { 构建时代开局场景注入 } from './eraOpeningScene';

// World generation
export { 构建世界观生成系统提示词, 世界观生成系统提示词, 获取世界观生成系统提示词, 构建世界观生成用户提示词 } from './worldGeneration';
export { 构建世界观生成COT提示词, 世界观生成COT提示词, 世界观生成COT伪装历史消息提示词 } from './worldGenerationCot';
export { 构建世界演变系统提示词, 世界演变系统提示词, 构建世界演变用户提示词 } from './worldEvolution';
export { 构建世界演变COT提示词, 世界演变COT提示词, 世界演变COT伪装历史消息提示词 } from './worldEvolutionCot';
export { 世界变量结构参考提示词 } from './worldDataSchema';
export { 构建世界观锚点提示词, 构建世界观种子提示词, 构建世界生成任务上下文提示词 } from './worldSetup';

// Variable
export { 构建变量生成提示词 } from './variableGeneration';
export { 构建变量校准提示词 } from './variableCalibration';
export { 变量生成COT提示词, 变量校准COT提示词, 获取变量校准COT提示词 } from './variableCot';
export { 构建变量模型身份提示词, 构建变量模型职责提示词, 构建变量模型系统提示词, 构建变量模型输出格式提示词, 构建变量模型COT伪装提示词 } from './variableModel';

// Planning
export { 构建统一规划分析系统提示词, 构建统一规划分析用户提示词 } from './planningAnalysis';
export { 构建统一规划分析专用上下文, 统一规划分析COT提示词 } from './planUpdateReference';

// Fandom
export { 同人规划分析附加系统提示词, 同人规划分析附加COT提示词 } from './fandomPlanningAnalysis';
export { 同人境界体系生成系统提示词, 构建同人境界体系生成用户提示词 } from './fandomRealmGeneration';
export { 同人世界演变附加系统提示词, 同人世界演变附加COT提示词 } from './fandomWorldEvolution';
export type { 同人运行时提示词包 } from './fandom';
export { 默认累计境界映射数值列表, 默认累计境界阶段推进跳转列表, 默认累计境界大境突破跳转列表, 默认累计境界分段映射提示词, 默认累计境界九阶命名提示词, 默认累计境界能力边界提示词, 默认累计境界文案规则提示词, 默认累计境界差距口径提示词, 默认累计境界终点文案提示词, 默认累计境界阶段推进提示词, 默认累计境界大境突破提示词, 默认累计境界武侠硬边界提示词, 默认累计境界速查提示词, 默认境界母板提示词, 校验境界体系提示词完整性, 应用境界体系区块替换, 解析境界映射值 } from './fandom';

// Novel
export { 构建小说拆分AI角色声明提示词, 小说拆分AI身份提示词, 小说拆分其他要求提示词, 小说拆分结构要求提示词, 构建小说拆分当前任务提示词 } from './novelDecomposition';
export { 小说拆分COT提示词 } from './novelDecompositionCot';
export { 小说写作_大纲生成_系统提示词, 小说写作_大纲生成_用户提示词模板 } from './novelWriting';
export { 小说写作_章节撰写_系统提示词, 小说写作_章节续写_提示词模板, 小说写作_章节润色_提示词模板 } from './novelWritingChapter';

// Image
export { 角色锚点提取COT伪装历史消息提示词 } from './imageAnchorExtractionCot';
export { 角色图片分词COT伪装历史消息提示词 } from './imageTokenizerCharacterCot';
export { 场景图片分词COT伪装历史消息提示词 } from './imageTokenizerSceneCot';
export { 部位特写分词COT伪装历史消息提示词 } from './imageTokenizerSecretPartCot';
export { PNG解析COT伪装历史消息提示词 } from './pngParseCot';

// Recall
export { 剧情回忆检索COT提示词, 剧情回忆检索输出格式提示词, 构建剧情回忆检索用户提示词 } from './recall';

// NSFW
export { 默认NSFW模式提示词, 构建里象修行叙事约束, 构建现代情感叙事约束, 默认文生图NSFW模式提示词, 自动选择叙事约束 } from './nsfw';
export { 构建NPC_NSWF卡片, 构建在场NPC_NSWF卡片组 } from './nsfwCard';

// Campus / BDSM
export { 构建校园NSFW完整叙事约束, 构建欲望状态约束, 构建暴露风险约束, 构建露出叙事约束, 构建紧张度叙事约束 } from './campusNSFW';
export { 构建BDSM论坛叙事约束, 构建寻主召奴联系对话Prompt, 构建BDSM帖子生成提示词 } from './bdsmForum';
export type { BDSM任务类型, BDSM任务难度, BDSM任务状态, BDSM评价等级 } from './bdsmTasks';
export { 构建调教任务生成提示词, 构建日常指令生成提示词, 构建任务完成评价提示词, 构建契约条款生成提示词, 构建关系阶段推进判定提示词 } from './bdsmTasks';

// Urban Driver NSFW
export { 构建行程NSFW叙事约束, 构建醉酒叙事约束, 构建下药叙事约束, 构建行车记录仪紧张度约束, 构建网约车后果叙事约束 } from './urbanDriverNSFW';

// Protocol / Ownership
export { 获取输出协议提示词, 获取行动选项提示词, 构建字数要求提示词, 构建免责声明输出要求提示词 } from './protocolDirectives';
export { 变量命令提示词ID列表, 变量命令提示词ID集合, 是变量命令提示词, 提取启用变量命令提示词, 构建变量命令提示词汇总 } from './promptOwnership';

// Opening
export { 获取开场初始化任务提示词 } from './opening';
export { 开局规划初始化附加提示词, 构建开局规划初始化正文上下文, 构建开局规划初始化审计重点 } from './openingPlanningInit';
export { 开局变量生成附加提示词, 构建开局变量生成承接提示, 构建开局变量生成正文上下文, 构建开局变量生成审计重点 } from './openingVariableGenerationInit';
export { 开局世界演变初始化附加提示词, 构建开局世界演变初始化上下文 } from './openingWorldEvolutionInit';

// Li variants
export { 构建里武侠门派设定 } from './liWuxiaSects';
export { 构建里武侠世界提示词 } from './liWuxiaWorld';
export { 构建里志怪世界提示词 } from './liZhiguaiWorld';

// Qiyun
export { 气运初始化任务提示词, 气运在叙事中的呈现提示词, NPC气运分配提示词, 气运与世界演变提示词 } from './qiyun';

// Role identity
export { 构建AI角色声明提示词 } from './roleIdentity';

// Story plan schema
export { 剧情规划变量结构提示词 } from './storyPlanSchema';

// Intimacy runtime
export { 构建亲密度动作约束, 可触发双修, 获取最亲密动作 } from './intimacy';

// Variable calibration reference
export { 构建数值公式速查提示词, 构建难度速查提示词, 构建变量相关规则提示词 } from './variableCalibrationReference';

// Action options runtime
export { 构建行动选项运行时指令 } from './actionOptionsRuntime';

// World lixiang sects
export { 构建双修门派世界书, 获取门派描述强度 } from './worldLixiangSects';

// Real world mode
export { 真实世界模式COT联动说明, 构建真实世界模式提示词 } from './realWorldMode';

// Zhiguai world
export { 构建志怪世界提示词 } from './zhiguaiWorld';
