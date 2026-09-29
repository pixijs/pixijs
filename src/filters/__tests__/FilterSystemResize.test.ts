import '~/scene/graphics/init';
import '~/scene/text/init';
import '~/rendering/init';
import { getWebGLRenderer, getWebGPURenderer, itLocalOnly } from '@test-utils';
import { AlphaFilter, BlurFilter } from '~/filters';
import { RenderTexture, Texture, TexturePool } from '~/rendering';
import { Container, Graphics, Text } from '~/scene';

import type { BindResource, Renderer } from '~/rendering';

describe('FilterSystem resize', () =>
{
    let warnSpy: jest.SpyInstance;

    beforeEach(() =>
    {
        TexturePool.clear();
        warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => { /* silence */ });
    });

    afterEach(() =>
    {
        warnSpy.mockRestore();
        TexturePool.clear();
    });

    function destroyedWhileBoundWarnings(): string[]
    {
        return warnSpy.mock.calls
            .map((args) => args.join(' '))
            .filter((message) => message.includes('destroyed while still bound'));
    }

    function createBlurredGroup(): { stage: Container, filter: BlurFilter }
    {
        const stage = new Container();
        const group = new Container({ x: 200, y: 100 });
        const filter = new BlurFilter({ strength: 2 });

        filter.resolution = 1.5;
        group.addChild(new Graphics().rect(0, 0, 200, 200).fill(0xff8800));
        group.filters = [filter];
        stage.addChild(group);

        return { stage, filter };
    }

    function renderAcrossResizes(renderer: Renderer, stage: Container): void
    {
        renderer.render(stage);
        renderer.resize(620, 420);
        renderer.render(stage);
        renderer.resize(600, 400);
        renderer.render(stage);
        renderer.resize(620, 420);
    }

    it('should not warn about destroyed bound textures when a blurred container is rendered across resizes', async () =>
    {
        const renderer = await getWebGLRenderer({ width: 600, height: 400, resolution: 1.25, autoDensity: true });
        const { stage, filter } = createBlurredGroup();

        try
        {
            renderAcrossResizes(renderer, stage);
            renderer.render(stage);
        }
        finally
        {
            stage.destroy({ children: true });
            filter.destroy();
            renderer.destroy();
        }

        expect(destroyedWhileBoundWarnings()).toEqual([]);
    });

    it('should draw the blurred container after resizes', async () =>
    {
        const renderer = await getWebGLRenderer({ width: 600, height: 400, resolution: 1.25, autoDensity: true });
        const { stage, filter } = createBlurredGroup();
        const output = RenderTexture.create({ width: 620, height: 420 });

        try
        {
            renderAcrossResizes(renderer, stage);
            renderer.render({ container: stage, target: output, clear: true });

            const { pixels, width } = renderer.extract.pixels(output);
            const centre = ((200 * width) + 300) * 4;
            const aboveTopEdgeAlpha = pixels[(((99 * width) + 300) * 4) + 3];

            expect(Array.from(pixels.slice(centre, centre + 4))).toEqual([255, 136, 0, 255]);
            expect(aboveTopEdgeAlpha).toBeGreaterThan(0);
            expect(aboveTopEdgeAlpha).toBeLessThan(255);
        }
        finally
        {
            stage.destroy({ children: true });
            filter.destroy();
            output.destroy(true);
            renderer.destroy();
        }
    });

    function warningsAcrossResize(
        renderer: Renderer, stage: Container, filter: AlphaFilter, width: number, height: number
    ): string[]
    {
        try
        {
            renderer.render(stage);
            renderer.resize(width, height);
            renderer.render(stage);

            // read the warnings before teardown, because destroying a WebGPU renderer logs its own bind group warnings
            return destroyedWhileBoundWarnings();
        }
        finally
        {
            stage.destroy({ children: true });
            filter.destroy();
            renderer.destroy();
        }
    }

    function createFullScreenFilter(blendRequired = false): { stage: Container, filter: AlphaFilter }
    {
        const stage = new Container();
        const filter = new AlphaFilter({ alpha: 0.5, blendRequired });

        stage.addChild(new Graphics().rect(0, 0, 301, 201).fill(0xff0000));
        stage.filters = [filter];

        return { stage, filter };
    }

    function fullScreenFilterWarningsAcrossResize(renderer: Renderer, blendRequired = false): string[]
    {
        const { stage, filter } = createFullScreenFilter(blendRequired);

        return warningsAcrossResize(renderer, stage, filter, 347, 229);
    }

    it('should not warn about destroyed bound textures when a full screen filter is rendered after a resize', async () =>
    {
        const renderer = await getWebGLRenderer({ width: 301, height: 201 });

        expect(fullScreenFilterWarningsAcrossResize(renderer)).toEqual([]);
    });

    it('should not warn about destroyed bound textures when a blendRequired filter is rendered after a resize', async () =>
    {
        const renderer = await getWebGLRenderer({ width: 301, height: 201, useBackBuffer: true });

        expect(fullScreenFilterWarningsAcrossResize(renderer, true)).toEqual([]);
    });

    itLocalOnly('should not warn about destroyed bound textures when a full screen filter is '
        + 'rendered after a resize on WebGPU', async () =>
    {
        const renderer = await getWebGPURenderer({ width: 301, height: 201 });

        expect(fullScreenFilterWarningsAcrossResize(renderer)).toEqual([]);
    });

    itLocalOnly('should not warn about destroyed bound textures when a blendRequired filter is '
        + 'rendered after a resize on WebGPU', async () =>
    {
        const renderer = await getWebGPURenderer({ width: 301, height: 201 });

        expect(fullScreenFilterWarningsAcrossResize(renderer, true)).toEqual([]);
    });

    function boundPassTextures(renderer: Renderer, known: Record<string, BindResource>): string[]
    {
        const bindGroup = renderer.filter['_globalFilterBindGroup'];
        const nameOf = (slot: number): string =>
            Object.keys(known).find((name) => known[name] === bindGroup.getResource(slot)) ?? 'unknown';

        return [nameOf(1), nameOf(2), nameOf(3)];
    }

    it('should keep the last pass textures bound until the pool prunes them', async () =>
    {
        const renderer = await getWebGLRenderer({ width: 301, height: 201 });
        const { stage, filter } = createFullScreenFilter();

        try
        {
            renderer.render(stage);

            const input = TexturePool.getOptimalTexture({ width: 301, height: 201 });
            const known = {
                input: input.source,
                inputStyle: input.source.style,
                empty: Texture.EMPTY.source,
                emptyStyle: Texture.EMPTY.source.style,
            };

            TexturePool.returnTexture(input);

            expect(boundPassTextures(renderer, known)).toEqual(['input', 'inputStyle', 'empty']);

            renderer.resize(347, 229);

            expect(input.destroyed).toBe(true);
            expect(boundPassTextures(renderer, known)).toEqual(['empty', 'emptyStyle', 'empty']);
        }
        finally
        {
            stage.destroy({ children: true });
            filter.destroy();
            renderer.destroy();
        }
    });

    function renderThenPrune(renderer: Renderer, prune: () => void): { inputDestroyed: boolean, warnings: string[] }
    {
        const { stage, filter } = createFullScreenFilter();

        try
        {
            renderer.render(stage);

            const input = TexturePool.getOptimalTexture({ width: 301, height: 201 });

            TexturePool.returnTexture(input);
            prune();

            return { inputDestroyed: input.destroyed, warnings: destroyedWhileBoundWarnings() };
        }
        finally
        {
            stage.destroy({ children: true });
            filter.destroy();
            renderer.destroy();
        }
    }

    const prunedWithoutWarnings = { inputDestroyed: true, warnings: [] as string[] };

    it.each([
        ['a resize', (renderer: Renderer) => renderer.resize(347, 229)],
        ['a resolution change', (renderer: Renderer) => { renderer.resolution = 2; }],
    ])('should not warn when %s prunes the texture the last filter pass used', async (_, resizeScreen) =>
    {
        const renderer = await getWebGLRenderer({ width: 301, height: 201 });

        expect(renderThenPrune(renderer, () => resizeScreen(renderer))).toEqual(prunedWithoutWarnings);
    });

    it('should not warn when another renderer the last filter pass was sized for resizes', async () =>
    {
        const renderer = await getWebGLRenderer({ width: 600, height: 400 });
        const other = await getWebGLRenderer({ width: 301, height: 201 });

        try
        {
            expect(renderThenPrune(renderer, () => other.resize(347, 229))).toEqual(prunedWithoutWarnings);
        }
        finally
        {
            other.destroy();
        }
    });

    it('should not warn when another renderer the last filter pass was sized for is destroyed', async () =>
    {
        const renderer = await getWebGLRenderer({ width: 600, height: 400 });
        const other = await getWebGLRenderer({ width: 301, height: 201 });

        expect(renderThenPrune(renderer, () => other.destroy())).toEqual(prunedWithoutWarnings);
    });

    it('should not warn when the texture pool is cleared after a filter pass', async () =>
    {
        const renderer = await getWebGLRenderer({ width: 301, height: 201 });

        expect(renderThenPrune(renderer, () => TexturePool.clear())).toEqual(prunedWithoutWarnings);
    });

    it('should not warn when a filtered texture is returned after its bucket was pruned', async () =>
    {
        const renderer = await getWebGLRenderer({ width: 301, height: 201 });
        const filter = new AlphaFilter({ alpha: 0.5 });
        const held = TexturePool.getOptimalTexture({ width: 301, height: 201 });

        try
        {
            // generateFilteredTexture needs the render target a first render sets up
            renderer.render(new Container());
            renderer.resize(347, 229);
            TexturePool.returnTexture(renderer.filter.generateFilteredTexture({ texture: held, filters: [filter] }));

            expect(boundPassTextures(renderer, { held: held.source })[0]).toBe('held');

            TexturePool.returnTexture(held);

            expect({ inputDestroyed: held.destroyed, warnings: destroyedWhileBoundWarnings() })
                .toEqual(prunedWithoutWarnings);
        }
        finally
        {
            filter.destroy();
            renderer.destroy();
        }
    });

    function filteredTextWarningsAcrossResize(renderer: Renderer): string[]
    {
        const stage = new Container();
        const filter = new AlphaFilter({ alpha: 0.5 });

        stage.addChild(new Text({ text: 'A', style: { fontSize: 140, filters: [filter] } }));

        return warningsAcrossResize(renderer, stage, filter, 620, 270);
    }

    it('should not warn about destroyed bound textures when filtered text is rendered after a resize', async () =>
    {
        const renderer = await getWebGLRenderer({ width: 600, height: 250 });

        expect(filteredTextWarningsAcrossResize(renderer)).toEqual([]);
    });

    itLocalOnly('should not warn about destroyed bound textures when filtered text is '
        + 'rendered after a resize on WebGPU', async () =>
    {
        const renderer = await getWebGPURenderer({ width: 600, height: 250 });

        expect(filteredTextWarningsAcrossResize(renderer)).toEqual([]);
    });

    function emptyTextureListenerCounts(): { source: number, style: number }
    {
        const source = Texture.EMPTY.source;

        return { source: source.listenerCount('change'), style: source.style.listenerCount('change') };
    }

    async function renderResizeAndDestroy(): Promise<void>
    {
        const renderer = await getWebGLRenderer({ width: 301, height: 201 });
        const { stage, filter } = createFullScreenFilter();

        renderer.render(stage);
        renderer.resize(347, 229);

        stage.destroy({ children: true });
        filter.destroy();
        renderer.destroy();
    }

    it('should add one pool prune listener per renderer and remove it on destroy', async () =>
    {
        const before = TexturePool.listenerCount('prune');
        const first = await getWebGLRenderer({ width: 100, height: 100 });
        const second = await getWebGLRenderer({ width: 100, height: 100 });
        const withTwo = TexturePool.listenerCount('prune');

        first.destroy();

        const withOne = TexturePool.listenerCount('prune');

        second.destroy();

        expect([before, withTwo, withOne, TexturePool.listenerCount('prune')]).toEqual([0, 2, 1, 0]);
    });

    it('should not keep listeners on the empty texture after the renderer is destroyed', async () =>
    {
        await renderResizeAndDestroy();
        const afterFirstRenderer = emptyTextureListenerCounts();

        await renderResizeAndDestroy();
        await renderResizeAndDestroy();
        await renderResizeAndDestroy();

        expect(emptyTextureListenerCounts()).toEqual(afterFirstRenderer);
    });
});
