import { ExtensionType } from '../../../extensions/Extensions';

import type { FormatDetectionParser } from '../types';

const imageFormats = ['png', 'jpg', 'jpeg'];

export const detectDefaults = {
    extension: {
        type: ExtensionType.DetectionParser,
        priority: -1,
    },
    test: (): Promise<boolean> => Promise.resolve(true),
    add: async (formats) => [...formats, ...imageFormats],
    remove: async (formats) => formats.filter((f) => !imageFormats.includes(f)),
} as FormatDetectionParser;
