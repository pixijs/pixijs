import { ExtensionType } from '../../../extensions/Extensions';
import { Resolver } from '../Resolver';
import { resolveTextureUrl } from './resolveTextureUrl';

import type { ResolveURLParser } from '../types';

/**
 * A parser that will resolve a json urls resolution for spritesheets
 * e.g. `assets/spritesheet@1x.json`
 * @memberof assets
 */
export const resolveJsonUrl = {
    extension: {
        type: ExtensionType.ResolveParser,
        priority: -2,
        name: 'resolveJson',
    },
    test: (value: string): boolean =>
        Resolver.RETINA_PREFIX.test(value) && value.endsWith('.json'),
    parse: resolveTextureUrl.parse,
} satisfies ResolveURLParser;
