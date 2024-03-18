import { ExtensionType } from '../../../extensions/Extensions';
import { testVideoFormat } from '../utils/testVideoFormat';

import type { FormatDetectionParser } from '../types';

/**
 * Detects if the browser supports the MP4 video format.
 * @memberof assets
 */
export const detectMp4 = {
    extension: {
        type: ExtensionType.DetectionParser,
        priority: 0,
    },
    test: async (): Promise<boolean> => testVideoFormat('video/mp4'),
    add: async (formats) => [...formats, 'mp4', 'm4v'],
    remove: async (formats) => formats.filter((f) => f !== 'mp4' && f !== 'm4v'),
} as FormatDetectionParser;
