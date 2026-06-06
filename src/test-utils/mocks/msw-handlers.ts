/**
 * MSW mock handlers for testing HTTP calls (chat completions, image generation, etc).
 *
 * 2026-06-06 Phase 5 Day 46: 基础测试基础设施。
 * 默认提供 OpenAI 兼容协议的 chat completions mock。
 * 各具体测试套件可通过 server.use(...handlers) 添加自定义 handler。
 */
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

export const mockChatCompletion = (
    content: unknown = { status: 'ok', data: {} }
): HttpResponse => HttpResponse.json({
    id: 'mock-completion',
    object: 'chat.completion',
    created: Date.now(),
    model: 'mock-model',
    choices: [{
        index: 0,
        message: { role: 'assistant', content: typeof content === 'string' ? content : JSON.stringify(content) },
        finish_reason: 'stop',
    }],
    usage: { prompt_tokens: 10, completion_tokens: 10, total_tokens: 20 },
});

export const handlers = [
    http.post('*/v1/chat/completions', () => mockChatCompletion()),
    http.post('*/v1/images/generations', () => HttpResponse.json({
        created: Date.now(),
        data: [{ url: 'https://example.com/mock.png' }],
    })),
];

export const server = setupServer(...handlers);
