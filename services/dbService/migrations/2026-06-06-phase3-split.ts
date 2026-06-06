/**
 * services/dbService/migrations/2026-06-06-phase3-split.ts
 *
 * Phase 3 拆分占位迁移脚本
 *
 * 拆分未改 schema，所以此脚本为 noop
 * 保留此文件作为后续 schema 变更时的迁移模板
 *
 * 用法（未来 schema 变更时）：
 * 1) 在 migrations.ts 中实现 upgrade_<from>_<to>(db, transaction) 函数
 * 2) 在 initialization.ts 的 VERSION 常量递增
 * 3) 在 onupgradeneeded 中按 oldVersion → newVersion 调用对应 upgrade 函数
 */
export const phase3_split_marker = 'phase3-split-2026-06-06';
