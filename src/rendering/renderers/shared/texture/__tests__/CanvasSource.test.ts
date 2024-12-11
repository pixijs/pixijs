import { CanvasSource } from '../sources/CanvasSource';
import { TextureSource } from '../sources/TextureSource';
import { Texture } from '../Texture';
import { DOMAdapter } from '~/environment';

describe('getCanvasTexture', () =>
{
    it('should create with default resolution', () =>
    {
        const canvas = DOMAdapter.get().createCanvas(2, 3);
        const texture = new Texture(new CanvasSource({ resource: canvas }));

        expect(texture.source.resource).toEqual(canvas);
        expect(texture.width).toEqual(2);
        expect(texture.height).toEqual(3);
        expect(texture.source.resolution).toEqual(TextureSource.defaultOptions.resolution);
        expect(texture.source.pixelWidth).toEqual(2 * TextureSource.defaultOptions.resolution);
        expect(texture.source.pixelHeight).toEqual(3 * TextureSource.defaultOptions.resolution);
    });

    it('should destroy source if option given', () =>
    {
        const canvas = DOMAdapter.get().createCanvas(2, 3);
        const texture = new Texture(new CanvasSource({ resource: canvas }));

        texture.destroy(true);

        expect(texture.source).toBe(null);
    });

    it('should create with custom resolution', () =>
    {
        const canvas = DOMAdapter.get().createCanvas(2, 3);
        const texture = new Texture(new CanvasSource({ resource: canvas, width: 200, height: 100, resolution: 2 }));

        expect(texture.width).toEqual(200);
        expect(texture.height).toEqual(100);
        expect(texture.source.resolution).toEqual(2);
        expect(texture.source.resource.width).toEqual(400);
        expect(texture.source.resource.height).toEqual(200);

        texture.destroy();
    });

    it('should manually set width and height', () =>
    {
        const canvas = DOMAdapter.get().createCanvas(2, 3);
        const texture = new Texture(new CanvasSource({ resource: canvas }));
        const spy = jest.fn();

        texture.source.on('resize', spy);
        texture.source.resize(4, 6);

        expect(spy).toHaveBeenCalled();
        expect(texture.source.resource.width).toEqual(4);
        expect(texture.source.resource.height).toEqual(6);

        texture.destroy();
    });
});
