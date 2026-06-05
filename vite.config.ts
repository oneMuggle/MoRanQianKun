import path from 'path';
import fs from 'fs';
import { spawn } from 'child_process';
import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

const R2_CDN_BASE = 'https://mrqk.cc.cd';

/** Injects <script>window.__R2_CDN_BASE__</script> into index.html (idempotent) */
const r2CdnPlugin = (): Plugin => ({
  name: 'r2-cdn-inject',
  transformIndexHtml(html) {
    if (html.includes('__R2_CDN_BASE__')) return html; // already injected
    return html.replace(
      /<\/head>/,
      `<script>\n  window.__R2_CDN_BASE__ = '${R2_CDN_BASE}';\n</script>\n</head>`
    );
  }
});

const PWSH_PATH = 'C:\\Program Files\\PowerShell\\7\\pwsh.exe';
const PWSH_EXECUTABLE = fs.existsSync(PWSH_PATH) ? PWSH_PATH : 'pwsh';
const NOVELAI_PROXY_SCRIPT = path.resolve(__dirname, 'scripts/novelai-proxy.ps1');

const 读取请求体 = async (req: NodeJS.ReadableStream): Promise<Buffer> => {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
};

const 执行NovelAI代理请求 = async (
  url: string,
  method: string,
  headers: Record<string, string>,
  body: Buffer
): Promise<{ status: number; headers: Record<string, string>; body: Buffer }> => {
  const output = await new Promise<string>((resolve, reject) => {
    const child = spawn(PWSH_EXECUTABLE, [
      '-NoProfile',
      '-ExecutionPolicy',
      'Bypass',
      '-File',
      NOVELAI_PROXY_SCRIPT
    ], {
      stdio: ['ignore', 'pipe', 'pipe'],
      env: {
        ...process.env,
        NOVELAI_PROXY_URL: url,
        NOVELAI_PROXY_METHOD: method.toUpperCase(),
        NOVELAI_PROXY_HEADERS: JSON.stringify(headers),
        NOVELAI_PROXY_BODY: body.length ? body.toString('base64') : ''
      }
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (chunk) => {
      stdout += chunk.toString('utf8');
    });

    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString('utf8');
    });

    child.on('error', reject);
    child.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(stderr.trim() || `NovelAI 代理进程退出异常: ${code}`));
        return;
      }
      const normalized = stdout.trim();
      if (!normalized) {
        reject(new Error(stderr.trim() || 'NovelAI 代理未返回任何内容'));
        return;
      }
      resolve(normalized);
    });
  });

  const parsed = JSON.parse(output) as { status: number; headers: Record<string, string>; bodyBase64: string };
  return {
    status: parsed.status,
    headers: parsed.headers || {},
    body: parsed.bodyBase64 ? Buffer.from(parsed.bodyBase64, 'base64') : Buffer.alloc(0)
  };
};

const novelAiDevProxyPlugin = (): Plugin => ({
  name: 'novelai-dev-proxy',
  configureServer(server) {
    server.middlewares.use('/api/novelai', async (req, res, next) => {
      if (!req.url) {
        next();
        return;
      }

      try {
        const body = await 读取请求体(req);
        const targetUrl = `https://image.novelai.net${req.url}`;
        const headers: Record<string, string> = {};

        for (const [key, value] of Object.entries(req.headers)) {
          if (typeof value === 'string') {
            headers[key] = value;
          }
        }

        const result = await 执行NovelAI代理请求(targetUrl, req.method || 'POST', headers, body);
        res.statusCode = result.status;
        Object.entries(result.headers).forEach(([key, value]) => {
          if (key.toLowerCase() === 'content-length') return;
          res.setHeader(key, value);
        });
        res.end(result.body);
      } catch (error: any) {
        server.config.logger.error(`[novelai-dev-proxy] ${error?.message || error}`);
        res.statusCode = 502;
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.end(JSON.stringify({
          error: 'NovelAI dev proxy failed',
          detail: error?.message || String(error)
        }));
      }
    });
  }
});

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  const isGitHubPages = process.env.GITHUB_PAGES === 'true';
  return {
    base: isGitHubPages ? '/MoRanJiangHu/' : '/',
    server: {
      port: 3000,
      host: '0.0.0.0'
    },
    plugins: [react(), novelAiDevProxyPlugin(), r2CdnPlugin()],
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
    },
    build: {
      chunkSizeWarningLimit: 700,
      rollupOptions: {
        output: {
          manualChunks(id) {
            const normalizedId = id.replace(/\\/g, '/');
 
            if (normalizedId.includes('/node_modules/')) {
              if (normalizedId.includes('/react/') || normalizedId.includes('/react-dom/') ||
                  normalizedId.includes('/scheduler/')) {
                return 'react-vendor';
              }
              if (normalizedId.includes('/fflate/')) {
                return 'fflate-vendor';
              }
              if (normalizedId.includes('/@google/genai/') || normalizedId.includes('/openai/') ||
                  normalizedId.includes('/@anthropic-ai/')) {
                return 'ai-sdk-vendor';
              }
              if (normalizedId.includes('/zustand/')) {
                return 'state-vendor';
              }
              return 'vendor-misc';
            }
 
            // 时代模块拆分（按需加载）
            // 2026-06-03：modules/era-* 已删除（重复 models/eraTheme/*），保留配置以防未来恢复
            if (normalizedId.includes('/modules/era-')) {
              const match = normalizedId.match(/\/modules\/era-([a-z-]+)\//);
              if (match) return `era-${match[1]}`;
            }

            // NSFW 模块拆分（按需加载）
            // 2026-06-03：nsfw-* 仍存在但 0 引用方（与 era 同性质），配置暂时保留
            if (normalizedId.includes('/modules/nsfw-')) {
              const match = normalizedId.match(/\/modules\/nsfw-([a-z-]+)\//);
              if (match) return `nsfw-${match[1]}`;
            }

            // 业务域模块拆分（按需加载）
            // 2026-06-03：biz-* 仍存在但 0 引用方，配置暂时保留
            if (normalizedId.includes('/modules/biz-')) {
              const match = normalizedId.match(/\/modules\/biz-([a-z-]+)\//);
              if (match) return `biz-${match[1]}`;
            }

            // 阶段 1.2：拆分原 game-runtime 为 5 块
            // 已知风险：prompts → models → useGame 存在循环 import
            // 通过把使用方/被使用方精确分配到不同 chunk 规避 ESM TDZ
            // 拆分顺序：prompts-core 优先匹配（避免被 runtime 抢先），再 prompts-runtime，再 models，再 ai-clients，最后 useGame-runtime

            // 1. prompts 核心（变化频率低，可被浏览器长期缓存）
            if (normalizedId.includes('/prompts/core/') || normalizedId.includes('/prompts/writing/')) {
              return 'prompts-core';
            }
            // 2. 运行时提示词（每个 NSFW 子系统不同，体积分散）
            if (normalizedId.includes('/prompts/runtime/')) {
              return 'prompts-runtime';
            }
            // 3. 阶段 3.x：修复 models ↔ useGame 循环 import 导致的 TDZ
            //    某些 models/* 文件（import hooks/useGame/ 中的基类/引擎）若被打到
            //    models-types chunk，会在 useGame-runtime chunk 初始化前触发 TDZ。
            //    必须在 /models/ 通用规则之前精确匹配，路由到 useGame-runtime。
            //    已知循环源（手工白名单，新增时务必先确认 import 图）：
            //    - models/contemporary/barNSFW/engine.ts extends BaseEngine
            //    - models/outdoorNSFW/index.ts 重导出 hooks/useGame/nsfw/outdoorNSFWEngine
            if (
              normalizedId.endsWith('/models/contemporary/barNSFW/engine.ts') ||
              normalizedId.endsWith('/models/outdoorNSFW/index.ts')
            ) {
              return 'useGame-runtime';
            }
            // 4. 模型类型定义独立
            if (normalizedId.includes('/models/')) {
              return 'models-types';
            }
            // 5. AI 客户端独立
            if (normalizedId.includes('/services/ai/')) {
              return 'ai-clients';
            }
            // 5a. useGame/nsfw 子分组（阶段 P2：进一步拆分 sendWorkflow 子树）
            //    这些 NSFW 文件位于 useGame/nsfw/ 下，但都是叶子模块（仅 import 类型），
            //    通过提前匹配可避免被 useGame-runtime 兜底吞掉，体积更分散、可懒加载。
            //    必须放在 /hooks/useGame/ 通配规则之前。
            if (normalizedId.includes('/hooks/useGame/nsfw/')) {
              // 5a.1 写真系统（Integration + Engine + Workflow + Leak）
              if (
                normalizedId.endsWith('/nsfw/photographyNSFWIntegration.ts') ||
                normalizedId.endsWith('/nsfw/photographyNSFWEngine.ts') ||
                normalizedId.endsWith('/nsfw/photographyShootWorkflow.ts') ||
                normalizedId.endsWith('/nsfw/photographyLeakWorkflow.ts')
              ) {
                return 'usegame-nsfw-photography';
              }
              // 5a.2 都市网约车系统（Integration + Engine）
              if (
                normalizedId.endsWith('/nsfw/urbanDriverNSFWIntegration.ts') ||
                normalizedId.endsWith('/nsfw/urbanDriverNSFWEngine.ts')
              ) {
                return 'usegame-nsfw-urban-driver';
              }
              // 5a.3 跨系统联动 + 精力管理 + 论坛引擎（合并为杂项块）
              //      注意：outdoorNSFWEngine 不可拆出 — 它与 models/outdoorNSFW/index.ts
              //      存在循环 import（models 重导出 outdoorNSFWEngine 的值，
              //      outdoorNSFWEngine 又 import models 的 const 数据），
              //      跨 chunk 拆分会触发 ESM TDZ 错误，必须留在 useGame-runtime。
              if (
                normalizedId.endsWith('/nsfw/crossSystemLinker.ts') ||
                normalizedId.endsWith('/nsfw/energyManagement.ts') ||
                normalizedId.endsWith('/nsfw/bdsmForumEngine.ts')
              ) {
                return 'usegame-nsfw-misc';
              }
              // 其余 NSFW 文件仍跟随 useGame-runtime
            }
            // 5c. useGame/image 动态加载工作流独立成块（阶段 P2）
            //     useGame.ts 通过 () => import('...') 动态加载这三个工作流，
            //     默认会被 /hooks/useGame/ 兜底规则吞回 useGame-runtime，
            //     必须显式提早匹配才能实现真正的代码分割与懒加载。
            if (
              normalizedId.endsWith('/hooks/useGame/image/npcImageWorkflow.ts') ||
              normalizedId.endsWith('/hooks/useGame/image/npcSecretImageWorkflow.ts') ||
              normalizedId.endsWith('/hooks/useGame/image/sceneImageWorkflow.ts')
            ) {
              return 'usegame-image-lazy';
            }
            // 5d. useGame/image 同步工作流（纯函数模块，无 React hook）合并独立成块
            //     这些工作流虽然被 useGame.ts 静态 import，但内部全是纯函数 + 类型，
            //     可通过 chunk 间静态边连接，把 ~30KB 体积从 useGame-runtime 切出去。
            //     ⚠ TDZ 风险点：
            //       - sceneImageArchiveWorkflow.ts 触发 'Je' before init（与 models-types
            //         及 utils/imageAssets 形成循环），故排除；
            //       - playerImageWorkflow / imageGenerationCoordinator 含跨 chunk
            //         re-export，保守起见也排除；
            //     最终只迁出真正叶子（仅 type-only import 或纯函数模块）：
            if (
              normalizedId.endsWith('/hooks/useGame/image/imagePresetWorkflow.ts') ||
              normalizedId.endsWith('/hooks/useGame/image/npcImageStateWorkflow.ts') ||
              normalizedId.endsWith('/hooks/useGame/image/sceneImageTriggerWorkflow.ts') ||
              normalizedId.endsWith('/hooks/useGame/image/manualImageActionsWorkflow.ts')
            ) {
              return 'usegame-image-core';
            }
            // 5b. useGame 主入口（兜底）
            if (normalizedId.includes('/hooks/useGame/') || normalizedId.endsWith('/hooks/useGame.ts')) {
              return 'useGame-runtime';
            }
            // 兜底：utils/promptFeatureToggles.ts 跟随 prompts-runtime（被 useGame 引用）
            if (normalizedId.endsWith('/utils/promptFeatureToggles.ts')) {
              return 'prompts-runtime';
            }

            if (normalizedId.includes('/components/features/Social/ImageManagerModal')) {
              return 'image-manager-desktop';
            }

            if (normalizedId.includes('/components/features/Social/mobile/MobileImageManagerModal')) {
              return 'image-manager-mobile';
            }

            if (normalizedId.includes('/components/features/Settings/SettingsPanel')) {
              return 'settings-unified-entry';
            }

            if (normalizedId.includes('/components/features/Settings/mobile/MobileSettingsModal')) {
              return 'settings-mobile-legacy';
            }

            if (normalizedId.includes('/components/features/Settings/SettingsModal')) {
              return 'settings-desktop-legacy';
            }

            // 阶段 1.3：拆分 settings-panels 为 api/image/nsfw/debug 四块
            // 必须在 settings-panels 通用规则之前（更具体的子目录先匹配）
            if (normalizedId.includes('/components/features/Settings/Api/')) {
              return 'settings-api';
            }
            if (normalizedId.includes('/components/features/Settings/Image/')) {
              return 'settings-image';
            }
            if (normalizedId.includes('/components/features/Settings/NSFW/')) {
              return 'settings-nsfw';
            }
            if (
              normalizedId.includes('/components/features/Settings/Debug/') ||
              normalizedId.includes('/components/features/Settings/MobileDebug/') ||
              normalizedId.includes('/components/features/Settings/ContextViewer/') ||
              normalizedId.includes('/components/features/Settings/HistoryViewer/')
            ) {
              return 'settings-debug';
            }

            if (normalizedId.includes('/components/features/Settings/')) {
              return 'settings-panels';
            }
          }
}
      }
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    }
  };
});
