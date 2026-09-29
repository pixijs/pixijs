import '~/scene/graphics/init';
import '~/scene/text/init';
import { AlphaFilter } from '../defaults/alpha/AlphaFilter';
import { getWebGLRenderer } from '@test-utils';
import { Rectangle } from '~/maths';
import { RenderTexture, Texture, TexturePool } from '~/rendering';
import { Container, Graphics, Text } from '~/scene';

import type { Filter } from '../Filter';

interface FilterFrame
{
    outputX: number;
    outputY: number;
    globalX: number;
    globalY: number;
    globalWidth: number;
    globalHeight: number;
}

function recordFilterFrames(filter: Filter): FilterFrame[]
{
    const frames: FilterFrame[] = [];
    const apply = filter.apply.bind(filter);

    filter.apply = (filterManager, input, output, clearMode) =>
    {
        apply(filterManager, input, output, clearMode);

        const { uOutputFrame, uGlobalFrame } = filterManager['_filterGlobalUniforms'].uniforms;

        frames.push({
            outputX: uOutputFrame[0],
            outputY: uOutputFrame[1],
            globalX: uGlobalFrame[0],
            globalY: uGlobalFrame[1],
            globalWidth: uGlobalFrame[2],
            globalHeight: uGlobalFrame[3],
        });
    };

    return frames;
}

function createNestedFilterStage(): Container
{
    const stage = new Container();
    const parent = new Container();
    const child = new Graphics().rect(0, 0, 301, 201).fill('#44aaff');

    parent.filters = [new AlphaFilter({ alpha: 0.9 })];
    child.filters = [new AlphaFilter({ alpha: 0.9 })];
    parent.addChild(child);
    stage.addChild(parent);

    return stage;
}

const screenOptions = { width: 301, height: 201, resolution: 1, background: '#222222' };
const squareScreenOptions = { width: 256, height: 256, resolution: 1 };

describe('FilterSystem stack', () =>
{
    beforeEach(() => TexturePool.clear());

    it('should render nested filters after the renderer is resized', async () =>
    {
        const renderer = await getWebGLRenderer(screenOptions);
        const stage = createNestedFilterStage();

        try
        {
            renderer.render(stage);
            renderer.resize(347, 229);
            renderer.render(stage);

            const { pixels, width } = renderer.extract.pixels({ target: stage, clearColor: '#222222' });
            const pixel = pixels.subarray(((100 * width) + 150) * 4);
            // #44aaff at a combined alpha of 0.9 * 0.9 over an opaque #222222, allowing for 8-bit rounding
            const expected = [62, 144, 213, 255];

            expected.forEach((value, channel) => expect(Math.abs(pixel[channel] - value)).toBeLessThanOrEqual(1));
        }
        finally
        {
            stage.destroy({ children: true });
            renderer.destroy();
        }
    });

    it('should render a filter that follows filtered text after the renderer is resized', async () =>
    {
        const renderer = await getWebGLRenderer(screenOptions);
        const stage = new Container();
        const text = new Text({ text: 'Hello', style: { fill: 'white', filters: [new AlphaFilter({ alpha: 0.5 })] } });
        const graphics = new Graphics().rect(0, 0, 301, 201).fill('#44aaff');

        graphics.filters = [new AlphaFilter({ alpha: 0.9 })];
        stage.addChild(text, graphics);

        try
        {
            renderer.render(stage);
            text.text = 'World';
            renderer.render(stage);
            renderer.resize(347, 229);

            expect(() => renderer.render(stage)).not.toThrow();
        }
        finally
        {
            stage.destroy({ children: true });
            renderer.destroy();
        }
    });

    it('should give a filter that follows filtered text the root resolution', async () =>
    {
        const renderer = await getWebGLRenderer(squareScreenOptions);
        const stage = new Container();
        const text = new Text({ text: 'Hello', resolution: 2, style: { filters: [new AlphaFilter({ alpha: 0.5 })] } });
        const graphics = new Graphics().rect(0, 0, 256, 256).fill('#44aaff');
        const probe = new AlphaFilter({ alpha: 1 });
        const frames = recordFilterFrames(probe);

        graphics.filters = [probe];
        stage.addChild(text, graphics);

        try
        {
            renderer.render(stage);
            text.text = 'World';
            renderer.render(stage);

            expect(frames).toMatchObject([{ globalWidth: 256, globalHeight: 256 }, { globalWidth: 256, globalHeight: 256 }]);
        }
        finally
        {
            stage.destroy({ children: true });
            renderer.destroy();
        }
    });

    it('should place the output frame of trimmed filtered text at the texture origin', async () =>
    {
        const renderer = await getWebGLRenderer(squareScreenOptions);
        const probe = new AlphaFilter({ alpha: 1 });
        const frames = recordFilterFrames(probe);
        const text = new Text({ text: 'Hello', style: { fontSize: 40, trim: true, filters: [probe] } });

        try
        {
            renderer.render(text);

            expect(frames).toMatchObject([{ outputX: 0, outputY: 0 }]);
        }
        finally
        {
            text.destroy();
            renderer.destroy();
        }
    });

    it('should give a text style filter the resolution of the text', async () =>
    {
        const renderer = await getWebGLRenderer(squareScreenOptions);
        const probe = new AlphaFilter({ alpha: 1 });
        const frames = recordFilterFrames(probe);
        const text = new Text({ text: 'Hello', resolution: 2, style: { filters: [probe] } });

        try
        {
            renderer.render(text);
            text.text = 'World';
            renderer.render(text);
            text.text = 'Again';
            renderer.render(text);

            expect(frames).toMatchObject([
                { globalWidth: 512, globalHeight: 512 },
                { globalWidth: 512, globalHeight: 512 },
                { globalWidth: 512, globalHeight: 512 },
            ]);
        }
        finally
        {
            text.destroy();
            renderer.destroy();
        }
    });

    it('should leave the filter stack empty when every filter is disabled', async () =>
    {
        const renderer = await getWebGLRenderer(squareScreenOptions);
        const texture = RenderTexture.create({ width: 32, height: 32 });
        const filter = new AlphaFilter({ alpha: 0.5 });

        filter.enabled = false;

        try
        {
            const result = renderer.filter.generateFilteredTexture({ texture, filters: [filter] });

            expect(result).toBe(texture);
            expect(renderer.filter['_filterStackIndex']).toBe(0);
        }
        finally
        {
            texture.destroy(true);
            renderer.destroy();
        }
    });

    it('should leave the filter stack empty when the texture has no area', async () =>
    {
        const renderer = await getWebGLRenderer(squareScreenOptions);
        const source = RenderTexture.create({ width: 32, height: 32 });
        const texture = new Texture({ source: source.source, frame: new Rectangle(0, 0, 0, 0) });

        try
        {
            const result = renderer.filter.generateFilteredTexture({ texture, filters: [new AlphaFilter({ alpha: 0.5 })] });

            expect(result).toBe(texture);
            expect(renderer.filter['_filterStackIndex']).toBe(0);
        }
        finally
        {
            source.destroy(true);
            renderer.destroy();
        }
    });

    it('should give a nested filter the resolution of its parent filter', async () =>
    {
        const renderer = await getWebGLRenderer(squareScreenOptions);
        const parent = new Container();
        const child = new Graphics().rect(0, 0, 256, 256).fill('#44aaff');
        const probe = new AlphaFilter({ alpha: 1, resolution: 1 });
        const frames = recordFilterFrames(probe);

        parent.filters = [new AlphaFilter({ alpha: 1, resolution: 2 })];
        child.filters = [probe];
        parent.addChild(child);

        try
        {
            renderer.render(parent);
            renderer.render(parent);

            expect(frames).toMatchObject([{ globalWidth: 512, globalHeight: 512 }, { globalWidth: 512, globalHeight: 512 }]);
        }
        finally
        {
            parent.destroy({ children: true });
            renderer.destroy();
        }
    });

    it('should offset the global frame of a nested filter only on its final pass', async () =>
    {
        const renderer = await getWebGLRenderer(squareScreenOptions);
        const stage = new Container();
        const parent = new Container({ x: 40, y: 30 });
        const child = new Graphics().rect(0, 0, 100, 50).fill('#44aaff');
        const firstFilter = new AlphaFilter({ alpha: 1, resolution: 1 });
        const secondFilter = new AlphaFilter({ alpha: 1, resolution: 1 });
        const firstFrames = recordFilterFrames(firstFilter);
        const secondFrames = recordFilterFrames(secondFilter);

        parent.filters = [new AlphaFilter({ alpha: 1, resolution: 2 })];
        child.filters = [firstFilter, secondFilter];
        parent.addChild(child);
        stage.addChild(parent);

        try
        {
            renderer.render(stage);

            // the final pass draws into the parent's texture, which starts at (40, 30) at a resolution of 2
            expect(firstFrames).toMatchObject([{ globalX: 0, globalY: 0 }]);
            expect(secondFrames).toMatchObject([{ globalX: 80, globalY: 60 }]);
        }
        finally
        {
            stage.destroy({ children: true });
            renderer.destroy();
        }
    });

    it('should give a nested filter the resolution of the closest enabled ancestor filter', async () =>
    {
        const renderer = await getWebGLRenderer(squareScreenOptions);
        const grandparent = new Container();
        const parent = new Container();
        const child = new Graphics().rect(0, 0, 256, 256).fill('#44aaff');
        const parentFilter = new AlphaFilter({ alpha: 1, resolution: 1 });
        const probe = new AlphaFilter({ alpha: 1, resolution: 1 });
        const frames = recordFilterFrames(probe);

        parentFilter.enabled = false;
        grandparent.filters = [new AlphaFilter({ alpha: 1, resolution: 2 })];
        parent.filters = [parentFilter];
        child.filters = [probe];
        grandparent.addChild(parent);
        parent.addChild(child);

        try
        {
            renderer.render(grandparent);
            renderer.render(grandparent);

            expect(frames).toMatchObject([{ globalWidth: 512, globalHeight: 512 }, { globalWidth: 512, globalHeight: 512 }]);
        }
        finally
        {
            grandparent.destroy({ children: true });
            renderer.destroy();
        }
    });

    it('should give a nested filter the root resolution when its parent filter is disabled', async () =>
    {
        const renderer = await getWebGLRenderer(squareScreenOptions);
        const parent = new Container();
        const child = new Graphics().rect(0, 0, 256, 256).fill('#44aaff');
        const parentFilter = new AlphaFilter({ alpha: 1, resolution: 2 });
        const probe = new AlphaFilter({ alpha: 1, resolution: 1 });
        const frames = recordFilterFrames(probe);

        parentFilter.enabled = false;
        parent.filters = [parentFilter];
        child.filters = [probe];
        parent.addChild(child);

        try
        {
            renderer.render(parent);
            renderer.render(parent);

            expect(frames).toMatchObject([{ globalWidth: 256, globalHeight: 256 }, { globalWidth: 256, globalHeight: 256 }]);
        }
        finally
        {
            parent.destroy({ children: true });
            renderer.destroy();
        }
    });
});
