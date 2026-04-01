import { RopeGeometry } from '../RopeGeometry';
import { Point } from '~/maths';

describe('RopeGeometry', () =>
{
    describe('constructor', () =>
    {
        it('should create with default options', () =>
        {
            const points = [new Point(0, 0), new Point(100, 0)];
            const rope = new RopeGeometry({ points });

            expect(rope.points).toBe(points);
            expect(rope.width).toEqual(200); // default width
            expect(rope.textureScale).toEqual(0); // default textureScale
        });

        it('should create with custom options', () =>
        {
            const points = [new Point(0, 0), new Point(50, 50), new Point(100, 0)];
            const rope = new RopeGeometry({
                points,
                width: 30,
                textureScale: 1,
            });

            expect(rope.points).toBe(points);
            expect(rope.width).toEqual(30);
            expect(rope.textureScale).toEqual(1);
        });
    });

    describe('geometry buffers', () =>
    {
        it('should have correct position buffer size', () =>
        {
            const points = [new Point(0, 0), new Point(100, 0)];
            const rope = new RopeGeometry({ points });

            const positions = rope.getBuffer('aPosition');

            // Each point creates 2 vertices (top & bottom), each with x,y = 4 floats per point
            expect(positions.data.length).toEqual(points.length * 4);
        });

        it('should have correct UV buffer size', () =>
        {
            const points = [new Point(0, 0), new Point(100, 0)];
            const rope = new RopeGeometry({ points });

            const uvs = rope.getBuffer('aUV');

            expect(uvs.data.length).toEqual(points.length * 4);
        });

        it('should have correct index buffer size', () =>
        {
            const points = [new Point(0, 0), new Point(50, 0), new Point(100, 0)];
            const rope = new RopeGeometry({ points });

            const indices = rope.getIndex();

            // (points.length - 1) segments * 6 indices each
            expect(indices.data.length).toEqual((points.length - 1) * 6);
        });
    });

    describe('UVs', () =>
    {
        it('should have UVs ranging from 0 to 1 when textureScale is 0 (stretched)', () =>
        {
            const points = [new Point(0, 0), new Point(50, 0), new Point(100, 0)];
            const rope = new RopeGeometry({ points, textureScale: 0 });

            const uvs = rope.getBuffer('aUV').data;

            // First point UV should be 0
            expect(uvs[0]).toBeCloseTo(0, 5);
            // Last point UV should be 1
            expect(uvs[(points.length - 1) * 4]).toBeCloseTo(1, 5);
        });
    });

    describe('updateVertices', () =>
    {
        it('should update vertex positions when points change', () =>
        {
            const points = [new Point(0, 0), new Point(100, 0)];
            const rope = new RopeGeometry({ points, width: 20 });

            const positionsBefore = new Float32Array(rope.getBuffer('aPosition').data);

            // Move second point
            points[1].y = 50;
            rope.updateVertices();

            const positionsAfter = rope.getBuffer('aPosition').data;

            // Positions should have changed
            let changed = false;

            for (let i = 0; i < positionsAfter.length; i++)
            {
                if (positionsBefore[i] !== positionsAfter[i])
                {
                    changed = true;
                    break;
                }
            }

            expect(changed).toBe(true);
        });

        it('should handle single point gracefully', () =>
        {
            const points = [new Point(0, 0)];
            const rope = new RopeGeometry({ points, width: 20 });

            // Should not throw
            expect(() => rope.updateVertices()).not.toThrow();
        });
    });

    describe('update', () =>
    {
        it('should call updateVertices when textureScale is 0', () =>
        {
            const points = [new Point(0, 0), new Point(100, 0)];
            const rope = new RopeGeometry({ points, textureScale: 0 });

            // Should not throw
            expect(() => rope.update()).not.toThrow();
        });

        it('should rebuild when textureScale > 0', () =>
        {
            const points = [new Point(0, 0), new Point(100, 0)];
            const rope = new RopeGeometry({ points, textureScale: 1 });

            // Should not throw
            expect(() => rope.update()).not.toThrow();
        });
    });

    describe('multiple points', () =>
    {
        it('should handle many points', () =>
        {
            const points: Point[] = [];

            for (let i = 0; i < 20; i++)
            {
                points.push(new Point(i * 50, Math.sin(i * 0.5) * 50));
            }

            const rope = new RopeGeometry({ points, width: 10 });

            const positions = rope.getBuffer('aPosition');

            expect(positions.data.length).toEqual(points.length * 4);

            const indices = rope.getIndex();

            expect(indices.data.length).toEqual((points.length - 1) * 6);
        });
    });

    describe('empty points', () =>
    {
        it('should throw for empty points array', () =>
        {
            // RopeGeometry with empty points array throws because (0-1)*6 = -6 is invalid
            expect(() => new RopeGeometry({ points: [] })).toThrow();
        });
    });
});
