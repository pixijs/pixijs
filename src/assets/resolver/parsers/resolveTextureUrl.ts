import { ExtensionType } from '../../../extensions/Extensions';
import { loadTextures } from '../../loader/parsers/textures/loadTextures';
import { Resolver } from '../Resolver';

import type { UnresolvedAsset } from '../../types';
import type { ResolveURLParser } from '../types';

/**
 * A parser that will resolve a texture url
 *
 * This will be added automatically if `pixi.js/assets` is imported
 * @memberof assets
 */
export const resolveTextureUrl = {
    extension: ExtensionType.ResolveParser,
    test: loadTextures.test,
    parse: (value: string): UnresolvedAsset =>
        ({
            resolution: parseFloat(Resolver.RETINA_PREFIX.exec(value)?.[1] ?? '1'),
            format: value.split('.').pop(),
            src: value,
        }),
} as ResolveURLParser;
