/**
 * 古代时代（Ancient）模块入口
 */
import type { ModuleManifest } from '../../core/types/module';
import { ancientEpoch } from './epoch-ancient';

export const manifest: ModuleManifest = {
  id: 'era-ancient',
  name: '古代时代',
  version: '1.0.0',
  category: 'era',
  eraId: 'ancient',
  description: '古典时期，武侠、神话、修炼体系并立',
  promptBlock: () => {
    const node = ancientEpoch;
    const sections: string[] = [];
    if (node.description) sections.push(`# 时代：${node.name}\n${node.description}`);
    const vars = node.promptVars;
    if (vars) {
      const lines: string[] = [];
      if (vars.社会形态) lines.push(`社会形态：${vars.社会形态}`);
      if (vars.科技水平) lines.push(`科技水平：${vars.科技水平}`);
      if (vars.力量体系) lines.push(`力量体系：${vars.力量体系}`);
      if (vars.禁忌?.length) lines.push(`时代禁忌：${vars.禁忌.join('；')}`);
      if (lines.length) sections.push(`<时代约束>\n${lines.join('\n')}\n</时代约束>`);
    }
    return sections.join('\n\n');
  },
};
export { ancientEpoch as epoch } from './epoch-ancient';
