import { settings, extensions, ExtensionType } from '@pixi/core';
import { loadTextures } from '../../loader';

import type { ResolveAsset, ResolveURLParser } from '../types';

export const resolveTextureUrl = {
    extension: ExtensionType.ResolveParser,
    test: loadTextures.test,
    parse: (value: string): ResolveAsset =>
        ({
            resolution: parseFloat(settings.RETINA_PREFIX.exec(value)?.[1] ?? '1'),
            format: value.split('.').pop(),
            src: value,
        }),
} as ResolveURLParser;

extensions.add(resolveTextureUrl);
