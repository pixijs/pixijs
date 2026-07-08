import { getApp } from '@test-utils';

import type { RenderOptions } from '~/rendering';

function attachedCanvas(width = 128, height = 128): HTMLCanvasElement
{
    const canvas = document.createElement('canvas');

    canvas.width = width;
    canvas.height = height;
    document.body.appendChild(canvas);

    return canvas;
}

describe('RenderView options', () =>
{
    it('forwards antialias/transparent/roundPixels onto the renderer view', async () =>
    {
        const app = await getApp({ multiView: true });
        const canvasB = attachedCanvas();

        const view = app.addView({
            canvas: canvasB,
            antialias: true,
            transparent: true,
            roundPixels: true,
        });

        expect(view.rendererView.antialias).toBe(true);
        expect(view.rendererView.transparent).toBe(true);
        expect(view.rendererView.roundPixels).toBe(true);

        app.destroy(true, true);
        canvasB.remove();
    });

    it('defaults per-view options to falsy when omitted', async () =>
    {
        const app = await getApp({ multiView: true });
        const canvasB = attachedCanvas();

        const view = app.addView({ canvas: canvasB });

        expect(view.rendererView.antialias).toBe(false);
        expect(view.rendererView.transparent).toBe(false);
        expect(view.rendererView.roundPixels).toBe(false);

        app.destroy(true, true);
        canvasB.remove();
    });

    it('exposes a per-view screen reflecting the secondary canvas size', async () =>
    {
        const app = await getApp({ multiView: true, width: 100, height: 100 });
        const canvasB = attachedCanvas(50, 50);
        const view = app.addView({ canvas: canvasB });

        expect(view.screen.width).toBe(50);
        expect(view.screen.height).toBe(50);

        view.resize(200, 150, 1);

        expect(view.screen.width).toBe(200);
        expect(view.screen.height).toBe(150);

        app.destroy(true, true);
        canvasB.remove();
    });

    it('returns the same screen rectangle instance across calls (no per-call allocation)', async () =>
    {
        const app = await getApp({ multiView: true });
        const canvasB = attachedCanvas();
        const view = app.addView({ canvas: canvasB });

        expect(view.screen).toBe(view.screen);

        app.destroy(true, true);
        canvasB.remove();
    });

    it('the primary view screen is the renderer screen', async () =>
    {
        const app = await getApp();

        expect(app.primaryView.screen).toBe(app.renderer.screen);

        app.destroy();
    });

    it('forwards clear:false into the renderer render call', async () =>
    {
        const app = await getApp({ multiView: true });
        const canvasB = attachedCanvas();
        const view = app.addView({ canvas: canvasB, clear: false });

        const spy = jest.spyOn(app.renderer, 'render');

        view.render();

        expect(spy).toHaveBeenCalledTimes(1);
        expect(spy.mock.calls[0][0]).toMatchObject({ clear: false });

        app.destroy(true, true);
        canvasB.remove();
    });

    it('leaves clear undefined when not provided so the renderer default applies', async () =>
    {
        const app = await getApp({ multiView: true });
        const canvasB = attachedCanvas();
        const view = app.addView({ canvas: canvasB });

        // render() mutates `options.clear ??= background.clearBeforeRender`, so capture the value
        // RenderView passed in BEFORE the renderer fills the default
        let capturedClear: RenderOptions['clear'] = true;
        const renderSpy = jest.fn((options: RenderOptions) =>
        {
            capturedClear = options.clear;
        });

        app.renderer.render = renderSpy as unknown as typeof app.renderer.render;

        view.render();

        expect(renderSpy).toHaveBeenCalledTimes(1);
        expect(capturedClear).toBeUndefined();

        app.destroy(true, true);
        canvasB.remove();
    });

    it('restores the renderer roundPixels after rendering a view (no leak)', async () =>
    {
        const app = await getApp({ multiView: true, roundPixels: false });
        const canvasB = attachedCanvas();

        // a roundPixels:true view applies its value during render (via ViewSystem prerender) and
        // restores it afterwards, so it does not leak into later renders/extract. Per-view application
        // is covered end-to-end by RenderViewRoundPixels.test.ts.
        app.addView({ canvas: canvasB, roundPixels: true }).render();

        expect(app.renderer['_roundPixels']).toBe(0);

        app.destroy(true, true);
        canvasB.remove();
    });

    it('the primary view render keeps the renderer roundPixels default', async () =>
    {
        const app = await getApp({ roundPixels: false });

        app.primaryView.render();

        expect(app.renderer['_roundPixels']).toBe(0);

        app.destroy();
    });
});
