import { Geometry } from '../shared/geometry/Geometry';

function getProtoGeometry(): Geometry
{
    return new Geometry({
        vertexBuffer: new Float32Array([1, 2, 3, 4, 5, 6]),
        attributes: {
            aPosition: 'float32x2',
            extra: { buffer: new Float32Array(1), format: 'float32' },
            aTexRegion: 'float32x4'
        }
    });
}

describe('Geometry API Sugar', () =>
{
    it('should create geometry attribute by type', () =>
    {
        const geometry = getProtoGeometry();

        expect(geometry.buffers).toHaveLength(2);
        expect(geometry.attributes.extra.bufferIndex).toEqual(1);

        geometry.ensureAttributes();

        expect(geometry.attributes.aPosition).toMatchObject({
            format: 'float32x2',
            stride: 8 + 16,
            offset: 0,
            instance: false,
            bufferIndex: 0,
        });
        expect(geometry.attributes.aTexRegion).toMatchObject({
            format: 'float32x4',
            stride: 8 + 16,
            offset: 8,
            instance: false,
            bufferIndex: 0,
        });
    });

    it('should work with prototype', () =>
    {
        const proto = getProtoGeometry();
        const geom1 = new Geometry({
            attributes: {},
            proto,
            vertexBuffer: new Float32Array([6, 7, 8, 9, 10, 11, 12]),
        });

        expect(geom1.attributes).toBe(proto.attributes);

        const bufProto0 = proto.buffers[0];
        const bufProto1 = proto.buffers[1];
        const bufNew0 = geom1.buffers[0];
        const bufNew1 = geom1.buffers[1];

        expect(bufNew1).toBe(bufProto1);

        geom1.destroy(true);

        expect(bufNew0.destroyed).toBeTrue();
        expect(bufNew1.destroyed).toBeFalse();
        expect(bufProto0.destroyed).toBeFalse();
    });

    it('should replace buffer from prototype geom to buffer specified in attributes', () =>
    {
        const proto = getProtoGeometry();
        const geom1 = new Geometry({
            proto,
            attributes: {
                extra: new Float32Array([1])
            },
            vertexBuffer: new Float32Array([6, 7, 8, 9, 10, 11, 12]),
        });

        const bufProto1 = proto.buffers[1];
        const bufNew1 = geom1.buffers[1];

        expect(bufProto1 === bufNew1).toBeFalse();
    });
});
