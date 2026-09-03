import '~/rendering/renderers/shared/texture/Texture';
import { Container } from '../Container';
import '../../text/init';
import { getWebGLRenderer, getWebGPURenderer, itLocalOnly } from '@test-utils';
import { Text } from '~/scene';

function createCanvas(width = 100, height = 100)
{
    const canvas = document.createElement('canvas');

    canvas.width = width;
    canvas.height = height;

    return canvas;
}

describe('RenderGroupSystem', () =>
{
    it('should reset childrenRenderablesToUpdate index between renders', async () =>
    {
        const renderer = await getWebGLRenderer();

        const container = new Container({ isRenderGroup: true });
        const text = new Text({ text: 'hello world' });

        container.addChild(text);

        expect(container.renderGroup.childrenRenderablesToUpdate.index).toEqual(0);

        renderer.render(container);

        text.text = 'hello world 2';
        expect(container.renderGroup.childrenRenderablesToUpdate.index).toEqual(1);

        renderer.render(container);

        expect(container.renderGroup.childrenRenderablesToUpdate.index).toEqual(0);
    });

    it('should only call on render once for a render group after conversion', async () =>
    {
        const renderer = await getWebGLRenderer();

        const container = new Container({ isRenderGroup: false, label: 'root' });

        const child = new Container({ isRenderGroup: true, label: 'child' });

        container.addChild(child);

        child.onRender = jest.fn();

        renderer.render(container);

        expect(child.onRender).toHaveBeenCalledTimes(1);
    });

    it('should only call on render once for a render group before conversion', async () =>
    {
        const renderer = await getWebGLRenderer();

        const container = new Container({ isRenderGroup: true, label: 'root' });

        const child = new Container({ isRenderGroup: true, label: 'child' });

        container.addChild(child);

        child.onRender = jest.fn();

        renderer.render(container);

        expect(child.onRender).toHaveBeenCalledTimes(1);
    });

    it('should correctly set scaleMode for render group texture source during rendering', async () =>
    {
        const renderer = await getWebGLRenderer();
        const container = new Container();

        container.cacheAsTexture({ scaleMode: 'nearest' });
        renderer.render(container);

        expect(container.renderGroup.texture._source.scaleMode).toEqual('nearest');
    });

    it('should cache a render group texture at the active secondary view resolution', async () =>
    {
        const renderer = await getWebGLRenderer({ resolution: 1 });
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

    it('should cache a main-view render group texture at the renderer resolution and antialias', async () =>
    {
        const renderer = await getWebGLRenderer({ resolution: 1, antialias: false });
        const container = new Container();

        container.addChild(new Text({ text: 'hello world' }));
        container.cacheAsTexture(true);

        renderer.render(container);

        expect(container.renderGroup.texture._source._resolution).toEqual(renderer.view.resolution);
        expect(container.renderGroup.texture._source.antialias).toEqual(renderer.view.antialias);

        renderer.destroy();
    });

    itLocalOnly('should cache a render group texture at the active secondary view resolution (WebGPU)', async () =>
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
