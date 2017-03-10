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

    it('should remove Texture and BaseTexture from caches in destroy(true)', function ()
    {
        const URL = 'foo.png';
        const NAME = 'bar';
        const image = new Image();

        const texture = PIXI.Texture.fromLoader(image, URL, NAME);

        expect(PIXI.utils.TextureCache[NAME],
            'TextureCache[name] is the texture').to.equal(texture);
        expect(PIXI.utils.BaseTextureCache[NAME],
            'BaseTextureCache[name] is the base texture').to.equal(texture.baseTexture);
        expect(PIXI.utils.TextureCache[URL],
            'TextureCache[imageUrl] is the texture').to.equal(texture);
        expect(PIXI.utils.BaseTextureCache[URL],
            'BaseTextureCache[imageUrl] is the base texture').to.equal(texture.baseTexture);

        texture.destroy(true);

        expect(PIXI.utils.TextureCache[NAME],
            'TextureCache[name] is cleared').to.be.undefined;
        expect(PIXI.utils.BaseTextureCache[NAME],
            'BaseTextureCache[name] is cleared').to.be.undefined;
        expect(PIXI.utils.TextureCache[URL],
            'TextureCache[imageUrl] is cleared').to.be.undefined;
        expect(PIXI.utils.BaseTextureCache[URL],
            'BaseTextureCache[imageUrl] is cleared').to.be.undefined;
    });

    it('should not remove Texture and BaseTexture from caches in destroy(true) if overwritten first', function ()
    {
        const URL = 'foo.png';
        const NAME = 'bar';
        const image = new Image();

        const texture = PIXI.Texture.fromLoader(image, URL, NAME);

        PIXI.utils.TextureCache[NAME] = 'I\'m a little teapot';
        PIXI.utils.BaseTextureCache[NAME] = 'short and stout';
        PIXI.utils.TextureCache[URL] = 'Here is my handle';
        PIXI.utils.BaseTextureCache[URL] = 'here is my spout';

        texture.destroy(true);

        expect(PIXI.utils.TextureCache[NAME],
            'TextureCache[name] is not cleared').to.be.equal('I\'m a little teapot');
        expect(PIXI.utils.BaseTextureCache[NAME],
            'BaseTextureCache[name] is not cleared').to.be.equal('short and stout');
        expect(PIXI.utils.TextureCache[URL],
            'TextureCache[imageUrl] is not cleared').to.be.equal('Here is my handle');
        expect(PIXI.utils.BaseTextureCache[URL],
            'BaseTextureCache[imageUrl] is not cleared').to.be.equal('here is my spout');
    });

    it('should not remove BaseTexture from caches in destroy()', function ()
    {
        const URL = 'foo.png';
        const NAME = 'bar';
        const image = new Image();

        const texture = PIXI.Texture.fromLoader(image, URL, NAME);
        const baseTexture = texture.baseTexture;

        texture.destroy();

        expect(PIXI.utils.BaseTextureCache[NAME],
            'BaseTextureCache[name] is not cleared').to.equal(baseTexture);
        expect(PIXI.utils.BaseTextureCache[URL],
            'BaseTextureCache[imageUrl] is not cleared').to.equal(baseTexture);
        expect(baseTexture.source,
            'base texture has not been destroyed').to.exist;
    });

    it('should remove Texture and BaseTexture from caches when base texture is destroyed', function ()
    {
        const URL = 'foo.png';
        const NAME = 'bar';
        const image = new Image();

        const texture = PIXI.Texture.fromLoader(image, URL, NAME);

        expect(PIXI.utils.TextureCache[NAME],
            'TextureCache[name] is the texture').to.equal(texture);
        expect(PIXI.utils.BaseTextureCache[NAME],
            'BaseTextureCache[name] is the base texture').to.equal(texture.baseTexture);
        expect(PIXI.utils.TextureCache[URL],
            'TextureCache[imageUrl] is the texture').to.equal(texture);
        expect(PIXI.utils.BaseTextureCache[URL],
            'BaseTextureCache[imageUrl] is the base texture').to.equal(texture.baseTexture);

        texture.baseTexture.destroy();

        expect(PIXI.utils.TextureCache[NAME],
            'TextureCache[name] is cleared').to.be.undefined;
        expect(PIXI.utils.BaseTextureCache[NAME],
            'BaseTextureCache[name] is cleared').to.be.undefined;
        expect(PIXI.utils.TextureCache[URL],
            'TextureCache[imageUrl] is cleared').to.be.undefined;
        expect(PIXI.utils.BaseTextureCache[URL],
            'BaseTextureCache[imageUrl] is cleared').to.be.undefined;
    });

    it('should remove additional Textures from cache when base texture is destroyed', function ()
    {
        const URL = 'foo.png';
        const NAME = 'bar';
        const image = new Image();
        const NAME2 = 'teapot';

        const texture = PIXI.Texture.fromLoader(image, URL, NAME);
        const texture2 = new PIXI.Texture(texture.baseTexture);

        PIXI.Texture.addTextureToCache(texture2, NAME2);

        expect(PIXI.utils.TextureCache[NAME2],
            'TextureCache[NAME2] is texture2').to.equal(texture2);

        texture.baseTexture.destroy();

        expect(PIXI.utils.TextureCache[NAME2],
            'TextureCache[NAME2] is cleared').to.be.undefined;
    });
});
