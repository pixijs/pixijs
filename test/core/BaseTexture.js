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

    it('should remove Canvas BaseTexture from cache on destroy', function ()
    {
        const canvas = document.createElement('canvas');
        const texture = PIXI.BaseTexture.fromCanvas(canvas);
        const _pixiId = canvas._pixiId;

        expect(PIXI.utils.BaseTextureCache[_pixiId]).to.equal(texture);
        texture.destroy();
        expect(PIXI.utils.BaseTextureCache[_pixiId]).to.equal(undefined);
    });

    it('should remove Image BaseTexture from cache on destroy', function ()
    {
        const URL = 'foo.png';
        const NAME = 'bar';
        const image = new Image();

        const texture = PIXI.Texture.fromLoader(image, URL, NAME);

        expect(PIXI.utils.BaseTextureCache[NAME]).to.equal(texture.baseTexture);
        texture.destroy(true);
        expect(PIXI.utils.BaseTextureCache[NAME]).to.equal(undefined);
    });
});
