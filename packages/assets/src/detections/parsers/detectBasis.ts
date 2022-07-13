import { BasisParser } from '@pixi/basis';
import { ExtensionType } from '@pixi/core';
import type { FormatDetectionParser } from '..';
import { addFormat, removeFormat } from '../utils/detectUtils';

export const detectBasis = {
    extension: ExtensionType.DetectionParser,
    test: async (): Promise<boolean> => !!(BasisParser.basisBinding && BasisParser.TranscoderWorker.wasmSource),
    add: addFormat('basis'),
    remove: removeFormat('basis')
} as FormatDetectionParser;
