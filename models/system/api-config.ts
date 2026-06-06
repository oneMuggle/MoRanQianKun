/**
 * models/system/api-config.ts
 *
 * Day 32: API 配置 + 默认值的子模块入口。
 *
 * 设计决策：API 类型的"权威定义源"是 `models/api-config.ts`（357 行，已存在），
 * 本文件作为薄薄的 re-export 桥，使 `models/system` 子目录保持一致结构。
 * 这样可以避免 API 类型在两处重复声明，并保留 `models/api-config.ts` 现有 import 路径。
 *
 * 历史背景：原 `models/system.ts` 内联了完整 API 类型（与 `models/api-config.ts` 重复），
 * 拆分后由本文件统一指向权威源；任何 API 类型修改请在 `models/api-config.ts` 中进行。
 */

export type {
    // provider/format types
    接口供应商类型,
    OpenAI兼容方案类型,
    请求协议覆盖类型,
    // image gen types
    图片响应格式类型,
    文生图后端类型,
    文生图接口路径模式类型,
    文生图预设接口路径类型,
    生图画风类型,
    NovelAI采样器类型,
    NovelAI噪点表类型,
    文生图接口配置结构,
    画师串预设适用范围类型,
    词组转化器提示词预设类型,
    角色锚点来源类型,
    图片词组序列化策略类型,
    画师串预设结构,
    词组转化器提示词预设结构,
    角色锚点特征结构,
    角色锚点结构,
    PNG画风预设来源类型,
    PNG解析参数结构,
    PNG画风预设结构,
    模型词组转化器预设结构,
    单接口配置结构,
    功能模型占位配置结构,
    接口设置结构,
} from './../api-config';
