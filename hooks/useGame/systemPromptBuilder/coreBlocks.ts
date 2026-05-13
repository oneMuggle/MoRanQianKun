const 格式化展示上下文 = <T,>(value: T): T => {
    if (Array.isArray(value)) {
        return value.map((item, index) => {
            const formatted = 格式化展示上下文(item);
            if (formatted && typeof formatted === 'object' && !Array.isArray(formatted)) {
                return {
                    [`[${index}]`]: index,
                    ...(formatted as Record<string, unknown>)
                };
            }
            return formatted;
        }) as T;
    }
    if (!value || typeof value !== 'object') return value;
    const entries = Object.entries(value as Record<string, unknown>)
        .filter(([key]) => key !== '索引')
        .map(([key, child]) => [key, 格式化展示上下文(child)]);
    return Object.fromEntries(entries) as T;
};

const 序列化展示上下文 = (value: unknown): string => JSON.stringify(
    格式化展示上下文(value),
    null,
    2
).replace(
    /^(\s*)"(\[\\d+\])":\s*\d+,?$/gm,
    '$1"$2"'
);

const 树状上下文缩进 = (depth: number): string => '  '.repeat(depth);

const 树状上下文为空 = (value: unknown): boolean => {
    if (value == null) return true;
    if (typeof value === 'string') return value.trim().length <= 0;
    if (typeof value === 'number') return !Number.isFinite(value);
    if (typeof value === 'boolean') return false;
    if (Array.isArray(value)) {
        return value.every((item) => 树状上下文为空(item));
    }
    if (typeof value === 'object') {
        return Object.entries(value as Record<string, unknown>)
            .filter(([key]) => key !== '索引')
            .every(([, child]) => 树状上下文为空(child));
    }
    return false;
};

const 格式化树状上下文标量 = (value: unknown): string => {
    if (typeof value === 'string') return value.trim();
    if (typeof value === 'number') return Number.isFinite(value) ? String(value) : '';
    if (typeof value === 'boolean') return value ? '是' : '否';
    return '';
};

const 树状上下文对象摘要键 = [
    '标题',
    '事件名',
    '镜头标题',
    '阶段名',
    '分歧线名',
    '女主姓名',
    '姓名',
    '对象',
    '名称',
    '类型'
];

const 读取树状上下文对象摘要 = (
    value: Record<string, unknown>,
    index: number
): { key: string; label: string } => {
    for (const key of 树状上下文对象摘要键) {
        const text = 格式化树状上下文标量(value[key]);
        if (text) {
            return {
                key,
                label: `[${index}] ${key}: ${text}`
            };
        }
    }
    return {
        key: '',
        label: `[${index}]`
    };
};

const 追加树状上下文行 = (
    lines: string[],
    label: string,
    value: unknown,
    depth: number
) => {
    if (树状上下文为空(value)) return;
    const indent = 树状上下文缩进(depth);

    if (Array.isArray(value)) {
        const items = value.filter((item) => !树状上下文为空(item));
        if (items.length <= 0) return;
        const scalarArray = items.every((item) => (
            item == null
            || typeof item === 'string'
            || typeof item === 'number'
            || typeof item === 'boolean'
        ));
        if (scalarArray) {
            const text = items
                .map((item) => 格式化树状上下文标量(item))
                .filter(Boolean)
                .join('；');
            if (text) {
                lines.push(`${indent}${label}: ${text}`);
            }
            return;
        }
        lines.push(`${indent}${label}:`);
        items.forEach((item, index) => {
            if (item && typeof item === 'object' && !Array.isArray(item)) {
                const record = item as Record<string, unknown>;
                const summary = 读取树状上下文对象摘要(record, index);
                lines.push(`${树状上下文缩进(depth + 1)}- ${summary.label}`);
                Object.entries(record)
                    .filter(([key, child]) => key !== '索引' && key !== summary.key && !树状上下文为空(child))
                    .forEach(([key, child]) => {
                        追加树状上下文行(lines, key, child, depth + 2);
                    });
                return;
            }
            const text = 格式化树状上下文标量(item);
            if (text) {
                lines.push(`${树状上下文缩进(depth + 1)}- ${text}`);
            }
        });
        return;
    }

    if (value && typeof value === 'object') {
        const entries = Object.entries(value as Record<string, unknown>)
            .filter(([key, child]) => key !== '索引' && !树状上下文为空(child));
        if (entries.length <= 0) return;
        lines.push(`${indent}${label}:`);
        entries.forEach(([key, child]) => {
            追加树状上下文行(lines, key, child, depth + 1);
        });
        return;
    }

    const text = 格式化树状上下文标量(value);
    if (text) {
        lines.push(`${indent}${label}: ${text}`);
    }
};

const 序列化树状上下文 = (value: unknown): string => {
    const lines: string[] = [];
    if (value && typeof value === 'object' && !Array.isArray(value)) {
        Object.entries(value as Record<string, unknown>)
            .filter(([key, child]) => key !== '索引' && !树状上下文为空(child))
            .forEach(([key, child]) => {
                追加树状上下文行(lines, key, child, 0);
            });
        return lines.join('\n').trim();
    }
    追加树状上下文行(lines, '内容', value, 0);
    return lines.join('\n').trim();
};

export const 包装树状上下文 = (title: string, value: unknown): string => {
    const body = 序列化树状上下文(value);
    return `【${title}】\n${body || '无'}`;
};

const 剥离真实模式专项审计 = (content: string): string => {
    const source = typeof content === 'string' ? content : '';
    if (!source) return '';
    return source
        .replace(
            /\n### 真实模式（Real Mode）专项审计[\s\S]*?(?=\n### |\n## |\n<think>|\n<COT预思考协议>|$)/,
            '\n'
        )
        .replace(/\n{3,}/g, '\n\n')
        .trim();
};

export const 主剧情剥离提示词ID = new Set([
    'core_story',
    'core_heroine_plan',
    'core_heroine_plan_ntl',
    'core_heroine_plan_cot',
    'core_heroine_plan_cot_ntl',
    'stat_world_evo'
]);

export {
    格式化展示上下文,
    序列化展示上下文,
    树状上下文缩进,
    树状上下文为空,
    格式化树状上下文标量,
    读取树状上下文对象摘要,
    追加树状上下文行,
    序列化树状上下文,
    剥离真实模式专项审计
};
