/**
 * 字符串规范化工具集
 * 集中管理跨文件重复的文本规范化函数，避免重复定义。
 *
 * 所有需要文本规范化的模块应从此文件导入，禁止自行定义同名函数。
 */

/**
 * 规范化文本 - 移除BOM字符、转换CRLF为LF、去除首尾空白
 * @param value 输入字符串
 * @param fallback 非字符串时的默认值
 */
export const 规范化文本 = (value: unknown, fallback = ''): string => {
    if (typeof value !== 'string') return fallback;
    return value
        .replace(/\r\n/g, '\n')
        .replace(/\uFEFF/g, '')
        .trim();
};

/**
 * 规范化标题候选行 - 用于章节标题等场景的文本规范化
 * 在规范化文本基础上额外处理：
 * - 多个空白字符合并为单个空格
 * - 多个管道符合并为单个
 * @param value 输入字符串
 */
export const 规范化标题候选行 = (value: string): string => 规范化文本(value)
    .replace(/[\t\u3000 ]+/g, ' ')
    .replace(/[|｜]+/g, '｜')
    .trim();

// ============================================================
// 时间规范化函数
// ============================================================

/** 格式化数字为两位字符串 */
const two = (n: number): string => Math.trunc(n).toString().padStart(2, '0');

/** 将值转换为有界的整数，超出范围时返回 fallback */
const toBoundedInt = (value: unknown, fallback: number, min: number, max: number): number => {
    const num = typeof value === 'number' ? value : Number(value);
    if (!Number.isFinite(num)) return fallback;
    const int = Math.trunc(num);
    if (int < min || int > max) return fallback;
    return int;
};

/**
 * 规范化游戏时间字符串为标准格式 YYYY:MM:DD:HH:mm
 * - 年份保持原始长度（1-6位）
 * - 月日时分补零为两位
 * - 输入格式: YYYY:M:D:H:m 或 YYYY:MM:DD:HH:mm
 * @param input 原始时间字符串
 * @returns 规范化后的标准时间串，或 null（格式/值无效）
 */
export const normalizeCanonicalGameTime = (input?: string): string | null => {
    if (!input || typeof input !== 'string') return null;
    const match = input.trim().match(/^(\d{1,6}):(\d{1,2}):(\d{1,2}):(\d{1,2}):(\d{1,2})$/);
    if (!match) return null;
    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);
    const hour = Number(match[4]);
    const minute = Number(match[5]);
    if (
        month < 1 || month > 12 ||
        day < 1 || day > 31 ||
        hour < 0 || hour > 23 ||
        minute < 0 || minute > 59
    ) {
        return null;
    }
    return `${year}:${two(month)}:${two(day)}:${two(hour)}:${two(minute)}`;
};

/**
 * 从时间字符串中提取月日
 * @param input 时间字符串
 * @returns { month, day } 或 null
 */
export const 提取时间月日 = (input?: string): { month: number; day: number } | null => {
    const canonical = normalizeCanonicalGameTime(input);
    if (!canonical) return null;
    const m = canonical.match(/^\d{1,6}:(\d{2}):(\d{2}):/);
    if (!m) return null;
    const month = Number(m[1]);
    const day = Number(m[2]);
    if (!Number.isFinite(month) || !Number.isFinite(day)) return null;
    return { month, day };
};
