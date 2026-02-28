import { RopeGeometry } from '../RopeGeometry';

describe('RopeGeometry', () =>
{
    it('uses texture width for uv tiling when textureScale is enabled', () =>
    {
        const geometry = new RopeGeometry({
            points: [{ x: 0, y: 0 }, { x: 100, y: 0 }],
            width: 50,
            textureScale: 1,
            textureWidth: 100,
        } as any);

        const uvs = geometry.getBuffer('aUV').data;

        expect(uvs[4]).toBeCloseTo(1);
        expect(uvs[6]).toBeCloseTo(1);
    });

    it('keeps existing width behavior when texture width is not provided', () =>
    {
        const geometry = new RopeGeometry({
            points: [{ x: 0, y: 0 }, { x: 100, y: 0 }],
            width: 50,
            textureScale: 1,
        });

        const uvs = geometry.getBuffer('aUV').data;

        expect(uvs[4]).toBeCloseTo(2);
        expect(uvs[6]).toBeCloseTo(2);
    });
});
