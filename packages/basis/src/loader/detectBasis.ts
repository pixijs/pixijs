import { extensions, ExtensionType } from '@pixi/core';
import type { FormatDetectionParser } from '@pixi/assets';
import { addFormats, removeFormats } from '@pixi/assets';
import { BasisParser } from './BasisParser';

export const detectBasis = {
    extension: {
        type: ExtensionType.DetectionParser,
        priority: 3,
    },
    test: async (): Promise<boolean> => !!(BasisParser.basisBinding && BasisParser.TranscoderWorker.wasmSource),
    add: addFormats('basis'),
    remove: removeFormats('basis')
} as FormatDetectionParser;

extensions.add(detectBasis);
