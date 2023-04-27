import { ImageBitmapResource } from '@pixi/core';

import type { BaseTexture } from '@pixi/core';

describe('ImageBitmapResource', () =>
{
    // 1x1 white PNG data URL
    const IMAGE_URL
        = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42m'
        + 'P8/x8AAwMCAO+ip1sAAAAASUVORK5CYII=';

    it('should create new dimension-less resource', async () =>
    {
        const canvas = document.createElement('canvas');

        const bitmap = await createImageBitmap(canvas);
        const resource = new ImageBitmapResource(bitmap);

        expect(resource.width).toEqual(canvas.width);
        expect(resource.height).toEqual(canvas.height);
        expect(resource.valid).toBe(true);

        resource.destroy();
    });

    it('should create new valid resource', async () =>
    {
        const canvas = document.createElement('canvas');

        canvas.width = 100;
        canvas.height = 200;

        const bitmap = await createImageBitmap(canvas);
        const resource = new ImageBitmapResource(bitmap);

        expect(resource.width).toEqual(100);
        expect(resource.height).toEqual(200);
        expect(resource.valid).toBe(true);

        resource.destroy();
    });

    it('should fire resize event on bind', async () =>
    {
        const canvas = document.createElement('canvas');
        const bitmap = await createImageBitmap(canvas);
        const resource = new ImageBitmapResource(bitmap);
        const baseTexture = { setRealSize: jest.fn() };

        resource.bind(baseTexture as unknown as BaseTexture);

        expect(baseTexture.setRealSize).toBeCalledTimes(1);

        resource.unbind(baseTexture as unknown as BaseTexture);
        resource.destroy();
    });

    it('should fire manual update event', async () =>
    {
        const canvas = document.createElement('canvas');
        const bitmap = await createImageBitmap(canvas);
        const resource = new ImageBitmapResource(bitmap);
        const baseTexture = { update: jest.fn() };

        resource.bind(baseTexture as unknown as BaseTexture);

        expect(baseTexture.update).not.toHaveBeenCalled();

        resource.update();

        expect(baseTexture.update).toBeCalledTimes(1);

        resource.unbind(baseTexture as unknown as BaseTexture);
        resource.destroy();
    });

    it('should not dispose underlying ImageBitmap when source is ImageBitmap', async () =>
    {
        const canvas = document.createElement('canvas');

        canvas.width = 100;
        canvas.height = 200;

        const bitmap = await createImageBitmap(canvas);
        const resource = new ImageBitmapResource(bitmap);

        expect(bitmap.width).toEqual(100);
        expect(bitmap.height).toEqual(200);

        resource.destroy();

        expect(bitmap.width).toEqual(100);
        expect(bitmap.height).toEqual(200);
    });

    it('should not dispose underlying ImageBitmap when source is string', async () =>
    {
        const resource = new ImageBitmapResource(IMAGE_URL);

        await resource.load();

        const bitmap = resource.source as ImageBitmap;

        expect(bitmap.width).toEqual(1);
        expect(bitmap.height).toEqual(1);

        resource.destroy();

        expect(bitmap.width).toEqual(0);
        expect(bitmap.height).toEqual(0);
    });

    it('should dispose underlying ImageBitmap when ownImageBitmap is true', async () =>
    {
        const canvas = document.createElement('canvas');

        canvas.width = 100;
        canvas.height = 200;

        const bitmap = await createImageBitmap(canvas);
        const resource = new ImageBitmapResource(bitmap, { ownsImageBitmap: true });

        expect(bitmap.width).toEqual(100);
        expect(bitmap.height).toEqual(200);

        resource.destroy();

        expect(bitmap.width).toEqual(0);
        expect(bitmap.height).toEqual(0);
    });

    it('should not dispose underlying ImageBitmap when ownImageBitmap is false', async () =>
    {
        const resource = new ImageBitmapResource(IMAGE_URL, { ownsImageBitmap: false });

        await resource.load();

        const bitmap = resource.source as ImageBitmap;

        expect(bitmap.width).toEqual(1);
        expect(bitmap.height).toEqual(1);

        resource.destroy();

        expect(bitmap.width).toEqual(1);
        expect(bitmap.height).toEqual(1);
    });
});
