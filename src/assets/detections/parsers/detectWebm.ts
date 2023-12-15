import { ExtensionType } from '../../../extensions/Extensions';
import { testVideoFormat } from '../utils/testVideoFormat';

import type { FormatDetectionParser } from '../types';

/**
 * Detects if the browser supports the WebM video format.
 * @memberof assets
 */
export const detectWebm = {
    extension: {
        type: ExtensionType.DetectionParser,
        priority: 0,
    },
    test: async (): Promise<boolean> => testVideoFormat('video/webm'),
    add: async (formats) => [...formats, 'webm'],
    remove: async (formats) => formats.filter((f) => f !== 'webm'),
} as FormatDetectionParser;
