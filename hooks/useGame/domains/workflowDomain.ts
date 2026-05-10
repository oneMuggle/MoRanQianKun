/**
 * 工作流协调域
 *
 * 聚合 featureFlags、设置持久化、BDSM、系统提示词构建、命令处理、
 * 历史回合、变量校准协调、handleStop、世界演变控制、记忆系统更新、运行时变量工作流。
 */

export interface WorkflowDomainInput {
    apiConfig: any; gameConfig: any; 历史记录: any; 环境: any; 剧情: any;
    社交: any; 战斗: any; 角色: any; prompts: any; 设置角色: any;
    设置环境: any; 设置游戏初始时间: any; 设置社交: any; 设置世界: any;
    设置战斗: any; 设置玩家门派: any; 设置任务列表: any; 设置约定列表: any;
    设置剧情: any; 设置剧情规划: any; 设置女主剧情规划: any;
    设置同人剧情规划: any; 设置同人女主剧情规划: any; 应用并同步记忆系统: any;
    设置历史记录: any; 设置校规系统: any; 设置催眠系统: any;
    清空变量生成上下文缓存: any; setWorldEvents: any; 规范化剧情状态: any;
    规范化角色物品容器映射: any; 规范化环境信息: any; 深拷贝: any;
    useFeatureFlags: any;
    // 设置持久化
    apiConfigRef: any; setApiConfig: any; set内置提示词列表: any;
    set世界书列表: any; set世界书预设组列表: any; 应用视觉设置到状态: any;
    应用图片管理设置到状态: any; 场景图片档案Ref: any; set场景图片档案: any;
    imageManagerConfigRef: any; imageManagerConfig: any; 默认图片管理设置: any;
    规范化图片管理设置: any; setGameConfig: any; setMemoryConfig: any;
    setPrompts: any; setFestivals: any; 创建设置持久化工作流: any;
    // BDSM
    校园系统: any; 设置校园系统: any; 创建BDSM关系操作工作流: any;
    // 系统提示词
    记忆系统: any; memoryConfig: any; 内置提示词列表: any; 世界书列表: any;
    角色姓名: string | undefined; currentEra: any; 构建系统提示词工作流: any;
    // 命令处理 (规范化剧情规划状态等来自 featureFlags 输出，在内部传递)
    世界: any; 玩家门派: any; 任务列表: any; 约定列表: any; 剧情规划: any;
    女主剧情规划: any; 同人剧情规划: any; 同人女主剧情规划: any;
    校园系统ForCommand: any; 写真系统: any; 都市网约车系统: any;
    设置写真系统: any; 设置都市网约车系统: any; 执行变量自动校准: any;
    变量生成功能已启用: any; 创建命令处理工作流: any; 战斗结束自动清空: any;
    // 历史回合
    loading: any; 变量生成中: any; 记忆总结阶段: any;
    visualConfig: any; visualConfigRef: any; scrollRef: any;
    回合快照栈Ref: any; 回档到快照: any; 弹出重Roll快照: any;
    删除最近自动存档并重置状态: any; 环境时间转标准串: any;
    规范化记忆配置: any; 规范化视觉设置: any; 规范化场景图片档案: any;
    normalizeCanonicalGameTime: any; 构建即时记忆条目: any;
    构建短期记忆条目: any; 写入四段记忆: any; 估算AI输出Token: any;
    提取解析失败原始信息: any; 提取原始报错详情: any;
    构建标签解析选项: any; parseStoryRawText: any; 执行正文润色: any;
    规范化游戏设置: any; 按世界演变分流净化响应: any;
    应用并同步记忆系统FromRuntime: any; performAutoSave: any;
    记录变量生成上下文: any; set聊天区自动滚动抑制令牌: any;
    获取NPC唯一标识: any; 合并NPC图片档案: any; 创建历史回合工作流: any;
    // 变量校准协调
    开局配置: any; 世界演变进行中Ref: any; variableGenerationAbortControllerRef: any;
    set变量生成中: any; 等待世界演变空闲: any; 执行变量模型校准工作流: any;
    合并变量生成结果到响应: any; 获取变量计算接口配置: any;
    接口配置是否可用: any; 序列化变量校准命令: any;
    获取变量生成并发配置: any; 创建变量生成协调器: any;
    // 世界演变控制
    view: any; 世界演变更新中: any; 世界演变状态文本: any;
    世界演变最近更新时间: any; 世界演变最近现实更新时间戳Ref: any;
    世界演变去重签名Ref: any; set世界演变更新中: any;
    set世界演变状态文本: any; 执行世界演变更新: any;
    useWorldEvolutionControl: any;
    // 运行时变量工作流
    环境时间转标准串ForRuntime: any; 创建运行时变量工作流: any;
    // abort & 记忆
    abortControllerRef: any; 规范化记忆系统: any;
    // 状态规范化 (来自 state access 层)
    规范化世界状态: any; 规范化战斗状态: any; 规范化门派状态: any;
}

export function createWorkflowDomain(input: WorkflowDomainInput) {
    const {
        apiConfig, gameConfig, 历史记录, 环境, 剧情, 社交, 战斗, 角色,
        prompts, 设置角色, 设置环境, 设置游戏初始时间, 设置社交, 设置世界,
        设置战斗, 设置玩家门派, 设置任务列表, 设置约定列表, 设置剧情,
        设置剧情规划, 设置女主剧情规划, 设置同人剧情规划, 设置同人女主剧情规划,
        应用并同步记忆系统, 设置历史记录, 设置校规系统, 设置催眠系统,
        清空变量生成上下文缓存, setWorldEvents, 规范化剧情状态,
        规范化角色物品容器映射, 规范化环境信息, 深拷贝, useFeatureFlags,
        apiConfigRef, setApiConfig, set内置提示词列表, set世界书列表,
        set世界书预设组列表, 应用视觉设置到状态, 应用图片管理设置到状态,
        场景图片档案Ref, set场景图片档案, imageManagerConfigRef,
        imageManagerConfig, 默认图片管理设置, 规范化图片管理设置,
        setGameConfig, setMemoryConfig, setPrompts, setFestivals,
        创建设置持久化工作流,
        校园系统, 设置校园系统, 创建BDSM关系操作工作流,
        记忆系统, memoryConfig, 内置提示词列表, 世界书列表,
        角色姓名, currentEra, 构建系统提示词工作流,
        世界, 玩家门派, 任务列表, 约定列表, 剧情规划, 女主剧情规划,
        同人剧情规划, 同人女主剧情规划, 校园系统ForCommand, 写真系统, 都市网约车系统,
        设置写真系统, 设置都市网约车系统, 执行变量自动校准,
        变量生成功能已启用, 创建命令处理工作流, 战斗结束自动清空,
        loading, 变量生成中, 记忆总结阶段, visualConfig, visualConfigRef,
        scrollRef, 回合快照栈Ref, 回档到快照, 弹出重Roll快照,
        删除最近自动存档并重置状态, 环境时间转标准串, 规范化记忆配置,
        规范化视觉设置, 规范化场景图片档案, normalizeCanonicalGameTime,
        构建即时记忆条目, 构建短期记忆条目, 写入四段记忆,
        估算AI输出Token, 提取解析失败原始信息, 提取原始报错详情,
        构建标签解析选项, parseStoryRawText, 执行正文润色,
        规范化游戏设置, 按世界演变分流净化响应,
        应用并同步记忆系统FromRuntime, performAutoSave,
        记录变量生成上下文, set聊天区自动滚动抑制令牌,
        获取NPC唯一标识, 合并NPC图片档案, 创建历史回合工作流,
        开局配置, 世界演变进行中Ref, variableGenerationAbortControllerRef,
        set变量生成中, 等待世界演变空闲, 执行变量模型校准工作流,
        合并变量生成结果到响应, 获取变量计算接口配置, 接口配置是否可用,
        序列化变量校准命令, 获取变量生成并发配置, 创建变量生成协调器,
        view, 世界演变更新中, 世界演变状态文本, 世界演变最近更新时间,
        世界演变最近现实更新时间戳Ref, 世界演变去重签名Ref,
        set世界演变更新中, set世界演变状态文本,
        执行世界演变更新, useWorldEvolutionControl,
        环境时间转标准串ForRuntime, 创建运行时变量工作流,
        abortControllerRef, 规范化记忆系统,
        规范化世界状态, 规范化战斗状态, 规范化门派状态,
    } = input;

    // --- useFeatureFlags ---
    const featureFlags = useFeatureFlags({
        apiConfig, gameConfig, 历史记录, 环境, 剧情, 社交, 战斗, 角色,
        prompts, 设置角色, 设置环境, 设置游戏初始时间, 设置社交, 设置世界,
        设置战斗, 设置玩家门派, 设置任务列表, 设置约定列表, 设置剧情,
        设置剧情规划, 设置女主剧情规划, 设置同人剧情规划, 设置同人女主剧情规划,
        应用并同步记忆系统, 设置历史记录, 设置校规系统, 设置催眠系统,
        清空变量生成上下文缓存, setWorldEvents, 规范化剧情状态,
        规范化角色物品容器映射, 规范化环境信息, 深拷贝,
    });
    const {
        世界演变功能已开启: worldEvolutionEnabled,
        文章优化功能已开启: ff文章优化功能已开启,
        已进入主剧情回合: enteredMainStoryRound,
        执行正文润色: ff执行正文润色,
        规范化剧情规划状态: ff规范化剧情规划状态,
        规范化女主剧情规划状态: ff规范化女主剧情规划状态,
        规范化同人剧情规划状态: ff规范化同人剧情规划状态,
        规范化同人女主剧情规划状态: ff规范化同人女主剧情规划状态,
        规范化社交列表安全,
        应用开场基态,
    } = featureFlags;

    // --- 设置持久化 ---
    const {
        loadBuiltinPromptEntries, loadWorldbooks, loadWorldbookPresetGroups,
        saveSettings, saveBuiltinPromptEntries, saveWorldbooks,
        saveWorldbookPresetGroups, saveVisualSettings, saveImageManagerSettings,
        updateApiConfig, saveArtistPreset, deleteArtistPreset,
        saveModelConverterPreset, deleteModelConverterPreset,
        setModelConverterPresetEnabled, savePromptConverterPreset,
        deletePromptConverterPreset, exportPresets, importPresets,
        saveGameSettings, saveMemorySettings, updatePrompts, updateFestivals,
    } = 创建设置持久化工作流({
        获取接口配置: () => apiConfigRef.current,
        同步接口配置: (config: any) => { apiConfigRef.current = config; setApiConfig(config); },
        设置内置提示词列表: set内置提示词列表,
        设置世界书列表: set世界书列表,
        设置世界书预设组列表: set世界书预设组列表,
        应用视觉设置到状态,
        应用图片管理设置到状态,
        获取当前场景图片档案: () => 场景图片档案Ref.current || {},
        同步场景图片档案: (archive: any) => { 场景图片档案Ref.current = archive; set场景图片档案(archive); },
        获取场景图历史上限: () => 规范化图片管理设置(imageManagerConfigRef.current || imageManagerConfig || 默认图片管理设置).场景图历史上限,
        设置游戏设置: setGameConfig,
        设置记忆配置: setMemoryConfig,
        设置提示词池: setPrompts,
        设置节日列表: setFestivals,
    });

    // --- BDSM ---
    const bdsm = 创建BDSM关系操作工作流({ 校园系统, apiConfig, 设置校园系统 });
    const {
        更新BDSM关系状态, 添加BDSM任务, 更新BDSM任务状态,
        更新契约状态, 添加BDSM里程碑, 设置日常指令,
        请求生成BDSM任务, 请求生成BDSM日常指令, 请求评价BDSM任务,
        请求生成BDSM契约, 请求判定BDSM阶段推进,
        构建BDSM状态更新回调, 构建BDSM见面预约更新回调,
        请求报告任务完成, 请求阶段推进,
    } = bdsm;

    // --- 系统提示词构建 ---
    const 构建系统提示词 = (
        promptPool: any[], memoryData: any, socialData: any[],
        statePayload: any, options?: any, deviceMessages?: any[],
        overrideGameConfig?: any
    ) => 构建系统提示词工作流({
        promptPool, memoryData, socialData, statePayload,
        gameConfig: overrideGameConfig ?? gameConfig,
        memoryConfig, fallbackPlayerName: 角色姓名,
        builtinPromptEntries: 内置提示词列表, worldbooks: 世界书列表,
        worldEvolutionEnabled: worldEvolutionEnabled(), deviceMessages,
        options: { ...options, eraId: options?.eraId ?? currentEra },
    });

    // --- 命令处理 (使用 featureFlags 输出的规范化函数) ---
    const { processResponseCommands } = 创建命令处理工作流({
        角色, 环境, 社交, 世界, 战斗, 玩家门派, 任务列表, 约定列表,
        剧情, 剧情规划, 女主剧情规划, 同人剧情规划, 同人女主剧情规划,
        校园系统: 校园系统ForCommand, 写真系统, 都市网约车系统,
        规范化环境信息, 规范化社交列表: 规范化社交列表安全,
        规范化世界状态, 规范化战斗状态, 规范化门派状态,
        规范化剧情状态,
        规范化剧情规划状态: ff规范化剧情规划状态,
        规范化女主剧情规划状态: ff规范化女主剧情规划状态,
        规范化同人剧情规划状态: ff规范化同人剧情规划状态,
        规范化同人女主剧情规划状态: ff规范化同人女主剧情规划状态,
        规范化角色物品容器映射, 战斗结束自动清空, 深拷贝,
        设置角色, 设置环境, 设置社交, 设置世界, 设置战斗,
        设置玩家门派, 设置任务列表, 设置约定列表,
        设置剧情, 设置剧情规划, 设置女主剧情规划,
        设置同人剧情规划, 设置同人女主剧情规划,
        设置校园系统, 设置写真系统, 设置都市网约车系统,
        执行变量自动校准, 变量生成功能已启用, apiConfig,
    });

    // --- 历史回合 ---
    let 执行重解析变量生成委托: any = async (params: any) => params.parsedResponse;
    const {
        使用快照重建解析回合, updateHistoryItem, handleRegenerate,
        handleRecoverFromParseErrorRaw, handlePolishTurn,
    } = 创建历史回合工作流({
        历史记录, 记忆系统, memoryConfig, gameConfig, prompts,
        内置提示词列表, 世界书列表, loading,
        变量生成中: 变量生成中, 记忆总结阶段, 社交,
        visualConfig, visualConfigRef, 场景图片档案Ref, scrollRef,
        获取最新快照: () => 回合快照栈Ref.current[回合快照栈Ref.current.length - 1] || null,
        回档到快照, 弹出重Roll快照, 删除最近自动存档并重置状态,
        深拷贝, 环境时间转标准串, 规范化记忆配置,
        规范化记忆系统: 规范化记忆系统,
        规范化社交列表: 规范化社交列表安全, 规范化视觉设置,
        规范化场景图片档案, normalizeCanonicalGameTime,
        构建即时记忆条目, 构建短期记忆条目, 写入四段记忆,
        估算AI输出Token, 提取解析失败原始信息, 提取原始报错详情,
        构建标签解析选项, parseStoryRawText: parseStoryRawText,
        执行正文润色, 规范化游戏设置, processResponseCommands,
        按世界演变分流净化响应, 世界演变功能已开启: worldEvolutionEnabled,
        执行重解析变量生成: (params: any) => 执行重解析变量生成委托(params),
        应用并同步记忆系统: 应用并同步记忆系统FromRuntime,
        performAutoSave: (...args: any[]) => performAutoSave(...args),
        设置剧情, 设置历史记录, 设置玩家门派, 设置任务列表, 设置约定列表,
        设置社交, 记录变量生成上下文, set聊天区自动滚动抑制令牌,
        获取NPC唯一标识, 合并NPC图片档案,
    });

    // --- 变量校准协调 ---
    const {
        执行变量校准并合并响应: 执行变量生成并合并响应,
        执行重解析变量校准: 执行重解析变量生成,
    } = 创建变量生成协调器({
        apiConfig, gameConfig, prompts, 开局配置, 内置提示词列表, 世界书列表,
        世界演变进行中Ref, variableGenerationAbortControllerRef,
        set变量生成中: set变量生成中, 深拷贝,
        世界演变功能已开启: worldEvolutionEnabled, 等待世界演变空闲,
        收集最近变量生成上下文: () => [],
        执行变量模型校准工作流, 合并变量生成结果到响应,
        变量生成功能已启用, 获取变量计算接口配置, 接口配置是否可用,
        序列化变量生成命令: 序列化变量校准命令,
        使用快照重建解析回合,
    }, 获取变量生成并发配置(gameConfig));
    执行重解析变量生成委托 = 执行重解析变量生成;

    // --- handleStop ---
    const handleStop = () => {
        if (abortControllerRef.current) { abortControllerRef.current.abort(); }
        if (variableGenerationAbortControllerRef.current) { variableGenerationAbortControllerRef.current.abort(); }
    };

    // --- 世界演变控制 ---
    const { handleForceWorldEvolutionUpdate } = useWorldEvolutionControl({
        view, loading, apiConfig, 环境, 世界, 世界演变更新中,
        变量生成中: 变量生成中, 世界演变状态文本, 世界演变最近更新时间,
        世界演变最近现实更新时间戳Ref, 世界演变去重签名Ref,
        世界演变功能已开启: worldEvolutionEnabled,
        已进入主剧情回合: enteredMainStoryRound,
        set世界演变状态文本, 规范化世界状态, 执行世界演变更新,
    });

    // --- updateMemorySystem ---
    const updateMemorySystem = (nextMemory: any) => {
        const normalized = 规范化记忆系统(nextMemory);
        应用并同步记忆系统FromRuntime(normalized);
    };

    // --- 运行时变量工作流 ---
    const {
        updateRuntimeVariableSection, applyRuntimeVariableCommand,
        removeTask, removeAgreement,
    } = 创建运行时变量工作流({
        获取历史记录: () => 历史记录, 深拷贝,
        获取当前状态: () => ({ 角色, 环境, 社交, 世界, 战斗, 剧情, 剧情规划, 女主剧情规划, 同人剧情规划, 同人女主剧情规划, 玩家门派, 任务列表, 约定列表, 记忆系统 }),
        规范化角色物品容器映射, 规范化环境信息,
        规范化社交列表: 规范化社交列表安全, 规范化世界状态,
        规范化战斗状态, 规范化剧情状态,
        规范化剧情规划状态: ff规范化剧情规划状态,
        规范化女主剧情规划状态: ff规范化女主剧情规划状态,
        规范化同人剧情规划状态: ff规范化同人剧情规划状态,
        规范化同人女主剧情规划状态: ff规范化同人女主剧情规划状态,
        规范化门派状态, 规范化记忆系统: 规范化记忆系统,
        环境时间转标准串: 环境时间转标准串ForRuntime,
        获取开局配置: () => 开局配置,
        设置角色, 设置环境, 设置社交, 设置世界, 设置战斗,
        设置剧情, 设置剧情规划, 设置女主剧情规划,
        设置同人剧情规划, 设置同人女主剧情规划,
        设置玩家门派, 设置任务列表, 设置约定列表,
        应用并同步记忆系统: 应用并同步记忆系统FromRuntime,
        performAutoSave,
    });

    return {
        worldEvolutionEnabled, 文章优化功能已开启: ff文章优化功能已开启,
        enteredMainStoryRound, 执行正文润色: ff执行正文润色,
        规范化剧情规划状态: ff规范化剧情规划状态,
        规范化女主剧情规划状态: ff规范化女主剧情规划状态,
        规范化同人剧情规划状态: ff规范化同人剧情规划状态,
        规范化同人女主剧情规划状态: ff规范化同人女主剧情规划状态,
        规范化社交列表安全, 应用开场基态,
        loadBuiltinPromptEntries, loadWorldbooks, loadWorldbookPresetGroups,
        saveSettings, saveBuiltinPromptEntries, saveWorldbooks,
        saveWorldbookPresetGroups, saveVisualSettings, saveImageManagerSettings,
        updateApiConfig, saveArtistPreset, deleteArtistPreset,
        saveModelConverterPreset, deleteModelConverterPreset,
        setModelConverterPresetEnabled, savePromptConverterPreset,
        deletePromptConverterPreset, exportPresets, importPresets,
        saveGameSettings, saveMemorySettings, updatePrompts, updateFestivals,
        更新BDSM关系状态, 添加BDSM任务, 更新BDSM任务状态,
        更新契约状态, 添加BDSM里程碑, 设置日常指令,
        请求生成BDSM任务, 请求生成BDSM日常指令, 请求评价BDSM任务,
        请求生成BDSM契约, 请求判定BDSM阶段推进,
        构建BDSM状态更新回调, 构建BDSM见面预约更新回调,
        请求报告任务完成, 请求阶段推进,
        构建系统提示词,
        processResponseCommands, 使用快照重建解析回合, updateHistoryItem,
        handleRegenerate, handleRecoverFromParseErrorRaw, handlePolishTurn,
        执行变量生成并合并响应, 执行重解析变量生成,
        handleStop, handleForceWorldEvolutionUpdate,
        updateMemorySystem,
        updateRuntimeVariableSection, applyRuntimeVariableCommand,
        removeTask, removeAgreement,
    };
}
