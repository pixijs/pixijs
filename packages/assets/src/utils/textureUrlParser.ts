import { settings } from 'pixi.js';

import { loadTextures } from '../loader';
import { ResolveAsset } from '../resolver/Resolver';

export const textureUrlParser = {
    test: loadTextures.test,
    parse: (value: string): ResolveAsset =>
        ({
            resolution: parseFloat(settings.RETINA_PREFIX.exec(value)?.[1] ?? '1'),
            format: value.split('.').pop(),
            src: value,
        }),
};
