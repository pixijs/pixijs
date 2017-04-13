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

describe('BaseTexture', function ()
{
    describe('updateImageType', function ()
    {
        it('should allow no extension', function ()
        {
            cleanCache();

            const baseTexture = new PIXI.BaseTexture();

            baseTexture.imageUrl = 'http://some.domain.org/100/100';
            baseTexture._updateImageType();

            expect(baseTexture.imageType).to.be.equals('png');
        });
    });

    it('should remove Canvas BaseTexture from cache on destroy', function ()
    {
        cleanCache();

        const canvas = document.createElement('canvas');
        const baseTexture = PIXI.BaseTexture.fromCanvas(canvas);
        const _pixiId = canvas._pixiId;

        expect(baseTexture.textureCacheIds.indexOf(_pixiId)).to.equal(0);
        expect(PIXI.utils.BaseTextureCache[_pixiId]).to.equal(baseTexture);
        baseTexture.destroy();
        expect(baseTexture.textureCacheIds).to.equal(null);
        expect(PIXI.utils.BaseTextureCache[_pixiId]).to.equal(undefined);
    });

    it('should remove Image BaseTexture from cache on destroy', function ()
    {
        cleanCache();

        const image = new Image();

        const texture = PIXI.Texture.fromLoader(image, URL, NAME);

        expect(texture.baseTexture.textureCacheIds.indexOf(NAME)).to.equal(0);
        expect(texture.baseTexture.textureCacheIds.indexOf(URL)).to.equal(1);
        expect(PIXI.utils.BaseTextureCache[NAME]).to.equal(texture.baseTexture);
        texture.destroy(true);
        expect(texture.baseTexture).to.equal(null);
        expect(PIXI.utils.BaseTextureCache[NAME]).to.equal(undefined);
        expect(PIXI.utils.BaseTextureCache[URL]).to.equal(undefined);
    });

    it('should remove BaseTexture from entire cache using removeFromCache (by BaseTexture instance)', function ()
    {
        cleanCache();

        const baseTexture = new PIXI.BaseTexture();

        PIXI.BaseTexture.addToCache(baseTexture, NAME);
        PIXI.BaseTexture.addToCache(baseTexture, NAME2);
        expect(baseTexture.textureCacheIds.indexOf(NAME)).to.equal(0);
        expect(baseTexture.textureCacheIds.indexOf(NAME2)).to.equal(1);
        expect(PIXI.utils.BaseTextureCache[NAME]).to.equal(baseTexture);
        expect(PIXI.utils.BaseTextureCache[NAME2]).to.equal(baseTexture);
        PIXI.BaseTexture.removeFromCache(baseTexture);
        expect(baseTexture.textureCacheIds.indexOf(NAME)).to.equal(-1);
        expect(baseTexture.textureCacheIds.indexOf(NAME2)).to.equal(-1);
        expect(PIXI.utils.BaseTextureCache[NAME]).to.equal(undefined);
        expect(PIXI.utils.BaseTextureCache[NAME2]).to.equal(undefined);
    });

    it('should remove BaseTexture from single cache entry using removeFromCache (by id)', function ()
    {
        cleanCache();

        const baseTexture = new PIXI.BaseTexture();

        PIXI.BaseTexture.addToCache(baseTexture, NAME);
        PIXI.BaseTexture.addToCache(baseTexture, NAME2);
        expect(baseTexture.textureCacheIds.indexOf(NAME)).to.equal(0);
        expect(baseTexture.textureCacheIds.indexOf(NAME2)).to.equal(1);
        expect(PIXI.utils.BaseTextureCache[NAME]).to.equal(baseTexture);
        expect(PIXI.utils.BaseTextureCache[NAME2]).to.equal(baseTexture);
        PIXI.BaseTexture.removeFromCache(NAME);
        expect(baseTexture.textureCacheIds.indexOf(NAME)).to.equal(-1);
        expect(baseTexture.textureCacheIds.indexOf(NAME2)).to.equal(0);
        expect(PIXI.utils.BaseTextureCache[NAME]).to.equal(undefined);
        expect(PIXI.utils.BaseTextureCache[NAME2]).to.equal(baseTexture);
    });

    it('destroying a destroyed BaseTexture should not throw an error', function ()
    {
        const baseTexture = new PIXI.BaseTexture();

        baseTexture.destroy();
        baseTexture.destroy();
    });
});
