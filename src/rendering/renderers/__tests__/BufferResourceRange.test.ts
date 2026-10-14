import '~/rendering/init';
import { Buffer } from '../shared/buffer/Buffer';
import { BufferResource } from '../shared/buffer/BufferResource';
import { BufferUsage } from '../shared/buffer/const';
import { describeLocalOnly, getWebGLRenderer, getWebGPURenderer } from '@test-utils';
import { Geometry, GlProgram, GpuProgram, RenderTexture, Shader } from '~/rendering';
import { Mesh } from '~/scene';

import type { WebGLRenderer } from '../gl/WebGLRenderer';
import type { WebGPURenderer } from '../gpu/WebGPURenderer';

// the canvas renderer has no uniform buffers
type GpuRenderer = WebGLRenderer | WebGPURenderer;

const RED = [255, 0, 0, 255];
const GREEN = [0, 255, 0, 255];
const YELLOW = [255, 255, 0, 255];

// one 512 byte uniform buffer holding a colour per 256 byte row, the alignment every device accepts
function createSwatchBuffer(): Buffer
{
    const data = new Float32Array(128);

    data.set([1, 0, 0, 1], 0);
    data.set([0, 1, 0, 1], 64);

    return new Buffer({ data, usage: BufferUsage.UNIFORM | BufferUsage.COPY_DST });
}

// fills the whole target with the sum of the colours read from each named swatch block, so any pixel will do
function createSwatchShader(swatches: Record<string, BufferResource>): Shader
{
    const names = Object.keys(swatches);

    return new Shader({
        gpuProgram: new GpuProgram({
            vertex: {
                entryPoint: 'main',
                source: /* wgsl */`
                    @vertex
                    fn main(@location(0) aPosition: vec2<f32>) -> @builtin(position) vec4<f32> {
                        return vec4<f32>(aPosition, 0.0, 1.0);
                    }
                `,
            },
            fragment: {
                entryPoint: 'main',
                source: /* wgsl */`
                    struct Swatch { color: vec4<f32> }

                    ${names.map((name, i) => `@group(0) @binding(${i}) var<uniform> ${name}: Swatch;`).join('\n')}

                    @fragment
                    fn main() -> @location(0) vec4<f32> {
                        return min(${names.map((name) => `${name}.color`).join(' + ')}, vec4<f32>(1.0));
                    }
                `,
            },
        }),
        glProgram: new GlProgram({
            vertex: /* glsl */`#version 300 es
                in vec2 aPosition;

                void main() {
                    gl_Position = vec4(aPosition, 0.0, 1.0);
                }
            `,
            fragment: /* glsl */`#version 300 es
                precision mediump float;

                out vec4 finalColor;

                ${names.map((name) => `uniform ${name} { vec4 ${name}Color; };`).join('\n')}

                void main() {
                    finalColor = min(${names.map((name) => `${name}Color`).join(' + ')}, vec4(1.0));
                }
            `,
        }),
        resources: swatches,
    });
}

function readSwatch(renderer: GpuRenderer, swatches: Record<string, BufferResource>): number[]
{
    const geometry = new Geometry({
        attributes: { aPosition: [-1, -1, 1, -1, 1, 1, -1, 1] },
        indexBuffer: [0, 1, 2, 0, 2, 3],
    });
    const shader = createSwatchShader(swatches);
    const mesh = new Mesh({ geometry, shader });
    const target = RenderTexture.create({ width: 4, height: 4 });

    try
    {
        renderer.render({ container: mesh, target, clear: true });

        return Array.from(renderer.extract.pixels(target).pixels.subarray(0, 4));
    }
    finally
    {
        mesh.destroy();
        shader.destroy();
        geometry.destroy();
        target.destroy(true);
    }
}

function describeBufferResourceRanges(createRenderer: () => Promise<GpuRenderer>): void
{
    let renderer: GpuRenderer;
    let buffer: Buffer;

    beforeAll(async () =>
    {
        renderer = await createRenderer();
    });

    beforeEach(() =>
    {
        buffer = createSwatchBuffer();
    });

    afterEach(() =>
    {
        buffer.destroy();
    });

    afterAll(() =>
    {
        renderer.destroy();
        renderer = null;
    });

    it('should report the uniform buffer offset alignment', () =>
    {
        expect(renderer.limits.minUniformBufferOffsetAlignment).toBeGreaterThan(0);
        expect(renderer.limits.minUniformBufferOffsetAlignment).toBeLessThanOrEqual(256);
    });

    it('should read the first row of a range at byte 0', () =>
    {
        expect(readSwatch(renderer, { swatch: new BufferResource({ buffer, offset: 0, size: 256 }) })).toEqual(RED);
    });

    it('should read the second row of a range at byte 256', () =>
    {
        expect(readSwatch(renderer, { swatch: new BufferResource({ buffer, offset: 256, size: 256 }) })).toEqual(GREEN);
    });

    it('should bind the rest of the buffer when a range has an offset and no size', () =>
    {
        expect(readSwatch(renderer, { swatch: new BufferResource({ buffer, offset: 256 }) })).toEqual(GREEN);
    });

    it('should bind the whole buffer when a resource has no offset or size', () =>
    {
        expect(readSwatch(renderer, { swatch: new BufferResource({ buffer }) })).toEqual(RED);
    });

    // the whole buffer reads red from byte 0 and the range reads green from byte 256, so only both
    // blocks reading their own bytes adds up to yellow
    it('should give two blocks on one buffer their own bindings, whole buffer first', () =>
    {
        expect(readSwatch(renderer, {
            whole: new BufferResource({ buffer }),
            part: new BufferResource({ buffer, offset: 256, size: 256 }),
        })).toEqual(YELLOW);
    });

    it('should give two blocks on one buffer their own bindings, range first', () =>
    {
        expect(readSwatch(renderer, {
            part: new BufferResource({ buffer, offset: 256, size: 256 }),
            whole: new BufferResource({ buffer }),
        })).toEqual(YELLOW);
    });
}

describe('BufferResource ranges on WebGL', () =>
{
    describeBufferResourceRanges(() => getWebGLRenderer());

    // WebGPU reports a misaligned offset itself as a validation error; WebGL fails silently
    it('should warn when an offset is not a multiple of the alignment', async () =>
    {
        const renderer = await getWebGLRenderer();
        const buffer = createSwatchBuffer();
        const warn = jest.spyOn(console, 'warn').mockImplementation(() => { /* captured */ });
        const offset = renderer.limits.minUniformBufferOffsetAlignment / 2;

        try
        {
            readSwatch(renderer, { swatch: new BufferResource({ buffer, offset, size: 16 }) });

            expect(warn).toHaveBeenCalledWith(
                expect.any(String),
                expect.stringContaining('minUniformBufferOffsetAlignment'),
            );
        }
        finally
        {
            warn.mockRestore();
            buffer.destroy();
            renderer.destroy();
        }
    });
});

describeLocalOnly('BufferResource ranges on WebGPU', () =>
{
    describeBufferResourceRanges(() => getWebGPURenderer());
});
