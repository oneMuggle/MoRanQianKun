import type { ModuleManifest } from '../../core/types/module';
import { farFutureEpoch } from './epoch-far-future';

export const manifest: ModuleManifest = {
  id: 'era-far-future',
  name: '未来时代',
  version: '1.0.0',
  category: 'era',
  eraId: 'far-future',
  description: '赛博格、虚拟现实、星际文明',
  promptBlock: () => {
    const node = farFutureEpoch;
    const sections: string[] = [];
    if (node.description) sections.push(`# 时代：${node.name}\n${node.description}`);
    const vars = node.promptVars;
    if (vars) {
      const lines: string[] = [];
      if (vars.科技水平) lines.push(`科技水平：${vars.科技水平}`);
      if (vars.禁忌?.length) lines.push(`时代禁忌：${vars.禁忌.join('；')}`);
      if (lines.length) sections.push(`<时代约束>\n${lines.join('\n')}\n</时代约束>`);
    }
    return sections.join('\n\n');
  },
};
export { farFutureEpoch as epoch } from './epoch-far-future';
