import { BaseTexture, Texture } from '@pixi/core';
import { BaseTextureCache, clearTextureCache, destroyTextureCache, TextureCache } from '@pixi/utils';

describe('TextureCache', () =>
{
    beforeEach(() =>
    {
        destroyTextureCache();
        clearTextureCache();
    });

    it('should exist', () =>
    {
        expect(TextureCache).toBeObject();
    });

    describe('destroyTextureCache', () =>
    {
        it('should successfully destroy the texture cache', () =>
        {
            const canvas = document.createElement('canvas');
            const foo = new Texture(new BaseTexture(canvas));
            const bar = new Texture(new BaseTexture(canvas));

            TextureCache.foo = foo;
            TextureCache.bar = bar;
            BaseTextureCache.foo = foo.baseTexture;
            BaseTextureCache.bar = bar.baseTexture;

            expect(Object.keys(TextureCache).length).toEqual(2);
            expect(Object.keys(BaseTextureCache).length).toEqual(2);

            destroyTextureCache();

            expect(Object.keys(TextureCache).length).toEqual(2);
            expect(Object.keys(BaseTextureCache).length).toEqual(2);
            expect(foo.baseTexture).toBeNull();
            expect(bar.baseTexture).toBeNull();

            clearTextureCache();

            expect(Object.keys(TextureCache).length).toEqual(0);
            expect(Object.keys(BaseTextureCache).length).toEqual(0);
        });
    });

    describe('clearTextureCache', () =>
    {
        it('should successfully clear the texture cache', () =>
        {
            const canvas = document.createElement('canvas');
            const foo = new Texture(new BaseTexture(canvas));
            const bar = new Texture(new BaseTexture(canvas));

            TextureCache.foo = foo;
            TextureCache.bar = bar;
            BaseTextureCache.foo = foo.baseTexture;
            BaseTextureCache.bar = bar.baseTexture;

            expect(Object.keys(TextureCache).length).toEqual(2);
            expect(Object.keys(BaseTextureCache).length).toEqual(2);

            clearTextureCache();

            expect(Object.keys(TextureCache).length).toEqual(0);
            expect(Object.keys(BaseTextureCache).length).toEqual(0);
            expect(foo.baseTexture).toBeInstanceOf(BaseTexture);
            expect(bar.baseTexture).toBeInstanceOf(BaseTexture);

            foo.destroy(true);
            bar.destroy(true);
        });
    });
});
