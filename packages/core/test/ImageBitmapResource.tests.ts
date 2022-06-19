import { BaseTexture, ImageBitmapResource } from '@pixi/core';
import sinon from 'sinon';
import { expect } from 'chai';

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
        const baseTexture = { setRealSize: sinon.stub() };

        resource.bind(baseTexture as unknown as BaseTexture);

        expect(baseTexture.setRealSize.calledOnce).toBe(true);

        resource.unbind(baseTexture as unknown as BaseTexture);
        resource.destroy();
    });

    it('should fire manual update event', async () =>
    {
        const canvas = document.createElement('canvas');
        const bitmap = await createImageBitmap(canvas);
        const resource = new ImageBitmapResource(bitmap);
        const baseTexture = { update: sinon.stub() };

        resource.bind(baseTexture as unknown as BaseTexture);

        expect(baseTexture.update.called).toBe(false);

        resource.update();

        expect(baseTexture.update.calledOnce).toBe(true);

        resource.unbind(baseTexture as unknown as BaseTexture);
        resource.destroy();
    });
});
