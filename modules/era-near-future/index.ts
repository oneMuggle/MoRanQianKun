import type { ModuleManifest } from '../../core/types/module';
import { nearFutureEpoch } from './epoch-near-future';

export const manifest: ModuleManifest = {
  id: 'era-near-future',
  name: '近未来',
  version: '1.0.0',
  category: 'era',
  eraId: 'near-future',
  description: '赛博朋克、反乌托邦、太空殖民',
  promptBlock: () => {
    const node = nearFutureEpoch;
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
export { nearFutureEpoch as epoch } from './epoch-near-future';
