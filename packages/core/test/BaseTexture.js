const { BaseTextureCache, TextureCache } = require('@pixi/utils');
const { BaseTexture, Texture, RenderTexture, resources } = require('../');
const { settings } = require('@pixi/settings');
const { ImageResource, SVGResource, VideoResource } = resources;

const URL = 'foo.png';
const NAME = 'foo';
const NAME2 = 'bar';

function cleanCache()
{
    delete BaseTextureCache[URL];
    delete BaseTextureCache[NAME];
    delete BaseTextureCache[NAME2];

    delete TextureCache[URL];
    delete TextureCache[NAME];
    delete TextureCache[NAME2];
}

describe('BaseTexture', function ()
{
    /*
    describe('updateImageType', function ()
    {
        it('should allow no extension', function ()
        {
            cleanCache();

            const baseTexture = new BaseTexture();

            baseTexture.imageUrl = 'http://some.domain.org/100/100';
            baseTexture._updateImageType();

            expect(baseTexture.imageType).to.be.equals('png');
        });
    });
    */

    it('should handle invalid image URL for textures', function (done)
    {
        cleanCache();

        const invalidFile = 'missing-image.png';
        const baseTexture = BaseTexture.from(invalidFile);

        baseTexture.once('error', function (baseTexture, event)
        {
            expect(baseTexture.resource).to.be.instanceof(ImageResource);
            expect(baseTexture.resource.url).contains(invalidFile);
            expect(event.type).to.equal('error');
            baseTexture.destroy();
            done();
        });
    });

    it('should handle invalid svg URL for textures', function (done)
    {
        cleanCache();

        const invalidFile = 'missing-image.svg';
        const baseTexture = BaseTexture.from(invalidFile);

        baseTexture.once('error', function (baseTexture, event)
        {
            expect(baseTexture.resource).to.be.instanceof(SVGResource);
            expect(baseTexture.resource.svg).contains(invalidFile);
            expect(event.type).to.equal('error');
            baseTexture.destroy();
            done();
        });
    });

    it('should handle invalid video URL for textures', function (done)
    {
        cleanCache();

        const invalidFile = 'missing-image.mp4';
        const baseTexture = BaseTexture.from(invalidFile);

        baseTexture.once('error', function (baseTexture, event)
        {
            expect(baseTexture.resource).to.be.instanceof(VideoResource);
            expect(baseTexture.resource.source.firstChild.src).contains(invalidFile);
            expect(event.type).to.equal('error');
            baseTexture.destroy();
            done();
        });
    });

    it('should remove Canvas BaseTexture from cache on destroy', function ()
    {
        cleanCache();

        const canvas = document.createElement('canvas');
        const baseTexture = BaseTexture.from(canvas);
        const _pixiId = canvas._pixiId;

        expect(baseTexture.textureCacheIds.indexOf(_pixiId)).to.equal(0);
        expect(BaseTextureCache[_pixiId]).to.equal(baseTexture);
        baseTexture.destroy();
        expect(baseTexture.textureCacheIds).to.equal(null);
        expect(BaseTextureCache[_pixiId]).to.equal(undefined);
    });

    it('should remove Image BaseTexture from cache on destroy', function ()
    {
        cleanCache();

        const image = new Image();

        const texture = Texture.fromLoader(image, URL, NAME);

        expect(texture.baseTexture.textureCacheIds.indexOf(NAME)).to.equal(0);
        expect(texture.baseTexture.textureCacheIds.indexOf(URL)).to.equal(1);
        expect(BaseTextureCache[NAME]).to.equal(texture.baseTexture);
        texture.destroy(true);
        expect(texture.baseTexture).to.equal(null);
        expect(BaseTextureCache[NAME]).to.equal(undefined);
        expect(BaseTextureCache[URL]).to.equal(undefined);
    });

    it('should remove BaseTexture from entire cache using removeFromCache (by BaseTexture instance)', function ()
    {
        cleanCache();

        const baseTexture = new BaseTexture();

        BaseTexture.addToCache(baseTexture, NAME);
        BaseTexture.addToCache(baseTexture, NAME2);
        expect(baseTexture.textureCacheIds.indexOf(NAME)).to.equal(0);
        expect(baseTexture.textureCacheIds.indexOf(NAME2)).to.equal(1);
        expect(BaseTextureCache[NAME]).to.equal(baseTexture);
        expect(BaseTextureCache[NAME2]).to.equal(baseTexture);
        BaseTexture.removeFromCache(baseTexture);
        expect(baseTexture.textureCacheIds.indexOf(NAME)).to.equal(-1);
        expect(baseTexture.textureCacheIds.indexOf(NAME2)).to.equal(-1);
        expect(BaseTextureCache[NAME]).to.equal(undefined);
        expect(BaseTextureCache[NAME2]).to.equal(undefined);
    });

    it('should remove BaseTexture from single cache entry using removeFromCache (by id)', function ()
    {
        cleanCache();

        const baseTexture = new BaseTexture();

        BaseTexture.addToCache(baseTexture, NAME);
        BaseTexture.addToCache(baseTexture, NAME2);
        expect(baseTexture.textureCacheIds.indexOf(NAME)).to.equal(0);
        expect(baseTexture.textureCacheIds.indexOf(NAME2)).to.equal(1);
        expect(BaseTextureCache[NAME]).to.equal(baseTexture);
        expect(BaseTextureCache[NAME2]).to.equal(baseTexture);
        BaseTexture.removeFromCache(NAME);
        expect(baseTexture.textureCacheIds.indexOf(NAME)).to.equal(-1);
        expect(baseTexture.textureCacheIds.indexOf(NAME2)).to.equal(0);
        expect(BaseTextureCache[NAME]).to.equal(undefined);
        expect(BaseTextureCache[NAME2]).to.equal(baseTexture);
    });

    it('should not throw an error destroying a destroyed BaseTexture', function ()
    {
        const baseTexture = new BaseTexture();

        baseTexture.destroy();
        baseTexture.destroy();
    });

    it('should update width and height', function ()
    {
        const canvas = document.createElement('canvas');

        canvas.width = 100;
        canvas.height = 100;

        const baseTexture = BaseTexture.from(canvas);

        expect(baseTexture.width).to.equal(canvas.width);
        expect(baseTexture.height).to.equal(canvas.height);

        baseTexture.destroy();
    });

    it('should set source.crossOrigin to anonymous if explicitly set', function ()
    {
        cleanCache();

        const imageResource = new ImageResource(URL, {
            crossorigin: true,
        });

        const baseTexture = new BaseTexture(imageResource);

        expect(baseTexture.resource.source.crossOrigin).to.equal('anonymous');

        baseTexture.destroy();
        imageResource.destroy();
    });

    it('should not destroy externally created resources', function ()
    {
        cleanCache();

        const imageResource = new ImageResource(URL);
        const baseTexture = new BaseTexture(imageResource);

        baseTexture.destroy();

        expect(baseTexture.destroyed).to.be.true;
        expect(imageResource.destroyed).to.be.false;

        imageResource.destroy();

        expect(imageResource.destroyed).to.be.true;
    });

    it('should destroy internally created resources', function ()
    {
        cleanCache();

        const baseTexture = new BaseTexture(URL);
        const { resource } = baseTexture;

        baseTexture.destroy();

        expect(resource.destroyed).to.be.true;
        expect(baseTexture.destroyed).to.be.true;
    });

    it('should show correct width/height after setResolution', function ()
    {
        const texture = RenderTexture.create({ width: 15, height: 15 });

        texture.setResolution(0.9);
        expect(texture.baseTexture.realWidth).to.equal(15);
        expect(texture.baseTexture.realHeight).to.equal(15);
    });

    it('should throw and error in strict from mode', function ()
    {
        const id = 'baz';

        expect(() => BaseTexture.from(id, {}, true)).to.throw(`The cacheId "${id}" does not exist in BaseTextureCache.`);
        settings.STRICT_TEXTURE_CACHE = true;
        expect(() => BaseTexture.from(id)).to.throw(`The cacheId "${id}" does not exist in BaseTextureCache.`);
        settings.STRICT_TEXTURE_CACHE = false;
    });
});
