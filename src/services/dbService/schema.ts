/**
 * services/dbService/schema.ts
 *
 * 数据库 schema 常量与索引定义（2026-06-03 从 dbService.ts 提取，Day 36 冻结）
 *
 * ⚠️ Phase 3 Day 36 拆分期间：schema **冻结**，仅重组 import 边界。
 * 修改本文件中的常量需要同时：
 *   1) 在 migrations.ts 添加升级路径
 *   2) 在 initialization.ts 的 onupgradeneeded 同步调整
 *   3) 跑 schema dump 留底（见 docs/plans/2026-06-06_phase3-large-file-split.md）
 */

// ────────────────────────────────────────────────────────────────
// 数据库 & 版本号
// ────────────────────────────────────────────────────────────────

export const DB_NAME = 'WuxiaGameDB';

/** IndexedDB schema 版本号；变更时必须同时提供迁移函数 */
export const VERSION = 3;

// ────────────────────────────────────────────────────────────────
// Object Store 名称
// ────────────────────────────────────────────────────────────────

/** 存档主表（keyPath: id autoIncrement） */
export const STORE_NAME = 'saves';

/** 设置 KV 表（keyPath: key） */
export const SETTINGS_STORE = 'settings';

/** 图片资产表（keyPath: id，存储 dataUrl） */
export const IMAGE_ASSETS_STORE = 'image_assets';

/** 设备消息表（keyPath: id） */
export const DEVICE_MESSAGES_STORE = 'device_messages';

// ────────────────────────────────────────────────────────────────
// 索引列表（只读参考；实际索引在 initialization.ts 中创建）
// ────────────────────────────────────────────────────────────────

/** DEVICE_MESSAGES_STORE 索引 */
export const DEVICE_MESSAGES_INDEXES = {
    by_type: { keyPath: 'type', unique: false },
    by_timestamp: { keyPath: 'timestamp', unique: false },
} as const;
