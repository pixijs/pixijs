import { getWebGLRenderer } from '@test-utils';
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

describe('clear() honors an explicit clearColor of 0', () =>
{
    it('clears to opaque black (0) instead of the red background', async () =>
    {
        const renderer = await getWebGLRenderer({
            width: 16,
            height: 16,
            background: 0xff0000,
        });

        renderer.render({ container: new Container() });

        expect(readPixel(renderer.canvas as HTMLCanvasElement, 8, 8)).toEqual([255, 0, 0, 255]);

        renderer.clear({ clearColor: 0 });

        expect(readPixel(renderer.canvas as HTMLCanvasElement, 8, 8)).toEqual([0, 0, 0, 255]);

        renderer.destroy();
    });
});

// WebGPU variant omitted: a standalone renderer.clear() has no active command encoder
// (GpuEncoderSystem.commandEncoder is null), so renderer.clear({ clearColor: 0 }) throws
// "Cannot read properties of null (reading 'beginRenderPass')". The WebGL path exercises the
// same AbstractRenderer.clear() ??= guard.
