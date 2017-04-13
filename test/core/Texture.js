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
        expect(texture.textureCacheIds.indexOf(NAME)).to.equal(0);
        expect(texture.textureCacheIds.indexOf(NAME2)).to.equal(1);
        expect(PIXI.utils.TextureCache[NAME]).to.equal(texture);
        expect(PIXI.utils.TextureCache[NAME2]).to.equal(texture);
        texture.destroy();
        expect(texture.textureCacheIds).to.equal(null);
        expect(PIXI.utils.TextureCache[NAME]).to.equal(undefined);
        expect(PIXI.utils.TextureCache[NAME2]).to.equal(undefined);
    });

    it('should be added to the texture cache correctly, '
     + 'and should remove only itself, not effecting the base texture and its cache', function ()
    {
        cleanCache();

        const texture = new PIXI.Texture(new PIXI.BaseTexture());

        PIXI.BaseTexture.addToCache(texture.baseTexture, NAME);
        PIXI.Texture.addToCache(texture, NAME);
        expect(texture.baseTexture.textureCacheIds.indexOf(NAME)).to.equal(0);
        expect(texture.textureCacheIds.indexOf(NAME)).to.equal(0);
        expect(PIXI.utils.BaseTextureCache[NAME]).to.equal(texture.baseTexture);
        expect(PIXI.utils.TextureCache[NAME]).to.equal(texture);
        PIXI.Texture.removeFromCache(NAME);
        expect(texture.baseTexture.textureCacheIds.indexOf(NAME)).to.equal(0);
        expect(texture.textureCacheIds.indexOf(NAME)).to.equal(-1);
        expect(PIXI.utils.BaseTextureCache[NAME]).to.equal(texture.baseTexture);
        expect(PIXI.utils.TextureCache[NAME]).to.equal(undefined);
    });

    it('should be added to the texture cache correctly using legacy addTextureToCache, '
     + 'and should remove also remove the base texture from its cache with removeTextureFromCache', function ()
    {
        cleanCache();

        const texture = new PIXI.Texture(new PIXI.BaseTexture());

        PIXI.BaseTexture.addToCache(texture.baseTexture, NAME);
        PIXI.Texture.addTextureToCache(texture, NAME);
        expect(texture.baseTexture.textureCacheIds.indexOf(NAME)).to.equal(0);
        expect(texture.textureCacheIds.indexOf(NAME)).to.equal(0);
        expect(PIXI.utils.BaseTextureCache[NAME]).to.equal(texture.baseTexture);
        expect(PIXI.utils.TextureCache[NAME]).to.equal(texture);
        PIXI.Texture.removeTextureFromCache(NAME);
        expect(texture.baseTexture.textureCacheIds.indexOf(NAME)).to.equal(-1);
        expect(texture.textureCacheIds.indexOf(NAME)).to.equal(-1);
        expect(PIXI.utils.BaseTextureCache[NAME]).to.equal(undefined);
        expect(PIXI.utils.TextureCache[NAME]).to.equal(undefined);
    });

    it('should remove Texture from entire cache using removeFromCache (by Texture instance)', function ()
    {
        cleanCache();

        const texture = new PIXI.Texture(new PIXI.BaseTexture());

        PIXI.Texture.addToCache(texture, NAME);
        PIXI.Texture.addToCache(texture, NAME2);
        expect(texture.textureCacheIds.indexOf(NAME)).to.equal(0);
        expect(texture.textureCacheIds.indexOf(NAME2)).to.equal(1);
        expect(PIXI.utils.TextureCache[NAME]).to.equal(texture);
        expect(PIXI.utils.TextureCache[NAME2]).to.equal(texture);
        PIXI.Texture.removeFromCache(texture);
        expect(texture.textureCacheIds.indexOf(NAME)).to.equal(-1);
        expect(texture.textureCacheIds.indexOf(NAME2)).to.equal(-1);
        expect(PIXI.utils.TextureCache[NAME]).to.equal(undefined);
        expect(PIXI.utils.TextureCache[NAME2]).to.equal(undefined);
    });

    it('should remove Texture from single cache entry using removeFromCache (by id)', function ()
    {
        cleanCache();

        const texture = new PIXI.Texture(new PIXI.BaseTexture());

        PIXI.Texture.addToCache(texture, NAME);
        PIXI.Texture.addToCache(texture, NAME2);
        expect(texture.textureCacheIds.indexOf(NAME)).to.equal(0);
        expect(texture.textureCacheIds.indexOf(NAME2)).to.equal(1);
        expect(PIXI.utils.TextureCache[NAME]).to.equal(texture);
        expect(PIXI.utils.TextureCache[NAME2]).to.equal(texture);
        PIXI.Texture.removeFromCache(NAME);
        expect(texture.textureCacheIds.indexOf(NAME)).to.equal(-1);
        expect(texture.textureCacheIds.indexOf(NAME2)).to.equal(0);
        expect(PIXI.utils.TextureCache[NAME]).to.equal(undefined);
        expect(PIXI.utils.TextureCache[NAME2]).to.equal(texture);
    });

    it('destroying a destroyed texture should not throw an error', function ()
    {
        const texture = new PIXI.Texture(new PIXI.BaseTexture());

        texture.destroy(true);
        texture.destroy(true);
    });
});
