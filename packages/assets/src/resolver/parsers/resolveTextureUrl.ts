import { extensions, ExtensionType, settings } from '@pixi/core';
import { loadTextures } from '../../loader';

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

extensions.add(resolveTextureUrl);
