import { getWebGLRenderer } from '@test-utils';

function createCanvas(width = 100, height = 100)
{
    const canvas = document.createElement('canvas');

    canvas.width = width;
    canvas.height = height;

    return canvas;
}

describe('ViewSystem destroy-listener leak (multiView)', () =>
{
    it('should detach the exact removeView handler addView registered', async () =>
    {
        const renderer = await getWebGLRenderer({ multiView: true });
        const canvas = createCanvas();

        const source = renderer.renderTarget.getRenderTarget(canvas).colorTexture;

        const view = renderer.addView({ canvas });

        // the handler ViewSystem stored for this view is the one it attaches to the source
        const handler = renderer.view['_viewDestroyHandlers'].get(view);

        expect(handler).toBeDefined();
        expect(source.listeners('destroy')).toContain(handler);

        renderer.removeView(view);

        // after removeView the stored handler is dropped and no longer registered on the source
        expect(renderer.view['_viewDestroyHandlers'].get(view)).toBeUndefined();
        expect(source.listeners('destroy')).not.toContain(handler);

        renderer.destroy();
    });

    it('should not retain ViewSystem destroy handlers across repeated add/remove cycles', async () =>
    {
        const renderer = await getWebGLRenderer({ multiView: true });
        const canvas = createCanvas();

        const source = renderer.renderTarget.getRenderTarget(canvas).colorTexture;
        const handlers = renderer.view['_viewDestroyHandlers'];

        for (let i = 0; i < 10; i++)
        {
            const view = renderer.addView({ canvas });

            // exactly one ViewSystem destroy handler tracked while the view is live, and it is on the source
            expect(handlers.size).toBe(1);
            expect(source.listeners('destroy')).toContain(handlers.get(view));

            renderer.removeView(view);

            // removeView clears the tracked handler and detaches it from the source every cycle:
            // no ViewSystem destroy handler accumulates on the surviving user canvas
            expect(handlers.size).toBe(0);
        }

        renderer.destroy();
    });

    it('should not grow the raw source destroy-listener count across add/remove cycles', async () =>
    {
        const renderer = await getWebGLRenderer({ multiView: true });
        const canvas = createCanvas();

        const source = renderer.renderTarget.getRenderTarget(canvas).colorTexture;

        // one full cycle establishes the steady-state listener count
        renderer.removeView(renderer.addView({ canvas }));
        const afterOne = source.listenerCount('destroy');

        for (let i = 0; i < 10; i++)
        {
            renderer.removeView(renderer.addView({ canvas }));
        }

        // both the ViewSystem handler and the RenderTargetSystem _initRenderTarget handler are detached on
        // removeView, so churn does not accumulate listeners. Before the RenderTargetSystem fix this grew
        // by one per cycle (releaseRenderTarget evicted the hash so the next addView re-attached it).
        expect(source.listenerCount('destroy')).toBe(afterOne);

        renderer.destroy();
    });
});
