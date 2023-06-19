import path from 'path';
import { BaseTexture, ImageResource, Renderer } from '@pixi/core';
import { settings } from '@pixi/settings';

describe('ImageResource', () =>
{
    let slugUrl: string;

    beforeAll(() =>
    {
        slugUrl = path.resolve(__dirname, 'resources', 'slug.png');
    });

    it('should create new dimension-less resource', () =>
    {
        const image = new Image();

        const resource = new ImageResource(image);

        expect(resource.width).toEqual(0);
        expect(resource.height).toEqual(0);
        expect(resource.valid).toBe(false);
        expect(resource.url).toEqual('');

        resource.destroy();
    });

    it('should destroy resource multiple times', () =>
    {
        const resource = new ImageResource(new Image());

        resource.destroy();
        resource.destroy();
    });

    it('should create new valid resource from HTMLImageElement', () =>
    {
        const image = new Image();

        image.src = slugUrl;

        const resource = new ImageResource(image);

        expect(resource.width).toEqual(0);
        expect(resource.height).toEqual(0);
        expect(resource.valid).toBe(false);
        expect(resource.url).toEqual(image.src);

        resource.destroy();
    });

    it('should handle the loaded event with createBitmapImage', () =>
    {
        const image = new Image();

        image.src = slugUrl;

        const resource = new ImageResource(image, {
            autoLoad: false,
            createBitmap: true,
        });

        return resource.load().then((res) =>
        {
            expect(res).toEqual(resource);
            expect(resource.width).toEqual(100);
            expect(resource.height).toEqual(100);
            expect(resource.valid).toBe(true);
            expect(resource.bitmap).toBeInstanceOf(ImageBitmap);
        });
    });

    it('should handle the loaded event with no createBitmapImage', () =>
    {
        const image = new Image();

        image.src = slugUrl;

        const resource = new ImageResource(image, {
            autoLoad: false,
            createBitmap: false,
        });

        return resource.load().then((res) =>
        {
            expect(res).toEqual(resource);
            expect(resource.width).toEqual(100);
            expect(resource.height).toEqual(100);
            expect(resource.valid).toBe(true);
            expect(resource.bitmap).toBeNull();
        });
    });

    it('should handle error when resource is broken', () =>
    {
        const image = new Image();

        image.src = '/';

        const resource = new ImageResource(image, {
            autoLoad: false,
            createBitmap: false,
        });

        return resource.load().catch((error) =>
        {
            expect(error).not.toBeNull();
        });
    });

    it('should handle the loaded event with createBitmapImage using global setting', () =>
    {
        const old = settings.CREATE_IMAGE_BITMAP;
        const image = new Image();

        settings.CREATE_IMAGE_BITMAP = true;
        image.src = slugUrl;

        const resource = new ImageResource(image, { autoLoad: false });

        return resource.load().then((res) =>
        {
            expect(res).toEqual(resource);
            expect(resource.createBitmap).toEqual(true);
            expect(resource.width).toEqual(100);
            expect(resource.height).toEqual(100);
            expect(resource.valid).toBe(true);
            expect(resource.bitmap).toBeInstanceOf(ImageBitmap);
            settings.CREATE_IMAGE_BITMAP = old;
        });
    });

    it('should handle the loaded event with no createBitmapImage using global setting', () =>
    {
        const old = settings.CREATE_IMAGE_BITMAP;
        const image = new Image();

        settings.CREATE_IMAGE_BITMAP = false;
        image.src = slugUrl;

        const resource = new ImageResource(image, { autoLoad: false });

        return resource.load().then((res) =>
        {
            expect(res).toEqual(resource);
            expect(resource.createBitmap).toEqual(false);
            expect(resource.width).toEqual(100);
            expect(resource.height).toEqual(100);
            expect(resource.valid).toBe(true);
            expect(resource.bitmap).toBeNull();
            settings.CREATE_IMAGE_BITMAP = old;
        });
    });

    describe('alphaMode behaviour', () =>
    {
        let renderer: Renderer;

        beforeAll(() =>
        {
            renderer = new Renderer();
        });

        afterAll(() =>
        {
            renderer.destroy();
            renderer = null;
        });

        it('should override BaseTexture alphaMode if specified', () =>
        {
            const image = new Image();
            const resource = new ImageResource(image, { autoLoad: false, alphaMode: 2 });
            const baseTexture = new BaseTexture(resource);

            image.src = slugUrl;

            return resource.load(false).then(() =>
            {
                renderer.texture.bind(baseTexture);
                expect(baseTexture.alphaMode).toEqual(2);
            });
        });

        it('should not override BaseTexture alphaMode if not specified', () =>
        {
            const image = new Image();
            const resource = new ImageResource(image, { autoLoad: false });
            const baseTexture = new BaseTexture(resource);

            baseTexture.alphaMode = 2;
            expect(resource.alphaMode).toBeNull();

            image.src = slugUrl;

            return resource.load(false).then(() =>
            {
                renderer.texture.bind(baseTexture);
                expect(baseTexture.alphaMode).toEqual(2);
            });
        });
    });
});
