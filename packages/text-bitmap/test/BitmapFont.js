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
    });
});
