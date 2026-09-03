import { getWebGLRenderer, getWebGPURenderer, itLocalOnly } from '@test-utils';
import { Container } from '~/scene';

function createCanvas(width = 16, height = 16)
{
    const canvas = document.createElement('canvas');

    canvas.width = width;
    canvas.height = height;

    return canvas;
}

// drawImage into a scratch canvas works for 2d-presented and webgpu canvases alike
function readPixel(canvas: HTMLCanvasElement, x: number, y: number)
{
    const scratch = createCanvas(canvas.width, canvas.height);
    const context = scratch.getContext('2d');

    context.drawImage(canvas, 0, 0);

    return [...context.getImageData(x, y, 1, 1).data];
}

describe('MultiView clearColor guards', () =>
{
    it('converts an explicit clearColor of 0 when rendering to a secondary canvas', async () =>
    {
        const renderer = await getWebGLRenderer({
            width: 16,
            height: 16,
            multiView: true,
            background: 0xff0000,
        });

        const canvasB = createCanvas(16, 16);

        renderer.render({ container: new Container(), target: canvasB, clearColor: 0x000000 });

        expect(readPixel(canvasB, 8, 8)).toEqual([0, 0, 0, 255]);

        renderer.destroy();
    });

    it('converts an explicit clearColor of 0 on the single-canvas main view', async () =>
    {
        const renderer = await getWebGLRenderer({
            width: 16,
            height: 16,
            background: 0xff0000,
        });

        renderer.render({ container: new Container(), clearColor: 0x000000 });

        expect(readPixel(renderer.canvas as HTMLCanvasElement, 8, 8)).toEqual([0, 0, 0, 255]);

        renderer.destroy();
    });
});

describe('MultiView clearColor guards (WebGPU)', () =>
{
    itLocalOnly('converts an explicit clearColor of 0 when rendering to a secondary canvas', async () =>
    {
        const renderer = await getWebGPURenderer({
            width: 16,
            height: 16,
            background: 0xff0000,
        });

        const canvasB = createCanvas(16, 16);

        renderer.render({ container: new Container(), target: canvasB, clearColor: 0x000000 });

        expect(readPixel(canvasB, 8, 8)).toEqual([0, 0, 0, 255]);

        renderer.destroy();
    });

    itLocalOnly('converts an explicit clearColor of 0 on the single-canvas main view', async () =>
    {
        const renderer = await getWebGPURenderer({
            width: 16,
            height: 16,
            background: 0xff0000,
        });

        renderer.render({ container: new Container(), clearColor: 0x000000 });

        expect(readPixel(renderer.canvas as HTMLCanvasElement, 8, 8)).toEqual([0, 0, 0, 255]);

        renderer.destroy();
    });
});
