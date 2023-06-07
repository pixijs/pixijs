import { ExtensionType } from '../../../extensions/Extensions';
import { settings } from '../../../settings/settings';
import { loadTextures } from '../../loader/parsers/textures/loadTextures';

import type { UnresolvedAsset } from '../../types';
import type { ResolveURLParser } from '../types';

export const resolveTextureUrl = {
    extension: ExtensionType.ResolveParser,
    test: loadTextures.test,
    parse: (value: string): UnresolvedAsset =>
        ({
            resolution: parseFloat(settings.RETINA_PREFIX.exec(value)?.[1] ?? '1'),
            format: value.split('.').pop(),
            src: value,
        }),
} as ResolveURLParser;
