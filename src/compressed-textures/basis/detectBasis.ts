import { ExtensionType } from '../../extensions/Extensions';
import { isWebGLSupported } from '../../utils/browser/isWebGLSupported';
import { isWebGPUSupported } from '../../utils/browser/isWebGPUSupported';

import type { FormatDetectionParser } from '../../assets/detections/types';

export const detectBasis = {
    extension: {
        type: ExtensionType.DetectionParser,
        priority: 3,
    },
    test: async (): Promise<boolean> =>
    {
        if (await isWebGPUSupported()) return true;
        if (isWebGLSupported()) return true;

        return false;
    },
    add: async (formats) => [...formats, 'basis'],
    remove: async (formats) => formats.filter((f) => f !== 'basis'),
} as FormatDetectionParser;
