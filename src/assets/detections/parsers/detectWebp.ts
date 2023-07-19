import { ExtensionType } from '../../../extensions/Extensions';

import type { FormatDetectionParser } from '../types';

export const detectWebp = {
    extension: {
        type: ExtensionType.DetectionParser,
        priority: 0,
    },
    test: async (): Promise<boolean> =>
    {
        const webpData = 'data:image/webp;base64,UklGRh4AAABXRUJQVlA4TBEAAAAvAAAAAAfQ//73v/+BiOh/AAA=';

        return new Promise((resolve) =>
        {
            const webp = new Image();

            webp.onload = () =>
            {
                resolve(true);
            };
            webp.onerror = () =>
            {
                resolve(false);
            };
            webp.src = webpData;
        });
    },
    add: async (formats) => [...formats, 'webp'],
    remove: async (formats) => formats.filter((f) => f !== 'webp'),
} as FormatDetectionParser;
