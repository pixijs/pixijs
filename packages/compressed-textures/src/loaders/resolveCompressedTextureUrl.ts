import { extensions, ExtensionType, settings, utils } from '@pixi/core';

import type { ResolveURLParser, UnresolvedAsset } from '@pixi/assets';

export const resolveCompressedTextureUrl = {
    extension: ExtensionType.ResolveParser,
    test: (value: string) =>
    {
        const extension = utils.path.extname(value).slice(1);

        return ['basis', 'ktx', 'dds'].includes(extension);
    },
    parse: (value: string): UnresolvedAsset =>
    {
        const extension = utils.path.extname(value).slice(1);

        if (extension === 'ktx')
        {
            const extensions = [
                '.s3tc.ktx',
                '.s3tc_sRGB.ktx',
                '.etc.ktx',
                '.etc1.ktx',
                '.pvrt.ktx',
                '.atc.ktx',
                '.astc.ktx'
            ];

            // check if value ends with one of the extensions
            if (extensions.some((ext) => value.endsWith(ext)))
            {
                return {
                    resolution: parseFloat(settings.RETINA_PREFIX.exec(value)?.[1] ?? '1'),
                    format: extensions.find((ext) => value.endsWith(ext)),
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
