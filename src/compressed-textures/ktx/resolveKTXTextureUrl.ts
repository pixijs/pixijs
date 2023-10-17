import { checkExtension } from '../../assets/utils/checkExtension';
import { ExtensionType } from '../../extensions/Extensions';
import { settings } from '../../settings/settings';

import type { ResolveURLParser } from '../../assets/resolver/types';
import type { UnresolvedAsset } from '../../assets/types';

const validFormats = ['bc1', 'bc2', 'bc3', 'bc4', 'bc5', 'bc6h', 'bc7', 'etc2', 'eac', 'astc'];

export const resolveCompressedKTXTextureUrl = {
    extension: ExtensionType.ResolveParser,
    test: (value: string) =>
        checkExtension(value, ['.ktx', '.ktx2']),
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

        return {
            resolution: parseFloat(settings.RETINA_PREFIX.exec(value)?.[1] ?? '1'),
            format,
            src: value,
        };
    }
} as ResolveURLParser;
