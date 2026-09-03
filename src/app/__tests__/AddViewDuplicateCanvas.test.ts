import { getApp } from '@test-utils';

function attachedCanvas(width = 128, height = 128): HTMLCanvasElement
{
    const canvas = document.createElement('canvas');

    canvas.width = width;
    canvas.height = height;
    document.body.appendChild(canvas);

    return canvas;
}

describe('Application#addView duplicate canvas', () =>
{
    it('rejects a duplicate canvas and returns the existing view instead of a second corrupt one', async () =>
    {
        const app = await getApp({ multiView: true });
        const canvas = attachedCanvas();

        const v1 = app.addView({ canvas });
        const v2 = app.addView({ canvas });

        // the same canvas hands back the same view; no second view was created
        expect(v2).toBe(v1);
        // _views is primary + v1 only, no duplicate appended
        expect(app['_views'].length).toBe(2);
        expect(app['_views'][1]).toBe(v1);

        // the renderer's canvas->view map resolves the duplicate canvas to v1's canvas view
        const canvasView = app.renderer.view.viewForTarget(canvas);

        expect(canvasView).not.toBeNull();
        expect(canvasView).toBe(v1.canvasView);

        // removing the single owning view clears the map entry with no shared-source corruption
        expect(app.removeView(v1)).toBe(true);
        expect(app.renderer.view.viewForTarget(canvas)).toBeNull();

        app.destroy(true, true);
        canvas.remove();
    });
});
