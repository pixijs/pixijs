import { ExtensionType } from '@pixi/core';
import { settings } from '@pixi/settings';
import type { FormatDetectionParser } from '..';
import { addFormat, removeFormat } from '../utils/detectUtils';

export const detectAvif: FormatDetectionParser = {
    extension: ExtensionType.DetectionParser,
    test: async (): Promise<boolean> =>
    {
        if (!globalThis.createImageBitmap) return false;

        // eslint-disable-next-line max-len
        const avifData = 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgANogQEAwgMg8f8D///8WfhwB8+ErK42A=';
        const blob = await settings.ADAPTER.fetch(avifData).then((r) => r.blob());

        return createImageBitmap(blob).then(() => true, () => false);
    },
    add: addFormat('avif'),
    remove: removeFormat('avif')
};
