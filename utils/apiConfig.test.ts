import { describe, it, expect } from 'vitest';
import {
    推断供应商,
    创建空接口设置,
    获取当前接口配置,
    获取主剧情接口配置,
    接口配置是否可用,
} from './apiConfig';

describe('推断供应商', () => {
    it('识别 Gemini 端点', () => {
        expect(推断供应商('https://generativelanguage.googleapis.com/v1beta/openai')).toBe('gemini');
        expect(推断供应商('https://googleapis.com/v1')).toBe('gemini');
    });

    it('识别 DeepSeek 端点', () => {
        expect(推断供应商('https://api.deepseek.com/v1')).toBe('deepseek');
    });

    it('识别智谱端点', () => {
        expect(推断供应商('https://open.bigmodel.cn/api/paas/v4')).toBe('zhipu');
        expect(推断供应商('https://bigmodel.cn/v1')).toBe('zhipu');
    });

    it('识别 Claude 端点', () => {
        expect(推断供应商('https://api.anthropic.com/v1/messages')).toBe('claude');
        expect(推断供应商('https://claude.example.com/v1')).toBe('claude');
    });

    it('识别 OpenAI 端点', () => {
        expect(推断供应商('https://api.openai.com/v1')).toBe('openai');
    });

    it('识别 SiliconFlow 为 openai_compatible', () => {
        expect(推断供应商('https://api.siliconflow.cn/v1')).toBe('openai_compatible');
    });

    it('识别 Together 为 openai_compatible', () => {
        expect(推断供应商('https://api.together.xyz/v1')).toBe('openai_compatible');
    });

    it('识别 Groq 为 openai_compatible', () => {
        expect(推断供应商('https://api.groq.com/openai/v1')).toBe('openai_compatible');
    });

    it('识别 Grok/xAI 端点', () => {
        expect(推断供应商('https://api.x.ai/v1')).toBe('grok');
        expect(推断供应商('https://grok.example.com/v1')).toBe('grok');
    });

    it('空输入返回默认 openai', () => {
        expect(推断供应商('')).toBe('openai');
        expect(推断供应商(null)).toBe('openai');
        expect(推断供应商(undefined)).toBe('openai');
    });

    it('未知自定义端点返回 openai_compatible', () => {
        expect(推断供应商('https://custom-provider.example.com/v1')).toBe('openai_compatible');
    });

    it('URL 末尾带多余斜杠仍能识别', () => {
        expect(推断供应商('https://api.openai.com/v1/')).toBe('openai');
        expect(推断供应商('https://api.deepseek.com/v1/')).toBe('deepseek');
    });

    it('非字符串类型输入不崩溃', () => {
        expect(推断供应商(123)).toBe('openai');
        expect(推断供应商({})).toBe('openai');
        expect(推断供应商(true)).toBe('openai');
    });
});

// 2026-06-03：补充核心函数测试

import type { 单接口配置结构 } from '../models/system';
import type { 当前可用接口结构 } from './apiConfig';
// 接口设置结构 在 utils/apiConfig.ts 中已通过函数签名隐式提供，不需要单独 import

// 测试用：补全单接口配置必填字段
const mkConfig = (overrides: Partial<单接口配置结构>): 单接口配置结构 => ({
    id: 'a', 名称: 'a', 供应商: 'openai',
    baseUrl: 'https://x', apiKey: 'k', model: 'gpt-4',
    createdAt: 1, updatedAt: 1,
    ...overrides,
});

describe('创建空接口设置', () => {
    it('返回默认空结构', () => {
        const empty = 创建空接口设置();
        expect(empty.activeConfigId).toBeNull();
        expect(empty.configs).toEqual([]);
        expect(empty.功能模型占位).toBeDefined();
    });

    it('每次调用返回新对象（不共享引用）', () => {
        const a = 创建空接口设置();
        const b = 创建空接口设置();
        expect(a).not.toBe(b);
        a.activeConfigId = 'test';
        expect(b.activeConfigId).toBeNull();
    });
});

describe('获取当前接口配置', () => {
    it('空设置返回 null', () => {
        const settings = 创建空接口设置();
        expect(获取当前接口配置(settings)).toBeNull();
    });

    it('activeConfigId 不存在时 fallback 到 configs[0]', () => {
        const settings = 创建空接口设置();
        settings.configs = [mkConfig({ id: 'a' })];
        const current = 获取当前接口配置(settings);
        expect(current).not.toBeNull();
        expect(current?.id).toBe('a');
    });

    it('返回 active config 的简化结构', () => {
        const settings = 创建空接口设置();
        settings.configs = [mkConfig({ id: 'a', 名称: 'configA', 供应商: 'gemini', model: 'gemini-2.0-flash' })];
        settings.activeConfigId = 'a';
        const current = 获取当前接口配置(settings);
        expect(current).not.toBeNull();
        expect(current?.id).toBe('a');
        expect(current?.model).toBe('gemini-2.0-flash');
    });
});

describe('获取主剧情接口配置', () => {
    it('空设置返回 null', () => {
        expect(获取主剧情接口配置(创建空接口设置())).toBeNull();
    });

    it('有 active config 且有 model 时返回主剧情配置', () => {
        const settings = 创建空接口设置();
        settings.configs = [mkConfig({ id: 'main', model: 'gpt-4o' })];
        settings.activeConfigId = 'main';
        const result = 获取主剧情接口配置(settings);
        expect(result).not.toBeNull();
        expect(result?.model).toBe('gpt-4o');
    });
});

describe('接口配置是否可用', () => {
    it('null 返回 false', () => {
        expect(接口配置是否可用(null)).toBe(false);
    });

    it('缺少 apiKey 返回 false', () => {
        expect(接口配置是否可用({
            id: 'a', 名称: 'a', 供应商: 'openai', baseUrl: 'https://x', apiKey: '', model: 'gpt-4',
        } as 当前可用接口结构)).toBe(false);
    });

    it('缺少 model 返回 false', () => {
        expect(接口配置是否可用({
            id: 'a', 名称: 'a', 供应商: 'openai', baseUrl: 'https://x', apiKey: 'k', model: '',
        } as 当前可用接口结构)).toBe(false);
    });

    it('完整 openai 配置返回 true', () => {
        expect(接口配置是否可用({
            id: 'a', 名称: 'a', 供应商: 'openai', baseUrl: 'https://x', apiKey: 'k', model: 'gpt-4',
        } as 当前可用接口结构)).toBe(true);
    });
});
