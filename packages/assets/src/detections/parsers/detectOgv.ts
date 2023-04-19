import { extensions, ExtensionType } from '@pixi/core';
import { testVideoFormat } from '../utils/testVideoFormat';

import type { FormatDetectionParser } from '..';

export const detectOgv = {
    extension: {
        type: ExtensionType.DetectionParser,
        priority: 0,
    },
    test: async (): Promise<boolean> => testVideoFormat('video/ogg'),
    add: async (formats) => [...formats, 'ogv'],
    remove: async (formats) => formats.filter((f) => f !== 'ogv'),
} as FormatDetectionParser;

extensions.add(detectOgv);
