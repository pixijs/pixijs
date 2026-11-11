import '~/scene/graphics/init';
import '~/rendering/init';
import '~/advanced-blend-modes/init';
import { describeLocalOnly, getWebGLRenderer, getWebGPURenderer } from '@test-utils';
import { RenderTexture, TexturePool } from '~/rendering';
import { Container, Graphics } from '~/scene';

import type { BLEND_MODES, Renderer } from '~/rendering';

async function renderPixel(
    createRenderer: () => Promise<Renderer>,
    backdropColor: number,
    frontColor: number,
    frontAlpha: number,
    blendMode: BLEND_MODES,
): Promise<number[]>
{
    const renderer = await createRenderer();
    const target = RenderTexture.create({ width: 16, height: 16 });
    const stage = new Container();

    try
    {
        const front = new Graphics().rect(0, 0, 16, 16).fill(frontColor);

        front.alpha = frontAlpha;
        front.blendMode = blendMode;
        stage.addChild(new Graphics().rect(0, 0, 16, 16).fill(backdropColor), front);

        renderer.render({ container: stage, target, clear: true });

        const { pixels, width } = renderer.extract.pixels(target);
        const offset = ((8 * width) + 8) * 4;

        return Array.from(pixels.subarray(offset, offset + 4));
    }
    finally
    {
        stage.destroy({ children: true });
        target.destroy(true);
        TexturePool.clear();
        renderer.destroy();
    }
}

/**
 * Snaps each channel within rounding distance of the expected one, so a failure still shows the actual values.
 * @param actual - The rendered channels.
 * @param expected - The expected channels.
 */
function snapToExpected(actual: number[], expected: number[]): number[]
{
    return actual.map((value, i) => (Math.abs(value - expected[i]) <= 2 ? expected[i] : value));
}

const grey = 0x808080;
const red = 0xff0000;
const white = 0xffffff;

// Over a grey of 0.5, overlay, hard-light and lighten with white give 1.0, so a white layer at alpha 0.5 gives 0.75.
const cases: [string, number, number, number, BLEND_MODES, number[]][] = [
    ['blend a semi-transparent overlay layer with its own colour', grey, white, 0.5, 'overlay', [191, 191, 191, 255]],
    ['blend a semi-transparent hard-light layer with its own colour', grey, white, 0.5, 'hard-light', [191, 191, 191, 255]],
    ['lighten with a semi-transparent layer', grey, white, 0.5, 'lighten', [191, 191, 191, 255]],
    ['leave the backdrop unchanged when darkening with a lighter layer', grey, white, 0.5, 'darken', [128, 128, 128, 255]],
    ['blend opaque layers as before', red, white, 1, 'difference', [0, 255, 255, 255]],
];

function alphaSuite(createRenderer: () => Promise<Renderer>): void
{
    it.each(cases)('should %s', async (_, backdropColor, frontColor, frontAlpha, blendMode, expected) =>
    {
        const actual = await renderPixel(createRenderer, backdropColor, frontColor, frontAlpha, blendMode);

        expect(snapToExpected(actual, expected)).toEqual(expected);
    });
}

describe('Advanced blend modes with a semi-transparent layer in WebGL', () =>
{
    alphaSuite(() => getWebGLRenderer({ width: 16, height: 16, useBackBuffer: true }));
});

describeLocalOnly('Advanced blend modes with a semi-transparent layer in WebGPU', () =>
{
    alphaSuite(() => getWebGPURenderer({ width: 16, height: 16 }));
});
