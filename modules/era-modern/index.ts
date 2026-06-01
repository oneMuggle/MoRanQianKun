import type { ModuleManifest } from '../../core/types/module';
import { modernEpoch } from './epoch-modern';

export const manifest: ModuleManifest = {
  id: 'era-modern',
  name: '近代时代',
  version: '1.0.0',
  category: 'era',
  eraId: 'modern',
  description: '近代时期，民国/明治大正/晚清，西方维多利亚/爵士时代',
  promptBlock: () => {
    const node = modernEpoch;
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
export { modernEpoch as epoch } from './epoch-modern';
