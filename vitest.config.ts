/// <reference types="vitest" />
import path from 'path';
import { defineConfig as defineViteConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineViteConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname),
        },
    },
    // @ts-expect-error - vitest extends Vite config, 'test' property is valid at runtime
    test: {
        globals: true,
        environment: 'jsdom',
        include: ['**/*.test.ts', '**/*.test.tsx'],
        // 2026-06-08 Phase 5 CI 修复：
        // 1. __tests__/photographyNSFW/ 是 spec test 禁区（4 个文件导入已不存在的 hooks/useGame/photographyNSFW*）
        // 2. .opencode/node_modules/zod/ 是 zod 自带测试，vitest 误识别（node_modules/ 仅匹配根，不匹配嵌套）
        exclude: [
            '**/node_modules/**',
            '**/.opencode/**',
            'dist/',
            '**/__tests__/photographyNSFW/**',
        ],
        // 2026-06-06 Phase 5 Day 46：注入全局 setup（jest-dom + fake-indexeddb + msw）
        setupFiles: ['./src/test-utils/setup.ts'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'html', 'json-summary', 'lcov'],
            // 2026-06-08 Phase 5 Day 49-52：把 services/ 也纳入 coverage 范围
            // 写完 services 测试后 services 目标 ≥ 60%
            include: ['utils/**/*.ts', 'models/**/*.ts', 'services/**/*.ts'],
            exclude: [
                'node_modules/',
                'dist/',
                '**/*.test.{ts,tsx}',
                '**/__tests__/**',
                'src/test-utils/**',
                // NSFW 子系统（spec 禁区：18 个）
                'models/bdsmNSFW/**',
                'models/boardGameNSFW/**',
                'models/campusNSFW/**',
                'models/exposureNSFW/**',
                'models/npcNSFWEnhancement/**',
                'models/nsfwCore/**',
                'models/outdoorNSFW/**',
                'models/photographyNSFW/**',
                'utils/nsfwResourceOps.ts',
            ],
            thresholds: {
                // 2026-06-09 v2.1 Day 2 起步门槛：
                // 当前实测 14.78% statements / 15.21% lines / 14.5% functions / 8.63% branches
                // Day 22 末升到 20%，Day 42 末升到 25%
                lines: 10,
                functions: 10,
                branches: 8,
                statements: 10,
            }
        }
    },
});
