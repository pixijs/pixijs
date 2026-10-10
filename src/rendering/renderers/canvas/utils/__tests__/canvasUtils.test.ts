import { canvasUtils } from '../canvasUtils';
import { ImageSource, Texture } from '~/rendering';

function makeWhiteTexture(): Texture
{
    const canvas = document.createElement('canvas');

    canvas.width = 4;
    canvas.height = 4;

    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 4, 4);

    return new Texture({ source: new ImageSource({ resource: canvas }) });
}

describe('canvasUtils.getTintedCanvas', () =>
{
    const defaultTintCacheSize = canvasUtils.tintCacheSize;

    afterEach(() =>
    {
        canvasUtils.tintCacheSize = defaultTintCacheSize;
    });

    it('should drop the least recently used tint once the cache is full', () =>
    {
        canvasUtils.tintCacheSize = 2;

        const texture = makeWhiteTexture();
        const red = canvasUtils.getTintedCanvas({ texture }, 0xff0000);

        canvasUtils.getTintedCanvas({ texture }, 0x00ff00);
        canvasUtils.getTintedCanvas({ texture }, 0x0000ff);

        expect(canvasUtils.getTintedCanvas({ texture }, 0xff0000)).not.toBe(red);
    });

    it('should keep a tint that was used more recently than the evicted one', () =>
    {
        canvasUtils.tintCacheSize = 2;

        const texture = makeWhiteTexture();
        const red = canvasUtils.getTintedCanvas({ texture }, 0xff0000);
        const green = canvasUtils.getTintedCanvas({ texture }, 0x00ff00);

        canvasUtils.getTintedCanvas({ texture }, 0xff0000);
        canvasUtils.getTintedCanvas({ texture }, 0x0000ff);

        expect(canvasUtils.getTintedCanvas({ texture }, 0xff0000)).toBe(red);
        expect(canvasUtils.getTintedCanvas({ texture }, 0x00ff00)).not.toBe(green);
    });

    it('should not keep a copy for every shade of a tint fade by default', () =>
    {
        const texture = makeWhiteTexture();
        const black = canvasUtils.getTintedCanvas({ texture }, 0x000000);

        for (let shade = 1; shade < 256; shade++)
        {
            canvasUtils.getTintedCanvas({ texture }, (shade << 16) | (shade << 8) | shade);
        }

        expect(canvasUtils.getTintedCanvas({ texture }, 0x000000)).not.toBe(black);
    });

    it('should keep every tint when the cache size is 0', () =>
    {
        canvasUtils.tintCacheSize = 0;

        const texture = makeWhiteTexture();
        const red = canvasUtils.getTintedCanvas({ texture }, 0xff0000);

        canvasUtils.getTintedCanvas({ texture }, 0x00ff00);
        canvasUtils.getTintedCanvas({ texture }, 0x0000ff);

        expect(canvasUtils.getTintedCanvas({ texture }, 0xff0000)).toBe(red);
    });
});
