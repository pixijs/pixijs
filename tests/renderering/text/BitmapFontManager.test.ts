import { Cache } from '../../../src/assets/cache/Cache';
import { BitmapFont } from '../../../src/scene/text-bitmap/BitmapFont';
import { BitmapFontManager } from '../../../src/scene/text-bitmap/BitmapFontManager';
import { DynamicBitmapFont } from '../../../src/scene/text-bitmap/DynamicBitmapFont';

describe('BitmapFontManager', () =>
{
    it('should install a font and be accessible', async () =>
    {
        const fontName = 'cool-font';

        BitmapFontManager.install(fontName, {
            fontFamily: 'Arial',
        }, { resolution: 2, chars: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' });

        const fontData = Cache.get(`${fontName}-bitmap`);

        expect(fontData instanceof DynamicBitmapFont || fontData instanceof BitmapFont).toBeTrue();
    });

    it('should uninstall and remove from Cache', () =>
    {
        BitmapFontManager.install('foo', {}, { chars: 'a' });
        expect(Cache.get<BitmapFont>('foo-bitmap')).toBeDefined();

        BitmapFontManager.uninstall('foo');
        expect(Cache.get<BitmapFont>('foo-bitmap')).toBeUndefined();
    });
});
