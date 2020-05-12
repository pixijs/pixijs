const { BitmapFont } = require('../');

describe('BitmapFont', function ()
{
    describe('from', function ()
    {
        it('should register the font if a name is provided', function ()
        {
            const font = BitmapFont.from({ name: 'MockFont', chars: 'CHARSET' });

            expect(BitmapFont.available.MockFont).to.equal(font);
        });

        it('should draw all characters in a provided range', function ()
        {
            const font = BitmapFont.from({ chars: [['a', 'z']] });

            expect(Object.keys(font.chars).length).to.equal(26);
        });

        it('should throw an error when an invalid range is given', function ()
        {
            expect(BitmapFont.from.bind(BitmapFont, { chars: [['l', 'i', 'm']] })).to.throw;
        });

        it('should render resolution with proportional size', function ()
        {
            const fontRes1 = BitmapFont.from({ chars: 'a' });
            const fontRes2 = BitmapFont.from({ chars: 'a', resolution: 2 });

            // BitmapFont.from IDs are charCodes
            const id = 'a'.charCodeAt(0);

            expect(fontRes1.chars[id].texture.baseTexture.resolution).to.equal(1);
            expect(fontRes2.chars[id].texture.baseTexture.resolution).to.equal(2);
        });

        it('should throw an error when name collision is detected in bitmap font registry', function ()
        {
            BitmapFont.from({ chars: 'a', name: 'Thor' });

            expect(BitmapFont.from.bind(BitmapFont, { chars: 'b', name: 'Thor' })).to.throw;
        });

        it('should throw an error when no characters are passed', function ()
        {
            expect(BitmapFont.from.bind(BitmapFont, { chars: [] })).to.throw;
        });
    });
});
