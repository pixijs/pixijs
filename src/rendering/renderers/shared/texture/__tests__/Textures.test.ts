import '~/rendering/init';
import { Texture } from '../Texture';
import { Cache } from '~/assets';

describe('Texture', () =>
{
    it('destroying a destroyed texture should not throw an error', () =>
    {
        const texture = new Texture();

        texture.destroy(true);
        expect(() => { texture.destroy(true); }).not.toThrow();
    });

    it('should return the same texture if the resource is the same', () =>
    {
        const videoElement = document.createElement('video');

        let texture = Texture.from({ resource: videoElement });

        expect(Texture.from({ resource: videoElement })).toBe(texture);
        expect(Cache.has(videoElement)).toBe(true);

        const imageElement = document.createElement('img');

        texture = Texture.from({ resource: imageElement });

        expect(Texture.from({ resource: imageElement })).toBe(texture);
        expect(Cache.has(imageElement)).toBe(true);

        const canvasElement = document.createElement('canvas');

        texture = Texture.from({ resource: canvasElement });

        expect(Texture.from({ resource: canvasElement })).toBe(texture);
        expect(Cache.has(canvasElement)).toBe(true);

        const buffer = new Uint8Array([
            255, 0, 0, 255, 0, 255, 0, 153,
            0, 0, 255, 102, 255, 255, 0, 51
        ]);

        texture = Texture.from({
            resource: buffer,
            width: 2,
            height: 2,
        });

        expect(Texture.from({ resource: buffer, width: 2, height: 2 })).toBe(texture);
        expect(Cache.has(buffer)).toBe(true);
    });

    it('should return the same texture when resource is the same', () =>
    {
        const videoElement = document.createElement('video');

        let texture = Texture.from(videoElement);

        expect(Texture.from(videoElement)).toBe(texture);
        expect(Cache.has(videoElement)).toBe(true);

        const imageElement = document.createElement('img');

        texture = Texture.from(imageElement);

        expect(Texture.from(imageElement)).toBe(texture);
        expect(Cache.has(imageElement)).toBe(true);

        const canvasElement = document.createElement('canvas');

        texture = Texture.from(canvasElement);

        expect(Texture.from(canvasElement)).toBe(texture);
        expect(Cache.has(canvasElement)).toBe(true);

        const buffer = new Uint8Array([
            255, 0, 0, 255, 0, 255, 0, 153,
            0, 0, 255, 102, 255, 255, 0, 51
        ]);

        texture = Texture.from({
            resource: buffer,
            width: 2,
            height: 2,
        });

        expect(Texture.from({ resource: buffer, width: 2, height: 2 })).toBe(texture);
        expect(Cache.has(buffer)).toBe(true);
    });

    it('texture.WHITE should have correct alpha mode set', () =>
    {
        expect(Texture.WHITE.source.alphaMode).toBe('premultiply-alpha-on-upload');
    });

    it('should call update a texture correctly', () =>
    {
        const texture = new Texture();

        // spy on texture update event
        const spy = jest.fn();

        texture.on('update', spy);

        texture.update();

        expect(spy).toHaveBeenCalled();
    });
});
