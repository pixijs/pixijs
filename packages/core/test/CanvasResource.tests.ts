import { BaseTexture, CanvasResource } from '@pixi/core';

describe('CanvasResource', () =>
{
    it('should create new dimension-less resource', () =>
    {
        const canvas = document.createElement('canvas');

        const resource = new CanvasResource(canvas);

        expect(resource.width).toEqual(canvas.width);
        expect(resource.height).toEqual(canvas.height);
        expect(resource.valid).toBe(true);

        resource.destroy();
    });

    it('should create new valid resource', () =>
    {
        const canvas = document.createElement('canvas');

        canvas.width = 100;
        canvas.height = 200;

        const resource = new CanvasResource(canvas);

        expect(resource.width).toEqual(100);
        expect(resource.height).toEqual(200);
        expect(resource.valid).toBe(true);

        resource.destroy();
    });

    it('should fire resize event on bind', () =>
    {
        const canvas = document.createElement('canvas');
        const resource = new CanvasResource(canvas);
        const baseTexture = { setRealSize: jest.fn() };

        resource.bind(baseTexture as unknown as BaseTexture);

        expect(baseTexture.setRealSize).toBeCalledTimes(1);

        resource.unbind(baseTexture as unknown as BaseTexture);
        resource.destroy();
    });

    it('should fire manual update event', () =>
    {
        const canvas = document.createElement('canvas');
        const resource = new CanvasResource(canvas);
        const baseTexture = { update: jest.fn() };

        resource.bind(baseTexture as unknown as BaseTexture);

        expect(baseTexture.update).not.toHaveBeenCalled();

        resource.update();

        expect(baseTexture.update).toBeCalledTimes(1);

        resource.unbind(baseTexture as unknown as BaseTexture);
        resource.destroy();
    });

    it('should change BaseTexture size on update', () =>
    {
        const canvas = document.createElement('canvas');

        canvas.width = 50;
        canvas.height = 50;

        const resource = new CanvasResource(canvas);
        const baseTexture = new BaseTexture(resource);

        expect(baseTexture.width).toEqual(50);
        canvas.width = 100;
        resource.update();
        expect(baseTexture.width).toEqual(100);
        canvas.height = 70;
        resource.update();
        expect(baseTexture.height).toEqual(70);
        resource.destroy();
    });
});
