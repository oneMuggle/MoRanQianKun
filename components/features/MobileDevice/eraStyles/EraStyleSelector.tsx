import { getEraPath } from '../../../../models/eraTheme';

type EraCategory = 'ancient' | 'modern' | 'tech' | 'holographic' | 'consciousness' | 'default';

export function getEraCategory(eraId: string): EraCategory {
    const path = getEraPath(eraId);
    if (path.length === 0) return 'default';

    const epoch = path[0];

    switch (epoch.id) {
        case 'ancient':
        case 'primordial':
            return 'ancient';
        case 'contemporary':
        case 'modern':
            return 'modern';
        case 'near-future':
            return 'tech';
        case 'far-future':
            return 'holographic';
        case 'post-human':
            return 'consciousness';
        default:
            return 'default';
    }
}
