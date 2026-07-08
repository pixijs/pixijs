import { getWebGLRenderer } from '@test-utils';

function createCanvas(width = 100, height = 100): HTMLCanvasElement
{
    const canvas = document.createElement('canvas');

    canvas.width = width;
    canvas.height = height;

    return canvas;
}

describe('RendererView derived antialias/transparent', () =>
{
    it('derives antialias/transparent from the canvas source', async () =>
    {
        const renderer = await getWebGLRenderer({ multiView: true });
        const canvas = createCanvas();

        const view = renderer.addView({ canvas, antialias: true, transparent: true });

        expect(view.antialias).toBe(view.source.antialias);
        expect(view.transparent).toBe(view.source.transparent);
        expect(view.antialias).toBe(true);
        expect(view.transparent).toBe(true);

        renderer.destroy();
    });

    it('reflects later mutations of source.transparent (no stale stored field)', async () =>
    {
        const renderer = await getWebGLRenderer({ multiView: true });
        const canvas = createCanvas();

        const view = renderer.addView({ canvas, transparent: false });

        expect(view.transparent).toBe(false);

        // mutating the backing source must be visible through the view getter; a stored-field
        // implementation would drift here
        view.source.transparent = true;

        expect(view.transparent).toBe(true);

        renderer.destroy();
    });

    it('reflects later mutations of source.antialias (no stale stored field)', async () =>
    {
        const renderer = await getWebGLRenderer({ multiView: true });
        const canvas = createCanvas();

        const view = renderer.addView({ canvas, antialias: false });

        expect(view.antialias).toBe(false);

        view.source.antialias = true;

        expect(view.antialias).toBe(true);

        renderer.destroy();
    });

    it('keeps roundPixels as a resolved stored value', async () =>
    {
        const renderer = await getWebGLRenderer({ multiView: true });
        const canvas = createCanvas();

        const view = renderer.addView({ canvas, roundPixels: true });

        expect(view.roundPixels).toBe(true);

        const defaulted = renderer.addView({ canvas: createCanvas() });

        expect(defaulted.roundPixels).toBe(renderer.roundPixels);

        renderer.destroy();
    });
});
