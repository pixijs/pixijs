import { ExtensionType } from '../../../extensions/Extensions';
import { testVideoFormat } from '../utils/testVideoFormat';

import type { FormatDetectionParser } from '../types';

export const detectOgv = {
    extension: {
        type: ExtensionType.DetectionParser,
        priority: 0,
    },
    test: async (): Promise<boolean> => testVideoFormat('video/ogg'),
    add: async (formats) => [...formats, 'ogv'],
    remove: async (formats) => formats.filter((f) => f !== 'ogv'),
} as FormatDetectionParser;
