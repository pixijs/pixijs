'use strict';

describe('BaseTexture', function ()
{
    describe('updateImageType', function ()
    {
        it('should allow no extension', function ()
        {
            const baseTexture = new PIXI.BaseTexture();

            baseTexture.imageUrl = 'http://some.domain.org/100/100';
            baseTexture._updateImageType();

            expect(baseTexture.imageType).to.be.equals('png');
        });
    });
});
