import { BitmapFont } from '../../../src/scene/text/bitmap/BitmapFont';

describe('BitmapFont', () =>
{
    describe('from', () =>
    {
        afterEach(() =>
        {
            for (const name in BitmapFont.available)
            {
                BitmapFont.uninstall(name);
            }
        });

        it('should throw for missing name', () =>
        {
            // @ts-expect-error - testing for error
            expect(() => BitmapFont.from()).toThrow();
        });

        // eslint-disable-next-line func-names
        it('should register the font if a name is provided', function ()
        {
            jest.setTimeout(8000);

            expect(BitmapFont.available.foo).toBeUndefined();

            const font = BitmapFont.from('foo');

            expect(BitmapFont.available.foo).toEqual(font);
        });

        it('should draw all characters in a provided range', () =>
        {
            const font = BitmapFont.from('foo', {}, { chars: [['a', 'z']] });

            expect(Object.keys(font.chars).length).toEqual(26);
        });

        it('should draw emojis', () =>
        {
            const emojis = ['🔥', '🌏', '😀'];
            const font = BitmapFont.from('foo', {}, { chars: [emojis.join('')] });

            expect(Object.keys(font.chars).length).toEqual(emojis.length);
            for (const emoji of emojis)
            {
                const char = String(emoji.codePointAt(0));

                expect(font.chars).toHaveProperty(char);
            }
        });

        it('should throw an error when an invalid range is given', () =>
        {
            expect(() => BitmapFont.from('foo', {}, { chars: [['l', 'i', 'm']] })).toThrow();
        });

        it('should throw an error when an invalid start/end of range', () =>
        {
            expect(() => BitmapFont.from('foo', {}, { chars: [['z', 'a']] })).toThrow();
        });

        it('should render resolution with proportional size', () =>
        {
            const fontRes1 = BitmapFont.from('foo', {}, { chars: 'a' });
            const fontRes2 = BitmapFont.from('bar', {}, { chars: 'a', resolution: 2 });

            // BitmapFont.from IDs are charCodes
            const id = 'a'.charCodeAt(0);

            expect(fontRes1.chars[id].texture.baseTexture.resolution).toEqual(1);
            expect(fontRes2.chars[id].texture.baseTexture.resolution).toEqual(2);
        });

        it('should override and replace font', () =>
        {
            const id = 'a'.charCodeAt(0);

            BitmapFont.from('foo', {}, { chars: 'a' });
            expect(Object.keys(BitmapFont.available.foo.chars).length).toEqual(1);

            BitmapFont.from('foo', {}, { chars: 'bc' });
            expect(Object.keys(BitmapFont.available.foo.chars).length).toEqual(2);
            expect(BitmapFont.available.foo.chars[id]).toBeUndefined();
        });

        it('should throw an error when no characters are passed', () =>
        {
            expect(() => BitmapFont.from('foo', {}, { chars: [] })).toThrow();
        });
    });
});
