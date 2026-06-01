/**
 * 原生时代（Primordial）模块入口
 *
 * 包含：非洲部落文明、美洲原住民、北欧萨满等史前时期主题。
 */

import type { ModuleManifest } from '../../core/types/module';
import { primordialEpoch } from './epoch-primordial';

/** 模块清单 */
export const manifest: ModuleManifest = {
  id: 'era-primordial',
  name: '原生时代',
  version: '1.0.0',
  category: 'era',
  eraId: 'primordial',
  description: '史前时期，部落文明，巫术与信仰主导',
  promptBlock: () => {
    const node = primordialEpoch;
    const sections: string[] = [];
    if (node.description) {
      sections.push(`# 时代：${node.name}\n${node.description}`);
    }
    const vars = node.promptVars;
    if (vars) {
      const lines: string[] = [];
      if (vars.社会形态) lines.push(`社会形态：${vars.社会形态}`);
      if (vars.科技水平) lines.push(`科技水平：${vars.科技水平}`);
      if (vars.力量体系) lines.push(`力量体系：${vars.力量体系}`);
      if (vars.叙事视角) lines.push(`叙事视角：${vars.叙事视角}`);
      if (vars.禁忌?.length) lines.push(`时代禁忌：${vars.禁忌.join('；')}`);
      if (lines.length) sections.push(`<时代约束>\n${lines.join('\n')}\n</时代约束>`);
    }
    return sections.join('\n\n');
  },
};

/** 时代节点导出（供 assembly.ts 兼容层使用） */
export { primordialEpoch as epoch } from './epoch-primordial';
