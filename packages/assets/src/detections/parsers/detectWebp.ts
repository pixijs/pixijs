import { settings, extensions, ExtensionType } from '@pixi/core';
import type { FormatDetectionParser } from '..';

export const detectWebp = {
    extension: {
        type: ExtensionType.DetectionParser,
        priority: 0,
    },
    test: async (): Promise<boolean> =>
    {
        if (!globalThis.createImageBitmap) return false;

        const webpData = 'data:image/webp;base64,UklGRh4AAABXRUJQVlA4TBEAAAAvAAAAAAfQ//73v/+BiOh/AAA=';
        const blob = await settings.ADAPTER.fetch(webpData).then((r) => r.blob());

        return createImageBitmap(blob).then(() => true, () => false);
    },
    add: async (formats) => [...formats, 'webp'],
    remove: async (formats) => formats.filter((f) => f !== 'webp'),
} as FormatDetectionParser;

extensions.add(detectWebp);
