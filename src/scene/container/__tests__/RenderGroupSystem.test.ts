import { Container } from '../Container';
import '../../text/init';
import { describeLocalOnly, getWebGLRenderer, getWebGPURenderer } from '@test-utils';
import { RenderTexture, Texture } from '~/rendering';
import { Sprite, Text } from '~/scene';

import type { Renderer } from '~/rendering';

function describeCachedContainerMove(createRenderer: () => Promise<Renderer>): void
{
    it('should draw a cached container at its new position after it moves', async () =>
    {
        const renderer = await createRenderer();
        const target = RenderTexture.create({ width: 32, height: 32 });
        const stage = new Container();

        // fillers so the cached container's vertices don't start at the beginning of the attribute buffer
        for (let i = 0; i < 5; i++)
        {
            stage.addChild(new Sprite({ texture: Texture.WHITE, width: 1, height: 1 }));
        }

        const cached = new Container({ x: 4, y: 4 });

        cached.addChild(new Sprite({ texture: Texture.WHITE, width: 8, height: 8, tint: 0xff0000 }));
        cached.cacheAsTexture(true);
        stage.addChild(cached);

        const render = () =>
        {
            renderer.render({ container: stage, target, clear: true });

            const { pixels, width } = renderer.extract.pixels(target);

            return (x: number, y: number) =>
            {
                const offset = ((y * width) + x) * 4;

                return Array.from(pixels.subarray(offset, offset + 4));
            };
        };

        expect(render()(8, 8)).toEqual([255, 0, 0, 255]);

        cached.position.set(20, 20);

        const pixelAt = render();

        expect(pixelAt(24, 24)).toEqual([255, 0, 0, 255]);
        expect(pixelAt(8, 8)).toEqual([0, 0, 0, 0]);

        stage.destroy({ children: true });
        target.destroy(true);
        renderer.destroy();
    });
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
});

describe('RenderGroupSystem cacheAsTexture on WebGL', () =>
{
    describeCachedContainerMove(() => getWebGLRenderer());
});

describeLocalOnly('RenderGroupSystem cacheAsTexture on WebGPU', () =>
{
    describeCachedContainerMove(() => getWebGPURenderer());
});
