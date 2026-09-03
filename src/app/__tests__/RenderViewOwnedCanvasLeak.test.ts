import { getApp, itLocalOnly } from '@test-utils';
import { CanvasSource } from '~/rendering';

import type { Application } from '../Application';

function attachedCanvas(width = 128, height = 128): HTMLCanvasElement
{
    const canvas = document.createElement('canvas');

    canvas.width = width;
    canvas.height = height;
    document.body.appendChild(canvas);

    return canvas;
}

// an owned (auto-created) view's source must be destroyed on removeView, so getCanvasTexture's
// strong module-level canvasCache stops pinning the canvas/texture/source for the process lifetime
async function ownedSourceDestroyedScenario(app: Application)
{
    const view = app.addView({});
    const source = view.canvasView.source;

    expect(source).toBeInstanceOf(CanvasSource);
    expect(source.destroyed).toBe(false);

    expect(app.removeView(view)).toBe(true);

    return source;
}

// a user-supplied canvas's source is owned by the caller, so removeView must leave it intact
async function userSourcePreservedScenario(app: Application)
{
    const ownCanvas = attachedCanvas();
    const view = app.addView({ canvas: ownCanvas });
    const source = view.canvasView.source;

    expect(source).toBeInstanceOf(CanvasSource);
    expect(source.destroyed).toBe(false);

    expect(app.removeView(view)).toBe(true);

    return { source, ownCanvas };
}

describe('RenderView owned canvas leak', () =>
{
    it('destroys an auto-created view source on removeView', async () =>
    {
        const app = await getApp({ multiView: true });

        const source = await ownedSourceDestroyedScenario(app);

        expect(source.destroyed).toBe(true);

        app.destroy(true, true);
    });

    it('preserves a user-supplied view source on removeView', async () =>
    {
        const app = await getApp({ multiView: true });

        const { source, ownCanvas } = await userSourcePreservedScenario(app);

        expect(source.destroyed).toBe(false);

        app.destroy(true, true);
        ownCanvas.remove();
    });
});

describe('RenderView owned canvas leak (WebGPU)', () =>
{
    itLocalOnly('destroys an auto-created view source on removeView', async () =>
    {
        const app = await getApp({ preference: 'webgpu' });

        const source = await ownedSourceDestroyedScenario(app);

        expect(source.destroyed).toBe(true);

        app.destroy(true, true);
    });

    itLocalOnly('preserves a user-supplied view source on removeView', async () =>
    {
        const app = await getApp({ preference: 'webgpu' });

        const { source, ownCanvas } = await userSourcePreservedScenario(app);

        expect(source.destroyed).toBe(false);

        app.destroy(true, true);
        ownCanvas.remove();
    });
});
