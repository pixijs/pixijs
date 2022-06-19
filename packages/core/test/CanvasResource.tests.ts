import { CanvasResource, BaseTexture } from '@pixi/core';
import sinon from 'sinon';
import { expect } from 'chai';

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
        const baseTexture = { setRealSize: sinon.stub() };

        resource.bind(baseTexture as unknown as BaseTexture);

        expect(baseTexture.setRealSize.calledOnce).toBe(true);

        resource.unbind(baseTexture as unknown as BaseTexture);
        resource.destroy();
    });

    it('should fire manual update event', () =>
    {
        const canvas = document.createElement('canvas');
        const resource = new CanvasResource(canvas);
        const baseTexture = { update: sinon.stub() };

        resource.bind(baseTexture as unknown as BaseTexture);

        expect(baseTexture.update.called).toBe(false);

        resource.update();

        expect(baseTexture.update.calledOnce).toBe(true);

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
