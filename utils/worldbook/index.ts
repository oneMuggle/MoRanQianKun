// Barrel re-export for utils/worldbook
// 按职责拆为：types（类型/常量）、parser（解析/规范化）、
//          matcher（条目匹配）、serializer（导出/导入/预设）
// Day 41 进度：matcher 已迁出至 utils/worldbook/matcher.ts；
// serializer（导出/导入/预设）仍在本文件，待 Day 42 进一步拆分。
export * from './types';
export * from './parser';
export * from './matcher';
