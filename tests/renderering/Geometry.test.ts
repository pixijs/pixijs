import { Buffer } from '../../src/rendering/renderers/shared/buffer/Buffer';
import { Geometry } from '../../src/rendering/renderers/shared/geometry/Geometry';
import { getGeometry } from '../utils/getGeometry';
import { getGlProgram } from '../utils/getGlProgram';
import { getWebGLRenderer } from '../utils/getRenderer';

import type { WebGLRenderer } from '../../src/rendering/renderers/gl/WebGLRenderer';

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

        expect(renderer.geometry['_geometryVaoHash'][geometry.uid]).toBeNull();
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

        expect(renderer.geometry['_geometryVaoHash'][geometry.uid]).toBeNull();
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

        expect(renderer.geometry['_geometryVaoHash'][geometry.uid]).toBeNull();
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
                    shaderLocation: 0,
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
});
