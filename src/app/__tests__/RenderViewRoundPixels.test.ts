import { getApp } from '@test-utils';

function attachedCanvas(width = 128, height = 128): HTMLCanvasElement
{
    const canvas = document.createElement('canvas');

    canvas.width = width;
    canvas.height = height;
    document.body.appendChild(canvas);

    return canvas;
}

describe('RenderView per-view roundPixels', () =>
{
    it('restores the renderer roundPixels after rendering a roundPixels:true secondary view', async () =>
    {
        const app = await getApp({ multiView: true, roundPixels: false });
        const canvasB = attachedCanvas();

        app.addView({ canvas: canvasB, roundPixels: true });

        app.render();

        // the configured renderer roundPixels (false -> 0) is restored after the frame; the
        // secondary view's roundPixels:true no longer leaks into the next frame
        expect(app.renderer['_roundPixels']).toBe(0);

        app.destroy(true, true);
        canvasB.remove();
    });

    it('applies the secondary view roundPixels to the renderer during its render', async () =>
    {
        const app = await getApp({ multiView: true, roundPixels: false });
        const canvasB = attachedCanvas();
        const view = app.addView({ canvas: canvasB, roundPixels: true });

        // ViewSystem.prerender resolves the active view and applies its roundPixels before the
        // render runner runs; capture the value the renderer holds right after prerender resolves
        const viewSystem = app.renderer.view;
        let appliedDuringRender = -1;
        const original = viewSystem.prerender.bind(viewSystem);
        const spy = jest.spyOn(viewSystem, 'prerender').mockImplementation((options) =>
        {
            original(options);
            appliedDuringRender = app.renderer['_roundPixels'];
        });

        view.render();

        expect(appliedDuringRender).toBe(1);
        // and the active view resolved is the secondary canvas view
        expect(app.renderer.view.activeView).toBe(view.rendererView);

        spy.mockRestore();
        app.destroy(true, true);
        canvasB.remove();
    });

    it('keeps the renderer roundPixels for a single-view roundPixels:true app', async () =>
    {
        const app = await getApp({ roundPixels: true });

        // the main view is constructed with the renderer's configured roundPixels, so prerender
        // does not force it off for a single-canvas roundPixels:true app
        app.render();

        expect(app.renderer['_roundPixels']).toBe(1);
        expect(app.renderer.view.activeView).toBe(app.renderer.views[0]);

        app.destroy();
    });
});
