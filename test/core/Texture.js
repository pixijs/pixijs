'use strict';

const URL = 'foo.png';
const NAME = 'foo';
const NAME2 = 'bar';

function cleanCache()
{
    delete PIXI.utils.BaseTextureCache[URL];
    delete PIXI.utils.BaseTextureCache[NAME];
    delete PIXI.utils.BaseTextureCache[NAME2];

    delete PIXI.utils.TextureCache[URL];
    delete PIXI.utils.TextureCache[NAME];
    delete PIXI.utils.TextureCache[NAME2];
}

describe('PIXI.Texture', function ()
{
    it('should register Texture from Loader', function ()
    {
        cleanCache();

        const image = new Image();

        const texture = PIXI.Texture.fromLoader(image, URL, NAME);

        expect(texture.baseTexture.imageUrl).to.equal('foo.png');
        expect(PIXI.utils.TextureCache[NAME]).to.equal(texture);
        expect(PIXI.utils.BaseTextureCache[NAME]).to.equal(texture.baseTexture);
        expect(PIXI.utils.TextureCache[URL]).to.equal(texture);
        expect(PIXI.utils.BaseTextureCache[URL]).to.equal(texture.baseTexture);
    });

    it('should remove Texture from cache on destroy', function ()
    {
        cleanCache();

        const texture = new PIXI.Texture(new PIXI.BaseTexture());

        PIXI.Texture.addToCache(texture, NAME);
        PIXI.Texture.addToCache(texture, NAME2);
        expect(texture.textureCacheId).to.equal(NAME);
        expect(PIXI.utils.TextureCache[NAME]).to.equal(texture);
        expect(PIXI.utils.TextureCache[NAME2]).to.equal(texture);
        texture.destroy();
        expect(PIXI.utils.TextureCache[NAME]).to.equal(undefined);
        expect(PIXI.utils.TextureCache[NAME]).to.equal(undefined);
        expect(PIXI.utils.TextureCache[NAME2]).to.equal(undefined);
    });

    it('adding and removing Textures', function ()
    {
        cleanCache();

        const texture = new PIXI.Texture(new PIXI.BaseTexture());

        PIXI.BaseTexture.addToCache(texture.baseTexture, NAME);
        PIXI.Texture.addToCache(texture, NAME);
        expect(texture.baseTexture.textureCacheId).to.equal(NAME);
        expect(texture.textureCacheId).to.equal(NAME);
        expect(PIXI.utils.BaseTextureCache[NAME]).to.equal(texture.baseTexture);
        expect(PIXI.utils.TextureCache[NAME]).to.equal(texture);
        PIXI.Texture.removeFromCache(NAME);
        expect(PIXI.utils.BaseTextureCache[NAME]).to.equal(texture.baseTexture);
        expect(PIXI.utils.TextureCache[NAME]).to.equal(undefined);
    });

    it('adding and removing Textures - Legacy', function ()
    {
        cleanCache();

        const texture = new PIXI.Texture(new PIXI.BaseTexture());

        PIXI.utils.BaseTextureCache[NAME] = texture.baseTexture;
        PIXI.Texture.addTextureToCache(texture, NAME);
        expect(texture.textureCacheId).to.equal(NAME);
        expect(PIXI.utils.BaseTextureCache[NAME]).to.equal(texture.baseTexture);
        expect(PIXI.utils.TextureCache[NAME]).to.equal(texture);
        PIXI.Texture.removeTextureFromCache(NAME);
        expect(PIXI.utils.BaseTextureCache[NAME]).to.equal(undefined);
        expect(PIXI.utils.TextureCache[NAME]).to.equal(undefined);
    });

    it('should remove Texture from entire cache using removeFromCache (by Texture instance)', function ()
    {
        cleanCache();

        const texture = new PIXI.Texture(new PIXI.BaseTexture());

        PIXI.Texture.addToCache(texture, NAME);
        PIXI.Texture.addToCache(texture, NAME2);
        expect(texture.textureCacheId).to.equal(NAME);
        expect(PIXI.utils.TextureCache[NAME]).to.equal(texture);
        expect(PIXI.utils.TextureCache[NAME2]).to.equal(texture);
        PIXI.Texture.removeFromCache(texture);
        expect(PIXI.utils.TextureCache[NAME]).to.equal(undefined);
        expect(PIXI.utils.TextureCache[NAME2]).to.equal(undefined);
    });

    it('should remove Texture from single cache entry using removeFromCache (by id)', function ()
    {
        cleanCache();

        const texture = new PIXI.Texture(new PIXI.BaseTexture());

        PIXI.Texture.addToCache(texture, NAME);
        PIXI.Texture.addToCache(texture, NAME2);
        expect(texture.textureCacheId).to.equal(NAME);
        expect(PIXI.utils.TextureCache[NAME]).to.equal(texture);
        expect(PIXI.utils.TextureCache[NAME2]).to.equal(texture);
        PIXI.Texture.removeFromCache(NAME);
        expect(PIXI.utils.TextureCache[NAME]).to.equal(undefined);
        expect(PIXI.utils.TextureCache[NAME2]).to.equal(texture);
    });
});
