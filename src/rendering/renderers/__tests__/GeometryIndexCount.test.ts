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

describe('Geometry indexCount', () =>
{
    it('should default to 0 and take its value from the descriptor', () =>
    {
        expect(quadGeometry().indexCount).toBe(0);
        expect(quadGeometry(ONE_QUAD).indexCount).toBe(ONE_QUAD);
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

    // the count handed to gl.drawElements is the whole story here, and there is no program bound to
    // draw with, so the call is captured rather than let through
    function drawCount(geometry: Geometry, size?: number): number
    {
        renderer.geometry.bind(geometry, getGlProgram());

        const drawElements = jest.spyOn(renderer.gl, 'drawElements')
            .mockImplementation(() => { /* captured, not drawn */ });

        renderer.geometry.draw(undefined, size);

        const count = drawElements.mock.calls[0][1];

        drawElements.mockRestore();

        return count;
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
    function drawCount(geometry: Geometry, size?: number): number
    {
        const drawIndexed = jest.fn();

        renderer.encoder.renderPassEncoder = {
            setPipeline: jest.fn(),
            setVertexBuffer: jest.fn(),
            setIndexBuffer: jest.fn(),
            setBindGroup: jest.fn(),
            drawIndexed,
        } as unknown as GPURenderPassEncoder;

        renderer.encoder.draw({ geometry, shader, state, size });

        return drawIndexed.mock.calls[0][0];
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
});
