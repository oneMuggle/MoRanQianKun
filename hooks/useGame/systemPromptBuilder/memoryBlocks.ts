import { 规范化记忆配置, 格式化短期记忆展示文本 } from '../memory/memoryUtils';
import type { 记忆系统结构, 记忆配置结构 } from '../../../types';

export const 构建长期记忆文本 = (memoryData: 记忆系统结构, options?: { 禁用中期长期记忆?: boolean }): string => {
    if (options?.禁用中期长期记忆) return '';
    return `【长期记忆】\n${memoryData.长期记忆.join('\n') || '暂无'}`;
};

export const 构建中期记忆文本 = (memoryData: 记忆系统结构, options?: { 禁用中期长期记忆?: boolean }): string => {
    if (options?.禁用中期长期记忆) return '';
    return `【中期记忆】\n${memoryData.中期记忆.join('\n') || '暂无'}`;
};

export const 构建中长记忆上下文 = (memoryData: 记忆系统结构, options?: { 禁用中期长期记忆?: boolean }): string => {
    const 长期记忆 = 构建长期记忆文本(memoryData, options);
    const 中期记忆 = 构建中期记忆文本(memoryData, options);
    return [长期记忆, 中期记忆].filter(Boolean).join('\n');
};

export const 构建短期记忆上下文 = (
    memoryData: 记忆系统结构,
    memoryConfig: 记忆配置结构,
    options?: { 禁用短期记忆?: boolean }
): string => {
    if (options?.禁用短期记忆) return '';
    
    const normalizedMemoryConfig = 规范化记忆配置(memoryConfig);
    const shortMemoryInjectLimit = Math.max(1, Number(normalizedMemoryConfig.短期记忆阈值) || 30);
    
    const shortMemoryEntries = memoryData.短期记忆
        .slice(-shortMemoryInjectLimit)
        .map((item) => 格式化短期记忆展示文本(item))
        .filter(Boolean);
    
    if (shortMemoryEntries.length === 0) return '';
    
    return `【短期记忆】\n${shortMemoryEntries.join('\n')}`;
};

export const 构建记忆上下文 = (
    memoryData: 记忆系统结构,
    memoryConfig: 记忆配置结构,
    options?: { 禁用中期长期记忆?: boolean; 禁用短期记忆?: boolean }
): { 中长记忆上下文: string; 短期记忆上下文: string } => {
    return {
        中长记忆上下文: 构建中长记忆上下文(memoryData, options),
        短期记忆上下文: 构建短期记忆上下文(memoryData, memoryConfig, options)
    };
};
