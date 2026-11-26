import { Resolver } from '../../assets/resolver/Resolver';
import { checkExtension } from '../../assets/utils/checkExtension';
import { ExtensionType } from '../../extensions/Extensions';

import type { ResolveURLParser } from '../../assets/resolver/types';

/** @internal */
export const validFormats = ['basis', 'bc7', 'bc6h', 'astc', 'etc2', 'bc5', 'bc4', 'bc3', 'bc2', 'bc1', 'eac'];

/**
 * A parser that will resolve a compressed texture url
 * @category assets
 * @internal
 */
export const resolveCompressedTextureUrl = {
    extension: ExtensionType.ResolveParser,
    test: (value: string) =>
        checkExtension(value, ['.ktx', '.ktx2', '.dds', '.astc']),
    parse: (value: string) =>
    {
        let format;

        const splitValue = value.split(/[?#]/)[0].split('.');
        const extension = splitValue[splitValue.length - 1];

        if (validFormats.includes(extension))
        {
            format = extension;
        }
        else if (splitValue.length > 2)
        {
            const newFormat = splitValue[splitValue.length - 2];

            if (validFormats.includes(newFormat))
            {
                format = newFormat;
            }
        }
        else
        {
            format = extension;
        }

        return {
            resolution: parseFloat(Resolver.RETINA_PREFIX.exec(value)?.[1] ?? '1'),
            format,
            src: value,
        };
    }
} satisfies ResolveURLParser;
