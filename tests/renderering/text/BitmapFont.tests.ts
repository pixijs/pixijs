/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Cache } from '../../../src/assets/cache/Cache';
import { TextStyle } from '../../../src/scene/text/TextStyle';
import { BitmapFontManager } from '../../../src/scene/text-bitmap/BitmapFontManager';

import type { BitmapFont } from '../../../src/scene/text-bitmap/BitmapFont';

describe('BitmapFont', () =>
{
    describe('from', () =>
    {
        afterEach(() =>
        {
            Cache.reset();
        });

        // eslint-disable-next-line func-names
        it('should register the font if a name is provided', function ()
        {
            jest.setTimeout(8000);
            const key = 'foo-bitmap';

            expect(Cache.has(key)).toBeFalse();

            BitmapFontManager.install('foo', { fontFamily: 'Arial' });

            expect(Cache.has(key)).toBeTrue();
        });

        // should have a test for BitmapFontManager.getFont() here
        it('should return the same font with getFont', () =>
        {
            const font1 = BitmapFontManager.getFont('foo', new TextStyle({ fontFamily: 'Arial' }));
            const font2 = BitmapFontManager.getFont('foo', new TextStyle({ fontFamily: 'Arial' }));

            expect(font1).toEqual(font2);
        });

        it('should draw all characters in a provided range', () =>
        {
            const font = BitmapFontManager.install('foo', undefined, { chars: [['a', 'z']] });

            expect(Object.keys(font.chars).length).toEqual(26);
        });

        it('should draw emojis', () =>
        {
            const emojis = ['🔥', '🌏', '😀'];
            const font = BitmapFontManager.install('foo', {}, { chars: [emojis.join('')] });

            expect(Object.keys(font.chars).length).toEqual(emojis.length);

            const charIdKeys = Object.keys(font.chars).map((key) => String(font.chars[key].id));

            for (const emoji of emojis)
            {
                const char = String(emoji.codePointAt(0));

                expect(charIdKeys).toContain(char);
            }
        });

        it('should throw an error when an invalid range is given', () =>
        {
            expect(() => BitmapFontManager.install('foo', {}, { chars: [['l', 'i', 'm']] })).toThrow();
        });

        it('should throw an error when an invalid start/end of range', () =>
        {
            expect(() => BitmapFontManager.install('foo', {}, { chars: [['z', 'a']] })).toThrow();
        });

        it('should render resolution with proportional size', () =>
        {
            const fontRes1 = BitmapFontManager.install('foo', {}, { chars: 'a' });
            const fontRes2 = BitmapFontManager.install('bar', {}, { chars: 'a', resolution: 2 });

            expect(fontRes1.chars['a'].texture.source.resolution).toEqual(1);
            expect(fontRes2.chars['a'].texture.source.resolution).toEqual(2);
        });

        it('should override and replace font', () =>
        {
            BitmapFontManager.install('foo', {}, { chars: 'a' });
            expect(Object.keys(Cache.get<BitmapFont>('foo-bitmap')!.chars)).toHaveLength(1);

            BitmapFontManager.install('foo', {}, { chars: 'bc' });
            expect(Object.keys(Cache.get<BitmapFont>('foo-bitmap')!.chars)).toHaveLength(2);
            expect(Cache.get<BitmapFont>('foo-bitmap')!.chars['a']).toBeUndefined();
        });

        it('should throw an error when no characters are passed', () =>
        {
            expect(() => BitmapFontManager.install('foo', {}, { chars: [] })).toThrow();
        });
    });
});
