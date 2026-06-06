// Barrel re-export for utils/worldbook
// 按职责拆为：types（类型/常量）、parser（解析/规范化）、
//          matcher（条目匹配）、serializer（导出/导入/预设）
// Day 40: types + parser；matcher + serializer 仍保留在 worldbook.ts 中，
//         待 Day 41/42 进一步拆分。
export * from './types';
export * from './parser';
