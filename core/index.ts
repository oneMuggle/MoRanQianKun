/**
 * 核心骨架入口
 *
 * 导出所有核心层模块：
 * - types: 基础类型定义
 * - engine: 模块加载器、Prompt 注册中心
 * - module-registry: UI 功能模块注册表
 * - api: AI 客户端
 * - db: 数据库服务
 *
 * 注意：核心层不依赖任何业务模块（modules/）。
 */

// 类型
export type {
  ModuleManifest,
  ModuleContext,
  ModuleLoaderOptions,
  ModuleLifecycleState,
  ModuleCategory,
  ModuleVisibility,
  UIFeatureModule,
  ModalConfig,
  ModalPropsContext,
  ModalManagerAPI,
  GameState,
  ModuleLoadResult,
  ModuleRegistrySummary,
} from './types';

// 引擎
export { ModuleLoader, getModuleLoader, resetModuleLoader } from './engine';
export { PromptRegistry } from './engine';

// 模块注册表
export { UIFeatureRegistry, ModalRenderer } from './module-registry';

// AI 客户端
export {
  请求模型文本,
  规范化文本补全消息链,
  是否DeepSeek接口配置,
  替换COT伪装身份占位,
  提取OpenAI完整文本,
  从Markdown图片中提取DataUrl,
  读取失败详情文本,
  协议请求错误,
} from './api';

export type {
  通用消息,
  通用消息角色,
  响应格式类型,
  通用流式选项,
} from './api';

// 数据库
export * from './db';
