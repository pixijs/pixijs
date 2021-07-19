import { BaseTextureCache, TextureCache } from '@pixi/utils';
import { Rectangle, Point } from '@pixi/math';
import { BaseTexture, Texture } from '@pixi/core';
import { settings } from '@pixi/settings';
import { expect } from 'chai';

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

describe('Texture', function ()
{
    it('should register Texture from Loader', function (done)
    {
        cleanCache();

        const image = new Image();

        image.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJ'
            + 'AAAADUlEQVQYV2P4GvD7PwAHvgNAdItKlAAAAABJRU5ErkJggg==';

        Texture.fromLoader(image, URL, NAME).then((texture) =>
        {
            expect(texture.baseTexture.resource.url).to.equal('foo.png');
            expect(TextureCache[NAME]).to.equal(texture);
            expect(BaseTextureCache[NAME]).to.equal(texture.baseTexture);
            expect(TextureCache[URL]).to.equal(texture);
            expect(BaseTextureCache[URL]).to.equal(texture.baseTexture);

            done();
        });
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

    it('should use pixiIdPrefix correctly', function ()
    {
        cleanCache();

        const canvas = document.createElement('canvas');
        const texture = Texture.from(canvas, { pixiIdPrefix: 'unittest' });
        const baseTexture = texture.baseTexture;
        const _pixiId = baseTexture.resource.source._pixiId;

        expect(_pixiId.indexOf('unittest_')).to.equal(0);
        expect(baseTexture.textureCacheIds.indexOf(_pixiId)).to.equal(0);
        expect(BaseTextureCache[_pixiId]).to.equal(baseTexture);
        expect(texture.textureCacheIds.indexOf(_pixiId)).to.equal(0);
        expect(TextureCache[_pixiId]).to.equal(texture);
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
        expect(clone.frame === clone.orig).to.equal(texture.frame === texture.orig);
        expect(clone.noFrame).to.equal(texture.noFrame);

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
        expect(clone.frame === clone.orig).to.equal(texture.frame === texture.orig);
        expect(clone.noFrame).to.equal(texture.noFrame);

        clone.destroy();
        texture.destroy(true);
    });

    it('should update frame if its backed by canvas that was resized', function ()
    {
        const canvas = document.createElement('canvas');

        canvas.width = 50;
        canvas.height = 50;

        const texture = Texture.from(canvas);

        expect(texture.noFrame).to.equal(true);
        expect(texture.width).to.equal(50);
        canvas.width = 100;
        texture.update();
        expect(texture.width).to.equal(100);
        canvas.height = 70;
        texture.update();
        expect(texture.height).to.equal(70);

        const clone = texture.clone();

        expect(texture.noFrame).to.equal(true);
        expect(clone.width).to.equal(100);
        expect(clone.height).to.equal(70);
        canvas.width = 40;
        clone.update();
        expect(clone.width).to.equal(40);
        canvas.height = 60;
        clone.update();
        expect(clone.height).to.equal(60);

        clone.destroy();
        texture.destroy(true);
    });

    it('should update frame on baseTexture update only if user set it in constructor or in setter', function ()
    {
        let baseTexture = new BaseTexture();

        baseTexture.setSize(50, 50);

        let texture = new Texture(baseTexture);

        expect(texture.noFrame).to.equal(true);
        expect(texture.width).to.equal(50);
        baseTexture.setSize(100, 70);
        expect(texture.width).to.equal(100);
        expect(texture.height).to.equal(70);

        texture.frame = new Rectangle(1, 1, 10, 20);
        expect(texture.noFrame).to.equal(false);
        baseTexture.setSize(110, 80);
        expect(texture.width).to.equal(10);
        expect(texture.height).to.equal(20);
        texture.destroy(true);

        baseTexture = new BaseTexture();
        texture = new Texture(baseTexture, new Rectangle(1, 1, 10, 20));
        expect(texture.noFrame).to.equal(false);
        baseTexture.setSize(50, 50);
        expect(texture.width).to.equal(10);
        expect(texture.height).to.equal(20);
        texture.destroy(true);
    });

    it('should handle loading an invalid URL', function ()
    {
        expect(() => Texture.fromURL('invalid/image.png')).throws;
    });

    it('should handle loading an cached URL', async function ()
    {
        const url = 'noop.png';

        TextureCache[url] = Texture.WHITE;

        expect(Texture.WHITE.valid).to.be.true;

        const texture = await Texture.fromURL(url);

        expect(texture).equals(Texture.WHITE);
        delete TextureCache[url];
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
