/**
 * models/system/ui-settings.test.ts
 *
 * UI 设置：性能监控默认配置 / 视觉设置结构契约。
 */

import { describe, it, expect } from 'vitest';
import {
    默认性能监控配置,
    type 性能监控配置结构,
    type 视觉设置结构,
} from './ui-settings';

describe('默认性能监控配置', () => {
    it('所有开关默认关闭', () => {
        expect(默认性能监控配置.启用性能监控).toBe(false);
        expect(默认性能监控配置.显示FPS).toBe(false);
        expect(默认性能监控配置.显示性能面板).toBe(false);
        expect(默认性能监控配置.启用渲染分析).toBe(false);
        expect(默认性能监控配置.启用内存追踪).toBe(false);
        expect(默认性能监控配置.启用AI队列监控).toBe(false);
    });

    it('AI 响应慢阈值 10 秒', () => {
        expect(默认性能监控配置.AI响应慢阈值ms).toBe(10000);
    });

    it('生图慢阈值 30 秒', () => {
        expect(默认性能监控配置.生图慢阈值ms).toBe(30000);
    });

    it('慢操作显示条数默认 10', () => {
        expect(默认性能监控配置.慢操作显示条数).toBe(10);
    });

    it('所有阈值字段为正整数', () => {
        expect(默认性能监控配置.AI响应慢阈值ms).toBeGreaterThan(0);
        expect(默认性能监控配置.生图慢阈值ms).toBeGreaterThan(0);
        expect(默认性能监控配置.慢操作显示条数).toBeGreaterThan(0);
        expect(Number.isInteger(默认性能监控配置.AI响应慢阈值ms)).toBe(true);
        expect(Number.isInteger(默认性能监控配置.生图慢阈值ms)).toBe(true);
    });
});

describe('性能监控配置结构契约', () => {
    it('完整结构可正确构造', () => {
        const cfg: 性能监控配置结构 = {
            启用性能监控: true,
            显示FPS: true,
            AI响应慢阈值ms: 5000,
            生图慢阈值ms: 20000,
            显示性能面板: true,
            启用渲染分析: false,
            启用内存追踪: true,
            启用AI队列监控: false,
            慢操作显示条数: 20,
        };
        expect(cfg.启用性能监控).toBe(true);
        expect(cfg.慢操作显示条数).toBe(20);
    });

    it('默认值与构造值不共享引用', () => {
        const cfg: 性能监控配置结构 = { ...默认性能监控配置, 启用性能监控: true };
        expect(cfg.启用性能监控).toBe(true);
        expect(默认性能监控配置.启用性能监控).toBe(false);
    });
});

describe('视觉设置结构契约', () => {
    it('最小必填字段可构造', () => {
        const v: 视觉设置结构 = {
            时间显示格式: '传统',
            渲染层数: 30,
        };
        expect(v.时间显示格式).toBe('传统');
        expect(v.渲染层数).toBe(30);
    });

    it('数字时间格式也可', () => {
        const v: 视觉设置结构 = {
            时间显示格式: '数字',
            渲染层数: 30,
        };
        expect(v.时间显示格式).toBe('数字');
    });

    it('可选字段允许 undefined', () => {
        const v: 视觉设置结构 = {
            时间显示格式: '传统',
            渲染层数: 30,
            字体大小: 18,
            段落间距: 1.5,
            AI思考流式折叠: true,
            底部滚动关闭显示: false,
        };
        expect(v.字体大小).toBe(18);
        expect(v.AI思考流式折叠).toBe(true);
    });
});
