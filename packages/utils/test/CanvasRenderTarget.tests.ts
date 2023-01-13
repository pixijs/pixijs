import { settings } from '@pixi/settings';
import { CanvasRenderTarget } from '@pixi/utils';

describe('CanvasRenderTarget', () =>
{
    it('should create with default resolution', () =>
    {
        const renderTarget = new CanvasRenderTarget(200, 100);

        expect(renderTarget.canvas).toBeInstanceOf(HTMLCanvasElement);
        expect(renderTarget.width).toEqual(200);
        expect(renderTarget.height).toEqual(100);
        expect(renderTarget.resolution).toEqual(settings.RESOLUTION);
        expect(renderTarget.canvas.width).toEqual(200 * settings.RESOLUTION);
        expect(renderTarget.canvas.height).toEqual(100 * settings.RESOLUTION);

        renderTarget.destroy();

        expect(() => renderTarget.canvas).toThrowError(TypeError);
    });

    it('should create with custom resolution', () =>
    {
        const renderTarget = new CanvasRenderTarget(200, 100, 2);

        expect(renderTarget.canvas).toBeInstanceOf(HTMLCanvasElement);
        expect(renderTarget.width).toEqual(400);
        expect(renderTarget.height).toEqual(200);
        expect(renderTarget.resolution).toEqual(2);
        expect(renderTarget.canvas.width).toEqual(400);
        expect(renderTarget.canvas.height).toEqual(200);

        renderTarget.destroy();
    });

    it('should manually set width and height', () =>
    {
        const renderTarget = new CanvasRenderTarget(200, 100);

        renderTarget.width = 400;
        renderTarget.height = 200;

        expect(renderTarget.canvas.width).toEqual(400);
        expect(renderTarget.canvas.height).toEqual(200);

        renderTarget.destroy();
    });

    it('should clear successfully', () =>
    {
        const renderTarget = new CanvasRenderTarget(200, 100);

        renderTarget.clear();
        renderTarget.destroy();
    });
});
