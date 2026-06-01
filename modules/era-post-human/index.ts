import type { ModuleManifest } from '../../core/types/module';
import { postHumanEpoch } from './epoch-post-human';

export const manifest: ModuleManifest = {
  id: 'era-post-human',
  name: '后人类',
  version: '1.0.0',
  category: 'era',
  eraId: 'post-human',
  description: '纯能量生命、维度旅行、数学实在论',
  promptBlock: () => {
    const node = postHumanEpoch;
    const sections: string[] = [];
    if (node.description) sections.push(`# 时代：${node.name}\n${node.description}`);
    const vars = node.promptVars;
    if (vars) {
      const lines: string[] = [];
      if (vars.力量体系) lines.push(`力量体系：${vars.力量体系}`);
      if (vars.禁忌?.length) lines.push(`时代禁忌：${vars.禁忌.join('；')}`);
      if (lines.length) sections.push(`<时代约束>\n${lines.join('\n')}\n</时代约束>`);
    }
    return sections.join('\n\n');
  },
};
export { postHumanEpoch as epoch } from './epoch-post-human';
