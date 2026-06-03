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
        coverage: {
            provider: 'v8',
            reporter: ['text', 'html', 'json-summary'],
            // 2026-06-03 起步门槛：只对 utils/ 设最低门槛（5%）
            // 后续 Phase 5+ 渐进提升门槛
            include: ['utils/**/*.ts'],
            exclude: [
                'node_modules/',
                'dist/',
                '**/*.test.ts',
                '**/*.test.tsx',
                'utils/__tests__/**',
            ],
            thresholds: {
                // 2026-06-03 起步门槛：0（先建立 CI 机制，下个 Phase 提升到 5%）
                lines: 0,
                functions: 0,
                branches: 0,
                statements: 0,
            }
        }
    },
});
