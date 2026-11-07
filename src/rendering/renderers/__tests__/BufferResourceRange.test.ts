import '~/rendering/init';
import { Buffer } from '../shared/buffer/Buffer';
import { BufferResource } from '../shared/buffer/BufferResource';
import { BufferUsage } from '../shared/buffer/const';
import { describeLocalOnly, getWebGLRenderer, getWebGPURenderer } from '@test-utils';
import { Geometry, GlProgram, GpuProgram, RenderTexture, Shader, Texture } from '~/rendering';
import { Mesh, MeshGeometry } from '~/scene';

import type { WebGLRenderer } from '../gl/WebGLRenderer';
import type { WebGPURenderer } from '../gpu/WebGPURenderer';

// the canvas renderer has no uniform buffers
type GpuRenderer = WebGLRenderer | WebGPURenderer;

const CLEAR = [0, 0, 0, 0];
const RED = [255, 0, 0, 255];
const GREEN = [0, 255, 0, 255];
const BLUE = [0, 0, 255, 255];
const WHITE = [255, 255, 255, 255];
const YELLOW = [255, 255, 0, 255];

// one colour per 256 byte row, the alignment every device accepts
const ROW_BYTES = 256;
const ROW_FLOATS = ROW_BYTES / Float32Array.BYTES_PER_ELEMENT;

function createSwatchBuffer(rowColors: number[][] = [RED, GREEN]): Buffer
{
    const data = new Float32Array(rowColors.length * ROW_FLOATS);

    rowColors.forEach((color, row) => data.set(color.map((c) => c / 255), row * ROW_FLOATS));

    return new Buffer({ data, usage: BufferUsage.UNIFORM | BufferUsage.COPY_DST });
}

// writes one row into the buffer's data without uploading it
function setRow(buffer: Buffer, row: number, color: number[]): void
{
    buffer.data.set(color.map((c) => c / 255), row * ROW_FLOATS);
}

// writes one row into the buffer's data and uploads just that row
function writeRow(buffer: Buffer, row: number, color: number[]): void
{
    setRow(buffer, row, color);
    buffer.update(ROW_BYTES, row * ROW_BYTES);
}

function row(buffer: Buffer, index: number): BufferResource
{
    return new BufferResource({ buffer, offset: index * ROW_BYTES, size: ROW_BYTES });
}

function createQuadGeometry(): Geometry
{
    return new Geometry({
        attributes: { aPosition: new Float32Array([-1, -1, 1, -1, 1, 1, -1, 1]) },
        indexBuffer: new Uint16Array([0, 1, 2, 0, 2, 3]),
    });
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

// draws the geometry (a full quad unless given one) into a 4x4 target and returns every pixel
function renderSwatch(renderer: GpuRenderer, swatches: Record<string, BufferResource>, geometry?: Geometry): number[]
{
    const ownGeometry = !geometry;

    geometry ??= createQuadGeometry();

    const shader = createSwatchShader(swatches);
    const mesh = new Mesh({ geometry, shader });
    const target = RenderTexture.create({ width: 4, height: 4 });

    try
    {
        renderer.render({ container: mesh, target, clear: true });

        return Array.from(renderer.extract.pixels(target).pixels);
    }
    finally
    {
        mesh.destroy();
        shader.destroy();
        if (ownGeometry) geometry.destroy();
        target.destroy(true);
    }
}

function readSwatch(renderer: GpuRenderer, swatches: Record<string, BufferResource>): number[]
{
    return renderSwatch(renderer, swatches).slice(0, 4);
}

function allPixels(color: number[]): number[]
{
    return Array.from({ length: 16 }, () => color).flat();
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
        expect(readSwatch(renderer, { swatch: row(buffer, 0) })).toEqual(RED);
    });

    it('should read the second row of a range at byte 256', () =>
    {
        expect(readSwatch(renderer, { swatch: row(buffer, 1) })).toEqual(GREEN);
    });

    it('should bind the rest of the buffer when a range has an offset and no size', () =>
    {
        expect(readSwatch(renderer, { swatch: new BufferResource({ buffer, offset: ROW_BYTES }) })).toEqual(GREEN);
    });

    it('should bind the whole buffer when a resource has no offset or size', () =>
    {
        expect(readSwatch(renderer, { swatch: new BufferResource({ buffer }) })).toEqual(RED);
    });

    it('should move one block between ranges of the same buffer', () =>
    {
        expect(readSwatch(renderer, { swatch: new BufferResource({ buffer }) })).toEqual(RED);
        expect(readSwatch(renderer, { swatch: new BufferResource({ buffer, offset: 256 }) })).toEqual(GREEN);
        expect(readSwatch(renderer, { swatch: new BufferResource({ buffer, offset: 0, size: 256 }) })).toEqual(RED);
    });

    // the whole buffer reads red from byte 0 and the range reads green from byte 256, so only both
    // blocks reading their own bytes adds up to yellow
    it('should give two blocks on one buffer their own bindings, whole buffer first', () =>
    {
        expect(readSwatch(renderer, {
            whole: new BufferResource({ buffer }),
            part: row(buffer, 1),
        })).toEqual(YELLOW);
    });

    it('should give two blocks on one buffer their own bindings, range first', () =>
    {
        expect(readSwatch(renderer, {
            part: row(buffer, 1),
            whole: new BufferResource({ buffer }),
        })).toEqual(YELLOW);
    });

    describe('ranged updates', () =>
    {
        it('should land every ranged update made before the first draw', () =>
        {
            const fresh = createSwatchBuffer([CLEAR, CLEAR]);

            writeRow(fresh, 0, BLUE);
            writeRow(fresh, 1, WHITE);

            expect(readSwatch(renderer, { swatch: row(fresh, 0) })).toEqual(BLUE);
            expect(readSwatch(renderer, { swatch: row(fresh, 1) })).toEqual(WHITE);

            fresh.destroy();
        });

        it('should land every ranged update made between two draws of an uploaded buffer', () =>
        {
            expect(readSwatch(renderer, { swatch: row(buffer, 0) })).toEqual(RED);

            writeRow(buffer, 0, BLUE);
            writeRow(buffer, 1, WHITE);

            expect(readSwatch(renderer, { swatch: row(buffer, 0) })).toEqual(BLUE);
            expect(readSwatch(renderer, { swatch: row(buffer, 1) })).toEqual(WHITE);
        });

        it('should keep a ranged update made while nothing drew the buffer', () =>
        {
            const other = createSwatchBuffer();

            expect(readSwatch(renderer, { swatch: row(buffer, 0) })).toEqual(RED);

            writeRow(buffer, 0, BLUE);
            expect(readSwatch(renderer, { swatch: row(other, 0) })).toEqual(RED);
            writeRow(buffer, 1, WHITE);

            expect(readSwatch(renderer, { swatch: row(buffer, 0) })).toEqual(BLUE);
            expect(readSwatch(renderer, { swatch: row(buffer, 1) })).toEqual(WHITE);

            other.destroy();
        });

        it('should draw the new bytes after the data grows and a range past the old end is updated', () =>
        {
            const small = createSwatchBuffer([RED]);

            expect(readSwatch(renderer, { swatch: row(small, 0) })).toEqual(RED);

            const grown = new Float32Array(2 * ROW_FLOATS);

            grown.set(small.data);
            small.data = grown;
            writeRow(small, 1, GREEN);

            expect(readSwatch(renderer, { swatch: row(small, 1) })).toEqual(GREEN);
            expect(readSwatch(renderer, { swatch: row(small, 0) })).toEqual(RED);

            small.destroy();
        });

        it('should upload the whole buffer on a bare update() after a ranged one', () =>
        {
            expect(readSwatch(renderer, { swatch: row(buffer, 0) })).toEqual(RED);

            writeRow(buffer, 1, WHITE);

            setRow(buffer, 0, BLUE);
            setRow(buffer, 1, GREEN);
            buffer.update();

            expect(readSwatch(renderer, { swatch: row(buffer, 0) })).toEqual(BLUE);
            expect(readSwatch(renderer, { swatch: row(buffer, 1) })).toEqual(GREEN);
        });

        it('should land every ranged index update made between two draws', () =>
        {
            // starts degenerate, so it draws nothing
            const indices = new Buffer({ data: new Uint32Array(6), usage: BufferUsage.INDEX | BufferUsage.COPY_DST });
            const geometry = new Geometry({
                attributes: { aPosition: new Float32Array([-1, -1, 1, -1, 1, 1, -1, 1]) },
                indexBuffer: indices,
            });

            expect(renderSwatch(renderer, { swatch: row(buffer, 0) }, geometry)).toEqual(allPixels(CLEAR));

            // one triangle per update, so the quad is only whole if both land
            indices.data.set([0, 1, 2], 0);
            indices.update(12, 0);
            indices.data.set([0, 2, 3], 3);
            indices.update(12, 12);

            expect(renderSwatch(renderer, { swatch: row(buffer, 0) }, geometry)).toEqual(allPixels(RED));

            geometry.destroy();
        });

        it('should listen for updates only while the buffer lives on the GPU', () =>
        {
            expect(buffer.listenerCount('update')).toBe(0);

            readSwatch(renderer, { swatch: row(buffer, 0) });

            expect(buffer.listenerCount('update')).toBe(1);

            buffer.unload();

            expect(buffer.listenerCount('update')).toBe(0);
        });
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

    // ELEMENT_ARRAY_BUFFER is vertex array object state, so an index upload while another geometry's
    // vertex array is bound would rewrite that geometry's index binding; vertex buffers are not
    it('should upload another geometry\'s buffers without disturbing the bound vertex array', async () =>
    {
        const renderer = await getWebGLRenderer();
        const buffer = createSwatchBuffer();
        const quad = createQuadGeometry();
        // starts degenerate, so it draws nothing
        const other = new Geometry({
            attributes: { aPosition: new Float32Array(8) },
            indexBuffer: new Uint16Array([0, 1, 2, 0, 2, 3]),
        });

        try
        {
            expect(renderSwatch(renderer, { swatch: row(buffer, 0) }, other)).toEqual(allPixels(CLEAR));
            expect(renderSwatch(renderer, { swatch: row(buffer, 0) }, quad)).toEqual(allPixels(RED));

            expect(renderer.geometry._activeVao).not.toBeNull();

            const bindVertexArray = jest.spyOn(renderer.gl, 'bindVertexArray');

            // a full quad drawn as one triangle, uploaded while the quad's vertex array is bound
            other.getBuffer('aPosition').data.set([-1, -1, 1, -1, 1, 1, -1, 1]);
            other.getBuffer('aPosition').update();
            other.indexBuffer.data.set([0, 1, 2, 0, 1, 2]);
            other.indexBuffer.update();

            // the index upload went through COPY_WRITE_BUFFER, so no vertex array was unbound or rebound
            expect(bindVertexArray).not.toHaveBeenCalled();
            bindVertexArray.mockRestore();

            expect(renderSwatch(renderer, { swatch: row(buffer, 0) }, quad)).toEqual(allPixels(RED));

            const triangle = renderSwatch(renderer, { swatch: row(buffer, 0) }, other);
            const covered = triangle.filter((_, i) => i % 4 === 3 && triangle[i] === 255).length;

            expect(covered).toBeGreaterThan(0);
            expect(covered).toBeLessThan(16);
        }
        finally
        {
            quad.destroy();
            other.destroy();
            buffer.destroy();
            renderer.destroy();
        }
    });
});

// WebGL1 has no uniform blocks, so these draw a white mesh with the default shader instead of a swatch
function createMeshGeometry(positions: number[], indices: number[]): MeshGeometry
{
    const geometry = new MeshGeometry({
        positions: new Float32Array(positions),
        uvs: new Float32Array(positions.length),
        indices: new Uint32Array(indices),
    });

    // a batched mesh copies its indices into the batch, so would never upload its own index buffer
    geometry.batchMode = 'no-batch';

    return geometry;
}

// draws the geometry, in pixels, into a 4x4 target and returns how many pixels it covered
function renderCoverage(renderer: WebGLRenderer, geometry: MeshGeometry): number
{
    const mesh = new Mesh({ geometry, texture: Texture.WHITE });
    const target = RenderTexture.create({ width: 4, height: 4 });

    try
    {
        renderer.render({ container: mesh, target, clear: true });

        const pixels = renderer.extract.pixels(target).pixels;

        return pixels.filter((value, i) => i % 4 === 3 && value === 255).length;
    }
    finally
    {
        mesh.destroy();
        target.destroy(true);
    }
}

describe('Index buffer updates on WebGL1', () =>
{
    const QUAD = [0, 0, 4, 0, 4, 4, 0, 4];
    let renderer: WebGLRenderer;

    beforeAll(async () =>
    {
        renderer = await getWebGLRenderer({ preferWebGLVersion: 1 });
    });

    afterAll(() =>
    {
        renderer.destroy();
        renderer = null;
    });

    it('should run on a WebGL1 context', () =>
    {
        expect(renderer.context.webGLVersion).toBe(1);
    });

    it('should land every ranged index update made between two draws', () =>
    {
        // starts degenerate, so it draws nothing
        const geometry = createMeshGeometry(QUAD, [0, 0, 0, 0, 0, 0]);

        expect(renderCoverage(renderer, geometry)).toBe(0);

        // one triangle per update, so the quad is only whole if both land
        geometry.indexBuffer.data.set([0, 1, 2], 0);
        geometry.indexBuffer.update(12, 0);
        geometry.indexBuffer.data.set([0, 2, 3], 3);
        geometry.indexBuffer.update(12, 12);

        expect(renderCoverage(renderer, geometry)).toBe(16);

        geometry.destroy();
    });

    it('should upload another geometry\'s indices without changing the bound vertex array\'s', () =>
    {
        const quad = createMeshGeometry(QUAD, [0, 1, 2, 0, 2, 3]);
        const other = createMeshGeometry(QUAD, [0, 0, 0, 0, 0, 0]);

        expect(renderCoverage(renderer, other)).toBe(0);
        expect(renderCoverage(renderer, quad)).toBe(16);
        expect(renderer.geometry._activeVao).not.toBeNull();

        // one triangle, uploaded while the quad's vertex array is bound
        other.indexBuffer.data.set([0, 1, 2, 0, 1, 2]);
        other.indexBuffer.update();

        expect(renderCoverage(renderer, quad)).toBe(16);

        const covered = renderCoverage(renderer, other);

        expect(covered).toBeGreaterThan(0);
        expect(covered).toBeLessThan(16);

        quad.destroy();
        other.destroy();
    });
});

describeLocalOnly('BufferResource ranges on WebGPU', () =>
{
    describeBufferResourceRanges(() => getWebGPURenderer());
});

describe('BufferResource', () =>
{
    it('should stop listening to its buffer when destroyed', () =>
    {
        const buffer = createSwatchBuffer();
        const before = buffer.listenerCount('change');
        const resource = new BufferResource({ buffer });

        expect(buffer.listenerCount('change')).toBe(before + 1);

        resource.destroy();

        expect(buffer.listenerCount('change')).toBe(before);

        buffer.destroy();
    });
});
