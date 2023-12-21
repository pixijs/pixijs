import { ExtensionType } from '../../../extensions/Extensions';
import { testImageFormat } from '../utils/testImageFormat';

import type { FormatDetectionParser } from '../types';

/**
 * Detects if the browser supports the WebP image format.
 * @memberof assets
 */
export const detectWebp = {
    extension: {
        type: ExtensionType.DetectionParser,
        priority: 0,
    },
    test: async (): Promise<boolean> => testImageFormat(
        'data:image/webp;base64,UklGRh4AAABXRUJQVlA4TBEAAAAvAAAAAAfQ//73v/+BiOh/AAA='
    ),
    add: async (formats) => [...formats, 'webp'],
    remove: async (formats) => formats.filter((f) => f !== 'webp'),
} as FormatDetectionParser;
