import { BitmapFont } from '@pixi/text-bitmap';
import { expect } from 'chai';

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
            expect(() => BitmapFont.from()).to.throw;
        });

        // eslint-disable-next-line func-names
        it('should register the font if a name is provided', function ()
        {
            this.timeout(8000);
            this.slow(4000);

            expect(BitmapFont.available.foo).to.be.undefined;

            const font = BitmapFont.from('foo');

            expect(BitmapFont.available.foo).to.equal(font);
        });

        it('should draw all characters in a provided range', () =>
        {
            const font = BitmapFont.from('foo', {}, { chars: [['a', 'z']] });

            expect(Object.keys(font.chars).length).to.equal(26);
        });

        it('should draw emojis', () =>
        {
            const emojis = ['🔥', '🌏', '😀'];
            const font = BitmapFont.from('foo', {}, { chars: [emojis.join('')] });

            expect(Object.keys(font.chars).length).to.equal(emojis.length);
            for (const emoji of emojis)
            {
                const char = String(emoji.codePointAt(0));

                expect(font.chars).to.have.property(char);
            }
        });

        it('should throw an error when an invalid range is given', () =>
        {
            expect(() => BitmapFont.from('foo', {}, { chars: [['l', 'i', 'm']] })).to.throw;
        });

        it('should throw an error when an invalid start/end of range', () =>
        {
            expect(() => BitmapFont.from('foo', {}, { chars: [['z', 'a']] })).to.throw;
        });

        it('should render resolution with proportional size', () =>
        {
            const fontRes1 = BitmapFont.from('foo', {}, { chars: 'a' });
            const fontRes2 = BitmapFont.from('bar', {}, { chars: 'a', resolution: 2 });

            // BitmapFont.from IDs are charCodes
            const id = 'a'.charCodeAt(0);

            expect(fontRes1.chars[id].texture.baseTexture.resolution).to.equal(1);
            expect(fontRes2.chars[id].texture.baseTexture.resolution).to.equal(2);
        });

        it('should override and replace font', () =>
        {
            const id = 'a'.charCodeAt(0);

            BitmapFont.from('foo', {}, { chars: 'a' });
            expect(Object.keys(BitmapFont.available.foo.chars).length).to.equal(1);

            BitmapFont.from('foo', {}, { chars: 'bc' });
            expect(Object.keys(BitmapFont.available.foo.chars).length).to.equal(2);
            expect(BitmapFont.available.foo.chars[id]).to.be.undefined;
        });

        it('should throw an error when no characters are passed', () =>
        {
            expect(() => BitmapFont.from('foo', {}, { chars: [] })).to.throw;
        });
    });
});
