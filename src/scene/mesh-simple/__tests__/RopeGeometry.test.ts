import { Point } from '../../../maths/point/Point';
import { RopeGeometry } from '../RopeGeometry';

describe('RopeGeometry', () =>
{
    it('should use correct aspect ratio when textureScale > 0', () =>
    {
        // Create a rope with points spaced 100px apart horizontally
        const points = [
            new Point(0, 0),
            new Point(100, 0),
            new Point(200, 0),
        ];

        // Simulate a texture that is 200px wide and 50px tall
        // width (rope thickness) = texture.height = 50
        // textureWidth = texture.width = 200
        const ropeWithAspectRatio = new RopeGeometry({
            width: 50,
            points,
            textureScale: 1,
            textureWidth: 200,
        });

        // Without the fix, textureWidth would default to width (50),
        // causing UV to advance by distance/50 instead of distance/200
        // With the fix, UV advances by distance/200, preserving aspect ratio

        const uvs = ropeWithAspectRatio.getBuffer('aUV').data;

        // Point 0 at x=0: UV.x should be 0
        expect(uvs[0]).toBe(0);

        // Point 1 at x=100: UV.x should be 100/200 = 0.5
        expect(uvs[4]).toBeCloseTo(0.5, 5);

        // Point 2 at x=200: UV.x should be 200/200 = 1.0
        expect(uvs[8]).toBeCloseTo(1.0, 5);
    });

    it('should produce 1:1 aspect ratio when textureWidth equals width', () =>
    {
        const points = [
            new Point(0, 0),
            new Point(100, 0),
            new Point(200, 0),
        ];

        // When textureWidth == width (old behavior), UV advances by distance/width
        const ropeSquare = new RopeGeometry({
            width: 50,
            points,
            textureScale: 1,
            textureWidth: 50,
        });

        const uvs = ropeSquare.getBuffer('aUV').data;

        // Point 1 at x=100: UV.x should be 100/50 = 2.0
        expect(uvs[4]).toBeCloseTo(2.0, 5);

        // Point 2 at x=200: UV.x should be 200/50 = 4.0
        expect(uvs[8]).toBeCloseTo(4.0, 5);
    });

    it('should fall back to _width when textureWidth is not provided', () =>
    {
        const points = [
            new Point(0, 0),
            new Point(100, 0),
        ];

        // No textureWidth provided - should fall back to width (backward compatible)
        const rope = new RopeGeometry({
            width: 50,
            points,
            textureScale: 1,
        });

        // _textureWidth should default to width
        expect(rope._textureWidth).toBe(50);

        const uvs = rope.getBuffer('aUV').data;

        // UV.x should be 100/50 = 2.0 (same as old behavior)
        expect(uvs[4]).toBeCloseTo(2.0, 5);
    });

    it('should stretch texture when textureScale is 0', () =>
    {
        const points = [
            new Point(0, 0),
            new Point(100, 0),
            new Point(200, 0),
        ];

        const rope = new RopeGeometry({
            width: 50,
            points,
            textureScale: 0,
            textureWidth: 200,
        });

        const uvs = rope.getBuffer('aUV').data;

        // When textureScale is 0, UV is stretched: i / (total - 1)
        expect(uvs[0]).toBe(0);
        expect(uvs[4]).toBeCloseTo(0.5, 5);
        expect(uvs[8]).toBeCloseTo(1.0, 5);
    });
});
