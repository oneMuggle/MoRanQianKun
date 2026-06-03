/**
 * models/era-device/appNames.ts
 *
 * 默认应用名称映射（2026-06-03 从 models/eraDevice.ts 提取）
 */

import type { MobileApp } from '../mobileDevice';

export const DEFAULT_APP_NAMES: Record<MobileApp, { normal: string; li: string }> = {
    map: { normal: '地图', li: '暗面地图' },
    contacts: { normal: '通讯录', li: '暗面关系' },
    chat: { normal: '群聊', li: '私密聊天' },
    forum: { normal: '论坛', li: '暗面论坛' },
    news: { normal: '资讯', li: '暗面推送' },
    album: { normal: '相册', li: '私密相册' },
    tools: { normal: '工具', li: '暗面工具' },
    schedule: { normal: '课程表', li: '秘密约会' },
    campus_card: { normal: '校园卡', li: '校园钱包' },
    club: { normal: '社团活动', li: '地下社团' },
    confession: { normal: '表白墙', li: '匿名告白' },
    rules: { normal: '学生手册', li: '暗影校规' },
    hypnosis: { normal: '心理辅导', li: '深度催眠' },
    bdsn: { normal: '深夜板块', li: '禁忌论坛' },
    // 现代纪元
    phone: { normal: '电话', li: '密线' },
    sms: { normal: '短信', li: '密信' },
    camera: { normal: '相机', li: '暗摄' },
    settings: { normal: '设置', li: '暗面设置' },
    weather: { normal: '天气', li: '夜象' },
    calendar: { normal: '日历', li: '密约' },
    clock: { normal: '时钟', li: '暗钟' },
    files: { normal: '文件', li: '暗柜' },
    ride_hailing: { normal: '司机端', li: '夜行接单' },
    delivery: { normal: '配送端', li: '暗路配送' },
    appointment: { normal: '预约管理', li: '暗约' },
    ledger: { normal: '记账本', li: '暗账' },
    work_schedule: { normal: '工作台', li: '暗面工作' },
    property: { normal: '房源管理', li: '暗房' },
    shopping: { normal: '购物', li: '暗市' },
    social_media: { normal: '社交媒体', li: '暗面社交' },
    app_store: { normal: '应用市场', li: '暗面市场' },
    music: { normal: '音乐', li: '夜曲' },
    video: { normal: '视频', li: '暗屏' },
    fitness: { normal: '运动健康', li: '暗面健康' },
    map_app: { normal: '地图导航', li: '暗面地图' },
    dating: { normal: '心动配对', li: '暗缘' },
    adult_forum: { normal: '深夜论坛', li: '禁忌版块' },
    nsfw_gallery: { normal: '私密空间', li: '暗室' },
    live_stream: { normal: '直播', li: '暗播' },
};
