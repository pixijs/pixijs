import '~/scene/graphics/init';
import '~/rendering/init';
import '~/advanced-blend-modes/init';
import defaultFilterVert from '../defaults/defaultFilter.vert';
import { Filter } from '../Filter';
import { describeLocalOnly, getWebGLRenderer, getWebGPURenderer } from '@test-utils';
import { DifferenceBlend } from '~/advanced-blend-modes';
import { GlProgram, GpuProgram, RenderTexture, Texture, TexturePool } from '~/rendering';
import { Container, Graphics } from '~/scene';

import type { Renderer, RendererOptions } from '~/rendering';

type CreateRenderer = (options: Partial<RendererOptions>) => Promise<Renderer>;

const SIZE = 200;
const CELL = 20;

const shiftFragment = `
in vec2 vTextureCoord;
out vec4 finalColor;

uniform sampler2D uBackTexture;
uniform highp vec4 uInputSize;
uniform vec4 uInputClamp;

void main()
{
    vec2 uv = vTextureCoord + vec2(${CELL}.0) * uInputSize.zw;

    finalColor = texture(uBackTexture, clamp(uv, uInputClamp.xy, uInputClamp.zw));
}
`;

const shiftSource = `
struct GlobalFilterUniforms {
  uInputSize:vec4<f32>,
  uInputPixel:vec4<f32>,
  uInputClamp:vec4<f32>,
  uOutputFrame:vec4<f32>,
  uGlobalFrame:vec4<f32>,
  uOutputTexture:vec4<f32>,
};

@group(0) @binding(0) var<uniform> gfu: GlobalFilterUniforms;
@group(0) @binding(1) var uTexture: texture_2d<f32>;
@group(0) @binding(2) var uSampler : sampler;
@group(0) @binding(3) var uBackTexture: texture_2d<f32>;

struct VSOutput {
    @builtin(position) position: vec4<f32>,
    @location(0) uv : vec2<f32>
};

@vertex
fn mainVertex(@location(0) aPosition : vec2<f32>) -> VSOutput {
    var position = aPosition * gfu.uOutputFrame.zw + gfu.uOutputFrame.xy;

    position.x = position.x * (2.0 / gfu.uOutputTexture.x) - 1.0;
    position.y = position.y * (2.0 * gfu.uOutputTexture.z / gfu.uOutputTexture.y) - gfu.uOutputTexture.z;

    return VSOutput(vec4(position, 0.0, 1.0), aPosition * (gfu.uOutputFrame.zw * gfu.uInputSize.zw));
}

@fragment
fn mainFragment(@location(0) uv: vec2<f32>) -> @location(0) vec4<f32> {
    let shifted = uv + vec2<f32>(${CELL}.0) * gfu.uInputSize.zw;

    return textureSample(uBackTexture, uSampler, clamp(shifted, gfu.uInputClamp.xy, gfu.uInputClamp.zw));
}
`;

/** A filter that draws what is behind it, one cell up and to the left, as a backdrop displacement would. */
function createBackdropShiftFilter(): Filter
{
    return new Filter({
        glProgram: GlProgram.from({ vertex: defaultFilterVert, fragment: shiftFragment }),
        gpuProgram: GpuProgram.from({
            vertex: { source: shiftSource, entryPoint: 'mainVertex' },
            fragment: { source: shiftSource, entryPoint: 'mainFragment' },
        }),
        blendRequired: true,
        resources: { uBackTexture: Texture.EMPTY },
    });
}

type Rgb = [number, number, number];

interface Effect
{
    createFilter: () => Filter;
    /** The colour the filter should leave at a point, from the backdrop. */
    expected: (x: number, y: number) => Rgb;
}

/**
 * The colour of the backdrop cell a point falls in; every cell has its own, so a scaled backdrop shows.
 * @param x - the x position of the point
 * @param y - the y position of the point
 */
function backdropColor(x: number, y: number): Rgb
{
    return [40 + (Math.floor(x / CELL) * 20), 40 + (Math.floor(y / CELL) * 20), 0];
}

const blend: Effect = {
    createFilter: () => new DifferenceBlend(),
    expected: (x, y) => backdropColor(x, y).map((channel) => 255 - channel) as Rgb,
};

const shift: Effect = {
    createFilter: createBackdropShiftFilter,
    expected: (x, y) => backdropColor(x + CELL, y + CELL),
};

const effects: [string, Effect][] = [
    ['an advanced blend mode', blend],
    ['a filter that displaces the backdrop', shift],
];

function createBackdrop(): Graphics
{
    const backdrop = new Graphics();

    for (let y = 0; y < SIZE; y += CELL)
    {
        for (let x = 0; x < SIZE; x += CELL)
        {
            const [r, g, b] = backdropColor(x, y);

            backdrop.rect(x, y, CELL, CELL).fill((r << 16) | (g << 8) | b);
        }
    }

    return backdrop;
}

/**
 * Reads back what a render left on the canvas, in physical pixels.
 * @param renderer - the renderer that owns the canvas
 */
function readCanvas(renderer: Renderer): { pixels: Uint8ClampedArray, width: number }
{
    const { width, height } = renderer.canvas;
    const copy = document.createElement('canvas');

    copy.width = width;
    copy.height = height;

    const context = copy.getContext('2d', { willReadFrequently: true });

    context.drawImage(renderer.canvas as HTMLCanvasElement, 0, 0);

    return { pixels: context.getImageData(0, 0, width, height).data, width };
}

interface Setup
{
    rendererResolution: number;
    /** The resolution of the texture rendered to, or null to render to the canvas. */
    textureResolution: number | null;
    filterResolution: number | 'inherit';
    /** The position of the filtered square on both axes. */
    origin: number;
    /** The size of the filtered square, which decides the pooled textures the filter gets. */
    size: number;
}

/**
 * Renders a filtered white square over the backdrop and returns the worst channel error over every point
 * the filter writes backdrop to and reads it from inside the square.
 * @param createRenderer - makes the renderer
 * @param effect - the filter on the square, and what it should leave behind
 * @param setup - the resolutions involved
 * @param points - the positions to check on both axes, the centre of every cell by default
 */
async function worstError(
    createRenderer: CreateRenderer,
    effect: Effect,
    setup: Setup,
    points = Array.from({ length: SIZE / CELL }, (_, i) => (i + 0.5) * CELL),
): Promise<number>
{
    const { rendererResolution, textureResolution, filterResolution, origin, size } = setup;
    const resolution = textureResolution ?? rendererResolution;
    const renderer = await createRenderer({ width: SIZE, height: SIZE, resolution: rendererResolution });
    const target = textureResolution === null
        ? null
        : RenderTexture.create({ width: SIZE, height: SIZE, resolution });
    const stage = new Container();
    const filter = effect.createFilter();

    filter.resolution = filterResolution;

    try
    {
        const square = new Graphics().rect(origin, origin, size, size).fill(0xffffff);

        square.filters = [filter];
        stage.addChild(createBackdrop(), square);
        renderer.render({ container: stage, target: target ?? undefined, clear: true });

        const { pixels, width } = target ? renderer.extract.pixels(target) : readCanvas(renderer);
        // the last cell is left out, as the displaced one reads past the edge of the square there
        const inside = (centre: number) =>
            centre > origin + (CELL / 4) && centre + CELL < origin + size - (CELL / 4);
        let worst = 0;

        for (const y of points)
        {
            for (const x of points)
            {
                if (!inside(x) || !inside(y)) continue;

                const offset = ((Math.floor(y * resolution) * width) + Math.floor(x * resolution)) * 4;
                const expected = effect.expected(x, y);

                for (let c = 0; c < 3; c++)
                {
                    worst = Math.max(worst, Math.abs(pixels[offset + c] - expected[c]));
                }
            }
        }

        return worst;
    }
    finally
    {
        stage.destroy({ children: true });
        filter.destroy();
        target?.destroy(true);
        TexturePool.clear();
        renderer.destroy();
    }
}

// renderer resolution, then the resolution of the texture rendered to (null for the canvas)
const targets: [number, number | null][] = [[1, null], [1.5, null], [2, null], [3, null], [1, 3]];
// 100 fits the power of two both textures round up to, 140 has one of them capped to the screen instead
const sizes = [100, 140];
const filterResolutions = [1, 2];

const cases = targets.flatMap(([rendererResolution, textureResolution]) =>
    filterResolutions.flatMap((filterResolution) =>
        sizes.map((size): [string, Setup] =>
        {
            const target = textureResolution === null ? 'the canvas' : `a ${textureResolution}x texture`;

            return [
                `a ${rendererResolution}x renderer, ${target}, a ${filterResolution}x filter and a ${size}px square`,
                { rendererResolution, textureResolution, filterResolution, origin: CELL, size },
            ];
        })));

function resolutionSuite(createRenderer: CreateRenderer): void
{
    describe.each(effects)('%s', (_, effect) =>
    {
        it.each(cases)('should line the backdrop up with %s', async (_label, setup) =>
        {
            expect(await worstError(createRenderer, effect, setup)).toBeLessThanOrEqual(1);
        });

        it('should line the backdrop up with a filter that inherits its resolution', async () =>
        {
            const setup: Setup = {
                rendererResolution: 3, textureResolution: null, filterResolution: 'inherit', origin: CELL, size: 100,
            };

            expect(await worstError(createRenderer, effect, setup)).toBeLessThanOrEqual(1);
        });
    });

    it('should copy the backdrop when its bounds scale to a hair over a whole pixel', async () =>
    {
        // snapped to 0.8 the square is 28.8 to 131.2, which is 128.00000000000003 pixels wide at 1.25x
        const setup: Setup = {
            rendererResolution: 1.25, textureResolution: null, filterResolution: 'inherit', origin: 29, size: 102,
        };

        expect(await worstError(createRenderer, blend, setup)).toBeLessThanOrEqual(1);
    });

    it('should line the backdrop up when its bounds scale to a hair under a whole pixel', async () =>
    {
        // snapped to 2.625x the square starts at 5.7142857142857135, which scales to 14.999999999999998 pixels
        const setup: Setup = {
            rendererResolution: 2.625, textureResolution: null, filterResolution: 'inherit', origin: 6, size: 100,
        };

        // either side of the cell edges at 40 and 80, which land on whole pixels at 2.625x
        expect(await worstError(createRenderer, blend, setup, [39.9, 40, 79.9, 80])).toBeLessThanOrEqual(1);
    });

    it('should keep the backdrop of a filter that covers the screen the size of the canvas', async () =>
    {
        // a 4096 power of two input would need a 10240 pixel backdrop at 2.5x, past the 8192 a device takes
        const renderer = await createRenderer({ width: 3000, height: 10, resolution: 2.5 });
        const getAlignedTexture = jest.spyOn(TexturePool, 'getAlignedTexture');
        const stage = new Container();
        const filter = blend.createFilter();

        try
        {
            const cover = new Graphics().rect(0, 0, 3000, 10).fill(0xffffff);

            cover.filters = [filter];
            stage.addChild(cover);
            renderer.render({ container: stage });

            const { pixelWidth, pixelHeight } = getAlignedTexture.mock.results[0].value.source;

            expect([pixelWidth, pixelHeight]).toEqual([renderer.canvas.width, renderer.canvas.height]);
        }
        finally
        {
            getAlignedTexture.mockRestore();
            stage.destroy({ children: true });
            filter.destroy();
            TexturePool.clear();
            renderer.destroy();
        }
    });
}

describe('FilterSystem backdrop resolution with WebGL', () =>
{
    resolutionSuite((options) => getWebGLRenderer({ ...options, useBackBuffer: true }));
});

describeLocalOnly('FilterSystem backdrop resolution with WebGPU', () =>
{
    resolutionSuite((options) => getWebGPURenderer(options));
});
