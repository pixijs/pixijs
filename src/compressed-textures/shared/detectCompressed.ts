import { ExtensionType } from '../../extensions/Extensions';
// eslint-disable-next-line max-len
import { getSupportedCompressedTextureFormats } from '../../rendering/renderers/shared/texture/utils/getSupportedCompressedTextureFormats';
import { isWebGLSupported } from '../../utils/browser/isWebGLSupported';
import { isWebGPUSupported } from '../../utils/browser/isWebGPUSupported';
import { validFormats } from './resolveCompressedTextureUrl';

import type { FormatDetectionParser } from '../../assets/detections/types';
import type { TEXTURE_FORMATS } from '../../rendering/renderers/shared/texture/const';

let compressedTextureExtensions: string[];

export const detectCompressed = {
    extension: {
        type: ExtensionType.DetectionParser,
        priority: 2,
    },
    test: async (): Promise<boolean> =>
    {
        if (await isWebGPUSupported()) return true;
        if (isWebGLSupported()) return true;

        return false;
    },
    add: async (formats: string[]): Promise<string[]> =>
    {
        const supportedCompressedTextureFormats = await getSupportedCompressedTextureFormats();

        compressedTextureExtensions = extractExtensionsForCompressedTextureFormats(supportedCompressedTextureFormats);

        return [...compressedTextureExtensions, ...formats];
    },
    remove: async (formats: string[]): Promise<string[]> =>
    {
        if (compressedTextureExtensions)
        {
            return formats.filter((f) => !(f in compressedTextureExtensions));
        }

        return formats;
    },
} as FormatDetectionParser;

function extractExtensionsForCompressedTextureFormats(formats: TEXTURE_FORMATS[]): string[]
{
    const extensions: string[] = ['basis'];

    const dupeMap: Record<string, boolean> = {};

    formats.forEach((format) =>
    {
        const extension = format.split('-')[0];

        if (extension && !dupeMap[extension])
        {
            dupeMap[extension] = true;
            extensions.push(extension);
        }
    });

    // sort extensions by priority
    extensions.sort((a, b) =>
    {
        const aIndex = validFormats.indexOf(a);
        const bIndex = validFormats.indexOf(b);

        if (aIndex === -1)
        {
            return 1;
        }
        if (bIndex === -1)
        {
            return -1;
        }

        return aIndex - bIndex;
    });

    return extensions;
}
