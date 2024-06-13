import { ExtensionType } from '../../../extensions/Extensions';
import { loadTextures } from '../../loader/parsers/textures/loadTextures';
import { Resolver } from '../Resolver';

import type { ResolveURLParser } from '../types';

/**
 * A parser that will resolve a texture url
 * @memberof assets
 */
export const resolveTextureUrl = {
    extension: {
        type: ExtensionType.ResolveParser,
        name: 'resolveTexture',
    },
    test: loadTextures.test,
    parse: (value: string) =>
        ({
            resolution: parseFloat(Resolver.RETINA_PREFIX.exec(value)?.[1] ?? '1'),
            format: value.split('.').pop(),
            src: value,
        }),
} satisfies ResolveURLParser;
