// import { BaseTexture, CanvasSource } from '@pixi/core';

import { CanvasSource } from '../../src/rendering/renderers/shared/texture/sources/CanvasSource';
import { Texture } from '../../src/rendering/renderers/shared/texture/Texture';

describe('CanvasSource', () =>
{
    it('should create new dimension-less resource', () =>
    {
        const canvas = document.createElement('canvas');

        const resource = new CanvasSource({ resource: canvas });

        expect(resource.width).toEqual(canvas.width);
        expect(resource.height).toEqual(canvas.height);
        expect(resource.isValid).toBe(true);

        resource.destroy();
    });

    it('should create new valid resource', () =>
    {
        const canvas = document.createElement('canvas');

        canvas.width = 100;
        canvas.height = 200;

        const resource = new CanvasSource({ resource: canvas });

        expect(resource.width).toEqual(100);
        expect(resource.height).toEqual(200);
        expect(resource.isValid).toBe(true);

        resource.destroy();
    });

    // note: what is .bind()/unbind() in v8?
    // it.skip('should fire resize event on bind', () =>
    // {
    //     const canvas = document.createElement('canvas');
    //     const resource = new CanvasSource({ resource: canvas });
    //     const baseTexture = { setRealSize: jest.fn() };

    //     resource.bind(baseTexture as unknown as BaseTexture);

    //     expect(baseTexture.setRealSize).toBeCalledTimes(1);

    //     resource.unbind(baseTexture as unknown as BaseTexture);
    //     resource.destroy();
    // });

    // it.skip('should fire manual update event', () =>
    // {
    //     const canvas = document.createElement('canvas');
    //     const resource = new CanvasSource({ resource: canvas });
    //     const baseTexture = { update: jest.fn() };

    //     resource.bind(baseTexture as unknown as BaseTexture);

    //     expect(baseTexture.update).not.toHaveBeenCalled();

    //     resource.update();

    //     expect(baseTexture.update).toBeCalledTimes(1);

    //     resource.unbind(baseTexture as unknown as BaseTexture);
    //     resource.destroy();
    // });

    // note: added update() method to CanvasSource, was missing
    it('should change BaseTexture size on update', () =>
    {
        const canvas = document.createElement('canvas');

        canvas.width = 50;
        canvas.height = 50;

        const source = new CanvasSource({ resource: canvas });
        const texture = new Texture(source);

        expect(texture.width).toEqual(50);
        canvas.width = 100;
        source.update();
        expect(texture.width).toEqual(100);
        canvas.height = 70;
        source.update();
        expect(texture.height).toEqual(70);
        source.destroy();
    });
});
