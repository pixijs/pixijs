import { Buffer } from '../shared/buffer/Buffer';
import { BufferUsage } from '../shared/buffer/const';
import { Geometry } from '../shared/geometry/Geometry';
import { Shader } from '../shared/shader/Shader';
import { State } from '../shared/state/State';
import { describeLocalOnly, getGlProgram, getWebGLRenderer, getWebGPURenderer } from '@test-utils';

import type { WebGLRenderer } from '../gl/WebGLRenderer';
import type { WebGPURenderer } from '../gpu/WebGPURenderer';

const ONE_QUAD = 6;
const TWO_QUADS = 12;

// two quads out of one index buffer: the shape indexCount exists for, where a buffer is sized for
// the biggest batch and each geometry sharing it draws a prefix
function quadGeometry(indexCount?: number): Geometry
{
    return new Geometry({
        attributes: {
            aPosition: [
                0, 0, 1, 0, 1, 1, 0, 1,
                2, 0, 3, 0, 3, 1, 2, 1,
            ],
        },
        indexBuffer: new Uint16Array([0, 1, 2, 0, 2, 3, 4, 5, 6, 4, 6, 7]),
        indexCount,
    });
}

// the same two quads, but drawn from a uint16 index buffer that has a size and no data, as one
// filled on the GPU would be; its format can only come from the indexFormat option
function sizeOnlyIndexGeometry(): Geometry
{
    return new Geometry({
        attributes: { aPosition: quadGeometry().attributes.aPosition.buffer },
        indexBuffer: new Buffer({
            size: TWO_QUADS * 2,
            usage: BufferUsage.INDEX | BufferUsage.COPY_DST,
            indexFormat: 'uint16',
        }),
    });
}

describe('Geometry indexCount', () =>
{
    it('should default to 0 and take its value from the descriptor', () =>
    {
        expect(quadGeometry().indexCount).toBe(0);
        expect(quadGeometry(ONE_QUAD).indexCount).toBe(ONE_QUAD);
    });
});

describe('Buffer indexFormat', () =>
{
    it('should take the format and count from the data when the buffer has any', () =>
    {
        const buffer = new Buffer({ data: new Uint16Array(6), usage: BufferUsage.INDEX, indexFormat: 'uint32' });

        expect(buffer.indexFormat).toBe('uint16');
        expect(buffer._indexLength).toBe(6);
    });

    it('should take the format from the option and the count from the size when it has no data', () =>
    {
        const uint16 = new Buffer({ size: 24, usage: BufferUsage.INDEX, indexFormat: 'uint16' });
        const uint32 = new Buffer({ size: 24, usage: BufferUsage.INDEX });

        expect(uint16.indexFormat).toBe('uint16');
        expect(uint16._indexLength).toBe(12);
        expect(uint32.indexFormat).toBe('uint32');
        expect(uint32._indexLength).toBe(6);
    });
});

describe('Geometry indexCount on WebGL', () =>
{
    let renderer: WebGLRenderer;

    beforeAll(async () =>
    {
        renderer = (await getWebGLRenderer()) as WebGLRenderer;
    });

    afterAll(() =>
    {
        renderer.destroy();
        renderer = null;
    });

    // only the count and index type handed to gl.drawElements matter here, and no program is bound
    // to draw with, so the call is captured rather than let through
    function drawElementsCall(geometry: Geometry, size?: number): Parameters<WebGL2RenderingContext['drawElements']>
    {
        renderer.geometry.bind(geometry, getGlProgram());

        const drawElements = jest.spyOn(renderer.gl, 'drawElements')
            .mockImplementation(() => { /* captured, not drawn */ });

        renderer.geometry.draw(undefined, size);

        const call = drawElements.mock.calls[0];

        drawElements.mockRestore();

        return call;
    }

    function drawCount(geometry: Geometry, size?: number): number
    {
        return drawElementsCall(geometry, size)[1];
    }

    it('should draw indexCount indices when one is set', () =>
    {
        expect(drawCount(quadGeometry(ONE_QUAD))).toBe(ONE_QUAD);
    });

    it('should draw the whole index buffer when indexCount is 0', () =>
    {
        expect(drawCount(quadGeometry())).toBe(TWO_QUADS);
    });

    it('should let an explicit size win over indexCount', () =>
    {
        expect(drawCount(quadGeometry(ONE_QUAD), 3)).toBe(3);
    });

    it('should draw a size-only index buffer with its indexFormat and its size in indices', () =>
    {
        const [, count, type] = drawElementsCall(sizeOnlyIndexGeometry());

        expect(type).toBe(renderer.gl.UNSIGNED_SHORT);
        expect(count).toBe(TWO_QUADS);
    });
});

describeLocalOnly('Geometry indexCount on WebGPU', () =>
{
    let renderer: WebGPURenderer;
    let shader: Shader;
    let state: State;

    beforeAll(async () =>
    {
        renderer = (await getWebGPURenderer()) as WebGPURenderer;

        // clip-space positions, no uniforms — the pipeline just has to be buildable
        shader = Shader.from({
            gpu: {
                vertex: {
                    entryPoint: 'main',
                    source: /* wgsl */`
                        @vertex
                        fn main(@location(0) aPosition : vec2<f32>) -> @builtin(position) vec4<f32> {
                            return vec4<f32>(aPosition, 0.0, 1.0);
                        };
                    `,
                },
                fragment: {
                    entryPoint: 'main',
                    source: /* wgsl */`
                        @fragment
                        fn main() -> @location(0) vec4<f32> {
                            return vec4<f32>(1.0, 0.0, 0.0, 1.0);
                        }
                    `,
                },
            },
        });

        state = State.for2d();
    });

    afterAll(() =>
    {
        renderer.destroy();
        renderer = null;
    });

    // the pipeline, buffers and bind groups are all built for real against the device; only the
    // recording target stands in, so the draw parameters the encoder computes can be read back
    function recordDraw(geometry: Geometry, size?: number): { setIndexBuffer: jest.Mock, drawIndexed: jest.Mock }
    {
        const setIndexBuffer = jest.fn();
        const drawIndexed = jest.fn();

        renderer.encoder.renderPassEncoder = {
            setPipeline: jest.fn(),
            setVertexBuffer: jest.fn(),
            setIndexBuffer,
            setBindGroup: jest.fn(),
            drawIndexed,
        } as unknown as GPURenderPassEncoder;

        renderer.encoder.draw({ geometry, shader, state, size });

        return { setIndexBuffer, drawIndexed };
    }

    function drawCount(geometry: Geometry, size?: number): number
    {
        return recordDraw(geometry, size).drawIndexed.mock.calls[0][0];
    }

    it('should draw indexCount indices when one is set', () =>
    {
        expect(drawCount(quadGeometry(ONE_QUAD))).toBe(ONE_QUAD);
    });

    it('should draw the whole index buffer when indexCount is 0', () =>
    {
        expect(drawCount(quadGeometry())).toBe(TWO_QUADS);
    });

    it('should let an explicit size win over indexCount', () =>
    {
        expect(drawCount(quadGeometry(ONE_QUAD), 3)).toBe(3);
    });

    it('should bind a size-only index buffer with its indexFormat and draw its size in indices', () =>
    {
        const { setIndexBuffer, drawIndexed } = recordDraw(sizeOnlyIndexGeometry());

        expect(setIndexBuffer.mock.calls[0][1]).toBe('uint16');
        expect(drawIndexed.mock.calls[0][0]).toBe(TWO_QUADS);
    });
});
