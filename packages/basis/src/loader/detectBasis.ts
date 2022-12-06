import { extensions, ExtensionType } from '@pixi/core';
import { BasisParser } from './BasisParser';

import type { FormatDetectionParser } from '@pixi/assets';

export const detectBasis = {
    extension: {
        type: ExtensionType.DetectionParser,
        priority: 3,
    },
    test: async (): Promise<boolean> => !!(BasisParser.basisBinding && BasisParser.TranscoderWorker.wasmSource),
    add: async (formats) => [...formats, 'basis'],
    remove: async (formats) => formats.filter((f) => f !== 'basis'),
} as FormatDetectionParser;

extensions.add(detectBasis);
