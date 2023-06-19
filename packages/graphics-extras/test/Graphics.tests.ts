import { Graphics } from '@pixi/graphics';
import '@pixi/graphics-extras';

describe('Graphics', () =>
{
    it('should have extras as mixins', () =>
    {
        const g = new Graphics();

        expect(g.drawChamferRect).toBeTruthy();
        expect(g.drawFilletRect).toBeTruthy();
        expect(g.drawRegularPolygon).toBeTruthy();
        expect(g.drawRoundedPolygon).toBeTruthy();
        expect(g.drawStar).toBeTruthy();
        expect(g.drawTorus).toBeTruthy();

        g.destroy();
    });

    it('should call all commands with defaults', () =>
    {
        const g = new Graphics();

        expect(g.drawChamferRect(0, 0, 100, 100, 5)).toEqual(g);
        expect(g.drawChamferRect(0, 0, 100, 100, 0)).toEqual(g);
        expect(g.drawFilletRect(0, 0, 100, 100, -5)).toEqual(g);
        expect(g.drawFilletRect(0, 0, 100, 100, 5)).toEqual(g);
        expect(g.drawFilletRect(0, 0, 100, 100, 0)).toEqual(g);
        expect(g.drawRegularPolygon(0, 0, 100, 5, 0)).toEqual(g);
        expect(g.drawRoundedPolygon(0, 0, 100, 5, 10, 0)).toEqual(g);
        expect(g.drawRoundedPolygon(0, 0, 100, 5, 10)).toEqual(g);
        expect(g.drawRoundedPolygon(0, 0, 100, 5, 0)).toEqual(g);
        expect(g.drawStar(0, 0, 5, 100, 50, 0)).toEqual(g);
        expect(g.drawTorus(0, 0, 50, 100)).toEqual(g);
        expect(g.drawTorus(0, 0, 50, 100, 0, Math.PI * 2)).toEqual(g);
        expect(g.drawTorus(0, 0, 50, 100, 0.2, Math.PI)).toEqual(g);

        g.destroy();
    });
});
