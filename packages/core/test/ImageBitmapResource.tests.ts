import { ImageBitmapResource } from '@pixi/core';

import type { BaseTexture } from '@pixi/core';

describe('ImageBitmapResource', () =>
{
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
});
