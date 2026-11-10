import { Container } from '../Container';
import '../../text/init';
import { describeLocalOnly, getWebGLRenderer, getWebGPURenderer } from '@test-utils';
import { RenderTexture, Texture } from '~/rendering';
import { Graphics, RenderLayer, Sprite, Text } from '~/scene';

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

/**
 * A renderable that is left out of a rebuild keeps the place it had in the batcher's buffers.
 * Moving it afterwards (no rebuild) must not write it over the element that took that place.
 * @param createRenderer - creates the renderer to test
 */
function describeLeftOutOfBuildMove(createRenderer: () => Promise<Renderer>): void
{
    function renderToPixels(renderer: Renderer, stage: Container, target: RenderTexture)
    {
        renderer.render({ container: stage, target, clear: true });

        const { pixels, width } = renderer.extract.pixels(target);

        return (x: number, y: number) =>
        {
            const offset = ((y * width) + x) * 4;

            return Array.from(pixels.subarray(offset, offset + 4));
        };
    }

    it('should keep later sprites intact when a mask without a masked container moves', async () =>
    {
        const renderer = await createRenderer();
        const target = RenderTexture.create({ width: 32, height: 32 });
        const stage = new Container();
        const board = new Container();
        const mask = new Graphics().rect(0, 0, 8, 8).fill(0xffffff);
        const masked = new Container();

        const content = new Sprite({ texture: Texture.WHITE, width: 8, height: 8, tint: 0x00ff00 });

        masked.addChild(content);
        masked.mask = mask;
        board.addChild(mask, masked);

        const victim = new Sprite({ texture: Texture.WHITE, x: 20, y: 20, width: 8, height: 8, tint: 0xff0000 });

        stage.addChild(board, victim);

        renderToPixels(renderer, stage, target);

        // the masked container leaves the scene, its mask stays in the scene (mask still set)
        board.removeChild(masked);
        renderToPixels(renderer, stage, target);

        // a transform change only, no rebuild
        board.position.set(0, 10);

        const pixelAt = renderToPixels(renderer, stage, target);

        expect(pixelAt(24, 24)).toEqual([255, 0, 0, 255]);
        expect(pixelAt(4, 14)).toEqual([0, 0, 0, 0]);

        masked.destroy({ children: true });
        stage.destroy({ children: true });
        target.destroy(true);
        renderer.destroy();
    });

    it('should keep later sprites intact when a sprite of a removed render layer moves', async () =>
    {
        const renderer = await createRenderer();
        const target = RenderTexture.create({ width: 32, height: 32 });
        const stage = new Container();
        const board = new Container();
        const layer = new RenderLayer();
        const layered = new Sprite({ texture: Texture.WHITE, width: 8, height: 8, tint: 0x00ff00 });

        board.addChild(layered);
        layer.attach(layered);

        const victim = new Sprite({ texture: Texture.WHITE, x: 20, y: 20, width: 8, height: 8, tint: 0xff0000 });

        stage.addChild(layer, board, victim);

        renderToPixels(renderer, stage, target);

        // the layer leaves the stage, its sprite stays in the board
        stage.removeChild(layer);
        renderToPixels(renderer, stage, target);

        // a transform change only, no rebuild
        board.position.set(0, 10);

        const pixelAt = renderToPixels(renderer, stage, target);

        expect(pixelAt(24, 24)).toEqual([255, 0, 0, 255]);
        expect(pixelAt(4, 14)).toEqual([0, 0, 0, 0]);

        layer.destroy();
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

// the cached container's vertices are a ranged update past offset 0, which WebGL1 uploads differently
describe('RenderGroupSystem cacheAsTexture on WebGL1', () =>
{
    describeCachedContainerMove(() => getWebGLRenderer({ preferWebGLVersion: 1 }));
});

describeLocalOnly('RenderGroupSystem cacheAsTexture on WebGPU', () =>
{
    describeCachedContainerMove(() => getWebGPURenderer());
});

describe('RenderGroupSystem renderable left out of the build on WebGL', () =>
{
    describeLeftOutOfBuildMove(() => getWebGLRenderer());
});

describeLocalOnly('RenderGroupSystem renderable left out of the build on WebGPU', () =>
{
    describeLeftOutOfBuildMove(() => getWebGPURenderer());
});
