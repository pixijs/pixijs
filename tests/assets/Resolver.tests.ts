import { Assets } from '../../src/assets/Assets';
import { extensions, ExtensionType } from '../../src/extensions/Extensions';

import type { FormatDetectionParser } from '../../src/assets/detections/types';

export const testDetector = {
    extension: {
        type: ExtensionType.DetectionParser,
        priority: 2,
    },
    test: async (): Promise<boolean> =>
        true,
    add: async (formats: string[]): Promise<string[]> =>
        ['best', 'ok', 'worst', ...formats],

} as FormatDetectionParser;

describe('Resolver', () =>
{
    beforeEach(() =>
    {
        // reset the loader
        Assets.reset();
    });

    it('should load correct preferred asset', async () =>
    {
        extensions.add(testDetector);

        await Assets.init();

        Assets.resolver.add({
            alias: 'test',
            src: [
                'src.worst',
                'src.ok',
                'src.best',
            ]
        });

        const resolvedAsset = Assets.resolver.resolve('test');

        expect(resolvedAsset.src).toBe('src.best');
    });
});
