import { PlaneGeometry } from '../PlaneGeometry';

describe('PlaneGeometry', () =>
{
    describe('constructor', () =>
    {
        it('should create with default options', () =>
        {
            const plane = new PlaneGeometry({});

            expect(plane.width).toEqual(100);
            expect(plane.height).toEqual(100);
            expect(plane.verticesX).toEqual(10);
            expect(plane.verticesY).toEqual(10);
        });

        it('should create with custom options', () =>
        {
            const plane = new PlaneGeometry({
                width: 200,
                height: 150,
                verticesX: 5,
                verticesY: 3,
            });

            expect(plane.width).toEqual(200);
            expect(plane.height).toEqual(150);
            expect(plane.verticesX).toEqual(5);
            expect(plane.verticesY).toEqual(3);
        });

        it('should create with partial options', () =>
        {
            const plane = new PlaneGeometry({ width: 50 });

            expect(plane.width).toEqual(50);
            expect(plane.height).toEqual(100); // default
        });
    });

    describe('build', () =>
    {
        it('should generate correct number of vertices', () =>
        {
            const plane = new PlaneGeometry({
                width: 100,
                height: 100,
                verticesX: 3,
                verticesY: 3,
            });

            const positions = plane.getBuffer('aPosition');
            // 3x3 = 9 vertices, each with x,y coordinates = 18 floats
            const total = plane.verticesX * plane.verticesY;

            expect(positions.data.length).toEqual(total * 2);
        });

        it('should generate correct number of UVs', () =>
        {
            const plane = new PlaneGeometry({
                width: 100,
                height: 100,
                verticesX: 3,
                verticesY: 3,
            });

            const uvs = plane.getBuffer('aUV');
            const total = plane.verticesX * plane.verticesY;

            expect(uvs.data.length).toEqual(total * 2);
        });

        it('should generate correct number of indices', () =>
        {
            const plane = new PlaneGeometry({
                width: 100,
                height: 100,
                verticesX: 3,
                verticesY: 3,
            });

            const indexBuffer = plane.getIndex();
            // (verticesX-1) * (verticesY-1) quads, each quad is 2 triangles = 6 indices
            const expectedIndices = (3 - 1) * (3 - 1) * 6;

            expect(indexBuffer.data.length).toEqual(expectedIndices);
        });

        it('should have UVs ranging from 0 to 1', () =>
        {
            const plane = new PlaneGeometry({
                width: 100,
                height: 100,
                verticesX: 5,
                verticesY: 5,
            });

            const uvs = plane.getBuffer('aUV').data;
            let minU = Infinity;
            let maxU = -Infinity;
            let minV = Infinity;
            let maxV = -Infinity;

            for (let i = 0; i < uvs.length; i += 2)
            {
                minU = Math.min(minU, uvs[i]);
                maxU = Math.max(maxU, uvs[i]);
                minV = Math.min(minV, uvs[i + 1]);
                maxV = Math.max(maxV, uvs[i + 1]);
            }

            expect(minU).toBeCloseTo(0, 5);
            expect(maxU).toBeCloseTo(1, 5);
            expect(minV).toBeCloseTo(0, 5);
            expect(maxV).toBeCloseTo(1, 5);
        });

        it('should have positions spanning the full width and height', () =>
        {
            const plane = new PlaneGeometry({
                width: 200,
                height: 150,
                verticesX: 4,
                verticesY: 4,
            });

            const positions = plane.getBuffer('aPosition').data;
            let minX = Infinity;
            let maxX = -Infinity;
            let minY = Infinity;
            let maxY = -Infinity;

            for (let i = 0; i < positions.length; i += 2)
            {
                minX = Math.min(minX, positions[i]);
                maxX = Math.max(maxX, positions[i]);
                minY = Math.min(minY, positions[i + 1]);
                maxY = Math.max(maxY, positions[i + 1]);
            }

            expect(minX).toBeCloseTo(0, 5);
            expect(maxX).toBeCloseTo(200, 5);
            expect(minY).toBeCloseTo(0, 5);
            expect(maxY).toBeCloseTo(150, 5);
        });
    });

    describe('minimum vertex count', () =>
    {
        it('should work with the minimum 2x2 grid', () =>
        {
            const plane = new PlaneGeometry({
                width: 100,
                height: 100,
                verticesX: 2,
                verticesY: 2,
            });

            const positions = plane.getBuffer('aPosition');

            expect(positions.data.length).toEqual(8); // 4 vertices * 2 coords

            const indexBuffer = plane.getIndex();

            expect(indexBuffer.data.length).toEqual(6); // 1 quad = 2 triangles = 6 indices
        });
    });
});
