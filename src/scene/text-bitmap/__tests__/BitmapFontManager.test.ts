import { TextStyle } from '../../text/TextStyle';
import { BitmapFontManager } from '../BitmapFontManager';
import { Cache } from '~/assets';

import type { BitmapFont } from '../BitmapFont';

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

    it('should uninstall and remove from Cache if char is empty', () =>
    {
        BitmapFontManager.install('foo', {}, { chars: ' ' });
        expect(Cache.get<BitmapFont>('foo-bitmap')).toBeDefined();

        BitmapFontManager.uninstall('foo');
        expect(Cache.get<BitmapFont>('foo-bitmap')).toBeUndefined();
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

    it('should measure trailing whitespaces when trimEnd is disabled', () =>
    {
        const layout = BitmapFontManager.getLayout('foo', new TextStyle());
        const layoutTrimmed = BitmapFontManager.getLayout('foo    ', new TextStyle());
        const layoutUntrimmed = BitmapFontManager.getLayout('foo    ', new TextStyle(), false);

        expect(layoutTrimmed.width).toEqual(layout.width);
        expect(layoutUntrimmed.width).toBeGreaterThan(layout.width);
    });
});
