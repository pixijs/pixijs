import { ExtensionType } from '@pixi/core';
import { settings } from '@pixi/settings';
import type { FormatDetectionParser } from '..';
import { addFormats, removeFormats } from '../utils/detectUtils';

export const detectWebp = {
    extension: ExtensionType.DetectionParser,
    test: async (): Promise<boolean> =>
    {
        if (!globalThis.createImageBitmap) return false;

        const webpData = 'data:image/webp;base64,UklGRh4AAABXRUJQVlA4TBEAAAAvAAAAAAfQ//73v/+BiOh/AAA=';
        const blob = await settings.ADAPTER.fetch(webpData).then((r) => r.blob());

        return createImageBitmap(blob).then(() => true, () => false);
    },
    add: addFormats('webp'),
    remove: removeFormats('webp')
} as FormatDetectionParser;
