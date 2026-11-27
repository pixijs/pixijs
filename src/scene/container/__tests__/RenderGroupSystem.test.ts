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

    it('should restore inherited color and alpha after cacheAsTexture is turned off', async () =>
    {
        const renderer = await getWebGLRenderer();
        const target = RenderTexture.create({ width: 40, height: 20 });
        const stage = new Container();
        const parent = new Container({ alpha: 0.5, tint: 0xff0000 });
        const cached = new Container();

        cached.addChild(new Sprite({ texture: Texture.WHITE, x: 20, width: 20, height: 20 }));
        parent.addChild(new Sprite({ texture: Texture.WHITE, width: 20, height: 20 }), cached);
        stage.addChild(parent);

        const pixelAt = (x: number, y: number) =>
        {
            const { pixels, width } = renderer.extract.pixels(target);
            const offset = ((y * width) + x) * 4;

            return Array.from(pixels.subarray(offset, offset + 4));
        };

        renderer.render({ container: stage, target, clear: true });
        cached.cacheAsTexture(true);
        renderer.render({ container: stage, target, clear: true });
        cached.cacheAsTexture(false);
        renderer.render({ container: stage, target, clear: true });

        expect(pixelAt(30, 10)).toEqual(pixelAt(10, 10));

        stage.destroy({ children: true });
        target.destroy(true);
        renderer.destroy();
    });

    it('should keep children hidden with their ancestor after cacheAsTexture is turned off', async () =>
    {
        const renderer = await getWebGLRenderer();
        const stage = new Container();
        const parent = new Container();
        const cached = new Container();
        const inner = new Container();
        const part = new Sprite({ texture: Texture.WHITE, width: 8, height: 8 });

        part.visible = false;
        inner.addChild(new Sprite({ texture: Texture.WHITE, width: 8, height: 8 }), part);
        cached.addChild(inner);
        parent.addChild(cached);
        stage.addChild(parent);

        renderer.render(stage);
        cached.cacheAsTexture(true);
        renderer.render(stage);
        parent.visible = false;
        renderer.render(stage);
        cached.cacheAsTexture(false);
        renderer.render(stage);
        part.visible = true;
        renderer.render(stage);

        expect(part.globalDisplayStatus).not.toEqual(0b111);

        part.x += 1;

        expect(() => renderer.render(stage)).not.toThrow();

        stage.destroy({ children: true });
        renderer.destroy();
    });
});

describe('RenderGroupSystem cacheAsTexture on WebGL', () =>
{
    describeCachedContainerMove(() => getWebGLRenderer());
});

// the cached container's vertices are a ranged update past offset 0, which WebGL1 uploads differently
describe('RenderGroupSystem cacheAsTexture on WebGL1', () =>
{
    describeCachedContainerMove(() => getWebGLRenderer({ preferWebGLVersion: 1 }));
});

describeLocalOnly('RenderGroupSystem cacheAsTexture on WebGPU', () =>
{
    describeCachedContainerMove(() => getWebGPURenderer());
});
