import { extensions, ExtensionType } from '@pixi/core';
import { testVideoFormat } from '../utils/testVideoFormat';

import type { FormatDetectionParser } from '..';

export const detectWebm = {
    extension: {
        type: ExtensionType.DetectionParser,
        priority: 0,
    },
    test: async (): Promise<boolean> => testVideoFormat('video/webm'),
    add: async (formats) => [...formats, 'webm'],
    remove: async (formats) => formats.filter((f) => f !== 'webm'),
} as FormatDetectionParser;

extensions.add(detectWebm);
