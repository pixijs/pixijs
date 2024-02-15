import { extensions, ExtensionType, settings, utils } from '@pixi/core';

import type { ResolveURLParser, UnresolvedAsset } from '@pixi/assets';

const knownFormats = ['s3tc', 's3tc_sRGB', 'etc', 'etc1', 'pvrtc', 'atc', 'astc', 'bptc'];

export const resolveCompressedTextureUrl = {
    extension: ExtensionType.ResolveParser,
    test: (value: string) =>
    {
        const extension = utils.path.extname(value).slice(1);

        return ['basis', 'ktx', 'dds'].includes(extension);
    },
    parse: (value: string): UnresolvedAsset =>
    {
        // value expected in format: {name}{resolution}.{format}.{extension} - texture@2x.astc.ktx
        const parts = value.split('.');
        const extension = parts.pop();

        if (['ktx', 'dds'].includes(extension))
        {
            const textureFormat = parts.pop();

            if (knownFormats.includes(textureFormat))
            {
                return {
                    resolution: parseFloat(settings.RETINA_PREFIX.exec(value)?.[1] ?? '1'),
                    format: textureFormat,
                    src: value,
                };
            }
        }

        return {
            resolution: parseFloat(settings.RETINA_PREFIX.exec(value)?.[1] ?? '1'),
            format: extension,
            src: value,
        };
    },
} as ResolveURLParser;

extensions.add(resolveCompressedTextureUrl);
