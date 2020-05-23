const { BitmapFont } = require('../');

describe('BitmapFont', function ()
{
    describe('from', function ()
    {
        afterEach(function ()
        {
            for (const name in BitmapFont.available)
            {
                BitmapFont.uninstall(name);
            }
        });

        it('should throw for missing name', function ()
        {
            expect(() => BitmapFont.from()).to.throw;
        });

        it('should register the font if a name is provided', function ()
        {
            this.timeout(8000);
            this.slow(4000);

            expect(BitmapFont.available.foo).to.be.undefined;

            const font = BitmapFont.from('foo');

            expect(BitmapFont.available.foo).to.equal(font);
        });

        it('should draw all characters in a provided range', function ()
        {
            const font = BitmapFont.from('foo', {}, { chars: [['a', 'z']] });

            expect(Object.keys(font.chars).length).to.equal(26);
        });

        it('should throw an error when an invalid range is given', function ()
        {
            expect(() => BitmapFont.from('foo', {}, { chars: [['l', 'i', 'm']] })).to.throw;
        });

        it('should throw an error when an invalid start/end of range', function ()
        {
            expect(() => BitmapFont.from('foo', {}, { chars: [['z', 'a']] })).to.throw;
        });

        it('should render resolution with proportional size', function ()
        {
            const fontRes1 = BitmapFont.from('foo', {}, { chars: 'a' });
            const fontRes2 = BitmapFont.from('bar', {}, { chars: 'a', resolution: 2 });

            // BitmapFont.from IDs are charCodes
            const id = 'a'.charCodeAt(0);

            expect(fontRes1.chars[id].texture.baseTexture.resolution).to.equal(1);
            expect(fontRes2.chars[id].texture.baseTexture.resolution).to.equal(2);
        });

        it('should override and replace font', function ()
        {
            const id = 'a'.charCodeAt(0);

            BitmapFont.from('foo', {}, { chars: 'a' });
            expect(Object.keys(BitmapFont.available.foo.chars).length).to.equal(1);

            BitmapFont.from('foo', {}, { chars: 'bc' });
            expect(Object.keys(BitmapFont.available.foo.chars).length).to.equal(2);
            expect(BitmapFont.available.foo.chars[id]).to.be.undefined;
        });

        it('should throw an error when no characters are passed', function ()
        {
            expect(() => BitmapFont.from('foo', {}, { chars: [] })).to.throw;
        });
    });
});
