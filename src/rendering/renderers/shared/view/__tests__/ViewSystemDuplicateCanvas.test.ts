import { getWebGLRenderer, getWebGPURenderer, itLocalOnly } from '@test-utils';

function createCanvas(width = 100, height = 100)
{
    const canvas = document.createElement('canvas');

    canvas.width = width;
    canvas.height = height;

    return canvas;
}

describe('ViewSystem duplicate canvas', () =>
{
    it('should return the existing view when the same canvas is added twice', async () =>
    {
        const renderer = await getWebGLRenderer({ multiView: true });
        const canvas = createCanvas();

        const v1 = renderer.addView({ canvas });
        const v2 = renderer.addView({ canvas });

        // the duplicate add must not create a second view; it returns the first
        expect(v2).toBe(v1);

        // the canvas still resolves to v1 (the duplicate did not clobber _viewBySource)
        expect(renderer.view.viewForTarget(canvas)).toBe(v1);

        // only the main view (index 0) and v1 are registered, no orphaned duplicate
        expect(renderer.view['_views']).toHaveLength(2);

        renderer.destroy();
    });

    it('should clear the canvas mapping after removing the deduplicated view', async () =>
    {
        const renderer = await getWebGLRenderer({ multiView: true });
        const canvas = createCanvas();

        const v1 = renderer.addView({ canvas });

        renderer.addView({ canvas });
        renderer.removeView(v1);

        // before the fix a distinct second view survived removeView(v1) and viewForTarget
        // returned null while that orphan still rendered; with dedup the mapping is fully cleared
        expect(renderer.view.viewForTarget(canvas)).toBeNull();

        renderer.destroy();
    });

    itLocalOnly('should return the existing view when the same canvas is added twice (WebGPU)', async () =>
    {
        const renderer = await getWebGPURenderer({});
        const canvas = createCanvas();

        const v1 = renderer.addView({ canvas });
        const v2 = renderer.addView({ canvas });

        expect(v2).toBe(v1);
        expect(renderer.view.viewForTarget(canvas)).toBe(v1);
        expect(renderer.view['_views']).toHaveLength(2);

        renderer.removeView(v1);
        expect(renderer.view.viewForTarget(canvas)).toBeNull();

        renderer.destroy();
    });
});
