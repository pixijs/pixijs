import '~/scene/graphics/init';
import '~/scene/text/init';
import { AlphaFilter } from '../defaults/alpha/AlphaFilter';
import { getWebGLRenderer, getWebGPURenderer, itLocalOnly } from '@test-utils';
import { RenderTexture, TexturePool } from '~/rendering';
import { Container, Graphics, Text } from '~/scene';

interface TextRenderOptions
{
    filtered: boolean;
    trim?: boolean;
    textResolution?: number;
    rendererResolution?: number;
    webgpu?: boolean;
    disabled?: boolean;
    alpha?: number;
}

async function renderTextPixels(options: TextRenderOptions): Promise<Uint8ClampedArray>
{
    const { filtered, trim, textResolution, rendererResolution = 1, webgpu, disabled, alpha } = options;
    const rendererOptions = { width: 256, height: 256, resolution: rendererResolution, backgroundAlpha: 0 };
    const renderer = webgpu ? await getWebGPURenderer(rendererOptions) : await getWebGLRenderer(rendererOptions);
    const target = RenderTexture.create({ width: 256, height: 256, resolution: rendererResolution });
    const stage = new Container();
    const graphics = new Graphics().rect(0, 0, 200, 200).fill('red');
    // the default filter resolution of 1 would downsample high resolution text
    const textFilter = new AlphaFilter({ alpha: alpha ?? 1, resolution: 'inherit' });

    textFilter.enabled = !disabled;

    const text = new Text({
        text: 'Hello',
        anchor: 0.5,
        x: 128,
        y: 128,
        resolution: textResolution,
        style: {
            fill: 'white',
            fontSize: 40,
            trim: trim ?? false,
            filters: filtered ? [textFilter] : undefined,
        },
    });

    graphics.filters = [new AlphaFilter({ alpha: 1 })];
    stage.addChild(graphics, text);

    try
    {
        renderer.render({ container: stage, target });
        // regenerating the text makes it filter through the stack slot the Graphics filter used
        text.text = 'World';
        renderer.render({ container: stage, target });

        return renderer.extract.pixels(target).pixels;
    }
    finally
    {
        stage.destroy({ children: true });
        target.destroy(true);
        TexturePool.clear();
        renderer.destroy();
    }
}

function compareTextPixels(expected: Uint8ClampedArray, actual: Uint8ClampedArray)
{
    let textPixels = 0;
    let maxDifference = 0;

    for (let offset = 0; offset < expected.length; offset += 4)
    {
        if (expected[offset + 1] > 128) textPixels++;

        for (let channel = 0; channel < 4; channel++)
        {
            const difference = Math.abs(actual[offset + channel] - expected[offset + channel]);

            maxDifference = Math.max(maxDifference, difference);
        }
    }

    return { textPixels, maxDifference };
}

async function filteredTextDifference(options: Omit<TextRenderOptions, 'filtered'>)
{
    const expected = await renderTextPixels({ ...options, filtered: false });
    const actual = await renderTextPixels({ ...options, filtered: true });

    return compareTextPixels(expected, actual);
}

describe('FilterSystem filtered texture', () =>
{
    it('should draw anchored filtered text where unfiltered text is drawn after a filtered container rendered', async () =>
    {
        const { textPixels, maxDifference } = await filteredTextDifference({});

        expect(textPixels).toBeGreaterThan(0);
        expect(maxDifference).toBeLessThanOrEqual(1);
    });

    it('should draw filtered text at resolution 2 where unfiltered text is drawn', async () =>
    {
        const { textPixels, maxDifference } = await filteredTextDifference({ textResolution: 2 });

        expect(textPixels).toBeGreaterThan(0);
        expect(maxDifference).toBeLessThanOrEqual(1);
    });

    it('should draw filtered text on a resolution 2 renderer where unfiltered text is drawn', async () =>
    {
        const { textPixels, maxDifference } = await filteredTextDifference({ rendererResolution: 2 });

        expect(textPixels).toBeGreaterThan(0);
        expect(maxDifference).toBeLessThanOrEqual(1);
    });

    it.each([1, 2])(
        'should draw trimmed filtered text at resolution %i where unfiltered trimmed text is drawn',
        async (textResolution) =>
        {
            const { textPixels, maxDifference } = await filteredTextDifference({ trim: true, textResolution });

            expect(textPixels).toBeGreaterThan(0);
            expect(maxDifference).toBeLessThanOrEqual(1);
        });

    itLocalOnly(
        'should draw trimmed filtered text on a resolution 2 WebGPU renderer where unfiltered text is drawn',
        async () =>
        {
            const { textPixels, maxDifference } = await filteredTextDifference({
                trim: true,
                rendererResolution: 2,
                webgpu: true,
            });

            expect(textPixels).toBeGreaterThan(0);
            expect(maxDifference).toBeLessThanOrEqual(1);
        });

    it('should apply a style filter to the text', async () =>
    {
        const expected = await renderTextPixels({ filtered: false });
        const actual = await renderTextPixels({ filtered: true, alpha: 0.5 });
        let whitePixels = 0;
        let halfPixels = 0;

        for (let offset = 0; offset < expected.length; offset += 4)
        {
            if (expected[offset + 1] !== 255) continue;

            whitePixels++;
            if (Math.abs(actual[offset + 1] - 128) <= 1) halfPixels++;
        }

        expect(whitePixels).toBeGreaterThan(0);
        expect(halfPixels).toBe(whitePixels);
    });

    it('should draw text with a disabled style filter where unfiltered text is drawn', async () =>
    {
        const { textPixels, maxDifference } = await filteredTextDifference({ disabled: true });

        expect(textPixels).toBeGreaterThan(0);
        expect(maxDifference).toBeLessThanOrEqual(1);
    });
});
