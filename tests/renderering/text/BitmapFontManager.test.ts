import { Cache } from '../../../src/assets/cache/Cache';
import { detectRenderType } from '../../../src/scene/text/utils/detectRenderType';
import { BitmapFontManager } from '../../../src/scene/text-bitmap/BitmapFontManager';

import type { BitmapFont } from '../../../src/scene/text-bitmap/BitmapFont';

describe('BitmapFontManager', () =>
{
    it('should install a font and be accessible', async () =>
    {
        BitmapFontManager.install('cool-font', {
            fontFamily: 'Arial',
        }, { resolution: 2, chars: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' });

        const type = detectRenderType({
            fontFamily: 'cool-font',
        });

        expect(type).toEqual('bitmap');
    });

    it('should uninstall and remove from Cache', () =>
    {
        BitmapFontManager.install('foo', {}, { chars: 'a' });
        expect(Cache.get<BitmapFont>('foo-bitmap')).toBeDefined();

        BitmapFontManager.uninstall('foo');
        expect(Cache.get<BitmapFont>('foo-bitmap')).toBeUndefined();
    });
});
