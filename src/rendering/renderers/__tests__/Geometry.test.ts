import { GlProgram } from '../gl/shader/GlProgram';
import { Buffer } from '../shared/buffer/Buffer';
import { BufferUsage } from '../shared/buffer/const';
import { Geometry } from '../shared/geometry/Geometry';
import { getGeometry, getGlProgram, getWebGLRenderer } from '@test-utils';

import type { WebGLRenderer } from '../gl/WebGLRenderer';

describe('Geometry', () =>
{
    it('should create correctly', () =>
    {
        const geometry = getGeometry();

        expect(geometry).toBeInstanceOf(Geometry);

        expect(geometry.buffers).toHaveLength(1);
    });

    it('should destroyed', () =>
    {
        const geometry = getGeometry();

        geometry.destroy();

        expect(geometry.buffers).toBeNull();
    });

    it('should destroyed its gpu equivalent', async () =>
    {
        const geometry = getGeometry();

        const program = getGlProgram();

        const renderer = (await getWebGLRenderer()) as WebGLRenderer;

        renderer.geometry.bind(geometry, program);

        const buffer = geometry.buffers[0];

        geometry.destroy();

        expect(geometry._gpuData).toBeEmptyObject();
        expect(buffer.data).not.toBeNull();
    });

    it('should destroyed its gpu equivalent is destroyBuffers is true', async () =>
    {
        const geometry = getGeometry();

        const program = getGlProgram();

        const renderer = (await getWebGLRenderer()) as WebGLRenderer;

        renderer.geometry.bind(geometry, program);

        const buffer = geometry.buffers[0];

        geometry.destroy(true);

        expect(geometry._gpuData).toBeEmptyObject();
        expect(buffer.data).toBeNull();
    });

    it('should set a cast data correctly', () =>
    {
        const buffer = new Buffer({
            data: [1, 2, 3],
            usage: 1,
        });

        expect(buffer.data).toBeInstanceOf(Float32Array);
    });

    it('should dispose all on the GeometrySystem', async () =>
    {
        const geometry = getGeometry();

        const program = getGlProgram();

        const renderer = (await getWebGLRenderer()) as WebGLRenderer;

        renderer.geometry.bind(geometry, program);

        renderer.geometry.destroyAll();

        expect(geometry._gpuData[renderer.uid]).toBeNull();
    });

    it('should return bounds of a geometry correctly', () =>
    {
        const geometry = new Geometry({
            attributes: {
                aPosition: {
                    buffer: new Buffer({
                        data: [-5, -5, 5, -5, 5, 5, -5, 5],
                        usage: 1,
                    }),
                    format: 'float32x2',
                    stride: 2 * 4,
                    offset: 0,
                }
            }
        });

        let bounds = geometry.bounds;

        expect(bounds.minX).toEqual(-5);
        expect(bounds.minY).toEqual(-5);
        expect(bounds.maxX).toEqual(5);
        expect(bounds.maxY).toEqual(5);

        // now update the geometry and check the bounds are updated

        geometry.attributes.aPosition.buffer.data = new Float32Array([-10, -10, 10, -10, 10, 10, -10, 10]);

        expect(geometry['_boundsDirty']).toEqual(true);

        bounds = geometry.bounds;

        expect(bounds.minX).toEqual(-10);
        expect(bounds.minY).toEqual(-10);
        expect(bounds.maxX).toEqual(10);
        expect(bounds.maxY).toEqual(10);
    });

    it('should allow attribute array to be passed into constructor', () =>
    {
        const geometry = new Geometry({
            attributes: {
                aPosition: [0, 1, 2, 3]
            }
        });

        expect(geometry.attributes.aPosition.buffer.data).toEqual(new Float32Array([0, 1, 2, 3]));
    });

    it('should allow attribute typed array to be passed into constructor', () =>
    {
        const float32Array = new Float32Array([0, 1, 2, 3]);
        const geometry = new Geometry({
            attributes: {
                aPosition: float32Array
            }
        });

        expect(geometry.attributes.aPosition.buffer.data).toBe(float32Array);
    });

    it('should allow attribute Buffer to be passed into constructor', () =>
    {
        const buffer = new Buffer({
            data: new Float32Array([0, 1, 2, 3]),
            usage: BufferUsage.VERTEX | BufferUsage.COPY_DST,
        });

        const geometry = new Geometry({
            attributes: {
                aPosition: buffer
            }
        });

        expect(geometry.attributes.aPosition.buffer).toBe(buffer);
    });

    it('should have dirty bounds if the buffer size changes', () =>
    {
        const geometry = new Geometry({
            attributes: {
                aPosition: [0, 1, 2, 3]
            }
        });

        expect(geometry['_boundsDirty']).toEqual(true);

        geometry['_boundsDirty'] = false;

        geometry.attributes.aPosition.buffer.data = new Float32Array([0, 1, 2, 3, 4, 5]);

        expect(geometry['_boundsDirty']).toEqual(true);
    });

    it('should preserve VAO cache when binding same geometry with multiple programs', async () =>
    {
        const geometry = getGeometry();

        const program1 = getGlProgram();
        const program2 = new GlProgram({
            vertex: `
                in vec2 aPosition;

                void main(void)
                {
                    gl_Position = vec4(aPosition * 0.5, 0.0, 1.0);
                }
            `,
            fragment: `
                out vec4 finalColor;

                void main(void)
                {
                    finalColor = vec4(0.0, 1.0, 0.0, 1.0);
                }
            `,
        });

        const renderer = (await getWebGLRenderer()) as WebGLRenderer;

        // Bind geometry with first program - creates gpuData and VAO
        renderer.geometry.bind(geometry, program1);

        const gpuData = geometry._gpuData[renderer.uid];

        expect(gpuData).toBeDefined();
        expect(gpuData.vaoCache[program1._key]).toBeDefined();

        const vao1 = gpuData.vaoCache[program1._key];

        // Bind geometry with second program - should preserve gpuData and add second VAO entry
        renderer.geometry.bind(geometry, program2);

        // gpuData should be the same object (not replaced) - this is the key assertion
        // that verifies the VAO cache bug fix
        expect(geometry._gpuData[renderer.uid]).toBe(gpuData);

        // First program's VAO should still be accessible
        expect(gpuData.vaoCache[program1._key]).toBe(vao1);

        // Second program should also have a VAO entry
        expect(gpuData.vaoCache[program2._key]).toBeDefined();
    });
});
