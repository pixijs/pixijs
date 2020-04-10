const { BaseTextureCache, TextureCache } = require('@pixi/utils');
const { Rectangle, Point } = require('@pixi/math');
const { BaseTexture, Texture } = require('../');
const { settings } = require('@pixi/settings');

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

describe('PIXI.Texture', function ()
{
    it('should register Texture from Loader', function ()
    {
        cleanCache();

        const image = new Image();

        const texture = Texture.fromLoader(image, URL, NAME);

        expect(texture.baseTexture.resource.url).to.equal('foo.png');
        expect(TextureCache[NAME]).to.equal(texture);
        expect(BaseTextureCache[NAME]).to.equal(texture.baseTexture);
        expect(TextureCache[URL]).to.equal(texture);
        expect(BaseTextureCache[URL]).to.equal(texture.baseTexture);
    });

    it('should remove Texture from cache on destroy', function ()
    {
        cleanCache();

        const texture = new Texture(new BaseTexture());

        Texture.addToCache(texture, NAME);
        Texture.addToCache(texture, NAME2);
        expect(texture.textureCacheIds.indexOf(NAME)).to.equal(0);
        expect(texture.textureCacheIds.indexOf(NAME2)).to.equal(1);
        expect(TextureCache[NAME]).to.equal(texture);
        expect(TextureCache[NAME2]).to.equal(texture);
        texture.destroy();
        expect(texture.textureCacheIds).to.equal(null);
        expect(TextureCache[NAME]).to.equal(undefined);
        expect(TextureCache[NAME2]).to.equal(undefined);
    });

    it('should be added to the texture cache correctly, '
     + 'and should remove only itself, not effecting the base texture and its cache', function ()
    {
        cleanCache();

        const texture = new Texture(new BaseTexture());

        BaseTexture.addToCache(texture.baseTexture, NAME);
        Texture.addToCache(texture, NAME);
        expect(texture.baseTexture.textureCacheIds.indexOf(NAME)).to.equal(0);
        expect(texture.textureCacheIds.indexOf(NAME)).to.equal(0);
        expect(BaseTextureCache[NAME]).to.equal(texture.baseTexture);
        expect(TextureCache[NAME]).to.equal(texture);
        Texture.removeFromCache(NAME);
        expect(texture.baseTexture.textureCacheIds.indexOf(NAME)).to.equal(0);
        expect(texture.textureCacheIds.indexOf(NAME)).to.equal(-1);
        expect(BaseTextureCache[NAME]).to.equal(texture.baseTexture);
        expect(TextureCache[NAME]).to.equal(undefined);
    });

    it('should remove Texture from entire cache using removeFromCache (by Texture instance)', function ()
    {
        cleanCache();

        const texture = new Texture(new BaseTexture());

        Texture.addToCache(texture, NAME);
        Texture.addToCache(texture, NAME2);
        expect(texture.textureCacheIds.indexOf(NAME)).to.equal(0);
        expect(texture.textureCacheIds.indexOf(NAME2)).to.equal(1);
        expect(TextureCache[NAME]).to.equal(texture);
        expect(TextureCache[NAME2]).to.equal(texture);
        Texture.removeFromCache(texture);
        expect(texture.textureCacheIds.indexOf(NAME)).to.equal(-1);
        expect(texture.textureCacheIds.indexOf(NAME2)).to.equal(-1);
        expect(TextureCache[NAME]).to.equal(undefined);
        expect(TextureCache[NAME2]).to.equal(undefined);
    });

    it('should remove Texture from single cache entry using removeFromCache (by id)', function ()
    {
        cleanCache();

        const texture = new Texture(new BaseTexture());

        Texture.addToCache(texture, NAME);
        Texture.addToCache(texture, NAME2);
        expect(texture.textureCacheIds.indexOf(NAME)).to.equal(0);
        expect(texture.textureCacheIds.indexOf(NAME2)).to.equal(1);
        expect(TextureCache[NAME]).to.equal(texture);
        expect(TextureCache[NAME2]).to.equal(texture);
        Texture.removeFromCache(NAME);
        expect(texture.textureCacheIds.indexOf(NAME)).to.equal(-1);
        expect(texture.textureCacheIds.indexOf(NAME2)).to.equal(0);
        expect(TextureCache[NAME]).to.equal(undefined);
        expect(TextureCache[NAME2]).to.equal(texture);
    });

    it('should not remove Texture from cache if Texture instance has been replaced', function ()
    {
        cleanCache();

        const texture = new Texture(new BaseTexture());
        const texture2 = new Texture(new BaseTexture());

        Texture.addToCache(texture, NAME);
        expect(texture.textureCacheIds.indexOf(NAME)).to.equal(0);
        expect(TextureCache[NAME]).to.equal(texture);
        Texture.addToCache(texture2, NAME);
        expect(texture2.textureCacheIds.indexOf(NAME)).to.equal(0);
        expect(TextureCache[NAME]).to.equal(texture2);
        Texture.removeFromCache(texture);
        expect(texture.textureCacheIds.indexOf(NAME)).to.equal(-1);
        expect(texture2.textureCacheIds.indexOf(NAME)).to.equal(0);
        expect(TextureCache[NAME]).to.equal(texture2);
    });

    it('destroying a destroyed texture should not throw an error', function ()
    {
        const texture = new Texture(new BaseTexture());

        texture.destroy(true);
        texture.destroy(true);
    });

    it('should not throw if base texture loaded after destroy', function ()
    {
        const base = new BaseTexture();
        const texture = new Texture(base);

        texture.destroy();
        base.emit('loaded', base);
    });

    it('should clone a minimal texture', function ()
    {
        const baseTexture = new BaseTexture();
        const frame = new Rectangle(0, 0, 10, 10);
        const texture = new Texture(baseTexture, frame);
        const clone = texture.clone();
        const toJSON = ({ x, y, width, height }) => ({ x, y, width, height });

        expect(clone.baseTexture).to.equal(baseTexture);
        expect(clone.frame).to.not.equal(texture.frame);
        expect(toJSON(clone.frame)).to.deep.equal(toJSON(texture.frame));
        expect(clone.trim).to.be.undefined;
        expect(clone.orig).to.not.equal(texture.orig);
        expect(toJSON(clone.orig)).to.deep.equal(toJSON(texture.orig));

        clone.destroy();
        texture.destroy(true);
    });

    it('should clone a texture', function ()
    {
        const baseTexture = new BaseTexture();
        const frame = new Rectangle();
        const orig = new Rectangle();
        const trim = new Rectangle();
        const rotate = 2;
        const anchor = new Point(1, 0.5);
        const texture = new Texture(baseTexture, frame, orig, trim, rotate, anchor);
        const clone = texture.clone();
        const toJSON = ({ x, y, width, height }) => ({ x, y, width, height });

        expect(clone.baseTexture).to.equal(baseTexture);
        expect(clone.defaultAnchor).to.not.equal(texture.defaultAnchor);
        expect(clone.defaultAnchor.x).to.equal(texture.defaultAnchor.x);
        expect(clone.defaultAnchor.y).to.equal(texture.defaultAnchor.y);
        expect(clone.frame).to.not.equal(texture.frame);
        expect(toJSON(clone.frame)).to.deep.equal(toJSON(texture.frame));
        expect(clone.trim).to.not.equal(texture.trim);
        expect(toJSON(clone.trim)).to.deep.equal(toJSON(texture.trim));
        expect(clone.orig).to.not.equal(texture.orig);
        expect(toJSON(clone.orig)).to.deep.equal(toJSON(texture.orig));
        expect(clone.rotate).to.equal(texture.rotate);

        clone.destroy();
        texture.destroy(true);
    });

    it('should update frame if its backed by canvas that was resized', function ()
    {
        const canvas = document.createElement('canvas');

        canvas.width = 50;
        canvas.height = 50;

        const texture = Texture.from(canvas);

        expect(texture.width).to.equal(50);
        canvas.width = 100;
        texture.update();
        expect(texture.width).to.equal(100);
        canvas.height = 70;
        texture.update();
        expect(texture.height).to.equal(70);
        texture.destroy(true);
    });

    it('should update frame on baseTexture update only if user set it in constructor or in setter', function ()
    {
        let baseTexture = new BaseTexture();

        baseTexture.setSize(50, 50);

        let texture = new Texture(baseTexture);

        expect(texture.width).to.equal(50);
        baseTexture.setSize(100, 70);
        expect(texture.width).to.equal(100);
        expect(texture.height).to.equal(70);

        texture.frame = new Rectangle(1, 1, 10, 20);
        baseTexture.setSize(110, 80);
        expect(texture.width).to.equal(10);
        expect(texture.height).to.equal(20);
        texture.destroy(true);

        baseTexture = new BaseTexture();
        texture = new Texture(baseTexture, new Rectangle(1, 1, 10, 20));
        baseTexture.setSize(50, 50);
        expect(texture.width).to.equal(10);
        expect(texture.height).to.equal(20);
        texture.destroy(true);
    });

    it('should throw and error in strict from mode', function ()
    {
        const id = 'baz';

        expect(() => Texture.from(id, {}, true)).to.throw(`The cacheId "${id}" does not exist in TextureCache.`);
        settings.STRICT_TEXTURE_CACHE = true;
        expect(() => Texture.from(id)).to.throw(`The cacheId "${id}" does not exist in TextureCache.`);
        settings.STRICT_TEXTURE_CACHE = false;
    });
});
