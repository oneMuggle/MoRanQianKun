/**
 * AI 客户端层导出入口
 *
 * 从 services/ai 迁移而来，作为核心骨架的一部分。
 */
export {
  请求模型文本,
  规范化文本补全消息链,
  是否DeepSeek接口配置,
  替换COT伪装身份占位,
  提取OpenAI完整文本,
  从Markdown图片中提取DataUrl,
  读取失败详情文本,
  协议请求错误,
} from './chatCompletionClient';
export type {
  通用消息,
  通用消息角色,
  响应格式类型,
  通用流式选项,
} from './chatCompletionClient';
