import '~/rendering/renderers/shared/texture/Texture';
import { Container } from '../Container';
import '../../text/init';
import { getWebGLRenderer, getWebGPURenderer, itLocalOnly } from '@test-utils';
import { RenderTexture } from '~/rendering';
import { Text } from '~/scene';

function createCanvas(width = 100, height = 100): HTMLCanvasElement
{
    const canvas = document.createElement('canvas');

    canvas.width = width;
    canvas.height = height;

    return canvas;
}

describe('RenderGroup cacheAsTexture with the WebGL back buffer', () =>
{
    it('caches at the secondary view resolution even when the back buffer swaps the target', async () =>
    {
        // useBackBuffer swaps options.target to the back-buffer texture in renderStart, after
        // prerender. Resolving the active view from rootRenderTarget (post-swap) would see the
        // back-buffer texture and fall back to resolution 1; resolving it at prerender keeps 3.
        const renderer = await getWebGLRenderer({ resolution: 1, multiView: true, useBackBuffer: true });
        const canvas = createCanvas();
        const view = renderer.addView({ canvas, resolution: 3 });

        const container = new Container();

        container.addChild(new Text({ text: 'hello world' }));
        container.cacheAsTexture(true);

        renderer.render({ container, target: canvas });

        expect(view.resolution).toEqual(3);
        expect(container.renderGroup.texture._source._resolution).toEqual(3);

        renderer.destroy();
    });

    it('caches a main-view group at the renderer resolution with the back buffer active', async () =>
    {
        const renderer = await getWebGLRenderer({ resolution: 1, multiView: true, useBackBuffer: true });
        const container = new Container();

        container.addChild(new Text({ text: 'hello world' }));
        container.cacheAsTexture(true);

        renderer.render(container);

        expect(container.renderGroup.texture._source._resolution).toEqual(renderer.view.resolution);
        expect(renderer.view.activeView).toBe(renderer.views[0]);

        renderer.destroy();
    });

    it('falls back to renderer.view.resolution and a null active view for a RenderTexture target', async () =>
    {
        const renderer = await getWebGLRenderer({ resolution: 1, multiView: true, useBackBuffer: true });
        const renderTexture = RenderTexture.create({ width: 64, height: 64, resolution: 2 });

        const container = new Container();

        container.addChild(new Text({ text: 'hello world' }));
        container.cacheAsTexture(true);

        renderer.render({ container, target: renderTexture });

        // a RenderTexture target is not an on-screen view, so cacheAsTexture keeps the renderer
        // resolution and the active view is null
        expect(container.renderGroup.texture._source._resolution).toEqual(renderer.view.resolution);
        expect(renderer.view.activeView).toBeNull();

        renderTexture.destroy();
        renderer.destroy();
    });

    itLocalOnly('caches at the secondary view resolution on WebGPU (no back buffer)', async () =>
    {
        const renderer = await getWebGPURenderer({ resolution: 1 });
        const canvas = createCanvas();
        const view = renderer.addView({ canvas, resolution: 3 });

        const container = new Container();

        container.addChild(new Text({ text: 'hello world' }));
        container.cacheAsTexture(true);

        renderer.render({ container, target: canvas });

        expect(view.resolution).toEqual(3);
        expect(container.renderGroup.texture._source._resolution).toEqual(3);

        renderer.destroy();
    });
});
