import { extensions, ExtensionType } from '@pixi/core';
import { testImageFormat } from '../utils/testImageFormat';

import type { FormatDetectionParser } from '..';

export const detectAvif: FormatDetectionParser = {
    extension: {
        type: ExtensionType.DetectionParser,
        priority: 1,
    },
    test: async (): Promise<boolean> =>
    {
        // eslint-disable-next-line max-len
        const avifData = 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgANogQEAwgMg8f8D///8WfhwB8+ErK42A=';

        return testImageFormat(avifData);
    },
    add: async (formats) => [...formats, 'avif'],
    remove: async (formats) => formats.filter((f) => f !== 'avif'),
};

extensions.add(detectAvif);
