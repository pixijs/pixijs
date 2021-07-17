import { CanvasRenderTarget } from '@pixi/utils';
import { settings } from '@pixi/settings';
import { expect } from 'chai';

describe('CanvasRenderTarget', function ()
{
    it('should create with default resolution', function ()
    {
        const renderTarget = new CanvasRenderTarget(200, 100);

        expect(renderTarget.canvas).to.be.instanceOf(HTMLCanvasElement);
        expect(renderTarget.width).to.equal(200);
        expect(renderTarget.height).to.equal(100);
        expect(renderTarget.resolution).to.equal(settings.RESOLUTION);
        expect(renderTarget.canvas.width).to.equal(200 * settings.RESOLUTION);
        expect(renderTarget.canvas.height).to.equal(100 * settings.RESOLUTION);

        renderTarget.destroy();

        expect(renderTarget.canvas).to.be.null;
    });

    it('should create with custom resolution', function ()
    {
        const renderTarget = new CanvasRenderTarget(200, 100, 2);

        expect(renderTarget.canvas).to.be.instanceOf(HTMLCanvasElement);
        expect(renderTarget.width).to.equal(400);
        expect(renderTarget.height).to.equal(200);
        expect(renderTarget.resolution).to.equal(2);
        expect(renderTarget.canvas.width).to.equal(400);
        expect(renderTarget.canvas.height).to.equal(200);

        renderTarget.destroy();
    });

    it('should manually set width and height', function ()
    {
        const renderTarget = new CanvasRenderTarget(200, 100);

        renderTarget.width = 400;
        renderTarget.height = 200;

        expect(renderTarget.canvas.width).to.equal(400);
        expect(renderTarget.canvas.height).to.equal(200);

        renderTarget.destroy();
    });

    it('should clear successfully', function ()
    {
        const renderTarget = new CanvasRenderTarget(200, 100);

        renderTarget.clear();
        renderTarget.destroy();
    });
});
