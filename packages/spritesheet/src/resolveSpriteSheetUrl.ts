import { extensions, ExtensionType } from '@pixi/core';
import { settings } from '@pixi/settings';
import type { ResolveAsset, ResolveURLParser } from '@pixi/assets';

const validImages = ['jpg', 'png', 'jpeg', 'avif', 'webp'];

export const resolveSpriteSheetUrl = {
    extension: ExtensionType.ResolveParser,

    test: (value: string): boolean =>
    {
        const tempURL = value.split('?')[0];

        const split = tempURL.split('.');

        const extension = split.pop();
        const format = split.pop();

        return extension === 'json' && validImages.includes(format);
    },
    parse: (value: string): ResolveAsset =>
    {
        const split = value.split('.');

        return {
            resolution: parseFloat(settings.RETINA_PREFIX.exec(value)?.[1] ?? '1'),
            format: split[split.length - 2],
            src: value,
        };
    },
} as ResolveURLParser;

extensions.add(resolveSpriteSheetUrl);
