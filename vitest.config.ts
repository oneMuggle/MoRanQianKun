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
                // 2026-06-06 Phase 5 Day 46 起步门槛：0（Day 48 写完测试后提升到 50%）
                lines: 0,
                functions: 0,
                branches: 0,
                statements: 0,
            }
        }
    },
});
