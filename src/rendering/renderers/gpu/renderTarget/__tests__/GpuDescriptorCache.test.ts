import { getWebGPURenderer, itLocalOnly } from '@test-utils';
import { RenderTexture } from '~/rendering';
import { Container, Graphics } from '~/scene';

import type { GpuRenderTarget } from '../GpuRenderTarget';
import type { WebGPURenderer } from '~/rendering';

/**
 * These tests cover the per-`GpuRenderTarget` render-pass descriptor cache added
 * to `GpuRenderTargetAdaptor`. The cache reuses one descriptor object (and its
 * `colorAttachments` array) across frames and mutates the per-frame-varying
 * fields in place. The behaviour that MUST be preserved:
 *   - a canvas target's swap-chain view is re-fetched every frame
 *     (`getCurrentTexture().createView()`), so output is correct frame-to-frame;
 *   - texture targets reuse their stable view but stay correct;
 *   - clear / load ops and clear colours still take effect each frame.
 *
 * WebGPU has no adapter on CI, so every test is gated with `itLocalOnly`.
 */

function createCanvas(width = 16, height = 16)
{
    const canvas = document.createElement('canvas');

    canvas.width = width;
    canvas.height = height;

    return canvas;
}

// drawImage into a scratch 2d canvas works for webgpu-presented canvases
function readCanvasPixel(canvas: HTMLCanvasElement, x: number, y: number)
{
    const scratch = createCanvas(canvas.width, canvas.height);
    const context = scratch.getContext('2d');

    context.drawImage(canvas, 0, 0);

    return [...context.getImageData(x, y, 1, 1).data];
}

function readTexturePixel(renderer: WebGPURenderer, texture: RenderTexture, x: number, y: number)
{
    const { pixels, width } = renderer.extract.pixels(texture);
    const i = ((y * width) + x) * 4;

    return [pixels[i], pixels[i + 1], pixels[i + 2], pixels[i + 3]];
}

function fullRect(color: number, size: number)
{
    return new Graphics().rect(0, 0, size, size).fill({ color, alpha: 1 });
}

function descriptorFor(renderer: WebGPURenderer, surface: HTMLCanvasElement | RenderTexture): GpuRenderTarget
{
    const renderTarget = renderer.renderTarget.getRenderTarget(surface);

    return renderer.renderTarget.getGpuRenderTarget(renderTarget);
}

describe('GpuRenderTargetAdaptor descriptor cache', () =>
{
    itLocalOnly('reuses the descriptor object across frames for the main canvas while output stays correct', async () =>
    {
        const renderer = await getWebGPURenderer({ width: 16, height: 16 });
        const canvas = renderer.canvas as HTMLCanvasElement;

        renderer.render({ container: fullRect(0xff0000, 16) });
        const gpuRenderTarget = descriptorFor(renderer, canvas);
        const firstDescriptor = gpuRenderTarget.descriptor;

        expect(readCanvasPixel(canvas, 8, 8)).toEqual([255, 0, 0, 255]);

        // second frame: different colour. A stale cached swap-chain view would either
        // throw (texture used by a prior submitted pass) or present the wrong frame.
        renderer.render({ container: fullRect(0x00ff00, 16) });
        const secondDescriptor = descriptorFor(renderer, canvas).descriptor;

        expect(readCanvasPixel(canvas, 8, 8)).toEqual([0, 255, 0, 255]);

        // third frame: a third colour, proving the swap-chain view keeps refreshing.
        renderer.render({ container: fullRect(0x0000ff, 16) });
        const thirdDescriptor = descriptorFor(renderer, canvas).descriptor;

        expect(readCanvasPixel(canvas, 8, 8)).toEqual([0, 0, 255, 255]);

        // cache hit: the same descriptor object is reused every frame.
        expect(secondDescriptor).toBe(firstDescriptor);
        expect(thirdDescriptor).toBe(firstDescriptor);

        renderer.destroy();
    });

    itLocalOnly('refreshes the swap-chain view each frame for an MSAA (antialias) canvas', async () =>
    {
        const renderer = await getWebGPURenderer({ width: 16, height: 16, antialias: true });
        const canvas = renderer.canvas as HTMLCanvasElement;

        renderer.render({ container: fullRect(0xff0000, 16) });
        const firstDescriptor = descriptorFor(renderer, canvas).descriptor;

        expect(readCanvasPixel(canvas, 8, 8)).toEqual([255, 0, 0, 255]);

        renderer.render({ container: fullRect(0x00ff00, 16) });
        const secondDescriptor = descriptorFor(renderer, canvas).descriptor;

        expect(readCanvasPixel(canvas, 8, 8)).toEqual([0, 255, 0, 255]);

        expect(secondDescriptor).toBe(firstDescriptor);

        renderer.destroy();
    });

    itLocalOnly('reuses the descriptor and stable view for a RenderTexture target across frames', async () =>
    {
        const renderer = await getWebGPURenderer({ width: 16, height: 16 });
        const texture = RenderTexture.create({ width: 16, height: 16 });

        renderer.render({ container: fullRect(0xff0000, 16), target: texture });
        const gpuRenderTarget = descriptorFor(renderer, texture);
        const firstDescriptor = gpuRenderTarget.descriptor;
        const firstView = (firstDescriptor.colorAttachments as GPURenderPassColorAttachment[])[0].view;

        expect(readTexturePixel(renderer, texture, 8, 8)).toEqual([255, 0, 0, 255]);

        renderer.render({ container: fullRect(0x00ff00, 16), target: texture });
        const secondDescriptor = descriptorFor(renderer, texture).descriptor;
        const secondView = (secondDescriptor.colorAttachments as GPURenderPassColorAttachment[])[0].view;

        expect(readTexturePixel(renderer, texture, 8, 8)).toEqual([0, 255, 0, 255]);

        // texture targets keep a stable view: same descriptor object AND same view object.
        expect(secondDescriptor).toBe(firstDescriptor);
        expect(secondView).toBe(firstView);

        texture.destroy(true);
        renderer.destroy();
    });

    itLocalOnly('rebuilds the cached texture view when the RenderTexture is resized', async () =>
    {
        const renderer = await getWebGPURenderer({ width: 16, height: 16 });
        const texture = RenderTexture.create({ width: 16, height: 16 });

        renderer.render({ container: fullRect(0xff0000, 16), target: texture });
        const firstView = (descriptorFor(renderer, texture).descriptor
            .colorAttachments as GPURenderPassColorAttachment[])[0].view;

        // resize re-allocates the underlying GPUTexture; the cached view is now stale
        // and must be rebuilt, otherwise beginRenderPass would target a freed texture.
        texture.resize(32, 32);

        renderer.render({ container: fullRect(0x00ff00, 32), target: texture });
        const secondView = (descriptorFor(renderer, texture).descriptor
            .colorAttachments as GPURenderPassColorAttachment[])[0].view;

        expect(readTexturePixel(renderer, texture, 16, 16)).toEqual([0, 255, 0, 255]);
        expect(secondView).not.toBe(firstView);

        texture.destroy(true);
        renderer.destroy();
    });

    itLocalOnly('caches a separate descriptor per secondary canvas and keeps each correct', async () =>
    {
        const renderer = await getWebGPURenderer({ width: 16, height: 16 });
        const canvasA = createCanvas(16, 16);
        const canvasB = createCanvas(16, 16);

        renderer.render({ container: fullRect(0xff0000, 16), target: canvasA });
        renderer.render({ container: fullRect(0x0000ff, 16), target: canvasB });

        const descriptorA = descriptorFor(renderer, canvasA).descriptor;
        const descriptorB = descriptorFor(renderer, canvasB).descriptor;

        // distinct on-screen canvases must not share a descriptor (separate contexts).
        expect(descriptorA).not.toBe(descriptorB);
        expect(readCanvasPixel(canvasA, 8, 8)).toEqual([255, 0, 0, 255]);
        expect(readCanvasPixel(canvasB, 8, 8)).toEqual([0, 0, 255, 255]);

        // re-render both: descriptors are reused (cache hit) and swap-chain views refresh.
        renderer.render({ container: fullRect(0x00ff00, 16), target: canvasA });
        renderer.render({ container: fullRect(0xffff00, 16), target: canvasB });

        expect(descriptorFor(renderer, canvasA).descriptor).toBe(descriptorA);
        expect(descriptorFor(renderer, canvasB).descriptor).toBe(descriptorB);
        expect(readCanvasPixel(canvasA, 8, 8)).toEqual([0, 255, 0, 255]);
        expect(readCanvasPixel(canvasB, 8, 8)).toEqual([255, 255, 0, 255]);

        renderer.destroy();
    });

    itLocalOnly('applies a new clearColor each frame through the reused descriptor', async () =>
    {
        const renderer = await getWebGPURenderer({ width: 16, height: 16 });
        const canvas = renderer.canvas as HTMLCanvasElement;

        renderer.render({ container: new Container(), clearColor: [1, 0, 0, 1] });
        const firstDescriptor = descriptorFor(renderer, canvas).descriptor;

        expect(readCanvasPixel(canvas, 8, 8)).toEqual([255, 0, 0, 255]);

        renderer.render({ container: new Container(), clearColor: [0, 0, 1, 1] });

        expect(readCanvasPixel(canvas, 8, 8)).toEqual([0, 0, 255, 255]);
        expect(descriptorFor(renderer, canvas).descriptor).toBe(firstDescriptor);

        renderer.destroy();
    });
});
