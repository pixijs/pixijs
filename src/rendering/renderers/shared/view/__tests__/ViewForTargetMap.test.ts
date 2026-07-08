import { getWebGLRenderer, getWebGPURenderer, itLocalOnly } from '@test-utils';
import { RenderTexture } from '~/rendering';

function createCanvas(width = 100, height = 100)
{
    const canvas = document.createElement('canvas');

    canvas.width = width;
    canvas.height = height;

    return canvas;
}

describe('ViewSystem.viewForTarget source map', () =>
{
    it('should resolve the main render target to the main view', async () =>
    {
        const renderer = await getWebGLRenderer({ multiView: true });

        const mainView = renderer.view.views[0];

        expect(renderer.view.viewForTarget(renderer.view.renderTarget)).toBe(mainView);

        renderer.destroy();
    });

    it('should resolve each secondary canvas to its own view', async () =>
    {
        const renderer = await getWebGLRenderer({ multiView: true });

        const canvasA = createCanvas();
        const canvasB = createCanvas();
        const canvasC = createCanvas();

        const viewA = renderer.addView({ canvas: canvasA });
        const viewB = renderer.addView({ canvas: canvasB });
        const viewC = renderer.addView({ canvas: canvasC });

        expect(renderer.view.viewForTarget(canvasA)).toBe(viewA);
        expect(renderer.view.viewForTarget(canvasB)).toBe(viewB);
        expect(renderer.view.viewForTarget(canvasC)).toBe(viewC);

        // resolved views point at the same source as their canvas
        expect(renderer.view.viewForTarget(canvasA).source).toBe(viewA.source);
        expect(renderer.view.viewForTarget(canvasB).source).toBe(viewB.source);
        expect(renderer.view.viewForTarget(canvasC).source).toBe(viewC.source);

        // the main view still resolves alongside the secondaries
        expect(renderer.view.viewForTarget(renderer.view.renderTarget)).toBe(renderer.view.views[0]);

        renderer.destroy();
    });

    it('should return null for a texture target', async () =>
    {
        const renderer = await getWebGLRenderer({ multiView: true });

        renderer.addView({ canvas: createCanvas() });

        const renderTexture = RenderTexture.create({ width: 64, height: 64 });

        expect(renderer.view.viewForTarget(renderTexture)).toBeNull();

        renderTexture.destroy();
        renderer.destroy();
    });

    it('should keep the map in sync when a view is removed', async () =>
    {
        const renderer = await getWebGLRenderer({ multiView: true });

        const canvasA = createCanvas();
        const canvasB = createCanvas();
        const canvasC = createCanvas();

        const viewA = renderer.addView({ canvas: canvasA });
        const viewB = renderer.addView({ canvas: canvasB });
        const viewC = renderer.addView({ canvas: canvasC });

        renderer.removeView(viewB);

        // the removed canvas no longer resolves
        expect(renderer.view.viewForTarget(canvasB)).toBeNull();

        // the surviving secondaries and the main view still resolve correctly
        expect(renderer.view.viewForTarget(canvasA)).toBe(viewA);
        expect(renderer.view.viewForTarget(canvasC)).toBe(viewC);
        expect(renderer.view.viewForTarget(renderer.view.renderTarget)).toBe(renderer.view.views[0]);

        renderer.destroy();
    });

    it('should resolve a view added after a removal', async () =>
    {
        const renderer = await getWebGLRenderer({ multiView: true });

        const canvasA = createCanvas();
        const viewA = renderer.addView({ canvas: canvasA });

        renderer.removeView(viewA);
        expect(renderer.view.viewForTarget(canvasA)).toBeNull();

        const canvasB = createCanvas();
        const viewB = renderer.addView({ canvas: canvasB });

        expect(renderer.view.viewForTarget(canvasB)).toBe(viewB);
        // the previously removed canvas is still gone
        expect(renderer.view.viewForTarget(canvasA)).toBeNull();

        renderer.destroy();
    });

    it('should resolve a re-added canvas to its new view', async () =>
    {
        const renderer = await getWebGLRenderer({ multiView: true });

        const canvas = createCanvas();

        const firstView = renderer.addView({ canvas });

        renderer.removeView(firstView);
        expect(renderer.view.viewForTarget(canvas)).toBeNull();

        const secondView = renderer.addView({ canvas });

        expect(renderer.view.viewForTarget(canvas)).toBe(secondView);

        renderer.destroy();
    });
});

describe('ViewSystem.viewForTarget source map (WebGPU)', () =>
{
    itLocalOnly('should resolve the main target and each secondary canvas to its view', async () =>
    {
        const renderer = await getWebGPURenderer({});

        const canvasA = createCanvas(16, 16);
        const canvasB = createCanvas(16, 16);

        const viewA = renderer.addView({ canvas: canvasA });
        const viewB = renderer.addView({ canvas: canvasB });

        expect(renderer.view.viewForTarget(renderer.view.renderTarget)).toBe(renderer.view.views[0]);
        expect(renderer.view.viewForTarget(canvasA)).toBe(viewA);
        expect(renderer.view.viewForTarget(canvasB)).toBe(viewB);

        renderer.destroy();
    });
});
