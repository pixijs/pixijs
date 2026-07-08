import { getWebGLRenderer, getWebGPURenderer, itLocalOnly } from '@test-utils';
import { Rectangle } from '~/maths';
import { Container, RenderContainer } from '~/scene';

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

describe('MultiView clear restore', () =>
{
    it('restores the active binding after a mid-render clear to another canvas', async () =>
    {
        const renderer = await getWebGLRenderer({
            width: 16,
            height: 16,
            multiView: true,
            background: 0x00ff00,
        });

        const canvasA = createCanvas(16, 16);
        const canvasB = createCanvas(16, 16);

        // the custom render clears a *different* canvas mid-render; the active binding
        // (canvasA) must be reinstated afterwards
        const container = new RenderContainer(() =>
        {
            renderer.clear({ target: canvasB, clearColor: [0, 0, 1, 1] });
        });

        renderer.render({ container, target: canvasA });

        const canvasATarget = renderer.renderTarget.getRenderTarget(canvasA);

        // the active render target is back on canvasA, not the canvasB the clear bound
        expect(renderer.renderTarget.renderTarget).toBe(canvasATarget);

        // and the viewport covers canvasA's full surface, not whatever the clear left bound
        const { viewport } = renderer.renderTarget;

        expect(viewport.x).toBe(0);
        expect(viewport.y).toBe(0);
        expect(viewport.width).toBe(16);
        expect(viewport.height).toBe(16);

        // the clear actually landed on canvasB
        expect(readPixel(canvasB, 8, 8)).toEqual([0, 0, 255, 255]);

        renderer.destroy();
    });

    it('restores a pushed sub-frame viewport after a no-target mid-render clear', async () =>
    {
        const renderer = await getWebGLRenderer({
            width: 16,
            height: 16,
            multiView: true,
            background: 0xff0000,
        });
        const canvasA = createCanvas(16, 16);

        let viewportAfterClear: { width: number; height: number } | null = null;

        // renderStart has pushed canvasA as the base on the render-target stack. Push an 8x8 sub-frame
        // on top (as a cacheAsTexture render group would), then a no-target clear re-binds the target
        // WITHOUT a frame, which would collapse the viewport to the full 16x16 surface; the fix must
        // restore the pushed 8x8 sub-frame from the stack afterwards.
        const probe = new RenderContainer(() =>
        {
            renderer.renderTarget.push(canvasA, true, undefined, new Rectangle(0, 0, 8, 8));

            renderer.clear({ clearColor: [0, 0, 0, 1] });

            viewportAfterClear = {
                width: renderer.renderTarget.viewport.width,
                height: renderer.renderTarget.viewport.height,
            };

            renderer.renderTarget.pop();
        });

        renderer.render({ container: probe, target: canvasA });

        // without the restore the no-target clear leaves the viewport at the full 16x16 surface
        expect(viewportAfterClear).toEqual({ width: 8, height: 8 });

        renderer.destroy();
    });

    it('clears a standalone target with an empty stack without throwing', async () =>
    {
        const renderer = await getWebGLRenderer({ width: 16, height: 16, multiView: true });

        const canvas = createCanvas(8, 8);

        // no render has happened yet, so the render target stack is empty
        expect(() => renderer.clear({ target: canvas, clearColor: [1, 0, 0, 1] })).not.toThrow();

        expect(readPixel(canvas, 4, 4)).toEqual([255, 0, 0, 255]);

        // a normal render still works afterwards
        const main = renderer.canvas as HTMLCanvasElement;

        renderer.render({ container: new Container(), clearColor: [0, 0, 1, 1] });

        expect(readPixel(main, 8, 8)).toEqual([0, 0, 255, 255]);

        renderer.destroy();
    });
});

describe('MultiView clear restore (WebGPU)', () =>
{
    itLocalOnly('restores the active binding after a mid-render clear to another canvas', async () =>
    {
        const renderer = await getWebGPURenderer({
            width: 16,
            height: 16,
            background: 0x00ff00,
        });

        const canvasA = createCanvas(16, 16);
        const canvasB = createCanvas(16, 16);

        const container = new RenderContainer(() =>
        {
            renderer.clear({ target: canvasB, clearColor: [0, 0, 1, 1] });
        });

        renderer.render({ container, target: canvasA });

        const canvasATarget = renderer.renderTarget.getRenderTarget(canvasA);

        expect(renderer.renderTarget.renderTarget).toBe(canvasATarget);

        const { viewport } = renderer.renderTarget;

        expect(viewport.x).toBe(0);
        expect(viewport.y).toBe(0);
        expect(viewport.width).toBe(16);
        expect(viewport.height).toBe(16);

        expect(readPixel(canvasB, 8, 8)).toEqual([0, 0, 255, 255]);

        renderer.destroy();
    });
});
