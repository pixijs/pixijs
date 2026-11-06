import '~/scene/graphics/init';
import '~/rendering/init';
import '~/advanced-blend-modes/init';
import defaultFilterVert from '../defaults/defaultFilter.vert';
import { Filter } from '../Filter';
import { describeLocalOnly, getWebGLRenderer, getWebGPURenderer } from '@test-utils';
import { DifferenceBlend } from '~/advanced-blend-modes';
import { GlProgram, GpuProgram, RenderTexture, Texture, TexturePool } from '~/rendering';
import { Container, Graphics } from '~/scene';

import type { Renderer } from '~/rendering';

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

const effects: Record<string, Effect> = {
    'an advanced blend mode': {
        createFilter: () => new DifferenceBlend(),
        expected: (x, y) => backdropColor(x, y).map((channel) => 255 - channel) as Rgb,
    },
    'a filter that displaces the backdrop': {
        createFilter: createBackdropShiftFilter,
        expected: (x, y) => backdropColor(x + CELL, y + CELL),
    },
};

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
    /** The size of the filtered square, which decides the pooled textures the filter gets. */
    size: number;
}

/**
 * Renders a filtered white square over the backdrop and returns the worst channel error over the centre of
 * every cell the filter writes backdrop to.
 * @param createRenderer - makes the renderer for a resolution
 * @param effect - the filter on the square, and what it should leave behind
 * @param setup - the resolutions involved
 */
async function worstError(
    createRenderer: (resolution: number) => Promise<Renderer>,
    effect: Effect,
    setup: Setup,
): Promise<number>
{
    const { rendererResolution, textureResolution, filterResolution, size } = setup;
    const resolution = textureResolution ?? rendererResolution;
    const renderer = await createRenderer(rendererResolution);
    const target = textureResolution === null
        ? null
        : RenderTexture.create({ width: SIZE, height: SIZE, resolution });
    const stage = new Container();
    const filter = effect.createFilter();

    filter.resolution = filterResolution;

    try
    {
        const square = new Graphics().rect(CELL, CELL, size, size).fill(0xffffff);

        square.filters = [filter];
        stage.addChild(createBackdrop(), square);
        renderer.render({ container: stage, target: target ?? undefined, clear: true });

        const { pixels, width } = target ? renderer.extract.pixels(target) : readCanvas(renderer);
        let worst = 0;

        // the last cell is left out, as the displaced one reads past the edge of the square there
        for (let y = CELL * 1.5; y < size; y += CELL)
        {
            for (let x = CELL * 1.5; x < size; x += CELL)
            {
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
const targets: [number, number | null][] = [[1, null], [1.5, null], [2, null], [3, null], [1, 3], [3, 1], [2, 2]];
const filterResolutions: Setup['filterResolution'][] = [1, 2, 'inherit'];
// 100 fits the power of two both textures round up to, 140 has one of them capped to the screen instead
const sizes = [100, 140];

const cases = targets.flatMap(([rendererResolution, textureResolution]) =>
    filterResolutions.flatMap((filterResolution) =>
        sizes.map((size): [string, Setup] =>
        {
            const target = textureResolution === null ? 'the canvas' : `a ${textureResolution}x texture`;
            const filter = filterResolution === 'inherit' ? 'an inherit' : `a ${filterResolution}x`;

            return [
                `a ${rendererResolution}x renderer, ${target}, ${filter} filter and a ${size}px square`,
                { rendererResolution, textureResolution, filterResolution, size },
            ];
        })));

function resolutionSuite(createRenderer: (resolution: number) => Promise<Renderer>): void
{
    describe.each(Object.entries(effects))('%s', (_, effect) =>
    {
        it.each(cases)('should line the backdrop up with %s', async (_label, setup) =>
        {
            expect(await worstError(createRenderer, effect, setup)).toBeLessThanOrEqual(1);
        });
    });
}

describe('FilterSystem backdrop resolution with WebGL', () =>
{
    resolutionSuite((resolution) => getWebGLRenderer({ width: SIZE, height: SIZE, resolution, useBackBuffer: true }));
});

describeLocalOnly('FilterSystem backdrop resolution with WebGPU', () =>
{
    resolutionSuite((resolution) => getWebGPURenderer({ width: SIZE, height: SIZE, resolution }));
});
