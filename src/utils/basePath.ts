/**
 * basePath — 多平台 base path 工具
 *
 * 来源：docs/plans/2026-06-15_yishijie-borrow-plan.md B2 + B3
 * 目标：
 * - B2: 适配 import.meta.env 标准注入（运行时）
 * - B3: 多平台 base path 自动适配（GH Pages / CF Pages / Vercel / 默认）
 */

export type PlatformEnv = {
    /** 显式覆盖（最高优先级） */
    VITE_BASE_PATH?: string;
    /** GitHub Actions 部署到 GitHub Pages */
    GH_PAGES?: string;
    GITHUB_REPOSITORY?: string;
    /** Cloudflare Pages */
    CF_PAGES?: string;
    /** Vercel */
    VERCEL?: string;
    /** Electron / Capacitor（file:// 协议） */
    IS_NATIVE?: string;
};

/**
 * 解析多平台 base path
 * @param env 平台环境变量
 * @returns base path 字符串（必须以 / 开头或为 .）
 */
export function resolveBasePath(env: PlatformEnv): string {
    // 1) 显式覆盖
    if (env.VITE_BASE_PATH && env.VITE_BASE_PATH.length > 0) {
        return env.VITE_BASE_PATH;
    }

    // 2) Native (Electron / Capacitor)
    if (env.IS_NATIVE === 'true') {
        return './';
    }

    // 3) Cloudflare Pages
    if (env.CF_PAGES === 'true') {
        return '/';
    }

    // 4) Vercel
    if (env.VERCEL === 'true') {
        return '/';
    }

    // 5) GitHub Pages：从 GITHUB_REPOSITORY 解析 repo 名
    if (env.GH_PAGES === 'true' && env.GITHUB_REPOSITORY) {
        const repo = env.GITHUB_REPOSITORY.split('/').pop();
        if (repo) {
            return `/${repo}/`;
        }
    }

    // 6) 兜底
    return '/';
}
