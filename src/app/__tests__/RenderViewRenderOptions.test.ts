import { getApp, itLocalOnly } from '@test-utils';

import type { Application } from '../Application';

function attachedCanvas(width = 16, height = 16): HTMLCanvasElement
{
    const canvas = document.createElement('canvas');

    canvas.width = width;
    canvas.height = height;
    document.body.appendChild(canvas);

    return canvas;
}

// drawImage into a scratch canvas reads back both 2d-presented (WebGL multiView) and webgpu canvases
function readPixel(canvas: HTMLCanvasElement, x: number, y: number): number[]
{
    const scratch = document.createElement('canvas');

    scratch.width = canvas.width;
    scratch.height = canvas.height;

    const context = scratch.getContext('2d');

    context.drawImage(canvas, 0, 0);

    return [...context.getImageData(x, y, 1, 1).data];
}

// These tests pin the behavior of RenderView reusing a single per-instance render-options object
// across frames. The renderer mutates that object during render (notably normalizing `clearColor`
// into an RGBA array and defaulting `target`). If those fields were not reset from the view's own
// state every frame, a stale normalized value would leak from one frame into the next.
describe('RenderView render options reuse', () =>
{
    it('keeps a secondary view clearColor correct on every frame (no stale normalized leak)', async () =>
    {
        const app = await getApp({ width: 16, height: 16, multiView: true, background: 0xff0000 });
        const canvasB = attachedCanvas();

        app.addView({ canvas: canvasB, clearColor: 0x0000ff });

        const expected = [0, 0, 255, 255];

        // frame 1
        app.render();
        expect(readPixel(canvasB, 8, 8)).toEqual(expected);

        // frames 2 and 3 reuse the same cached options object that frame 1 mutated; the clearColor
        // must still resolve to the same blue, not a stale array from a prior frame
        app.render();
        app.render();
        expect(readPixel(canvasB, 8, 8)).toEqual(expected);

        app.destroy(true, true);
        canvasB.remove();
    });

    it('reflects a clearColor changed between frames (reset overwrites the prior normalized value)', async () =>
    {
        const app = await getApp({ width: 16, height: 16, multiView: true, background: 0xff0000 });
        const canvasB = attachedCanvas();
        const view = app.addView({ canvas: canvasB, clearColor: 0x0000ff });

        app.render();
        expect(readPixel(canvasB, 8, 8)).toEqual([0, 0, 255, 255]);

        // mutating the public field must win on the next frame; if the cached options held onto the
        // previously normalized blue array this would stay blue
        view.clearColor = 0x00ff00;
        app.render();
        expect(readPixel(canvasB, 8, 8)).toEqual([0, 255, 0, 255]);

        app.destroy(true, true);
        canvasB.remove();
    });

    it('renders the primary view each frame with no stale target leaking from a secondary', async () =>
    {
        const app = await getApp({ width: 16, height: 16, multiView: true, background: 0xff0000 });
        const canvasB = attachedCanvas();

        app.addView({ canvas: canvasB, clearColor: 0x0000ff });

        const primaryCanvas = app.renderer.canvas as HTMLCanvasElement;

        // the secondary renders before the primary each frame; the primary still clears to the
        // renderer background and remains the renderer's hit-test root
        app.render();
        expect(app.renderer.lastObjectRendered).toBe(app.stage);
        expect(readPixel(primaryCanvas, 8, 8)).toEqual([255, 0, 0, 255]);

        app.render();
        app.render();
        expect(app.renderer.lastObjectRendered).toBe(app.stage);
        expect(readPixel(primaryCanvas, 8, 8)).toEqual([255, 0, 0, 255]);

        app.destroy(true, true);
        canvasB.remove();
    });
});

describe('RenderView render options reuse (WebGPU)', () =>
{
    itLocalOnly('keeps a secondary view clearColor correct on every frame', async () =>
    {
        let app: Application;

        try
        {
            app = await getApp({ width: 16, height: 16, preference: 'webgpu', background: 0xff0000 });
        }
        catch
        {
            return;
        }

        const canvasB = attachedCanvas();
        const view = app.addView({ canvas: canvasB, clearColor: 0x0000ff });

        const expected = [0, 0, 255, 255];

        app.render();
        expect(readPixel(canvasB, 8, 8)).toEqual(expected);

        app.render();
        app.render();
        expect(readPixel(canvasB, 8, 8)).toEqual(expected);

        view.clearColor = 0x00ff00;
        app.render();
        expect(readPixel(canvasB, 8, 8)).toEqual([0, 255, 0, 255]);

        app.destroy(true, true);
        canvasB.remove();
    });
});
