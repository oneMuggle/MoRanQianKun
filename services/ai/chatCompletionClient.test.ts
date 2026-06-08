/**
 * services/ai/chatCompletionClient.test.ts
 *
 * Day 51：chatCompletionClient 纯函数测试
 * 覆盖：提取OpenAI完整文本 / 从Markdown图片中提取DataUrl
 */
import { describe, it, expect } from 'vitest';
import {
    提取OpenAI完整文本,
    从Markdown图片中提取DataUrl,
} from './chatCompletionClient';

describe('提取OpenAI完整文本', () => {
    it('标准字符串 content', () => {
        const payload = {
            choices: [{ message: { content: 'hello' } }],
        };
        expect(提取OpenAI完整文本(payload)).toBe('hello');
    });

    it('content 数组（text 字段）', () => {
        const payload = {
            choices: [{ message: { content: [{ text: 'part1' }, { text: 'part2' }] } }],
        };
        expect(提取OpenAI完整文本(payload)).toBe('part1\npart2');
    });

    it('content 数组（content 字段）', () => {
        const payload = {
            choices: [{ message: { content: [{ content: 'inline' }] } }],
        };
        expect(提取OpenAI完整文本(payload)).toBe('inline');
    });

    it('content 数组（字符串项）', () => {
        const payload = {
            choices: [{ message: { content: ['a', 'b'] } }],
        };
        expect(提取OpenAI完整文本(payload)).toBe('a\nb');
    });

    it('空 choices 返回空字符串', () => {
        expect(提取OpenAI完整文本({ choices: [] })).toBe('');
        expect(提取OpenAI完整文本({})).toBe('');
        expect(提取OpenAI完整文本(null)).toBe('');
    });

    it('undefined content 返回空字符串', () => {
        const payload = { choices: [{ message: {} }] };
        expect(提取OpenAI完整文本(payload)).toBe('');
    });

    it('content 数组跳过空项', () => {
        const payload = {
            choices: [{ message: { content: [{ text: 'a' }, null, { text: '' }, { text: 'b' }] } }],
        };
        expect(提取OpenAI完整文本(payload)).toBe('a\nb');
    });
});

describe('从Markdown图片中提取DataUrl', () => {
    it('标准 markdown 图片语法', () => {
        const md = '![alt](data:image/png;base64,abc)';
        expect(从Markdown图片中提取DataUrl(md)).toBe('data:image/png;base64,abc');
    });

    it('直接 dataUrl（无 markdown 包裹）', () => {
        const url = 'data:image/jpeg;base64,/9j/abc';
        expect(从Markdown图片中提取DataUrl(url)).toBe(url);
    });

    it('混合文本中的 markdown 图片', () => {
        const md = '前面文字 ![](data:image/png;base64,xyz) 后面文字';
        expect(从Markdown图片中提取DataUrl(md)).toBe('data:image/png;base64,xyz');
    });

    it('空字符串返回空', () => {
        expect(从Markdown图片中提取DataUrl('')).toBe('');
        expect(从Markdown图片中提取DataUrl('   ')).toBe('');
    });

    it('无图片返回空', () => {
        expect(从Markdown图片中提取DataUrl('普通文本')).toBe('');
    });

    it('非图片 dataUrl 不匹配', () => {
        const url = 'data:text/plain;base64,aGVsbG8=';
        expect(从Markdown图片中提取DataUrl(url)).toBe('');
    });

    it('base64 字符串去除空白', () => {
        const url = 'data:image/png;base64,abc\ndef  ghi';
        const result = 从Markdown图片中提取DataUrl(url);
        expect(result).not.toContain('\n');
        expect(result).not.toContain(' ');
    });
});
