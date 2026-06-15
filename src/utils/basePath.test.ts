/**
 * basePath — 多平台 base path 工具测试
 *
 * TDD 来源：docs/plans/2026-06-15_yishijie-borrow-plan.md B2 + B3
 * 目标：
 * - B2: 提供 import.meta.env 标准注入的解析
 * - B3: 多平台 base path 自动适配（GH Pages / CF Pages / Vercel / 默认）
 */
import { describe, it, expect } from 'vitest';
import { resolveBasePath, type PlatformEnv } from './basePath';

describe('resolveBasePath — 显式覆盖优先', () => {
    it('VITE_BASE_PATH 显式设置时优先使用', () => {
        expect(resolveBasePath({ VITE_BASE_PATH: '/custom/' })).toBe('/custom/');
    });

    it('VITE_BASE_PATH 显式设为 "/"', () => {
        expect(resolveBasePath({ VITE_BASE_PATH: '/' })).toBe('/');
    });
});

describe('resolveBasePath — 平台自动检测', () => {
    it('GitHub Pages（GH_PAGES=true + GITHUB_REPOSITORY=owner/repo）→ /<repo>/', () => {
        expect(resolveBasePath({
            GH_PAGES: 'true',
            GITHUB_REPOSITORY: 'owner/MoRanJiangHu',
        })).toBe('/MoRanJiangHu/');
    });

    it('Cloudflare Pages（CF_PAGES=true）→ /', () => {
        expect(resolveBasePath({ CF_PAGES: 'true' })).toBe('/');
    });

    it('Vercel（VERCEL=true）→ /', () => {
        expect(resolveBasePath({ VERCEL: 'true' })).toBe('/');
    });

    it('Electron / Capacitor（IS_NATIVE=true）→ ./', () => {
        expect(resolveBasePath({ IS_NATIVE: 'true' })).toBe('./');
    });
});

describe('resolveBasePath — 优先级与边界', () => {
    it('多个平台标志都设时优先级：VITE_BASE_PATH > CF_PAGES > VERCEL > GH_PAGES', () => {
        expect(resolveBasePath({
            GH_PAGES: 'true',
            GITHUB_REPOSITORY: 'owner/repo',
            CF_PAGES: 'true',
        })).toBe('/');
    });

    it('GH_PAGES=true 但无 GITHUB_REPOSITORY → 兜底 /', () => {
        expect(resolveBasePath({ GH_PAGES: 'true' })).toBe('/');
    });

    it('无任何环境变量 → 兜底 /', () => {
        expect(resolveBasePath({})).toBe('/');
    });
});

describe('PlatformEnv 类型', () => {
    it('所有字段都是可选 string', () => {
        const env: PlatformEnv = {};
        expect(env.VITE_BASE_PATH).toBeUndefined();
    });
});
