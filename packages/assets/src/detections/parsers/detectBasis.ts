import { BasisParser } from '@pixi/basis';
import { extensions, ExtensionType } from '@pixi/core';
import type { FormatDetectionParser } from '..';
import { addFormats, removeFormats } from '../utils/detectUtils';

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
