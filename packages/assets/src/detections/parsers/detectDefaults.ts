import { extensions, ExtensionType } from '@pixi/core';

import type { FormatDetectionParser } from '..';

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

extensions.add(detectDefaults);
