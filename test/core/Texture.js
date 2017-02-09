'use strict';

describe('PIXI.Texture', function ()
{
    it('should register Texture from Loader', function ()
    {
        const URL = 'foo.png';
        const NAME = 'bar';
        const image = new Image();

        const texture = PIXI.Texture.fromLoader(image, URL, NAME);

        expect(texture.baseTexture.imageUrl).to.equal('foo.png');
        expect(PIXI.utils.TextureCache[NAME]).to.equal(texture);
        expect(PIXI.utils.BaseTextureCache[NAME]).to.equal(texture.baseTexture);
        expect(PIXI.utils.TextureCache[URL]).to.equal(texture);
        expect(PIXI.utils.BaseTextureCache[URL]).to.equal(texture.baseTexture);
    });
});
