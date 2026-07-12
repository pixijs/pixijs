import { Application } from '../Application';
import { RenderView } from '../RenderView';
import { getApp } from '@test-utils';
import { CanvasSource } from '~/rendering';
import { Container } from '~/scene';

function attachedCanvas(width = 128, height = 128): HTMLCanvasElement
{
    const canvas = document.createElement('canvas');

    canvas.width = width;
    canvas.height = height;
    document.body.appendChild(canvas);

    return canvas;
}

describe('Application multiView', () =>
{
    it('exposes the primary view as the first view wrapping the main canvas and stage', async () =>
    {
        const app = await getApp();

        expect(app).toBeInstanceOf(Application);
        expect(app.views.length).toBe(1);
        expect(app.views[0]).toBe(app.primaryView);
        expect(app.primaryView).toBeInstanceOf(RenderView);
        expect(app.primaryView.isPrimary).toBe(true);
        expect(app.primaryView.canvas).toBe(app.renderer.canvas);
        expect(app.primaryView.stage).toBe(app.stage);

        app.destroy();
    });

    it('renders a single-view application through the main-view path', async () =>
    {
        const app = await getApp();
        const spy = jest.spyOn(app.renderer, 'render');

        app.render();

        expect(spy).toHaveBeenCalledTimes(1);
        expect(app.renderer.lastObjectRendered).toBe(app.stage);

        app.destroy();
    });

    it('keeps app.stage and primaryView.stage as the same instance', async () =>
    {
        const app = await getApp();
        const newStage = new Container();

        app.stage = newStage;

        expect(app.primaryView.stage).toBe(newStage);
        expect(app.stage).toBe(newStage);

        app.destroy();
    });

    it('addView registers a view rendered each frame, with the primary rendered last', async () =>
    {
        const app = await getApp({ multiView: true });
        const canvasB = attachedCanvas();

        const view = app.addView({ canvas: canvasB });

        expect(view).toBeInstanceOf(RenderView);
        expect(view.isPrimary).toBe(false);
        expect(app.views).toEqual([app.primaryView, view]);

        const spy = jest.spyOn(app.renderer, 'render');

        app.render();

        // primary + secondary each render once, and the primary renders last so its stage is the
        // renderer's lastObjectRendered (the main view's hit-test root)
        expect(spy).toHaveBeenCalledTimes(2);
        expect(app.renderer.lastObjectRendered).toBe(app.stage);

        app.destroy(true, true);
        canvasB.remove();
    });

    it('skips disabled views when rendering', async () =>
    {
        const app = await getApp({ multiView: true });
        const canvasB = attachedCanvas();
        const view = app.addView({ canvas: canvasB });

        view.enabled = false;
        const spy = jest.spyOn(app.renderer, 'render');

        app.render();

        expect(spy).toHaveBeenCalledTimes(1);

        app.destroy(true, true);
        canvasB.remove();
    });

    it('removeView stops rendering a view and refuses to remove the primary', async () =>
    {
        const app = await getApp({ multiView: true });
        const canvasB = attachedCanvas();
        const view = app.addView({ canvas: canvasB });

        expect(app.removeView(view)).toBe(true);
        expect(app.views.length).toBe(1);
        expect(app.removeView(view)).toBe(false);
        expect(app.removeView(app.primaryView)).toBe(false);
        expect(app.views[0]).toBe(app.primaryView);

        app.destroy(true, true);
        canvasB.remove();
    });

    it('resizes a secondary view independently of the renderer main view', async () =>
    {
        const app = await getApp({ multiView: true, width: 100, height: 100 });
        const canvasB = attachedCanvas(50, 50);
        const view = app.addView({ canvas: canvasB });

        view.resize(200, 150, 1);

        expect(canvasB.width).toBe(200);
        expect(canvasB.height).toBe(150);
        // the renderer's own view is untouched
        expect(app.renderer.width).toBe(100);
        expect(app.renderer.height).toBe(100);

        app.destroy(true, true);
        canvasB.remove();
    });

    it('routes a primary view resize through the renderer', async () =>
    {
        const app = await getApp({ width: 100, height: 100 });

        app.primaryView.resize(300, 200);

        expect(app.renderer.width).toBe(300);
        expect(app.renderer.height).toBe(200);

        app.destroy();
    });

    it('destroys added views and their stages on app.destroy', async () =>
    {
        const app = await getApp({ multiView: true });
        const canvasB = attachedCanvas();
        const view = app.addView({ canvas: canvasB });
        const stageB = view.stage;
        const stageSpy = jest.spyOn(stageB, 'destroy');

        app.destroy(true, true);

        expect(stageSpy).toHaveBeenCalled();
        canvasB.remove();
    });

    it('backs an added view with a CanvasView registered on the renderer', async () =>
    {
        const app = await getApp({ multiView: true });
        const canvasB = attachedCanvas();
        const view = app.addView({ canvas: canvasB });

        expect(view.canvasView).not.toBeNull();
        expect(app.renderer.views).toContain(view.canvasView);
        expect(view.canvasView.canvas).toBe(canvasB);
        expect(view.canvasView.isMain).toBe(false);

        app.destroy(true, true);
        canvasB.remove();
    });

    it('tears the CanvasView down across systems when removed from the renderer', async () =>
    {
        const app = await getApp({ multiView: true });
        const canvasB = attachedCanvas();
        const view = app.addView({ canvas: canvasB });
        const canvasView = view.canvasView;

        const events = app.renderer.events;
        const accessibility = app.renderer.accessibility;

        // the per-canvas systems pick the view up off the viewAdded runner
        expect(events['_views'].get(canvasB)).toBeTruthy();
        expect(accessibility['_tracker'].get(canvasB)).toBeTruthy();

        app.renderer.removeView(canvasView);

        expect(app.renderer.views).not.toContain(canvasView);
        expect(events['_views'].get(canvasB)).toBeFalsy();
        expect(accessibility['_tracker'].get(canvasB)).toBeFalsy();

        app.destroy(true, true);
        canvasB.remove();
    });

    it('gives a secondary view its own retina CanvasSource when created with resolution 2', async () =>
    {
        const app = await getApp({ multiView: true, resolution: 1 });
        const canvasB = attachedCanvas(100, 100);
        const view = app.addView({ canvas: canvasB, resolution: 2 });

        const source = view.canvasView.source;

        expect(source).toBeInstanceOf(CanvasSource);
        expect(source.resolution).toBe(2);
        expect(view.canvasView.resolution).toBe(2);
        // the renderer's own main view stays at the renderer resolution
        expect(app.renderer.resolution).toBe(1);

        app.destroy(true, true);
        canvasB.remove();
    });

    it('does not throw on render when a view was destroyed directly while still in the list', async () =>
    {
        const app = await getApp({ multiView: true });
        const canvasB = attachedCanvas();
        const view = app.addView({ canvas: canvasB });

        view.destroy();

        expect(view.enabled).toBe(false);
        expect(() => app.render()).not.toThrow();

        app.destroy(true, true);
        canvasB.remove();
    });

    it('removeView with stage destroy options destroys the stage children', async () =>
    {
        const app = await getApp({ multiView: true });
        const canvasB = attachedCanvas();
        const view = app.addView({ canvas: canvasB });
        const child = new Container();

        view.stage.addChild(child);
        const childSpy = jest.spyOn(child, 'destroy');

        expect(app.removeView(view, { children: true })).toBe(true);
        expect(childSpy).toHaveBeenCalled();

        app.destroy(true, true);
        canvasB.remove();
    });
});
