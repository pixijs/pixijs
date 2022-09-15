import { extensions, ExtensionType } from '@pixi/core';
import type { FormatDetectionParser } from '..';
import { addFormats, removeFormats } from '../utils/detectUtils';

export const detectDefaults = {
    extension: {
        type: ExtensionType.DetectionParser,
        priority: -1,
    },
    test: (): Promise<boolean> => Promise.resolve(true),
    add: addFormats('png', 'jpg', 'jpeg'),
    remove: removeFormats('png', 'jpg', 'jpeg')
} as FormatDetectionParser;

extensions.add(detectDefaults);
