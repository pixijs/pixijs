import { TextureLoader, LoaderResource } from '@pixi/loaders';
import { Texture } from '@pixi/core';
import { BaseTextureCache, TextureCache } from '@pixi/utils';

describe('TextureLoader', () =>
{
    it('should exist and return a function', () =>
    {
        expect(TextureLoader).toBeDefined();
        expect(TextureLoader.use).toBeInstanceOf(Function);
    });

    it('should do nothing if the resource is not an image', () =>
    {
        const spy = jest.fn();
        const res = {} as LoaderResource;

        TextureLoader.use(res, spy);

        expect(spy).toHaveBeenCalledOnce();
        expect(res.texture).toBeUndefined();
    });

    it('should create a texture if resource is an image', (done) =>
    {
        const name = `${(Math.random() * 10000) | 0}`;
        const url = `http://localhost/doesnt_exist/${name}`;
        const data = new Image();
        const type = LoaderResource.TYPE.IMAGE;
        const res = { url, name, type, data, metadata: {} } as LoaderResource;

        // Transparent image
        data.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJ'
            + 'AAAADUlEQVQYV2P4GvD7PwAHvgNAdItKlAAAAABJRU5ErkJggg==';

        TextureLoader.use(res, () =>
        {
            expect(res.texture).toBeInstanceOf(Texture);

            expect(BaseTextureCache).toHaveProperty(res.name, res.texture.baseTexture);
            expect(BaseTextureCache).toHaveProperty(res.url, res.texture.baseTexture);

            expect(TextureCache).toHaveProperty(res.name, res.texture);
            expect(TextureCache).toHaveProperty(res.url, res.texture);

            done();
        });
    });
});
