import { Resolver } from '../../assets/resolver/Resolver';
import { checkExtension } from '../../assets/utils/checkExtension';
import { ExtensionType } from '../../extensions/Extensions';

import type { ResolveURLParser } from '../../assets/resolver/types';
import type { UnresolvedAsset } from '../../assets/types';

export const validFormats = ['basis', 'etc2', 'bc7', 'bc6h', 'bc5', 'bc4', 'bc3', 'bc2', 'bc1', 'eac', 'astc'];

export const resolveCompressedTextureUrl = {
    extension: ExtensionType.ResolveParser,
    test: (value: string) =>
        checkExtension(value, ['.ktx', '.ktx2', '.dds']),
    parse: (value: string): UnresolvedAsset =>
    {
        let format;

        const splitValue = value.split('.');

        if (splitValue.length > 2)
        {
            const newFormat = splitValue[splitValue.length - 2];

            validFormats.includes(newFormat);

            format = newFormat;
        }
        else
        {
            format = splitValue[splitValue.length - 1];
        }

        return {
            resolution: parseFloat(Resolver.RETINA_PREFIX.exec(value)?.[1] ?? '1'),
            format,
            src: value,
        };
    }
} as ResolveURLParser;
