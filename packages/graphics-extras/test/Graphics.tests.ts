import { Graphics } from '@pixi/graphics';
import { expect } from 'chai';
import '@pixi/graphics-extras';

describe('Graphics', function ()
{
    it('should have extras as mixins', function ()
    {
        const g = new Graphics();

        expect(g.drawChamferRect).to.be.ok;
        expect(g.drawFilletRect).to.be.ok;
        expect(g.drawRegularPolygon).to.be.ok;
        expect(g.drawRoundedPolygon).to.be.ok;
        expect(g.drawStar).to.be.ok;
        expect(g.drawTorus).to.be.ok;

        g.destroy();
    });

    it('should call all commands with defaults', function ()
    {
        const g = new Graphics();

        expect(g.drawChamferRect(0, 0, 100, 100, 5)).equals(g);
        expect(g.drawChamferRect(0, 0, 100, 100, 0)).equals(g);
        expect(g.drawFilletRect(0, 0, 100, 100, -5)).equals(g);
        expect(g.drawFilletRect(0, 0, 100, 100, 5)).equals(g);
        expect(g.drawFilletRect(0, 0, 100, 100, 0)).equals(g);
        expect(g.drawRegularPolygon(0, 0, 100, 5, 0)).equals(g);
        expect(g.drawRoundedPolygon(0, 0, 100, 5, 10, 0)).equals(g);
        expect(g.drawRoundedPolygon(0, 0, 100, 5, 10)).equals(g);
        expect(g.drawRoundedPolygon(0, 0, 100, 5, 0)).equals(g);
        expect(g.drawStar(0, 0, 5, 100, 50, 0)).equals(g);
        expect(g.drawTorus(0, 0, 50, 100)).equals(g);
        expect(g.drawTorus(0, 0, 50, 100, 0, Math.PI * 2)).equals(g);
        expect(g.drawTorus(0, 0, 50, 100, 0.2, Math.PI)).equals(g);

        g.destroy();
    });
});
