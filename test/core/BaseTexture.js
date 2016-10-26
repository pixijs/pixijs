'use strict';

describe('BaseTexture', () =>
{
    describe('updateImageType', () =>
    {
        it('should allow no extension', () =>
        {
            const baseTexture = new PIXI.BaseTexture();

            baseTexture.imageUrl = 'http://some.domain.org/100/100';
            baseTexture._updateImageType();

            expect(baseTexture.imageType).to.be.equals('png');
        });
    });
});
