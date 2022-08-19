import { extensions, ExtensionType } from '@pixi/core';
import { settings } from '@pixi/settings';

import type { ResolveAsset, ResolveURLParser } from '@pixi/assets';

export const resolveCompressedTextureUrl = {
    extension: ExtensionType.ResolveParser,
    test: (value: string) =>
    {
        const temp = value.split('?')[0];
        const extension = temp.split('.').pop();

        return ['basis', 'ktx', 'dds'].includes(extension);
    },
    parse: (value: string): ResolveAsset =>
    {
        const temp = value.split('?')[0];
        const extension = temp.split('.').pop();

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
            format: value.split('.').pop(),
            src: value,
        };
    },
} as ResolveURLParser;

extensions.add(resolveCompressedTextureUrl);
