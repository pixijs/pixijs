import {
    BaseTexture,
    BufferResource,
    ImageResource,
    RenderTexture,
    SCALE_MODES,
    SVGResource,
    Texture,
    TYPES,
    VideoResource
} from '@pixi/core';
import { settings } from '@pixi/settings';
import { BaseTextureCache, TextureCache } from '@pixi/utils';

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

describe('BaseTexture', () =>
{
    interface PixiCanvas extends HTMLCanvasElement
    {
        _pixiId: string;
    }

    it('should handle invalid image URL for textures', (done) =>
    {
        cleanCache();

        const invalidFile = 'missing-image.png';
        const baseTexture = BaseTexture.from(invalidFile);

        baseTexture.once('error', (baseTexture, event) =>
        {
            expect(baseTexture.resource).toBeInstanceOf(ImageResource);
            expect(baseTexture.resource.url).toInclude(invalidFile);
            expect(event.type).toEqual('error');
            baseTexture.destroy();
            done();
        });
    });

    it('should handle invalid svg URL for textures', (done) =>
    {
        cleanCache();

        const invalidFile = 'missing-image.svg';
        const baseTexture = BaseTexture.from(invalidFile);

        baseTexture.once('error', (baseTexture, event) =>
        {
            expect(baseTexture.resource).toBeInstanceOf(SVGResource);
            expect(baseTexture.resource.svg).toInclude(invalidFile);
            expect(event.type).toEqual('error');
            baseTexture.destroy();
            done();
        });
    });

    it('should handle invalid video URL for textures', (done) =>
    {
        cleanCache();

        const invalidFile = 'missing-image.mp4';
        const baseTexture = BaseTexture.from(invalidFile);

        baseTexture.once('error', (baseTexture, event) =>
        {
            expect(baseTexture.resource).toBeInstanceOf(VideoResource);
            expect(baseTexture.resource.source.firstChild.src).toInclude(invalidFile);
            expect(event.type).toEqual('error');
            baseTexture.destroy();
            done();
        });
    });

    it('should use pixiIdPrefix correctly', () =>
    {
        cleanCache();

        const canvas = document.createElement('canvas') as PixiCanvas;
        const baseTexture = BaseTexture.from(canvas, { pixiIdPrefix: 'unittest' });
        const _pixiId = canvas._pixiId;

        expect(_pixiId.indexOf('unittest_')).toEqual(0);
        expect(baseTexture.textureCacheIds.indexOf(_pixiId)).toEqual(0);
        expect(BaseTextureCache[_pixiId]).toEqual(baseTexture);
    });

    it('should remove Canvas BaseTexture from cache on destroy', () =>
    {
        cleanCache();

        const canvas = document.createElement('canvas') as PixiCanvas;
        const baseTexture = BaseTexture.from(canvas);
        const _pixiId = canvas._pixiId;

        expect(baseTexture.textureCacheIds.indexOf(_pixiId)).toEqual(0);
        expect(BaseTextureCache[_pixiId]).toEqual(baseTexture);
        baseTexture.destroy();
        expect(baseTexture.textureCacheIds).toEqual(null);
        expect(BaseTextureCache[_pixiId]).toEqual(undefined);
    });

    it('should remove Image BaseTexture from cache on destroy', (done) =>
    {
        cleanCache();

        const image = new Image();

        image.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJ'
            + 'AAAADUlEQVQYV2P4GvD7PwAHvgNAdItKlAAAAABJRU5ErkJggg==';

        Texture.fromLoader(image, URL, NAME).then((texture) =>
        {
            expect(texture.baseTexture.textureCacheIds.indexOf(NAME)).toEqual(0);
            expect(texture.baseTexture.textureCacheIds.indexOf(URL)).toEqual(1);
            expect(BaseTextureCache[NAME]).toEqual(texture.baseTexture);
            texture.destroy(true);
            expect(texture.baseTexture).toEqual(null);
            expect(BaseTextureCache[NAME]).toEqual(undefined);
            expect(BaseTextureCache[URL]).toEqual(undefined);

            done();
        });
    });

    it('should remove BaseTexture from entire cache using removeFromCache (by BaseTexture instance)', () =>
    {
        cleanCache();

        const baseTexture = new BaseTexture();

        BaseTexture.addToCache(baseTexture, NAME);
        BaseTexture.addToCache(baseTexture, NAME2);
        expect(baseTexture.textureCacheIds.indexOf(NAME)).toEqual(0);
        expect(baseTexture.textureCacheIds.indexOf(NAME2)).toEqual(1);
        expect(BaseTextureCache[NAME]).toEqual(baseTexture);
        expect(BaseTextureCache[NAME2]).toEqual(baseTexture);
        BaseTexture.removeFromCache(baseTexture);
        expect(baseTexture.textureCacheIds.indexOf(NAME)).toEqual(-1);
        expect(baseTexture.textureCacheIds.indexOf(NAME2)).toEqual(-1);
        expect(BaseTextureCache[NAME]).toEqual(undefined);
        expect(BaseTextureCache[NAME2]).toEqual(undefined);
    });

    it('should remove BaseTexture from single cache entry using removeFromCache (by id)', () =>
    {
        cleanCache();

        const baseTexture = new BaseTexture();

        BaseTexture.addToCache(baseTexture, NAME);
        BaseTexture.addToCache(baseTexture, NAME2);
        expect(baseTexture.textureCacheIds.indexOf(NAME)).toEqual(0);
        expect(baseTexture.textureCacheIds.indexOf(NAME2)).toEqual(1);
        expect(BaseTextureCache[NAME]).toEqual(baseTexture);
        expect(BaseTextureCache[NAME2]).toEqual(baseTexture);
        BaseTexture.removeFromCache(NAME);
        expect(baseTexture.textureCacheIds.indexOf(NAME)).toEqual(-1);
        expect(baseTexture.textureCacheIds.indexOf(NAME2)).toEqual(0);
        expect(BaseTextureCache[NAME]).toEqual(undefined);
        expect(BaseTextureCache[NAME2]).toEqual(baseTexture);
    });

    it('should not throw an error destroying a destroyed BaseTexture', () =>
    {
        const baseTexture = new BaseTexture();

        baseTexture.destroy();
        baseTexture.destroy();
    });

    it('should update width and height', () =>
    {
        const canvas = document.createElement('canvas');

        canvas.width = 100;
        canvas.height = 100;

        const baseTexture = BaseTexture.from(canvas);

        expect(baseTexture.width).toEqual(canvas.width);
        expect(baseTexture.height).toEqual(canvas.height);

        baseTexture.destroy();
    });

    it('should set source.crossOrigin to anonymous if explicitly set', () =>
    {
        cleanCache();

        const imageResource = new ImageResource(URL, {
            crossorigin: true,
        });

        const baseTexture = new BaseTexture(imageResource);
        const source = (baseTexture.resource as ImageResource).source as HTMLImageElement;

        expect(source.crossOrigin).toEqual('anonymous');

        baseTexture.destroy();
        imageResource.destroy();
    });

    it('should not destroy externally created resources', () =>
    {
        cleanCache();

        const imageResource = new ImageResource(URL);
        const baseTexture = new BaseTexture(imageResource);

        baseTexture.destroy();

        expect(baseTexture.destroyed).toBe(true);
        expect(imageResource.destroyed).toBe(false);

        imageResource.destroy();

        expect(imageResource.destroyed).toBe(true);
    });

    it('should destroy internally created resources', () =>
    {
        cleanCache();

        const baseTexture = new BaseTexture(URL);
        const { resource } = baseTexture;

        baseTexture.destroy();

        expect(resource.destroyed).toBe(true);
        expect(baseTexture.destroyed).toBe(true);
    });

    it('should show correct width/height after setResolution', () =>
    {
        const texture = RenderTexture.create({ width: 15, height: 15 });

        texture.setResolution(0.9);
        expect(texture.baseTexture.realWidth).toEqual(15);
        expect(texture.baseTexture.realHeight).toEqual(15);
    });

    it('should throw and error in strict from mode', () =>
    {
        const id = 'baz';

        expect(() => BaseTexture.from(id, {}, true)).toThrowError(`The cacheId "${id}" does not exist in BaseTextureCache.`);
        settings.STRICT_TEXTURE_CACHE = true;
        expect(() => BaseTexture.from(id)).toThrowError(`The cacheId "${id}" does not exist in BaseTextureCache.`);
        settings.STRICT_TEXTURE_CACHE = false;
    });

    it('should create texture from buffer with correct type', () =>
    {
        const baseTexture = BaseTexture.fromBuffer(new Float32Array(2 * 3 * 4), 2, 3, {
            scaleMode: SCALE_MODES.LINEAR
        });

        expect(baseTexture.type).toBe(TYPES.FLOAT);

        baseTexture.destroy();
    });

    it('should destroy the resource of the texture that was created with fromBuffer', () =>
    {
        const baseTexture = BaseTexture.fromBuffer(new Float32Array(2 * 3 * 4), 2, 3);
        const resource = baseTexture.resource;

        expect(resource).toBeInstanceOf(BufferResource);

        baseTexture.destroy();

        expect(resource.destroyed).toBeTrue();
    });
});
