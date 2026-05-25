import { describe, it, expect } from 'vitest';
import { eraTree, allEraNodes, getEraById, getEraPath, resolveEraNode, 时代主题方案列表, 获取时代主题方案 } from './assembly';
import type { EraNode } from './types';

const REQUIRED_COLOR_KEYS: (keyof NonNullable<EraNode['colors']>)[] = [
    'ink-black', 'ink-gray', 'primary', 'primary-dark', 'secondary', 'accent', 'paper-white',
];

const REQUIRED_PROMPT_KEYS: (keyof NonNullable<EraNode['promptVars']>)[] = [
    '社会形态', '科技水平', '力量体系', '叙事视角', '描写重点', '对话占比',
];

const depth2Nodes = allEraNodes.filter((n) => n.depth === 2);
const depth1Nodes = allEraNodes.filter((n) => n.depth === 1);

describe('eraTree', () => {
    it('has a name', () => {
        expect(eraTree.name).toBe('墨染乾坤·时代体系');
    });

    it('has child epochs', () => {
        expect(eraTree.children.length).toBeGreaterThan(0);
    });

    it('each epoch has children (eras)', () => {
        for (const epoch of eraTree.children) {
            expect(Array.isArray(epoch.children)).toBe(true);
            expect(epoch.children!.length).toBeGreaterThan(0);
        }
    });
});

describe('allEraNodes', () => {
    it('is a flat array of all nodes', () => {
        expect(allEraNodes.length).toBeGreaterThan(eraTree.children.length);
    });

    it('includes nodes at all depths', () => {
        const depths = new Set(allEraNodes.map((n) => n.depth));
        expect(depths.has(0)).toBe(true);
        expect(depths.has(1)).toBe(true);
        expect(depths.has(2)).toBe(true);
    });

    it('all nodes have unique IDs', () => {
        const ids = allEraNodes.map((n) => n.id);
        const unique = new Set(ids);
        expect(ids.length).toBe(unique.size);
    });

    it('each node has an id, name, and depth', () => {
        for (const node of allEraNodes) {
            expect(typeof node.id).toBe('string');
            expect(typeof node.name).toBe('string');
            expect([0, 1, 2]).toContain(node.depth);
        }
    });
});

describe('getEraById', () => {
    it('finds an existing era by ID', () => {
        const first = allEraNodes[0];
        const result = getEraById(first.id);
        expect(result).toEqual(first);
    });

    it('returns undefined for non-existent ID', () => {
        expect(getEraById('nonexistent_era')).toBeUndefined();
    });

    it('resolves legacy ID mappings', () => {
        const result = getEraById('era_ancient_wuxia');
        expect(result).toBeDefined();
        expect(result!.id).toBe('ancient_eastern_wuxia');
    });

    it('resolves all known legacy IDs', () => {
        const legacyIds = [
            'era_ancient_wuxia',
            'era_republic_modern',
            'era_modern_urban',
            'era_cyberpunk_nearfuture',
            'era_scifi_future',
        ];
        for (const id of legacyIds) {
            const result = getEraById(id);
            expect(result).toBeDefined();
        }
    });
});

describe('getEraPath', () => {
    it('returns path from root to node', () => {
        const depth2Node = allEraNodes.find((n) => n.depth === 2)!;
        const path = getEraPath(depth2Node.id);
        expect(path.length).toBe(3);
        expect(path[0].depth).toBe(0);
        expect(path[1].depth).toBe(1);
        expect(path[2].depth).toBe(2);
        expect(path[2].id).toBe(depth2Node.id);
    });

    it('returns empty array for non-existent ID', () => {
        expect(getEraPath('nonexistent')).toEqual([]);
    });

    it('path for depth-1 node has 2 items', () => {
        const depth1Node = allEraNodes.find((n) => n.depth === 1)!;
        const path = getEraPath(depth1Node.id);
        expect(path.length).toBe(2);
        expect(path[0].depth).toBe(0);
        expect(path[1].depth).toBe(1);
    });
});

describe('resolveEraNode', () => {
    it('returns null for non-existent ID', () => {
        expect(resolveEraNode('nonexistent')).toBeNull();
    });

    it('resolves inherited metadata', () => {
        const depth2Node = allEraNodes.find((n) => n.depth === 2)!;
        const result = resolveEraNode(depth2Node.id);
        expect(result).not.toBeNull();
        expect(result!.node.id).toBe(depth2Node.id);
        expect(result!.inherited).toBeDefined();
        expect(result!.inherited.colors).toBeDefined();
        expect(result!.inherited.typography).toBeDefined();
        expect(result!.inherited.uiStyle).toBeDefined();
    });

    it('includes sources array', () => {
        const depth2Node = allEraNodes.find((n) => n.depth === 2)!;
        const result = resolveEraNode(depth2Node.id);
        expect(Array.isArray(result!.sources)).toBe(true);
    });

    it('node-only fields are accessible', () => {
        const depth2Node = allEraNodes.find((n) => n.depth === 2)!;
        const result = resolveEraNode(depth2Node.id);
        expect(result).toHaveProperty('inherited.openingScenes');
        expect(result).toHaveProperty('inherited.characterArchetypes');
        expect(result).toHaveProperty('inherited.writingSamples');
    });

    it('bgmTags defaults to empty array when not defined anywhere in path', () => {
        const depth2Node = allEraNodes.find((n) => n.depth === 2 && !n.bgmTags);
        if (depth2Node) {
            const result = resolveEraNode(depth2Node.id);
            expect(result!.inherited.bgmTags).toEqual([]);
        }
    });
});

describe('时代主题方案列表', () => {
    it('contains only depth-2 nodes', () => {
        for (const scheme of 时代主题方案列表) {
            const node = allEraNodes.find((n) => n.id === scheme.id);
            expect(node).toBeDefined();
            expect(node!.depth).toBe(2);
        }
    });

    it('each scheme has required fields', () => {
        for (const scheme of 时代主题方案列表) {
            expect(scheme.id).toBeDefined();
            expect(scheme.名称).toBeDefined();
            expect(scheme.描述).toBeDefined();
            expect(scheme.配色).toBeDefined();
            expect(scheme.字体).toBeDefined();
        }
    });

    it('配色 has all required color keys', () => {
        const colorKeys = ['ink-black', 'ink-gray', 'primary', 'primary-dark', 'secondary', 'accent', 'paper-white'];
        for (const scheme of 时代主题方案列表) {
            for (const key of colorKeys) {
                expect(scheme.配色[key as keyof typeof scheme.配色]).toBeDefined();
            }
        }
    });

    it('字体 has all required font keys', () => {
        const fontKeys = ['页面标题', '正文', '等宽'];
        for (const scheme of 时代主题方案列表) {
            for (const key of fontKeys) {
                expect(scheme.字体[key as keyof typeof scheme.字体]).toBeDefined();
            }
        }
    });
});

describe('获取时代主题方案', () => {
    it('finds a scheme by ID', () => {
        if (时代主题方案列表.length > 0) {
            const firstId = 时代主题方案列表[0].id;
            const result = 获取时代主题方案(firstId);
            expect(result).toBeDefined();
            expect(result!.id).toBe(firstId);
        }
    });

    it('returns undefined for non-existent ID', () => {
        expect(获取时代主题方案('nonexistent_era')).toBeUndefined();
    });

    it('returns undefined for depth-1 era (not in 方案列表)', () => {
        const depth1Node = allEraNodes.find((n) => n.depth === 1);
        if (depth1Node) {
            expect(获取时代主题方案(depth1Node.id)).toBeUndefined();
        }
    });
});

// ─── Data Integrity Tests (补充) ──────────────────────────────

describe('树形关系完整性', () => {
    it('depth-1 节点的 parentId 必须指向存在的 depth-0 节点', () => {
        const epochIds = eraTree.children.map((e) => e.id);
        for (const node of depth1Nodes) {
            expect(node.parent).not.toBeNull();
            expect(epochIds).toContain(node.parent);
        }
    });

    it('depth-2 节点的 parentId 必须指向存在的 depth-1 节点', () => {
        const eraIds = depth1Nodes.map((n) => n.id);
        for (const node of depth2Nodes) {
            expect(node.parent).not.toBeNull();
            expect(eraIds).toContain(node.parent);
        }
    });

    it('每个 depth-2 节点通过 getEraPath 能找到完整三层路径', () => {
        for (const node of depth2Nodes) {
            const path = getEraPath(node.id);
            expect(path.length).toBe(3);
            expect(path[0].depth).toBe(0);
            expect(path[1].depth).toBe(1);
            expect(path[2].depth).toBe(2);
            expect(path[2].id).toBe(node.id);
            expect(path[1].id).toBe(node.parent);
        }
    });
});

describe('SubEra 必填字段校验', () => {
    it('每个 SubEra 至少定义了 colors 或从祖先继承了 colors', () => {
        for (const node of depth2Nodes) {
            const resolved = resolveEraNode(node.id);
            expect(resolved).not.toBeNull();
            const colors = resolved!.inherited.colors;
            for (const key of REQUIRED_COLOR_KEYS) {
                expect(colors?.[key]).toBeDefined();
            }
        }
    });

    it('每个 SubEra 至少定义了 typography 或从祖先继承了 typography', () => {
        for (const node of depth2Nodes) {
            const resolved = resolveEraNode(node.id);
            expect(resolved).not.toBeNull();
            const typography = resolved!.inherited.typography;
            expect(typography?.['页面标题']).toBeDefined();
            expect(typography?.['正文']).toBeDefined();
            expect(typography?.['等宽']).toBeDefined();
        }
    });

    it('每个 SubEra 至少定义了 uiStyle 或从祖先继承了 uiStyle', () => {
        for (const node of depth2Nodes) {
            const resolved = resolveEraNode(node.id);
            expect(resolved).not.toBeNull();
            const uiStyle = resolved!.inherited.uiStyle;
            expect(uiStyle?.style).toBeDefined();
            expect(uiStyle?.tone).toBeDefined();
            expect(Array.isArray(uiStyle?.decorations)).toBe(true);
        }
    });

    it('每个 SubEra 至少定义了 promptVars 或从祖先继承了 promptVars', () => {
        for (const node of depth2Nodes) {
            const resolved = resolveEraNode(node.id);
            expect(resolved).not.toBeNull();
            const promptVars = resolved!.inherited.promptVars;
            for (const key of REQUIRED_PROMPT_KEYS) {
                expect(promptVars?.[key]).toBeDefined();
            }
        }
    });

    it('每个 SubEra 的 promptVars.禁忌 是数组', () => {
        for (const node of depth2Nodes) {
            const resolved = resolveEraNode(node.id);
            expect(resolved).not.toBeNull();
            const promptVars = resolved!.inherited.promptVars;
            expect(Array.isArray(promptVars?.禁忌)).toBe(true);
        }
    });
});

describe('颜色值有效性', () => {
    // Colors 可以是 hex (#fff) 或 RGB 字符串 ("255 255 255")
    const validColorRegex = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;
    const validRGBRegex = /^\d{1,3} \d{1,3} \d{1,3}$/;

    it('每个 SubEra 的 colors 值为合法色值或 RGB 串', () => {
        const failures: string[] = [];
        for (const node of depth2Nodes) {
            const resolved = resolveEraNode(node.id);
            const colors = resolved!.inherited.colors;
            for (const key of REQUIRED_COLOR_KEYS) {
                const val = colors?.[key];
                if (val && !validColorRegex.test(val) && !validRGBRegex.test(val)) {
                    failures.push(`${node.id}.${key} = "${val}"`);
                }
            }
        }
        expect(failures).toEqual([]);
    });
});

describe('继承覆盖完整性', () => {
    it('resolveEraNode 的 sources 数组记录了继承来源 ID', () => {
        for (const node of depth2Nodes.slice(0, 5)) {
            const resolved = resolveEraNode(node.id);
            expect(resolved).not.toBeNull();
            // sources 是 string[]，记录提供各字段的祖先节点 ID
            expect(resolved!.sources.length).toBeGreaterThanOrEqual(1);
            // 所有 source ID 都应是有效的 era ID
            for (const srcId of resolved!.sources) {
                expect(getEraById(srcId)).toBeDefined();
            }
        }
    });

    it('子纪元自身定义的字段在 resolved 中保持原值', () => {
        // 找一个自己定义了 colors 的 depth-2 节点
        const nodeWithOwnColors = depth2Nodes.find((n) => n.colors);
        if (nodeWithOwnColors) {
            const resolved = resolveEraNode(nodeWithOwnColors.id);
            expect(resolved).not.toBeNull();
            // resolved 的颜色值应该与节点自身定义一致
            if (nodeWithOwnColors.colors?.primary) {
                expect(resolved!.inherited.colors?.primary).toBe(nodeWithOwnColors.colors.primary);
            }
        }
    });

    it('liMode 字段可正常继承', () => {
        // 找到一个定义了 liMode 的 SubEra
        const nodeWithLiMode = depth2Nodes.find((n) => n.liMode);
        if (nodeWithLiMode) {
            const resolved = resolveEraNode(nodeWithLiMode.id);
            expect(resolved).not.toBeNull();
            expect(resolved!.inherited.liMode).toBeDefined();
            expect(resolved!.inherited.liMode?.name).toBe(nodeWithLiMode.liMode!.name);
        }
    });
});

describe('UI Copy 一致性', () => {
    it('至少部分 SubEra 或其祖先定义了 uiCopy', () => {
        const withUiCopy = depth2Nodes.filter((n) => n.uiCopy);
        if (withUiCopy.length === 0) {
            // 如果 SubEra 自身都没定义，检查祖先
            const ancestorWithUiCopy = depth2Nodes.find((n) => {
                const path = getEraPath(n.id);
                return path.some((p) => p.uiCopy && Object.keys(p.uiCopy).length > 0);
            });
            // 如果祖先也没有，这是一个已知的数据缺失（非测试失败）
            expect(ancestorWithUiCopy).toBeDefined();
        }
    });
});
