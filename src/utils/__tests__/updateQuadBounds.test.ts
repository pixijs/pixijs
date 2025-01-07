import { updateQuadBounds } from '../data/updateQuadBounds';
import { type ObservablePoint } from '~/maths';
import { type Texture } from '~/rendering';

describe('updateQuadBounds', () =>
{
    let bounds: { minX: number; maxX: number; minY: number; maxY: number };
    let anchor: ObservablePoint;
    let texture: Texture;

    beforeEach(() =>
    {
        // Reset bounds before each test
        bounds = { minX: 0, maxX: 0, minY: 0, maxY: 0 };
        anchor = { _x: 0, _y: 0 } as ObservablePoint;
        texture = {
            orig: { width: 100, height: 100 },
            trim: null,
        } as Texture;
    });

    it('should calculate bounds for untrimmed texture with default anchor (0,0)', () =>
    {
        updateQuadBounds(bounds, anchor, texture);

        expect(bounds.minX).toBe(-0);
        expect(bounds.maxX).toBe(100);
        expect(bounds.minY).toBe(-0);
        expect(bounds.maxY).toBe(100);
    });

    it('should calculate bounds for untrimmed texture with center anchor (0.5,0.5)', () =>
    {
        anchor._x = 0.5;
        anchor._y = 0.5;

        updateQuadBounds(bounds, anchor, texture);

        expect(bounds.minX).toBe(-50);
        expect(bounds.maxX).toBe(50);
        expect(bounds.minY).toBe(-50);
        expect(bounds.maxY).toBe(50);
    });

    it('should calculate bounds for trimmed texture', () =>
    {
        (texture.trim as any) = {
            x: 10,
            y: 15,
            width: 80,
            height: 70,
        };

        updateQuadBounds(bounds, anchor, texture);

        expect(bounds.minX).toBe(10);
        expect(bounds.maxX).toBe(90); // 10 + 80
        expect(bounds.minY).toBe(15);
        expect(bounds.maxY).toBe(85); // 15 + 70
    });

    it('should calculate bounds for trimmed texture with custom anchor (0.5,0.5)', () =>
    {
        (texture.trim as any) = {
            x: 10,
            y: 15,
            width: 80,
            height: 70,
        };
        anchor._x = 0.5;
        anchor._y = 0.5;

        updateQuadBounds(bounds, anchor, texture);

        expect(bounds.minX).toBe(-40); // 10 - (0.5 * 100)
        expect(bounds.maxX).toBe(40); // -40 + 80
        expect(bounds.minY).toBe(-35); // 15 - (0.5 * 100)
        expect(bounds.maxY).toBe(35); // -35 + 70
    });
});
