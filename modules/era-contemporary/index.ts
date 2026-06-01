import type { ModuleManifest } from '../../core/types/module';
import { contemporaryEpoch } from './epoch-contemporary';

export const manifest: ModuleManifest = {
  id: 'era-contemporary',
  name: '现代时代',
  version: '1.0.0',
  category: 'era',
  eraId: 'contemporary',
  description: '现代都市、末日废土、黑色犯罪、丧尸、极寒、生化危机',
  promptBlock: () => {
    const node = contemporaryEpoch;
    const sections: string[] = [];
    if (node.description) sections.push(`# 时代：${node.name}\n${node.description}`);
    const vars = node.promptVars;
    if (vars) {
      const lines: string[] = [];
      if (vars.社会形态) lines.push(`社会形态：${vars.社会形态}`);
      if (vars.禁忌?.length) lines.push(`时代禁忌：${vars.禁忌.join('；')}`);
      if (lines.length) sections.push(`<时代约束>\n${lines.join('\n')}\n</时代约束>`);
    }
    return sections.join('\n\n');
  },
};
export { contemporaryEpoch as epoch } from './epoch-contemporary';
