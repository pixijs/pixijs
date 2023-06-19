import path from 'path';
import { BaseTexture, Texture } from '@pixi/core';
import { Point, Rectangle } from '@pixi/math';
import { settings } from '@pixi/settings';
import { BaseTextureCache, TextureCache } from '@pixi/utils';

import type { ImageResource } from '@pixi/core';

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

interface PixiCanvas extends HTMLCanvasElement
{
    _pixiId: string;
}

describe('Texture', () =>
{
    it('should register Texture from Loader', (done) =>
    {
        cleanCache();

        const image = new Image();

        image.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJ'
            + 'AAAADUlEQVQYV2P4GvD7PwAHvgNAdItKlAAAAABJRU5ErkJggg==';

        Texture.fromLoader(image, URL, NAME).then((texture) =>
        {
            expect((texture.baseTexture.resource as ImageResource).url).toEqual('foo.png');
            expect(TextureCache[NAME]).toEqual(texture);
            expect(BaseTextureCache[NAME]).toEqual(texture.baseTexture);
            expect(TextureCache[URL]).toEqual(texture);
            expect(BaseTextureCache[URL]).toEqual(texture.baseTexture);

            done();
        });
    });

    it('should remove Texture from cache on destroy', () =>
    {
        cleanCache();

        const texture = new Texture(new BaseTexture());

        Texture.addToCache(texture, NAME);
        Texture.addToCache(texture, NAME2);
        expect(texture.textureCacheIds.indexOf(NAME)).toEqual(0);
        expect(texture.textureCacheIds.indexOf(NAME2)).toEqual(1);
        expect(TextureCache[NAME]).toEqual(texture);
        expect(TextureCache[NAME2]).toEqual(texture);
        texture.destroy();
        expect(texture.textureCacheIds).toEqual(null);
        expect(TextureCache[NAME]).toEqual(undefined);
        expect(TextureCache[NAME2]).toEqual(undefined);
    });

    it('should use pixiIdPrefix correctly', () =>
    {
        cleanCache();

        const canvas = document.createElement('canvas');
        const texture = Texture.from(canvas, { pixiIdPrefix: 'unittest' });
        const baseTexture = texture.baseTexture as BaseTexture<ImageResource>;
        const _pixiId = (baseTexture.resource.source as PixiCanvas)._pixiId;

        expect(_pixiId.indexOf('unittest_')).toEqual(0);
        expect(baseTexture.textureCacheIds.indexOf(_pixiId)).toEqual(0);
        expect(BaseTextureCache[_pixiId]).toEqual(baseTexture);
        expect(texture.textureCacheIds.indexOf(_pixiId)).toEqual(0);
        expect(TextureCache[_pixiId]).toEqual(texture);
    });

    it('should be added to the texture cache correctly, '
     + 'and should remove only itself, not effecting the base texture and its cache', () =>
    {
        cleanCache();

        const texture = new Texture(new BaseTexture());

        BaseTexture.addToCache(texture.baseTexture, NAME);
        Texture.addToCache(texture, NAME);
        expect(texture.baseTexture.textureCacheIds.indexOf(NAME)).toEqual(0);
        expect(texture.textureCacheIds.indexOf(NAME)).toEqual(0);
        expect(BaseTextureCache[NAME]).toEqual(texture.baseTexture);
        expect(TextureCache[NAME]).toEqual(texture);
        Texture.removeFromCache(NAME);
        expect(texture.baseTexture.textureCacheIds.indexOf(NAME)).toEqual(0);
        expect(texture.textureCacheIds.indexOf(NAME)).toEqual(-1);
        expect(BaseTextureCache[NAME]).toEqual(texture.baseTexture);
        expect(TextureCache[NAME]).toEqual(undefined);
    });

    it('should remove Texture from entire cache using removeFromCache (by Texture instance)', () =>
    {
        cleanCache();

        const texture = new Texture(new BaseTexture());

        Texture.addToCache(texture, NAME);
        Texture.addToCache(texture, NAME2);
        expect(texture.textureCacheIds.indexOf(NAME)).toEqual(0);
        expect(texture.textureCacheIds.indexOf(NAME2)).toEqual(1);
        expect(TextureCache[NAME]).toEqual(texture);
        expect(TextureCache[NAME2]).toEqual(texture);
        Texture.removeFromCache(texture);
        expect(texture.textureCacheIds.indexOf(NAME)).toEqual(-1);
        expect(texture.textureCacheIds.indexOf(NAME2)).toEqual(-1);
        expect(TextureCache[NAME]).toEqual(undefined);
        expect(TextureCache[NAME2]).toEqual(undefined);
    });

    it('should remove Texture from single cache entry using removeFromCache (by id)', () =>
    {
        cleanCache();

        const texture = new Texture(new BaseTexture());

        Texture.addToCache(texture, NAME);
        Texture.addToCache(texture, NAME2);
        expect(texture.textureCacheIds.indexOf(NAME)).toEqual(0);
        expect(texture.textureCacheIds.indexOf(NAME2)).toEqual(1);
        expect(TextureCache[NAME]).toEqual(texture);
        expect(TextureCache[NAME2]).toEqual(texture);
        Texture.removeFromCache(NAME);
        expect(texture.textureCacheIds.indexOf(NAME)).toEqual(-1);
        expect(texture.textureCacheIds.indexOf(NAME2)).toEqual(0);
        expect(TextureCache[NAME]).toEqual(undefined);
        expect(TextureCache[NAME2]).toEqual(texture);
    });

    it('should not remove Texture from cache if Texture instance has been replaced', () =>
    {
        cleanCache();

        const texture = new Texture(new BaseTexture());
        const texture2 = new Texture(new BaseTexture());

        Texture.addToCache(texture, NAME);
        expect(texture.textureCacheIds.indexOf(NAME)).toEqual(0);
        expect(TextureCache[NAME]).toEqual(texture);
        Texture.addToCache(texture2, NAME);
        expect(texture2.textureCacheIds.indexOf(NAME)).toEqual(0);
        expect(TextureCache[NAME]).toEqual(texture2);
        Texture.removeFromCache(texture);
        expect(texture.textureCacheIds.indexOf(NAME)).toEqual(-1);
        expect(texture2.textureCacheIds.indexOf(NAME)).toEqual(0);
        expect(TextureCache[NAME]).toEqual(texture2);
    });

    it('destroying a destroyed texture should not throw an error', () =>
    {
        const texture = new Texture(new BaseTexture());

        texture.destroy(true);
        texture.destroy(true);
    });

    it('should not throw if base texture loaded after destroy', () =>
    {
        const base = new BaseTexture();
        const texture = new Texture(base);

        texture.destroy();
        base.emit('loaded', base);
    });

    it('should clone a minimal texture', () =>
    {
        const baseTexture = new BaseTexture();
        const frame = new Rectangle(0, 0, 10, 10);
        const texture = new Texture(baseTexture, frame);
        const clone = texture.clone();
        const toJSON = ({ x, y, width, height }: any) => ({ x, y, width, height });

        expect(clone.baseTexture).toEqual(baseTexture);
        expect(clone.frame).not.toBe(texture.frame);
        expect(toJSON(clone.frame)).toEqual(toJSON(texture.frame));
        expect(clone.trim).toBeUndefined();
        expect(clone.orig).not.toBe(texture.orig);
        expect(toJSON(clone.orig)).toEqual(toJSON(texture.orig));
        expect(clone.frame === clone.orig).toEqual(texture.frame === texture.orig);
        expect(clone.noFrame).toEqual(texture.noFrame);

        clone.destroy();
        texture.destroy(true);
    });

    it('should clone a texture', () =>
    {
        const baseTexture = new BaseTexture();
        const frame = new Rectangle();
        const orig = new Rectangle();
        const trim = new Rectangle();
        const rotate = 2;
        const anchor = new Point(1, 0.5);
        const texture = new Texture(baseTexture, frame, orig, trim, rotate, anchor);
        const clone = texture.clone();
        const toJSON = ({ x, y, width, height }: any) => ({ x, y, width, height });

        expect(clone.baseTexture).toEqual(baseTexture);
        expect(clone.defaultAnchor).not.toBe(texture.defaultAnchor);
        expect(clone.defaultAnchor.x).toEqual(texture.defaultAnchor.x);
        expect(clone.defaultAnchor.y).toEqual(texture.defaultAnchor.y);
        expect(clone.frame).not.toBe(texture.frame);
        expect(toJSON(clone.frame)).toEqual(toJSON(texture.frame));
        expect(clone.trim).not.toBe(texture.trim);
        expect(toJSON(clone.trim)).toEqual(toJSON(texture.trim));
        expect(clone.orig).not.toBe(texture.orig);
        expect(toJSON(clone.orig)).toEqual(toJSON(texture.orig));
        expect(clone.rotate).toEqual(texture.rotate);
        expect(clone.frame === clone.orig).toEqual(texture.frame === texture.orig);
        expect(clone.noFrame).toEqual(texture.noFrame);

        clone.destroy();
        texture.destroy(true);
    });

    it('should update frame if its backed by canvas that was resized', () =>
    {
        const canvas = document.createElement('canvas');

        canvas.width = 50;
        canvas.height = 50;

        const texture = Texture.from(canvas);

        expect(texture.noFrame).toEqual(true);
        expect(texture.width).toEqual(50);
        canvas.width = 100;
        texture.update();
        expect(texture.width).toEqual(100);
        canvas.height = 70;
        texture.update();
        expect(texture.height).toEqual(70);

        const clone = texture.clone();

        expect(texture.noFrame).toEqual(true);
        expect(clone.width).toEqual(100);
        expect(clone.height).toEqual(70);
        canvas.width = 40;
        clone.update();
        expect(clone.width).toEqual(40);
        canvas.height = 60;
        clone.update();
        expect(clone.height).toEqual(60);

        clone.destroy();
        texture.destroy(true);
    });

    it('should update frame on baseTexture update only if user set it in constructor or in setter', () =>
    {
        let baseTexture = new BaseTexture();

        baseTexture.setSize(50, 50);

        let texture = new Texture(baseTexture);

        expect(texture.noFrame).toEqual(true);
        expect(texture.width).toEqual(50);
        baseTexture.setSize(100, 70);
        expect(texture.width).toEqual(100);
        expect(texture.height).toEqual(70);

        texture.frame = new Rectangle(1, 1, 10, 20);
        expect(texture.noFrame).toEqual(false);
        baseTexture.setSize(110, 80);
        expect(texture.width).toEqual(10);
        expect(texture.height).toEqual(20);
        texture.destroy(true);

        baseTexture = new BaseTexture();
        texture = new Texture(baseTexture, new Rectangle(1, 1, 10, 20));
        expect(texture.noFrame).toEqual(false);
        baseTexture.setSize(50, 50);
        expect(texture.width).toEqual(10);
        expect(texture.height).toEqual(20);
        texture.destroy(true);
    });

    it('should throw and error in strict from mode', () =>
    {
        const id = 'baz';

        expect(() => Texture.from(id, {}, true)).toThrowError(`The cacheId "${id}" does not exist in TextureCache.`);
        settings.STRICT_TEXTURE_CACHE = true;
        expect(() => Texture.from(id)).toThrowError(`The cacheId "${id}" does not exist in TextureCache.`);
        settings.STRICT_TEXTURE_CACHE = false;
    });

    describe('Texture.from', () =>
    {
        it('should accept & cache a BaseTexture', () =>
        {
            const baseTexture = new BaseTexture(null, { width: 100, height: 100 });
            const texture1 = Texture.from(baseTexture);

            expect(baseTexture.cacheId).not.toBeNull();
            expect(BaseTextureCache[baseTexture.cacheId]).toEqual(baseTexture);
            expect(texture1.baseTexture).toEqual(baseTexture);

            expect(Texture.from(baseTexture)).toEqual(texture1);
        });

        it('should accept an array of strings to create a cubemap', () =>
        {
            const resources = path.join(process.cwd(), 'packages/core/test/resources/');

            const texture = Texture.from([
                path.join(resources, 'cube-face.jpg'),
                path.join(resources, 'cube-face.jpg'),
                path.join(resources, 'cube-face.jpg'),
                path.join(resources, 'cube-face.jpg'),
                path.join(resources, 'cube-face.jpg'),
                path.join(resources, 'cube-face.jpg')]);

            expect(texture).not.toBeNull();
            expect(texture).toBeDefined();

            expect(texture).toBeInstanceOf(Texture);
        });
    });

    describe('Texture.fromURL', () =>
    {
        it('should handle loading an invalid URL', async () =>
        {
            const throwingFunction = () => Texture.fromURL('invalid/image.png');

            await throwingFunction().catch((e) => expect(e).toBeInstanceOf(Event));
        });

        it('should handle loading an cached URL', async () =>
        {
            const url = 'noop.png';

            TextureCache[url] = Texture.WHITE;

            expect(Texture.WHITE.valid).toBe(true);

            const texture = await Texture.fromURL(url);

            expect(texture).toEqual(Texture.WHITE);
            delete TextureCache[url];
        });

        it('should accept an array of strings to create a cubemap', async () =>
        {
            const resources = path.join(__dirname, 'resources');

            const texture = await Texture.fromURL([
                path.join(resources, 'cube-face.jpg'),
                path.join(resources, 'cube-face.jpg'),
                path.join(resources, 'cube-face.jpg'),
                path.join(resources, 'cube-face.jpg'),
                path.join(resources, 'cube-face.jpg'),
                path.join(resources, 'cube-face.jpg')]);

            expect(texture).not.toBeNull();
            expect(texture).toBeDefined();
            expect(texture).toBeInstanceOf(Texture);
        });
    });
});
