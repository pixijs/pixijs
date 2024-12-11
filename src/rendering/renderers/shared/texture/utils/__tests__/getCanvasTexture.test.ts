import {
    getCanvasTexture,
    hasCachedCanvasTexture
} from '../getCanvasTexture';
import { DOMAdapter } from '~/environment';

describe('Get Canvas Texture', () =>
{
    it('should store canvas in cache', () =>
    {
        const canvas = DOMAdapter.get().createCanvas(2, 2);
        const texture = getCanvasTexture(canvas);

        expect(hasCachedCanvasTexture(canvas)).toEqual(true);
        expect(getCanvasTexture(canvas)).toEqual(texture);
    });

    it('should store texture in cache with options', () =>
    {
        const canvas = DOMAdapter.get().createCanvas(2, 2);
        const texture = getCanvasTexture(canvas, { resolution: 2 });

        expect(texture.source.resolution).toEqual(2);
    });

    it('should clean up cache when texture is destroyed', () =>
    {
        const canvas = DOMAdapter.get().createCanvas(2, 2);
        const texture = getCanvasTexture(canvas);

        texture.destroy();

        expect(hasCachedCanvasTexture(canvas)).toEqual(false);

        const texture2 = getCanvasTexture(canvas);

        expect(texture2).not.toEqual(texture);
    });
});
