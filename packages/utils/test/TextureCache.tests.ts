import { Texture, BaseTexture } from '@pixi/core';
import { TextureCache, destroyTextureCache, clearTextureCache, BaseTextureCache } from '@pixi/utils';
import { expect } from 'chai';

describe('TextureCache', function ()
{
    beforeEach(function ()
    {
        destroyTextureCache();
        clearTextureCache();
    });

    it('should exist', function ()
    {
        expect(TextureCache).to.be.an('object');
    });

    describe('destroyTextureCache', function ()
    {
        it('should successfully destroy the texture cache', function ()
        {
            const canvas = document.createElement('canvas');
            const foo = new Texture(new BaseTexture(canvas));
            const bar = new Texture(new BaseTexture(canvas));

            TextureCache.foo = foo;
            TextureCache.bar = bar;
            BaseTextureCache.foo = foo.baseTexture;
            BaseTextureCache.bar = bar.baseTexture;

            expect(Object.keys(TextureCache).length).to.equal(2);
            expect(Object.keys(BaseTextureCache).length).to.equal(2);

            destroyTextureCache();

            expect(Object.keys(TextureCache).length).to.equal(2);
            expect(Object.keys(BaseTextureCache).length).to.equal(2);
            expect(foo.baseTexture).to.be.null;
            expect(bar.baseTexture).to.be.null;

            clearTextureCache();

            expect(Object.keys(TextureCache).length).to.equal(0);
            expect(Object.keys(BaseTextureCache).length).to.equal(0);
        });
    });

    describe('clearTextureCache', function ()
    {
        it('should successfully clear the texture cache', function ()
        {
            const canvas = document.createElement('canvas');
            const foo = new Texture(new BaseTexture(canvas));
            const bar = new Texture(new BaseTexture(canvas));

            TextureCache.foo = foo;
            TextureCache.bar = bar;
            BaseTextureCache.foo = foo.baseTexture;
            BaseTextureCache.bar = bar.baseTexture;

            expect(Object.keys(TextureCache).length).to.equal(2);
            expect(Object.keys(BaseTextureCache).length).to.equal(2);

            clearTextureCache();

            expect(Object.keys(TextureCache).length).to.equal(0);
            expect(Object.keys(BaseTextureCache).length).to.equal(0);
            expect(foo.baseTexture).to.be.instanceOf(BaseTexture);
            expect(bar.baseTexture).to.be.instanceOf(BaseTexture);

            foo.destroy(true);
            bar.destroy(true);
        });
    });
});
