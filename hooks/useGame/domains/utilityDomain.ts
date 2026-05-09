/**
 * 工具域
 *
 * 聚合设置操作、通知系统、设备系统、旅行交易、背景图监控、NSFW 初始化、追加系统消息。
 */

export interface UtilityDomainInput {
    // useSettingsActions 依赖
    visualConfigRef: any;
    setVisualConfig: any;
    场景图片档案Ref: any;
    set场景图片档案: any;
    时代信息Ref: any;
    set时代信息: any;
    imageManagerConfigRef: any;
    setImageManagerConfig: any;
    setCurrentEra: any;
    setCurrentTheme: any;
    set右下角提示列表: any;
    useSettingsActions: any;
    // 通知系统依赖
    创建通知系统: any;
    // useDevice 依赖
    gameConfig: any;
    currentEra: any;
    角色: any;
    社交: any;
    世界: any;
    剧情: any;
    历史记录: any;
    校规系统: any;
    催眠系统: any;
    校园系统: any;
    设置校园系统: any;
    apiConfig: any;
    useDevice: any;
    // useTravelAndTrade 依赖
    环境: any;
    设置角色: any;
    设置环境: any;
    useTravelAndTrade: any;
    // useBackgroundImageMonitor 依赖
    NPC生图任务队列: any;
    场景生图任务队列: any;
    useBackgroundImageMonitor: any;
    // useNSFW系统初始化 依赖
    都市网约车系统: any;
    写真系统: any;
    设置都市网约车系统: any;
    设置写真系统: any;
    useNSFW系统初始化: any;
    // 追加系统消息依赖
    创建追加系统消息: any;
    设置历史记录: any;
    // set世界演变最近更新时间 依赖
    set世界演变最近更新时间State: any;
    世界演变最近现实更新时间戳Ref: any;
}

export function createUtilityDomain(input: UtilityDomainInput) {
    const {
        visualConfigRef, setVisualConfig,
        场景图片档案Ref, set场景图片档案,
        时代信息Ref, set时代信息,
        imageManagerConfigRef, setImageManagerConfig,
        setCurrentEra, setCurrentTheme,
        set右下角提示列表,
        useSettingsActions,
        创建通知系统,
        gameConfig, currentEra, 角色, 社交, 世界, 剧情,
        历史记录, 校规系统, 催眠系统, 校园系统,
        设置校园系统, apiConfig, useDevice,
        环境, 设置角色, 设置环境, useTravelAndTrade,
        NPC生图任务队列, 场景生图任务队列,
        useBackgroundImageMonitor,
        都市网约车系统, 写真系统,
        设置都市网约车系统, 设置写真系统,
        useNSFW系统初始化,
        创建追加系统消息, 设置历史记录,
        set世界演变最近更新时间State,
        世界演变最近现实更新时间戳Ref,
    } = input;

    // --- useSettingsActions ---
    const settingsActions = useSettingsActions({
        visualConfigRef,
        setVisualConfig,
        场景图片档案Ref,
        set场景图片档案,
        时代信息Ref,
        set时代信息,
        imageManagerConfigRef,
        setImageManagerConfig,
        setCurrentEra,
        setCurrentTheme,
        set右下角提示列表,
    });
    const { 深拷贝, 应用视觉设置到状态, 应用场景图片档案到状态, 应用时代信息到状态, 处理时代变更, 应用图片管理设置到状态, 关闭右下角提示 } = settingsActions;

    // --- 通知系统 ---
    const 通知系统 = 创建通知系统(set右下角提示列表);
    const 推送右下角提示 = 通知系统.推送右下角提示;

    // --- useDevice ---
    const device = useDevice({
        gameConfig,
        currentEra,
        角色,
        社交,
        世界,
        剧情,
        历史记录,
        校规系统,
        催眠系统,
        校园系统,
        设置校园系统,
        apiConfig,
        推送右下角提示,
    });
    const {
        设备关闭,
        设备返回主页,
        设备打开应用,
        设备打开,
        派生设备模式,
    } = device;

    // --- useTravelAndTrade ---
    const travelAndTrade = useTravelAndTrade({
        角色,
        环境,
        设置角色,
        设置环境,
        gameConfig,
        currentEra,
    });
    const {
        handleTravel,
        handleExplore,
        handleBuyItem,
        handleSellItem,
        handleForgeItem,
        getForgeRecipes,
        checkForgeMaterials,
        getForgeSuccessRate,
    } = travelAndTrade;

    // --- useBackgroundImageMonitor ---
    useBackgroundImageMonitor({
        推送右下角提示,
        NPC生图任务队列,
        场景生图任务队列
    });

    // --- useNSFW系统初始化 ---
    useNSFW系统初始化({
        gameConfig,
        校园系统,
        都市网约车系统,
        写真系统,
        角色,
        社交,
        设置校园系统,
        设置都市网约车系统,
        设置写真系统,
    });

    // --- 追加系统消息 ---
    const 追加系统消息 = 创建追加系统消息(设置历史记录);

    // --- set世界演变最近更新时间 封装 ---
    const set世界演变最近更新时间 = (value: string | null) => {
        set世界演变最近更新时间State(value);
        世界演变最近现实更新时间戳Ref.current = Date.now();
    };

    return {
        深拷贝, 应用视觉设置到状态, 应用场景图片档案到状态,
        应用时代信息到状态, 处理时代变更, 应用图片管理设置到状态,
        关闭右下角提示,
        推送右下角提示,
        设备关闭, 设备返回主页, 设备打开应用, 设备打开, 派生设备模式,
        handleTravel, handleExplore, handleBuyItem, handleSellItem,
        handleForgeItem, getForgeRecipes, checkForgeMaterials, getForgeSuccessRate,
        追加系统消息,
        set世界演变最近更新时间,
    };
}
