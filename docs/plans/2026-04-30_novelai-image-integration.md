# NovelAI 图片生成集成计划

**日期**: 2026-04-30
**状态**: 已完成
**目标**: 验证并记录 NovelAI 图片生成后端的完整集成

---

## NovelAI API 规格

| 项目 | 内容 |
|------|------|
| 端点 | `POST /ai/generate-image` |
| 认证 | `Authorization: Bearer <API_KEY>` |
| 请求格式 | JSON (input, model, action, parameters) |
| 响应格式 | ZIP 压缩包含 PNG/JPEG 或直接图片 |

---

## 已实现功能

### Phase 1: 类型系统 ✅

- [x] `models/system.ts` — `接口供应商类型` 包含 `'novelai'`
- [x] `models/system.ts` — `文生图后端类型` 包含 `'novelai'`
- [x] `models/system.ts` — `文生图预设接口路径类型` 包含 `'novelai_generate'`

### Phase 2: API 配置 ✅

- [x] `utils/apiConfig.ts` — NovelAI 后端识别
- [x] `utils/apiConfig.ts` — NovelAI 默认端点 `/ai/generate-image`
- [x] `utils/apiConfig.ts` — 需要鉴权处理
- [x] `utils/apiConfigNormalization.ts` — 配置标准化

### Phase 3: 核心实现 ✅

- [x] `services/ai/image/backends.ts` — `构建NovelAI请求体` 函数
- [x] `services/ai/image/backends.ts` — `执行NovelAI生图` 函数
- [x] `services/ai/image/backends.ts` — `解析NovelAI图片响应` 函数
- [x] V4 模型支持 (nai-diffusion-4*)
- [x] V4 Prompt Structure 支持 (use_coords, use_order, legacy_uc)
- [x] SMEA/Dynamic Thresholding 等高级参数

### Phase 4: 开发代理 ✅

- [x] `vite.config.ts` — NovelAI dev proxy 中间件
- [x] `scripts/novelai-proxy.ps1` — PowerShell 代理脚本

### Phase 5: 设置界面 ✅

- [x] `components/features/Settings/ImageGenerationSettings.tsx` — NovelAI 后端选项
- [x] 预设接口路径 `/ai/generate-image`

---

## 验证清单

### 类型系统
- [x] `文生图后端类型` 包含 `'novelai'`
- [x] `文生图预设接口路径类型` 包含 `'novelai_generate'`

### API 配置
- [x] `推断可用连接` 识别 novelai 后端
- [x] `构建图片端点` 支持 novelai_generate 预设
- [x] `构建生图请求头` 处理 novelai 鉴权

### 核心功能
- [x] `构建NovelAI请求体` 正确构建 v3/v4 参数
- [x] `执行NovelAI生图` 发送请求并处理响应
- [x] `解析NovelAI图片响应` 处理 ZIP 和直接图片格式

### UI 集成
- [x] ImageGenerationSettings 显示 NovelAI 选项
- [x] 后端切换正常工作

### 开发工具
- [x] Vite dev proxy 正确转发到 image.novelai.net
- [x] PowerShell 代理脚本存在

---

## 技术细节

### NovelAI 请求体结构

```typescript
{
  input: prompt,
  model: "nai-diffusion-4-5-full",
  action: "generate",
  parameters: {
    params_version: 3,
    width: 1024,
    height: 1024,
    scale: 5,
    sampler: "k_euler_ancestral",
    steps: 28,
    n_samples: 1,
    ucPreset: 0,
    qualityToggle: true,
    sm: false,
    sm_dyn: false,
    dynamic_thresholding: false,
    controlnet_strength: 1,
    legacy: false,
    add_original_image: false,
    legacy_v3_extend: false,
    prompt: prompt,
    noise_schedule: "karras"
  }
}
```

### V4 模型额外参数

```typescript
v4_prompt: {
  use_coords: boolean,
  use_order: boolean,
  caption: {
    base_caption: prompt,
    char_captions: []
  },
  legacy_uc: boolean
}
```

---

## 进度记录

| 时间 | 阶段 | 状态 | 备注 |
|------|------|------|------|
| 2026-04-30 | Phase 1 | ✅ 完成 | 类型系统已验证 |
| 2026-04-30 | Phase 2 | ✅ 完成 | API 配置已验证 |
| 2026-04-30 | Phase 3 | ✅ 完成 | 核心实现已验证 |
| 2026-04-30 | Phase 4 | ✅ 完成 | 开发代理已验证 |
| 2026-04-30 | Phase 5 | ✅ 完成 | UI 集成已验证 |

---

## 结论

NovelAI 图片生成后端已在 `services/ai/image/backends.ts` 中完整实现，UI 集成在 `ImageGenerationSettings.tsx`，开发代理在 `vite.config.ts` 中配置。系统支持：

1. 标准 NovelAI v3 API
2. NovelAI v4 模型 (nai-diffusion-4*)
3. V4 Prompt Structure (coords, order, legacy_uc)
4. 高级参数 (SMEA, Dynamic Thresholding, CFG Rescale 等)
5. ZIP 压缩包和直接图片响应格式
