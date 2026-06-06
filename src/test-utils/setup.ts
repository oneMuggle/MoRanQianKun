/**
 * Vitest 全局 setup 文件。
 *
 * 2026-06-06 Phase 5 Day 46：
 * - 加载 jest-dom 匹配器
 * - 自动注入 fake-indexeddb
 * - 启动 MSW 拦截 fetch（如项目未用 msw，注释掉相关行即可）
 */
import '@testing-library/jest-dom/vitest';
import 'fake-indexeddb/auto';
import { afterAll, afterEach, beforeAll } from 'vitest';
import { server } from './mocks/msw-handlers';

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
