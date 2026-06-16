# Phase 5 — 测试体系补齐实施计划

> **创建日期**：2026-06-06
> **状态**：已批准（spec `docs/superpowers/specs/2026-06-06-project-optimization-roadmap-v2-design.md`）
> **父路线图**：[2026-06-06-project-optimization-roadmap-v2-design](../../superpowers/specs/2026-06-06-project-optimization-roadmap-v2-design.md)
> **前置依赖**：
>   - [Phase 2 — TypeScript 严格度分层](./2026-06-06_phase2-ts-strict-layered.md)（已闭环）
>   - [Phase 3 — 大文件拆分](./2026-06-06_phase3-large-file-split.md)（已闭环）
> **工期**：Day 46-60（15 天）
> **目标**：测试覆盖率 < 5% → ≥ 30%，关键路径 ≥ 60%；T1 纯函数 ≥ 80%，T2/T3 服务与工作流 ≥ 60%，T4 关键组件 ≥ 30%

---

## 背景与目标

### 背景

项目当前测试状态：
- **测试文件 ~22 个**，主要集中在 `photographyNSFW/` 和 `utils/`
- **测试覆盖率 < 5%**
- 大量 `hooks/useGame/` 子工作流（60+ 文件）无测试覆盖
- 18 个 NSFW 子系统、useGame 顶层、prompts/runtime 几乎裸奔
- `ts-prune` 暴露的死代码无法安全清理（无测试保证）
- 重构风险：Phase 2 strict + Phase 3 拆分后无 safety net 兜底

### 目标

1. **Day 60 末**全项目覆盖率 ≥ 30%
2. **T1 纯函数**（`utils/` + `models/` 计算）≥ 80%
3. **T2 服务层**（`services/ai/text/` + `dbService/`）≥ 60%
4. **T3 工作流**（`hooks/useGame/` 子工作流）≥ 60%
5. **T4 关键组件**（`App.tsx` 路由、`NewGameWizard`、`Chat`）≥ 30%
6. CI test + coverage job 绿，coverage 下降则 fail
7. 提供 5 个测试样板（happy/error/loading/empty/retry）供团队复用
8. 内部技术分享：Day 46 安排 1 天 Vitest + msw 培训

### 范围外（测试禁区）

避免给仍在流动的代码写废测试：

- ❌ 18 个 NSFW 子系统内部逻辑（场景太多，回报低）
- ❌ `useGame.ts` 顶层 hook 整合测试（依赖链太深）
- ❌ `prompts/runtime/*`（AI 输出，断言易碎）
- ❌ `dbService.ts` 顶层入口（仅测拆出的 `dbService/save-archive.ts` 等子模块）

---

## 涉及文件

### 新建

| 文件 | 用途 |
|---|---|
| `vitest.config.ts` | Vitest 配置（已存在则扩展） |
| `src/test-utils/setup.ts` | 全局测试 setup（fake-indexeddb、msw 启动） |
| `src/test-utils/renderWithProviders.tsx` | 组件测试 wrapper（含 store、theme） |
| `src/test-utils/mocks/msw-handlers.ts` | msw handlers（AI 客户端 mock） |
| `src/test-utils/mocks/indexeddb.ts` | fake-indexeddb 包装 |
| `src/test-utils/mocks/ai-client.ts` | AI 客户端 mock fixture |
| `docs/technical/11b-test-templates.md` | 5 个测试样板文档 |
| `.github/workflows/test-coverage.yml` | CI 测试 + coverage job |

### 修改

| 文件 | 变更 |
|---|---|
| `package.json` | 新增 `test:unit` / `test:coverage` / `test:changed` 脚本 |
| `package.json` | 新增 `@testing-library/react`、`@testing-library/jest-dom`、`msw`、`fake-indexeddb` 等 devDependencies |
| `tsconfig.json` | 加 `vitest.config.ts` 到 include（已通过 tsconfig.vitest.json） |
| `docs/technical/11-testing-strategy.md` | 更新测试样板与覆盖率阶梯图 |

### 测试文件（按 T1-T4 分层产出）

| 层级 | 数量 | 位置 |
|---|---|---|
| T1 纯函数 | ~15 个 `.test.ts` | `utils/**/*.test.ts`、`models/**/*.test.ts` |
| T2 服务层 | ~10 个 `.test.ts` | `services/ai/text/**/*.test.ts`、`dbService/**/*.test.ts` |
| T3 工作流 | ~12 个 `.test.ts` | `hooks/useGame/**/*.test.ts` |
| T4 关键组件 | ~5 个 `.test.tsx` | `components/**/__tests__/*.test.tsx` |

---

## 技术方案

### 测试架构

```
vitest.config.ts（已存在则扩展）
├─ src/test-utils/setup.ts
│   ├─ jest-dom matchers
│   ├─ fake-indexeddb/auto
│   └─ msw server start/stop
├─ src/test-utils/renderWithProviders.tsx
│   └─ <Providers>（含 store、theme、router）
├─ src/test-utils/mocks/
│   ├─ msw-handlers.ts（AI 端点）
│   ├─ indexeddb.ts（db schema fixture）
│   └─ ai-client.ts（mock LLM response）
└─ 各层测试文件
```

### 测试金字塔

| 层级 | 目标对象 | 目标覆盖率（终态） | 工具 | 工期 |
|---|---|---|---|---|
| **T1 纯函数** | `utils/**`、`models/**`（纯类型与计算） | 80% | Vitest | Day 46-48 |
| **T2 服务层** | `services/ai/text/**`、`dbService/` 抽象层 | 60% | Vitest + msw + fake-indexeddb | Day 49-52 |
| **T3 工作流** | `hooks/useGame/` 子工作流（sendWorkflow、memoryRecall、saveCoordinator） | 60% | Vitest + renderHook | Day 53-56 |
| **T4 关键组件** | `App.tsx` 路由、`NewGameWizard`、`Chat` 主组件 | 30% | @testing-library/react | Day 57-60 |

### 5 个测试样板

| 样板 | 适用场景 | 关键模式 |
|---|---|---|
| **happy** | 正常路径 | AAA + 简单 input/output 断言 |
| **error** | 异常路径 | `expect(...).rejects.toThrow()` + 错误码断言 |
| **loading** | 异步加载 | `findBy*` async query + 等待元素出现 |
| **empty** | 空数据 | `expect(arr).toEqual([])` + nullish 检查 |
| **retry** | 重试机制 | `vi.useFakeTimers()` + 多次 await + 计数器断言 |

### Milestone Gate

- **Day 48 末**：T1 覆盖率 ≥ 50%（纯函数好写）
- **Day 52 末**：T2 覆盖率 ≥ 30%
- **Day 56 末**：T3 覆盖率 ≥ 40%
- **Day 60 末**：全项目 ≥ 30%，T1+T2+T3 加权 ≥ 50%

### 配置 v8 coverage threshold 渐进

```ts
// vitest.config.ts（关键片段）
coverage: {
  provider: 'v8',
  reporter: ['text', 'html', 'json-summary', 'lcov'],
  include: ['**/*.{ts,tsx}'],
  exclude: [
    'node_modules/',
    'dist/',
    '**/*.test.{ts,tsx}',
    '**/__tests__/**',
    '**/test-utils/**',
    '**/mocks/**',
    '**/migrations/**',
    'modules/era-*/**/index.ts',  // NSFW 子系统入口
  ],
  thresholds: {
    // Day 46: 0%（基线）
    // Day 48: lines 5
    // Day 52: lines 10
    // Day 56: lines 15
    // Day 60: lines 20
    lines: 20,
    functions: 20,
    branches: 15,
    statements: 20,
  },
}
```

### 与 Phase 2/3 衔接

- **P2 strict 类型系统**：测试 setup 文件的 `tsconfig` 走 `tsconfig.vitest.json`（strict）
- **P3 拆分边界**：T2 测试直接对应 `dbService/` 子模块，T1 测试直接对应 `models/system/` 子文件
- **测试 stability**：所有 mock 必须 deterministic（不依赖真实 AI、网络、IndexedDB 时序）

---

## 实施步骤

> 步骤粒度遵循 writing-plans skill：每步 2-5 分钟，可独立验证，可提交。

### Day 46：基础测试设施 + 技术分享

- [ ] **Step 1：上午：内部技术分享**

1 天脱产培训：
- Vitest 基本 API（describe/it/expect/beforeEach/vi.mock）
- @testing-library/react 渲染与查询
- msw handler 编写
- fake-indexeddb fixture
- 5 个样板演示（happy/error/loading/empty/retry）

- [ ] **Step 2：下午：安装依赖**

```bash
npm install -D @testing-library/react @testing-library/jest-dom @testing-library/user-event msw fake-indexeddb
```

- [ ] **Step 3：创建 `src/test-utils/setup.ts`**

```ts
// src/test-utils/setup.ts
import '@testing-library/jest-dom/vitest';
import 'fake-indexeddb/auto';
import { afterAll, afterEach, beforeAll } from 'vitest';
import { server } from './mocks/msw-handlers';

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

- [ ] **Step 4：创建 `src/test-utils/mocks/msw-handlers.ts`**

```ts
// src/test-utils/mocks/msw-handlers.ts
import { http, HttpResponse } from 'msw';

export const handlers = [
  // AI 客户端 OpenAI-compatible 端点
  http.post('*/v1/chat/completions', () => {
    return HttpResponse.json({
      id: 'mock-completion',
      object: 'chat.completion',
      created: Date.now(),
      model: 'mock-model',
      choices: [{
        index: 0,
        message: { role: 'assistant', content: '{"status":"ok","data":{}}' },
        finish_reason: 'stop',
      }],
      usage: { prompt_tokens: 10, completion_tokens: 10, total_tokens: 20 },
    });
  }),
];

export const server = setupServer(...handlers);

import { setupServer } from 'msw/node';
```

- [ ] **Step 5：更新 `vitest.config.ts`**

```ts
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test-utils/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json-summary', 'lcov'],
      include: ['**/*.{ts,tsx}'],
      exclude: [
        'node_modules/',
        'dist/',
        '**/*.test.{ts,tsx}',
        '**/__tests__/**',
        '**/test-utils/**',
        '**/mocks/**',
        'modules/era-*/**/index.ts',
      ],
      thresholds: { lines: 0, functions: 0, branches: 0, statements: 0 },
    },
  },
});
```

- [ ] **Step 6：跑一个 sanity test**

```ts
// src/test-utils/setup.test.ts
import { describe, it, expect } from 'vitest';

describe('test setup', () => {
  it('fake-indexeddb works', () => {
    expect(typeof indexedDB).toBe('object');
  });
});
```

```bash
npx vitest run src/test-utils/setup.test.ts
```

预期：PASS。

- [ ] **Step 7：补 `package.json` 脚本**

```json
{
  "scripts": {
    "test:unit": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "test:changed": "vitest run --changed",
    "test:layer": "vitest run --coverage --coverage.include='${LAYER_PATTERN}'"
  }
}
```

- [ ] **Step 8：提交**

```bash
git add package.json vitest.config.ts src/test-utils/
git commit -m "test(infra): 测试基础设施搭建（vitest + msw + fake-indexeddb + 5 样板）"
```

### Day 47-48：T1 纯函数测试（目标 50%）

#### Day 47：utils/ 测试

- [ ] **Step 1：写 `utils/calculations.test.ts`（happy 样板）**

```ts
// utils/calculations.test.ts
import { describe, it, expect } from 'vitest';
import { calculateCombatPower, calculateQiyun } from './calculations';

describe('calculateCombatPower', () => {
  it('returns 0 for empty stats', () => {
    expect(calculateCombatPower({ str: 0, dex: 0, int: 0 })).toBe(0);
  });

  it('sums stats correctly', () => {
    expect(calculateCombatPower({ str: 10, dex: 20, int: 30 })).toBe(60);
  });

  it('handles negative stats gracefully', () => {
    expect(calculateCombatPower({ str: -5, dex: 10, int: 10 })).toBe(15);
  });
});
```

- [ ] **Step 2：跑测试**

```bash
npx vitest run utils/calculations.test.ts
```

预期：PASS。

- [ ] **Step 3：写 `utils/validators.test.ts`（error 样板）**

```ts
// utils/validators.test.ts
import { describe, it, expect } from 'vitest';
import { validateApiKey, validateEraId } from './validators';

describe('validateApiKey', () => {
  it('accepts non-empty string', () => {
    expect(() => validateApiKey('sk-abc123')).not.toThrow();
  });

  it('rejects empty string', () => {
    expect(() => validateApiKey('')).toThrow('API key cannot be empty');
  });

  it('rejects non-string', () => {
    // @ts-expect-error testing invalid input
    expect(() => validateApiKey(123)).toThrow('API key must be string');
  });
});
```

- [ ] **Step 4：跑测试**

```bash
npx vitest run utils/validators.test.ts
```

预期：PASS。

- [ ] **Step 5：批量写其他 `utils/*.test.ts`**

按以下顺序：
- `utils/format.test.ts`（happy）
- `utils/parseJson.test.ts`（error + retry）
- `utils/hash.test.ts`（happy）
- `utils/random.test.ts`（happy）
- `utils/storage.test.ts`（error + empty）

- [ ] **Step 6：跑 utils 全部测试 + 测覆盖率**

```bash
npx vitest run --coverage utils/
```

预期：utils 覆盖率 ≥ 60%。

- [ ] **Step 7：提交**

```bash
git add utils/*.test.ts
git commit -m "test(utils): 写 utils 纯函数测试（happy/error/retry 样板）"
```

#### Day 48：models/ 测试 + 提升 threshold

- [ ] **Step 1：写 `models/system/api-config.test.ts`**

```ts
// models/system/api-config.test.ts
import { describe, it, expect } from 'vitest';
import { normalizeApiConfig, getDefaultApiConfig } from './api-config';

describe('normalizeApiConfig', () => {
  it('fills missing fields with defaults', () => {
    const result = normalizeApiConfig({ provider: 'openai', apiKey: 'sk-abc' });
    expect(result.baseUrl).toBe('https://api.openai.com/v1');
  });

  it('preserves user-provided values', () => {
    const result = normalizeApiConfig({
      provider: 'openai',
      apiKey: 'sk-abc',
      baseUrl: 'https://custom.proxy/v1',
    });
    expect(result.baseUrl).toBe('https://custom.proxy/v1');
  });
});

describe('getDefaultApiConfig', () => {
  it('returns valid default', () => {
    const dflt = getDefaultApiConfig();
    expect(dflt.provider).toBeTruthy();
    expect(dflt.apiKey).toBe('');
  });
});
```

- [ ] **Step 2：写 `models/system/game-config.test.ts`**

类似样板，覆盖 `启用NSFW模式` 默认值、`难度等级` 枚举校验等。

- [ ] **Step 3：写 `models/system/memory-config.test.ts`**

覆盖 `上下文窗口` 数值范围、`记忆衰减` 系数等。

- [ ] **Step 4：批量写其他 `models/system/*.test.ts`**

- `models/system/ui-settings.test.ts`
- `models/system/visual-config.test.ts`
- `models/system/types.test.ts`（brand type 校验）

- [ ] **Step 5：跑全部 models 测试 + 测覆盖率**

```bash
npx vitest run --coverage models/
```

预期：models 覆盖率 ≥ 70%。

- [ ] **Step 6：提升 vitest threshold**

修改 `vitest.config.ts`：
```ts
thresholds: { lines: 5, functions: 5, branches: 5, statements: 5 },
```

- [ ] **Step 7：跑全量覆盖率**

```bash
npm run test:coverage
```

预期：全项目 ≥ 5%。T1 加权 ≥ 50%。

- [ ] **Step 8：提交（Day 48 收口）**

```bash
git add models/system/*.test.ts vitest.config.ts
git commit -m "test(models): 写 models/system 纯类型与计算测试（T1 覆盖率 ≥ 50%）"
```

### Day 49-52：T2 服务层测试（目标 30%）

#### Day 49：services/ai/text/ 测试（loading 样板）

- [ ] **Step 1：写 `services/ai/text/chatCompletionClient.test.ts`（loading 样板）**

```ts
// services/ai/text/chatCompletionClient.test.ts
import { describe, it, expect, vi } from 'vitest';
import { chatCompletion } from './chatCompletionClient';
import { server } from '../../../src/test-utils/mocks/msw-handlers';
import { http, HttpResponse } from 'msw';

describe('chatCompletion', () => {
  it('returns parsed response on success', async () => {
    const result = await chatCompletion({
      baseUrl: 'https://mock.api/v1',
      apiKey: 'mock-key',
      model: 'mock-model',
      messages: [{ role: 'user', content: 'hello' }],
    });
    expect(result.choices[0].message.content).toContain('status');
  });

  it('retries on 429', async () => {
    let attempts = 0;
    server.use(
      http.post('*/v1/chat/completions', () => {
        attempts++;
        if (attempts < 3) {
          return new HttpResponse(null, { status: 429 });
        }
        return HttpResponse.json({
          choices: [{ message: { role: 'assistant', content: 'retry ok' } }],
        });
      })
    );
    const result = await chatCompletion({ /* config */ });
    expect(attempts).toBe(3);
    expect(result.choices[0].message.content).toBe('retry ok');
  });
});
```

- [ ] **Step 2：跑测试**

```bash
npx vitest run services/ai/text/chatCompletionClient.test.ts
```

预期：PASS（msw handler 拦截实际 fetch）。

- [ ] **Step 3：写 `services/ai/text/jsonParser.test.ts`（error 样板）**

覆盖 AI 返回的 JSON 解析、repair、错误处理。

- [ ] **Step 4：跑测试**

预期：PASS。

- [ ] **Step 5：写 `services/ai/text/streamHandler.test.ts`（retry 样板）**

覆盖流式响应的中断、重连。

- [ ] **Step 6：跑测试**

预期：PASS。

- [ ] **Step 7：提交**

```bash
git add services/ai/text/*.test.ts
git commit -m "test(ai-client): 写 AI 文本客户端测试（loading/error/retry 样板）"
```

#### Day 50-51：dbService/ 测试

- [ ] **Step 1：写 `dbService/save-archive.test.ts`（happy + empty 样板）**

```ts
// dbService/save-archive.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { saveArchive, loadArchive, listArchives, deleteArchive } from './save-archive';
import { initDB } from './schema';

describe('saveArchive', () => {
  beforeEach(async () => {
    await initDB();
  });

  it('saves and loads archive round-trip', async () => {
    const data = { id: 'test-1', character: { name: '测试' }, era: 'ancient' };
    await saveArchive(data);
    const loaded = await loadArchive('test-1');
    expect(loaded).toEqual(data);
  });

  it('returns empty list when no archives', async () => {
    const list = await listArchives();
    expect(list).toEqual([]);
  });
});

describe('deleteArchive', () => {
  it('removes archive by id', async () => {
    await saveArchive({ id: 'to-delete', /* ... */ });
    await deleteArchive('to-delete');
    const loaded = await loadArchive('to-delete');
    expect(loaded).toBeNull();
  });
});
```

- [ ] **Step 2：跑测试**

```bash
npx vitest run dbService/save-archive.test.ts
```

预期：PASS（fake-indexeddb 提供 IndexedDB）。

- [ ] **Step 3：写 `dbService/image-assets.test.ts`**

覆盖图片资产存取、按 hash 查找、清理孤立。

- [ ] **Step 4：写 `dbService/transactions.test.ts`**

覆盖事务封装、错误回滚。

- [ ] **Step 5：写 `dbService/stores.test.ts`**

覆盖通用 CRUD 边界（空 store、重复 id、超大记录）。

- [ ] **Step 6：跑 dbService 全部测试 + 测覆盖率**

```bash
npx vitest run --coverage dbService/
```

预期：dbService 覆盖率 ≥ 50%。

- [ ] **Step 7：提交（Day 51 收口）**

```bash
git add dbService/*.test.ts
git commit -m "test(db): 写 dbService 子模块测试（happy/empty/error 样板）"
```

#### Day 52：services/ai/image/ + T2 收口

- [ ] **Step 1：写 `services/ai/image/imageGenerationClient.test.ts`**

覆盖 imageGen 客户端的请求、响应、错误。

- [ ] **Step 2：写 `services/ai/image/imageStorage.test.ts`**

覆盖图片存到 IndexedDB、按 hash 查重。

- [ ] **Step 3：提升 vitest threshold**

```ts
thresholds: { lines: 10, functions: 10, branches: 8, statements: 10 },
```

- [ ] **Step 4：跑全量覆盖率**

```bash
npm run test:coverage
```

预期：T2 覆盖率 ≥ 30%。

- [ ] **Step 5：提交（Day 52 收口）**

```bash
git add services/ai/image/*.test.ts vitest.config.ts
git commit -m "test(ai-image): 写 AI 图像服务测试 + T2 收口（覆盖率 ≥ 30%）"
```

### Day 53-56：T3 工作流测试（目标 40%）

#### Day 53：sendWorkflow 测试

- [ ] **Step 1：写 `hooks/useGame/sendWorkflow.test.ts`（happy + loading 样板）**

```ts
// hooks/useGame/sendWorkflow.test.ts
import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { sendWorkflow } from './sendWorkflow';
import { Providers } from '../../../src/test-utils/renderWithProviders';
import { server } from '../../../src/test-utils/mocks/msw-handlers';
import { http, HttpResponse } from 'msw';

describe('sendWorkflow', () => {
  it('sends user input and receives AI response', async () => {
    server.use(
      http.post('*/v1/chat/completions', () => {
        return HttpResponse.json({
          choices: [{
            message: { role: 'assistant', content: '故事继续...' },
          }],
        });
      })
    );

    const { result } = renderHook(() => sendWorkflow(), { wrapper: Providers });
    await act(async () => {
      await result.current.send('玩家行动');
    });
    expect(result.current.lastResponse).toContain('故事继续');
  });

  it('handles AI error gracefully', async () => {
    server.use(
      http.post('*/v1/chat/completions', () => {
        return new HttpResponse(null, { status: 500 });
      })
    );
    const { result } = renderHook(() => sendWorkflow(), { wrapper: Providers });
    await act(async () => {
      await result.current.send('玩家行动');
    });
    expect(result.current.error).toBeTruthy();
    expect(result.current.error.code).toBe('AI_SERVER_ERROR');
  });
});
```

- [ ] **Step 2：创建 `src/test-utils/renderWithProviders.tsx`**

```ts
// src/test-utils/renderWithProviders.tsx
import { ReactNode } from 'react';
import { ThemeProvider } from '../components/theme/ThemeProvider';
import { StoreProvider } from '../store/StoreProvider';

export const Providers = ({ children }: { children: ReactNode }) => (
  <StoreProvider>
    <ThemeProvider>
      {children}
    </ThemeProvider>
  </StoreProvider>
);
```

- [ ] **Step 3：跑测试**

```bash
npx vitest run hooks/useGame/sendWorkflow.test.ts
```

预期：PASS。

- [ ] **Step 4：提交**

```bash
git add hooks/useGame/sendWorkflow.test.ts src/test-utils/renderWithProviders.tsx
git commit -m "test(sendWorkflow): 写故事请求工作流测试（happy/loading/error 样板）"
```

#### Day 54：memoryRecall + memoryUtils

- [ ] **Step 1：写 `hooks/useGame/memoryRecall.test.ts`**

覆盖记忆检索、相关性排序、上下文窗口。

- [ ] **Step 2：写 `hooks/useGame/memoryUtils.test.ts`**

覆盖记忆摘要、衰减、合并。

- [ ] **Step 3：写 `hooks/useGame/memoryWrite.test.ts`**

覆盖记忆写入、去重、压缩。

- [ ] **Step 4：跑测试**

```bash
npx vitest run hooks/useGame/memory*.test.ts
```

预期：PASS。

- [ ] **Step 5：提交**

```bash
git add hooks/useGame/memory*.test.ts
git commit -m "test(memory): 写记忆系统工作流测试（happy/empty 样板）"
```

#### Day 55：saveCoordinator + openingStory

- [ ] **Step 1：写 `hooks/useGame/saveCoordinator.test.ts`**

覆盖存档编排：自动保存、手动保存、冲突合并。

- [ ] **Step 2：写 `hooks/useGame/openingStoryWorkflow.test.ts`**

覆盖开局故事生成：每个纪元的初始 prompt 组装。

- [ ] **Step 3：写 `hooks/useGame/worldGenerationWorkflow.test.ts`**

覆盖世界生成：变量生成、初始世界状态。

- [ ] **Step 4：跑测试**

```bash
npx vitest run hooks/useGame/{saveCoordinator,openingStoryWorkflow,worldGenerationWorkflow}.test.ts
```

预期：PASS。

- [ ] **Step 5：提交**

```bash
git add hooks/useGame/saveCoordinator.test.ts hooks/useGame/openingStoryWorkflow.test.ts hooks/useGame/worldGenerationWorkflow.test.ts
git commit -m "test(workflow): 写存档/开局/世界生成工作流测试（happy/error 样板）"
```

#### Day 56：T3 收口

- [ ] **Step 1：批量写其他高 ROI 子工作流测试**

- `hooks/useGame/systemPromptBuilder.test.ts`
- `hooks/useGame/bodyPolish.test.ts`
- `hooks/useGame/worldEvolutionWorkflow.test.ts`

- [ ] **Step 2：提升 vitest threshold**

```ts
thresholds: { lines: 15, functions: 15, branches: 12, statements: 15 },
```

- [ ] **Step 3：跑全量覆盖率**

```bash
npm run test:coverage
```

预期：T3 覆盖率 ≥ 40%。

- [ ] **Step 4：提交（Day 56 收口）**

```bash
git add hooks/useGame/*.test.ts vitest.config.ts
git commit -m "test(workflow): T3 工作流测试收口（覆盖率 ≥ 40%）"
```

### Day 57-60：T4 关键组件测试（目标 30%）+ CI + 文档

#### Day 57：App.tsx 路由测试

- [ ] **Step 1：写 `App.test.tsx`（路由切换）**

```tsx
// App.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';

describe('App routing', () => {
  it('renders home view by default', () => {
    render(<MemoryRouter><App /></MemoryRouter>);
    expect(screen.getByText(/墨染乾坤/)).toBeInTheDocument();
  });

  it('navigates to new game view', () => {
    render(<MemoryRouter initialEntries={['/new-game']}><App /></MemoryRouter>);
    expect(screen.getByText(/新建游戏/)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2：跑测试**

```bash
npx vitest run App.test.tsx
```

预期：PASS。

- [ ] **Step 3：提交**

```bash
git add App.test.tsx
git commit -m "test(app): 写 App 路由测试（happy 样板）"
```

#### Day 58：NewGameWizard + Chat 组件

- [ ] **Step 1：写 `components/features/NewGame/__tests__/NewGameWizard.test.tsx`**

覆盖：选择纪元、选择角色、确认开局。

- [ ] **Step 2：写 `components/features/Chat/__tests__/Chat.test.tsx`**

覆盖：消息渲染、用户输入、AI 响应显示。

- [ ] **Step 3：跑测试**

```bash
npx vitest run components/features/{NewGame,Chat}/__tests__/
```

预期：PASS。

- [ ] **Step 4：提交**

```bash
git add components/features/NewGame/__tests__/ components/features/Chat/__tests__/
git commit -m "test(component): 写 NewGameWizard + Chat 组件测试（happy 样板）"
```

#### Day 59：CI 集成 + 文档

- [ ] **Step 1：创建 `.github/workflows/test-coverage.yml`**

```yaml
name: test-coverage
on:
  pull_request:
    branches: [main]
  push:
    branches: [main]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - name: Run unit tests
        run: npm run test:unit
      - name: Run coverage
        run: npm run test:coverage
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/lcov.info
          fail_ci_if_error: true
```

- [ ] **Step 2：跑全量覆盖率**

```bash
npm run test:coverage
```

预期：全项目 ≥ 25%。

- [ ] **Step 3：写 `docs/technical/11b-test-templates.md`**

包含 5 个测试样板（happy/error/loading/empty/retry）的完整代码 + 说明。

- [ ] **Step 4：更新 `docs/technical/11-testing-strategy.md`**

新增章节"Phase 5 测试体系补齐"：
- T1-T4 分层规则
- 覆盖率阶梯（30% → 50% → 80%）
- 测试禁区与原则
- 与 P2/P3 衔接

- [ ] **Step 5：提交**

```bash
git add .github/workflows/test-coverage.yml docs/technical/11-testing-strategy.md docs/technical/11b-test-templates.md
git commit -m "feat(ci): 测试 + coverage CI job + 测试样板与策略文档"
```

#### Day 60：最终验证 + 文档归档

- [ ] **Step 1：提升 vitest threshold 到 Day 60 目标**

```ts
thresholds: { lines: 20, functions: 20, branches: 15, statements: 20 },
```

- [ ] **Step 2：跑全量验证**

```bash
npm run test:coverage
npx tsc --noEmit
npm run build
```

预期：全绿。

- [ ] **Step 3：测量最终覆盖率**

```bash
npm run test:coverage
```

预期：
- 全项目 ≥ 30%
- T1（utils+models）≥ 80%
- T2（services）≥ 60%
- T3（hooks/useGame 子工作流）≥ 60%
- T4（关键组件）≥ 30%

- [ ] **Step 4：跑全量 Playwright（与 Phase 3 验证矩阵合并）**

```bash
npx playwright test
```

预期：全通过。

- [ ] **Step 5：手动回归 4 场景 × 7 纪元**

- 开局
- 故事推进
- 存档读档
- 跨纪元跳转

- [ ] **Step 6：提交（Day 60 收口）**

```bash
git add vitest.config.ts
git commit -m "test: Phase 5 收口（覆盖率 ≥ 30%，T1-T4 全部达标）"
```

- [ ] **Step 7：编写并归档 60 天总验收报告**

新建 `docs/technical/14-optimization-roadmap-v2.md`：
- 60 天实施回顾
- 3 阶段 KPI 达成情况
- 周报汇总
- 下轮 P1/P4/P6 建议

```bash
git add docs/technical/14-optimization-roadmap-v2.md
git commit -m "docs(technical): 归档 60 天项目优化路线图 v2.0 实施报告"
```

---

## 验收标准（P5 完成）

- [ ] 全项目覆盖率 ≥ 30%
- [ ] T1（utils+models）≥ 80%
- [ ] T2（services）≥ 60%
- [ ] T3（hooks/useGame 子工作流）≥ 60%
- [ ] T4（关键组件）≥ 30%
- [ ] CI test + coverage job 绿，coverage 下降则 fail
- [ ] `docs/technical/11-testing-strategy.md` 更新测试样板与覆盖率阶梯图
- [ ] `docs/technical/11b-test-templates.md` 5 个测试样板文档就位
- [ ] 团队 Day 46 技术分享完成（≥ 80% 参与率）
- [ ] 测试禁区（NSFW 18 个 + useGame 顶层 + prompts/runtime）未被测试污染
- [ ] `npm run test:changed` 在 PR 阶段 < 60s 跑完
- [ ] `docs/technical/14-optimization-roadmap-v2.md` 60 天实施报告归档

---

## 风险与依赖

| ID | 风险 | 等级 | 缓解 |
|---|---|---|---|
| R1 | 测试 AI 流式响应时断言易碎 | MEDIUM | 用 snapshot + 关键字段断言（`status`/`error.code`/`metadata`），不断言完整文本 |
| R2 | 全量测试时间过长（> 5min），拖慢 PR | MEDIUM | PR 阶段只跑 `vitest --changed`；main merge 前跑全量；测试按域分 4 个 sharded job |
| R3 | 团队对 Vitest + msw 不熟，前期产能低 | MEDIUM | Day 46 安排 1 天内部技术分享；准备 5 个测试样板（happy/error/loading/empty/retry） |
| R4 | fake-indexeddb 与真 IndexedDB 行为差异（事务边界、游标） | LOW | 重点路径（save-archive）配 Playwright e2e 兜底 |
| R5 | T4 组件测试 mock 状态管理复杂 | MEDIUM | `renderWithProviders` 提供统一 wrapper；状态用 zustand 测试 store |
| R6 | coverage threshold 提升太快，CI 反复 fail | LOW | 渐进提升（每周末 +5%），预留 1 周缓冲 |
| R7 | 测试写在流动代码上（Phase 2 strict 仍在修） | MEDIUM | 测试与 strict 修复分 2 周 phase：Day 46-50 只写不动 strict 影响小的 utils/services；Day 51 后再补 hooks/components |

### 依赖

- **强依赖**：Phase 2 strict（已完成）、Phase 3 拆分（已完成）
- **新增 devDependencies**：`@testing-library/react`、`@testing-library/jest-dom`、`@testing-library/user-event`、`msw`、`fake-indexeddb`
- **现有工具**：Vitest（Phase 0 已装）、Playwright（已配）
- **团队**：15 天需要 1-2 人持续投入，Day 46 培训 1 天

---

## 与下一轮衔接

- **下轮 P1 文档归一化**：本计划产生的 `docs/technical/14-optimization-roadmap-v2.md` 60 天报告需在文档归一化阶段并入 README 章节目录
- **下轮 P4 循环依赖解耦**：T3 工作流测试可作为 P4 重构的安全网
- **下轮 P6 错误边界**：T2 服务层测试为错误处理统一提供基础
- **持续**：覆盖率 ≥ 30% 应作为下轮 60 天的"红线"，任何 PR 引入 < 30% 必须拒绝

---

## 参考文档

- 父路线图：[2026-06-06-project-optimization-roadmap-v2-design](../../superpowers/specs/2026-06-06-project-optimization-roadmap-v2-design.md)
- v1.0 总体路线图：[2026-06-03-project-optimization](../2026-06-03-project-optimization.md)
- 前置：Phase 2 — TS 严格度分层：[2026-06-06_phase2-ts-strict-layered](./2026-06-06_phase2-ts-strict-layered.md)
- 前置：Phase 3 — 大文件拆分：[2026-06-06_phase3-large-file-split](./2026-06-06_phase3-large-file-split.md)
- 测试策略（已存在）：[11-testing-strategy](../../technical/11-testing-strategy.md)
- 性能与模块化（已闭环）：[13b-performance-modularization](../../technical/13b-performance-modularization.md)
- State 模块化：[02-state-modularization](../../technical/02-state-modularization.md)
- 错误处理：[12-error-handling](../../technical/12-error-handling.md)
- 项目规则：`/home/fz/.claude/rules/common/testing.md`（TDD/AAA 模式 + 80% 覆盖率要求）
