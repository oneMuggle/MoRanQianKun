/**
 * 数据库服务导出入口
 *
 * Phase 1: 从 services/ 重新导出（保持向后兼容）
 * Phase 1.6+: 待 dbService 的相对导入路径修复后，再迁移实际代码到 core/db/
 */
export * from '../../services/dbService';
