import { Cache } from '../../../src/assets/cache/Cache';
import { TextStyle } from '../../../src/scene/text/TextStyle';
import { BitmapFontManager } from '../../../src/scene/text-bitmap/BitmapFontManager';

import type { BitmapFont } from '../../../src/scene/text-bitmap/BitmapFont';

describe('BitmapFontManager', () =>
{
    it('should install a font and be accessible', async () =>
    {
        BitmapFontManager.install('cool-font', {
            fontFamily: 'Arial',
        }, { resolution: 2, chars: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' });

        const bitmapFont = Cache.get<BitmapFont>('cool-font-bitmap');

        expect(bitmapFont).toBeDefined();
    });

    it('should uninstall and remove from Cache', () =>
    {
        BitmapFontManager.install('foo', {}, { chars: 'a' });
        expect(Cache.get<BitmapFont>('foo-bitmap')).toBeDefined();

        BitmapFontManager.uninstall('foo');
        expect(Cache.get<BitmapFont>('foo-bitmap')).toBeUndefined();
    });

    it('should return layout for text containing emoji', () =>
    {
        const layout = BitmapFontManager.getLayout('foo👍', new TextStyle());

        expect(layout).toBeDefined();
    });
});
